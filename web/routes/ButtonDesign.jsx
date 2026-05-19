import React, { useState, useEffect, Fragment, useCallback } from 'react';
import {
    Page,
    Layout,
    Text,
    Card,
    TextField,
    Checkbox,
    Toast,
    Select,
    PageActions,
    Tabs,
    BlockStack,
    FormLayout,
    Divider,
    Box
} from "@shopify/polaris"
import Label from "../components/Label";
import ColorInput from "../components/ColorInput";
import { useNavigate } from "react-router";
import { useAction, useFindFirst } from "@gadgetinc/react";
import { api } from "../api";

const initialState = {
    id: "",
    is_quote_enable: "",
    quote_popup_title: "",
    quote_popup_heading: "",
    quote_popup_title_align: "",
    quote_popup_heading_align: "",
    quote_popup_title_color: "",
    quote_popup_heading_color: "",
    quote_submit_button_text: "",
    quote_submit_button_color: "",
    quote_submit_button_background_color: "",
    quote_close_button_color: "",
    quote_cancel_button_color: "",
    quote_cancel_button_text: "",
    quote_button_text: "",
    quote_button_color: "",
    quote_button_background_color: "",
    quote_button_hover_background_color: "",
    quote_button_hover_color: "",
    quote_button_font_style: "",
    is_effect_quote_button: "",
    // is_add_to_cart_quotes: '',
    add_to_cart_btn_text: '',
    add_to_cart_btn_bg_color: '',
    add_to_cart_btn_text_color: '',
    add_to_cart_btn_border_color: '',
    add_to_cart_btn_bg_hover_color: '',
    add_to_cart_btn_text_hover_color: '',
    add_to_cart_btn_border_hover_color: '',
    add_to_cart_btn_font: '',
    add_to_cart_redirect: '3',
    is_redirect: '',
    redirect_page: '',
};


