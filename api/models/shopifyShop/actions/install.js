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
