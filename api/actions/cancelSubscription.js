/** @type { ActionRun } */
export const run = async ({ params, logger }) => {
    try {
        const { shop, accessToken, id } = params;

        if (!shop || !accessToken || !id) {
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
            mutation AppSubscriptionCancel($id: ID!, $prorate: Boolean) {
      appSubscriptionCancel(id: $id, prorate: $prorate) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
          status
        }
      }
    }
          `,
                    variables: {
                        id: params.id,
                        "prorate": true
                    }
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
    id: { type: "string" },
    shop: { type: "string" },
    accessToken: { type: "string" }
};