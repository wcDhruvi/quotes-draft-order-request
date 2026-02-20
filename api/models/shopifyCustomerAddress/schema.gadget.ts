import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyCustomerAddress" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "DataModel-Shopify-CustomerAddress",
  fields: {
    countryCodeBackup: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-CustomerAddress-country_code::FieldStorageEpoch-DataModel-Shopify-CustomerAddress-country_code-initial",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
  shopify: {
    fields: {
      address1: { filterIndex: false, searchIndex: false },
      address2: { filterIndex: false, searchIndex: false },
      city: { filterIndex: false, searchIndex: false },
      company: { filterIndex: false, searchIndex: false },
      coordinatesValidated: {
        filterIndex: false,
        searchIndex: false,
      },
      country: { filterIndex: false, searchIndex: false },
      countryCode: { filterIndex: false, searchIndex: false },
      countryName: { filterIndex: false, searchIndex: false },
      firstName: { filterIndex: false, searchIndex: false },
      formatted: { filterIndex: false, searchIndex: false },
      formattedArea: { filterIndex: false, searchIndex: false },
      lastName: { filterIndex: false, searchIndex: false },
      latitude: { filterIndex: false, searchIndex: false },
      longitude: { filterIndex: false, searchIndex: false },
      name: { filterIndex: false, searchIndex: false },
      phone: { filterIndex: false, searchIndex: false },
      province: { filterIndex: false, searchIndex: false },
      provinceCode: { filterIndex: false, searchIndex: false },
      shop: { searchIndex: false },
      shopifyCustomer: { searchIndex: false },
      timezone: { filterIndex: false, searchIndex: false },
      validationResultSummary: {
        filterIndex: false,
        searchIndex: false,
      },
      zipCode: { filterIndex: false, searchIndex: false },
    },
  },
};
