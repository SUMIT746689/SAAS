import Head from "next/head";
import { headers } from "next/headers";

export default async function RootLayout({ children }) {

  const headersList = headers();

  return (
      <html lang="en">
        <Head>
          <title>File</title>
        </Head>
        <body >
          {/* <LayoutWrapper> */}
          {children}
        </body>
      </html>
  );




}
