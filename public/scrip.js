const API = "https://pwa-bomba.onrender.com";

// Actualiza etiqueta con colores
function setPill(id, texto, ok) {
    const el = document.getElementById(id);
    el.innerText = texto;
    el.className = "status-pill " + (ok ? "ok" : "fail");
}

// Cambiar barra de progreso
function setBar(id, porcentaje) {
    document.getElementById(id).style.width = porcentaje + "%";
}

// =============================
//   OBTENER ESTADO COMPLETO
// =============================
async function obtenerEstado() {
    try {
        const res = await fetch(`${API}/status`);
        const data = await res.json();

        // Campos esperados desde backend
        setPill("estadoConexion", data.conexion ? "Exitosa" : "Fallida", data.conexion);
        setPill("estadoPozo", data.pozo ? "Conectado" : "Desconectado", data.pozo);
        setBar("nivelTanque", data.nivelTanque || 0);
        setBar("nivelPozo", data.nivelPozo || 0);
        setPill("estadoBomba", data.bomba ? "Encendida" : "Apagada", data.bomba);
        setPill("modoTrabajo", data.manual ? "Manual" : "Automático", !data.manual);

        // Ajustar switches
        document.getElementById("switchManual").checked = data.manual;
        document.getElementById("switchBomba").checked = data.bomba;

        // Habilitar encendido solo si es manual
        document.getElementById("switchBomba").disabled = !data.manual;

    } catch (err) {
        setPill("estadoConexion", "Fallida", false);
    }
}

// =============================
//        ACCIONES
// =============================
async function setModoManual(valor) {
    try {
        await fetch(`${API}/modo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ manual: valor })
        });
        obtenerEstado();
    } catch (err) {}
}

async function setBomba(valor) {
    try {
        await fetch(`${API}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: valor ? "on" : "off" })
        });
        obtenerEstado();
    } catch (err) {}
}

obtenerEstado();
setInterval(obtenerEstado, 5000);
