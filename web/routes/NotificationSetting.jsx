import React, { useState, useEffect, useCallback, useMemo, Fragment, useContext } from 'react';
import {
    Page,
    Layout,
    Text,
    Card,
    TextField,
    Toast,
    BlockStack,
    Box,
    Select,
    InlineStack,
    FormLayout,
    Divider,
    Banner,
    List
} from "@shopify/polaris";
import { useNavigate } from "react-router";
import { useAction, useFindFirst } from "@gadgetinc/react";
import { api } from "../api";
import { ShopContext } from "../providers";
import Switch from "../components/Switch";

const NotificationSetting = () => {
    const { shop } = useContext(ShopContext);

    const navigate = useNavigate();
    const [{ data, fetching }, refresh] = useFindFirst(api.quoteSetting);
    const [{ fetching: isSaving }, update] = useAction(api.quoteSetting.update);

    const [createDetails, setCreateDetails] = useState({
        recipient_email: "",
        id: "",
        customer_email_enabled: "1",
        merchant_email_enabled: "1",
        // Customer Email
        customer_subject: "Your Quote Request Has Been Received - [ORDER_NAME]",
        customer_heading: "Quote Request Received",
        customer_greeting: "Hello [CUSTOMER_NAME],",
        customer_instruction: "We've received your quote request [ORDER_NAME].",
        customer_no_items: "No items found.",
        customer_footer_text: "We'll review your request and get back to you shortly.",
        // Merchant Email
        merchant_subject: "New Quote Request Submitted - [ORDER_NAME]",
        merchant_heading: "New Quote Request: [ORDER_NAME]",
        merchant_customer_label: "Customer:",
        merchant_email_label: "Email:",
        merchant_note_label: "Customer Note:",
        merchant_button_text: "View Draft Order",
        merchant_button_color: "#008060",
    });

    const [selected, setSelected] = useState('customer_confirmation');
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ active: false, message: "", error: false });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Load settings from Gadget
    useEffect(() => {
        if (data && !fetching) {
            setCreateDetails({
                recipient_email: data.recipient_email || "",
                id: data.id,
                customer_email_enabled: data.customer_email_enabled ?? "1",
                merchant_email_enabled: data.merchant_email_enabled ?? "1",
                customer_subject: data.customer_subject || "Your Quote Request Has Been Received - [ORDER_NAME]",
                customer_heading: data.customer_heading || "Quote Request Received",
                customer_greeting: data.customer_greeting || "Hello [CUSTOMER_NAME],",
                customer_instruction: data.customer_instruction || "We've received your quote request [ORDER_NAME].",
                customer_no_items: data.customer_no_items || "No items found.",
                customer_footer_text: data.customer_footer_text || "We'll review your request and get back to you shortly.",
                merchant_subject: data.merchant_subject || "New Quote Request Submitted - [ORDER_NAME]",
                merchant_heading: data.merchant_heading || "New Quote Request: [ORDER_NAME]",
                merchant_customer_label: data.merchant_customer_label || "Customer:",
                merchant_email_label: data.merchant_email_label || "Email:",
                merchant_note_label: data.merchant_note_label || "Customer Note:",
                merchant_button_text: data.merchant_button_text || "View Draft Order",
                merchant_button_color: data.merchant_button_color || "#008060",
            });
        }
    }, [fetching]);

    const handleSelectChange = useCallback((value) => setSelected(value), []);

    const previewOptions = [
        { label: 'Customer Confirmation Email', value: 'customer_confirmation' },
        { label: 'Merchant Alert Email', value: 'merchant_alert' },
    ];

    const handleChange = (field, value) => {
        setCreateDetails((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        const email = createDetails.recipient_email?.trim();
        if (email && !emailRegex.test(email)) {
            newErrors.recipient_email = "Invalid email address";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            setToast({ active: true, message: "Please fix the errors before saving", error: true });
            return;
        }

        try {
            const res = await update({
                id: createDetails.id,
                recipient_email: createDetails.recipient_email,
                customer_email_enabled: createDetails.customer_email_enabled,
                merchant_email_enabled: createDetails.merchant_email_enabled,
                customer_subject: createDetails.customer_subject,
                customer_heading: createDetails.customer_heading,
                customer_greeting: createDetails.customer_greeting,
                customer_instruction: createDetails.customer_instruction,
                customer_no_items: createDetails.customer_no_items,
                customer_footer_text: createDetails.customer_footer_text,
                merchant_subject: createDetails.merchant_subject,
                merchant_heading: createDetails.merchant_heading,
                merchant_customer_label: createDetails.merchant_customer_label,
                merchant_email_label: createDetails.merchant_email_label,
                merchant_note_label: createDetails.merchant_note_label,
                merchant_button_text: createDetails.merchant_button_text,
                merchant_button_color: createDetails.merchant_button_color,
            });

            if (res?.data) {
                setToast({ active: true, message: "Settings saved successfully", error: false });
            } else if (res.error) {
                setToast({ active: true, message: res.error.message, error: true });
            }
        } catch (err) {
            console.error("Error saving settings:", err);
            setToast({ active: true, message: "Error saving settings", error: true });
        }
    };

    const toastMarkup = toast.active ? (
        <Toast
            content={toast.message}
            error={toast.error}
            onDismiss={() => setToast({ active: false, message: "", error: false })}
            duration={2000}
        />
    ) : null;

    const htmlContent = useMemo(() => {
        const orderName = "#1001";
        const customerName = "John";
        const shopDisplayName = shop?.name ?? "Shop Name";
        const shopDomain = shop?.myshopifyDomain ?? "shop.domain";
        const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

        const replacePlaceholders = (text, defaultText = "") => {
            if (!text) return defaultText;
            return text
                .replace(/\[ORDER_NAME\]|ORDER_NAME/g, `<strong>${orderName}</strong>`)
                .replace(/\[CUSTOMER_NAME\]|CUSTOMER_NAME/g, customerName);
        };

        const generateOrderSummaryHtml = (isEmpty = false) => {
            const noItemsText = createDetails.customer_no_items || "No items found.";

            const itemsHtml = isEmpty ? "" : `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 15px; font-family: ${fontFamily};">
          <tr>
            <td width="70" valign="top">
              <div style="width:60px; height:60px; background:#f5f5f5; border-radius:6px; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 10px; border: 1px solid #eee;">IMG</div>
            </td>
            <td valign="top" style="padding-left: 15px;">
              <div style="font-size: 14px; font-weight: 600; color: #222; line-height: 1.4;">Sample Product &times; 1</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Size: Medium</div>
            </td>
            <td valign="top" align="right" style="font-size: 14px; font-weight: 600; color: #222; white-space: nowrap;">$10.00</td>
          </tr>
        </table>
      `;

            return `
        <h3 style="margin-top: 35px; margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #222; font-family: ${fontFamily}; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order summary</h3>
        ${itemsHtml || `<p style='color:#666; font-size:14px; text-align:center; font-family: ${fontFamily}; margin: 20px 0;'>${noItemsText}</p>`}
        
        <div style="margin-top: 25px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: ${fontFamily};">
            <tr>
              <td style="font-size: 14px; color: #666; padding: 5px 0;">Subtotal</td>
              <td align="right" style="font-size: 14px; font-weight: 500; color: #222; padding: 5px 0;">$10.00</td>
            </tr>
            <tr>
              <td style="font-size: 16px; font-weight: 600; color: #222; padding: 15px 0 5px 0; border-top: 1px solid #eee;">Total</td>
              <td align="right" style="font-size: 20px; font-weight: bold; color: #222; padding: 15px 0 5px 0; border-top: 1px solid #eee;">$10.00 USD</td>
            </tr>
          </table>
        </div>
      `;
        };

        let content = "";
        const isCustomerEnabled = createDetails.customer_email_enabled === "1";
        const isMerchantEnabled = createDetails.merchant_email_enabled === "1";

        if (selected === 'customer_confirmation') {
            if (!isCustomerEnabled) {
                content = `<div style="padding: 40px; text-align: center; font-family: ${fontFamily}; color: #777;">Customer Confirmation Email is currently <strong>disabled</strong>.</div>`;
            } else {
                content = `
          <div style="font-family: ${fontFamily}; max-width: 600px; margin: auto; padding: 40px 20px; color: #333; line-height: 1.6;">
            <h2 style="font-size: 26px; font-weight: bold; color: #111; margin: 0 0 25px 0; text-align: left;">${replacePlaceholders(createDetails.customer_heading, "Quote Request Received")}</h2>
            <p style="font-size: 15px; margin: 0 0 15px 0;">${replacePlaceholders(createDetails.customer_greeting, `Hello ${customerName},`)}</p>
            <p style="font-size: 15px; margin: 0 0 25px 0;">${replacePlaceholders(createDetails.customer_instruction, `We've received your quote request <strong>${orderName}</strong>.`)}</p>

            ${generateOrderSummaryHtml()}

            <p style="margin-top: 40px; font-size: 15px; color: #555;">${replacePlaceholders(createDetails.customer_footer_text, "We'll review your request and get back to you shortly.")}</p>
            <div style="font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 25px; text-align: center;">
              Sent by ${shopDisplayName} (${shopDomain})
            </div>
          </div>
        `;
            }
        } else {
            if (!isMerchantEnabled) {
                content = `<div style="padding: 40px; text-align: center; font-family: ${fontFamily}; color: #777;">Merchant Alert Email is currently <strong>disabled</strong>.</div>`;
            } else {
                content = `
          <div style="font-family: ${fontFamily}; max-width: 600px; margin: auto; padding: 40px 20px; color: #333; line-height: 1.6;">
            <h2 style="font-size: 26px; font-weight: bold; color: #111; margin: 0 0 25px 0;">${replacePlaceholders(createDetails.merchant_heading, `New Quote Request: ${orderName}`)}</h2>
            
            <div>
              <p style="font-size: 14px; margin: 0 0 8px 0; color: #666;">
                <strong style="color: #333; min-width: 100px; display: inline-block;">${replacePlaceholders(createDetails.merchant_customer_label, "Customer:")}</strong> John Doe
              </p>
              <p style="font-size: 14px; margin: 0 0 8px 0; color: #666;">
                <strong style="color: #333; min-width: 100px; display: inline-block;">${replacePlaceholders(createDetails.merchant_email_label, "Email:")}</strong> john@example.com
              </p>
              <p style="font-size: 14px; margin: 0; color: #666;">
                <strong style="color: #333; min-width: 100px; display: inline-block;">${replacePlaceholders(createDetails.merchant_note_label, "Customer Note:")}</strong> Please deliver before Friday.
              </p>
            </div>

            ${generateOrderSummaryHtml()}

            <div style="margin-top: 45px; text-align: center;">
              <a href="#" 
                 style="background-color: ${createDetails.merchant_button_color || '#008060'}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                 ${replacePlaceholders(createDetails.merchant_button_text, "View Draft Order")}
              </a>
            </div>
          </div>
        `;
            }
        }

        return `
      <html>
        <body style="margin: 0; background-color: #fff;">
          <div style="max-width: 600px; margin: auto;">
            ${content}
          </div>
        </body>
      </html>
    `;
    }, [createDetails, selected, shop]);

    return (
        <Page
            title="Notification Settings"
            backAction={{ content: 'Settings', onAction: () => navigate(`/setting`) }}
            primaryAction={{
                content: 'Save',
                onAction: handleSubmit,
                loading: isSaving,
            }}
        >
            {toastMarkup}
            <BlockStack gap="400">
                <Banner title="Available Variables" status="info">
                    <p>You can use the following variables in your subject lines, headings, and greetings to personalize your emails:</p>
                    <List type="bullet">
                        <List.Item><strong>[ORDER_NAME]</strong>: Replaced with the Draft Order Name (e.g., #1001).</List.Item>
                        <List.Item><strong>[CUSTOMER_NAME]</strong>: Replaced with the Customer's First Name.</List.Item>
                    </List>
                </Banner>
                <Layout>

                    <Layout.Section variant="oneThird">
                        <BlockStack gap="400">

                            <Card>
                                <FormLayout>
                                    <Text variant="headingMd" as="h2">General Notification Settings</Text>
                                    <TextField
                                        label="Recipient Email"
                                        type="email"
                                        value={createDetails.recipient_email}
                                        onChange={(v) => handleChange("recipient_email", v)}
                                        error={errors.recipient_email}
                                        autoComplete="email"
                                        helpText="The email address that receives new quote alerts."
                                    />
                                </FormLayout>
                            </Card>

                            <Card>
                                <BlockStack gap="400">
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Text variant="headingMd" as="h2">Customer Confirmation Email</Text>
                                        <Switch
                                            label=""
                                            checked={createDetails.customer_email_enabled === "1"}
                                            onChange={(v) => handleChange("customer_email_enabled", v ? "1" : "0")}
                                        />
                                    </InlineStack>

                                    {createDetails.customer_email_enabled === "1" && (
                                        <FormLayout>
                                            <TextField
                                                label="Subject Line"
                                                value={createDetails.customer_subject}
                                                onChange={(v) => handleChange("customer_subject", v)}
                                                multiline={2}
                                            />
                                            <TextField
                                                label="Heading"
                                                value={createDetails.customer_heading}
                                                onChange={(v) => handleChange("customer_heading", v)}
                                            />
                                            <TextField
                                                label="Greeting"
                                                value={createDetails.customer_greeting}
                                                onChange={(v) => handleChange("customer_greeting", v)}
                                            />
                                            <TextField
                                                label="Instructions Text"
                                                value={createDetails.customer_instruction}
                                                onChange={(v) => handleChange("customer_instruction", v)}
                                                multiline={2}
                                            />
                                            <TextField
                                                label="No Items Found Message"
                                                value={createDetails.customer_no_items}
                                                onChange={(v) => handleChange("customer_no_items", v)}
                                            />
                                            <TextField
                                                label="Footer Message"
                                                value={createDetails.customer_footer_text}
                                                onChange={(v) => handleChange("customer_footer_text", v)}
                                                multiline={2}
                                            />
                                        </FormLayout>
                                    )}
                                </BlockStack>
                            </Card>

                            <Card>
                                <BlockStack gap="400">
                                    <InlineStack align="space-between" blockAlign="center">
                                        <Text variant="headingMd" as="h2">Merchant Alert Email</Text>
                                        <Switch
                                            label=""
                                            checked={createDetails.merchant_email_enabled === "1"}
                                            onChange={(v) => handleChange("merchant_email_enabled", v ? "1" : "0")}
                                        />
                                    </InlineStack>

                                    {createDetails.merchant_email_enabled === "1" && (
                                        <FormLayout>
                                            <TextField
                                                label="Subject Line"
                                                value={createDetails.merchant_subject}
                                                onChange={(v) => handleChange("merchant_subject", v)}
                                                multiline={2}
                                            />
                                            <TextField
                                                label="Heading"
                                                value={createDetails.merchant_heading}
                                                onChange={(v) => handleChange("merchant_heading", v)}
                                            />
                                            <InlineStack gap="400" wrap={false}>
                                                <Box width="50%">
                                                    <TextField
                                                        label="Customer Label"
                                                        value={createDetails.merchant_customer_label}
                                                        onChange={(v) => handleChange("merchant_customer_label", v)}
                                                    />
                                                </Box>
                                                <Box width="50%">
                                                    <TextField
                                                        label="Email Label"
                                                        value={createDetails.merchant_email_label}
                                                        onChange={(v) => handleChange("merchant_email_label", v)}
                                                    />
                                                </Box>
                                            </InlineStack>
                                            <TextField
                                                label="Note Legend"
                                                value={createDetails.merchant_note_label}
                                                onChange={(v) => handleChange("merchant_note_label", v)}
                                            />
                                            <Divider />
                                            <Text variant="headingSm" as="h3">Action Button</Text>
                                            <TextField
                                                label="Button Text"
                                                value={createDetails.merchant_button_text}
                                                onChange={(v) => handleChange("merchant_button_text", v)}
                                            />
                                            <TextField
                                                label="Button Color (Hex)"
                                                value={createDetails.merchant_button_color}
                                                onChange={(v) => handleChange("merchant_button_color", v)}
                                            />
                                        </FormLayout>
                                    )}
                                </BlockStack>
                            </Card>
                        </BlockStack>
                    </Layout.Section>

                    <Layout.Section>
                        <Card>
                            <BlockStack gap="400">
                                <InlineStack align="space-between" blockAlign="center">
                                    <Text variant="headingMd" as="h2">Live Preview</Text>
                                    <Select
                                        label="Select template to preview"
                                        labelHidden
                                        options={previewOptions}
                                        onChange={handleSelectChange}
                                        value={selected}
                                    />
                                </InlineStack>
                                <div
                                    style={{
                                        border: '1px solid #dfe3e8',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        height: '750px',
                                        backgroundColor: '#f6f6f7'
                                    }}
                                >
                                    <iframe
                                        title="Email Preview"
                                        srcDoc={htmlContent}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            border: "none",
                                            backgroundColor: "#fff",
                                        }}
                                    />
                                </div>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </BlockStack>
        </Page>
    );
};

export default NotificationSetting;
