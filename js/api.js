/**
 * api.js — Apps Script ব্যাকএন্ডের সাথে কথা বলার একমাত্র জায়গা।
 * এখানে GAS_URL বসাতে হবে (ডিপ্লয় করার পর যেই /exec লিংক পাবে)।
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwWnBrJPB-qQdQsEye2y5lya_Grk0tAD366oPUin2fmksR2KFYrp3aTSoesHBm7qid5/exec';

async function apiGet(params) {
  try {
    const qs = new URLSearchParams(params).toString();
    // এখানে GAS_URL ব্যবহার করা হয়েছে এবং কোটেশন মার্কের ভুল ঠিক করা হয়েছে
    const res = await fetch(`${GAS_URL}?${qs}`);
    
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error("GET Request Failed:", error);
    return { success: false, error: error.message };
  }
}

async function apiPost(payload) {
  try {
    // এখানেও হার্ডকোডেড লিংকের বদলে GAS_URL ব্যবহার করা হয়েছে
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error("POST Request Failed:", error);
    return { success: false, error: error.message };
  }
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
    
    document.getElementById('logout-btn').onclick = () => { 
      Session.clear(); 
      // লগআউট করার পর পেজ রিফ্রেশ হবে যেন সুরক্ষিত ডেটা স্ক্রিন থেকে চলে যায়
      window.location.reload(); 
    };
  } else {
    el.innerHTML = `<a class="btn ghost" href="pages/login.html">লগইন</a>
                    <a class="btn" href="pages/register.html">অ্যাকাউন্ট খুলুন</a>`;
  }
}

document.addEventListener('DOMContentLoaded', renderAuthArea);
