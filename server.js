const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Clave secreta para proteger el endpoint del ESP32
const SECRET = process.env.SECRET || "MI_SECRETO_123";

// Datos del ESP32 almacenados en servidor
let estado = {
  conexionMCU: false,
  conexionPozo: false,
  nivelTanque: 0,
  nivelPozo: 0,
  modo: "auto",
  bomba: false,
  ultimaActualizacion: 0
};

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// 🟦 1. Endpoint PWA → Render → leer estado
app.get("/status", (req, res) => {
  res.json(estado);
});

// 🟧 2. Endpoint PWA → Render → mandar comando al ESP32
app.post("/command", async (req, res) => {
  const comando = req.body;

  try {
    const r = await fetch("http://TU_IP_DEL_ESP32/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comando)
    });

    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false, error: "ESP32 no responde" });
  }
});

// 🟥 3. Endpoint ESP32 → Render (envía datos)
app.post("/esp/update", (req, res) => {
  const key = req.headers["x-secret"];

  if (key !== SECRET) {
    return res.status(403).json({ error: "No autorizado" });
  }

  estado = { ...estado, ...req.body, ultimaActualizacion: Date.now() };
  estado.conexionMCU = true;

  res.json({ ok: true });
});

// 🟩 4. Servir index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ⭐ Iniciar
app.listen(PORT, () => console.log("Servidor listo en", PORT));
