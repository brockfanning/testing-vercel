/**
 * Core OAuth Handshake Logic
 * Exchanges a temporary GitHub authorization code for a reusable user access token.
 */
export async function exchangeOAuthToken({ code, clientId, clientSecret }) {
  // Use URLSearchParams to automatically format the variables into x-www-form-urlencoded data
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code
  });

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', // Tell GitHub we are sending form data
      'Accept': 'application/json' // Keep this so GitHub replies with clean JSON
    },
    body: params.toString() // Sends as "client_id=xyz&client_secret=abc&code=123"
  });
  
  return await tokenResponse.json();
}
