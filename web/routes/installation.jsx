import React, { useState, Fragment, useContext } from 'react';
import { Button, Card, Page, Divider, Toast, BlockStack, Text, Grid, Link, Tabs, Collapsible, Box } from "@shopify/polaris";
import { ShopContext } from "../providers";
import { useAction, useFindFirst } from "@gadgetinc/react";
import { api } from "../api";

const Installation = () => {
  //const shopDetails = useSelector((state) => state.shopDetails);
  const [message, setMessage] = useState('');
  const [activeMessage, setActiveMessage] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);
  const { shop } = useContext(ShopContext);
  const [{ data: activeTheme }, refresh] = useFindFirst(api.shopifyTheme, {
    filter: { role: { equals: "main" } },
  });
  const [{ data: product }] = useFindFirst(api.shopifyProduct, {
    filter: { status: { equals: "active" } },
    select: { handle: true }
  });

  let storeUrl = `https://${shop.myshopifyDomain}/admin/themes`;
  let imageUrl = '/images/';

  const productQuoteSnippet = `<div
  class="uc-add-to-quotes"
  data-product-id="{{ product.id }}"
  data-variant-id="{{ product.selected_or_first_available_variant.id }}"
  data-product-handle="{{ product.handle }}"
></div>`;


  const tabs = [
    {
      id: '1',
      content: 'Manual Install',
      panelID: 'manual_install',
    },
    {
      id: '2',
      content: 'Setting up code for the Online Store 2.0 Shopify theme',
      panelID: 'online_store',
    }
  ];

  const settingUpCodeArray = [
    {
      id: 1,
      title: "Enable Uncap Quotes Request App",
      description: "Click the button below to enable \"Uncap Quotes Request\" on your Shopify store.",
      button: "Enable Uncap Quotes Request",
      imgUrl: `${imageUrl}app_image.png`
    },
    {
      id: 2,
      title: "Add \"Request a Quote\" block on the product page",
      description: "Click the button below to add a \"Request a Quote\" block to the product page.",
      button: "Add Block on Product Page",
      imgUrl: `${imageUrl}product_image.png`,
      shortCode: productQuoteSnippet,
      shortCodeDescription: '<b>Add this shortcode</b> to display the "Request a Quote" block anywhere on your store pages.'
    },
    {
      id: 3,
      title: "Add \"Request a Quote\" block on the cart page",
      description: "Click the button below to add a \"Request a Quote\" block to the cart page.",
      button: "Add Block on Cart Page",
      imgUrl: `${imageUrl}cart_image.png`
    },
    {
      id: 4,
      title: "Add Quote Order Requests to Customer Account",
      description: "Allow customers to track their quote requests and view their quote details directly from their account portal.<br><br><b>Steps to Enable:</b><br> 1. Navigate to <b>Themes &rarr; Customize</b>.<br> 2. Click on <b>'Apps'</b> in the left sidebar.<br> 3. Select <b>'Uncap Quote Requests'</b> from the app list.<br> 4. Click on <b>'Quote Order Requests'</b> and enable it.",
      button: "Enable Quote Order Requests Page",
      imgUrl: `${imageUrl}customer_account_image.png`
    }
  ];

  const handleNavigate = (value) => {
    const appId = "57e80362-5a6c-4809-a9c4-1cddc032ad44";
    switch (value) {
      case 1:
        window.open(`${storeUrl}/${activeTheme.id}/editor?context=apps&activateAppId=${appId}/quote-script`, "_blank");
        break;
      case 2:
        window.open(`${storeUrl}/current/editor?context=apps&previewPath=/products/${product.handle}&addAppBlockId=${appId}/quote-product&target=mainSection`, "_blank");
        break;
      case 3:
        window.open(`${storeUrl}/current/editor?previewPath=/cart&addAppBlockId=${appId}/quote-cart&target=mainSection`, "_blank");
        break;
      case 4:
        const shopHandle = shop.myshopifyDomain.replace(".myshopify.com", "");
        window.open(`https://admin.shopify.com/store/${shopHandle}/settings/checkout`, "_blank");
        break;
      default:
        break;
    }
  };


  const onCopySnippet = async (stepId, snippetText) => {
    try {
      await navigator.clipboard.writeText(snippetText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = snippetText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopiedSnippetId(stepId);
    setMessage("Snippet copied to clipboard");
    setActiveMessage(true);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const toggleActive = () => {
    setActiveMessage((activeMessage) => !activeMessage);
    setMessage('');
  };

  const toastMarkup = activeMessage ? (
    <Toast content={message} onDismiss={toggleActive} duration={5000} />
  ) : null;

  return (
    <Page title={"Installation instructions"}>
      {toastMarkup}
      <BlockStack gap={"400"}>
        {/*<Card padding={"0"}>*/}
        {/*    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}></Tabs>*/}
        {/*</Card>*/}

        {/*<BlockStack gap={"400"}>*/}
        {/*    <Card>*/}
        {/*        <BlockStack gap={"400"}>*/}
        {/*            <Text as="h2" variant="headingSm">Configure Uncap Quote widget on your theme</Text>*/}
        {/*            <Grid>*/}
        {/*                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
        {/*                    <Text>Please click <Link removeUnderline url={shopDetails.on_boardig.extension} target="_blank">here</Link> to activate embedded block of Uncap Quote widget from your theme settings. You can deactivate it anytime.</Text>*/}
        {/*                </Grid.Cell>*/}
        {/*                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
        {/*                        <a href={`${imageUrl}theme_extension.png`} target="_blank">*/}
        {/*                            <img src={`${imageUrl}theme_extension.png`} className="theme_extension"/>*/}
        {/*                        </a>*/}
        {/*                </Grid.Cell>*/}
        {/*            </Grid>*/}
        {/*        </BlockStack>*/}
        {/*    </Card>*/}
        {/*    <Card>*/}
        {/*        <BlockStack gap={"400"}>*/}
        {/*            <Text as="h2" variant="headingSm">How to show Add to Quote Button on product page?</Text>*/}
        {/*            <Grid>*/}
        {/*                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
        {/*                    <BlockStack gap={"200"}>*/}
        {/*                        <Text>First, please open the Shopify store admin. Click on the "<strong>Online Store => Themes</strong>". Click the "<strong>Actions => Edit code</strong>" of the theme in which you want to add the code. Please check the screenshot for more detail.</Text>*/}
        {/*                        <Text>Open the "<Link removeUnderline url={`${storeUrl}/?key=sections/main-product.liquid`} target="_blank"><strong>main-product.liquid</strong></Link>" file (<strong>Sections => main-product.liquid</strong>).<br/> Please add the below code where you want to show Quote Button on cart page.</Text>*/}
        {/*                        <div className="copy-code mt-4" id='step_8'>*/}
        {/*                            <input readOnly="" className="cc-input-text"*/}
        {/*                                   type="text"*/}
        {/*                                   id="step_8_SectionKey"*/}
        {/*                                   tabIndex="-1"*/}
        {/*                                   name='shortCode'*/}
        {/*                                   value={`<div class="uc-add-to-quotes"></div>`}/>*/}
        {/*                            <button className="cc-copy" onClick={() => onCopyTestimonialSectionKey('step_8', 'step_8_SectionKey')}>*/}
        {/*                                <svg viewBox="0 0 20 20" className="cc-copy-icon">*/}
        {/*                                    <path fillRule="nonzero" d="M2.75 18.25H14a.75.75 0 1 1 0 1.5H2a.75.75 0 0 1-.75-.75V5a.75.75 0 0 1 1.5 0v13.25zM6 .25h12a.75.75 0 0 1 .75.75v14a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V1A.75.75 0 0 1 6 .25zm.75 1.5v12.5h10.5V1.75H6.75z"/>*/}
        {/*                                </svg>*/}
        {/*                                <svg className="cc-true-icon" viewBox="0 0 20 20">*/}
        {/*                                    <path fillRule="nonzero" d="M15.948 5.47a.75.75 0 1 1 1.06 1.06l-8.485 8.486a.75.75 0 0 1-1.06 0L3.22 10.773a.75.75 0 0 1 1.06-1.06l3.713 3.712 7.955-7.955z"/>*/}
        {/*                                </svg>*/}
        {/*                            </button>*/}
        {/*                        </div>*/}
        {/*                    </BlockStack>*/}
        {/*                    <br></br>*/}
        {/*                </Grid.Cell>*/}
        {/*                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
        {/*                        <a href={`${imageUrl}product_extension.png`} target="_blank">*/}
        {/*                            <img src={`${imageUrl}product_extension.png`} className="theme_extension"/>*/}
        {/*                        </a>*/}
        {/*                </Grid.Cell>*/}
        {/*            </Grid>*/}
        {/*        </BlockStack>*/}
        {/*    </Card>*/}
        {/*    <Card>*/}
        {/*        <BlockStack gap={"400"}>*/}
        {/*            <Text as="h2" variant="headingSm">How to show Quote Button on cart page?</Text>*/}
        {/*            <Grid>*/}
        {/*                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
        {/*                    <BlockStack gap={"200"}>*/}
        {/*                        <Text>First, please open the Shopify store admin. Click on the "<strong>Online Store => Themes</strong>". Click the "<strong>Actions => Edit code</strong>" of the theme in which you want to add the code. Please check the screenshot for more detail.</Text>*/}
        {/*                        <Text>Open the "<Link removeUnderline url={`${storeUrl}/?key=sections/main-cart-footer.liquid`} target="_blank"><strong>main-cart-footer.liquid</strong></Link>" file (<strong>Sections => main-cart-footer.liquid</strong>).<br/> Please add the below code where you want to show Quote Button on cart page.</Text>*/}
        {/*                        <div className="copy-code" id='step_7'>*/}
        {/*                            <input readOnly="" className="cc-input-text"*/}
        {/*                                   type="text"*/}
        {/*                                   id="step_7_SectionKey"*/}
        {/*                                   tabIndex="-1"*/}
        {/*                                   name='shortCode'*/}
        {/*                                   value={`<div class="uc-request-quotes"></div>`}/>*/}
        {/*                            <button className="cc-copy" onClick={() => onCopyTestimonialSectionKey('step_7', 'step_7_SectionKey')}>*/}
        {/*                                <svg viewBox="0 0 20 20" className="cc-copy-icon">*/}
        {/*                                    <path fillRule="nonzero" d="M2.75 18.25H14a.75.75 0 1 1 0 1.5H2a.75.75 0 0 1-.75-.75V5a.75.75 0 0 1 1.5 0v13.25zM6 .25h12a.75.75 0 0 1 .75.75v14a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V1A.75.75 0 0 1 6 .25zm.75 1.5v12.5h10.5V1.75H6.75z"/>*/}
        {/*                                </svg>*/}
        {/*                                <svg className="cc-true-icon" viewBox="0 0 20 20">*/}
        {/*                                    <path fillRule="nonzero" d="M15.948 5.47a.75.75 0 1 1 1.06 1.06l-8.485 8.486a.75.75 0 0 1-1.06 0L3.22 10.773a.75.75 0 0 1 1.06-1.06l3.713 3.712 7.955-7.955z"/>*/}
        {/*                                </svg>*/}
        {/*                            </button>*/}
        {/*                        </div>*/}
        {/*                    </BlockStack>*/}
        {/*                </Grid.Cell>*/}
        {/*                <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>*/}
        {/*                        <a href={`${imageUrl}cart_extension.png`} target="_blank">*/}
        {/*                            <img src={`${imageUrl}cart_extension.png`} className="theme_extension"/>*/}
        {/*                        </a>*/}
        {/*                </Grid.Cell>*/}
        {/*            </Grid>*/}
        {/*        </BlockStack>*/}

        {/*    </Card>*/}
        {/*</BlockStack>*/}
        <Card padding={"0"}>
          <BlockStack gap={"0"}>


            {
              (settingUpCodeArray || []).map((x, index) => {
                return (
                  <Fragment key={x.id}>
                    <Box padding={"400"}>
                      <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                          <BlockStack gap={"400"}>
                            <Text as="h2" variant="headingSm">{x.title}</Text>
                            <div
                              dangerouslySetInnerHTML={{ __html: x.description }}
                              style={{ color: 'var(--p-color-text)', fontSize: 'var(--p-font-size-200)' }}
                            />
                            <span><Button onClick={() => handleNavigate(x?.id)} variant={"primary"}>{x.button}</Button></span>
                            {x.shortCode && (
                              <>
                                <div
                                  dangerouslySetInnerHTML={{ __html: x.shortCodeDescription }}
                                  style={{ color: 'var(--p-color-text)', fontSize: 'var(--p-font-size-200)' }}
                                />
                                <BlockStack gap={"200"}>
                                  <div className="copy-code" id={`copy-snippet-${x.id}`}>
                                    <textarea
                                      readOnly
                                      className="cc-input-text cc-snippet-textarea"
                                      rows={5}
                                      value={x.shortCode}
                                      aria-label="Product page add to quote snippet"
                                    />
                                    <button
                                      type="button"
                                      className={`cc-copy${copiedSnippetId === x.id ? " copied" : ""}`}
                                      onClick={() => onCopySnippet(x.id, x.shortCode)}
                                      aria-label="Copy snippet"
                                    >
                                      <svg viewBox="0 0 20 20" className="cc-copy-icon" aria-hidden="true">
                                        <path fillRule="nonzero" d="M2.75 18.25H14a.75.75 0 1 1 0 1.5H2a.75.75 0 0 1-.75-.75V5a.75.75 0 0 1 1.5 0v13.25zM6 .25h12a.75.75 0 0 1 .75.75v14a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V1A.75.75 0 0 1 6 .25zm.75 1.5v12.5h10.5V1.75H6.75z" />
                                      </svg>
                                      <svg className="cc-true-icon" viewBox="0 0 20 20" aria-hidden="true" >
                                        <path fillRule="nonzero" d="M15.948 5.47a.75.75 0 1 1 1.06 1.06l-8.485 8.486a.75.75 0 0 1-1.06 0L3.22 10.773a.75.75 0 0 1 1.06-1.06l3.713 3.712 7.955-7.955z" />
                                      </svg>
                                    </button>
                                  </div>
                                </BlockStack>
                              </>
                            )}
                          </BlockStack>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                          {/*<figure className='theme_screenshot'>*/}
                          <a href={x.imgUrl} target="_blank">
                            <img src={x.imgUrl} className="theme_extension" />
                          </a>
                          {/*</figure>*/}
                        </Grid.Cell>
                      </Grid>
                    </Box>
                    {
                      settingUpCodeArray.length === index + 1 ? "" : <Divider />
                    }
                  </Fragment>
                );
              })
            }
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
};

export default Installation;