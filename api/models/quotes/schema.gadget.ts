import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "quotes" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DqOIbGTT8zvV",
  fields: {
    customAttributes: { type: "json", storageKey: "lEUfTr_8jI1f" },
    customLineItems: {
      type: "json",
      default: [],
      storageKey: "QIyhcyeENa0b",
    },
    customer: {
      type: "belongsTo",
      parent: { model: "shopifyCustomer" },
      storageKey: "rweyiKWY9IhK",
    },
    customer_detail: { type: "json", storageKey: "__LbMyQcgqQG" },
    draft_order_id: { type: "string", storageKey: "DWpCjdTURGZs" },
    name: { type: "string", storageKey: "-zdbyRYLXiAh" },
    order_detail: { type: "json", storageKey: "EAMUMmpUs3AE" },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "L90BQi1yLnME",
    },
    uqShopName: { type: "string", storageKey: "IH1lIbFNYvWR" },
  },
};
