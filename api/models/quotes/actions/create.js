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

  // Update record with final data
  record.draft_order_id = draftOrderResult.draftOrderCreate.draftOrder.id.replace("gid://shopify/DraftOrder/", "");
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
    select: { recipient_email: true }
  });

  const merchantEmail = quoteSetting?.recipient_email || shop?.email;
  const draftOrderName = record?.name || "N/A";

  const generateOrderSummaryHtml = (orderDetail) => {
    const items = orderDetail?.items || [];

    const itemsHtml = items.map(item => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px;">
        <tr>
          <td width="70" valign="top">
            ${item?.image
        ? `<img src="${item.image}" width="60" height="60"
                      style="width: 60px; height: 60px; object-fit: cover; border: 1px solid #eee; border-radius: 6px; display: block;" />`
        : `<div style="width:60px; height:60px; background:#f0f0f0; border-radius:6px;"></div>`
      }
          </td>
          <td valign="top" style="padding-left: 12px;">
            <div style="font-size: 14px; font-weight: 500; color: #333;">
              ${item?.title || "Unknown Item"} &times; ${item?.quantity ?? 1}
            </div>
            <div style="font-size: 12px; color: #777; margin-top: 3px;">
              ${item?.variant_title || ""}
            </div>
          </td>
          <td valign="top" align="right" style="font-size: 14px; font-weight: 500; color: #333; white-space: nowrap;">
            $${((item?.final_line_price ?? 0) / 100).toFixed(2)}
          </td>
        </tr>
      </table>
    `).join("");

    const subtotal = ((orderDetail?.items_subtotal_price ?? 0) / 100).toFixed(2);
    const total = ((orderDetail?.total_price ?? 0) / 100).toFixed(2);

    return `
      <h3 style="margin-top: 30px; margin-bottom: 10px; font-size: 16px; font-weight: 600; color: #333;">Order summary</h3>

      ${itemsHtml || "<p style='color:#777; font-size:14px;'>No items found.</p>"}

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size: 14px; color: #555; padding-bottom: 6px;">Subtotal</td>
          <td align="right" style="font-size: 14px; font-weight: 600; color: #333; padding-bottom: 6px;">$${subtotal}</td>
        </tr>
      </table>

      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />

      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size: 16px; color: #333;">Total</td>
          <td align="right" style="font-size: 18px; font-weight: 700; color: #333;">$${total} USD</td>
        </tr>
      </table>
    `;
  };

  // Customer Email
  const customerHtml = `
    <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
      <h2>Quote Request Received</h2>
      <p>Hello ${record?.customer_detail?.first_name || "Customer"},</p>
      <p>We've received your quote request <strong>${draftOrderName}</strong>.</p>

      ${generateOrderSummaryHtml(record?.order_detail || {})}

      <p style="margin-top: 30px;">We'll review your request and get back to you shortly.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #777;">Sent by ${shop?.name || ""} (${shop?.domain || ""})</p>
    </div>
  `;

  // Merchant Email
  const merchantHtml = `
    <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
      <h2>New Quote Request: ${draftOrderName}</h2>
      <p>
        Customer: ${record?.customer_detail?.first_name || ""} ${record?.customer_detail?.last_name || ""}<br/>
        Email: ${record?.customer_detail?.email || "N/A"}
      </p>

      ${generateOrderSummaryHtml(record?.order_detail || {})}

      <p style="margin-top: 20px;">
        <strong>Customer Note:</strong> ${record?.customer_detail?.note || "No note provided"}
      </p>

      ${record?.draft_order_id && shop?.domain
      ? `<div style="margin-top: 30px; text-align: center;">
            <a href="https://${shop.domain}/admin/draft_orders/${record.draft_order_id}" 
               style="background-color: #008060; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
               View Draft Order
            </a>
          </div>`
      : ""
    }
    </div>
  `;

  try {
    if (customerEmail) {
      await emails.send({
        to: customerEmail,
        subject: `Confirmation: We've received your quote request ${draftOrderName}`,
        html: customerHtml
      });
      logger.info(`Quote confirmation email sent to customer: ${customerEmail}`);
    } else {
      logger.warn("Customer email missing, skipping customer email.");
    }

    if (merchantEmail) {
      await emails.send({
        to: merchantEmail,
        subject: `Action Required: New Quote Request ${draftOrderName}`,
        html: merchantHtml
      });
      logger.info(`Quote alert email sent to merchant: ${merchantEmail}`);
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
