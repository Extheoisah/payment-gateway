import type { NextApiRequest, NextApiResponse } from "next";
import { currencies } from "@/types/currencies";
import { ResponseError } from "@/types/error";
import { BuyRequest, ResponseData } from "@/types/payment";

import baseEndpoints from "../../config/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) {
  try {
    const data = await req.body;
    if (!data || !data.body) {
      const response: ResponseError = {
        message: "Bad request!",
        status: "failed",
      };
      return res.status(400).json(response);
    }

    const buyRequest: BuyRequest = JSON.parse(data.body);
    const requiredFields: (keyof BuyRequest)[] = [
      "amount",
      "currency",
      "price",
      "walletId",
      "username",
      "email"
    ];
    const missingFields = validateRequiredFields(buyRequest, requiredFields);
    if (missingFields.length > 0) {
      const response: ResponseError = {
        message: "Missing required fields",
        status: "failed",
        missingFields,
      };
      return res.status(400).json(response);
    }

    const {
      message,
      status,
      data: checkoutResponseData,
    } = await getCheckoutUrl(buyRequest);
    if (status !== "success") {
      const response: ResponseError = {
        message,
        status,
      };
      return res.status(500).json(response);
    }
    console.log(buyRequest)
    return res.status(200).json({
      message: "submission successful!",
      status: "success",
      data: checkoutResponseData,
    });
  } catch (error) {
    const response: ResponseError = {
      message: "server error",
      status: "failed",
    };
    res.status(500).json(response);
  }
}

async function getCheckoutUrl(buyRequest: BuyRequest): Promise<ResponseData> {
  const isProduction = process.env.NODE_ENV === "production";
  const gatewayUrl = isProduction
    ? baseEndpoints.FLW_MERCHANT_PRODUCTION_API
    : baseEndpoints.FLW_MERCHANT_SANDBOX_API;
  const token = process.env.NEXT_PUBLIC_FLW_MERCHANT_SECRET_KEY;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    Accept: "*/*",
    "Access-Control-Allow-Origin": "*",
  };

  const checkoutData = {
    tx_ref: generateTransactionReference(),
    amount: buyRequest.amount,
    currency: currencies.NGN,
    redirect_url: "https://webhook.site/c548c893-2892-4149-8cc9-c1264b4f83dc",
    meta: {
      customer_username: buyRequest.username,
      customer_wallet_id: buyRequest.walletId,
      customer_specified_wallet_currency: buyRequest.currency,
    },
    customer: {
      email: buyRequest.email,
      name: buyRequest.username,
    },
  };
  try {
    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(checkoutData),
    });
    const result = await response.json();
    return {
      data: result.data,
      status: "success",
      message: "Checkout URL generated successfully",
    };
  } catch (error) {
    return {
      data: undefined,
      message: `An error occurred while processing your request: ${
        error instanceof Error ? error.message : ""
      }`,
      status: "failed",
    };
  }
}

function validateRequiredFields<T>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  const missingFields: string[] = [];
  for (const field of requiredFields) {
    const value = data[field];

    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missingFields.push(field as string);
    }
  }
  return missingFields;
}

function generateTransactionReference(prefix = "TXN") {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${randomNumber}`;
}
