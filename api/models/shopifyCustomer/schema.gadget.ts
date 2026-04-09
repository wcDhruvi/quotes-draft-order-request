import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCustomer" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-Customer",
  fields: {
    metafield: {
      type: "json",
      storageKey:
        "ModelField-DataModel-Shopify-Customer-metafield::FieldStorageEpoch-DataModel-Shopify-Customer-metafield-initial",
      filterIndex: false,
      searchIndex: false,
    },
    ordersCount: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-Customer-orders_count::FieldStorageEpoch-DataModel-Shopify-Customer-orders_count-initial",
      filterIndex: false,
      searchIndex: false,
    },
    quotes: {
      type: "hasOne",
      child: { model: "quotes", belongsToField: "customer" },
      storageKey: "aYmHcQEvmSu9",
    },
    taxExemptionsBackup: {
      type: "json",
      storageKey:
        "ModelField-DataModel-Shopify-Customer-tax_exemptions::FieldStorageEpoch-DataModel-Shopify-Customer-tax_exemptions-initial",
      filterIndex: false,
      searchIndex: false,
    },
    totalSpent: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Customer-total_spent::FieldStorageEpoch-DataModel-Shopify-Customer-total_spent-initial",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
  shopify: {
    fields: {
      acceptsMarketing: { filterIndex: false, searchIndex: false },
      acceptsMarketingUpdatedAt: {
        filterIndex: false,
        searchIndex: false,
      },
      addresses: true,
      amountSpent: { filterIndex: false, searchIndex: false },
      canDelete: { filterIndex: false, searchIndex: false },
      currency: { filterIndex: false, searchIndex: false },
      dataSaleOptOut: { filterIndex: false, searchIndex: false },
      defaultAddress: { searchIndex: false },
      displayName: { filterIndex: false, searchIndex: false },
      draftOrders: true,
      email: { filterIndex: false, searchIndex: false },
      emailMarketingConsent: {
        filterIndex: false,
        searchIndex: false,
      },
      firstName: { filterIndex: false, searchIndex: false },
      hasTimelineComment: { filterIndex: false, searchIndex: false },
      lastName: { filterIndex: false, searchIndex: false },
      lastOrderName: { filterIndex: false, searchIndex: false },
      legacyResourceId: { filterIndex: false, searchIndex: false },
      lifetimeDuration: { filterIndex: false, searchIndex: false },
      locale: { filterIndex: false, searchIndex: false },
      marketingOptInLevel: { filterIndex: false, searchIndex: false },
      mergeable: true,
      multipassIdentifier: { filterIndex: false, searchIndex: false },
      note: { filterIndex: false, searchIndex: false },
      numberOfOrders: { filterIndex: false, searchIndex: false },
      phone: { filterIndex: false, searchIndex: false },
      productSubscriberStatus: {
        filterIndex: false,
        searchIndex: false,
      },
      shop: { searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyState: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      smsMarketingConsent: { filterIndex: false, searchIndex: false },
      statistics: { filterIndex: false, searchIndex: false },
      tags: { filterIndex: false, searchIndex: false },
      taxExempt: { filterIndex: false, searchIndex: false },
      taxExemptions: { filterIndex: false, searchIndex: false },
      unsubscribeUrl: { filterIndex: false, searchIndex: false },
      validEmailAddress: { filterIndex: false, searchIndex: false },
      verifiedEmail: { filterIndex: false, searchIndex: false },
    },
  },
};
