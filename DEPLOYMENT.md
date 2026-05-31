# دليل النشر على الخادم (VPS Deployment Guide)

يفترض هذا الدليل أنك تمتلك خادم VPS بنظام Linux (مثل Ubuntu/Debian) ولديك صلاحيات Root، وأنك قمت بالفعل برفع ملفات المشروع إلى الخادم.

## 1. تثبيت المتطلبات الأساسية
يجب تثبيت Node.js و npm إذا لم تكن مثبتة.
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 2. تثبيت PM2
نستخدم PM2 لإبقاء البوت يعمل في الخلفية حتى بعد إغلاق الـ SSH.
```bash
sudo npm install -g pm2
```

## 3. إعداد المشروع
ادخل إلى مجلد المشروع (مثلاً `/root/projects/vps-bot`):
```bash
cd /root/projects/vps-bot
npm install
```

قم بإنشاء ملف `.env` ووضع المتغيرات المطلوبة:
```bash
cp .env.example .env
nano .env
```

قم بتحديث المتغيرات التالية:
- `TELEGRAM_BOT_TOKEN`: التوكن الخاص ببوتك.
- `TELEGRAM_ADMIN_ID`: معرّف تيليجرام الخاص بك (ID).
- تأكد من إضافة مسار المشروع إلى `ALLOWED_PATHS` إذا أردت استعراضه من البوت.

## 4. بناء المشروع (Build)
حيث أن المشروع مبني بـ TypeScript، يجب ترجمته إلى JavaScript.
```bash
npm run build
```

## 5. تشغيل البوت عبر PM2
الآن سنقوم بتشغيل البوت في الخلفية:
```bash
pm2 start dist/index.js --name telegram-vps-manager-bot
```

## 6. جعل البوت يعمل تلقائياً عند إعادة تشغيل الخادم
لتفعيل هذه الميزة، شغل الأوامر التالية:
```bash
pm2 startup
pm2 save
```
سيظهر لك أمر طويل بعد تنفيذ `pm2 startup`، قم بنسخه ولصقه في التيرمنال لتفعيل الخدمة.

## ملاحظات أمنية هامة
- **لا** تشارك رمز الـ Bot Token مع أحد أبداً.
- تأكد أن `TELEGRAM_ADMIN_ID` صحيح، لكي لا يتمكن أحد غيرك من التحكم في الخادم.
- عند إضافة مسارات إلى `ALLOWED_PATHS`، تجنب إضافة مجلدات حساسة مثل `/root/.ssh` أو مجرد `/` إلا إذا كنت تدرك المخاطر تماماً.
