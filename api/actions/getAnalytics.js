/** @type { import("gadget-server").ActionOptions } */
export const options = {
  permits: ["system-admin", "unauthenticated", "shopify-app-users", "shopify-storefront-customers"]
};

export const params = {
  payload: {
    type: "object",
    properties: {
      startDate: { type: "string" },
      endDate: { type: "string" },
      shopId: { type: "string" }
    },
    required: ["startDate", "endDate", "shopId"]
  }
};

const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

/** @type { ActionRun } */
export const run = async ({ params, logger, api }) => {
  // Parse dates and validate
  const startDate = new Date(params.payload.startDate);
  const endDate = new Date(params.payload.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format provided. Dates must be in ISO 8601 format.");
  }

  if (startDate > endDate) {
    throw new Error("Start date must be before or equal to end date");
  }

  // Set time boundaries
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  // Get analytics records with pagination
  const allAnalyticRecords = [];
  let analyticsPage = await api.analytics.findMany({
    filter: {
      shopId: { equals: params.payload.shopId },
      createdAt: {
        greaterThanOrEqual: startDate.toISOString(),
        lessThanOrEqual: endDate.toISOString()
      }
    },
    first: 100,
    sort: { createdAt: "Ascending" },
    select: {
      createdAt: true,
      view: true,
      click: true
    }
  });

  allAnalyticRecords.push(...analyticsPage);

  while (analyticsPage.hasNextPage) {
    analyticsPage = await analyticsPage.nextPage();
    allAnalyticRecords.push(...analyticsPage);
  }

  // Initialize daily orders tracking
  const dailyOrders = new Map();

  let ordersPage = await api.quotes.findMany({
    filter: {
      shopId: { equals: params.payload.shopId },
      createdAt: {
        greaterThanOrEqual: startDate.toISOString(),
        lessThanOrEqual: endDate.toISOString()
      }
    },
    first: 100,
    sort: { createdAt: "Ascending" },
    select: {
      createdAt: true,
      id: true
    },
  });

  // Collect all orders with pagination
  do {
    for (const order of ordersPage) {
      const dateKey = formatDateKey(new Date(order.createdAt));
      dailyOrders.set(dateKey, (dailyOrders.get(dateKey) || 0) + 1);
    }
    if (ordersPage.hasNextPage) {
      ordersPage = await ordersPage.nextPage();
    }
  } while (ordersPage.hasNextPage);

  // Get total orders across all time
  let totalOrder = 0;
  let allTimeOrdersPage = await api.quotes.findMany({
    filter: {
      shopId: { equals: params.payload.shopId }
    }
  });
  do {
    totalOrder += allTimeOrdersPage.length;
    if (allTimeOrdersPage.hasNextPage) {
      allTimeOrdersPage = await allTimeOrdersPage.nextPage();
    }
  } while (allTimeOrdersPage.hasNextPage);

  // Get total views and clicks with pagination
  let totalViews = 0;
  let totalClicks = 0;
  let statsPage = await api.analytics.findMany({
    filter: {
      shopId: { equals: params.payload.shopId }
    },
    select: {
      view: true,
      click: true
    }
  });

  // Sum up totals across all pages
  do {
    for (const record of statsPage) {
      totalClicks += record.click || 0;
      totalViews += record.view || 0;
    }
    if (statsPage.hasNextPage) {
      statsPage = await statsPage.nextPage();
    }
  } while (statsPage.hasNextPage);

  // Convert daily orders map to object for response
  const dailyOrderCounts = [];
  for (const [date, count] of dailyOrders) {
    dailyOrderCounts.push({ createdAt: date, total: count });
  }

  return {
    data: {
      views: allAnalyticRecords,
      totalClicks,
      totalViews,
      totalOrder,
      orders: dailyOrderCounts
    }
  };
};