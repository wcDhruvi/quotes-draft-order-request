import React from 'react';
import { Page, Card, Layout, Grid, BlockStack, Text, Box, Button, Thumbnail } from "@shopify/polaris"
import { useNavigate } from "react-router";
import { MetafieldsIcon, ThemeStoreIcon, ButtonIcon, ReceiptDollarIcon, ImportIcon, NotificationIcon } from '@shopify/polaris-icons';

const Setting = () => {
    let navigate = useNavigate()

    const settingList = [
        {
            name: 'Form Fields',
            description: 'Quickly create form fields for the cart page.',
            link: '/setting/form-field',
            icon: MetafieldsIcon
        },
        {
            name: 'Button Conditions',
            description: 'Simply set button conditions to show offers.',
            link: '/setting/button-condition',
            icon: ButtonIcon
        },
        {
            name: 'Button Design',
            description: 'Manage settings for the "Get Quote" button.',
            link: '/setting/button-design',
            icon: ThemeStoreIcon
        },
        {
            name: 'Notification',
            description: `Specify the notification email for quote requests.`,
            link: "/setting/notification",
            icon: NotificationIcon
        },
        {
            name: 'Plan and Price',
            description: `Plan and pricing details, along with a comprehensive list of features.`,
            link: "/setting/pricing-plan",
            icon: ReceiptDollarIcon
        },
        {
            name: 'Installation',
            description: `Please follow these instructions to set up the Uncap Discovery app.`,
            link: "/setting/installation",
            icon: ImportIcon
        },

    ]

    return (
        <Page title={"Settings"}>
            <Layout>
                <Layout.Section>
                    <Card padding={"400"}>
                        <Grid>
                            {
                                settingList.map((x, i) => {
                                    return (
                                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 4 }} key={i}>
                                            <div onClick={() => navigate(x.link)} className={"pointer"}>
                                                {/*<InlineStack gap={"200"} wrap={false} >*/}
                                                <Grid>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 2 }} key={i}>
                                                        <Thumbnail
                                                            source={x.icon}
                                                            alt="Icon"
                                                            size={"small"}
                                                        />
                                                    </Grid.Cell>
                                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 10 }} key={i}>
                                                        <BlockStack align={"start"}>
                                                            <div>
                                                                <Button variant={"plain"}>
                                                                    <Text as="h2" variant="headingSm">{x.name}</Text>
                                                                </Button>
                                                            </div>
                                                            <Text as={"p"} alignment={"start"}>{x.description}</Text>
                                                        </BlockStack>
                                                    </Grid.Cell>
                                                </Grid>
                                            </div>
                                        </Grid.Cell>
                                    )
                                })
                            }
                        </Grid>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default Setting;