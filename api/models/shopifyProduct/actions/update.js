import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: {
    shopify: {
      includeFields: [
        // Required root field
        "id",

        // Basic product fields
        "title",
        "handle",
        "tags",
        "status",
        "product_type",
        "vendor",

        // Images (Shopify uses images, NOT media)
        "images.id",
        "images.src",
        "images.alt",
        "images.position",

        // Options
        "options.id",
        "options.name",
        "options.position",
        "options.values",

        // Variants
        "variants.id",
        "variants.title",
        "variants.price",
        "variants.compare_at_price",
        "variants.sku",
        "variants.inventory_quantity",
        "variants.option1",
        "variants.option2",
        "variants.option3"
      ],
    },
  },
};
