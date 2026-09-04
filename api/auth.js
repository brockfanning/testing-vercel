import { exchangeOAuthToken } from "./core-logic.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const code = req.query.code || (req.body && req.body.code);

  if (!code) {
    return res.status(400).json({ error: 'Missing temporary authorization code' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // 🔍 THIS SAFEGUARD TRACE WILL TELL US IF VERCEL ISSUED BLANK ENVIRONMENT KEYS
  if (!clientId || !clientSecret) {
    return res.status(500).json({ 
      error: 'Vercel Environment Keys Missing', 
      details: 'The backend code is receiving empty text for GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET. Please ensure the Preview environment box is checked in Vercel settings.' 
    });
  }

  try {
    const tokenData = await exchangeOAuthToken({
      code,
      clientId,
      clientSecret
    });

    if (tokenData.error) {
      return res.status(400).json({ 
        error: "GitHub Rejected Request",
        message: tokenData.error, 
        details: tokenData.error_description 
      });
    }

    return res.status(200).json({ access_token: tokenData.access_token });

  } catch (error) {
    console.error("OAuth Bridge Error:", error);
    return res.status(500).json({ error: 'Internal OAuth exchange error', details: error.message });
  }
}
