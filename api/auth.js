import { exchangeOAuthToken } from "./core-logic.js";

export default async function handler(req, res) {
  // The Open SDG frontend button sends a POST request to this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Missing temporary authorization code' });
  }

  try {
    // Pass the code and your hidden Vercel environment variables to the core logic
    const tokenData = await exchangeOAuthToken({
      code,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    });

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // Return the token back to the browser so the Open SDG button can use it
    return res.status(200).json({ access_token: tokenData.access_token });

  } catch (error) {
    console.error("OAuth Error:", error);
    return res.status(500).json({ error: 'Internal OAuth exchange error', details: error.message });
  }
}
