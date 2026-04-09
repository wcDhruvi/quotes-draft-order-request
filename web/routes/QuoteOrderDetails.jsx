import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ExceptionList,
  BlockStack,
  Layout,
  Page,
  SkeletonBodyText,
  Tag,
  Text,
  Divider,
  Box,
  InlineStack
} from "@shopify/polaris";
import { useNavigate, useParams } from "react-router";
import { EmailIcon, PhoneIcon } from "@shopify/polaris-icons";
import { api } from "../api";
import { ShopContext } from "../providers";

const QuoteOrderDetails = () => {
  let { id } = useParams();
  let navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState({});

  const { shop } = useContext(ShopContext);
  useEffect(() => {
    const getQuoteDetails = async () => {
      setIsLoading(true);
      try {
        const response = await api.quotes.findFirst({
          select: {
            id: true,
            customer_detail: true,
            customer: {
              id: true,
              firstName: true,
              lastName: true,
              ordersCount: true,
              email: true,
              phone: true,
              defaultAddress: {
                name: true,
                address1: true,
                address2: true,
                zipCode: true,
                province: true,
                provinceCode: true,
                phone: true,
                country: true
              },

              tags: true
            },
            draftOrder: {
              id: true,
            },
            name: true,
            draft_order_id: true,
            order_detail: true
          },
          filter: {
            OR: [
              { draft_order_id: { equals: id } },
              { draftOrder: { id: { equals: id } } }
            ]
          },
        });
        let obj = { ...response }
        const getCountry = await api.countryAndState.findFirst({
          filter: { countryCode: { equals: obj.customer_detail.country } },
          select: {
            id: true, states: true, country: true
          }
        })
        if (getCountry.id) {
          const findStateName = getCountry.states.find((x) => x.code === obj.customer_detail.province)
          obj = { ...obj, customer_detail: { ...obj.customer_detail, countryName: getCountry.country, provinceName: findStateName?.name || obj.customer_detail.province } }
        }

        setOrderDetails({ ...obj });
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching credit history:", error);
      }
    };
    getQuoteDetails();
  }, []);

  const renderData = useCallback(() => {
    let quoteListData = [];
    if (isLoading) {
      Array.from(Array(10)).map((_, i) => {
        let obj = [
          <SkeletonBodyText lines={1} />,
          <SkeletonBodyText lines={1} />,
          <SkeletonBodyText lines={1} />,
          <SkeletonBodyText lines={1} />,
        ];
        quoteListData.push(obj);
      });
    } else if (orderDetails && (orderDetails?.order_detail?.items?.length > 0 || orderDetails?.customLineItems?.length > 0)) {
      (orderDetails.order_detail.items || []).map((x, i) => {
        let obj = [
          <Button textAlign="left" variant={'plain'} onClick={() => window.open(`https://${shop.myshopifyDomain}/admin/products/${x.product_id}`, "_blank")}>{x.product_title}</Button>,
          <span>{shop.moneyFormat.replace("{{amount}}", "")}{x.price / 100}</span>,
          <span>{x.quantity}</span>,
          <span>{shop.moneyFormat.replace("{{amount}}", "")}{(parseFloat(x.price / 100) * x.quantity).toFixed(2)}</span>,
        ];
        quoteListData.push(obj);
      });
      (orderDetails?.customLineItems || []).map((x, i) => {
        let obj = [
          <InlineStack gap="100" blockAlign="center">
            <Text fontWeight="medium">{x.title}</Text> 
          <Text variant="bodySm" tone="subdued">(Custom Line Item)</Text></InlineStack>,
          <span>{shop.moneyFormat.replace("{{amount}}", "")}{0}</span>,
          <span>{x.quantity}</span>,
          <span>{shop.moneyFormat.replace("{{amount}}", "")}{(0).toFixed(2)}</span>,
        ];
        quoteListData.push(obj);
      })
    } else {
      let obj = [<EmptyState
        heading="No line items"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        fullWidth
      >
      </EmptyState>];
      quoteListData.push(obj);
    }
    return quoteListData;
  }, [isLoading]);



  return (
    <Page
      title={`Draft Request ${orderDetails?.name}`} backAction={{ content: 'Products', onAction: () => navigate(`/quote-order`) }}
      secondaryActions={
        <Button onClick={() => window.open(`https://${shop.myshopifyDomain}/admin/draft_orders/${id}`, "_blank")}>
          View
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Card padding={"0"}>
            <BlockStack gap={'0'}>
              <Box padding={"200"} paddingInlineStart={"400"}>
                <Text as="h2" variant="headingSm">Line Items</Text>
              </Box>

              <DataTable
                columnContentTypes={[
                  'text',
                  'numeric',
                  'numeric',
                  'numeric',
                ]}
                headings={[
                  'Title',
                  'Price',
                  'QTY',
                  'Total',
                ]}
                verticalAlign={"middle"}
                rows={renderData()}
                showTotalsInFooter
                totals={['', '', '', <BlockStack gap={'200'}>
                  <Text alignment={'end'} as="h2" variant="headingSm">{shop.moneyFormat.replace("{{amount}}", "")}{orderDetails.order_detail?.items_subtotal_price / 100}</Text>
                  <Text alignment={'end'} as="h2" variant="headingSm">{shop.moneyFormat.replace("{{amount}}", "")}{orderDetails.order_detail?.total_price / 100}</Text>
                </BlockStack>
                ]}
                totalsName={{
                  singular: <BlockStack gap={'200'}>
                    <Text alignment={'end'} as="h2" variant="headingSm">Subtotal</Text>
                    <Text alignment={'end'} as="h2" variant="headingSm">Total</Text>
                  </BlockStack>,
                }}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap={"400"}>
            <Card padding={"0"}>
              <BlockStack gap={'0'}>
                <Box padding={"400"}>
                  <BlockStack gap={'400'}>
                    <Text as="h2" variant="headingSm">Customer</Text>
                    <BlockStack gap={"100"}>
                      {
                        orderDetails?.customer?.id ? <span><Button variant={'plain'} onClick={orderDetails?.customer?.id ? () => window.open(`https://${shop.myshopifyDomain}/admin/customers/${orderDetails?.customer?.id}`, "_blank") : null}>{orderDetails?.customer?.firstName} {orderDetails?.customer?.lastName}</Button></span> : ''
                      }
                      <Text>{orderDetails?.customer?.orders_count} Order</Text>
                    </BlockStack>
                  </BlockStack>
                </Box>
                <Divider />
                <Box padding={"400"}>
                  <BlockStack gap={'400'}>
                    <Text variant="headingMd" as="h6">Contact information</Text>
                    <ExceptionList
                      items={[
                        {
                          icon: EmailIcon,
                          description: orderDetails?.customer_detail?.email ? orderDetails?.customer_detail?.email : "No email"
                        },
                        {
                          icon: PhoneIcon,
                          description: orderDetails?.customer_detail?.phone ? orderDetails?.customer_detail?.phone : "No phone number"
                        },]}
                    />
                  </BlockStack>
                </Box>
                <Divider />

                <Box padding={"400"}>
                  <BlockStack gap={"400"}>
                    <Text variant="headingMd" as="h6">Shipping address</Text>
                    <BlockStack>
                      <Text>{orderDetails?.customer_detail?.name}</Text>
                      <Text>{orderDetails?.customer_detail?.address1}</Text>
                      <Text>{orderDetails?.customer_detail?.address2}</Text>
                      <Text>{orderDetails?.customer_detail?.zip} {orderDetails?.customer_detail?.provinceName}</Text>
                      <Text>{orderDetails?.customer_detail?.countryName}</Text>
                      <Text>{orderDetails?.customer_detail?.phone}</Text>
                    </BlockStack>
                  </BlockStack>
                </Box>
                {/* <Divider />
                <Box padding={'400'}>
                  <BlockStack gap={"400"}>
                    <Text variant="headingMd" as="h6">Billing address</Text>
                    <Text as={"p"}>Same as shipping address</Text>
                  </BlockStack>
                </Box> */}
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap={'400'}>
                <Text as="h2" variant="headingSm">Customer tags</Text>

                <InlineStack gap={'100'} wrap={true}>
                  {
                    (((typeof (orderDetails?.customer?.tags) === "string") ? orderDetails?.customer?.tags.split(",") : orderDetails?.customer?.tags) || []).map((x, i) => {
                      return <Tag key={i}>{x}</Tag>;
                    })
                  }
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default QuoteOrderDetails;