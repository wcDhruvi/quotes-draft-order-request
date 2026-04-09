import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyDraftOrder" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-DraftOrder",
  fields: {
    quotes: {
      type: "hasOne",
      child: { model: "quotes", belongsToField: "draftOrder" },
      storageKey: "36alPx85h-04",
    },
  },
  searchIndex: false,
  shopify: {
    fields: {
      acceptAutomaticDiscounts: {
        filterIndex: false,
        searchIndex: false,
      },
      allowDiscountCodesInCheckout: {
        filterIndex: false,
        searchIndex: false,
      },
      appliedDiscount: { filterIndex: false, searchIndex: false },
      billingAddress: { filterIndex: false, searchIndex: false },
      billingAddressMatchesShippingAddress: {
        filterIndex: false,
        searchIndex: false,
      },
      completedAt: { filterIndex: false, searchIndex: false },
      currency: { filterIndex: false, searchIndex: false },
      customer: { searchIndex: false },
      defaultCursor: { filterIndex: false, searchIndex: false },
      discountCodes: { filterIndex: false, searchIndex: false },
      email: { filterIndex: false, searchIndex: false },
      hasTimelineComment: { filterIndex: false, searchIndex: false },
      invoiceEmailTemplateSubject: {
        filterIndex: false,
        searchIndex: false,
      },
      invoiceSentAt: { filterIndex: false, searchIndex: false },
      invoiceUrl: { filterIndex: false, searchIndex: false },
      legacyResourceId: { filterIndex: false, searchIndex: false },
      lineItems: true,
      lineItemsSubtotalPrice: {
        filterIndex: false,
        searchIndex: false,
      },
      marketName: { filterIndex: false, searchIndex: false },
      marketRegionCountryCode: {
        filterIndex: false,
        searchIndex: false,
      },
      name: { filterIndex: false, searchIndex: false },
      note: { filterIndex: false, searchIndex: false },
      noteAttributes: { filterIndex: false, searchIndex: false },
      phone: { filterIndex: false, searchIndex: false },
      poNumber: { filterIndex: false, searchIndex: false },
      presentmentCurrencyCode: {
        filterIndex: false,
        searchIndex: false,
      },
      purchasingCompany: { searchIndex: false },
      purchasingEntity: { filterIndex: false, searchIndex: false },
      ready: { filterIndex: false, searchIndex: false },
      reserveInventoryUntil: {
        filterIndex: false,
        searchIndex: false,
      },
      shippingAddress: { filterIndex: false, searchIndex: false },
      shippingLine: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCreatedAt: { filterIndex: false, searchIndex: false },
      shopifyUpdatedAt: { filterIndex: false, searchIndex: false },
      status: { filterIndex: false, searchIndex: false },
      subtotalPrice: { filterIndex: false, searchIndex: false },
      subtotalPriceSet: { filterIndex: false, searchIndex: false },
      tags: { filterIndex: false, searchIndex: false },
      taxExempt: { filterIndex: false, searchIndex: false },
      taxExemptions: { filterIndex: false, searchIndex: false },
      taxLines: { filterIndex: false, searchIndex: false },
      taxesIncluded: { filterIndex: false, searchIndex: false },
      totalDiscountsSet: { filterIndex: false, searchIndex: false },
      totalLineItemsPriceSet: {
        filterIndex: false,
        searchIndex: false,
      },
      totalPrice: { filterIndex: false, searchIndex: false },
      totalPriceSet: { filterIndex: false, searchIndex: false },
      totalQuantityOfLineItems: {
        filterIndex: false,
        searchIndex: false,
      },
      totalShippingPriceSet: {
        filterIndex: false,
        searchIndex: false,
      },
      totalTax: { filterIndex: false, searchIndex: false },
      totalTaxSet: { filterIndex: false, searchIndex: false },
      totalWeight: { filterIndex: false, searchIndex: false },
      transformerFingerprint: {
        filterIndex: false,
        searchIndex: false,
      },
      visibleToCustomer: { filterIndex: false, searchIndex: false },
      warnings: { filterIndex: false, searchIndex: false },
    },
  },
};
