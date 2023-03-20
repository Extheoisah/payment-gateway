import Head from "next/head";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import Price from "@/components/price";
import ToolTip from "@/components/tool-tip";
import {
  useAccountDefaultWalletQuery,
  useRealtimepriceQuery,
  WalletCurrency,
} from "@/graphql/generated";
import { useDebounce } from "@/hooks/usedebounce";
import { currencies } from "@/types/currencies";
import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as RadioGroup from "@radix-ui/react-radio-group";

import { formatter, getPrice } from "../../utils/price";

type BuyRequest = {
  amount: number | undefined;
  currency: WalletCurrency;
  price: number | undefined;
  walletId: string | undefined;
  username: string;
};

const initialBuyRequest: BuyRequest = {
  amount: undefined,
  currency: WalletCurrency.Btc,
  price: undefined,
  walletId: undefined,
  username: "",
};

const isLowerThan1000 = (amount: number | undefined) => {
  if (!amount) return false;
  return !isNaN(amount) && amount < 1000;
};

export default function Home() {
  const [validUsername, setValidUsername] = useState<boolean>(false);
  const [buyRequest, setBuyRequest] = useState<BuyRequest>(initialBuyRequest);
  const debouncedUsername = useDebounce({
    value: buyRequest.username,
    delay: 500,
  });

  const pollInterval = 3 * 60 * 1000; // 3 min
  const { data } = useRealtimepriceQuery({
    variables: { currency: currencies.NGN },
    fetchPolicy: "cache-and-network",
    pollInterval,
  });

  const {
    data: accountDefaultWallet,
    loading,
    error,
  } = useAccountDefaultWalletQuery({
    variables: {
      username: debouncedUsername,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (accountDefaultWallet) {
      setBuyRequest((prevRequest) => ({
        ...prevRequest,
        walletId: accountDefaultWallet.accountDefaultWallet.id,
      }));
      return setValidUsername(true);
    }
    setValidUsername(false);
  }, [debouncedUsername, accountDefaultWallet]);

  if (!data) {
    return null;
  }

  const realtimePrice = data?.realtimePrice;
  const { pricePerSat, pricePerUsd } = getPrice(realtimePrice);

  const handleBuyRequest = (
    e: FormEvent<HTMLFormElement | HTMLButtonElement>
  ) => {
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
                match={() => (error ? true : false)}
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
                    <div className="w-4 h-4 border border-t-2 border-green-300 border-solid rounded-full animate-spinner"></div>
                  ) : (
                    <CheckCircledIcon
                      className={`${
                        validUsername ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  )}
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
            buyRequest={buyRequest}
            handleBuyRequest={handleBuyRequest}
          />
        </Form.Root>
        <Price pricePerSat={pricePerSat} pricePerUsd={pricePerUsd} />
      </main>
    </>
  );
}

const CheckoutDialog = ({
  buyRequest,
  handleBuyRequest,
}: {
  buyRequest: BuyRequest;
  handleBuyRequest: (e: FormEvent<HTMLButtonElement>) => void;
}) => {
  const [open, setOpen] = useState(false);
  const disabled =
    !buyRequest.username ||
    !buyRequest.amount ||
    isLowerThan1000(buyRequest.amount);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Form.Submit disabled={disabled} asChild>
          <button className="box-border w-full text-gray-100 shadow-black hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-blue-800 px-[15px] font-medium leading-none shadow-[0_2px_5px] focus:shadow-[0_0_0_2px] focus:shadow-blue-600 focus:outline-none mt-[10px] disabled:opacity-50">
            Buy
          </button>
        </Form.Submit>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-gray-100 opacity-30 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="flex flex-col justify-center items-center data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-gray-100 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="text-gray-900 m-0 text-[17px] font-medium">
            Confirm your purchase
          </Dialog.Title>
          <Dialog.Description className="text-gray-900 mt-[10px] mb-5 text-[15px] leading-normal text-center">
            Please confirm the details of the transaction before proceeding.
          </Dialog.Description>
          <fieldset className="mb-[15px] flex items-center">
            <span className="text-gray-900 w-full text-right text-[15px]">
              Username:{" "}
              <span className="font-bold text-gray-600">
                {buyRequest.username}
              </span>
            </span>
          </fieldset>
          <fieldset className="mb-[15px] flex items-center">
            <p className="text-gray-900 w-full text-right text-[15px]">
              Amount:{" "}
              <span className="font-bold text-gray-600">
                {buyRequest.amount && formatter(buyRequest.amount)}
              </span>
            </p>
          </fieldset>
          <fieldset className="mb-[15px] flex items-center">
            <p className="text-gray-900 w-full text-right text-[15px]">
              Wallet to top up:{" "}
              <span className="font-bold text-gray-600">
                {buyRequest.currency}
              </span>
            </p>
          </fieldset>
          <div className="mt-[25px] flex justify-end">
            <Dialog.Close asChild>
              <button
                onClick={(e) => {
                  setOpen(false), handleBuyRequest(e);
                }}
                disabled={disabled}
                className="bg-green-400 text-gray-700 hover:bg-green-400 focus:shadow-green-700 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none disabled:opacity-50"
              >
                Confirm
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className="text-red-500 hover:bg-white border-red-500 hover:border focus:shadow-red-500 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
