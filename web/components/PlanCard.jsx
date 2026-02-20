import {
  Card,
  Text,
  BlockStack,
  Box,
  InlineStack,
  SkeletonDisplayText, ActionList, Divider
} from "@shopify/polaris";
import { AutoButton } from "@gadgetinc/react/auto/polaris";
import { api } from "../api";
import { useContext, useState } from "react";
import { ShopContext } from "../providers";
import { trialCalculations } from "../utilities";
import { CheckCircleIcon } from '@shopify/polaris-icons';

export default ({ id, name, description, monthlyPrice, trialDays }) => {
  const { shop } = useContext(ShopContext);
  const [disabled, setDisabled] = useState(false);

  const planDetails = [
    "Unlimited Quotes",
    "Create Custom Form",
    "Add Quote Button in Product or Cart Page",
    "Button Customisation",
    "Button Conditions",
    "Advance Analytics"
    // "Add Quote Button on Cart Page",
    // "View Draft Orders",
    // "Manage Button Conditions",
    // "Customize Button Design",
    // "Track Total Views",
    // "Track Total Clicks",
    // "Track Total Orders",
    // "Works With All Themes",
  ];

  return (

    <Card padding={"0"}>
      <Box padding={"400"}>
        <BlockStack gap={"200"}>
          <Text variant="headingLg" as="h5">
            {name}
          </Text>
          <BlockStack gap={"100"}>
            <InlineStack >
              <Text tone={"success"} alignment={"end"} variant="heading2xl" as="h3">
                ${monthlyPrice}
              </Text>
              <BlockStack align={"end"}>
                <Text alignment={"end"}>/ month</Text>
              </BlockStack>
            </InlineStack>

            <Text as="p" tone="subdued">{
              trialCalculations(
                shop?.usedTrialMinutes,
                shop?.usedTrialMinutesUpdatedAt,
                new Date(),
                trialDays
              ).availableTrialDays
            } days trial</Text>

            <span>
              <AutoButton
                action={api.shopifyShop.subscribe}
                disabled={shop?.AppPlan?.id === id || disabled}
                onSuccess={({ data }) => {
                  setDisabled(true);
                  open(data?.confirmationUrl, "_top");
                }}
                variables={{ id: shop?.id ?? "", planId: id }}
                children={shop?.AppPlan?.id ? "Activated" : "Activate"}
              />

            </span>
          </BlockStack>
        </BlockStack>
      </Box>
      <Divider borderColor="border" />
      <Box padding={""}>
        <ActionList
          actionRole="menuitem"
          sections={[
            {
              items: [
                { content: 'Unlimited Quotes', icon: CheckCircleIcon, },
                { content: 'Create Custom Form', icon: CheckCircleIcon },
                { content: 'Add Quote Button in Product or Cart Page', icon: CheckCircleIcon },
                { content: 'Button Customisation', icon: CheckCircleIcon },
                { content: 'Button Conditions', icon: CheckCircleIcon },
                { content: 'Advance Analytics', icon: CheckCircleIcon },
              ],
            },
          ]}
        />
      </Box>
    </Card>


  );
};
