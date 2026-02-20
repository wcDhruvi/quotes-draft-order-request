import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "quoteSetting" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "G-IX6Vrt-yae",
  fields: {
    collection_ids: {
      type: "json",
      default: [],
      storageKey: "6uKSPL9XPQqz",
    },
    customer_tags: {
      type: "json",
      default: [],
      storageKey: "5at4np8uD67f",
    },
    draft_order_tags: {
      type: "json",
      default: [],
      storageKey: "EOpbB78bwHRn",
    },
    is_add_to_cart_quotes: {
      type: "enum",
      default: "1",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["0", "1"],
      storageKey: "OhQki30CJZHc",
    },
    is_all_product: {
      type: "enum",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["0", "1"],
      storageKey: "CC5L4LRL93R0",
    },
    max: { type: "string", storageKey: "ZJlVMaVmhDKg" },
    min: { type: "string", storageKey: "3puS3_Golhpr" },
    product_ids: {
      type: "json",
      default: [],
      storageKey: "SgfYZwjqMNkh",
    },
    product_tags: {
      type: "json",
      default: [],
      storageKey: "eRDx86r3HTSA",
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "iVVSToxLL9Fc",
    },
    total_condition: { type: "string", storageKey: "XemavhwjyGXP" },
  },
};
