import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../graphql/client";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const client = useApollo();

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
