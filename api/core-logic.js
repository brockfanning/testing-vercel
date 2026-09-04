/**
 * Core OAuth Handshake Logic
 * Exchanges a temporary GitHub authorization code for a reusable user access token.
 */
export async function exchangeOAuthToken({ code, clientId, clientSecret }) {
  const tokenResponse = await fetch('https://github.com', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json' 
    },
    body: JSON.stringify({ 
      client_id: clientId, 
      client_secret: clientSecret, 
      code 
    })
  });
  return await tokenResponse.json();
}
