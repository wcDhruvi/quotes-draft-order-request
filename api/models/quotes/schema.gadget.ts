import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "quotes" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DqOIbGTT8zvV",
  fields: {
    customAttributes: {
      type: "json",
      storageKey: "lEUfTr_8jI1f",
      filterIndex: false,
      searchIndex: false,
    },
    customLineItems: {
      type: "json",
      default: [],
      storageKey: "QIyhcyeENa0b",
      filterIndex: false,
      searchIndex: false,
    },
    customer: {
      type: "belongsTo",
      parent: { model: "shopifyCustomer" },
      storageKey: "rweyiKWY9IhK",
      searchIndex: false,
    },
    customer_detail: {
      type: "json",
      storageKey: "__LbMyQcgqQG",
      filterIndex: false,
      searchIndex: false,
    },
    draft_order_id: {
      type: "string",
      storageKey: "DWpCjdTURGZs",
      searchIndex: false,
    },
    name: {
      type: "string",
      storageKey: "-zdbyRYLXiAh",
      filterIndex: false,
      searchIndex: false,
    },
    order_detail: {
      type: "json",
      storageKey: "EAMUMmpUs3AE",
      filterIndex: false,
      searchIndex: false,
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "L90BQi1yLnME",
      searchIndex: false,
    },
    uqShopName: {
      type: "string",
      storageKey: "IH1lIbFNYvWR",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
};
