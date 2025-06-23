// script.js

import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import {
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import { db } from "./firebase.js";
// ✅ Login
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      localStorage.setItem("loggedIn", "true");
      window.location.href = "dashboard.html";
    })
    .catch(() => {
      document.getElementById("error-msg").innerText = "Invalid email or password";
    });
};

// ✅ Auth Check
window.checkAuth = function () {
  if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "index.html";
  }
};

// ✅ Logout
window.logout = function () {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
};


window.loadLeads = async function () {
  const leadList = document.getElementById("sidebar-lead-list");
  leadList.innerHTML = ""; // Clear previous leads

  try {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = data.companyName || "Unnamed Lead";
      li.className = "lead-sidebar-item";
      li.onclick = () => {
        window.location.href = `lead-details.html?id=${doc.id}`;
      };
      leadList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading leads:", error);
  }
};




// ✅ Wait for DOM to load before attaching listeners
window.addEventListener("DOMContentLoaded", () => {
   
      loadLeads();
  const addLeadBtn = document.getElementById("add-lead-btn");
  const leadForm = document.getElementById("lead-form");

  if (addLeadBtn && leadForm) {
    addLeadBtn.addEventListener("click", () => {
      leadForm.classList.toggle("hidden");
    });
  }

  // If you're on dashboard.html, run auth check
  if (window.location.pathname.includes("dashboard.html")) {
    checkAuth();
  }
});

window.saveLead = async function () {
  const leadData = {
    companyName: document.getElementById("companyName").value,
    companyType: document.getElementById("companyType").value,
    gstNumber: document.getElementById("gstNumber").value,
    country: document.getElementById("country").value,
    city: document.getElementById("city").value,
    address: document.getElementById("address").value,
    contactPerson: document.getElementById("contactPerson").value,
    designation: document.getElementById("designation").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    whatsapp: document.getElementById("whatsapp").value,
    product: document.getElementById("product").value,
    quantity: document.getElementById("quantity").value,
    packaging: document.getElementById("packaging").value,
    deliveryTerms: document.getElementById("deliveryTerms").value,
    notes: document.getElementById("notes").value,
    followUpDate: document.getElementById("followUpDate").value,
    status: document.getElementById("status").value,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "leads"), leadData);

    // Success message
    alert("Lead saved successfully ✅");

    // Optional: reset form and hide
    document.getElementById("lead-form").reset();
    document.getElementById("lead-form").classList.add("hidden");
  } catch (error) {
    console.error("Error saving lead:", error);
    alert("Something went wrong while saving the lead ❌");
  }
};

window.searchLeads = async function () {
  const searchValue = document.getElementById("search-input").value.toLowerCase();
  const leadList = document.getElementById("sidebar-lead-list");

  leadList.innerHTML = ""; // Clear previous results

  try {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const name = (data.companyName || "").toLowerCase();

      if (name.includes(searchValue)) {
        const li = document.createElement("li");
        li.className = "lead-item"; // 👈 Use a custom class for consistent styling
        li.textContent = data.companyName || "Unnamed Lead";
        li.onclick = () => {
          window.location.href = `lead-details.html?id=${doc.id}`;
        };
        leadList.appendChild(li);
      }
    });

    if (leadList.innerHTML === "") {
      const li = document.createElement("li");
      li.className = "text-gray-500 italic px-2 py-1";
      li.textContent = "No matching leads";
      leadList.appendChild(li);
    }

  } catch (error) {
    console.error("Search error:", error);
  }
};


