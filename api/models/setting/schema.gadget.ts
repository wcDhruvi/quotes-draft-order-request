import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "setting" model, go to https://quotes-draft-order-request.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "ell5Ds4nUJGp",
  fields: {
    add_custom_item_btn_bg_color: {
      type: "string",
      default: "#000000",
      storageKey: "Q_xEMdUKvD9D",
    },
    add_custom_item_btn_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "dILW9LOpKXG2",
    },
    add_custom_item_btn_text: {
      type: "string",
      default: "Add Item",
      storageKey: "adYFCoAqdeKn",
    },
    add_custom_item_checkbox_label: {
      type: "string",
      default: "Add Custom Line Item?",
      storageKey: "TeGC7SJdaD6V",
    },
    add_custom_item_title: {
      type: "string",
      default: "Custom Line Items",
      storageKey: "h0JSvhyOxkxn",
    },
    add_custom_item_title_align: {
      type: "enum",
      default: "1",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["1", "2", "3"],
      storageKey: "xU9jF8ZCBdw5",
    },
    add_custom_item_title_color: {
      type: "string",
      default: "#000000",
      storageKey: "nijlbt_uAFLZ",
    },
    add_to_cart_btn_bg_color: {
      type: "string",
      default: "#000000",
      storageKey: "LXf_tYH_wGuw",
    },
    add_to_cart_btn_bg_hover_color: {
      type: "string",
      default: "#000000",
      storageKey: "3Xmqkn9dgobu",
    },
    add_to_cart_btn_border_color: {
      type: "string",
      default: "#000000",
      storageKey: "uasQldPhpr6t",
    },
    add_to_cart_btn_border_hover_color: {
      type: "string",
      default: "#000000",
      storageKey: "HDJQ3RLqsoEO",
    },
    add_to_cart_btn_font: {
      type: "string",
      storageKey: "vsr_l52w-Nf9",
    },
    add_to_cart_btn_text: {
      type: "string",
      default: "Add to quote",
      storageKey: "KHEl0w9yiaSa",
    },
    add_to_cart_btn_text_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "mIl4e65q_exK",
    },
    add_to_cart_btn_text_hover_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "SvkGlSmI8M6r",
    },
    is_add_custom_item: {
      type: "boolean",
      default: true,
      storageKey: "KGGompozU2Lt",
    },
    is_effect_quote_button: {
      type: "enum",
      default: "1",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["0", "1"],
      storageKey: "FqIAgeFiQVlF",
    },
    is_quote_enable: {
      type: "string",
      default: "1",
      storageKey: "wdUSqMbkZFnt",
    },
    is_redirect: {
      type: "enum",
      default: "0",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["0", "1"],
      storageKey: "9Zn-T49BZZCm",
    },
    quote_button_background_color: {
      type: "string",
      default: "#000000",
      storageKey: "EoXuhTc4WP-w",
    },
    quote_button_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "FORNJcRtD3PD",
    },
    quote_button_font_style: {
      type: "string",
      storageKey: "Kav90z0dM9hX",
    },
    quote_button_hover_background_color: {
      type: "string",
      default: "#000000",
      storageKey: "_gxLOT-71HRR",
    },
    quote_button_hover_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "Wa72THvQ-1dn",
    },
    quote_button_text: {
      type: "string",
      default: "Get Quote",
      storageKey: "cn_1u3vWHG0N",
    },
    quote_cancel_button_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "-xiOYVJ00htw",
    },
    quote_cancel_button_text: {
      type: "string",
      default: "Cancel",
      storageKey: "U8_LjC2NgkrU",
    },
    quote_close_button_color: {
      type: "string",
      default: "#000000",
      storageKey: "MIiFdErMEmYj",
    },
    quote_popup_heading: {
      type: "string",
      default: "Please fill up this detail for Request Quote",
      storageKey: "0lsMPuR8TT-k",
    },
    quote_popup_heading_align: {
      type: "enum",
      default: "1",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["1", "2", "3"],
      storageKey: "CZunTtCgdtVE",
    },
    quote_popup_heading_color: {
      type: "string",
      default: "#000000",
      storageKey: "clrAYnDseYzf",
    },
    quote_popup_title: {
      type: "string",
      default: "Request Quote",
      storageKey: "X1Y637_DKlta",
    },
    quote_popup_title_align: {
      type: "enum",
      default: "1",
      acceptMultipleSelections: false,
      acceptUnlistedOptions: false,
      options: ["1", "2", "3"],
      storageKey: "dKzpWKGlY480",
    },
    quote_popup_title_color: {
      type: "string",
      default: "#000000",
      storageKey: "BOBNWgOpPU5L",
    },
    quote_submit_button_background_color: {
      type: "string",
      default: "#008060",
      storageKey: "kiXeuZLhUJXM",
    },
    quote_submit_button_color: {
      type: "string",
      default: "#FFFFFF",
      storageKey: "Q6S1eCyvwdXK",
    },
    quote_submit_button_text: {
      type: "string",
      default: "Get Quote",
      storageKey: "QmaiL7ZPH5rb",
    },
    redirect_page: { type: "string", storageKey: "CeR0D8eyXwO_" },
    shop: {
      type: "belongsTo",
      parent: { model: "shopifyShop" },
      storageKey: "60fBm2-dTYq5",
    },
  },
};
