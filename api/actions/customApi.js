/** @type { import("gadget-server").ActionOptions } */
export const options = {
  permits: ["system-admin", "unauthenticated", "shopify-app-users", "shopify-storefront-customers"]
};

export const params = {
  payload: { type: "object", additionalProperties: true }
};

/**
 * @param {unknown} cartProduct
 * @returns {Array<{ product_id?: unknown }>}
 */
const normalizeLineItems = (cartProduct) => {
  if (cartProduct == null) return [];
  if (Array.isArray(cartProduct)) return cartProduct;
  return [cartProduct];
};

/**
 * @param {Record<string, unknown>} payload
 * @param {Array<{ product_id?: unknown }>} lineItems
 */
const resolveCartTotalPrice = (payload, lineItems) => {
  const fromPayload = payload.cartTotalPrice;
  if (typeof fromPayload === "number" && !Number.isNaN(fromPayload)) {
    return fromPayload;
  }
  const raw = payload.cartProduct;
  if (raw && typeof raw === "object" && !Array.isArray(raw) && raw.total_price != null) {
    return Number(raw.total_price) / 100;
  }
  return lineItems.reduce((sum, item) => {
    const cents =
      item.final_line_price ??
      item.line_price ??
      (item.final_price != null ? Math.round(Number(item.final_price) * 100) : 0);
    return sum + (typeof cents === "number" ? cents / 100 : 0);
  }, 0);
};

/**
 * @param {string} productIdStr
 * @param {{
 *   quoteSetting: Record<string, unknown> | null | undefined;
 *   collectionProductIds: string[];
 *   productTagsById: Map<string, string[]>;
 *   ucCustomerId: unknown;
 * }} ctx
 */
const evaluateQuoteVisibilityForProduct = (productIdStr, ctx) => {
  const { quoteSetting, collectionProductIds, productTagsById, ucCustomerId } = ctx;
  let show = true;

  if (quoteSetting?.is_all_product === "0") {
    const allowedProductIds = quoteSetting?.product_ids;
    if (Array.isArray(allowedProductIds) && allowedProductIds.length > 0) {
      if (!allowedProductIds.map(String).includes(productIdStr)) {
        show = false;
      }
    } else {
      if (collectionProductIds.length === 0) {
        show = false;
      } else if (!collectionProductIds.includes(productIdStr)) {
        show = false;
      }
    }
  }

  if (show && Array.isArray(quoteSetting?.customer_tags) && quoteSetting.customer_tags.length > 0 && ucCustomerId) {
    // Reserved: match Shopify customer tags to quoteSetting.customer_tags
  }

  if (show && Array.isArray(quoteSetting?.product_tags) && quoteSetting.product_tags.length > 0) {
    const tags = productTagsById.get(productIdStr) || [];
    const productTagFound = tags.some((tag) => quoteSetting.product_tags.includes(tag));
    if (!productTagFound) {
      show = false;
    }
  }

  return show;
};

/**
 * @param {number | string} totalCondition
 * @param {number} cartTotalPrice
 * @param {Record<string, unknown> | null | undefined} quoteSetting
 */
const cartTotalMeetsQuoteCondition = (totalCondition, cartTotalPrice, quoteSetting) => {
  const min = parseFloat(String(quoteSetting?.min ?? ""));
  const max = parseFloat(String(quoteSetting?.max ?? ""));
  if (totalCondition === 1) {
    return cartTotalPrice > min;
  }
  if (totalCondition === 2) {
    return cartTotalPrice < min;
  }
  return cartTotalPrice >= min && cartTotalPrice <= max;
};

