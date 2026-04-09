/** @type { import("gadget-server").ActionOptions } */
export const options = {
  permits: ["system-admin", "unauthenticated", "shopify-app-users", "shopify-storefront-customers"]
};

export const params = {
  customerId: { type: "string" }
};

/** @type { ActionRun } */
export const run = async ({ params, logger, api }) => {
  const { customerId } = params;

  if (!customerId) {
    logger.info("No customerId provided to getCustomerQuotes");
    return [];
  }

  // Extract numeric ID if it's a GID
  const numericCustomerId = customerId.includes("/") ? customerId.split("/").pop() : customerId;

  const allQuotes = [];
  let quotesPage = await api.quotes.findMany({
    filter: {
      customer: { id: { equals: numericCustomerId } }
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      draft_order_id: true,
      order_detail: true,
      customer_detail: true,
      draftOrder: {
        id: true,
        name: true,
        note: true,
        subtotalPrice: true,
        totalPrice: true,
        status: true,
        currency: true,
        invoiceUrl: true,
      }
    },
    sort: { createdAt: "Descending" },
    first: 250
  });

  allQuotes.push(...quotesPage);

  while (quotesPage.hasNextPage) {
    quotesPage = await quotesPage.nextPage();
    allQuotes.push(...quotesPage);
  }

  logger.info(`Found ${allQuotes.length} quotes for customer ${numericCustomerId}`);

  return allQuotes;
};
