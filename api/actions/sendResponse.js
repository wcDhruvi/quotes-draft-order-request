import { ActionOptions } from "gadget-server";

export const params = {
  status: {
    type: "string",
    enum: ["success", "error"]
  },
  message: {
    type: "string"
  },
  data: {
    type: "object",
    additionalProperties: true
  },
  code: {
    type: "number"
  }
};

/** @type { ActionRun } */
export const run = async ({ params, logger }) => {
  const { status, message, data, code } = params;

  return {
    success: status === "success",
    message: message || (status === "success" ? "Operation successful" : "Operation failed"),
    data: data || null,
    code: code || (status === "success" ? 200 : 400),
    errors: status === "error" ? message : [],
    record: status === "success" ? data : null
  };
};

/** @type { ActionOptions } */
export const options = {
  returnType: true
};
