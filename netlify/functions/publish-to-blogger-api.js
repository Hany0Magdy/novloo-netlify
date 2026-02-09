// ═══════════════════════════════════════════════════════════════
// Blogger API v3 - Custom URL Slugs Support
// نظام URLs مثل novloo.com بالضبط: 0_timestamp.html
// ═══════════════════════════════════════════════════════════════

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📥 Received request');

    // Parse form data
    const params = new URLSearchParams(event.body);
    const content = params.get('content') || '';
    const timestamp = params.get('timestamp') || Date.now();
    const coverImage = params.get('image') || '';

    if (!content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content required' })
      };
    }

    // استخراج العنوان من H1
    let title = 'Post ' + timestamp;
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].replace(/<[^>]*>/g, '').trim();
    }

    console.log('📝 Title:', title);
    console.log('⏰ Timestamp:', timestamp);

    // ✅ URL Slug مخصص (مثل novloo.com)
    const urlSlug = `0_${timestamp}`;
    console.log('🔗 URL Slug:', urlSlug);

    // إخفاء البيانات التقنية
    const hiddenStyle = 'style="height:0;width:0;overflow:hidden;opacity:0;position:absolute;"';
    let cleanContent = content
      .replace(/class="novel-series-id"/g, `class="novel-series-id" ${hiddenStyle}`)
      .replace(/class="novel-meta-data"/g, `class="novel-meta-data" ${hiddenStyle}`)
      .replace(/class="novel-synopsis"/g, `class="novel-synopsis" ${hiddenStyle}`);

    // إضافة الصورة
    let fullContent = '';
    if (coverImage) {
      fullContent += `<div style="text-align:center;margin:20px 0"><img src="${coverImage}" style="max-width:100%;border-radius:8px"/></div>`;
    }
    fullContent += cleanContent;

    // ✅ الحصول على Access Token
    const accessToken = await getAccessToken();

    // ✅ إنشاء البوست عبر Blogger API
    const blogId = process.env.BLOGGER_BLOG_ID;
    const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`;

    const postData = {
      kind: 'blogger#post',
      title: title,
      content: fullContent,
      url: urlSlug,  // ✅ هنا السحر! URL مخصص
      labels: ['Novel', 'Novloo']
    };

    console.log('📤 Creating post via Blogger API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Blogger API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const postUrl = result.url;

    console.log('✅ Post created successfully!');
    console.log('🔗 URL:', postUrl);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: 'Posted to Blogger',
        title: title,
        url: postUrl,
        slug: urlSlug
      })
    };

  } catch (error) {
    console.error('❌ Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};

// ═══════════════════════════════════════════════════════════════
// OAuth 2.0 - Get Access Token
// ═══════════════════════════════════════════════════════════════

async function getAccessToken() {
  const refreshToken = process.env.BLOGGER_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!refreshToken) {
    throw new Error('BLOGGER_REFRESH_TOKEN not set. Run OAuth flow first.');
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
}
