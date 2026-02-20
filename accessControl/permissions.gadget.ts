import type { GadgetPermissions } from "gadget-server";

/**
 * This metadata describes the access control configuration available in your application.
 * Grants that are not defined here are set to false by default.
 *
 * View and edit your roles and permissions in the Gadget editor at https://quotes-draft-order-request.gadget.app/edit/settings/permissions
 */
export const permissions: GadgetPermissions = {
  type: "gadget/permissions/v1",
  roles: {
    "shopify-app-users": {
      storageKey: "Role-Shopify-App",
      default: {
        read: true,
        action: true,
      },
      models: {
        analytics: {
          read: {
            filter: "accessControl/filters/shopify/formFields.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        AppPlan: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        countryAndState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        formFields: {
          read: {
            filter: "accessControl/filters/shopify/formFields.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quotes: {
          read: {
            filter: "accessControl/filters/shopify/quotes.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quoteSetting: {
          read: {
            filter:
              "accessControl/filters/shopify/quoteSetting.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        setting: {
          read: {
            filter: "accessControl/filters/shopify/setting.gelly",
          },
          actions: {
            create: true,
            delete: true,
            run: true,
            update: true,
          },
        },
        shopifyAppInstallation: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAppInstallation.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyAppSubscription: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyAppSubscription.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCollect.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCollection: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCollection.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCompany: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCompany.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomer.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomerAddress.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomerMergeable: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyCustomerMergeable.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyFile: {
          read: {
            filter: "accessControl/filters/shopify/shopifyFile.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyGdprRequest: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyGdprRequest.gelly",
          },
          actions: {
            create: true,
            update: true,
          },
        },
        shopifyProduct: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProduct.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductMedia: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductMedia.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductOption: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductOption.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariant: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductVariant.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyProductVariantMedia: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyProductVariantMedia.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyShop: {
          read: {
            filter: "accessControl/filters/shopify/shopifyShop.gelly",
          },
          actions: {
            finishPayment: true,
            install: true,
            reinstall: true,
            subscribe: true,
            uninstall: true,
            update: true,
          },
        },
        shopifySync: {
          read: {
            filter: "accessControl/filters/shopify/shopifySync.gelly",
          },
          actions: {
            abort: true,
            complete: true,
            error: true,
            run: true,
          },
        },
        shopifyTheme: {
          read: {
            filter:
              "accessControl/filters/shopify/shopifyTheme.gelly",
          },
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
      },
      actions: {
        analyticCreate: true,
        customApi: true,
        getAnalytics: true,
        scheduledShopifySync: true,
        sendResponse: true,
      },
    },
    "shopify-storefront-customers": {
      storageKey: "Role-Shopify-Customer",
      default: {
        read: true,
        action: true,
      },
      models: {
        analytics: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        AppPlan: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        countryAndState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        formFields: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quotes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quoteSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        setting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            run: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: true,
        },
        shopifyCollection: {
          read: true,
        },
        shopifyCompany: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        shopifyCustomer: {
          read: {
            filter:
              "accessControl/filters/shopify/storefront-customers/shopifyCustomer.gelly",
          },
        },
        shopifyCustomerAddress: {
          read: {
            filter:
              "accessControl/filters/shopify/storefront-customers/shopifyCustomerAddress.gelly",
          },
        },
        shopifyFile: {
          read: true,
        },
        shopifyProduct: {
          read: true,
        },
        shopifyShop: {
          read: true,
          actions: {
            finishPayment: true,
            updateShop: true,
          },
        },
        shopifyTheme: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
      },
      actions: {
        analyticCreate: true,
        customApi: true,
        getAnalytics: true,
        sendResponse: true,
      },
    },
    unauthenticated: {
      storageKey: "unauthenticated",
      models: {
        analytics: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        countryAndState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        formFields: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quotes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quoteSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        setting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            run: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: true,
        },
        shopifyCollection: {
          read: true,
        },
        shopifyFile: {
          read: true,
        },
        shopifyProduct: {
          read: true,
        },
        shopifyProductMedia: {
          read: true,
        },
        shopifyProductOption: {
          read: true,
        },
        shopifyProductVariant: {
          read: true,
        },
        shopifyProductVariantMedia: {
          read: true,
        },
      },
      actions: {
        analyticCreate: true,
        customApi: true,
        getAnalytics: true,
        sendResponse: true,
      },
    },
    "theme-extension-api-key": {
      storageKey: "ApCVIEoWaRhH",
      default: {
        read: true,
        action: true,
      },
      models: {
        analytics: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        AppPlan: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        countryAndState: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        formFields: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quotes: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        quoteSetting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            update: true,
          },
        },
        setting: {
          read: true,
          actions: {
            create: true,
            delete: true,
            run: true,
            update: true,
          },
        },
        shopifyCollect: {
          read: true,
        },
        shopifyCollection: {
          read: true,
        },
        shopifyFile: {
          read: true,
        },
        shopifyProduct: {
          read: true,
        },
        shopifyProductMedia: {
          read: true,
        },
        shopifyProductOption: {
          read: true,
        },
        shopifyProductVariant: {
          read: true,
        },
        shopifyProductVariantMedia: {
          read: true,
        },
        shopifyShop: {
          actions: {
            updateShop: true,
          },
        },
      },
      actions: {
        analyticCreate: true,
        customApi: true,
        getAnalytics: true,
        sendResponse: true,
      },
    },
  },
};
