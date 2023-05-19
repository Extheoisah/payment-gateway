import axios from "axios";
import Head from "next/head";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import CheckoutDialog from "@/components/checkout-dialog";
import Price from "@/components/price";
import ToolTip from "@/components/tool-tip";
import {
  useAccountDefaultWalletQuery,
  useRealtimepriceQuery,
  WalletCurrency,
} from "@/graphql/generated";
import { useDebounce } from "@/hooks/usedebounce";
import { currencies } from "@/types/currencies";
import { ResponseError } from "@/types/error";
import { BuyRequest } from "@/types/payment";
import * as Form from "@radix-ui/react-form";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import * as RadioGroup from "@radix-ui/react-radio-group";

import { getPrice, isLowerThan1000 } from "../../utils/price";
import LoadingSpinner from "@/components/loading-spinner";
import DialogBox from "@/components/dailog";

const initialBuyRequest: BuyRequest = {
  amount: undefined,
  currency: WalletCurrency.Btc,
  price: undefined,
  walletId: undefined,
  username: "",
  email: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string) {
  return EMAIL_REGEX.test(email);
}

export default function Home() {
  const [validUsername, setValidUsername] = useState<boolean>(false);
  const [validEmail, setValidEmail] = useState<boolean>(false);
  const [buyRequest, setBuyRequest] = useState<BuyRequest>(initialBuyRequest);
  const [isLoadingCheckoutData, setIsLoadingCheckoutData] =
    useState<boolean>(false);
  const [requestError, setRequestError] = useState<ResponseError | Error>();

  const debouncedUsername = useDebounce({
    value: buyRequest.username,
    delay: 1000, // 1 second
  });

  const debouncedEmail = useDebounce({
    value: buyRequest.email,
    delay: 1000, // 1 second
  });

  const pollInterval = 3 * 60 * 1000; // 3 min
  const { data } = useRealtimepriceQuery({
    variables: { currency: currencies.NGN },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network",
    pollInterval,
  });

  const {
    data: accountDefaultWallet,
    loading,
    error: accountDefaultWalletError,
  } = useAccountDefaultWalletQuery({
    variables: {
      username: debouncedUsername,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (debouncedEmail) {
      setValidEmail(validateEmail(debouncedEmail));
    }
  }, [debouncedEmail]);

  useEffect(() => {
    if (accountDefaultWallet) {
      setBuyRequest((prevRequest) => ({
        ...prevRequest,
        walletId: accountDefaultWallet.accountDefaultWallet.id,
      }));
      setValidUsername(true);
    }
  }, [debouncedUsername, accountDefaultWallet]);

  if (!data) {
    return null;
  }

  if (requestError) {
    return (
      <DialogBox title="Error">
        <div className="flex flex-col gap-y-2">
          <div className="text-red-500">{requestError?.message}</div>
        </div>
      </DialogBox>
    );
  }

  if (isLoadingCheckoutData) {
    return (
      <div className="flex flex-col justify-center items-center gap-y-4 m-[0 auto] h-[100vh]">
        <LoadingSpinner size="large" />
        <div>Preparing checkout data...</div>
      </div>
    );
  }

  const realtimePrice = data?.realtimePrice;
  const { pricePerSat, pricePerUsd } = getPrice(realtimePrice);

  const handleBuyRequest = async (
    e: FormEvent<HTMLFormElement | HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (isLoadingCheckoutData) return;
    setIsLoadingCheckoutData(true);
    try {
      const response = await axios.post("/api/payment", {
        body: JSON.stringify(buyRequest),
      });
      console.log(buyRequest);
      if (response?.status === 200) {
        setIsLoadingCheckoutData(false);
        const paymentLink: string = response?.data?.data.link;
        window.location.href = paymentLink;
      }
    } catch (error) {
      setRequestError(error as ResponseError);
    } finally {
      setIsLoadingCheckoutData(false);
    }
  };

  const updateBuyRequest = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof BuyRequest
  ) => {
    setBuyRequest((prevRequest) => ({
      ...prevRequest,
      [field]: e.target.value,
    }));
  };

  return (
    <>
      <Head>
        <title>Buy bitcoin</title>
        <meta name="description" content="buy bitcoin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col justify-center items-center my-10 gap-y-6">
        <div>Buy Bitcoin</div>
        <Form.Root>
          <Form.Field name="username">
            <div className="flex flex-col gap-y-1 relative">
              <Form.Label>Username</Form.Label>
              <Form.Message
                className="text-xs text-red-500"
                match="valueMissing"
              >
                username is required
              </Form.Message>
              <Form.Message
                className="text-xs text-red-500"
                match={() => (accountDefaultWalletError ? true : false)}
              >
                username does not exist
              </Form.Message>
              <div className="flex justify-center items-center gap-x-4">
                <Form.Control asChild>
                  <input
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBuyRequest(e, "username")
                    }
                    className="w-[300px] h-[40px] rounded-[4px] border-[1px] border-gray-500 outline-none px-4"
                    type="text"
                    placeholder="BBW Username"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                </Form.Control>
                <div className="absolute -right-6">
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <CheckCircledIcon
                      className={`${
                        validUsername ? "text-green-500" : "text-red-500"
                      } ${buyRequest.username ? "block" : "hidden"}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </Form.Field>

          <Form.Field className="mt-6" name="email">
            <div className="flex flex-col gap-y-1 relative">
              <Form.Label>E-mail</Form.Label>
              <Form.Message
                className="text-xs text-red-500"
                match="valueMissing"
              >
                email is required
              </Form.Message>
              <Form.Message
                className="text-xs text-red-500"
                match={() => (validEmail ? true : false)}
              >
                please provide a valid email address
              </Form.Message>
              <div className="flex justify-center items-center gap-x-4">
                <Form.Control asChild>
                  <input
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBuyRequest(e, "email")
                    }
                    className="w-[300px] h-[40px] rounded-[4px] border-[1px] border-gray-500 outline-none px-4"
                    type="text"
                    placeholder="Email address"
                    spellCheck="false"
                    required
                  />
                </Form.Control>
                <div className="absolute -right-6">
                  <CheckCircledIcon
                    className={`${
                      validEmail ? "text-green-500" : "text-red-500"
                    } ${buyRequest.email ? "block" : "hidden"}`}
                  />
                </div>
              </div>
            </div>
          </Form.Field>

          <Form.Field className="mt-8" name="amount">
            <div className="flex flex-col gap-y-1">
              <Form.Label>Amount</Form.Label>
              <Form.Message
                className="text-xs text-red-500"
                match="valueMissing"
              >
                amount is required
              </Form.Message>
              <Form.Message
                className="text-xs text-red-500"
                match={() =>
                  buyRequest.amount ? isLowerThan1000(buyRequest.amount) : false
                }
              >
                amount should be greater than NGN 1000
              </Form.Message>
              <div className="relative flex items-center">
                <Form.Control asChild>
                  <input
                    value={buyRequest.amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateBuyRequest(e, "amount")
                    }
                    className="number-input w-[300px] h-[40px] rounded-[4px] border-[1px] border-gray-500 outline-none px-7"
                    type="text"
                    placeholder="Amount"
                    autoComplete="off"
                    spellCheck="false"
                    required
                  />
                </Form.Control>
                <div className="absolute top-1/2 -translate-y-1/2 left-2 text-gray-400">
                  ₦
                </div>
                <div className="absolute -right-6">
                  <ToolTip text="The minimum amount of bitcoin you can buy is NGN 1000" />
                </div>
              </div>
            </div>
          </Form.Field>

          <RadioGroup.Root
            className="flex gap-8 my-8"
            defaultValue="default"
            value={buyRequest.currency}
            aria-label="wallet-currency"
            onValueChange={(value: WalletCurrency) =>
              setBuyRequest({ ...buyRequest, currency: value })
            }
          >
            <div className="flex items-center">
              <RadioGroup.Item
                className="bg-white w-[15px] h-[15px] rounded-full shadow-[0_2px_5px] shadow-blackA7 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-blue-700 outline-none cursor-pointer"
                value="BTC"
                id="BTC"
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
                className="bg-white w-[15px] h-[15px] rounded-full shadow-[0_2px_5px] shadow-blackA7 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-blue-700 outline-none cursor-pointer"
                value="USD"
                id="USD"
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

          <CheckoutDialog
            validUsername={validUsername}
            pricePerUsd={pricePerUsd}
            pricePerSat={pricePerSat}
            buyRequest={buyRequest}
            setBuyRequest={setBuyRequest}
            handleBuyRequest={handleBuyRequest}
          />
        </Form.Root>
        <Price pricePerSat={pricePerSat} pricePerUsd={pricePerUsd} />
      </main>
    </>
  );
}
