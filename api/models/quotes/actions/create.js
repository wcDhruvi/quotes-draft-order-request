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
/** @type { ActionOptions } */
export const options = {
  actionType: "create",
  triggers: { api: true },
};
