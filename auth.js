// js/auth.js

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyUF1ZoWUXwaxrxUwSO_XbbLfXq0hK9gChLGP4dlZylt8mY5fY7WephKE4SlTP7P9YR/exec"; 

let generatedOTP = ""; // ওটিপি সাময়িকভাবে ধরে রাখার জন্য

// পপ-আপ ফর্ম খোলা ও বন্ধ করার ফাংশন
function showModal(id) {
    document.getElementById(id).style.display = "block";
}
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// ১. ইমেইলে OTP পাঠানো
async function sendOTP() {
    const email = document.getElementById("reg-email").value;
    const mobile = document.getElementById("reg-mobile").value;
    const password = document.getElementById("reg-password").value;

    if (!email || !mobile || !password) {
        alert("অনুগ্রহ করে সব তথ্য পূরণ করুন!");
        return;
    }

    alert("ওটিপি পাঠানো হচ্ছে... দয়া করে অপেক্ষা করুন।");

    try {
        const response = await fetch(https://script.google.com/macros/s/AKfycbyUF1ZoWUXwaxrxUwSO_XbbLfXq0hK9gChLGP4dlZylt8mY5fY7WephKE4SlTP7P9YR/exec, {
            method: "POST",
            body: JSON.stringify({
                action: "sendOTP",
                email: email
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            generatedOTP = result.otp; // ব্যাকএন্ড থেকে আসা OTP সেভ করে রাখা হলো
            document.getElementById("reg-step-1").style.display = "none";
            document.getElementById("reg-step-2").style.display = "block";
            alert("আপনার ইমেইল চেক করুন! ওটিপি পাঠানো হয়েছে।");
        } else {
            alert("ওটিপি পাঠাতে ব্যর্থ: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("সার্ভার ত্রুটি! আবার চেষ্টা করুন।");
    }
}

// ২. OTP ভেরিফাই এবং গুগল শীটে রেজিস্ট্রেশন সম্পন্ন করা
async function verifyOTPAndRegister() {
    const userOTP = document.getElementById("reg-otp").value;
    const email = document.getElementById("reg-email").value;
    const mobile = document.getElementById("reg-mobile").value;
    const password = document.getElementById("reg-password").value;

    if (userOTP !== generatedOTP) {
        alert("ভুল ওটিপি (OTP)! আবার চেষ্টা করুন।");
        return;
    }

    try {
        const response = await fetch(https://script.google.com/macros/s/AKfycbyUF1ZoWUXwaxrxUwSO_XbbLfXq0hK9gChLGP4dlZylt8mY5fY7WephKE4SlTP7P9YR/exec, {
            method: "POST",
            body: JSON.stringify({
                action: "register",
                email: email,
                mobile: mobile,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeModal("register-modal");
            // ফর্ম রিসেট করা
            document.getElementById("reg-step-1").style.display = "block";
            document.getElementById("reg-step-2").style.display = "none";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("রেজিস্ট্রেশন ব্যর্থ হয়েছে!");
    }
}

// ৩. লগইন হ্যান্ডেল করা (ইউজার এবং ডেভেলপার উভয়ের জন্য)
async function handleLogin() {
    const identity = document.getElementById("login-identity").value;
    const password = document.getElementById("login-password").value;

    if (!identity || !password) {
        alert("আইডি এবং পাসওয়ার্ড দিন!");
        return;
    }

    try {
        const response = await fetch(https://script.google.com/macros/s/AKfycbyUF1ZoWUXwaxrxUwSO_XbbLfXq0hK9gChLGP4dlZylt8mY5fY7WephKE4SlTP7P9YR/exec, {
            method: "POST",
            body: JSON.stringify({
                action: "login",
                identity: identity,
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeModal("login-modal");

            if (result.role === "developer") {
                // ডেভেলপার সেশন চালু করা এবং প্যানেল দেখানো
                localStorage.setItem("role", "developer");
                showDeveloperPanel(); 
            } else {
                // সাধারণ ইউজার সেশন চালু করা
                localStorage.setItem("role", "user");
                localStorage.setItem("userEmail", result.email);
                enableDownloads(); // ডাউনলোড বাটন সচল করা
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("লগইন করতে সমস্যা হচ্ছে!");
    }
}

// ৪. ডেভেলপার ও ইউজারের জন্য ইন্টারফেস পরিবর্তন করার ডামি ফাংশন (যা পরবর্তী ধাপে কোড করা হবে)
function showDeveloperPanel() {
    alert("আপনি এখন ডেভেলপার মোডে আছেন। ডাটা এন্ট্রি প্যানেল লোড হচ্ছে...");
    // এখানে আমরা পরে HTML চেঞ্জ করার লজিক লিখব
}

function enableDownloads() {
    alert("লগইন সফল! এখন আপনি পিডিএফ ডাউনলোড করতে পারবেন।");
}
