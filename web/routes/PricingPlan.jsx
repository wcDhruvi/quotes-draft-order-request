import { useFindMany } from "@gadgetinc/react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { api } from "../api";

import { useCallback, useContext, useEffect, useState } from "react";
import PlanCard from "../components/PlanCard";
import StyledSpinner from "../components/StyledSpinner";
import { ShopContext } from "../providers";

// This is the billing page that will be displayed when a user hasn't selected a plan or they want to change plans.
export default () => {

  const { shop } = useContext(ShopContext);
 
  const [show, setShow] = useState(false);
  const [bannerContext, setBannerContext] = useState("");

  const [{ data: plans, fetching: fetchingPlans, error: errorFetchingPlans }] =
    useFindMany(api.AppPlan, {
      select: {
        id: true,
        name: true,
        description: true,
        monthlyPrice: true,
        trialDays: true,
      },
    });

  const handleDismiss = useCallback(() => {
    setShow(false);
  }, []);

  // useEffect for showing an error banner when there's an issue fetching plans
  useEffect(() => {
    if (!fetchingPlans && errorFetchingPlans) {
      setBannerContext(errorFetchingPlans.message);
      setShow(true);
    } else if (fetchingPlans) {
      setShow(false);
    }
  }, [fetchingPlans, errorFetchingPlans]);

  if (fetchingPlans) {
    return <StyledSpinner />;
  }

  return (
    <Page title="Pricing Plan" narrowWidth >
      <BlockStack gap="500">
        {show && (
          <Banner
            title={bannerContext}
            tone="critical"
            onDismiss={handleDismiss}
          />
        )}
        <Layout>
          {plans?.length ? (
            plans?.map((plan) => {
              const effectiveTrialDays = (shop?.trialDaysOverride !== null && shop?.trialDaysOverride !== undefined)
                ? shop.trialDaysOverride
                : plan.trialDays;

              return (
                <Layout.Section variant="oneThird" key={plan.id}>
                  <PlanCard
                    id={plan.id}
                    name={plan.name}
                    description={plan.description}
                    monthlyPrice={plan.monthlyPrice}
                    trialDays={effectiveTrialDays}
                  />
                </Layout.Section>
              );
            })
          ) : ""}
        </Layout>
      </BlockStack>
    </Page>
  );
};
