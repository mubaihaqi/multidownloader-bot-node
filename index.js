import "dotenv/config";
import { bot } from "./lib/telegram.js";

export default async function handler(req) {
  console.log("--- FINAL ATTEMPT LOGS (STREAM READING) ---");
  console.log("Request Method:", req.method);
  console.log("Req object type (typeof):", typeof req);
  console.log("Req object constructor name:", req.constructor?.name);
  console.log("Req instanceof Request (Web API):", req instanceof Request);
  console.log("Headers (req.headers):", req.headers);
  console.log("URL (req.url):", req.url);
  console.log("--- END FINAL ATTEMPT LOGS ---");

  if (req.method === "POST") {
    try {
      let rawBody = "";
      await new Promise((resolve, reject) => {
        req.on("data", (chunk) => {
          rawBody += chunk.toString();
        });
        req.on("end", () => {
          resolve();
        });
        req.on("error", (err) => {
          reject(err);
        });
      });

      const updateData = JSON.parse(rawBody);

      await bot.handleUpdate(updateData);

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error handling webhook:", error.message);
      console.error("Error stack:", error.stack);
      return new Response("Error", { status: 500 });
    }
  }
  return new Response("Method Not Allowed", { status: 405 });
}