const ButtonDesign = () => {
    const [setting, setSetting] = useState(initialState);
    const [isSave, setIsSave] = useState(false);
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [selected, setSelected] = useState(0);
    const [fontList, setFontList] = useState([]);
    let navigate = useNavigate()
    const [{ data }, refresh] = useFindFirst(api.setting);
    const [{ }, update] = useAction(api.setting.update);

    useEffect(() => {
        setSetting({ ...data })
    }, [data]);

    useEffect(() => {
        fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBX73D-SYoUl7-gdw7ZqKyLEnISwALBxZ8')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((res) => {
                let fonts = [{ label: 'Select Font', value: '' }];
                res.items.map((x) => {
                    let obj = {
                        label: x.family,
                        value: x.family
                    }
                    fonts.push(obj)
                })
                setFontList(fonts)
            })
            .catch((error) => {

            });
    }, []);

    const onChange = (name, value) => {
        setSetting({ ...setting, [name]: value })
    };

    const onUpdateSetting = async () => {
        setIsSave(true);
        const response = await update({
            is_quote_enable: setting.is_quote_enable,
            quote_popup_title: setting.quote_popup_title,
            quote_popup_heading: setting.quote_popup_heading,
            quote_popup_title_align: setting.quote_popup_title_align,
            quote_popup_heading_align: setting.quote_popup_heading_align,
            quote_popup_title_color: setting.quote_popup_title_color,
            quote_popup_heading_color: setting.quote_popup_heading_color,
            quote_submit_button_text: setting.quote_submit_button_text,
            quote_submit_button_color: setting.quote_submit_button_color,
            quote_submit_button_background_color: setting.quote_submit_button_background_color,
            quote_close_button_color: setting.quote_close_button_color,
            quote_cancel_button_color: setting.quote_cancel_button_color,
            quote_cancel_button_text: setting.quote_cancel_button_text,
            quote_button_text: setting.quote_button_text,
            quote_button_color: setting.quote_button_color,
            quote_button_background_color: setting.quote_button_background_color,
            quote_button_hover_background_color: setting.quote_button_hover_background_color,
            quote_button_hover_color: setting.quote_button_hover_color,
            quote_button_font_style: setting.quote_button_font_style,
            is_effect_quote_button: setting.is_effect_quote_button,
            add_to_cart_btn_text: setting.add_to_cart_btn_text,
            add_to_cart_btn_bg_color: setting.add_to_cart_btn_bg_color,
            add_to_cart_btn_text_color: setting.add_to_cart_btn_text_color,
            add_to_cart_btn_border_color: setting.add_to_cart_btn_border_color,
            add_to_cart_btn_bg_hover_color: setting.add_to_cart_btn_bg_hover_color,
            add_to_cart_btn_text_hover_color: setting.add_to_cart_btn_text_hover_color,
            add_to_cart_btn_border_hover_color: setting.add_to_cart_btn_border_hover_color,
            add_to_cart_btn_font: setting.add_to_cart_btn_font,
            add_to_cart_redirect: setting.add_to_cart_redirect,
            is_redirect: setting.is_redirect,
            redirect_page: setting.redirect_page,
            id: setting.id,
        });
        if (response.error === undefined) {
            setIsSave(false)
            onToastMessage("Button design updated.", false)
        } else {
            setIsSave(false)
        }
    }

    const onToastMessage = (message, error) => {
        setActive(true);
        setError(error);
        setMessage(message);
    }

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

    const tabs = [
        {
            id: 'cart-page',
            content: 'Cart Page',
            accessibilityLabel: 'Cart Page',
            panelID: 'cart-page',
        },
        {
            id: 'product-page',
            content: 'Product Page',
            panelID: 'product-page',
        },
    ]
    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex),
        [],
    );
    return (
        <Fragment>
            {toastMarkup}
            <Page title="Button Design" backAction={{ content: 'Setting', onAction: () => navigate(`/setting`) }}
                primaryAction={{
                    content: 'Save',
                    onAction: onUpdateSetting,
                    loading: isSave
                }}>
                <BlockStack gap={"400"}>
                    <Card padding={"0"}>
                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>
                    </Card>
                    {
                        selected === 0 && <Fragment>
                            <Layout>
                                <Layout.Section variant={"oneThird"}>
                                    <Card>
                                        <BlockStack gap={"400"}>
                                            <Text id="storeDetails" variant="headingMd" as="h2">
                                                Manage settings for the "Get Quote" button on the cart page
                                            </Text>
                                            <Text variant="bodyMd" color="subdued" as="p">
                                                Here you can manage and customize Quote Button Settings, Header & Text
                                                Settings & Button Settings for the "Get Quote" button displayed on the
                                                cart page as per your theme look to make it more appealing.
                                            </Text>
                                        </BlockStack>
                                    </Card>
                                </Layout.Section>
                                <Layout.Section>
                                    <Card padding={"0"}>
                                        <Box padding={"400"}>
                                            <FormLayout>
                                                <FormLayout.Group condensed>
                                                    <TextField label={"Button (Text)"} value={setting.quote_button_text}
                                                        onChange={(value) => onChange("quote_button_text", value)} />
                                                    <Box>
                                                        <Label name={"Button (Text Color)"} />
                                                        <ColorInput name={"quote_button_color"} positon={"left"}
                                                            value={setting.quote_button_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                    <Box>
                                                        <Label name={"Button (BG Color)"} />
                                                        <ColorInput name={"quote_button_background_color"}
                                                            positon={"left"}
                                                            value={setting.quote_button_background_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                </FormLayout.Group>
                                                <FormLayout.Group condensed>
                                                    <Box>
                                                        <Label name={"Button Hover (Text Color)"} />
                                                        <ColorInput name={"quote_button_hover_color"} positon={"right"}
                                                            value={setting.quote_button_hover_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                    <Box>
                                                        <Label name={"Button Hover (BG Color)"} />
                                                        <ColorInput name={"quote_button_hover_background_color"}
                                                            value={setting.quote_button_hover_background_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                    <div className="col col-md-4 col-12 ">
                                                        <Select label={"Font Family"}
                                                            value={setting.quote_button_font_style}
                                                            options={fontList}
                                                            onChange={(value) => onChange("quote_button_font_style", value)} />
                                                    </div>
                                                </FormLayout.Group>

                                                <Checkbox label="Glowing effect button"
                                                    checked={setting.is_effect_quote_button === "1"}
                                                    onChange={(checked) => onChange("is_effect_quote_button", checked ? "1" : "0")} />

                                            </FormLayout>
                                        </Box>
                                        <Divider />
                                        <Box padding={"400"}>
                                            <BlockStack gap={"400"}>
                                                <BlockStack gap={"200"}>
                                                    <Text as="h2" variant="headingSm">HEADER AND TEXT SETTINGS</Text>
                                                    <FormLayout.Group condensed>
                                                        <TextField label={"Title (Text)"}
                                                            value={setting.quote_popup_title}
                                                            onChange={(value) => onChange("quote_popup_title", value)} />
                                                        <Select label="Title (Text align)"
                                                            options={[{ label: "Left", value: "1" }, {
                                                                label: "Right",
                                                                value: "2"
                                                            }, { label: "Center", value: "3" }]}
                                                            onChange={(value) => onChange("quote_popup_title_align", value)}
                                                            value={setting.quote_popup_title_align} />
                                                        <Box>
                                                            <Label name={"Title (Color)"} />
                                                            <ColorInput name={"quote_popup_title_color"}
                                                                value={setting.quote_popup_title_color}
                                                                onChange={onChange} />
                                                        </Box>
                                                    </FormLayout.Group>
                                                </BlockStack>
                                                <FormLayout.Group condensed>

                                                    <TextField label={"Heading (Text)"}
                                                        value={setting.quote_popup_heading}
                                                        onChange={(value) => onChange("quote_popup_heading", value)} />


                                                    <Select label="Heading (Text align)"
                                                        options={[{ label: "Left", value: "1" }, {
                                                            label: "Right",
                                                            value: "2"
                                                        }, { label: "Center", value: "3" }]}
                                                        onChange={(value) => onChange("quote_popup_heading_align", value)}
                                                        value={setting.quote_popup_heading_align} />

                                                    <Box>
                                                        <Label name={"Heading (Color)"} />
                                                        <ColorInput name={"quote_popup_heading_color"}
                                                            value={setting.quote_popup_heading_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                </FormLayout.Group>

                                            </BlockStack>
                                        </Box>
                                        <Divider />

                                        <Box padding={"400"}>
                                            <BlockStack gap={"400"}>
                                                <BlockStack gap={"200"}>
                                                    <Text as="h2" variant="headingSm">BUTTON SETTINGS</Text>
                                                    <FormLayout.Group condensed>
                                                        <TextField label={"Submit Button (Text)"}
                                                            value={setting.quote_submit_button_text}
                                                            onChange={(value) => onChange("quote_submit_button_text", value)} />
                                                        <Box>
                                                            <Label name={"Submit Button (Text Color)"} />
                                                            <ColorInput name={"quote_submit_button_color"}
                                                                positon={"top right"}
                                                                value={setting.quote_submit_button_color}
                                                                onChange={onChange} />
                                                        </Box>
                                                        <Box>
                                                            <Label name={"Submit Button (BG Color)"} />
                                                            <ColorInput name={"quote_submit_button_background_color"}
                                                                positon={"top"}
                                                                value={setting.quote_submit_button_background_color}
                                                                onChange={onChange} />
                                                        </Box>
                                                    </FormLayout.Group>
                                                </BlockStack>
                                                <FormLayout.Group condensed>
                                                    <TextField label={"Cancel Button (Text)"}
                                                        value={setting.quote_cancel_button_text}
                                                        onChange={(value) => onChange("quote_cancel_button_text", value)} />
                                                    <Box>
                                                        <Label name={"Cancel Button (Color)"} />
                                                        <ColorInput name={"quote_cancel_button_color"} positon={"top"}
                                                            value={setting.quote_cancel_button_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                    <Box>
                                                        <Label name={"Close Button (Color)"} />
                                                        <ColorInput name={"quote_close_button_color"} positon={"top"}
                                                            value={setting.quote_close_button_color}
                                                            onChange={onChange} />
                                                    </Box>
                                                </FormLayout.Group>




                                                <Checkbox label="Show Request Form Fields" zg
                                                    checked={setting.is_quote_enable === "1"}
                                                    onChange={(checked) => onChange("is_quote_enable", checked ? "1" : "0")} />
                                            </BlockStack>
                                        </Box>
                                        {/*</Card.Section>*/}
                                        {/*</FormLayout>*/}

                                    </Card>
                                </Layout.Section>

                                <Layout.Section variant="oneThird">
                                    <Card>
                                        <BlockStack gap={"400"}>
                                            <Text id="storeDetails" variant="headingMd" as="h2">
                                                Quotes submitted after redirect settings
                                            </Text>
                                            <Text variant="bodyMd" color="subdued" as="p">
                                                Here you can add a redirect page name where you want to submit all the
                                                quotes details. Doing this all the details will be redirected on the
                                                submitted page.
                                            </Text>
                                        </BlockStack>
                                    </Card>
                                </Layout.Section>
                                <Layout.Section>
                                    <Card title="Redirect page" sectioned>
                                        <div className="row row-5">
                                            <div className="col col-md-12 col-12 ">
                                                <Checkbox label="Redirect page?" checked={setting.is_redirect === "1"}
                                                    onChange={(checked) => onChange("is_redirect", checked ? "1" : "0")} />
                                            </div>
                                            {setting.is_redirect === "1" && <div className="col col-md-6 col-12 mt-2">
                                                <TextField label={"Redirect page name"} value={setting.redirect_page}
                                                    onChange={(value) => onChange("redirect_page", value)} />
                                            </div>
                                            }
                                        </div>
                                    </Card>
                                </Layout.Section>
                            </Layout>
                        </Fragment>
                    }
                    {
                        selected === 1 && <Layout>
                            <Layout.Section variant={"oneThird"}>
                                <Card>
                                    <BlockStack gap={"400"}>
                                        <Text id="storeDetails" variant="headingMd" as="h2">
                                            Manage settings for the "Request a quote" button on the product page
                                        </Text>
                                        <Text variant="bodyMd" color="subdued" as="p">
                                            Here you can manage and customize button text and its text & background
                                            color. Set the button border color, hover text & background color for the
                                            product page and match it with your store's look to make it more attractive.
                                        </Text>
                                    </BlockStack>
                                </Card>
                            </Layout.Section>
                            <Layout.Section variant={""}>
                                <Card sectioned>
                                    <FormLayout>
                                        <FormLayout.Group condensed>
                                            <div className="col col-md-4 col-12 ">
                                                <TextField label={"Button (Text)"} value={setting.add_to_cart_btn_text}
                                                    onChange={(value) => onChange("add_to_cart_btn_text", value)} />
                                            </div>
                                            <div className="col col-md-4 col-12 ">
                                                <Label name={"Button (Text Color)"} />
                                                <ColorInput name={"add_to_cart_btn_text_color"}
                                                    positon={"btn_text_color"}
                                                    value={setting.add_to_cart_btn_text_color}
                                                    onChange={onChange} />
                                            </div>
                                            <div className="col col-md-4 col-12 ">
                                                <Label name={"Button (BG Color)"} />
                                                <ColorInput name={"add_to_cart_btn_bg_color"} positon={"btn_bg_color"}
                                                    value={setting.add_to_cart_btn_bg_color}
                                                    onChange={onChange} />
                                            </div>
                                        </FormLayout.Group>

                                        <FormLayout.Group condensed>
                                            <div className="col col-md-4 col-12 ">
                                                <Label name={"Button (Border Color)"} />
                                                <ColorInput name={"add_to_cart_btn_border_color"}
                                                    positon={"btn_border_color"}
                                                    value={setting.add_to_cart_btn_border_color}
                                                    onChange={onChange} />
                                            </div>
                                            <div className="col col-md-4 col-12 ">
                                                <Label name={"Button Hover (Text Color)"} />
                                                <ColorInput name={"add_to_cart_btn_text_hover_color"}
                                                    positon={"btn_border_color"}
                                                    value={setting.add_to_cart_btn_text_hover_color}
                                                    onChange={onChange} />
                                            </div>
                                            <div className="col col-md-4 col-12 ">
                                                <Label name={"Button Hover (BG Color)"} />
                                                <ColorInput name={"add_to_cart_btn_bg_hover_color"}
                                                    positon={"btn_hover_color"}
                                                    value={setting.add_to_cart_btn_bg_hover_color}
                                                    onChange={onChange} />
                                            </div>

                                        </FormLayout.Group>

                                        <FormLayout.Group condensed>

                                            <div className="col col-md-4 col-12 ">
                                                <Label name={"Button Hover (border Color)"} />
                                                <ColorInput name={"add_to_cart_btn_border_hover_color"}
                                                    positon={"btn_hover_border_color"}
                                                    value={setting.add_to_cart_btn_border_hover_color}
                                                    onChange={onChange} />
                                            </div>

                                            <div className="col col-md-4 col-12 ">
                                                <Select label={"Font Family"} value={setting.add_to_cart_btn_font}
                                                    options={fontList}
                                                    onChange={(value) => onChange("add_to_cart_btn_font", value)} />
                                            </div>

                                        </FormLayout.Group>

                                        <Divider />

                                        <BlockStack gap={"200"}>
                                            <Text as="h2" variant="headingSm">AFTER ADD TO QUOTE</Text>
                                            <Text variant="bodyMd" color="subdued" as="p">
                                                Choose where the customer goes after clicking Add to Quote on the product page.
                                            </Text>
                                            <Select
                                                label="Redirect after add to quote"
                                                value={setting.add_to_cart_redirect || "3"}
                                                options={[
                                                    { label: "Checkout page", value: "1" },
                                                    { label: "Callback", value: "2" },
                                                    { label: "Cart page", value: "3" },
                                                ]}
                                                onChange={(value) => onChange("add_to_cart_redirect", value)}
                                            />
                                        </BlockStack>
                                    </FormLayout>
                                </Card>
                            </Layout.Section>
                        </Layout>
                    }
                </BlockStack>
                <div className="mt-3">
                    <PageActions primaryAction={{
                        content: 'Save',
                        onAction: onUpdateSetting,
                        loading: isSave
                    }} />
                </div>
            </Page>

        </Fragment>
    );
};

export default ButtonDesign;