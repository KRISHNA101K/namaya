import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
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

// ✅ Load Leads with optional filters
window.loadLeads = async function (filters = {}) {
  const leadList = document.getElementById("sidebar-lead-list");
  leadList.innerHTML = "";

  try {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      const matchesProduct = !filters.product || data.products?.some(p => p.name?.toLowerCase().includes(filters.product));
      const matchesStatus = !filters.status || data.status === filters.status;
      const matchesCountry = !filters.country || data.country?.toLowerCase().includes(filters.country);
      const matchesType = !filters.companyType || data.companyType === filters.companyType;

      if (matchesProduct && matchesStatus && matchesCountry && matchesType) {
        const li = document.createElement("li");
        li.textContent = data.companyName || "Unnamed Lead";
        li.className = "lead-sidebar-item";
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
    console.error("Error loading leads:", error);
  }
};

// ✅ Apply filters
window.applyFilters = function () {
  const product = document.getElementById("filter-product")?.value?.toLowerCase().trim() || "";
  const status = document.getElementById("filter-status")?.value || "";
  const country = document.getElementById("filter-country")?.value?.toLowerCase().trim() || "";
  const companyType = document.getElementById("filter-companyType")?.value || "";

  loadLeads({
    product,
    status,
    country,
    companyType
  });
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

  if (window.location.pathname.includes("dashboard.html")) {
    checkAuth();
  }
});

// ✅ Save Lead
window.saveLead = async function () {
  const productRows = document.querySelectorAll("#product-container .product-row");
  const products = [];

  productRows.forEach((row) => {
    const name = row.querySelector('input[name="productName"]').value.trim();
    const qty = row.querySelector('input[name="quantity"]').value.trim();
    const packaging = row.querySelector('input[name="packaging"]').value.trim();

    if (name || qty || packaging) {
      products.push({ name, quantity: qty, packaging });
    }
  });

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
    deliveryTerms: document.getElementById("deliveryTerms").value,
    notes: document.getElementById("notes").value,
    followUpDate: document.getElementById("followUpDate").value,
    status: document.getElementById("status").value,
    products: products,
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "leads"), leadData);

    alert("Lead saved successfully ✅");

    document.getElementById("lead-form").reset();
    document.getElementById("lead-form").classList.add("hidden");

    const container = document.getElementById("product-container");
    container.innerHTML = "";
    addProductRow();
    loadLeads(); // Refresh list
  } catch (error) {
    console.error("Error saving lead:", error);
    alert("Something went wrong while saving the lead ❌");
  }
};

// ✅ Search Leads (basic by company name)
window.searchLeads = async function () {
  const searchValue = document.getElementById("search-input").value.toLowerCase();
  const leadList = document.getElementById("sidebar-lead-list");

  leadList.innerHTML = "";

  try {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const name = (data.companyName || "").toLowerCase();

      if (name.includes(searchValue)) {
        const li = document.createElement("li");
        li.className = "lead-item";
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

// ✅ Sidebar toggle
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebar = document.getElementById("sidebar");

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

// ✅ Add/Remove Product Row
window.addProductRow = function () {
  const container = document.getElementById("product-container");
  const div = document.createElement("div");
  div.className = "product-row";
  div.innerHTML = `
    <input type="text" name="productName" placeholder="Product Name" />
    <input type="text" name="quantity" placeholder="Quantity" />
    <input type="text" name="packaging" placeholder="Packaging" />
    <button type="button" onclick="removeProductRow(this)">❌</button>
  `;
  container.appendChild(div);
};

window.removeProductRow = function (button) {
  button.parentElement.remove();
};
