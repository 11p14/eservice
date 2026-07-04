# লার্নিংহাব — সম্পূর্ণ সেটআপ গাইড (ধাপে ধাপে)

এই প্রজেক্টটা তিনটা অংশে ভাগ করা:
1. **Google Sheet** — ডেটাবেস হিসেবে কাজ করবে
2. **Google Apps Script (GAS)** — ব্যাকএন্ড API, `apps-script/Code.gs`
3. **স্ট্যাটিক ওয়েবসাইট** — `site/` ফোল্ডার, GitHub Pages-এ হোস্ট হবে

---

## ধাপ ১ — Google Sheet তৈরি করা

1. [sheets.google.com](https://sheets.google.com) এ গিয়ে নতুন একটা Spreadsheet বানাও, নাম দাও যেমন `LearningHub-DB`।
2. URL থেকে **Sheet ID** কপি করে রাখো —
   `https://docs.google.com/spreadsheets/d/এইখানের_আইডি/edit`
3. শীট দুটো ট্যাব লাগবে (কোড নিজে থেকেই বানিয়ে নেবে, তবুও জেনে রাখা ভালো):
   - `Users` — Email, Mobile, PasswordHash, Salt, Verified, OTP, OTPExpiry, Token, CreatedAt
   - `Content` — Id, Category, Subcategory, Title, Description, FileUrl, ImageUrl, CreatedAt

---

## ধাপ ২ — Apps Script প্রজেক্ট বানানো

1. Sheet-এর ভেতরে **Extensions → Apps Script** এ ক্লিক করো।
2. যেই এডিটর খুলবে, সেখানে ডিফল্ট `Code.gs` এর সব কোড মুছে `apps-script/Code.gs` ফাইলের পুরো কোড পেস্ট করো।
3. বামপাশে **Project Settings (⚙️)** এ গিয়ে `appsscript.json` ফাইল দেখাও (Show "appsscript.json" checkbox অন করো), তারপর `apps-script/appsscript.json` এর কন্টেন্ট দিয়ে রিপ্লেস করো।
4. **Project Settings → Script Properties** এ গিয়ে এই ৪টা প্রপার্টি যোগ করো:

   | Key | Value |
   |---|---|
   | `SHEET_ID` | ধাপ ১ থেকে কপি করা Sheet ID |
   | `ADMIN_USER` | তোমার পছন্দমতো অ্যাডমিন ইউজারনেম |
   | `ADMIN_PASS` | তোমার পছন্দমতো শক্তিশালী পাসওয়ার্ড |
   | `TOKEN_SECRET` | যেকোনো লম্বা random string (যেমন: `xY9!kLp2Qz...`) |

---

## ধাপ ৩ — Web App হিসেবে Deploy করা

1. Apps Script এডিটরে উপরে ডানদিকে **Deploy → New deployment** ক্লিক করো।
2. Type হিসেবে **Web app** বেছে নাও।
3. Execute as: **Me**, Who has access: **Anyone** সেট করো।
4. **Deploy** এ ক্লিক করলে একটা URL পাবে, যেটা `.../exec` দিয়ে শেষ হয় — এই লিংকটাই তোমার API URL।
5. প্রথমবার একটা পারমিশন স্ক্রিন আসবে (Gmail পাঠানো ও Sheet এক্সেসের অনুমতি) — allow করে দাও।

> ⚠️ কোড পরিবর্তন করলে প্রতিবার **Deploy → Manage deployments → Edit → New version** করে আপডেট দিতে হবে, নাহলে পুরনো ভার্সনই চলতে থাকবে।

---

## ধাপ ৪ — ফ্রন্টএন্ডের সাথে যুক্ত করা

1. `site/js/api.js` ফাইল খোলো।
2. `GAS_URL` ভ্যারিয়েবলে ধাপ ৩ থেকে পাওয়া `.../exec` লিংকটা বসাও:
   ```js
   const GAS_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
   ```

---

## ধাপ ৫ — GitHub-এ পাবলিশ করা

1. GitHub-এ নতুন একটা রিপোজিটরি বানাও (যেমন `learning-hub`)।
2. `site/` ফোল্ডারের **ভেতরের সব ফাইল** রিপোর রুটে আপলোড করো (অথবা পুরো `site/` ফোল্ডার আপলোড করে GitHub Pages সেটিংসে `/site` কে সোর্স হিসেবে বেছে নাও)।
3. রিপোর **Settings → Pages** এ গিয়ে Branch হিসেবে `main` (এবং ফোল্ডার `/` বা `/site`, যেটা আপলোড করেছ) বেছে **Save** করো।
4. কিছুক্ষণ পর `https://তোমার-ইউজারনেম.github.io/learning-hub/` লিংকে সাইট লাইভ হয়ে যাবে।

---

## ধাপ ৬ — টেস্ট করা

1. সাইটে গিয়ে **অ্যাকাউন্ট খুলুন** এ ক্লিক করে একটা টেস্ট ইমেইল/পাসওয়ার্ড দিয়ে রেজিস্টার করো।
2. ইমেইলে যাওয়া ৬ সংখ্যার OTP দিয়ে ভেরিফাই করো — সফল হলে অটো লগইন হয়ে যাবে।
3. `pages/admin.html` এ গিয়ে Script Properties-এ সেট করা `ADMIN_USER`/`ADMIN_PASS` দিয়ে লগইন করো।
4. একটা টেস্ট e-Book এন্ট্রি যোগ করো (Category: `ebook`, FileUrl-এ যেকোনো Google Drive শেয়ার-লিংক দাও)।
5. হোমপেজে/`pages/ebook.html` এ গিয়ে দেখো এন্ট্রিটা দেখাচ্ছে কিনা, এবং লগআউট অবস্থায় ডাউনলোড করতে গেলে লগইন পেজে রিডাইরেক্ট হচ্ছে কিনা।

---

## নতুন সেকশন যোগ করার প্যাটার্ন

`pages/ebook.html` বা `pages/study.html` হলো টেমপ্লেট। নতুন কোনো কনটেন্ট-সেকশন (Quiz, Exam ইত্যাদি) বানাতে চাইলে:

1. একই ফাইল কপি করো।
2. `apiGet({ action: 'getContent', category: 'তোমার-ক্যাটাগরি' })` এ ক্যাটাগরির নাম বদলাও।
3. অ্যাডমিন প্যানেল থেকে সেই একই ক্যাটাগরি নামে কনটেন্ট এন্ট্রি করো — ব্যাস, নতুন সেকশন রেডি।

এভাবে Grammar, Paragraph, Story Writing, Letter Writing, Quiz, Exam সবকিছুই একই `Content` শীট আর একই কোড-প্যাটার্ন দিয়ে চলবে, শুধু `category` ভ্যালু আলাদা।

---

## যেসব ফিচার এই কাঠামোর বাইরে (আলাদাভাবে বানাতে হবে)

- **CV Maker** — সম্পূর্ণ ক্লায়েন্ট-সাইড ফর্ম + `jsPDF`/`html2pdf.js` দিয়ে PDF জেনারেট করবে; Sheet-এ কিছু জমা রাখার দরকার নেই।
- **AI Tools (Photo Enhancer, Remove Background)** — এগুলোর জন্য থার্ড-পার্টি API লাগবে (যেমন `remove.bg`)। Passport Size Maker Canvas API দিয়ে ব্যাকএন্ড ছাড়াই সম্ভব।
- **PDF Tools** — `pdf.js`, `jsPDF`, `pdf-lib` — এই লাইব্রেরিগুলো দিয়ে সব ব্রাউজারেই করা যায়, কোনো ব্যাকএন্ড লাগে না।

`pages/cv-maker.html`, `pages/ai-tools.html`, `pages/pdf-tools.html` এ প্লেসহোল্ডার পেজ রাখা আছে যাতে বোঝা যায় প্রতিটা কীভাবে বানাতে হবে।

---

## নিরাপত্তা সম্পর্কিত সতর্কতা (শেখার প্রজেক্ট হিসেবে গুরুত্বপূর্ণ)

- এই সেটআপে পাসওয়ার্ড SHA-256 + salt দিয়ে হ্যাশ করা হয় — এটা শেখার জন্য ঠিক আছে, কিন্তু production-grade সিস্টেমে bcrypt/argon2-এর মতো slow-hashing ব্যবহার করা উচিত (Apps Script-এ এগুলো নেই)।
- `ADMIN_USER`/`ADMIN_PASS` কখনো কোডে হার্ডকোড করবে না — সবসময় Script Properties এ রাখবে, কারণ GitHub-এ কোড পাবলিক থাকলে যে কেউ দেখতে পাবে।
- Google Apps Script-এর ফ্রি কোটা আছে (দিনে ইমেইল পাঠানোর সংখ্যা, execution time ইত্যাদি) — বড় পরিসরে ইউজার বাড়লে এটা মাথায় রাখতে হবে।

---

## ফাইল স্ট্রাকচার সারসংক্ষেপ

```
apps-script/
  Code.gs           ← Google Apps Script এ পেস্ট করবে
  appsscript.json   ← Apps Script প্রজেক্ট সেটিংসে বসাবে
site/
  index.html        ← হোমপেজ (নেভবার, হিরো, e-Book প্রিভিউ)
  css/style.css     ← পুরো সাইটের ডিজাইন
  js/api.js         ← ব্যাকএন্ডের সাথে কথা বলার লজিক (GAS_URL এখানে বসাও)
  pages/
    register.html         ← অ্যাকাউন্ট খোলা + OTP ভেরিফিকেশন
    login.html             ← লগইন
    forgot-password.html   ← পাসওয়ার্ড রিসেট
    admin.html             ← অ্যাডমিন প্যানেল (কনটেন্ট এন্ট্রি/এডিট/ডিলিট)
    ebook.html             ← কনটেন্ট-লিস্ট টেমপ্লেট (Study সেকশনগুলোর মডেল)
    study.html             ← Grammar/Paragraph/Story/Letter ইত্যাদির জেনেরিক পেজ
    cv-maker.html          ← প্লেসহোল্ডার + নির্দেশনা
    ai-tools.html          ← প্লেসহোল্ডার + নির্দেশনা
    pdf-tools.html         ← প্লেসহোল্ডার + নির্দেশনা
    about.html
```
