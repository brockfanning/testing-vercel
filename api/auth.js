import { exchangeOAuthToken } from "./core-logic.js";

export default async function handler(req, res) {
  // OPTIONS checks are now completely taken care of by vercel.json headers
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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

    return res.status(200).json({ access_token: tokenData.access_token });

  } catch (error) {
    console.error("OAuth Error:", error);
    return res.status(500).json({ error: 'Internal OAuth exchange error', details: error.message });
  }
}
