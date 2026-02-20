import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCollect" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Collect",
  fields: {
    position: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-Collect-position::FieldStorageEpoch-DataModel-Shopify-Collect-position-initial",
      filterIndex: false,
      searchIndex: false,
    },
    shopifyCreatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey:
        "ModelField-DataModel-Shopify-Collect-created_at::FieldStorageEpoch-DataModel-Shopify-Collect-created_at-initial",
      filterIndex: false,
      searchIndex: false,
    },
    shopifyUpdatedAt: {
      type: "dateTime",
      includeTime: true,
      storageKey:
        "ModelField-DataModel-Shopify-Collect-updated_at::FieldStorageEpoch-DataModel-Shopify-Collect-updated_at-initial",
      filterIndex: false,
      searchIndex: false,
    },
    sortValue: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Collect-sort_value::FieldStorageEpoch-DataModel-Shopify-Collect-sort_value-initial",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
  shopify: {
    fields: {
      customCollection: { searchIndex: false },
      product: { searchIndex: false },
      shop: { searchIndex: false },
    },
  },
};
