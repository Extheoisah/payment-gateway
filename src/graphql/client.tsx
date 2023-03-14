import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";

let apolloClient: ApolloClient<unknown> | undefined;

function createApolloClient() {
  return new ApolloClient({
    uri: "https://api.staging.galoy.io/graphql",
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
