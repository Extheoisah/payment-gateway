import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { REALTIMEPRICE } from "@/graphql/queries";
import { getPrice, CURRENCIES } from "../../../utils/priceFormatter";

export default function Buy() {
  const router = useRouter();
  console.log(router.query.wallet_id);

  const { data, loading, error } = useQuery(REALTIMEPRICE, {
    variables: { currency: "NGN" },
    fetchPolicy: "cache-and-network",
  });
  console.log(loading);
  console.log(error);
  console.log(data);
  console.log(data?.realtimePrice?.btcSatPrice);
  if (!data) {
    return null;
  }
  const realtimePrice = data?.realtimePrice;
  return (
    <main>
      <form>
        <div>
          <label>Amout</label>
          <input type={"number"} />
        </div>
        <div>
          <label>Currency</label>
          <select>
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
      </form>
    </main>
  );
}
