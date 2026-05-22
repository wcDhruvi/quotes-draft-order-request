import React, { Fragment, useState, useEffect } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Layout,
  Page,
  Select,
  Text,
  TextField,
  Thumbnail,
  Toast,
  Tooltip,
  BlockStack,
  Grid,
  ResourceItem,
  ResourceList,
  InlineStack,
  Tag,
  Listbox,
  Combobox,
  AutoSelection,
} from "@shopify/polaris";
import { DeleteIcon, ImageIcon } from "@shopify/polaris-icons";
import { useGadget } from "@gadgetinc/react-shopify-app-bridge";
import { useNavigate } from "react-router";
import { useAction, useFindFirst, useFindMany } from "@gadgetinc/react";
import { api } from "../api";

const initialState = [
  {
    type: "1",
    product_ids: [],
    collection_ids: [],
    customer_tags: [],
    product_tags: [],
    total_condition: "1",
    max: "",
    min: ''
  }
];

const ButtonCondition = () => {
  const [quoteCondition, setQuoteCondition] = useState(initialState);
  const [isProduct, setIsProduct] = useState(false);
  const [isCollection, setIsCollection] = useState(false);
  const [isSave, setIsSave] = useState(false);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [draftOrderTags, setDraftOrderTags] = useState([]);
  const [isAddToCartQuotes, setIsAddToCartQuotes] = useState("0");
  const [ids, setIds] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [value, setValue] = useState("");
  const [draftOrderValue, setDraftOrderValue] = useState("");
  const [addtocartClassname, setAddtocartClassname] = useState("");
  let navigate = useNavigate();
  const { appBridge } = useGadget();
  const [{ data: quoteSetting }, refresh] = useFindFirst(api.quoteSetting);
  const [{ }, update] = useAction(api.quoteSetting.update);

  const getProductDB = async (products) => {
    const shopifyProductRecords = await api.shopifyProduct.findMany({
      select: {
        id: true,
        title: true,
        media: {
          edges: {
            node: {
              image: true
            }
          }
        },
        // variants: {
        //     edges: {
        //         node: {
        //             id: true,
        //             title: true,
        //             media: {
        //                 edges: {
        //                     node: {
        //                         image: true
        //                     }
        //                 }
        //             }
        //         },
        //     },
        // },
      },
      filter: { id: { in: products } }, // Ensure 'products' is an array of IDs
    });
    return shopifyProductRecords;
  };

  const getCollectionDB = async (collections) => {
    const shopifyCollectionRecords = await api.shopifyCollection.findMany({
      select: {
        id: true,
        title: true,
        image: true
      },
      filter: { id: { in: collections } }, // Ensure 'products' is an array of IDs
    });
    return shopifyCollectionRecords;
  };

  useEffect(() => {
    qutesSetting();
  }, [quoteSetting]);

  const qutesSetting = async () => {
    const response = { ...quoteSetting };
    let clone = [];
    setIds(response.id);
    setDraftOrderTags(response.draft_order_tags || []);
    Object.keys(response).map(async (x) => {
      let obj = {};
      if (x === "is_all_product" && response[x] === "1") {
        obj = {
          ...obj,
          type: "1",
          product_ids: [],
          collection_ids: [],
          customer_tags: [],
          product_tags: [],
          total_condition: "",
          max: "",
          min: '',
          id: response.id,
        };
        clone.push(obj);
      } else if (x === "product_ids" && response[x] && response[x].length) {

        obj = {
          ...obj,
          type: "2",
          product_ids: response[x] || [],
          collection_ids: [],
          product_tags: [],
          total_condition: "",
          max: "",
          min: '',
          id: response.id
        };
        clone.push(obj);
      } else if (x === "collection_ids" && response[x] && response[x].length) {
        obj = {
          ...obj,
          type: "3",
          product_ids: [],
          collection_ids: response[x] || [],
          product_tags: [],
          total_condition: "",
          max: "",
          min: '',
        };
        clone.push(obj);
      } else if (x === "total_condition" && response[x]) {
        obj = {
          ...obj,
          type: "4",
          product_ids: [],
          collection_ids: [],
          product_tags: [],
          total_condition: response[x],
          max: response.max,
          min: response.min,
        };
        clone.push(obj);
      } else if (x === "customer_tags" && response[x] && response[x].length) {
        obj = {
          ...obj,
          type: "5",
          product_ids: [],
          collection_ids: [],
          customer_tags: response[x],
          total_condition: "",
          max: "",
          min: ''
        };
        clone.push(obj);
      } else if (x === "product_tags" && response[x] && response[x].length) {
        obj = {
          ...obj,
          type: "6",
          product_ids: [],
          collection_ids: [],
          customer_tags: [],
          product_tags: response[x],
          total_condition: "",
          max: "",
          min: ''
        };
        clone.push(obj);
      }
    });
    const findProduct = clone.findIndex((x) => x.type === "2");
    const findCollection = clone.findIndex((x) => x.type === "3");
    if (findProduct !== -1) {
      const dbProduct = await getProductDB(clone[findProduct].product_ids);
      let product_ids = [];
      dbProduct.map((p) => {
        let id = { title: p.title, id: `gid://shopify/Product/${p.id}`, image: p?.media?.edges[0]?.node?.image?.originalSrc || "" };
        product_ids.push(id);
      });
      clone[findProduct].product_ids = product_ids;
    }
    if (findCollection !== -1) {
      const dbCollection = await getCollectionDB(clone[findCollection].collection_ids);
      let collection_ids = [];
      dbCollection.map((p) => {
        let id = { ...p, id: `gid://shopify/Collection/${p.id}`, image: p?.image?.src || "", };
        collection_ids.push(id);
      });
      clone[findCollection].collection_ids = collection_ids;
    }
    console.log(clone);
    setQuoteCondition(clone.sort((a, b) => a.type > b.type ? 1 : -1));
    setIsAddToCartQuotes(response.is_add_to_cart_quotes);
    setAddtocartClassname(response.addtocart_classname || "");
  };


  const onSelectProduct = (record) => {
    let clone = [...quoteCondition];
    const index = clone.findIndex((x) => x.type === "2");
    if (index !== -1) {
      let product = [];
      record.selection.map((x) => {
        let obj = {
          id: x.id,
          title: x.title,
          handle: x.handle,
          image: x?.images[0]?.originalSrc || ""
        };
        product.push(obj);
      });
      clone[index].product_ids = product;
      setQuoteCondition(clone);
      setIsProduct(false);
    }
  };

  const onSelectCollection = (record) => {
    let clone = [...quoteCondition];
    const index = clone.findIndex((x) => x.type === "3");
    if (index !== -1) {
      let collections = [];
      record.selection.map((x) => {
        let obj = {
          handle: x.handle,
          image: x?.image?.originalSrc || "",
          id: x.id,
          title: x.title,
        };
        collections.push(obj);
      });
      clone[index].collection_ids = collections;
      setQuoteCondition(clone);
      setIsCollection(false);
    }
  };

  const onOpenProduct = async () => {
    const selected = await appBridge.resourcePicker({
      type: "product",
      multiple: true,
      filter: { variants: false, archived: false, draft: false, hidden: false },
      selectionIds: quoteCondition.find((x) => x.type === "2")?.product_ids || [],
    });

    onSelectProduct(selected);
  };

  const onOpenCollection = async () => {
    const selected = await appBridge.resourcePicker({
      type: "collection",
      multiple: true,
      selectionIds: quoteCondition.find((x) => x.type === "3")?.collection_ids || [],
    });
    onSelectCollection(selected);
  };
  const onDeleteProduct = (id) => {
    let clone = [...quoteCondition];
    const index = clone.findIndex((x) => x.type === "2");
    const indexProduct = clone[index].product_ids.findIndex((x) => x.id === id);
    if (indexProduct !== -1) {
      clone[index].product_ids.splice(indexProduct, 1);
      setQuoteCondition(clone);
    }
  };
  const onDeleteCollection = (id) => {
    let clone = [...quoteCondition];
    const index = clone.findIndex((x) => x.type === "3");
    const indexProduct = clone[index].collection_ids.findIndex((x) => x.id === id);
    if (indexProduct !== -1) {
      clone[index].collection_ids.splice(indexProduct, 1);
      setQuoteCondition(clone);
    }
  };
  const onChange = (name, value, index) => {
    let clone = [...quoteCondition];
    if (name === "type" && value == 1) {
      clone[index][name] = value;
      clone = clone.filter((y) => y.type !== "2");
      clone = clone.filter((y) => y.type !== "3");
      setQuoteCondition(clone);
    } else if (name === "type" && (value == 2 || value == 3)) {
      clone[index][name] = value;
      clone = clone.filter((y) => y.type !== "1");
      setQuoteCondition(clone);
    } else {
      clone[index][name] = value;
      setQuoteCondition(clone);
    }
  };
  const onAddNewRule = () => {
    let clone = [...quoteCondition];
    if (clone && clone.length) {
      const max = Math.max.apply(null, clone.map(item => Number(item.type)));
      let obj = {
        type: max === 1 ? "4" : `${max + 1}`,
        product_ids: [],
        collection_ids: [],
        customer_tags: [],
        product_tags: [],
        total_condition: "1",
        is_all_product: "0",
        max: "",
        min: ''
      };
      clone.push(obj);
    } else {
      let obj = {
        type: "1",
        product_ids: [],
        collection_ids: [],
        customer_tags: [],
        product_tags: [],
        total_condition: "1",
        is_all_product: "1",
        max: "",
        min: ''
      };
      clone.push(obj);
    }
    setQuoteCondition(clone);
  };


  const onDeleteRule = (index) => {
    let clone = [...quoteCondition];
    clone.splice(index, 1);
    setQuoteCondition(clone);
  };
  const toggleActive = () => {
    setActive(false);
    setError(false);
    setMessage("");
  };

  const toastMarkup = active ? (
    <Toast
      content={message}
      error={error}
      onDismiss={toggleActive}
      duration={2000}
    />
  ) : null;

  const onUpdateQuoteRule = async () => {
    setIsSave(true);
    let payload = {
      id: ids,
      is_all_product: "0",
      customer_tags: [],
      product_tags: [],
      product_ids: [],
      collection_ids: [],
      total_condition: "",
      min: "",
      max: ""
    };
    quoteCondition.map((x) => {
      if (x.type === "1") {
        payload = { ...payload, is_all_product: "1", };
      } else if (x.type === "2" && payload.is_all_product !== 1) {
        let product_ids = [];
        x.product_ids.map((p) => {
          let id = p.id.replace("gid://shopify/Product/", "");
          product_ids.push(id);
        });
        payload = { ...payload, product_ids: product_ids };
      } else if (x.type === "3" && payload.is_all_product !== 1) {
        let collection_ids = [];
        x.collection_ids.map((p) => {
          let id = p.id.replace("gid://shopify/Collection/", "");
          collection_ids.push(id);
        });
        payload = { ...payload, collection_ids: collection_ids, };
      } else if (x.type === "4") {
        payload = { ...payload, total_condition: x.total_condition, max: x.max, min: x.min };
      } else if (x.type === "5") {
        payload = { ...payload, customer_tags: x.customer_tags };
      } else if (x.type === "6") {
        payload = { ...payload, product_tags: x.product_tags };
      }
    });
    const response = await update({
      is_all_product: payload.is_all_product,
      customer_tags: payload.customer_tags || [],
      product_tags: payload.product_tags || [],
      product_ids: payload.product_ids || [],
      collection_ids: payload.collection_ids || [],
      total_condition: payload.total_condition,
      min: payload.min,
      max: payload.max,
      is_add_to_cart_quotes: isAddToCartQuotes,
      addtocart_classname: addtocartClassname,
      draft_order_tags: draftOrderTags,
      id: ids,
    });
    if (response.error === undefined) {
      setIsSave(false);
      onToastMessage("Button conditions updated.", false);
    } else {
      setIsSave(false);
    }
  };

  const onToastMessage = (message, error) => {
    setActive(true);
    setError(error);
    setMessage(message);
  };

  const updateSelection = (selected, index, name) => {
    let clone = [...quoteCondition];
    const data = [...clone[index][name]];
    if (!data.includes(selected)) {
      data.push(selected);
    }
    clone[index][name] = data;
    setQuoteCondition(clone);
    setValue("");
    setSelectedIndex(null);
  };

  const removeTag = (tag, index, name) => () => {
    let clone = [...quoteCondition];
    const data = [...clone[index][name]];
    const nextSelectedTags = new Set([...data]);
    nextSelectedTags.delete(tag);
    clone[index][name] = nextSelectedTags;
    setQuoteCondition(clone);
  };

  const verticalContentMarkup = (data, index, name) => {
    return data.length > 0 ? (
      <InlineStack gap={"200"}>
        {data.map((tag) => (
          <Tag onRemove={removeTag(tag, index, name)}>
            {tag}
          </Tag>
        ))}
      </InlineStack>
    ) : null;
  };

  const onChangeInput = (e, index) => {
    setValue(e);
    setSelectedIndex(index);
  };

  const onChangeInputDraftOrder = (values) => {
    setDraftOrderValue(values);
  };
  const verticalContentMarkupDraftOrder = (data) => {
    return data.length > 0 ? (
      <InlineStack gap={"200"}>
        {(data && data || []).map((tag, i) => (
          <Tag onRemove={removeTagDraftOrder(i)}>
            {tag}
          </Tag>
        ))}
      </InlineStack>
    ) : null;
  };

  const updateSelectionDraftOrder = (selected) => {
    let clone = [...draftOrderTags];
    if (!clone.includes(selected)) {
      clone.push(selected);
    }
    setDraftOrderTags(clone);
    setDraftOrderValue("");
  };

  const removeTagDraftOrder = (tag) => () => {
    let clone = [...draftOrderTags];
    clone.splice(tag, 1);
    setDraftOrderTags(clone);
  };

  return (
    <Fragment>
      {toastMarkup}
      <Page title="Button Conditions"
        primaryAction={{
          content: 'Save',
          onAction: onUpdateQuoteRule,
          loading: isSave
        }}
        backAction={{ content: 'Setting', onAction: () => navigate(`/setting`) }}>
        <Layout>
          <Layout.Section variant={"oneThird"}>
            <Card>
              <BlockStack gap={"400"}>
                <Text id="storeDetails" variant="headingMd" as="h2">
                  Simply set button conditions to show offers
                </Text>
                <Text variant="bodyMd" color="subdued" as="p">
                  To set button conditions, give some eligibility rules & set conditions to "Show
                  offer
                  for" based on All Products, Specific Products, Specific Collection, Cart Value
                  Range,
                  Customer Tags, and Product Tags. After completing the eligibility rules click on
                  Save.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap={"400"}>
                <Text variant="headingMd" as="h2">Eligibility rules</Text>
                {
                  quoteCondition.map((x, i) => {
                    return (
                      <Fragment key={i}>
                        <Grid>
                          <Grid.Cell columnSpan={{
                            xs: 6,
                            sm: 3,
                            md: 3,
                            lg: quoteCondition.length > 1 ? 11 : 12,
                            xl: quoteCondition.length > 1 ? 11 : 12
                          }}>
                            <Select
                              value={x.type}
                              label={"Show offer for"}
                              onChange={(value) => onChange("type", value, i)}
                              options={[
                                {
                                  label: "All products",
                                  value: "1",
                                  disabled: quoteCondition.filter((y) => y.type === "1").length > 0
                                },
                                {
                                  label: "Specific products",
                                  value: "2",
                                  disabled: quoteCondition.filter((y) => y.type === "2").length > 0
                                },
                                {
                                  label: "Specific collection",
                                  value: "3",
                                  disabled: quoteCondition.filter((y) => y.type === "3").length > 0
                                },
                                {
                                  label: "Cart value range",
                                  value: "4",
                                  disabled: quoteCondition.filter((y) => y.type === "4").length > 0
                                },
                                {
                                  label: "Customer tags",
                                  value: "5",
                                  disabled: quoteCondition.filter((y) => y.type === "5").length > 0
                                },
                                {
                                  label: "Product tags",
                                  value: "6",
                                  disabled: quoteCondition.filter((y) => y.type === "6").length > 0
                                },
                              ]}
                            />
                          </Grid.Cell>
                          <BlockStack align={"end"} inlineAlign={"end"}>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 1, xl: 1 }}>
                              {
                                quoteCondition.length > 1 ?
                                  <span>
                                    <Button icon={DeleteIcon}
                                      onClick={() => onDeleteRule(i)} />
                                  </span>
                                  : ""
                              }
                            </Grid.Cell>
                          </BlockStack>
                        </Grid>
                        {
                          x.type === "2" && <Fragment>
                            <ResourceList
                              resourceName={{ singular: 'customer', plural: 'customers' }}
                              items={x.product_ids}
                              renderItem={(item) => {
                                const { id, url, name, image, title } = item;
                                return (
                                  <ResourceItem
                                    id={id}
                                    url={url}
                                    media={
                                      <Thumbnail customer size="small" name={name}
                                        source={image ? image : ImageIcon} />
                                    }
                                    accessibilityLabel={`View details for ${name}`}
                                    name={name}
                                  >
                                    <InlineStack align={"space-between"}>
                                      <span className={"resource-item-title"}>
                                        <Text variant="bodyMd" fontWeight="bold"
                                          as="h3">
                                          {title}
                                        </Text>
                                      </span>
                                      <Tooltip content="Delete product"
                                        dismissOnMouseOut
                                        preferredPosition="above"><Button
                                          icon={DeleteIcon}
                                          onClick={() => onDeleteProduct(id)} />
                                      </Tooltip>
                                    </InlineStack>
                                  </ResourceItem>
                                );
                              }}
                            />
                            <span>
                              <Button primary onClick={onOpenProduct}>Add Product</Button>
                            </span>
                          </Fragment>
                        }
                        {
                          x.type === "3" && <Fragment>
                            <ResourceList
                              resourceName={{ singular: 'customer', plural: 'customers' }}
                              items={x.collection_ids}
                              renderItem={(item) => {
                                const { id, url, name, image, title } = item;
                                return (
                                  <ResourceItem
                                    id={id}
                                    url={url}
                                    media={
                                      <Thumbnail customer size="small" name={name}
                                        source={image ? image : ImageIcon} />
                                    }
                                    accessibilityLabel={`View details for ${name}`}
                                    name={name}
                                  >
                                    <InlineStack align={"space-between"}>
                                      <span className={"resource-item-title"}>
                                        <Text variant="bodyMd" fontWeight="bold"
                                          as="h3">
                                          {title}
                                        </Text>
                                      </span>
                                      <Tooltip content="Delete product"
                                        dismissOnMouseOut
                                        preferredPosition="above"><Button
                                          icon={DeleteIcon}
                                          onClick={() => onDeleteCollection(id)} />
                                      </Tooltip>
                                    </InlineStack>
                                  </ResourceItem>
                                );
                              }}
                            />
                            <span>
                              <Button primary onClick={onOpenCollection}>Add
                                Collection</Button>
                            </span>
                          </Fragment>
                        }
                        {
                          x.type === "4" &&
                          <Grid>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                              <Select value={x.total_condition}
                                onChange={(value) => onChange("total_condition", value, i)}
                                options={[{ label: "Greater than", value: "1" },
                                { label: "Less than", value: "2" },
                                { label: "Between", value: "3" },]} />
                            </Grid.Cell>
                            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                              <InlineStack gap={"200"} wrap={false} blockAlign={"center"}>
                                <TextField type={"number"}
                                  //prefix={currencySymbol[shopDetails.currency]}
                                  value={x.min}
                                  onChange={(value) => onChange("min", value, i)} />
                                {
                                  x.total_condition === "3" ?
                                    <Fragment>
                                      <Text>-</Text>
                                      <TextField type={"number"}
                                        //prefix={currencySymbol[shopDetails.currency]}
                                        value={x.max}
                                        onChange={(value) => onChange("max", value, i)} />
                                    </Fragment> : ''
                                }
                              </InlineStack>
                            </Grid.Cell>
                          </Grid>
                        }
                        {
                          x.type === "5" &&

                          <Combobox
                            allowMultiple
                            activator={
                              <Combobox.TextField
                                autoComplete="off"
                                label="Customer tags"
                                labelHidden
                                value={selectedIndex === i ? value : ""}
                                placeholder="Customer tags"
                                verticalContent={verticalContentMarkup(x.customer_tags ? x.customer_tags : [], i, "customer_tags")}
                                onChange={(e) => onChangeInput(e, i)}
                              />
                            }
                          >
                            {
                              selectedIndex === i && value ? <Listbox
                                autoSelection={AutoSelection.None}
                                onSelect={(selected) => updateSelection(selected, i, "customer_tags")}
                                enableKeyboardControl={true}
                              >
                                <Listbox.Action value={value}>Add customer
                                  tag</Listbox.Action>
                              </Listbox> : null
                            }
                          </Combobox>
                        }
                        {
                          x.type === "6" &&
                          <Combobox
                            allowMultiple
                            activator={
                              <Combobox.TextField
                                autoComplete="off"
                                label="Product tags"
                                labelHidden
                                value={selectedIndex === i ? value : ""}
                                placeholder="Product tags"
                                verticalContent={verticalContentMarkup(x.product_tags, i, "product_tags")}
                                onChange={(e) => onChangeInput(e, i)}
                              />
                            }
                          >
                            {
                              selectedIndex === i && value ? <Listbox
                                autoSelection={AutoSelection.None}
                                onSelect={(selected) => updateSelection(selected, i, "product_tags")}
                                enableKeyboardControl={true}
                              >

                                <Listbox.Action value={value}>Add customer
                                  tag</Listbox.Action>
                              </Listbox> : null
                            }

                          </Combobox>

                        }
                        {
                          (quoteCondition.length > 1 && quoteCondition.length - 1 !== i) ?
                            <span>AND</span>
                            : ''
                        }


                      </Fragment>
                    );
                  })
                }
                <Checkbox
                  label="Show Request a quote instead of Add to cart button"
                  checked={isAddToCartQuotes === "1"}
                  onChange={(checked) => setIsAddToCartQuotes(checked ? "1" : "0")} />
                {isAddToCartQuotes === "1" && (
                  <TextField
                    label="Add to cart classname"
                    value={addtocartClassname}
                    onChange={(value) => setAddtocartClassname(value)}
                    autoComplete="off"
                    helpText="Enter the classname to hide the Add to cart button when the quote button is outside the form."
                  />
                )}
                {
                  quoteCondition.length === 5 ? "" :
                    <span><Button primary onClick={onAddNewRule}>Add New Rule</Button></span>
                }
              </BlockStack>
            </Card>

          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap={"400"}>
                <Text id="storeDetails" variant="headingMd" as="h2">
                  View all the requested form fields in the drafts
                </Text>
                <Text variant="bodyMd" color="subdued" as="p">
                  Using this "Draft Order Tag" you can view all the requested form field details in
                  your
                  Shopify store's "Drafts" section under "Additional Details" mentioned on the
                  right-hand
                  side of the order.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <BlockStack gap={"400"}>
                <Text variant="headingMd" as="h2">Draft order Tag</Text>
                <Combobox
                  allowMultiple
                  activator={
                    <Combobox.TextField
                      autoComplete="off"
                      label="Draft order Tag"
                      labelHidden
                      value={draftOrderValue}
                      placeholder="Draft order Tag"
                      verticalContent={verticalContentMarkupDraftOrder(draftOrderTags)}
                      onChange={(e) => onChangeInputDraftOrder(e)}
                    />
                  }
                >
                  {
                    draftOrderValue ? <Listbox
                      autoSelection={AutoSelection.None}
                      onSelect={(selected) => updateSelectionDraftOrder(selected)}
                      enableKeyboardControl={true}
                    >
                      <Listbox.Action value={draftOrderValue}>Add Draft Order
                        Tag </Listbox.Action>
                    </Listbox> : null
                  }
                </Combobox>

              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Fragment>
  );
};

export default ButtonCondition;