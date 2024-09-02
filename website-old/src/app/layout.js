import Head from "next/head";
import { headers } from "next/headers";

export default async function RootLayout({ children }) {

  return (
      <html lang="en">
        <body >
          {children}
        </body>
      </html>
  );




}
