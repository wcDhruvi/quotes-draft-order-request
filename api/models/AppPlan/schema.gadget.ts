import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "AppPlan" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "i2r-KXlf3JlJ",
  fields: {
    currency: {
      type: "string",
      default: "USD",
      storageKey: "7cUNJlRJXWea",
      filterIndex: false,
      searchIndex: false,
    },
    description: {
      type: "string",
      storageKey: "9VJrl87lLsE-",
      filterIndex: false,
      searchIndex: false,
    },
    monthlyPrice: {
      type: "number",
      storageKey: "x3AoDjLiFi0v",
      filterIndex: false,
      searchIndex: false,
    },
    name: {
      type: "string",
      storageKey: "wc5M23S6QRkq",
      filterIndex: false,
      searchIndex: false,
    },
    shops: {
      type: "hasMany",
      children: { model: "shopifyShop", belongsToField: "AppPlan" },
      storageKey: "IbiMvuKyRqZx",
    },
    trialDays: {
      type: "number",
      default: 0,
      storageKey: "fRsbS2nPTemD",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
};
