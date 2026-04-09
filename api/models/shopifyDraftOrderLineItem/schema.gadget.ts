import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyDraftOrderLineItem" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-DraftOrderLineItem",
  fields: {},
  searchIndex: false,
  shopify: {
    fields: {
      appliedDiscount: { filterIndex: false, searchIndex: false },
      approximateDiscountedUnitPriceSet: {
        filterIndex: false,
        searchIndex: false,
      },
      bundleComponents: { filterIndex: false, searchIndex: false },
      custom: { filterIndex: false, searchIndex: false },
      customAttributes: { filterIndex: false, searchIndex: false },
      customAttributesV2: { filterIndex: false, searchIndex: false },
      discountedTotalSet: { filterIndex: false, searchIndex: false },
      draftOrder: { searchIndex: false },
      giftCard: { filterIndex: false, searchIndex: false },
      name: { filterIndex: false, searchIndex: false },
      originalTotalSet: { filterIndex: false, searchIndex: false },
      originalUnitPriceSet: {
        filterIndex: false,
        searchIndex: false,
      },
      originalUnitPriceWithCurrency: {
        filterIndex: false,
        searchIndex: false,
      },
      price: { filterIndex: false, searchIndex: false },
      product: { searchIndex: false },
      properties: { filterIndex: false, searchIndex: false },
      quantity: { filterIndex: false, searchIndex: false },
      requiresShipping: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      sku: { filterIndex: false, searchIndex: false },
      taxLines: { filterIndex: false, searchIndex: false },
      taxable: { filterIndex: false, searchIndex: false },
      title: { filterIndex: false, searchIndex: false },
      totalDiscountSet: { filterIndex: false, searchIndex: false },
      uuid: { filterIndex: false, searchIndex: false },
      variant: { searchIndex: false },
      variantTitle: { filterIndex: false, searchIndex: false },
      vendor: { filterIndex: false, searchIndex: false },
      weight: { filterIndex: false, searchIndex: false },
    },
  },
};
