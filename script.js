// ========== GLOBAL STORAGE ==========
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Save data
function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ========== AUTH ==========
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  if (users.find(u => u.email === email)) {
    alert("Email already exists.");
    return;
  }

  const newUser = { email, password, balance: 0, plans: [] };
  users.push(newUser);
  currentUser = newUser;
  saveData();

  alert("Signup successful! You are logged in.");
  window.location.href = "dashboard.html";
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid credentials!");
    return;
  }

  currentUser = user;
  saveData();
  window.location.href = "dashboard.html";
}

// ========== DASHBOARD ==========
function loadDashboard() {
  if (!currentUser) return;

  document.getElementById("balance").innerText = `$${currentUser.balance}`;

  // Render active plans
  if (document.getElementById("activePlans")) {
    document.getElementById("activePlans").innerHTML = currentUser.plans.map(plan => `
      <div class="plan">
        <h4>${plan.name}</h4>
        <p>Expires: ${new Date(plan.expires).toLocaleString()}</p>
      </div>
    `).join("");
  }
}

function subscribePlan(name, cost, duration) {
  if (!currentUser) {
    alert("Login required.");
    return;
  }

  if (currentUser.balance < cost) {
    alert("Insufficient balance!");
    return;
  }

  currentUser.balance -= cost;
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + duration);

  currentUser.plans.push({ name, expires: expiry });
  transactions.push({ type: "Subscription", name, amount: cost, date: new Date(), status: "Active" });

  saveData();
  alert("Plan subscribed successfully!");
  loadDashboard();
}

// ========== DEPOSIT ==========
function copyAddress() {
  const address = document.getElementById("btcAddress").innerText;
  navigator.clipboard.writeText(address);
  alert("Wallet address copied!");
}

function confirmDeposit() {
  const amount = document.getElementById("depositAmount").value;
  if (!amount || amount <= 0) {
    alert("Enter a valid amount.");
    return;
  }

  transactions.push({ type: "Deposit", amount, date: new Date(), status: "Pending" });
  saveData();

  window.location.href = "history.html";
}

// ========== WITHDRAW ==========
function confirmWithdraw() {
  const amount = document.getElementById("withdrawAmount").value;
  const wallet = document.getElementById("withdrawWallet").value;

  if (!amount || amount <= 0 || !wallet) {
    alert("Enter amount and wallet address.");
    return;
  }

  if (currentUser.balance < amount) {
    alert("Insufficient balance.");
    return;
  }

  currentUser.balance -= amount;
  transactions.push({ type: "Withdraw", amount, wallet, date: new Date(), status: "Pending" });
  saveData();

  alert("Withdrawal request submitted!");
  window.location.href = "history.html";
}

// ========== HISTORY ==========
function showTab(type) {
  let filtered = transactions.filter(tx => tx.type.toLowerCase() === type.toLowerCase());
  let html = `<table border="1" width="100%" cellpadding="10">
    <tr><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr>
    ${filtered.map(tx => `
      <tr>
        <td>${tx.type}</td>
        <td>${tx.amount}</td>
        <td>${tx.status}</td>
        <td>${new Date(tx.date).toLocaleString()}</td>
      </tr>
    `).join("")}
  </table>`;
  document.getElementById("historyTable").innerHTML = html;
}

// ========== ADMIN ==========
function adminLogin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === "admin" && pass === "admin123") {
    document.getElementById("adminLogin").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    loadPendingTx();
  } else {
    alert("Invalid admin credentials.");
  }
}

function loadPendingTx() {
  const pending = transactions.filter(tx => tx.status === "Pending");
  document.getElementById("pendingTx").innerHTML = pending.map((tx, i) => `
    <div class="plan">
      <p><b>${tx.type}</b> - $${tx.amount}</p>
      <p>Date: ${new Date(tx.date).toLocaleString()}</p>
      <button onclick="approveTx(${i})">Approve</button>
    </div>
  `).join("");
}

function approveTx(index) {
  let pending = transactions.filter(tx => tx.status === "Pending");
  let tx = pending[index];

  tx.status = "Approved";

  if (tx.type === "Deposit") {
    currentUser.balance += parseFloat(tx.amount);
  }

  saveData();
  alert("Transaction approved!");
  loadPendingTx();
}
