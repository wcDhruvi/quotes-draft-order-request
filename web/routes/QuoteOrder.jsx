import React, { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Page,
  Text,
  SkeletonBodyText,
  Button,
  Card,
  BlockStack,
  IndexTable,
  EmptySearchResult,
  Box
} from "@shopify/polaris";
import { ViewIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router";
import { api } from "../api";
import { AutoTable } from "@gadgetinc/react/auto/polaris";
import { useAction } from "@gadgetinc/react";
import moment from "moment";
import { ShopContext } from "../providers";

const QuoteOrder = () => {
  const navigate = useNavigate();
  const { shop } = useContext(ShopContext);
  return (
    <Page title="Quote Requests">
      <Layout>
        <Layout.Section >
          <Card padding={"0"}>
            <AutoTable
              //@ts-ignore
              model={api.quotes}
              selectable={false}
              searchable={false}
              initialSort={{ createdAt: "Descending" }}
              pageSize={10}
              columns={[
                {
                  header: "Draft",
                   style: { paddingLeft: "12px" },
                  render: ({ record }) => {
                    // Displays the name like so: A. Turing
                    return (
                      <Button variant={"plain"} onClick={() => navigate(`/quote-order/${record.draft_order_id}`)}>{record.name}</Button>
                    );
                  },
                },
                {
                  header: "Date",
                  render: ({ record }) => {
                    return (
                      <div> {moment(record.createdAt).format('lll')} </div>
                    );
                  },
                },
                {
                  header: "Customer",
                  render: ({ record }) => {
                    return (
                      <div>{record.customer_detail.first_name} {record.customer_detail.last_name}</div>
                    );
                  },
                },
                {
                  header: "Sub Total",
                  render: ({ record }) => {
                    return (
                      <div>{shop.moneyFormat.replace("{{amount}}", "")}{record.order_detail.items_subtotal_price / 100}</div>
                    );
                  },
                },
                {
                  header: "Total",
                  render: ({ record }) => {
                    return (
                      <div>{shop.moneyFormat.replace("{{amount}}", "")}{record.order_detail.total_price / 100}</div>
                    );
                  },
                },
                {
                  header: "Action",
                  style: { maxWidth: "100%", paddingRight: "12px" },
                  render: ({ record }) => {
                    return (
                    <Button variant={"plain"} icon={ViewIcon} onClick={() => window.open(`https://${shop.myshopifyDomain}/admin/draft_orders/${record.draft_order_id}`, "_blank")}>
                         View
                        </Button>
                    );
                  },
                },
              ]}

            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default QuoteOrder;