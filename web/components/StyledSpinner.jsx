import { Spinner, Page } from "@shopify/polaris";

export default () => {
  return (
    <Page>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Spinner accessibilityLabel="Spinner example" size="large" />
      </div>
    </Page>

  );
};
