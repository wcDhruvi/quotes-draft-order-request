import { applyParams, save, ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  if (!record.recipient_email && record.shop) {
    const shop = await api.shopifyShop.findOne(record.shop._link, {
      select: { email: true }
    });
    record.recipient_email = shop.email;
  }
  await save(record);
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
};
