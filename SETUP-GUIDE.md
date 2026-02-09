# 🚀 دليل الإعداد السريع

## الخطوات:

### 1️⃣ رفع على GitHub
1. اذهب إلى: https://github.com/Hany0Magdy/novloo-netlify/upload/main
2. اسحب كل الملفات من مجلد `Hany`
3. اضغط "Commit changes"

### 2️⃣ Deploy على Netlify
1. اذهب إلى: https://app.netlify.com
2. Add new site > Import from Git
3. اختر GitHub > novloo-netlify
4. Deploy

### 3️⃣ احصل على Gmail App Password
1. اذهب إلى: https://myaccount.google.com/apppasswords
2. فعّل 2-Step Verification
3. أنشئ App Password (Mail > Netlify)
4. انسخ الـ 16 حرف

### 4️⃣ أضف Environment Variables في Netlify
- `GMAIL_USER` = your-email@gmail.com
- `GMAIL_APP_PASSWORD` = abcdefghijklmnop
- `BLOGGER_EMAIL` = hany0magdi.0904@blogger.com

### 5️⃣ انسخ Function URL
```
https://YOUR-SITE.netlify.app/.netlify/functions/publish-to-blogger
```

### 6️⃣ حدّث Hany.xml
```javascript
APPS_SCRIPT_URLS: [
  "https://YOUR-SITE.netlify.app/.netlify/functions/publish-to-blogger"
]
```

## ✅ جاهز!
اختبر النشر من موقعك.
