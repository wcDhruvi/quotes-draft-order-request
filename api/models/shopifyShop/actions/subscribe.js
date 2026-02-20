import {
  applyParams,
  preventCrossShopDataAccess,
  save,
  ActionOptions,
} from "gadget-server";
import { trialCalculations } from "../helpers";

/** @type { ActionRun } */
export const run = async ({
  params,
  record,
  logger,
  api,
  connections,
  currentAppUrl,
  config
}) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);
  
  if (params.planId) {
    const NODE_ENV = config.NODE_ENV;
    const planMatch = await api.AppPlan.maybeFindOne(params.planId, {
      select: {
        name: true,
        monthlyPrice: true,
        currency: true,
        trialDays: true,
      },
    });
  
    if (planMatch) {
      const today = new Date();

      // Check for trial availability
      const { usedTrialMinutes, availableTrialDays } = trialCalculations(
        record.usedTrialMinutes,
        record.usedTrialMinutesUpdatedAt,
        today,
        planMatch.trialDays
      );

      if (!planMatch.monthlyPrice) {
        throw new Error("ZERO COST PLAN - The price of a plan cannot be zero");
      }

      /**
       * Create subscription record in Shopify
       * Shopify requires that the price of a subscription be non-zero. This template does not currently support free plans
       */
      const result = await connections.shopify.current?.graphql(
        `mutation ($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean!, $trialDays: Int) {
          appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, test: $test, trialDays: $trialDays) {
            userErrors {
              message
            }
            appSubscription {
              id
            }
            confirmationUrl
          }
        }`,
        {
          test: process.env.NODE_ENV === "production" ? false : true,
          name: planMatch.name,
          returnUrl: `https://${record.myshopifyDomain}/admin/apps/${config.SHOPIFY_APP_API_KEY}?shop_id=${connections.shopify.currentShopId}&plan_id=${params.planId}&shop=${record.myshopifyDomain}`,
          trialDays: availableTrialDays,
          lineItems: [
            {
              plan: {
                appRecurringPricingDetails: {
                  price: {
                    amount: planMatch.monthlyPrice,
                    currencyCode: planMatch.currency,
                  },
                  interval: "EVERY_30_DAYS",
                },
              },
            },
          ],
        }
      );
    
      // Check for errors in subscription creation
      if (result?.appSubscriptionCreate?.userErrors?.length) {
        logger.info(result?.appSubscriptionCreate?.userErrors[0]?.message + ' error plan');
        throw new Error(result?.appSubscriptionCreate?.userErrors[0]?.message);
      }

      // Updating the relevant shop record fields
      record.usedTrialMinutes = usedTrialMinutes;
      record.usedTrialMinutesUpdatedAt = today;
      // Safely extract subscription ID
      const subscriptionId = result?.appSubscriptionCreate?.appSubscription?.id?.split?.("/")?.[4] ?? null;
      if (!subscriptionId) {
        logger.error("Failed to extract subscription ID from Shopify response", {
          rawId: result?.appSubscriptionCreate?.appSubscription?.id,
          fullResponse: result
        });
      }
      record.activeRecurringSubscriptionId = subscriptionId;
      record.confirmationUrl = result?.appSubscriptionCreate?.confirmationUrl;
      
      const savedRecord = await save(record);
    } else {
      throw new Error("SUBSCRIPTION FLOW - Plan not found");
    }
  }
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: { api: true },
};

export const params = {
  // planId is sent to this action so that we can easily fetch the plan data
  planId: { type: "string" },
};
