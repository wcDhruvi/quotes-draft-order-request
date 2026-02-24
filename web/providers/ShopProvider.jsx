import { useFindFirst, useQuery } from "@gadgetinc/react";
import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { Banner, Page, Text, Spinner } from "@shopify/polaris";
import { trialCalculations } from "../utilities";
import { useNavigate, useParams } from "react-router";
import StyledSpinner from "../components/StyledSpinner";
export const ShopContext = createContext({});

/**
 * React component that fetches shop and subscription data
 *
 * Key features:
 *  - Sets the number of trial days left for this shop
 *  - Allows children to access the context from this provider
 */
export default ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState({});
  const queryParams = new URLSearchParams(window.location.search);
  const activeRecurringSubscriptionId = queryParams.get('charge_id' || '');
  const AppPlan = queryParams.get('plan_id');
  const shop_id = queryParams.get('shop_id');

  const navigate = useNavigate();
  useEffect(() => {
    const confirmCharge = async () => {

      try {
        // Call your backend route to validate charge_id and update the database
        const rs = await api.shopifyShop.finishPayment(shop_id, {
          activeRecurringSubscriptionId,
          AppPlan: { _link: AppPlan }
        });
        getShopData();

      } catch (error) {
        console.error("Error processing payment:", error);
      }
    };
    if (activeRecurringSubscriptionId && AppPlan) {
      confirmCharge();
    } else {
      getShopData();
    }
  }, []);

  const getShopData = async () => {
    const res = await api.shopifyShop.findFirst({
      select: {
        currency: true,
        currencyBackup: true,
        moneyFormat: true,
        myshopifyDomain: true,
        name: true,
        id: true,
        usedTrialMinutes: true,
        usedTrialMinutesUpdatedAt: true,
        onBording: true,
        AppPlan: {
          id: true,
          name: true,
          trialDays: true,
        },
      },
    });
    setShop({ ...res, currency: res.currency || res.currencyBackup });
    setLoading(false);
  };


  if (loading) {
    return (
      <StyledSpinner />
    );
  }

  if (!shop?.AppPlan?.id && !loading) {
    navigate("/setting/pricing-plan");
  } else if (activeRecurringSubscriptionId && AppPlan && shop_id) {
    navigate("/");
  }

  return (
    <ShopContext.Provider
      value={{
        shop,
        setShop
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
