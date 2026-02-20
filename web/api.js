// Sets up the API client for interacting with your backend. 
// For your API reference, visit: https://docs.gadget.dev/api/quotes-draft-order-request
import { Client } from "@gadget-client/quotes-draft-order-request";

export const api = new Client({ environment: window.gadgetConfig.environment });
