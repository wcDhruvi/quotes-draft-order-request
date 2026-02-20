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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    logger.info("====params======" + params.payload.shopId);
    try {
      const analyticsRecord = await api.analytics.findFirst({
        filter: {
          shopId: { equals: params.payload.shopId },
          createdAt: { greaterThanOrEqual: startOfDay }
        },
        select: { id: true, view: true, click: true }
      });
      await api.analytics.update(analyticsRecord.id, {
        click: (analyticsRecord.click || 0) + 1
      });
    } catch (e) {
      await api.analytics.create({
        shop: { _link: params.payload.shopId },
        view: 1,
        click: 1
      });
    }
    return {
      success: true,
      data: "",
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