import Head from "next/head";

import Buy from "./buy";

export default function Home() {
  return (
    <>
      <Head>
        <title>buy bitcoin</title>
        <meta name="description" content="buy bitcoin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Buy />
      </main>
    </>
  );
}
