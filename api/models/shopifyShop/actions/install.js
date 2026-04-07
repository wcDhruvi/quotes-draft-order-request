import { applyParams, save, ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, api, connections }) => {
  applyParams(params, record);
  await save(record);
};

/** @type { ActionOnSuccess } */
/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  // Your logic goes here
  await api.setting.run({
    shop: {
      _link: record.id,
    },
  });
  await api.quoteSetting.create({
    shop: {
      _link: record.id,
    },
    customer_email_enabled: "1",
    merchant_email_enabled: "1",
    customer_subject: "Confirmation: We've received your quote request [ORDER_NAME]",
    customer_heading: "Quote Request Received",
    customer_greeting: "Hello [CUSTOMER_NAME],",
    customer_instruction: "We've received your quote request [ORDER_NAME].",
    customer_no_items: "No items found.",
    customer_footer_text: "We'll review your request and get back to you shortly.",
    merchant_subject: "Action Required: New Quote Request [ORDER_NAME]",
    merchant_heading: "New Quote Request: [ORDER_NAME]",
    merchant_customer_label: "Customer:",
    merchant_email_label: "Email:",
    merchant_note_label: "Customer Note:",
    merchant_button_text: "View Draft Order",
    merchant_button_color: "#008060",
  });

  await api.shopifySync.run({
    shopifySync: {
      domain: record.domain,
      shop: {
        _link: record.id,
      },
    },
  });
};

/** @type { ActionOptions } */
export const options = { actionType: "create" };
