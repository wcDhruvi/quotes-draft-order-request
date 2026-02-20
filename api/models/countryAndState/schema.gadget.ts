import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "countryAndState" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v2",
  storageKey: "oP0ha-1EniP8",
  fields: {
    country: {
      type: "string",
      storageKey: "0F_naAMcFUDy",
      searchIndex: false,
    },
    countryCode: {
      type: "string",
      storageKey: "bLznjHtTfdLP",
      searchIndex: false,
    },
    phoneCode: {
      type: "string",
      storageKey: "Vym9WIwPTjS8",
      filterIndex: false,
      searchIndex: false,
    },
    states: {
      type: "json",
      storageKey: "G2zqjHFw_vOO",
      filterIndex: false,
      searchIndex: false,
    },
  },
  searchIndex: false,
};
