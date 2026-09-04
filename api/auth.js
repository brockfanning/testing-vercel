import { exchangeOAuthToken } from "./core-logic.js";

export default async function handler(req, res) {
  // Handle the browser's automatic CORS pre-flight validation checks safely
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. Look for the code inside the URL query string OR inside the raw JSON body text
  const code = req.query.code || (req.body && req.body.code);

  if (!code) {
    return res.status(400).json({ error: 'Missing temporary authorization code' });
  }

  try {
    // 2. Pass the code along to finish the handshake
    const tokenData = await exchangeOAuthToken({
      code,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    });

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description });
    }

    // 3. Return the token data exactly as expected by the Open SDG library context
    return res.status(200).json({ access_token: tokenData.access_token });

  } catch (error) {
    console.error("OAuth Bridge Error:", error);
    return res.status(500).json({ error: 'Internal OAuth exchange error', details: error.message });
  }
}
