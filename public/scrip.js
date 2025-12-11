// URL de tu backend en Render
const API = "https://pwa-bomba.onrender.com";

// Enviar comando a la bomba
async function enviarComando(accion) {
    try {
        const res = await fetch(`${API}/command`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: accion })
        });

        const data = await res.json();
        actualizarEstado(data.status || "Enviado");
    } catch (err) {
        actualizarEstado("Error (sin conexión)");
    }
}

// Obtener estado actual
async function obtenerEstado() {
    try {
        const res = await fetch(`${API}/status`);
        const data = await res.json();
        actualizarEstado(data.status);
    } catch (err) {
        actualizarEstado("Error (sin conexión)");
    }
}

// Actualizar texto en pantalla
function actualizarEstado(texto) {
    document.getElementById("status").innerText = "Estado: " + texto;
}

// Consultar cada 5 segundos
setInterval(obtenerEstado, 5000);
obtenerEstado();

// Registrar service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}
