import React, { useState, useEffect, Fragment } from 'react';
import {
    Page,
    Layout,
    Text,
    Card,
    TextField,
    Toast,
    PageActions,
    BlockStack,
    Box
} from "@shopify/polaris"
import { useNavigate } from "react-router";
import { useAction, useFindFirst } from "@gadgetinc/react";
import { api } from "../api";

const NotificationSetting = () => {
    const [recipientEmail, setRecipientEmail] = useState("");
    const [isSave, setIsSave] = useState(false);
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    let navigate = useNavigate();

    const [{ data }, refresh] = useFindFirst(api.quoteSetting);
    const [{ }, update] = useAction(api.quoteSetting.update);

    useEffect(() => {
        if (data) {
            setRecipientEmail(data.recipient_email || "");
        }
    }, [data]);

    const onUpdateSetting = async () => {
        setIsSave(true);
        const response = await update({
            id: data.id,
            recipient_email: recipientEmail,
        });

        if (response.error === undefined) {
            setIsSave(false)
            onToastMessage("Notification settings updated.", false)
        } else {
            setIsSave(false)
            onToastMessage(response.error.message, true)
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

    return (
        <Fragment>
            {toastMarkup}
            <Page
                title="Notification Settings"
                backAction={{ content: 'Settings', onAction: () => navigate(`/setting`) }}
                primaryAction={{
                    content: 'Save',
                    onAction: onUpdateSetting,
                    loading: isSave
                }}
            >
                <Layout>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap={"400"}>
                                <Text variant="headingMd" as="h2">
                                    Email Notifications
                                </Text>
                                <Text variant="bodyMd" color="subdued" as="p">
                                    Specify the email address that should receive notifications when a new quote request is created.
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card padding="400">
                            <BlockStack gap="400">
                                <TextField
                                    label="Recipient Email"
                                    value={recipientEmail}
                                    onChange={(value) => setRecipientEmail(value)}
                                    autoComplete="email"
                                    helpText="This email will receive an alert for every new quote request."
                                />
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </Fragment>
    );
};

export default NotificationSetting;
