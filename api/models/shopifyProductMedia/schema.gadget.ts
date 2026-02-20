import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyProductMedia" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-ProductMedia",
  fields: {},
  shopify: {
    fields: {
      featuredMediaForProduct: { searchIndex: false },
      file: { searchIndex: false },
      position: { filterIndex: false, searchIndex: false },
      product: true,
      shop: { searchIndex: false },
    },
  },
};
