// ======== UTILIDADES ========
function showToast(msg, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

// ==== LOGIN / REGISTRO / RECUPERAR ====
const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const recoverCard = document.getElementById("recoverCard");
const authWrap = document.getElementById("authWrap");
const dashboard = document.getElementById("dashboard");

// alternar vistas
document.getElementById("showRegister").onclick = () => {
  loginCard.style.display = "none";
  registerCard.style.display = "block";
};
document.getElementById("showLogin").onclick = () => {
  registerCard.style.display = "none";
  loginCard.style.display = "block";
};
document.getElementById("forgotPassLink").onclick = () => {
  loginCard.style.display = "none";
  recoverCard.style.display = "block";
};
document.getElementById("backToLogin").onclick = () => {
  recoverCard.style.display = "none";
  loginCard.style.display = "block";
};

// crear cuenta
document.getElementById("registerForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = regName.value.trim(),
    email = regEmail.value.trim().toLowerCase(),
    pass = regPassword.value;
  if (localStorage.getItem(email)) return showToast("⚠️ Correo ya registrado", "error");
  localStorage.setItem(email, JSON.stringify({ name, email, pass }));
  showToast("✅ Cuenta creada correctamente");
  registerCard.style.display = "none";
  loginCard.style.display = "block";
});

// iniciar sesión
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = loginEmail.value.trim().toLowerCase(),
    pass = loginPassword.value;
  const user = JSON.parse(localStorage.getItem(email) || "{}");
  if (!user.email) return showToast("❌ Usuario no encontrado");
  if (user.pass !== pass) return showToast("⚠️ Contraseña incorrecta");
  localStorage.setItem("activeUser", email);
  openDashboard();
});

// recuperar contraseña (simulada)
let tempCode = null;
document.getElementById("recoverFormStep1").addEventListener("submit", e => {
  e.preventDefault();
  const email = recoverEmail.value.trim().toLowerCase();
  if (!localStorage.getItem(email)) return showToast("❌ Correo no registrado");
  tempCode = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById("codeBox").innerHTML = `🔑 Código: ${tempCode}`;
  document.getElementById("codeBox").style.display = "block";
  recoverFormStep1.style.display = "none";
  recoverFormStep2.style.display = "block";
  setTimeout(() => (document.getElementById("codeBox").style.display = "none"), 15000);
});

document.getElementById("recoverFormStep2").addEventListener("submit", e => {
  e.preventDefault();
  const code = recoverCode.value.trim(),
    newPass = newPassword.value;
  if (code !== tempCode) return showToast("⚠️ Código incorrecto");
  const stored = JSON.parse(localStorage.getItem(recoverEmail.value.trim().toLowerCase()));
  stored.pass = newPass;
  localStorage.setItem(stored.email, JSON.stringify(stored));
  showToast("🔑 Contraseña restablecida");
  recoverFormStep1.style.display = "block";
  recoverFormStep2.style.display = "none";
  recoverCard.style.display = "none";
  loginCard.style.display = "block";
});

// ===== DASHBOARD =====
function keyPets() {
  return "pets_" + localStorage.getItem("activeUser");
}
function getPets() {
  return JSON.parse(localStorage.getItem(keyPets()) || "[]");
}
function savePets(arr) {
  localStorage.setItem(keyPets(), JSON.stringify(arr));
}

function openDashboard() {
  authWrap.style.display = "none";
  dashboard.style.display = "flex";
  const email = localStorage.getItem("activeUser");
  const user = JSON.parse(localStorage.getItem(email));
  document.getElementById("greetingText").textContent = `👋 Hola, ${user.name}`;
  renderSidebar();
  renderReminders();
}

// cerrar sesión
document.getElementById("btnLogout").onclick = () => {
  localStorage.removeItem("activeUser");
  dashboard.style.display = "none";
  authWrap.style.display = "flex";
  showToast("👋 Sesión cerrada");
};

