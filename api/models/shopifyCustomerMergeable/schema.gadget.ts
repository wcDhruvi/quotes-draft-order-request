import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCustomerMergeable" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-CustomerMergeable",
  fields: {},
  searchIndex: false,
  shopify: {
    fields: {
      errorFields: { filterIndex: false, searchIndex: false },
      isMergeable: { filterIndex: false, searchIndex: false },
      mergeInProgress: { filterIndex: false, searchIndex: false },
      reason: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCustomer: { searchIndex: false },
    },
  },
};
