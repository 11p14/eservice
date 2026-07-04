/**
 * ============================================================
 *  Code.gs  —  ব্যাকএন্ড (Google Apps Script)
 * ============================================================
 *  এই ফাইলটা Google Sheet-কে ডেটাবেস হিসেবে ব্যবহার করে একটা
 *  REST-এর মতো API তৈরি করে। ওয়েবসাইটের HTML/JS থেকে fetch()
 *  দিয়ে এই API-কে কল করা হবে।
 *
 *  শীট (Sheet) স্ট্রাকচার:
 *  ------------------------------------------------------------
 *  1) Users        : Email | Mobile | PasswordHash | Salt | Verified | OTP | OTPExpiry | Token | CreatedAt
 *  2) Content      : Id | Category | Subcategory | Title | Description | FileUrl | ImageUrl | CreatedAt
 *     (Category  উদাহরণ: ebook, grammar, paragraph, story, letter, cv-template ইত্যাদি)
 *  3) AdminLog     : Timestamp | Action | Detail   (ঐচ্ছিক — কে কী পরিবর্তন করলো তার হিস্ট্রি)
 * ============================================================
 */

// ---------- কনফিগারেশন ----------
// File > Project properties > Script properties এ এগুলো সেট করবে (হার্ডকোড না করে)
const SS_ID          = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const ADMIN_USER      = PropertiesService.getScriptProperties().getProperty('ADMIN_USER');
const ADMIN_PASS      = PropertiesService.getScriptProperties().getProperty('ADMIN_PASS');
const TOKEN_SECRET    = PropertiesService.getScriptProperties().getProperty('TOKEN_SECRET'); // যেকোনো লম্বা random string

function getSS_() {
  return SpreadsheetApp.openById(SS_ID);
}
function sheet_(name) {
  const ss = getSS_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

// ---------- ইউটিলিটি ----------
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function hashPassword_(password, salt) {
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, password + salt, Utilities.Charset.UTF_8);
  return raw.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function makeSalt_() {
  return Utilities.getUuid();
}

function makeToken_(email) {
  const payload = email + '|' + new Date().getTime() + '|' + TOKEN_SECRET;
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, payload);
  return raw.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('');
}

function findUserRow_(sh, email) {
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase() === String(email).toLowerCase()) {
      return { row: i + 1, values: data[i] };
    }
  }
  return null;
}

// ---------- doGet: পাবলিক ডেটা রিড (কনটেন্ট লিস্ট, ইউজার ভেরিফাই) ----------
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getContent') {
    const category = e.parameter.category;
    const sh = sheet_('Content');
    const data = sh.getDataRange().getValues();
    const header = data[0];
    const rows = data.slice(1)
      .filter(r => !category || r[1] === category)
      .map(r => {
        const obj = {};
        header.forEach((h, i) => obj[h] = r[i]);
        return obj;
      });
    return json_({ ok: true, data: rows });
  }

  if (action === 'checkToken') {
    const token = e.parameter.token;
    const sh = sheet_('Users');
    const data = sh.getDataRange().getValues();
    const valid = data.slice(1).some(r => r[7] === token && r[4] === true);
    return json_({ ok: true, valid });
  }

  return json_({ ok: false, error: 'Unknown GET action' });
}

// ---------- doPost: রেজিস্ট্রেশন, লগইন, অ্যাডমিন এন্ট্রি ----------
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;

  switch (action) {
    case 'register':        return handleRegister_(body);
    case 'verifyOtp':       return handleVerifyOtp_(body);
    case 'login':           return handleLogin_(body);
    case 'forgotPassword':  return handleForgotPassword_(body);
    case 'resetPassword':   return handleResetPassword_(body);
    case 'adminLogin':      return handleAdminLogin_(body);
    case 'addContent':      return handleAddContent_(body);
    case 'editContent':     return handleEditContent_(body);
    case 'deleteContent':   return handleDeleteContent_(body);
    default:
      return json_({ ok: false, error: 'Unknown POST action' });
  }
}

// ---------- ইউজার রেজিস্ট্রেশন (ধাপ ১: OTP পাঠানো) ----------
function handleRegister_(body) {
  const { email, mobile, password } = body;
  if (!email || !password) return json_({ ok: false, error: 'ইমেইল ও পাসওয়ার্ড দরকার' });

  const sh = sheet_('Users');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Email', 'Mobile', 'PasswordHash', 'Salt', 'Verified', 'OTP', 'OTPExpiry', 'Token', 'CreatedAt']);
  }

  const existing = findUserRow_(sh, email);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date().getTime() + 10 * 60 * 1000; // ১০ মিনিট
  const salt = makeSalt_();
  const hash = hashPassword_(password, salt);

  if (existing && existing.values[4] === true) {
    return json_({ ok: false, error: 'এই ইমেইল দিয়ে আগে থেকেই ভেরিফাইড অ্যাকাউন্ট আছে' });
  }

  if (existing) {
    sh.getRange(existing.row, 1, 1, 9).setValues([[email, mobile, hash, salt, false, otp, expiry, '', new Date()]]);
  } else {
    sh.appendRow([email, mobile, hash, salt, false, otp, expiry, '', new Date()]);
  }

  MailApp.sendEmail({
    to: email,
    subject: 'আপনার ভেরিফিকেশন কোড',
    body: `আপনার OTP কোড: ${otp}\nএই কোডটি ১০ মিনিটের জন্য বৈধ।`
  });

  return json_({ ok: true, message: 'OTP পাঠানো হয়েছে, ইমেইল চেক করুন' });
}