// ===== MASCOTAS =====
function renderSidebar() {
  const list = document.getElementById("petList");
  list.innerHTML = "";
  const pets = getPets();

  if (pets.length === 0) {
    list.innerHTML = "<li>Sin mascotas aún</li>";
    document.getElementById("petDetailArea").innerHTML =
      "<div class='pet-card'><p>Añade tu primera mascota</p></div>";
    return;
  }

  pets.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span style="cursor:pointer">${p.nombre}</span> <button class="delete-btn">❌</button>`;
    li.querySelector("span").onclick = () => showPet(i);
    li.querySelector(".delete-btn").onclick = e => {
      e.stopPropagation();
      if (confirm(`¿Eliminar a ${p.nombre}?`)) {
        const arr = getPets();
        arr.splice(i, 1);
        savePets(arr);
        renderSidebar();
        renderReminders();
        showToast(`🗑️ Mascota ${p.nombre} eliminada`);
      }
    };
    list.appendChild(li);
  });
  showPet(0);
}

document.getElementById("btnAddPet").onclick = () => addPetForm();

function addPetForm() {
  const area = document.getElementById("petDetailArea");
  area.innerHTML = `
  <div class="pet-card">
    <h3>➕ Nueva mascota</h3>
    <input id="p_nombre" placeholder="Nombre">
    <select id="p_especie"><option value="">Especie</option><option>Perro</option><option>Gato</option></select>
    <input id="p_raza" placeholder="Raza">
    <div style="display:flex;gap:8px;">
      <input id="p_edad" type="number" placeholder="Edad">
      <select id="p_unidad">
        <option value="años">Años</option>
        <option value="meses">Meses</option>
        <option value="semanas">Semanas</option>
      </select>
    </div>
    <button id="savePet">Guardar</button>
  </div>`;
  document.getElementById("savePet").onclick = () => {
    const edad = p_edad.value + " " + p_unidad.value;
    const p = {
      nombre: p_nombre.value,
      especie: p_especie.value,
      raza: p_raza.value,
      edad: edad,
      vacunas: [],
    };
    const arr = getPets();
    arr.push(p);
    savePets(arr);
    renderSidebar();
    showToast("🐾 Mascota guardada");
  };
}

function showPet(i) {
  const pets = getPets();
  const p = pets[i];
  const area = document.getElementById("petDetailArea");
  area.innerHTML = `
  <div class="pet-card">
    <h3>${p.nombre} (${p.especie})</h3>
    <p>Raza: ${p.raza}</p><p>Edad: ${p.edad}</p>
    <div id="vacList"></div>
    <button id="btnAddVac">➕ Agregar vacuna</button>
    <div id="addVacForm" style="display:none;margin-top:10px;"></div>
  </div>`;
  document.getElementById("btnAddVac").onclick = () => toggleVacunaForm(i);
  renderVacunas(i);
}

// ==== VACUNAS Y RECORDATORIOS ====
function toggleVacunaForm(i) {
  const form = document.getElementById("addVacForm");
  form.style.display = form.style.display === "block" ? "none" : "block";
  if (form.style.display === "block") renderVacunaForm(i);
}

function addMonthsToDate(dateStr, months) {
  const d = new Date(dateStr);
  const res = new Date(d);
  res.setMonth(res.getMonth() + months);
  return res.toISOString().slice(0, 10);
}

function renderVacunaForm(i) {
  const form = document.getElementById("addVacForm");
  form.innerHTML = `
  <div style="background:#fff5ef;padding:12px;border-radius:12px;">
    <h4>💉 Nueva vacuna</h4>
    <input id="vacName" placeholder="Nombre de la vacuna">
    <input id="vacDate" type="date">
    <div style="display:flex;gap:8px;">
      <input id="vacFreq" type="number" placeholder="Frecuencia">
      <select id="vacUnit">
        <option value="meses">Meses</option>
        <option value="años">Años</option>
      </select>
    </div>
    <div style="margin-top:8px;display:flex;gap:10px;">
      <button id="saveVacBtn">Guardar</button>
      <button id="cancelVacBtn" style="background:#ccc;color:#333;">Cancelar</button>
    </div>
  </div>`;
  document.getElementById("cancelVacBtn").onclick = () => (form.style.display = "none");
  document.getElementById("saveVacBtn").onclick = () => {
    const name = vacName.value.trim(),
      date = vacDate.value;
    const freq = parseInt(vacFreq.value) || 12;
    const unit = vacUnit.value;
    if (!name || !date) return showToast("⚠️ Completa todos los campos");
    const months = unit === "años" ? freq * 12 : freq;
    const pets = getPets();
    const p = pets[i];
    const next = addMonthsToDate(date, months);
    p.vacunas.push({ name, lastDate: date, freqMonths: months, nextDate: next });
    savePets(pets);
    renderVacunas(i);
    renderReminders();
    form.style.display = "none";
    showToast("💉 Vacuna agregada");
  };
}

function getStatus(nextDateStr) {
  const days = (new Date(nextDateStr) - new Date()) / (1000 * 60 * 60 * 24);
  if (isNaN(days)) return { color: "gray", text: "Sin fecha" };
  if (days < 0) return { color: "red", text: "Vencida" };
  if (days <= 30) return { color: "yellow", text: "Próximo refuerzo" };
  return { color: "green", text: "Al día" };
}

function renderVacunas(i) {
  const pets = getPets();
  const p = pets[i];
  const area = document.getElementById("vacList");
  area.innerHTML = "";
  if (p.vacunas.length === 0) {
    area.innerHTML = "<p>Aún no hay vacunas registradas.</p>";
    return;
  }
  p.vacunas.forEach((v, idx) => {
    const st = getStatus(v.nextDate);
    const div = document.createElement("div");
    div.className = "vax-row";
    div.innerHTML = `<div><span class='status-dot status-${st.color}'></span><b>${v.name}</b> — Próx: ${v.nextDate}</div><button>❌</button>`;
    div.querySelector("button").onclick = () => {
      p.vacunas.splice(idx, 1);
      savePets(pets);
      renderVacunas(i);
      renderReminders();
      showToast("🗑️ Eliminada");
    };
    area.appendChild(div);
  });
}

function renderReminders() {
  const pets = getPets();
  const list = document.getElementById("remindersList");
  list.innerHTML = "";
  pets.forEach(p => {
    p.vacunas.forEach(v => {
      const st = getStatus(v.nextDate);
      const div = document.createElement("div");
      div.className = "vax-row";
      div.innerHTML = `<span class='status-dot status-${st.color}'></span>${p.nombre} - ${v.name} (${st.text})`;
      list.appendChild(div);
    });
  });
}

// ==== NAVEGACIÓN ENTRE SECCIONES ====
const contentArea = document.getElementById("contentArea");
const videosSection = document.getElementById("videosSection");
const tipsSection = document.getElementById("tipsSection");
const vaccSection = document.getElementById("vaccSection");
const petsSection = document.getElementById("petsSection");

document.getElementById("btnVideos").onclick = () => switchSection(videosSection);
document.getElementById("btnTips").onclick = () => switchSection(tipsSection);
document.getElementById("btnVacc").onclick = () => switchSection(vaccSection);
document.getElementById("btnPets").onclick = () => switchSection(petsSection);

function switchSection(target) {
  [contentArea, videosSection, tipsSection, vaccSection, petsSection].forEach(sec => (sec.style.display = "none"));
  target.style.display = "block";
}
document.getElementById("backToHomeFromVideos").onclick = () => switchSection(contentArea);
document.getElementById("backToHomeFromTips").onclick = () => switchSection(contentArea);
document.getElementById("backToHomeFromVacc").onclick = () => switchSection(contentArea);
document.getElementById("backToHomeFromPets").onclick = () => switchSection(contentArea);

// ==== ACCORDIONES (TIPS) ====
document.querySelectorAll(".accordion-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    this.classList.toggle("active");
    const panel = this.nextElementSibling;
    panel.classList.toggle("active");
  });
});

// ==== PESTAÑAS VACUNACIONES ====
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => (p.style.display = "none"));
    this.classList.add("active");
    document.getElementById(this.dataset.tab).style.display = "block";
  });
});
