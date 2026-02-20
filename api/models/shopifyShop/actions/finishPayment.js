import { applyParams, save, ActionOptions } from "gadget-server";
import { preventCrossShopDataAccess } from "gadget-server/shopify";

/** @type { ActionRun } */
export const run = async ({ params, record, logger, reply, api, connections }) => {
  applyParams(params, record);
  await preventCrossShopDataAccess(params, record);

  logger.info('finish payment call');

  // check SubscriptionId valid or not
  const shopify = await connections.shopify.forShopId(params.id);
  const result = await shopify.graphql(`
    query {
      node(id: "gid://shopify/AppSubscription/${params.shopifyShop.activeRecurringSubscriptionId}") {
        id
        ... on AppSubscription {
          status
          name
        }
      }
    }
  `, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (result.node.status !== "ACTIVE") {
    logger.info('Invalid charge ID specified');
    // await reply.code(400).send("Invalid charge ID specified");
    return;
  }

  // get plan details
  const planDetail = await api.AppPlan.maybeFindOne(params.shopifyShop.AppPlan._link, {
    select: {
      name: true
    },
  });

  // check plan match or not
  if (result?.node?.name !== planDetail?.name) {
    logger.error('Invalid charge ID specified ' + JSON.stringify(planDetail));
    // await reply.code(400).send("Invalid charge ID specified");
    return;
  }

  await save(record);
};

/** @type { ActionOnSuccess } */
export const onSuccess = async ({ params, record, logger, api, connections }) => {
  // Your logic goes here
};

/** @type { ActionOptions } */
export const options = {
  actionType: "update",
  triggers: {
    api: true,
  },
};