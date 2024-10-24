import Head from "next/head";
import { headers } from "next/headers";
import { Nunito } from 'next/font/google'

const nunitoSans = Nunito({
  weight: ['400', "300", "500", "600", "700", "800", "900"],
  subsets: ['cyrillic'],
})

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`${nunitoSans.className} `}  >
        {children}
      </body>
    </html>
  );
}
