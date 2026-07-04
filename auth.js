const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyUF1ZoWUXwaxrxUwSO_XbbLfXq0hK9gChLGP4dlZylt8mY5fY7WephKE4SlTP7P9YR/exec"; 

let generatedOTP = ""; 

window.onload = function() {
    const role = localStorage.getItem("role");
    if (role === "developer") {
        showDeveloperPanel();
    } else if (role === "user") {
        enableDownloads();
    }
};

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "block";
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "none";
    }
}

async function sendOTP() {
    const email = document.getElementById("reg-email").value;
    const mobile = document.getElementById("reg-mobile").value;
    const password = document.getElementById("reg-password").value;

    if (!email || !mobile || !password) {
        alert("অনুগ্রহ করে সব তথ্য পূরণ করুন!");
        return;
    }

    alert("ওটিপি পাঠানো হচ্ছে... দয়া করে অপেক্ষা করুন।");

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "sendOTP",
                email: email
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            generatedOTP = result.otp;
            document.getElementById("reg-step-1").style.display = "none";
            document.getElementById("reg-step-2").style.display = "block";
            alert("আপনার ইমেইল চেক করুন! ওটিপি পাঠানো হয়েছে।");
        } else {
            alert("ওটিপি পাঠাতে ব্যর্থ: " + result.error);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("সার্ভার ত্রুটি! আবার চেষ্টা করুন।");
    }
}

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
        const response = await fetch(WEB_APP_URL, {
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
            document.getElementById("reg-step-1").style.display = "block";
            document.getElementById("reg-step-2").style.display = "none";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("রেজিস্ট্রেশন ব্যর্থ হয়েছে!");
    }
}

async function handleLogin() {
    const identity = document.getElementById("login-identity").value;
    const password = document.getElementById("login-password").value;

    if (!identity || !password) {
        alert("ইমেইল অথবা মোবাইল নম্বর এবং পাসওয়ার্ড দিন!");
        return;
    }

    try {
        const response = await fetch(WEB_APP_URL, {
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
                localStorage.setItem("role", "developer");
                showDeveloperPanel(); 
            } else {
                localStorage.setItem("role", "user");
                localStorage.setItem("userEmail", result.email);
                enableDownloads(); 
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("লগইন করতে সমস্যা হচ্ছে!");
    }
}

function showDeveloperPanel() {
    document.getElementById("developer-panel").style.display = "block";
    document.getElementById("home").style.display = "none";
}

function enableDownloads() {
    console.log("ইউজার লগইন অবস্থায় আছেন। পিডিএফ ডাউনলোড সুবিধা আনলকড।");
}

async function submitDataEntry() {
    const selectedSheet = document.getElementById("select-sheet").value;
    let rowData = [];

    const cat = document.getElementById("ebook-category").value;
    const title = document.getElementById("ebook-title").value;
    const link = document.getElementById("ebook-link").value;

    if (!cat || !title || !link) { 
        alert("অনুগ্রহ করে সব তথ্য পূরণ করুন!"); 
        return; 
    }
    
    if (selectedSheet === "E_Books") {
        rowData = ["BK-" + Date.now(), cat, title, "https://via.placeholder.com/150", link];
    } else if (selectedSheet === "Study_Materials") {
        rowData = ["MAT-" + Date.now(), cat, title, "Text Content", link];
    }

    alert("ডাটা গুগল শীটে পাঠানো হচ্ছে...");

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "insertData",
                sheetName: selectedSheet,
                rowData: rowData
            })
        });
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            document.getElementById("ebook-category").value = "";
            document.getElementById("ebook-title").value = "";
            document.getElementById("ebook-link").value = "";
        } else {
            alert("ব্যর্থ: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("ডাটা সেভ করতে সমস্যা হয়েছে।");
    }
}

function logout() {
    localStorage.clear();
    alert("লগআউট সফল হয়েছে!");
    location.reload();
}
