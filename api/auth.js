import { exchangeOAuthToken } from "./core-logic.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const code = req.query.code || (req.body && req.body.code);

  if (!code) {
    return res.status(400).json({ error: 'Missing temporary authorization code' });
  }

  // 1. Read variables right here at the root entry level
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // 2. Fail early if Vercel hasn't injected the keys yet
  if (!clientId || !clientSecret) {
    console.error("Vercel Configuration Error: Missing Environment Variables");
    return res.status(500).json({ 
      error: 'Server misconfigured', 
      details: 'GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from Vercel settings.' 
    });
  }

  try {
    const tokenData = await exchangeOAuthToken({
      code,
      clientId,
      clientSecret
    });

    // If GitHub explicitly rejected our keys, output their exact reason
    if (tokenData.error) {
      return res.status(400).json({ 
        error: tokenData.error, 
        details: tokenData.error_description 
      });
    }

    return res.status(200).json({ access_token: tokenData.access_token });

  } catch (error) {
    console.error("OAuth Bridge Error:", error);
    return res.status(500).json({ error: 'Internal OAuth exchange error', details: error.message });
  }
}
