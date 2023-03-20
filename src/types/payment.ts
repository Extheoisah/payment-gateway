import { WalletCurrency } from "@/graphql/generated";
import { NextApiResponse } from "next";

export type BuyRequest = {
  amount: number | undefined;
  currency: WalletCurrency;
  price: number | undefined;
  walletId: string | undefined;
  username: string;
  email: string;
};

export type ResponseData = {
  data?: NextApiResponse[] | undefined;
  message: string;
  status: string;
};