/** @type { ActionRun } */
export const run = async ({ params, logger, api }) => {
  try {
    const { cartProduct, ucCustomerId, type } = params.payload;
    const lineItems = normalizeLineItems(cartProduct);
    const uniqueProductIds = [
      ...new Set(lineItems.map((item) => item?.product_id?.toString()).filter(Boolean))
    ];

    const shopData = await api.shopifyShop.findFirst({
      filter: {
        id: {
          equals: params.payload.shopId
        },
      },
      select: { activeRecurringSubscriptionId: true, AppPlanId: true }
    });
    logger.info("---------shopData----------" + JSON.stringify(shopData));

    const emptyFailure = {
      success: false,
      data: {
        settings: {},
        quoteSetting: {},
        isDisplayQuoteButton: false,
        isDisplayQuoteButtonByProduct: {},
        formFields: [],
        message: "App Plan not activated"
      },
      errors: []
    };

    if (!(shopData?.activeRecurringSubscriptionId && shopData.AppPlanId)) {
      logger.info("---------else----------no active plan");
      return emptyFailure;
    }

    const cartTotalPrice = resolveCartTotalPrice(params.payload, lineItems);
    const settings = await api.setting.findFirst({
      filter: {
        shopId: {
          equals: params.payload.shopId
        },
      },
    });
    logger.info("---------settings----------" + JSON.stringify(settings));
    const quoteSetting = await api.quoteSetting.findFirst({
      filter: {
        shopId: {
          equals: params.payload.shopId
        },
      },
    });
    logger.info("---------quoteSetting----------" + JSON.stringify(quoteSetting));

    /** @type {Record<string, boolean>} */
    const isDisplayQuoteButtonByProduct = {};
    for (const id of uniqueProductIds) {
      isDisplayQuoteButtonByProduct[id] = true;
    }

    const globalQuoteDisabled = settings?.is_quote_enable === "0";
    if (globalQuoteDisabled) {
      for (const id of uniqueProductIds) {
        isDisplayQuoteButtonByProduct[id] = false;
      }
    }

    let collectionProductIds = [];
    if (
      !globalQuoteDisabled &&
      quoteSetting?.is_all_product === "0" &&
      !(Array.isArray(quoteSetting?.product_ids) && quoteSetting.product_ids.length > 0)
    ) {
      logger.info("---------collection_ids----------");
      const shopifyCollectionRecords = await api.shopifyCollect.findMany({
        where: { customCollection: { in: quoteSetting?.collection_ids } },
      });
      collectionProductIds = shopifyCollectionRecords.map((x) => String(x.productId));
    }

    /** @type {Map<string, string[]>} */
    const productTagsById = new Map();
    if (
      !globalQuoteDisabled &&
      Array.isArray(quoteSetting?.product_tags) &&
      quoteSetting.product_tags.length > 0 &&
      uniqueProductIds.length > 0
    ) {
      const shopifyProductRecords = await api.shopifyProduct.findMany({
        select: { tags: true, id: true },
        filter: { id: { in: uniqueProductIds } },
      });
      for (const rec of shopifyProductRecords) {
        productTagsById.set(String(rec.id), rec.tags || []);
      }
    }

    const evalCtx = {
      quoteSetting,
      collectionProductIds,
      productTagsById,
      ucCustomerId
    };

    if (!globalQuoteDisabled && uniqueProductIds.length > 0) {
      for (const productIdStr of uniqueProductIds) {
        isDisplayQuoteButtonByProduct[productIdStr] = evaluateQuoteVisibilityForProduct(
          productIdStr,
          evalCtx
        );
      }
    }

    let cartConditionOk = true;
    if (type === "cart" && quoteSetting?.total_condition && !globalQuoteDisabled) {
      const tc = Number(quoteSetting.total_condition);
      cartConditionOk = cartTotalMeetsQuoteCondition(tc, cartTotalPrice, quoteSetting);
      if (!cartConditionOk) {
        for (const id of uniqueProductIds) {
          isDisplayQuoteButtonByProduct[id] = false;
        }
      }
    }

    const isDisplayQuoteButton =
      uniqueProductIds.length === 0
        ? false
        : uniqueProductIds.some((id) => isDisplayQuoteButtonByProduct[id]);

    let formFields = [];

    if (isDisplayQuoteButton) {
      formFields = await api.formFields.findMany({
        filter: {
          shopId: {
            equals: params.payload.shopId
          },
        },
      });
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      try {
        const analyticsRecord = await api.analytics.findFirst({
          filter: {
            shopId: { equals: params.payload.shopId },
            createdAt: { greaterThanOrEqual: startOfDay }
          },
          select: { id: true, view: true, click: true }
        });
        await api.analytics.update(analyticsRecord.id, {
          view: (analyticsRecord.view || 0) + 1
        });
      } catch (e) {
        await api.analytics.create({
          shop: { _link: params.payload.shopId },
          view: 1,
          click: 0
        });
      }
    }

    const result = {
      settings,
      quoteSetting,
      isDisplayQuoteButton,
      isDisplayQuoteButtonByProduct,
      formFields
    };
    logger.info("---------result----------" + JSON.stringify(result));

    return {
      success: isDisplayQuoteButton,
      data: isDisplayQuoteButton
        ? result
        : {
            settings: {},
            quoteSetting: {},
            isDisplayQuoteButton,
            isDisplayQuoteButtonByProduct,
            formFields: []
          },
      errors: []
    };
  } catch (error) {
    logger.error(`Error in customApi action: ${error.message}`);
    return {
      success: false,
      data: null,
      errors: [error.message]
    };
  }
};
