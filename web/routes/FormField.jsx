import React, {useState, useCallback, Fragment} from 'react';
import {
    Page,
    Layout,
    BlockStack,
    Text,
    Card,
    InlineStack,
    Button,
    Modal,
    TextField,
    RadioButton,
    Toast,
} from "@shopify/polaris"
import {EditIcon, DeleteIcon} from "@shopify/polaris-icons";
import {useNavigate} from "react-router";
import {api} from "../api";
import { AutoTable } from "@gadgetinc/react/auto/polaris";
import {useAction} from "@gadgetinc/react";

const initialState = {
    id: "",
    fieldTitle: "",
    fieldType :"1"
}
const FormField = () => {
    const [isSave, setIsSave] = useState(false);
    const [field, setField] = useState(initialState);
    const [isFieldModal, setFieldModal] = useState(false);
    const [isDeleteModal, setDeleteModal] = useState(false);
    const [active, setActive] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    let navigate = useNavigate();
    const [{},create] = useAction(api.formFields.create);
    const [{},update] = useAction(api.formFields.update);
    const [{}, _delete] = useAction(api.formFields.delete);

    const onEdit =async (record) => {
        setField(record);
        setFieldModal(true)
    }

    const onDeleteModal = useCallback((record, index) => {
        setField(record);
        setDeleteModal(true)
    }, []);

    const handleChange = useCallback(() => {
        setFieldModal(!isFieldModal)
        setField(initialState);
    }, [isFieldModal]);

    const handleChangeDelete = useCallback(() => {
        setDeleteModal(!isDeleteModal)
        setField(initialState);
    }, [isDeleteModal]);

    const onChange = (name, value) => {
        setField({...field, [name]: value})
    };

    const onCreateField = async () => {
        setIsSave(true);
        if(field.id){
           const response =  await update({
                fieldTitle: field.fieldTitle,
                fieldType: field.fieldType,
                id: field.id,
               name:field.fieldTitle.toLowerCase().replaceAll(" ", "_")
            });
           if(response.error === undefined){
               setIsSave(false)
               onToastMessage("Form field updated.", false)
           }
        } else {
            const response = await create({
                fieldTitle: field.fieldTitle,
                fieldType: field.fieldType,
                name:field.fieldTitle.toLowerCase().replaceAll(" ", "_")
            });
            if(response.error === undefined){
                setIsSave(false)
                onToastMessage("Form field created.", false)
            }

        }
        setFieldModal(false)
    };

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

    const onDeleteRecord = async () => {
        setIsSave(true);
        const response = await _delete({id: field.id})
        if(response.error === undefined){
            setIsSave(false)
            onToastMessage("Form field deleted.", false)
            setIsSave(false);
        }

        setField(initialState);
        setDeleteModal(false);

    }

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
            {
                toastMarkup
            }
            <Fragment>
                {
                    isFieldModal && <Modal
                        open={isFieldModal}
                        onClose={handleChange}
                        title="Request FormFields Field"
                        primaryAction={{
                            content: 'Save',
                            onAction: onCreateField,
                            loading: isSave
                        }}
                        secondaryActions={[
                            {
                                content: 'Close',
                                onAction: handleChange,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <BlockStack gap={"300"}>
                                <TextField label="Label" value={field.fieldTitle} onChange={(value) => onChange("fieldTitle", value)}/>

                                <BlockStack gap={"0"}>
                                    <RadioButton label="Single line text" checked={field.fieldType == "1"} onChange={() => onChange("fieldType", "1")}/>
                                    <RadioButton label="Multi-line text" checked={field.fieldType == "2"} onChange={() => onChange("fieldType", "2")}/>
                                </BlockStack>
                            </BlockStack>
                        </Modal.Section>
                    </Modal>
                }
            </Fragment>
            <Fragment>
                {
                    isDeleteModal && <Modal
                        open={isDeleteModal}
                        onClose={handleChangeDelete}
                        title="Delete Request FormFields Field"
                        primaryAction={{
                            content: 'Delete',
                            onAction: onDeleteRecord,
                            loading: isSave
                        }}
                        secondaryActions={[
                            {
                                content: 'Close',
                                onAction: handleChangeDelete,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <Text>Are you sure you want to Delete? This action cannot be reversed.</Text>
                        </Modal.Section>
                    </Modal>
                }
            </Fragment>
            <Page title="Form Fields"  backAction={{content: 'Setting', onAction: () => navigate(`/setting`)}} primaryAction={{
                content: 'Create Field',
                onAction: () => setFieldModal(true)
            }}>
                <Layout>
                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap={"400"}>
                                <Text id="storeDetails" variant="headingMd" as="h2">
                                    Quickly create form fields for the cart page
                                </Text>
                                <BlockStack align={"end"}>
                                    <Text variant="bodyMd" color="subdued" as="p">
                                        To create form fields click on "Create Field" give the "Label" name, select the form field type single-line text or multi-line text and click on "Save". Easily creates fields such as Shipping Address, Contact Number, Additional Notes, etc.
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card padding={"0"}>
                            <AutoTable
                                //@ts-ignore
                                model={api.formFields}
                                selectable={false}
                                paginate={false}
                                searchable={false}
                                columns={[
                                    {
                                        header: "Fields Name",
                                        render: ({ record }) => {
                                            // Displays the name like so: A. Turing
                                            return (
                                                <div>{record.fieldTitle}</div>
                                            );
                                        },
                                    },
                                    {
                                        header:<InlineStack gap={"200"} align={"end"}>Actions</InlineStack>,
                                        render: ({ record }) => {
                                            return (
                                                <InlineStack gap={"200"} align={"end"}>
                                                    <Button icon={EditIcon} onClick={() => onEdit({...record})}/>
                                                    <Button icon={DeleteIcon} onClick={() => onDeleteModal({...record})}/>
                                                </InlineStack>
                                            );
                                        },
                                    },

                                ]}

                            />

                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        </Fragment>
    );
};

export default FormField;