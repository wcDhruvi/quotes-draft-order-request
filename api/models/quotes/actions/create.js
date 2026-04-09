import { applyParams, save, ActionOptions, preventCrossShopDataAccess } from "gadget-server";

export const run = async ({ params, record, logger, api, connections }) => {
  logger.info("------params--------" + JSON.stringify(params));
  logger.info("------record--------" + JSON.stringify(record));
  record.customer_detail = params.quotes.customer_detail;
  record.order_detail = params.quotes.order_detail;
  record.customAttributes = params.quotes.customAttributes;
  record.uqShopName = params.quotes.uqShopName;
  record.shop = params.quotes.shop;
  // record.customLineItems = params.quotes.customLineItems;

  // const customLineItems = params.quotes.customLineItems;
  await preventCrossShopDataAccess(params, record);

  const shopifyClient = await connections.shopify.forShopDomain(params.quotes.uqShopName);
  if (!shopifyClient) {
    throw new Error("Could not connect to Shopify");
  }

  // Prepare line items
  const lineItems = params.quotes.order_detail.items.map((x) => ({
    "variantId": `gid://shopify/ProductVariant/${x.variant_id}`,
    "quantity": x.quantity
  }));



  // Prepare custom attributes
  const customAttributes = Object.entries(params.quotes.customAttributes).map(([key, value]) => ({
    "key": key,
    "value": value
  }));

  // Get draft order tags
  const getDraftOrderTags = await api.quoteSetting.findFirst({
    filter: {
      shopId: {
        equals: params.quotes.shop._link,
      },
    },
  });

  let customer = params?.quotes?.customer?._link ? params?.quotes?.customer?._link : "";
  logger.info("========getCustomer 1=========" + customer);
  const {
    first_name,
    last_name,
    email,
    phone,
    address1,
    address2,
    country,
    province,
    city,
    zip,
    note
  } = params.quotes.customer_detail;

  // Search for existing customer by email
  const getCustomer = await shopifyClient.graphql(
    `query getCustomer($email: String!) {
      customers(first: 1, query: $email) {
        edges {
          node {
            id
            email
          }
      }
  }
  }`,
    {
      email: `email:${email}`
    }
  );

  logger.info("========getCustomer=========" + JSON.stringify(getCustomer));
  if (getCustomer?.errors?.length > 0) {
    throw new Error(getCustomer.errors.map(error => error.message).join(", "));
  }

  if (getCustomer?.customers?.edges?.length) {
    const shopifyCustomerId = getCustomer.customers.edges[0].node.id.replace("gid://shopify/Customer/", "");
    customer = shopifyCustomerId ? shopifyCustomerId : "";
  }
  logger.info("========customer=========" + customer);

  if (!customer || customer == 0) {
    const customerResult = await shopifyClient.graphql(`
        mutation customerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
              email
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        input: {
          email: email,
          firstName: first_name,
          lastName: last_name,
          phone: phone,
          addresses: [{
            address1: address1,
            address2: address2,
            city: city,
            countryCode: country,
            firstName: first_name,
            lastName: last_name,
            phone: phone,
            zip: zip,
            provinceCode: province
          }]
        }
      }
    );
    logger.info("========customerResult=========" + JSON.stringify(customerResult));

    if (customerResult.customerCreate?.userErrors?.length > 0) {
      let errorMessages = customerResult.customerCreate.userErrors.map(x => {
        return x.message;
      });

      throw new Error(errorMessages.join(", "));
    }

    customer = customerResult?.customerCreate?.customer?.id?.replace("gid://shopify/Customer/", "");
  }



  //Create draft order
  const draftOrderResult = await shopifyClient.graphql(`
    mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          name
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      input: {
        "customerId": `gid://shopify/Customer/${customer}`,
        "note": note,
        "email": email,
        "tags": getDraftOrderTags?.draft_order_tags || ["Quote_order"],
        "lineItems": lineItems,
        "customAttributes": customAttributes,
        "shippingAddress": {
          address1: address1,
          address2: address2,
          city: city,
          countryCode: country,
          firstName: first_name,
          lastName: last_name,
          phone: phone,
          zip: zip,
          provinceCode: province,
        }
      }
    }
  );
  logger.info("========draftOrderResult=========" + JSON.stringify(draftOrderResult));
  if (draftOrderResult.draftOrderCreate?.userErrors?.length > 0) {
    throw new Error(draftOrderResult.draftOrderCreate.userErrors.map(e => e.message).join(", "));
  }

  if (!draftOrderResult.draftOrderCreate?.draftOrder) {
    throw new Error("Failed to create draft order");
  }

  const draft_order_id = draftOrderResult.draftOrderCreate.draftOrder.id.replace("gid://shopify/DraftOrder/", "");
  // Update record with final data
  record.draft_order_id = draft_order_id;
  record.draftOrder = { _link: draft_order_id };
  record.name = draftOrderResult.draftOrderCreate.draftOrder.name;
  record.customer = { _link: customer };

  // Save the record
  await save(record);

  return record;
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections, emails }) => {
  const shopId = params?.quotes?.shop?._link;
  if (!shopId) {
    logger.error("Missing shopId, aborting email send.");
    return;
  }

  const shop = await api.shopifyShop.findOne(shopId, {
    select: { name: true, domain: true, email: true }
  });

  logger.info("========shop=========" + JSON.stringify(shop));
  const customerEmail = record?.customer_detail?.email;
  const quoteSetting = await api.quoteSetting.findFirst({
    filter: { shopId: { equals: shopId } },
    select: {
      recipient_email: true,
      customer_email_enabled: true,
      merchant_email_enabled: true,
      customer_subject: true,
      customer_heading: true,
      customer_greeting: true,
      customer_instruction: true,
      customer_no_items: true,
      customer_footer_text: true,
      merchant_subject: true,
      merchant_heading: true,
      merchant_customer_label: true,
      merchant_email_label: true,
      merchant_note_label: true,
      merchant_button_text: true,
      merchant_button_color: true,
    }
  });

  const merchantEmail = quoteSetting?.recipient_email || shop?.email;
  const draftOrderName = record?.name || "N/A";
  const customerName = record?.customer_detail?.first_name || "Customer";
  const isCustomerEnabled = quoteSetting?.customer_email_enabled === "1";
  const isMerchantEnabled = quoteSetting?.merchant_email_enabled === "1";

  const replacePlaceholders = (text, defaultText = "") => {
    if (!text) return defaultText;
    return text
      .replace(/\[ORDER_NAME\]|ORDER_NAME/g, draftOrderName)
      .replace(/\[CUSTOMER_NAME\]|CUSTOMER_NAME/g, customerName);
  };

  const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const generateOrderSummaryHtml = (orderDetail) => {
    const items = orderDetail?.items || [];
    const noItemsText = quoteSetting?.customer_no_items || "No items found.";

    const itemsHtml = items.map(item => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px; font-family: ${fontFamily};">
        <tr>
          <td width="70" valign="top">
            ${item?.image
        ? `<img src="${item.image}" width="60" height="60"
                      style="width: 60px; height: 60px; object-fit: cover; border: 1px solid #eee; border-radius: 6px; display: block;" />`
        : `<div style="width:60px; height:60px; background:#f5f5f5; border-radius:6px; border: 1px solid #eee;"></div>`
      }
          </td>
          <td valign="top" style="padding-left: 15px;">
            <div style="font-size: 14px; font-weight: 600; color: #222; line-height: 1.4;">
              ${item?.title || "Unknown Item"} &times; ${item?.quantity ?? 1}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              ${item?.variant_title || ""}
            </div>
          </td>
          <td valign="top" align="right" style="font-size: 14px; font-weight: 600; color: #222; white-space: nowrap;">
            $${((item?.final_line_price ?? 0) / 100).toFixed(2)}
          </td>
        </tr>
      </table>
    `).join("");

    const subtotal = ((orderDetail?.items_subtotal_price ?? 0) / 100).toFixed(2);
    const total = ((orderDetail?.total_price ?? 0) / 100).toFixed(2);

    return `
      <h3 style="margin-top: 35px; margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #222; font-family: ${fontFamily}; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order summary</h3>

      ${itemsHtml || `<p style='color:#666; font-size:14px; text-align:center; font-family: ${fontFamily}; margin: 20px 0;'>${noItemsText}</p>`}

      <div style="margin-top: 25px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily};">
          <tr>
            <td style="font-size: 14px; color: #666; padding: 5px 0;">Subtotal</td>
            <td align="right" style="font-size: 14px; font-weight: 500; color: #222; padding: 5px 0;">$${subtotal}</td>
          </tr>
          <tr>
            <td style="font-size: 16px; font-weight: 600; color: #222; padding: 15px 0 5px 0; border-top: 1px solid #eee;">Total</td>
            <td align="right" style="font-size: 20px; font-weight: bold; color: #222; padding: 15px 0 5px 0; border-top: 1px solid #eee;">$${total} USD</td>
          </tr>
        </table>
      </div>
    `;
  };

  // Customer Email
  const customerHtml = `
    <div style="font-family: ${fontFamily}; max-width: 600px; margin: auto; padding: 40px 20px; color: #333; line-height: 1.6;">
      <h2 style="font-size: 26px; font-weight: bold; color: #111; margin: 0 0 25px 0; text-align: left;">${replacePlaceholders(quoteSetting?.customer_heading, "Quote Request Received")}</h2>
      <p style="font-size: 15px; margin: 0 0 15px 0;">${replacePlaceholders(quoteSetting?.customer_greeting, `Hello ${customerName},`)}</p>
      <p style="font-size: 15px; margin: 0 0 25px 0;">${replacePlaceholders(quoteSetting?.customer_instruction, `We've received your quote request <strong>${draftOrderName}</strong>.`)}</p>

      ${generateOrderSummaryHtml(record?.order_detail || {})}

      <p style="margin-top: 40px; font-size: 15px; color: #555;">${replacePlaceholders(quoteSetting?.customer_footer_text, "We'll review your request and get back to you shortly.")}</p>
      <div style="font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 25px; text-align: center;">
        Sent by ${shop?.name || ""} (${shop?.domain || ""})
      </div>
    </div>
  `;

  // Merchant Email
  const merchantHtml = `
    <div style="font-family: ${fontFamily}; max-width: 600px; margin: auto; padding: 40px 20px; color: #333; line-height: 1.6;">
      <h2 style="font-size: 26px; font-weight: bold; color: #111; margin: 0 0 25px 0;">${replacePlaceholders(quoteSetting?.merchant_heading, `New Quote Request: ${draftOrderName}`)}</h2>
      
      <div>
        <p style="font-size: 14px; margin: 0 0 8px 0; color: #666;">
          <strong style="color: #333; min-width: 100px; display: inline-block;">${replacePlaceholders(quoteSetting?.merchant_customer_label, "Customer:")}</strong> ${record?.customer_detail?.first_name || ""} ${record?.customer_detail?.last_name || ""}
        </p>
        <p style="font-size: 14px; margin: 0 0 8px 0; color: #666;">
          <strong style="color: #333; min-width: 100px; display: inline-block;">${replacePlaceholders(quoteSetting?.merchant_email_label, "Email:")}</strong> ${record?.customer_detail?.email || "N/A"}
        </p>
        <p style="font-size: 14px; margin: 0; color: #666;">
          <strong style="color: #333; min-width: 100px; display: inline-block;">${replacePlaceholders(quoteSetting?.merchant_note_label, "Customer Note:")}</strong> ${record?.customer_detail?.note || "No note provided"}
        </p>
      </div>

      ${generateOrderSummaryHtml(record?.order_detail || {})}

      ${record?.draft_order_id && shop?.domain
      ? `<div style="margin-top: 45px; text-align: center;">
            <a href="https://${shop.domain}/admin/draft_orders/${record.draft_order_id}" 
               style="background-color: ${quoteSetting?.merchant_button_color || '#008060'}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
               ${replacePlaceholders(quoteSetting?.merchant_button_text, "View Draft Order")}
            </a>
          </div>`
      : ""
    }
    </div>
  `;

  try {
    if (customerEmail && isCustomerEnabled) {
      await emails.send({
        to: customerEmail,
        subject: replacePlaceholders(quoteSetting?.customer_subject, `Confirmation: We've received your quote request ${draftOrderName}`),
        html: customerHtml
      });
      logger.info(`Quote confirmation email sent to customer: ${customerEmail}`);
    } else if (!isCustomerEnabled) {
      logger.info("Customer notification is disabled, skipping email.");
    } else {
      logger.warn("Customer email missing, skipping customer email.");
    }

    if (merchantEmail && isMerchantEnabled) {
      await emails.send({
        to: merchantEmail,
        subject: replacePlaceholders(quoteSetting?.merchant_subject, `Action Required: New Quote Request ${draftOrderName}`),
        html: merchantHtml
      });
      logger.info(`Quote alert email sent to merchant: ${merchantEmail}`);
    } else if (!isMerchantEnabled) {
      logger.info("Merchant notification is disabled, skipping email.");
    } else {
      logger.warn("Merchant email missing, skipping merchant email.");
    }

  } catch (error) {
    logger.error("Error sending quote notification emails:", error);
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
