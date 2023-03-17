import { ChangeEvent, FormEvent, useState } from "react";

import { useRealtimepriceQuery } from "@/graphql/generated";
import { currencies } from "@/types/currencies";

import { formatter, getPrice } from "../../../utils/priceFormatter";

type BuyRequest = {
  amount: number;
  currency: typeof currencies[keyof typeof currencies];
  price: number | null;
};

const SATS_PER_BTC = 100000000;

export default function Buy() {
  const pollInterval = 3 * 60 * 1000; // 3 min
  const { data } = useRealtimepriceQuery({
    variables: { currency: currencies.NGN },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "network-only",
    pollInterval,
  });

  const [show, setShow] = useState<boolean>(false);
  const [buyRequest, setBuyRequest] = useState<BuyRequest>({
    amount: 0,
    currency: currencies.NGN,
    price: null,
  });

  if (!data) {
    return null;
  }

  const realtimePrice = data?.realtimePrice;
  const { pricePerSat, pricePerUsd } = getPrice(realtimePrice);
  const btcPriceInNGN = pricePerSat * SATS_PER_BTC;

  const handleBuyRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBuyRequest((prevRequest) => ({ ...prevRequest, price: pricePerUsd }));
    setShow(true);
  };

  const updateBuyRequest = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    setBuyRequest((prevRequest) => ({
      ...prevRequest,
      [field]: e.target.value,
    }));
  };

  return (
    <main>
      <form onSubmit={handleBuyRequest}>
        <div>
          <label>Amout</label>
          <input
            type={"number"}
            value={buyRequest.amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateBuyRequest(e, "amount")
            }
          />
        </div>
        <div>
          <label>Currency</label>
          <select
            value={buyRequest.currency}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              updateBuyRequest(e, "currency")
            }
          >
            <option value={"NGN"}>NGN</option>
            <option value={"BTC"}>BTC</option>
          </select>
        </div>
        <div>
          <p>{`BTC Price in NGN: ${formatter(btcPriceInNGN)}`}</p>
          <p>{`1 USD TO NGN: ${formatter(pricePerUsd)}`}</p>
        </div>
        <div>
          <button>Submit</button>
        </div>
      </form>
      {show && (
        <div>
          <p>{buyRequest.price}</p>
          <p>{buyRequest.currency}</p>
          <p>{buyRequest.amount}</p>
        </div>
      )}
    </main>
  );
}
