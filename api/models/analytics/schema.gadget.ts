import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "analytics" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "gjdBUZj_8Gob",
  fields: {
    click: {
      type: "number",
      storageKey: "V5WLZNKE8oOR",
      filterIndex: false,
      searchIndex: false,
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "qebBYnw4BVQG",
      searchIndex: false,
    },
    view: {
      type: "number",
      storageKey: "8JHv-668CZIQ",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
};
