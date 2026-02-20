import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "formFields" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "4u0J2XF_1rBJ",
  fields: {
    fieldTitle: { type: "string", storageKey: "4CbdwXojpmZj" },
    fieldType: { type: "string", storageKey: "-NFiqlRLV3_u" },
    name: { type: "string", storageKey: "kFdeurlwzZE1" },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "FSuCHb0eROIw",
    },
  },
};
