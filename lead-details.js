import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const leadId = urlParams.get("id");
const form = document.getElementById("lead-details-form");

let isEditable = false;
let currentData = null;

const dropdownFields = {
  companyType: ["Supplier", "Manufacturer", "Importer", "Exporter"],
  deliveryTerms: ["FOB", "CIF", "EXW", "DDP"],
  status: ["Interested", "Not Interested", "Quoted", "Finalized"]
};

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
  "deliveryTerms",
  "notes",
  "followUpDate",
  "status"
];

async function loadLead() {
  if (!leadId) return;

  const docRef = doc(db, "leads", leadId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    form.innerHTML = "<p>Lead not found.</p>";
    return;
  }

  const data = docSnap.data();
  currentData = data;
  form.innerHTML = ""; // Clear

  fieldOrder.forEach((key) => {
    const label = document.createElement("label");
    label.textContent = key;

    let input;
    if (dropdownFields[key]) {
      input = document.createElement("select");
      dropdownFields[key].forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        if (data[key] === opt) option.selected = true;
        input.appendChild(option);
      });
    } else if (key === "followUpDate") {
      input = document.createElement("input");
      input.type = "date";
      if (data[key]) {
        input.value = new Date(data[key]).toISOString().substring(0, 10);
      }
    } else if (key === "notes" || key === "address") {
      input = document.createElement("textarea");
      input.value = data[key] || "";
    } else {
      input = document.createElement("input");
      input.type = key === "email" ? "email" : "text";
      input.value = data[key] || "";
    }

    input.id = key;
    input.disabled = true;
    input.className = "form-field";
    input.className = "form-field";
    form.appendChild(label);
    form.appendChild(input);
  });

  const productHeading = document.createElement("div");
  productHeading.className = "product-section-heading";
  productHeading.textContent = "Products";
  form.appendChild(productHeading);

  const productContainer = document.createElement("div");
  productContainer.id = "product-container";
  form.appendChild(productContainer);

  const products = Array.isArray(data.products) ? data.products : [];
  products.forEach((product) => {
    addProductRow(product.name, product.quantity, product.packaging);
  });

  const addProductBtn = document.createElement("button");
  addProductBtn.type = "button";
  addProductBtn.id = "add-product-btn";
  addProductBtn.textContent = "+ Add Product";
  addProductBtn.onclick = () => addProductRow();
  form.appendChild(addProductBtn);

  const saveBtnWrapper = document.createElement("div");
  saveBtnWrapper.style.marginTop = "20px";

  const saveBtn = document.createElement("button");
  saveBtn.id = "save-btn";
  saveBtn.textContent = "Save Changes";
  saveBtn.type = "submit";
  saveBtn.style.display = "none";

  saveBtnWrapper.appendChild(saveBtn);
  form.appendChild(saveBtnWrapper);
}

window.addProductRow = function (name = "", quantity = "", packaging = "") {
  const container = document.getElementById("product-container");

  const row = document.createElement("div");
  row.className = "product-row";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Product Name";
  nameInput.value = name;
  nameInput.disabled = !isEditable;

  const qtyInput = document.createElement("input");
  qtyInput.placeholder = "Quantity";
  qtyInput.value = quantity;
  qtyInput.disabled = !isEditable;

  const pkgInput = document.createElement("input");
  pkgInput.placeholder = "Packaging";
  pkgInput.value = packaging;
  pkgInput.disabled = !isEditable;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.onclick = () => row.remove();
  removeBtn.style.display = isEditable ? "inline-block" : "none";

  row.appendChild(nameInput);
  row.appendChild(qtyInput);
  row.appendChild(pkgInput);
  row.appendChild(removeBtn);

  container.appendChild(row);
};

window.toggleEditMode = function () {
  isEditable = !isEditable;

  fieldOrder.forEach((key) => {
    const input = document.getElementById(key);
    if (input) {
      input.disabled = !isEditable;
    }
  });

  document.querySelectorAll(".product-row input").forEach((input) => {
    input.disabled = !isEditable;
  });

  document.querySelectorAll(".product-row button").forEach((btn) => {
    btn.style.display = isEditable ? "inline-block" : "none";
  });

  const addBtn = document.getElementById("add-product-btn");
  if (addBtn) addBtn.style.display = isEditable ? "inline-block" : "none";

  document.getElementById("save-btn").style.display = isEditable ? "inline-block" : "none";
  document.getElementById("edit-btn").textContent = isEditable ? "🔒 Cancel" : "✏️ Edit";
};

window.updateLead = async function () {
  const updatedData = {};
  fieldOrder.forEach((key) => {
    const input = document.getElementById(key);
    updatedData[key] = input ? input.value : "";
  });

  // Products
  const productRows = document.querySelectorAll(".product-row");
  updatedData.products = [];
  productRows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    if (inputs.length === 3) {
      const [name, quantity, packaging] = inputs;
      if (name.value || quantity.value || packaging.value) {
        updatedData.products.push({
          name: name.value,
          quantity: quantity.value,
          packaging: packaging.value
        });
      }
    }
  });

  try {
    await updateDoc(doc(db, "leads", leadId), updatedData);
    alert("Lead updated successfully ✅");
    toggleEditMode();
  } catch (error) {
    console.error("Error updating lead:", error);
    alert("Failed to update lead ❌");
  }
};

window.deleteLead = async function () {
  if (!leadId) return;
  const confirmDelete = confirm("Are you sure you want to delete this lead?");
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

window.goBack = function () {
  window.location.href = "dashboard.html";
};

// Initialize on page load
loadLead();
