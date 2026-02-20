import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Button, Card, Collapsible, Icon, Page, Text, Layout, BlockStack, InlineStack, Box, InlineGrid, Grid } from "@shopify/polaris";
import { useNavigate } from "react-router";
import { api } from "../api";
import { ShopContext } from "../providers";
import { XIcon } from "@shopify/polaris-icons";
import DateRangePicker from "../components/DateRangePicker";
import moment from "moment";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function() {
  const time = new Date().getHours();

  const [analytics, setAnalytics] = useState({ clicks: 0, orders: 0, views: 0, clicksList: [], viewsList: [], ordersList: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState({ startDate: moment().subtract(29, 'days'), endDate: moment(), });
  const [selectedDay, setSelectedDay] = useState(`Last 30 Days`);
  const [isOpenOnBoarding, setIsOpenOnBoarding] = useState(true);
  const [selectedBoarding, setSelectedBoarding] = useState(0);
  let navigate = useNavigate();
  const { shop,  setShop} = useContext(ShopContext);
  
  useEffect(() => {
    const getAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await api.getAnalytics({ payload: { shopId: shop.id, startDate: moment(date.startDate).format("YYYY-MM-DD"), endDate: moment(date.endDate).format("YYYY-MM-DD") } });
        let clicksList = [];
        let ordersList = [];
        let viewsList = [];
        const dateFormate = (date) => {
          return new Date(moment(date).format("YYYY-MM-DD"));
        };
        (response.data.orders || []).map((j) => {
          let order = {
            x: dateFormate(j.createdAt),
            y: j.total
          };
          ordersList.push(order);
        });
        (response.data.views || []).map((j) => {
          let click = {
            x: dateFormate(j.createdAt),
            y: j.click
          };
          let views = {
            x: dateFormate(j.createdAt),
            y: j.view
          };
          clicksList.push(click);
          viewsList.push(views);
        });
        setAnalytics({ clicksList, viewsList, ordersList, clicks: response.data.totalClicks, orders: response.data.totalOrder, views: response.data.totalViews, });
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);

      }
    };
    getAnalytics();
  }, [date]);

  const handleCallback = (value, label) => {
    setDate(value);
    setSelectedDay(label);
  };

  const onOpenOnBoarding =  async () => {
    setShop({...shop, onBording: false});
    const updateShop = await api.shopifyShop.updateShop(shop.id, { onBording: false})
    setIsOpenOnBoarding(!isOpenOnBoarding);
  };

  const onRedirect = (link) => {
    navigate(`/${link}`);
  };
  const renderHelp = useCallback(() => {
    return [
      {
        label: "Uncap Help Center", icon: <svg viewBox="0 0 496 496">
          <path fill="#9E4BE0" d="M383.4,152c-1.6,0-3.1-0.5-4.5-1.4c-2.6-1.8-4-4.9-3.4-8l5.3-30.6h-21.4c-13.2,0-24-10.8-24-24V24   c0-13.2,10.8-24,24-24h112c13.2,0,24,10.8,24,24v64c0,13.2-10.8,24-24,24h-21.7l-62.1,38.8C386.4,151.6,384.9,152,383.4,152z" />
          <rect x="51.7" y="268.3" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -194.2781 135.4527)" fill="#9E4BE0" width="29.3" height="67.9" />
          <polygon fill="#9E4BE0" points="208.4,465 231.4,443.9 183.4,395.9 160.3,416.8" />
          <path d="M384,376.4c-6.5-19.4-23-33.7-43.1-37.4l-53.5-9.7v-4.1c9.3-5.4,17.4-12.6,23.8-21.2h16.2c13.2,0,24-10.8,24-24v-96  c0-57.3-46.7-104-104-104s-104,46.7-104,104v56c0,15.4,11,28.3,25.5,31.3c4.5,23,18.9,42.4,38.5,53.8v4.1L154,339  c-20.1,3.7-36.6,18-43.1,37.4l-3.2,9.6l-27.2-27.2c-3.1-3.1-3.1-8.2,0-11.3l31.6-31.6l-59.3-59.3L17,292.3  C6.4,302.9,0.6,316.9,0.6,331.9s5.8,29,16.4,39.6l108.1,108.1c10.6,10.6,24.6,16.4,39.6,16.4s29-5.8,39.3-16.2l39-35.7L230.9,432  h171.7L384,376.4z M247.4,356.7l-24-24v-0.4c7.6,2.4,15.6,3.7,24,3.7s16.4-1.3,24-3.7v0.4L247.4,356.7z M327.4,288h-6.7  c2.3-5.3,4.1-10.9,5.2-16.7c3.4-0.7,6.6-2.1,9.5-3.8V280C335.4,284.4,331.8,288,327.4,288z M327.4,226.2c4.8,2.8,8,7.9,8,13.8  s-3.2,11-8,13.8V226.2z M159.4,240c0-5.9,3.2-11,8-13.8v27.6C162.7,251,159.4,245.9,159.4,240z M167.4,200v9.1  c-2.8,0.7-5.5,1.9-8,3.3V184c0-48.5,39.5-88,88-88s88,39.5,88,88v28.4c-2.5-1.4-5.2-2.6-8-3.3V200h-8c-23.7,0-45.9-9.2-62.6-25.9  l-9.4-9.4l-9.4,9.4c-16.7,16.7-39,25.9-62.6,25.9H167.4z M183.4,256v-40.3c24-1.8,46.4-11.7,64-28.4c17.6,16.7,40,26.6,64,28.4V256  c0,11.7-3.2,22.6-8.7,32h-55.3v16h42.2c-11.3,9.9-26,16-42.2,16C212.1,320,183.4,291.3,183.4,256z M89.4,315.9l-8.7,8.7L44,287.9  l8.7-8.7L89.4,315.9z M164.7,480c-10.7,0-20.7-4.2-28.3-11.7L28.3,360.2c-7.6-7.6-11.7-17.6-11.7-28.3c0-10.7,4.2-20.7,11.7-28.3  l4.4-4.4l36.7,36.7l-0.3,0.3c-9.4,9.4-9.4,24.6,0,33.9l57.4,57.4c4.5,4.5,10.6,7,17,7s12.4-2.5,16.7-6.8l0.6-0.5l36.9,36.9l-4.6,4.2  C185.4,475.8,175.4,480,164.7,480z M209.4,453.3l-36.8-36.8l10.6-9.6l36.7,36.7L209.4,453.3z M214.9,416l-31.2-31.2l-34.6,31.3  c-3,3-8.3,3-11.3,0l-17.5-17.5l5.7-17.2c4.6-13.9,16.4-24.1,30.8-26.7l55.9-10.2l34.7,34.7l34.7-34.7l55.9,10.2  c14.4,2.6,26.2,12.8,30.8,26.7l11.5,34.5H214.9V416z" />
          <rect x="367.4" y="32" fill="#FFFFFF" width="96" height="16" />
          <rect x="367.4" y="64" fill="#FFFFFF" width="64" height="16" />
          <rect x="447.4" y="64" fill="#FFFFFF" width="16" height="16" />
          <path d="M75.5,198.9l-8.2-13.7l-21.7,13C68.3,105.9,151.3,40,247.4,40c21,0,41.8,3.1,61.6,9.3l4.7-15.3c-21.4-6.6-43.7-10-66.4-10  c-104.5,0-194.6,72.3-218,173.2l-15.2-25.3l-13.7,8.2L28.7,227L75.5,198.9z" />
          <path d="M491.5,177.1L444.7,149l-28.1,46.9l13.7,8.2l14-23.3c7.4,21.6,11.1,44.1,11.1,67.2c0,47.6-16.5,94.1-46.4,131l12.4,10.1  c32.2-39.7,50-89.8,50-141c0-24.5-3.9-48.4-11.6-71.2l23.5,14.1L491.5,177.1z" />
        </svg>, subText: 'Visit our Help Center and get your questions answered in no time!', buttonText: 'Visit Help Center', link: '/setting/installation'
      },
      {
        label: "Technical Support", icon: <svg viewBox="0 0 496 496">
          <path fill="#9E4BE0" d="M296,342.1L205.8,288H104c-22.1,0-40-17.9-40-40V40c0-22.1,17.9-40,40-40h288c22.1,0,40,17.9,40,40v208  c0,22.1-17.9,40-40,40h-96V342.1z" />
          <path d="M456,112h-24v16h24c13.2,0,24,10.8,24,24v216H16V152c0-13.2,10.8-24,24-24h24v-16H40c-22.1,0-40,17.9-40,40v256  c0,22.1,17.9,40,40,40h104v32h-32v16h272v-16h-32v-32h104c22.1,0,40-17.9,40-40V152C496,129.9,478.1,112,456,112z M336,480H160v-32  h176V480z M456,432H40c-13.2,0-24-10.8-24-24v-24h464v24C480,421.2,469.2,432,456,432z" />
          <path d="M192,400h16v16h-16V400z" />
          <path d="M224,400h48v16h-48V400z" />
          <path d="M288,400h16v16h-16V400z" />
          <path fill="#FFFFFF" d="M152,224h40v-96h-16v-8c0-39.7,32.3-72,72-72s72,32.3,72,72v8h-16v96h16v8c0,4.4-3.6,8-8,8h-41.5  c-3.3-9.3-12.1-16-22.5-16c-13.2,0-24,10.8-24,24c0,13.2,10.8,24,24,24c10.4,0,19.2-6.7,22.5-16H312c13.2,0,24-10.8,24-24v-8h8  c22.1,0,40-17.9,40-40v-16c0-22.1-17.9-40-40-40h-8v-8c0-48.5-39.5-88-88-88s-88,39.5-88,88v8h-8c-22.1,0-40,17.9-40,40v16  C112,206.1,129.9,224,152,224z M248,256c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S252.4,256,248,256z M368,168v16  c0,10.4-6.7,19.2-16,22.5V160h-16v48h-16v-64h24C357.2,144,368,154.8,368,168z M128,168c0-13.2,10.8-24,24-24h24v64h-16v-48h-16  v46.5c-9.3-3.3-16-12.1-16-22.5V168z" />
          <path d="M144,336h16v16h-16V336z" />
          <path d="M32,336h96v16H32V336z" />
          <path d="M32,304h128v16H32V304z" />
          <path d="M448,336h16v16h-16V336z" />
          <path d="M336,336h96v16h-96V336z" />
          <path d="M336,304h128v16H336V304z" />
        </svg>, subText: 'Do check out the help desk to get all your questions answered.', buttonText: 'Technical Support', link: '/support'
      },

    ];
  }, []);
  const renderChartOption = (data) => {
    const options = {
      chart: {
        //  borderWidth: 0,
        //  type: 'areaspline',
        //type: 'line',
        type: 'column',
      },
      tooltip: {
        formatter: function() {
          return '<span>' + this.series.name + ' :<b>' + this.y + '</b></span><br>';
        }
      },
      title: "",
      yAxis: {
        min: 0,
        // tickInterval: tickInterval,
        title: {
          text: ''
        }
      },
      xAxis: {
        type: 'datetime',
        //  min: Date.parse(date.startDate) ,
        // max: Date.parse(date.endDate),
        // min: Date.parse('2016-10-15 03:14:0'),
        // max: Date.parse('2016-10-30 12:14:0')
        // tickInterval: 24 * 25200 * 1000,
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.5
        }
      },
      series: data,
      legend: {
        symbolHeight: 15,
        symbolWidth: 15,
        symbolRadius: 5
      },
    };
    return options;
  };

  const renderData = useCallback(() => {
    let analyticsData = [
      { label: "Total Views", count: analytics.views },
      { label: "Total Clicks", count: analytics.clicks },
      { label: "Total Orders", count: analytics.orders },
    ];
    return analyticsData;
  }, [isLoading]);

  return (
    <Page title={`${time < 12 ? "Good Morning" : time >= 12 && time < 16 ? "Good Afternoon" : "Good Evening"}, ${shop.name}`}
      subtitle={`Happy ${moment(new Date()).format("dddd")} from the Uncap team.`}>
      <Layout>
        <Layout.Section>
          <BlockStack gap={"400"}>
            {
              shop.onBording ? <Card padding={0}>
              <Box padding="400" paddingBlockEnd={0} >
                <InlineStack align={"space-between"}>
                  <Text as="h2" variant="headingSm">
                    Uncap Quotes Request app setting is easy just follow 1 to 3 steps to set up and display quotes on your store.
                  </Text>
                  <div onClick={onOpenOnBoarding} style={{cursor: "pointer"}}>
                    <Icon source={XIcon} />
                  </div>
                </InlineStack>
              </Box>
              <Collapsible
                open={true}
                id="basic-collapsible"
                transition={{ duration: "500ms", timingFunction: "ease-in-out" }}
                expandOnPrint
              >
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <dv className="onBoardingLeft">
                    <ul className="boringListNav">
                      <li className={selectedBoarding === 0 ? "is-active-nav" : ""} onClick={() => setSelectedBoarding(0)}>
                        <span>1</span> Setup code
                      </li>
                      <li className={selectedBoarding === 1 ? "is-active-nav" : ""} onClick={() => setSelectedBoarding(1)}>
                        <span>2</span> Button Conditions
                      </li>
                      <li className={selectedBoarding === 2 ? "is-active-nav" : ""} onClick={() => setSelectedBoarding(2)}>
                        <span>3</span> Start Selling
                      </li>

                    </ul>
                  </dv>

                  <div className="boringListContain">
                    {selectedBoarding === 0 && (
                      <div>
                        <div className="d-flex justify-content-between code-setup-btn mb-3">
                          <Text variant="headingMd" as="h2">Set-Up Code Easily</Text>
                        </div>
                        <p>Set up your quotes code with a single click and get your quotes button.</p>
                        <Button variant={"primary"} onClick={() => onRedirect("installation")}>
                          See Installation Steps
                        </Button>
                      </div>
                    )}
                    {selectedBoarding === 1 && (
                      <div><div className="d-flex justify-content-between code-setup-btn mb-3">
                        <Text variant="headingMd" as="h2">Simply set button conditions to show offers</Text>
                      </div>
                        <p>To set button conditions, give some eligibility rules & set conditions to "Show offer for" based on All Products, Specific Products, Specific Collection, Cart Value Range, Customer Tags, and Product Tags.</p>
                        <Button variant={"primary"} onClick={() => onRedirect("setting/button-condition")}>Button Conditions</Button>
                      </div>
                    )}
                    {selectedBoarding === 2 && (
                      <div>
                        <div className="d-flex justify-content-between code-setup-btn mb-3">
                          <Text variant="headingMd" as="h2">Boost Sales</Text>
                        </div>
                        <p>Double your sales and increase order revenue by selling products together.</p>
                      </div>
                    )}{" "}
                  </div>
                </InlineGrid>
              </Collapsible>
            </Card> : ""
            }
            
            <Grid>
              {
                renderData().map((x, i) => {
                  return (
                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 4, lg: 4, xl: 4 }} key={i}>
                      <Card sectioned>
                        <BlockStack gap={"500"}>
                          <Text variant="headingSm" as="h2">
                            {x.label}
                          </Text>
                          <Text variant="headingMd" as="h2">
                            {x.count}
                          </Text>
                        </BlockStack>
                      </Card>
                    </Grid.Cell>
                  );
                })
              }
            </Grid>
            <DateRangePicker onChange={handleCallback} />
            <Card>
              <HighchartsReact highcharts={Highcharts} options={renderChartOption([
                {
                  name: "Clicks",
                  data: analytics.clicksList,
                  // color: "#7cb5ec",
                },
                {
                  name: "Orders",
                  data: analytics.ordersList,
                  // color: "#434348",
                },
                {
                  name: "Views",
                  data: analytics.viewsList,
                  color: "#00A19FBB",
                },
              ])} />
            </Card>
            <Grid>
              {
                renderHelp().map((x, i) => {
                  return (
                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 6, lg: 6, xl: 6 }}>
                      <Card>
                        <BlockStack className="app_support_box style2">
                          <div className="asb_icon">
                            {x.icon}
                          </div>
                          <BlockStack gap={"400"}>
                            <Text variant="headingLg" as="h5">{x.label}</Text>
                            <Text >
                              <p>{x.subText}</p>
                            </Text>
                            <span>
                              <Button primary
                                onClick={() => navigate(`${x.link}`)}>
                                &nbsp;&nbsp;{x.buttonText}&nbsp;&nbsp;
                              </Button>
                            </span>
                          </BlockStack>
                        </BlockStack>
                      </Card>
                    </Grid.Cell>
                  );
                })
              }
            </Grid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
