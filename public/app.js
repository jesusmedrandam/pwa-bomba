// ============================================
// CONFIG
// ============================================
const API = "https://pwa-bomba.onrender.com";

// ============================================
// ACTUALIZAR STATUS EN PANTALLA
// ============================================

function setEstadoConectividad(ok) {
  const el = document.getElementById("statusCon");
  if (ok) {
    el.className = "status-dot green";
    el.innerText = "Exitosa";
  } else {
    el.className = "status-dot red";
    el.innerText = "Fallida";
  }
}

function setEstadoPozo(ok) {
  const el = document.getElementById("statusPozo");
  if (ok) {
    el.className = "status-dot green";
    el.innerText = "Conectado";
  } else {
    el.className = "status-dot red";
    el.innerText = "Desconectado";
  }
}

function setNivelTanque(porc) {
  const el = document.getElementById("nivelTanque");
  el.style.width = porc + "%";
  el.innerText = porc + "%";
}

function setNivelPozo(porc) {
  const el = document.getElementById("nivelPozo");
  el.style.width = porc + "%";
  el.innerText = porc + "%";
}

function setEstadoBomba(encendida) {
  const el = document.getElementById("estadoBomba");
  el.className = encendida ? "status-dot green" : "status-gray";
  el.innerText = encendida ? "Encendida" : "Apagada";
}

function setModoTrabajo(modo) {
  const el = document.getElementById("modoTrabajo");
  el.className = modo === "manual" ? "status-dot green" : "status-gray";
  el.innerText = modo === "manual" ? "Manual" : "Automático";
}

// ============================================
// OBTENER STATUS
// ============================================

async function actualizar() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();

    // --- Datos que tu microcontrolador devolverá ---
    setEstadoConectividad(data.conexionMCU || false);
    setEstadoPozo(data.conexionPozo || false);
    setNivelTanque(data.nivelTanque || 0);
    setNivelPozo(data.nivelPozo || 0);
    setEstadoBomba(data.bomba || false);
    setModoTrabajo(data.modo || "auto");

  } catch (err) {
    // Error general
    setEstadoConectividad(false);
    setEstadoPozo(false);
  }
}

// ============================================
// SWITCHES
// ============================================

document.getElementById("swtManual").addEventListener("change", async (e) => {
  const manual = e.target.checked;

  // habilitar/deshabilitar boton bomba
  document.getElementById("swtBomba").disabled = !manual;

  await fetch(`${API}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo: manual ? "manual" : "auto" })
  });

  actualizar();
});

document.getElementById("swtBomba").addEventListener("change", async (e) => {
  const encender = e.target.checked;

  await fetch(`${API}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bomba: encender })
  });

  actualizar();
});

// ============================================
// BOTÓN ACTUALIZAR
// ============================================

document.getElementById("btnActualizar").addEventListener("click", actualizar);

// ============================================
// AUTO-REFRESH CADA 5 SEGUNDOS
// ============================================

setInterval(actualizar, 5000);

// Primera carga
actualizar();
