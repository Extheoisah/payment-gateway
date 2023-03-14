import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { REALTIMEPRICE } from "@/graphql/queries";
import { getPrice, CURRENCIES } from "../../../utils/priceFormatter";
import { ChangeEvent, FormEvent, useState } from "react";

type BuyRequest = {
  amount: number;
  currency: string;
  price: string | null;
};

export default function Buy() {
  const [buyRequest, setBuyRequest] = useState<BuyRequest>({
    amount: 0,
    currency: CURRENCIES.NGN,
    price: null,
  });
  const [show, setShow] = useState<boolean>(false);
  const router = useRouter();
  const pollInterval = 5 * 60 * 1000; // 5 min

  const { data, loading, error } = useQuery(REALTIMEPRICE, {
    variables: { currency: "NGN" },
    fetchPolicy: "cache-and-network",
    pollInterval,
  });
  if (!data) {
    return null;
  }
  const realtimePrice = data?.realtimePrice;

  const handleBuyRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const CURRENT_PRICE = getPrice({
      currency: CURRENCIES.NGN,
      realtimePrice,
    });
    setBuyRequest((prevRequest) => ({ ...prevRequest, price: CURRENT_PRICE }));
    setShow(true);
    console.table(buyRequest);
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
          <p>{`BTC Price in NGN: ${getPrice({
            currency: CURRENCIES.NGN,
            realtimePrice,
          })}`}</p>
          <p>{`1 USD TO NGN: ${getPrice({
            currency: CURRENCIES.USD,
            realtimePrice,
          })}`}</p>
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
