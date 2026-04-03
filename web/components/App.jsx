import {
  AppType,
  Provider as GadgetProvider,
  useGadget,
} from "@gadgetinc/react-shopify-app-bridge";
import { NavMenu } from "@shopify/app-bridge-react";
import { Box, Card, Page, Spinner, Text, Frame, FooterHelp } from "@shopify/polaris";
import { useEffect } from "react";
import {
  Link,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
  useNavigate,
} from "react-router";
import { api } from "../api";
import Support from "../routes/Support";
import Index from "../routes/index";
import "./App.css";
import Setting from "../routes/setting";
import FormField from "../routes/FormField";
import ButtonDesign from "../routes/ButtonDesign";
import ButtonCondition from "../routes/ButtonCondition";
import QuoteOrder from "../routes/QuoteOrder";
import QuoteOrderDetails from "../routes/QuoteOrderDetails";
import Installation from "../routes/installation";
import PricingPlan from "../routes/PricingPlan";
import NotificationSetting from "../routes/NotificationSetting";
import { ShopProvider } from "../providers";

function Error404() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const appURL = process.env.GADGET_PUBLIC_SHOPIFY_APP_URL;

    if (appURL && location.pathname === new URL(appURL).pathname) {
      navigate("/", { replace: true });
    }
  }, [location.pathname]);

  return <div>404 not found</div>;
}

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="/quote-order" element={<QuoteOrder />} />
        <Route path="/quote-order/:id" element={<QuoteOrderDetails />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/setting/form-field" element={<FormField />} />
        <Route path="/setting/button-design" element={<ButtonDesign />} />
        <Route path="/setting/button-condition" element={<ButtonCondition />} />
        <Route path="/support" element={<Support />} />
        <Route path="/setting/installation" element={<Installation />} />
        <Route path="/setting/pricing-plan" element={<PricingPlan />} />
        <Route path="/setting/notification" element={<NotificationSetting />} />
        <Route path="*" element={<Error404 />} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

function Layout() {
  return (
    <GadgetProvider
      type={AppType.Embedded}
      shopifyApiKey={window.gadgetConfig.apiKeys.shopify}
      api={api}
    >
      <AuthenticatedApp />
    </GadgetProvider>
  );
}

function AuthenticatedApp() {
  // we use `isAuthenticated` to render pages once the OAuth flow is complete!
  const { isAuthenticated, loading } = useGadget();
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    );
  }
  return isAuthenticated ? <EmbeddedApp /> : <UnauthenticatedApp />;
}

function EmbeddedApp() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <>
      <Frame>
        <ShopProvider>
          <Outlet />
          {
            location.pathname === "/support" ? "" :
              <FooterHelp>
                <Text>
                  if you need any help, please{' '}
                  <Link to="/support">
                    Contact us
                  </Link>
                </Text>
              </FooterHelp>
          }
        </ShopProvider>
      </Frame>

      <NavMenu>
        <Link to="/" rel="home">
          Shop Information
        </Link>
        <Link to="/quote-order"> Quote Request</Link>
        <Link to="/setting">Settings</Link>
      </NavMenu>
    </>
  );
}

function UnauthenticatedApp() {
  return (
    <Page>
      <div style={{ height: "80px" }}>
        <Card padding="500">
          <Text variant="headingLg" as="h1">
            App must be viewed in the Shopify Admin
          </Text>
          <Box paddingBlockStart="200">
            <Text variant="bodyLg" as="p">
              Edit this page:{" "}
              <a
                href={`/edit/${process.env.GADGET_PUBLIC_APP_ENV}/files/web/components/App.jsx`}
              >
                web/components/App.jsx
              </a>
            </Text>
          </Box>
        </Card>
      </div>
    </Page>
  );
}

export default App;
