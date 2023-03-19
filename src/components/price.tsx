import React from "react";
import { formatter, SATS_PER_BTC } from "../../utils/price";

type PriceProps = {
  pricePerUsd: number;
  pricePerSat: number;
};

const Price = ({ pricePerSat, pricePerUsd }: PriceProps) => {
  const btcPriceInNGN = pricePerSat * SATS_PER_BTC;
  return (
    <div>
      <p>{`BTC Price in NGN: ${formatter(btcPriceInNGN)}`}</p>
      <p>{`1 USD TO NGN: ${formatter(pricePerUsd)}`}</p>
    </div>
  );
};

export default Price;
