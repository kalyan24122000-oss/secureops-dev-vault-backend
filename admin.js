const API_URL = "/admin";
let adminPass = "";

function attemptLogin() {
  const passInput = document.getElementById("admin-pass");
  const pass = passInput.value.trim();
  
  // Clear previous error if any
  let errDiv = document.getElementById("login-error");
  if (!errDiv) {
    errDiv = document.createElement("div");
    errDiv.id = "login-error";
    errDiv.style.color = "#ef4444";
    errDiv.style.marginTop = "15px";
    errDiv.style.fontSize = "14px";
    passInput.parentNode.appendChild(errDiv);
  }
  errDiv.innerText = "";

  if (pass === "2010") {
    adminPass = pass;
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("dashboard").classList.add("active");
    fetchUsers();
  } else {
    errDiv.innerText = "Incorrect password! Access denied.";
  }
}

// Bind Enter key to login
document.getElementById("admin-pass").addEventListener("keypress", function(e) {
  if (e.key === "Enter") attemptLogin();
});

document.getElementById("btn-login").addEventListener("click", attemptLogin);
document.getElementById("btn-refresh").addEventListener("click", fetchUsers);
document.getElementById("btn-decrypt").addEventListener("click", decryptData);

// Event delegation for decrypt buttons
document.getElementById("users-tbody").addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("btn-fill-decrypt")) {
    fillDecrypt(e.target.getAttribute("data-id"), e.target.getAttribute("data-key"));
  }
});

async function fetchUsers() {
  try {
    const res = await fetch(`${API_URL}/users`, {
      headers: { "x-admin-password": adminPass }
    });
    if (!res.ok) {
        if (res.status === 401) {
            alert("Session expired or invalid password.");
            location.reload();
            return;
        }
        throw new Error("Failed to fetch users");
    }
    const data = await res.json();
    const tbody = document.getElementById("users-tbody");
    tbody.innerHTML = "";
    data.users.forEach(u => {
      const keyDisplay = u.private_key ? u.private_key : '<span style="color:#64748b">Not Stored</span>';
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-family: monospace; font-size: 11px; color:#94a3b8;">${u.id}</td>
        <td style="font-weight: 500;">${u.email}</td>
        <td class="hash-text" title="${u.password_hash}">${u.password_hash}</td>
        <td class="key-text">${keyDisplay}</td>
        <td><button class="btn-sm btn-fill-decrypt" data-id="${u.id}" data-key="${u.private_key || ''}">Decrypt</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function fillDecrypt(id, key) {
  document.getElementById("decrypt-user-id").value = id;
  document.getElementById("decrypt-private-key").value = key;
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

async function decryptData() {
  const userId = document.getElementById("decrypt-user-id").value.trim();
  const privateKey = document.getElementById("decrypt-private-key").value.trim();
  if (!userId || !privateKey) return alert("Fill both User ID and Private Key");

  const resultsDiv = document.getElementById("decrypted-results");
  resultsDiv.innerHTML = "<p style='color: #2dd4bf;'>Decrypting...</p>";

  try {
    const res = await fetch(`${API_URL}/decrypt`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-password": adminPass 
      },
      body: JSON.stringify({ userId, privateKey })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to decrypt");
    
    resultsDiv.innerHTML = "<h3 style='color:#e2e8f0; margin-bottom: 20px;'>Saved Credentials</h3>";
    if (data.items.length === 0) {
      resultsDiv.innerHTML += "<p style='color:#94a3b8;'>No items found in this user's vault.</p>";
      return;
    }
    data.items.forEach(item => {
      resultsDiv.innerHTML += `
        <div style="background: #1e293b; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #2dd4bf;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
            <h4 style="margin:0; color: #fff;">${item.title} <span style="color:#94a3b8; font-weight:normal;">${item.subtitle ? '- ' + item.subtitle : ''}</span></h4>
            <span class="badge">${item.itemType}</span>
          </div>
          ${item.error ? `<p style="color:#ef4444; margin:0;">❌ ${item.error}</p>` : `<pre style="margin:0;">${JSON.stringify(item.data, null, 2)}</pre>`}
        </div>
      `;
    });
  } catch (err) {
    resultsDiv.innerHTML = "";
    alert(err.message);
  }
}
