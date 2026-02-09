// ═══════════════════════════════════════════════════════════════
// OAuth Flow - Step 1: Redirect to Google
// استخدم هذا الرابط مرة واحدة فقط للحصول على Refresh Token
// ═══════════════════════════════════════════════════════════════

exports.handler = async (event, context) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://novloo-netlify.netlify.app/.netlify/functions/blogger-oauth-callback';
  
  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/blogger',
    access_type: 'offline',
    prompt: 'consent'
  });

  return {
    statusCode: 302,
    headers: {
      'Location': authUrl
    }
  };
};
