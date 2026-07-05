/**
 * api.js — Apps Script ব্যাকএন্ডের সাথে কথা বলার একমাত্র জায়গা।
 * এখানে GAS_URL বসাতে হবে (ডিপ্লয় করার পর যেই /exec লিংক পাবে)।
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwWnBrJPB-qQdQsEye2y5lya_Grk0tAD366oPUin2fmksR2KFYrp3aTSoesHBm7qid5/exec';

async function apiGet(params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${'https://script.google.com/macros/s/AKfycbwWnBrJPB-qQdQsEye2y5lya_Grk0tAD366oPUin2fmksR2KFYrp3aTSoesHBm7qid5/exec'}?${qs}`);
  return res.json();
}

async function apiPost(payload) {
  const res = await fetch('https://script.google.com/macros/s/AKfycbwWnBrJPB-qQdQsEye2y5lya_Grk0tAD366oPUin2fmksR2KFYrp3aTSoesHBm7qid5/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS doPost সহজ পার্স করতে text/plain ভালো কাজ করে
    body: JSON.stringify(payload)
  });
  return res.json();
}

// ---------- সেশন হেল্পার ----------
const Session = {
  setToken(token) { localStorage.setItem('user_token', token); },
  getToken() { return localStorage.getItem('user_token'); },
  clear() { localStorage.removeItem('user_token'); },
  isLoggedIn() { return !!localStorage.getItem('user_token'); },

  setAdminToken(token) { localStorage.setItem('admin_token', token); },
  getAdminToken() { return localStorage.getItem('admin_token'); },
  clearAdmin() { localStorage.removeItem('admin_token'); },
  isAdmin() { return !!localStorage.getItem('admin_token'); }
};

// ---------- হেডার/নেভবারের লগইন-স্টেট রিফ্রেশ করা ----------
function renderAuthArea() {
  const el = document.getElementById('auth-area');
  if (!el) return;
  if (Session.isLoggedIn()) {
    el.innerHTML = `<button class="btn ghost" id="logout-btn">লগআউট</button>`;
    document.getElementById('logout-btn').onclick = () => { Session.clear(); renderAuthArea(); };
  } else {
    el.innerHTML = `<a class="btn ghost" href="pages/login.html">লগইন</a>
                     <a class="btn" href="pages/register.html">অ্যাকাউন্ট খুলুন</a>`;
  }
}
document.addEventListener('DOMContentLoaded', renderAuthArea);
