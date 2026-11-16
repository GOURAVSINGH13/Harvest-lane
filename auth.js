/* Harvest Lane - shared helpers (demo only: data lives in this browser's localStorage) */
const SESSION_KEY = "harvestLane_currentUser";
const PRODUCTS_KEY = "harvestLane_products";

function getUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
  catch (e) { return null; }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  location.href = "index.html";
}

function getStoredProducts() {
  try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]"); }
  catch (e) { return []; }
}

function saveStoredProducts(list) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

/* Escape text before putting it inside innerHTML (stops users injecting HTML) */
function esc(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* ---------- Login / register page logic ----------
   Each auth page defines: ROLE, REDIRECT and getExtraData() before loading this file. */
let mode = "login";

function showMode(nextMode) {
  mode = nextMode;
  document.getElementById("loginTab").classList.toggle("active", mode === "login");
  document.getElementById("registerTab").classList.toggle("active", mode === "register");
  document.getElementById("nameField").style.display = mode === "register" ? "block" : "none";
  const ownerFields = document.getElementById("ownerFields");
  if (ownerFields) ownerFields.style.display = mode === "register" ? "block" : "none";
  document.getElementById("heading").textContent = mode === "login" ? "Welcome back" : "Create your account";
  document.getElementById("subtitle").textContent = mode === "login"
    ? "Login to continue to Harvest Lane."
    : "Join Harvest Lane and get started in a few simple steps.";
  document.getElementById("submitBtn").textContent = mode === "login" ? "Login" : "Create account";
  hideMessage();
}

function showMessage(text, type) {
  const box = document.getElementById("message");
  box.textContent = text;
  box.className = "message show " + type;
}

function hideMessage() {
  const box = document.getElementById("message");
  box.textContent = "";
  box.className = "message";
}

function handleSubmit(event) {
  event.preventDefault();
  hideMessage();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const name = document.getElementById("fullName").value.trim();
  const storageKey = "harvestLane_" + ROLE.toLowerCase().replaceAll(" ", "_") + "_users";
  const users = JSON.parse(localStorage.getItem(storageKey) || "[]");

  if (mode === "register") {
    const extra = getExtraData();
    if (!name) return showMessage("Please enter your name.", "error");
    if (ROLE === "Store Owner" && (!extra.storeName || !extra.phone))
      return showMessage("Please enter your store name and phone number.", "error");
    if (users.some(u => u.email === email))
      return showMessage("An account with this email already exists. Please login.", "error");
    users.push({ name, email, password, ...extra });
    localStorage.setItem(storageKey, JSON.stringify(users));
    document.getElementById("password").value = "";
    showMode("login");
    showMessage("Account created! Please login.", "success");
    return;
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return showMessage("Invalid email or password. If you are new, create an account first.", "error");

  // Save everything the rest of the site needs (name, role, store) in one session object
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    role: ROLE,
    storeName: user.storeName || "",
    phone: user.phone || ""
  }));
  showMessage("Login successful. Welcome, " + user.name + "!", "success");
  setTimeout(() => { location.href = REDIRECT; }, 800);
}
