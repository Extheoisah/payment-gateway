import baseEndPoints from "@/config/config";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";

let apolloClient: ApolloClient<unknown> | undefined;

function createApolloClient() {
  const isProduction = process.env.NODE_ENV === "production";
  const uri = isProduction
    ? baseEndPoints.GALOY_MAINNET_API
    : baseEndPoints.GALOY_STAGING_API;
  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo() {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (!apolloClient) {
    apolloClient = _apolloClient;
  }

  return _apolloClient;
}

export function useApollo() {
  const store = useMemo(() => initializeApollo(), []);
  return store;
}
