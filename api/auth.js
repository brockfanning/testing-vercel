import { exchangeOAuthToken } from "./core-logic.js";

export default async function handler(req, res) {
  // 1. Establish strict CORS safety clearance headers
  res.setHeader("Access-Control-Allow-Origin", "https://github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 2. Handle the browser's automatic CORS pre-flight validation ping
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Open SDG submits entirely via POST rules
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing temporary authorization code' });
  }

  try {
    const tokenData = await exchangeOAuthToken({
      code,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    });

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // Return the final clean access token structure straight to Open SDG
    return res.status(200).json({ access_token: tokenData.access_token });

  } catch (error) {
    console.error("OAuth Bridge Exception:", error);
    return res.status(500).json({ error: 'Internal OAuth exchange error', details: error.message });
  }
}
