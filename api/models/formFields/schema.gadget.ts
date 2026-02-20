import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "formFields" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "4u0J2XF_1rBJ",
  fields: {
    fieldTitle: {
      type: "string",
      storageKey: "4CbdwXojpmZj",
      filterIndex: false,
      searchIndex: false,
    },
    fieldType: {
      type: "string",
      storageKey: "-NFiqlRLV3_u",
      filterIndex: false,
      searchIndex: false,
    },
    name: {
      type: "string",
      storageKey: "kFdeurlwzZE1",
      filterIndex: false,
      searchIndex: false,
    },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "FSuCHb0eROIw",
      searchIndex: false,
    },
  },
  searchIndex: false,
};
