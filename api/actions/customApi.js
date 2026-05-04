/** @type { import("gadget-server").ActionOptions } */
export const options = {
  permits: ["system-admin", "unauthenticated", "shopify-app-users", "shopify-storefront-customers"]
};

export const params = {
  payload: { type: "object", additionalProperties: true }
};

/** @type { ActionRun } */
export const run = async ({ params, logger, api }) => {
  try {
    const { shopId, cartProduct, ucCustomerId, type } = params.payload;

    let isDisplayQuoteButton = true;
    const shopData = await api.shopifyShop.findFirst({
      filter: {
        id: {
          equals: params.payload.shopId
        },
      },
      select: { activeRecurringSubscriptionId: true, AppPlanId: true }
    });
    logger.info("---------shopData----------" + JSON.stringify(shopData));
    if (shopData?.activeRecurringSubscriptionId && shopData.AppPlanId) {
      logger.info("---------shopData----------" + JSON.stringify(shopData));
      const cartTotalPrice = cartProduct.total_price / 100;
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

      if (settings?.is_quote_enable === "0") {
        logger.info("---------is_quote_enable----------" + isDisplayQuoteButton);
        isDisplayQuoteButton = false;
      }
      logger.info("---------is_all_product----------" + isDisplayQuoteButton);
      if (quoteSetting?.is_all_product === "0") {
        if (quoteSetting?.product_ids.length > 0) {
          const productFound = cartProduct.some(item => quoteSetting?.product_ids.includes(item.product_id.toString()));

          if (!productFound) {
            isDisplayQuoteButton = false;
          }
          logger.info("---------product_ids----------" + isDisplayQuoteButton);
        } else {
          logger.info("---------collection_ids----------" + isDisplayQuoteButton);
          const shopifyCollectionRecords = await api.shopifyCollect.findMany({
            where: { customCollection: { in: quoteSetting?.collection_ids } }, // Ensure 'products' is an array of IDs
          });
          const collectionProduct = [];
          shopifyCollectionRecords.map((x) => {
            collectionProduct.push(x.productId);
          });
          if (collectionProduct.length > 0) {
            const productFound = cartProduct.some(item => collectionProduct.includes(item.product_id.toString()));
            if (!productFound) {
              isDisplayQuoteButton = false;
            }
          } else {
            isDisplayQuoteButton = false;
          }
        }
      }
      if (quoteSetting?.customer_tags.length > 0 && isDisplayQuoteButton && ucCustomerId) {
        logger.info("---------customer_tags----------" + isDisplayQuoteButton);
        // const shopifyCustomer = await api.shopifyCustomer.findOne(ucCustomerId, {
        //     select: {tags: true}
        // });
        // console.log("======ucCustomerId========", ucCustomerId)
        // console.log("======shopifyCustomer========", shopifyCustomer)
        //ucCustomerId find customer Tag
        //not metch any customer Tag to isDisplayQuoteButton = true
      }
      logger.info("---------product_tags----------" + isDisplayQuoteButton);
      if (quoteSetting?.product_tags.length > 0 && isDisplayQuoteButton) {
        logger.info("---------product_tags----------" + isDisplayQuoteButton);
        const product = [];
        cartProduct.some(item => {
          product.push(item.product_id.toString());
        });
        const shopifyProductRecords = await api.shopifyProduct.findMany({
          select: { tags: true, id: true },
          filter: { id: { in: product } }, // Ensure 'products' is an array of IDs
        });

        const cartProductTags = [...new Set(shopifyProductRecords.flatMap(item => item.tags))];
        const productTagFound = cartProductTags.some(item => quoteSetting?.product_tags.includes(item));
        if (!productTagFound) {
          isDisplayQuoteButton = false;
        }
      }
      if (type === "cart") {
        logger.info("---------productFound----------" + isDisplayQuoteButton);
        if (quoteSetting?.total_condition && isDisplayQuoteButton) {

          if (quoteSetting?.total_condition == 1) { // greater than
            if (cartTotalPrice <= parseFloat(quoteSetting?.min)) {
              isDisplayQuoteButton = false;
            }
          } else if (quoteSetting?.total_condition == 2) { // less than
            if (cartTotalPrice >= parseFloat(quoteSetting?.min)) {
              isDisplayQuoteButton = false;
            }
          } else { // between
            if (cartTotalPrice >= parseFloat(quoteSetting?.min) && cartTotalPrice <= parseFloat(quoteSetting?.max)) {

            } else {
              isDisplayQuoteButton = false;
            }
          }
        }
      }
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

      let result = { settings: settings, quoteSetting: quoteSetting, isDisplayQuoteButton, formFields };
      logger.info("---------result----------" + JSON.stringify(result));
      // Process based on action parameter

      return {
        success: isDisplayQuoteButton,
        data: isDisplayQuoteButton ? result : { settings: {}, quoteSetting: {}, isDisplayQuoteButton, formFields: [] },
        errors: []
      };
    } else {
      logger.info("---------else----------" + JSON.stringify(result));
      return {
        success: false,
        data: { settings: {}, quoteSetting: {}, isDisplayQuoteButton: false, formFields: [], message: "App Plan not activated" },
        errors: []
      };
    }


  } catch (error) {
    logger.error(`Error in customApi action: ${error.message}`);
    return {
      success: false,
      data: null,
      errors: [error.message]
    };
  }
};