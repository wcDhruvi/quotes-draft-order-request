/** @type { ActionRun } */
export const run = async ({ params, logger }) => {
    try {
        const { shop, accessToken } = params;

        if (!shop || !accessToken) {
            throw new Error("shop and accessToken are required");
        }

        const response = await fetch(
            `https://${shop}/admin/api/2026-04/graphql.json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": accessToken,
                },
                body: JSON.stringify({
                    query: `
            query GetCurrentAppDetails {
  app {
    id
    title
    developerType
    previouslyInstalled
    installation {
      id
      launchUrl
      activeSubscriptions {
        id
        name
        status
        test
        trialDays
        currentPeriodEnd
        createdAt
        lineItems {
          id
          plan {
            pricingDetails {
              __typename
            }
          }
        }
      }
      allSubscriptions(first: 100) {
        edges {
          node {
            id
            name
            status
            test
          }
        }
      }
    }
  }
}
          `,
                }),
            }
        );

        const data = await response.json();

        return {
            success: true,
            data,
        };
    } catch (error) {
        logger.error(error);
        return {
            success: false,
            message: error.message,
        };
    }
};

export const params = {
    shop: { type: "string" },
    accessToken: { type: "string" }
};