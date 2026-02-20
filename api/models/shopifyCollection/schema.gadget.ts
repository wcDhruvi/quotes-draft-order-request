import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCollection" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Collection",
  fields: {
    disjunctive: {
      type: "boolean",
      storageKey:
        "ModelField-DataModel-Shopify-Collection-disjunctive::FieldStorageEpoch-DataModel-Shopify-Collection-disjunctive-initial",
      filterIndex: false,
      searchIndex: false,
    },
    sortOrderBackup: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Collection-sort_order::FieldStorageEpoch-DataModel-Shopify-Collection-sort_order-initial",
      filterIndex: false,
      searchIndex: false,
    },
  },
  shopify: {
    fields: {
      appliedDisjunctively: {
        filterIndex: false,
        searchIndex: false,
      },
      body: { filterIndex: false, searchIndex: false },
      collectionType: { filterIndex: false, searchIndex: false },
      description: { filterIndex: false },
      feedback: { filterIndex: false, searchIndex: false },
      handle: { filterIndex: false, searchIndex: false },
      image: { filterIndex: false, searchIndex: false },
      legacyResourceId: { filterIndex: false, searchIndex: false },
      products: true,
      productsCount: { filterIndex: false, searchIndex: false },
      publishedAt: { filterIndex: false, searchIndex: false },
      publishedScope: { filterIndex: false, searchIndex: false },
      rules: { filterIndex: false, searchIndex: false },
      seo: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      sortOrder: { filterIndex: false, searchIndex: false },
      templateSuffix: { filterIndex: false, searchIndex: false },
      title: { filterIndex: false, searchIndex: false },
    },
  },
};