// ---------- ধাপ ২: OTP ভেরিফাই করে অ্যাকাউন্ট সম্পন্ন করা ----------
function handleVerifyOtp_(body) {
  const { email, otp } = body;
  const sh = sheet_('Users');
  const user = findUserRow_(sh, email);
  if (!user) return json_({ ok: false, error: 'ইউজার পাওয়া যায়নি' });

  const [, , , , , storedOtp, expiry] = user.values;
  if (new Date().getTime() > expiry) return json_({ ok: false, error: 'OTP-র মেয়াদ শেষ হয়ে গেছে' });
  if (String(storedOtp) !== String(otp)) return json_({ ok: false, error: 'ভুল OTP' });

  const token = makeToken_(email);
  sh.getRange(user.row, 5).setValue(true);   // Verified
  sh.getRange(user.row, 8).setValue(token);  // Token

  return json_({ ok: true, token, message: 'অ্যাকাউন্ট ভেরিফাই সম্পন্ন হয়েছে' });
}

// ---------- ইউজার লগইন ----------
function handleLogin_(body) {
  const { email, password } = body;
  const sh = sheet_('Users');
  const user = findUserRow_(sh, email);
  if (!user) return json_({ ok: false, error: 'অ্যাকাউন্ট পাওয়া যায়নি' });

  const [, , hash, salt, verified] = user.values;
  if (!verified) return json_({ ok: false, error: 'অ্যাকাউন্ট এখনো ভেরিফাইড না' });
  if (hashPassword_(password, salt) !== hash) return json_({ ok: false, error: 'পাসওয়ার্ড ভুল' });

  const token = makeToken_(email);
  sh.getRange(user.row, 8).setValue(token);
  return json_({ ok: true, token });
}

// ---------- Forgot / Reset Password ----------
function handleForgotPassword_(body) {
  const { email } = body;
  const sh = sheet_('Users');
  const user = findUserRow_(sh, email);
  if (!user) return json_({ ok: false, error: 'অ্যাকাউন্ট পাওয়া যায়নি' });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiry = new Date().getTime() + 10 * 60 * 1000;
  sh.getRange(user.row, 6, 1, 2).setValues([[otp, expiry]]);

  MailApp.sendEmail({
    to: email,
    subject: 'পাসওয়ার্ড রিসেট কোড',
    body: `আপনার পাসওয়ার্ড রিসেট কোড: ${otp}`
  });
  return json_({ ok: true, message: 'রিসেট কোড ইমেইলে পাঠানো হয়েছে' });
}

function handleResetPassword_(body) {
  const { email, otp, newPassword } = body;
  const sh = sheet_('Users');
  const user = findUserRow_(sh, email);
  if (!user) return json_({ ok: false, error: 'অ্যাকাউন্ট পাওয়া যায়নি' });

  const [, , , , , storedOtp, expiry] = user.values;
  if (new Date().getTime() > expiry) return json_({ ok: false, error: 'কোডের মেয়াদ শেষ' });
  if (String(storedOtp) !== String(otp)) return json_({ ok: false, error: 'ভুল কোড' });

  const salt = makeSalt_();
  const hash = hashPassword_(newPassword, salt);
  sh.getRange(user.row, 3, 1, 2).setValues([[hash, salt]]);
  return json_({ ok: true, message: 'পাসওয়ার্ড পরিবর্তন সম্পন্ন হয়েছে' });
}

// ---------- অ্যাডমিন লগইন (আলাদা অ্যাকাউন্ট সিস্টেম নেই, Script Properties দিয়ে) ----------
function handleAdminLogin_(body) {
  const { username, password } = body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = makeToken_('admin::' + username);
    PropertiesService.getScriptProperties().setProperty('ADMIN_TOKEN', token);
    return json_({ ok: true, token });
  }
  return json_({ ok: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড' });
}

function isAdmin_(token) {
  return token && token === PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
}

// ---------- কনটেন্ট CRUD (শুধু অ্যাডমিন) ----------
function handleAddContent_(body) {
  if (!isAdmin_(body.adminToken)) return json_({ ok: false, error: 'অনুমতি নেই' });
  const sh = sheet_('Content');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Id', 'Category', 'Subcategory', 'Title', 'Description', 'FileUrl', 'ImageUrl', 'CreatedAt']);
  }
  const id = Utilities.getUuid();
  sh.appendRow([id, body.category, body.subcategory || '', body.title, body.description || '', body.fileUrl || '', body.imageUrl || '', new Date()]);
  return json_({ ok: true, id });
}

function handleEditContent_(body) {
  if (!isAdmin_(body.adminToken)) return json_({ ok: false, error: 'অনুমতি নেই' });
  const sh = sheet_('Content');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.id) {
      sh.getRange(i + 1, 2, 1, 6).setValues([[body.category, body.subcategory || '', body.title, body.description || '', body.fileUrl || '', body.imageUrl || '']]);
      return json_({ ok: true });
    }
  }
  return json_({ ok: false, error: 'কনটেন্ট পাওয়া যায়নি' });
}

function handleDeleteContent_(body) {
  if (!isAdmin_(body.adminToken)) return json_({ ok: false, error: 'অনুমতি নেই' });
  const sh = sheet_('Content');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.id) {
      sh.deleteRow(i + 1);
      return json_({ ok: true });
    }
  }
  return json_({ ok: false, error: 'কনটেন্ট পাওয়া যায়নি' });
}
