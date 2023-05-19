import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

type TransactionWebhookPayload = {
  status: "success" | "failure";
  transaction_id: string;
  tx_Ref: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const secretHash = process.env.FLW_SECRET_HASH;
  const signature = req.headers["verif-hash"];
  if (!signature || signature !== secretHash) {
    res.status(401).end();
  }
  const data = await req.body;

  if (req.method === "POST") {
    const payload = JSON.parse(data.body);
    // Check the status of the transaction
    if (payload && payload?.status === "success") {
      console.log(`Transaction ${payload?.transaction_id} succeeded`);
      // TODO: update the status of the transaction in your database
    } else if (payload && payload.status === "failure") {
      console.log(`Transaction ${payload?.transaction_id} failed`);
      // TODO: update the status of the transaction in your database
    }

    // Log the payload to a local file
    const filePath = "./transaction-logs.txt";
    const logMessage = `${new Date().toISOString()} - ${JSON.stringify(
      payload
    )}\n`;
    fs.appendFileSync(filePath, logMessage);

    res.status(200).end();
  } else if (req.method === "GET") {
    const payload = {
      status: req.query?.status,
      transactionId: req.query?.transaction_id?.toString(),
      txRef: req.query?.tx_ref?.toString(),
    };
    console.log(payload);

    // Check the status of the transaction
    if (payload.status === "success") {
      console.log(`Transaction ${payload.transactionId} succeeded`);
      // TODO: update the status of the transaction in your database
    } else if (payload.status === "failure") {
      console.log(`Transaction ${payload.transactionId} failed`);
      // TODO: update the status of the transaction in your database
    }

    // Log the payload to a local file
    const filePath = "./transaction-logs.txt";
    const logMessage = `${new Date().toISOString()} - ${JSON.stringify(
      payload
    )}\n`;
    fs.appendFileSync(filePath, logMessage);

    res.status(200).end();
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
