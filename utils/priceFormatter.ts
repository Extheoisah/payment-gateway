import { RealtimePrice } from "@/graphql/generated";
import { currencies } from "@/types/currencies";

export const formatter = (amount: number) => {
  const formattedAmount = new Intl.NumberFormat(currencies.NGN, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `₦${formattedAmount}`;
};

export const getPrice = (realtimePrice: RealtimePrice) => {
  const pricePerUsd =
    realtimePrice.usdCentPrice.base / 10 ** realtimePrice.usdCentPrice.offset;
  const pricePerSat =
    realtimePrice.btcSatPrice.base /
    10 ** realtimePrice.btcSatPrice.offset /
    100;

  return {
    pricePerSat,
    pricePerUsd,
  };
};
