import { gql } from "@apollo/client";

export const REALTIMEPRICE = gql`
  query realtimeprice($currency: DisplayCurrency!) {
    realtimePrice(currency: $currency) {
      id
      timestamp
      denominatorCurrency
      btcSatPrice {
        base
        offset
        currencyUnit
      }
      usdCentPrice {
        base
        offset
        currencyUnit
      }
    }
  }
`;