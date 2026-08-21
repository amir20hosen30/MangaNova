# MangaNova v19 — Production/Railway

## Deploy سریع روی Railway

1. این پروژه را در GitHub به صورت یک repository خصوصی قرار دهید.
2. در Railway یک Project بسازید و Repository را به عنوان Service انتخاب کنید.
3. در Settings → Volumes یک Volume بسازید و به Service وصل کنید. Mount Path را دقیقاً `/app/storage` بگذارید. این Volume باید هم `db.json` و هم تصاویر کاربران/مانهوا را نگه دارد.
4. در Variables این متغیرها را تنظیم کنید:
   - `NODE_ENV=production`
   - `STORAGE_DIR=/app/storage`
   - `SESSION_SECRET=` یک رشته تصادفی طولانی (حداقل 32 کاراکتر)
   - `ADMIN_USERNAME=` نام کاربری مدیر
   - `ADMIN_PASSWORD=` رمز قوی مدیر (حداقل 8 کاراکتر)
5. Deploy کنید. Railway مقدار `PORT` را خودش فراهم می‌کند؛ برنامه روی `0.0.0.0` گوش می‌دهد.
6. بعد از Deploy، دامنه عمومی Railway را فعال کنید.

## نکات مهم

- اطلاعات برنامه و فایل‌های آپلودی روی Volume ذخیره می‌شوند و با Restart/Deploy از بین نمی‌روند.
- قبل از انتشار عمومی، مقدار پیش‌فرض `SESSION_SECRET` را حتماً با مقدار تصادفی جایگزین کنید.
- اگر `ADMIN_USERNAME` و `ADMIN_PASSWORD` تنظیم نشده باشند، مدیر اولیه ساخته نمی‌شود.
- Volume فعلی برای شروع مناسب است، ولی برای رشد جدی سایت بهتر است داده‌ها به PostgreSQL و فایل‌ها به Object Storage منتقل شوند.
- برای سایت مانهوا، حجم صفحات Reader می‌تواند سریع زیاد شود؛ فضای Volume را بر اساس حجم صفحات تنظیم کنید.
