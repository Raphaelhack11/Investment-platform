// -------------------- AUTH --------------------
function openModal(id) {
  document.getElementById(id).style.display = "block";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ email, password, balance: 0, plans: [], history: [] }));
  alert("Signup successful! You can now log in.");
  closeModal("signupModal");
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.email === email && user.password === password) {
    alert("Login successful!");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid credentials.");
  }
}

// -------------------- DASHBOARD --------------------
function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Please log in.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("balance").innerText = "$" + user.balance;

  // Active plans
  const activePlansDiv = document.getElementById("activePlans");
  if (activePlansDiv) {
    activePlansDiv.innerHTML = "";
    user.plans.forEach(plan => {
      const div = document.createElement("div");
      div.classList.add("plan");
      div.innerHTML = `<strong>${plan.name}</strong><br> Payout: $${plan.payout}<br> Ends: ${new Date(plan.end).toLocaleString()}`;
      activePlansDiv.appendChild(div);
    });
  }
}

function subscribePlan(name, cost, payout, days) {
  let user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  if (user.balance < cost) {
    alert("Insufficient balance!");
    return;
  }

  user.balance -= cost;
  const end = Date.now() + days * 24 * 60 * 60 * 1000;
  user.plans.push({ name, payout, end });
  user.history.push({ type: "Subscription", amount: cost, status: "Active" });

  localStorage.setItem("user", JSON.stringify(user));
  alert("Subscribed to " + name + " plan!");
  loadDashboard();
}

// -------------------- DEPOSIT --------------------
function openDepositModal() {
  openModal("depositModal");
}

function sendDeposit() {
  const amount = document.getElementById("depositAmount").value;
  if (!amount || amount <= 0) {
    alert("Enter a valid amount");
    return;
  }

  let user = JSON.parse(localStorage.getItem("user"));
  user.history.push({ type: "Deposit", amount, status: "Waiting for confirmation" });
  localStorage.setItem("user", JSON.stringify(user));

  alert("Please send $" + amount + " worth of BTC to the wallet address shown.");
  closeModal("depositModal");
  window.location.href = "transactions.html";
}

// -------------------- WITHDRAW --------------------
function requestWithdrawal(e) {
  e.preventDefault();
  const amount = document.getElementById("withdrawAmount").value;
  const address = document.getElementById("withdrawAddress").value;

  let user = JSON.parse(localStorage.getItem("user"));
  if (amount > user.balance) {
    alert("Insufficient balance.");
    return;
  }

  user.balance -= amount;
  user.history.push({ type: "Withdrawal", amount, status: "Pending", address });
  localStorage.setItem("user", JSON.stringify(user));

  alert("Withdrawal request submitted!");
  window.location.href = "transactions.html";
}

// -------------------- TRANSACTIONS --------------------
function loadTransactions() {
  let user = JSON.parse(localStorage.getItem("user"));
  const table = document.getElementById("transactionsTable");

  if (table && user) {
    table.innerHTML = "<tr><th>Type</th><th>Amount</th><th>Status</th></tr>";
    user.history.forEach(h => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${h.type}</td><td>$${h.amount}</td><td>${h.status}</td>`;
      table.appendChild(row);
    });
  }
}

// -------------------- CONTACT --------------------
function sendMessage(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  if (!name || !email || !message) {
    alert("Please fill in all fields.");
    return;
  }

  alert("Thank you for contacting us, " + name + "! We’ll reply soon.");
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";
}

// -------------------- ADMIN --------------------
function adminLogin() {
  const username = document.getElementById("adminUser").value;
  const password = document.getElementById("adminPass").value;

  if (username === "admin" && password === "admin123") {
    document.getElementById("adminLoginForm").style.display = "none";
    document.getElementById("adminDashboard").style.display = "block";
    loadAdminData();
  } else {
    alert("Invalid admin credentials.");
  }
}

function loadAdminData() {
  let user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  const pendingDeposits = document.getElementById("pendingDeposits");
  const pendingWithdrawals = document.getElementById("pendingWithdrawals");

  pendingDeposits.innerHTML = "";
  pendingWithdrawals.innerHTML = "";

  user.history.forEach((h, i) => {
    if (h.type === "Deposit" && h.status === "Waiting for confirmation") {
      const div = document.createElement("div");
      div.innerHTML = `Deposit $${h.amount} <button onclick="approveDeposit(${i})">Approve</button>`;
      pendingDeposits.appendChild(div);
    }
    if (h.type === "Withdrawal" && h.status === "Pending") {
      const div = document.createElement("div");
      div.innerHTML = `Withdraw $${h.amount} to ${h.address} <button onclick="approveWithdrawal(${i})">Approve</button>`;
      pendingWithdrawals.appendChild(div);
    }
  });
}

function approveDeposit(i) {
  let user = JSON.parse(localStorage.getItem("user"));
  user.balance += parseFloat(user.history[i].amount);
  user.history[i].status = "Approved";
  localStorage.setItem("user", JSON.stringify(user));
  loadAdminData();
}

function approveWithdrawal(i) {
  let user = JSON.parse(localStorage.getItem("user"));
  user.history[i].status = "Approved";
  localStorage.setItem("user", JSON.stringify(user));
  loadAdminData();
}

// -------------------- BACKGROUND PARTICLES --------------------
const canvas = document.getElementById("bgCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const bitcoins = [];

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1
    });
  }

  for (let i = 0; i < 10; i++) {
    bitcoins.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 10,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ddd";
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    ctx.font = "20px Arial";
    bitcoins.forEach(b => {
      ctx.fillStyle = "gold";
      ctx.fillText("₿", b.x, b.y);
      b.x += b.dx;
      b.y += b.dy;
      if (b.x < 0 || b.x > canvas.width) b.dx *= -1;
      if (b.y < 0 || b.y > canvas.height) b.dy *= -1;
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
