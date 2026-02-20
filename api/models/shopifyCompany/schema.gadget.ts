import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCompany" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Company",
  fields: {},
  searchIndex: false,
  shopify: {
    fields: {
      contactCount: { filterIndex: false, searchIndex: false },
      contactsCount: { filterIndex: false, searchIndex: false },
      customerSince: { filterIndex: false, searchIndex: false },
      externalId: { filterIndex: false, searchIndex: false },
      lifetimeDuration: { filterIndex: false, searchIndex: false },
      locationsCount: { filterIndex: false, searchIndex: false },
      name: { filterIndex: false, searchIndex: false },
      note: { filterIndex: false, searchIndex: false },
      ordersCount: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      totalSpent: { filterIndex: false, searchIndex: false },
    },
  },
};
