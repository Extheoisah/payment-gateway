import Head from "next/head";
import { ChangeEvent, FormEvent, useState } from "react";

import Price from "@/components/price";
import {
  useAccountDefaultWalletLazyQuery,
  useRealtimepriceQuery,
  WalletCurrency,
} from "@/graphql/generated";
import { currencies } from "@/types/currencies";
import * as Form from "@radix-ui/react-form";
import * as RadioGroup from "@radix-ui/react-radio-group";

import { getPrice } from "../../utils/price";

type BuyRequest = {
  amount: number;
  currency: WalletCurrency;
  price: number | null;
  walletId: string | null;
  username: string;
};

export default function Home() {
  const [buyRequest, setBuyRequest] = useState<BuyRequest>({
    amount: 0,
    currency: WalletCurrency.Btc,
    price: null,
    walletId: null,
    username: "",
  });
  const pollInterval = 3 * 60 * 1000; // 3 min
  const { data } = useRealtimepriceQuery({
    variables: { currency: currencies.NGN },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "network-only",
    pollInterval,
  });

  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery();

  if (!data) {
    return null;
  }

  const realtimePrice = data?.realtimePrice;
  const { pricePerSat, pricePerUsd } = getPrice(realtimePrice);

  const handleBuyRequest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBuyRequest((prevRequest) => ({ ...prevRequest, price: pricePerUsd }));
    console.table(buyRequest);
  };

  const updateBuyRequest = (
    e: ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setBuyRequest((prevRequest) => ({
      ...prevRequest,
      [field]: e.target.value,
    }));
  };

  return (
    <>
      <Head>
        <title>buy bitcoin</title>
        <meta name="description" content="buy bitcoin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center items-center my-10 gap-y-6">
        <Form.Root onSubmit={handleBuyRequest}>
          <Form.Field className="flex flex-col gap-y-1" name="username">
            <Form.Label>Username</Form.Label>
            <Form.Message match="valueMissing">
              Username is required
            </Form.Message>
            <Form.Control asChild>
              <input
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  updateBuyRequest(e, "amount")
                }
                className="Input"
                type="text"
                required
              />
            </Form.Control>
          </Form.Field>
          <RadioGroup.Root
            className="flex flex-col gap-2.5"
            defaultValue="default"
            value={buyRequest.currency}
            aria-label="wallet-currency"
            onValueChange={(value: WalletCurrency) =>
              setBuyRequest({ ...buyRequest, currency: value })
            }
          >
            <div className="flex items-center">
              <RadioGroup.Item
                className="bg-white w-[25px] h-[25px] rounded-full shadow-[0_2px_5px] shadow-blackA7 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-blue-700 outline-none cursor-pointer"
                value="BTC"
                id="r2"
              >
                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-blue-700" />
              </RadioGroup.Item>
              <label
                className="text-white text-[15px] leading-none pl-[15px]"
                htmlFor="BTC"
              >
                BTC
              </label>
            </div>
            <div className="flex items-center">
              <RadioGroup.Item
                className="bg-white w-[25px] h-[25px] rounded-full shadow-[0_2px_5px] shadow-blackA7 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-blue-700 outline-none cursor-pointer"
                value="USD"
                id="r3"
              >
                <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-blue-700" />
              </RadioGroup.Item>
              <label
                className="text-white text-[15px] leading-none pl-[15px]"
                htmlFor="USD"
              >
                USD (Stablesats)
              </label>
            </div>
          </RadioGroup.Root>
          <Form.Submit asChild>
            <button className="box-border w-full text-black shadow-blackA7 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none mt-[10px]">
              Buy
            </button>
          </Form.Submit>
        </Form.Root>
        <Price pricePerSat={pricePerSat} pricePerUsd={pricePerUsd} />
      </main>
    </>
  );
}
