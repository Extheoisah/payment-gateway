import { Dispatch, FormEvent, SetStateAction, useState } from "react";

import { BuyRequest } from "@/types/payment";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

import { formatter, isLowerThan1000, SATS_PER_BTC } from "../../utils/price";

const CheckoutDialog = ({
  pricePerUsd,
  pricePerSat,
  buyRequest,
  setBuyRequest,
  handleBuyRequest,
}: {
  pricePerUsd: number;
  pricePerSat: number;
  buyRequest: BuyRequest;
  handleBuyRequest: (e: FormEvent<HTMLButtonElement>) => void;
  setBuyRequest: Dispatch<SetStateAction<BuyRequest>>;
}) => {
  const btcPriceInNGN = pricePerSat * SATS_PER_BTC;
  const [open, setOpen] = useState(false);
  const disabled =
    !buyRequest.username ||
    !buyRequest.amount ||
    isLowerThan1000(buyRequest.amount);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          onClick={() =>
            setBuyRequest((prevRequest) => ({
              ...prevRequest,
              price: pricePerUsd,
            }))
          }
          disabled={disabled}
          className="box-border w-full text-gray-100 shadow-black hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-blue-800 px-[15px] font-medium leading-none shadow-[0_2px_5px] focus:shadow-[0_0_0_2px] focus:shadow-blue-600 focus:outline-none mt-[10px] disabled:opacity-50"
        >
          Buy
        </button>
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
              <p className="text-xs font-semibold text-gray-400 pt-1">@ {formatter(btcPriceInNGN)}</p>
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

export default CheckoutDialog;
