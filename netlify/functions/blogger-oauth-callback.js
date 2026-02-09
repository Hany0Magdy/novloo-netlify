// ═══════════════════════════════════════════════════════════════
// OAuth Flow - Step 2: Handle Callback & Get Refresh Token
// هذا الملف يستقبل الـ code من Google ويحوله لـ Refresh Token
// ═══════════════════════════════════════════════════════════════

exports.handler = async (event, context) => {
  const code = event.queryStringParameters.code;

  if (!code) {
    return {
      statusCode: 400,
      body: 'Missing authorization code'
    };
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'https://novloo-netlify.netlify.app/.netlify/functions/blogger-oauth-callback';

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    const data = await response.json();

    if (data.refresh_token) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: `
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>✅ تم بنجاح!</title>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  padding: 40px;
                  text-align: center;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .container {
                  background: white;
                  color: #333;
                  padding: 40px;
                  border-radius: 16px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                  max-width: 600px;
                }
                h1 {
                  color: #10b981;
                  margin-bottom: 20px;
                }
                pre {
                  background: #f5f5f5;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: left;
                  overflow: auto;
                  border: 2px solid #667eea;
                  direction: ltr;
                }
                .instructions {
                  background: #fef3c7;
                  padding: 20px;
                  border-radius: 8px;
                  margin-top: 20px;
                  border-right: 4px solid #f59e0b;
                }
                .step {
                  text-align: right;
                  margin: 10px 0;
                  font-weight: bold;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>✅ تم الحصول على Refresh Token بنجاح!</h1>
                <p>احفظ هذا الـ Token في Netlify Environment Variables:</p>
                <pre>BLOGGER_REFRESH_TOKEN=${data.refresh_token}</pre>
                
                <div class="instructions">
                  <h3>📋 الخطوات التالية:</h3>
                  <div class="step">1. انسخ الـ Token أعلاه</div>
                  <div class="step">2. اذهب إلى Netlify Dashboard</div>
                  <div class="step">3. Site Settings > Environment Variables</div>
                  <div class="step">4. أضف متغير جديد: BLOGGER_REFRESH_TOKEN</div>
                  <div class="step">5. الصق الـ Token</div>
                  <div class="step">6. احفظ التغييرات</div>
                  <div class="step">7. أعد نشر الموقع (Redeploy)</div>
                </div>
                
                <p style="margin-top:30px;color:#6b7280">
                  ⚠️ هذا الـ Token لن يظهر مرة أخرى، احفظه الآن!
                </p>
              </div>
            </body>
          </html>
        `
      };
    } else {
      throw new Error('No refresh token received');
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <title>❌ خطأ</title>
            <style>
              body {
                font-family: Arial;
                padding: 40px;
                text-align: center;
                background: #fee;
              }
            </style>
          </head>
          <body>
            <h1>❌ حدث خطأ</h1>
            <p>${error.message}</p>
          </body>
        </html>
      `
    };
  }
};
