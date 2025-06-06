import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";
import { SheetsRegistry, JssProvider, createGenerateId } from "react-jss";

export default class _Document extends Document {
  static async getInitialProps(ctx) {
    const registry = new SheetsRegistry();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App) => (props) =>
          (
            <JssProvider registry={registry} generateId={createGenerateId()}>
              <App {...props} />
            </JssProvider>
          ),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <style id="mantine-ssr-styles">{registry.toString()}</style>
        </>
      ),
    };
  }

  render() {
    return (
      <Html>
        <Head>
          {/* <link rel="icon" href="link to favicon" /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}