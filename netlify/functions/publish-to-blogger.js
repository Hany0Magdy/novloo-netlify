// ═══════════════════════════════════════════════════════════════
// Netlify Function - Publish to Blogger
// 125,000 طلب/شهر مجاناً - بدون حدود Email!
// ═══════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
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
    const category = params.get('category') || 'Novel';
    const coverImage = params.get('image') || '';

    if (!content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Content required' })
      };
    }

    // استخراج العنوان من H1
    let title = 'Post ' + Date.now();
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].replace(/<[^>]*>/g, '').trim();
    }

    console.log('📝 Title:', title);

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

    // إضافة Labels مخفية
    const safeCategory = category.replace(/\s+/g, '-');
    fullContent += `<div ${hiddenStyle}>#${safeCategory} #Novloo</div>`;

    // ✅ إرسال Email عبر Nodemailer (أفضل من Gmail API)
    // استخدام Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,      // من Environment Variables
        pass: process.env.GMAIL_APP_PASSWORD  // App Password (ليس كلمة المرور العادية)
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.BLOGGER_EMAIL,  // hany0magdi.0904@blogger.com
      subject: title,  // ✅ العنوان الحقيقي مباشرة
      html: fullContent,
      text: 'Novel Post'
    };

    console.log('📤 Sending email to Blogger...');

    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully');
    
    // ✅ محاولة الحصول على الرابط الحقيقي من Blogger feed
    // نحاول عدة مرات لأن Blogger قد يأخذ وقت
    let realUrl = '';
    const maxAttempts = 4;
    const waitTime = 5000; // 5 ثواني بين كل محاولة
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Waiting ${waitTime/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      try {
        const blogUrl = 'https://rtewrqwe.blogspot.com';
        const feedUrl = `${blogUrl}/feeds/posts/default?alt=json&max-results=5&orderby=published`;
        
        console.log('📡 Fetching feed...');
        const feedResponse = await fetch(feedUrl);
        const feedData = await feedResponse.json();
        
        if (feedData.feed && feedData.feed.entry) {
          console.log(`Found ${feedData.feed.entry.length} posts in feed`);
          
          // البحث عن البوست بالعنوان
          for (const post of feedData.feed.entry) {
            const postTitle = post.title.$t || '';
            console.log(`Checking post: "${postTitle}"`);
            
            // مقارنة العناوين
            if (postTitle === title) {
              const alternateLink = post.link.find(l => l.rel === 'alternate');
              if (alternateLink && alternateLink.href) {
                realUrl = alternateLink.href;
                console.log(`✅ Found matching post! URL: ${realUrl}`);
                break; // وجدنا البوست، نخرج من الحلقة
              }
            }
          }
          
          // إذا وجدنا الرابط، نخرج من حلقة المحاولات
          if (realUrl) {
            console.log('✅ Successfully got real URL');
            break;
          } else {
            console.log(`⚠️ Post not found in attempt ${attempt}`);
          }
        }
      } catch (feedError) {
        console.log(`❌ Error in attempt ${attempt}:`, feedError.message);
      }
    }
    
    // إذا لم نجد الرابط بعد كل المحاولات
    if (!realUrl) {
      console.log('⚠️ Could not get real URL, using blog homepage');
      realUrl = 'https://rtewrqwe.blogspot.com/';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        message: 'Posted to Blogger',
        title: title,
        url: realUrl // ✅ الرابط الحقيقي
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
