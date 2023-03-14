type FormatterInput = {
  amount: number;
  currency: string;
};

type SatOrCentPrice = {
  base: number;
  offset: number;
};

type GetPriceInput = {
  currency: string;
  realtimePrice: {
    btcSatPrice: SatOrCentPrice;
    usdCentPrice: SatOrCentPrice;
  };
};

export const CURRENCIES = { NGN: "NGN", USD: "USD", BTC: "BTC" } as const;

const SATS_PER_BTC = 1000000;

export const formatter = ({ amount, currency }: FormatterInput) => {
  return new Intl.NumberFormat(currency, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getPrice = ({ currency, realtimePrice }: GetPriceInput) => {
  const { base, offset } =
    currency === CURRENCIES.NGN
      ? realtimePrice?.btcSatPrice
      : realtimePrice?.usdCentPrice;

  const price =
    currency === CURRENCIES.NGN
      ? (base / 10 ** offset) * SATS_PER_BTC
      : base / 10 ** offset;

  return `₦${formatter({ amount: price, currency: CURRENCIES.NGN })}`;
};
