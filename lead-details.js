import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

import {  deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


// 🔍 Get the ID from URL
const urlParams = new URLSearchParams(window.location.search);
const leadId = urlParams.get("id");

const form = document.getElementById("lead-details-form");
let isEditable = false; // track edit mode globally

// ✅ Fetch the lead by ID and populate form
async function loadLead() {
  if (!leadId) return;

  const docRef = doc(db, "leads", leadId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    form.innerHTML = "<p>Lead not found.</p>";
    return;
  }

  const data = docSnap.data();

  // 👇 Define fixed field order
  const fieldOrder = [
    "companyName",
    "companyType",
    "gstNumber",
    "country",
    "city",
    "address",
    "contactPerson",
    "designation",
    "email",
    "phone",
    "whatsapp",
    "product",
    "quantity",
    "packaging",
    "deliveryTerms",
    "notes",
    "followUpDate",
    "status"
  ];

  // 💡 Clear the form first
  form.innerHTML = "";

  fieldOrder.forEach((key) => {
    const label = document.createElement("label");
    label.textContent = key;

    const input = document.createElement("input");
    input.type = "text";
    input.id = key;
    input.value = data[key] || "";
    input.disabled = true;
    input.className = "form-field";

    form.appendChild(label);
    form.appendChild(input);
  });

  // ✅ Add save button at the end
  const saveBtn = document.createElement("button");
  saveBtn.id = "save-btn";
  saveBtn.textContent = "Save Changes";
  saveBtn.style.display = "none";
  saveBtn.type = "submit";

  form.appendChild(saveBtn);
}



// ✅ Toggle Edit Mode
window.toggleEditMode = function () {
  isEditable = !isEditable;

  const inputs = document.querySelectorAll("#lead-details-form input");
  inputs.forEach((input) => {
    input.disabled = !isEditable;
  });

  // Toggle Save button
  const saveBtn = document.getElementById("save-btn");
  saveBtn.style.display = isEditable ? "inline-block" : "none";

  // Update button text
  document.getElementById("edit-btn").textContent = isEditable ? "🔒 Cancel" : "✏️ Edit";
};

// ✅ Update Data
window.updateLead = async function () {
  const updatedData = {};

  Array.from(form.elements).forEach((el) => {
    if (el.tagName === "INPUT") {
      updatedData[el.id] = el.value;
    }
  });

  try {
    await updateDoc(doc(db, "leads", leadId), updatedData);
    alert("Lead updated successfully ✅");
  } catch (error) {
    console.error("Error updating lead:", error);
    alert("Failed to update lead ❌");
  }
};

// ✅ Go back to dashboard
window.goBack = function () {
  window.location.href = "dashboard.html";
};

loadLead();

window.deleteLead = async function () {
  if (!leadId) return;

  const confirmDelete = confirm("Are you sure you want to delete this lead? This action cannot be undone.");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "leads", leadId));
    alert("Lead deleted successfully ✅");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error deleting lead:", error);
    alert("Failed to delete lead ❌");
  }
};
