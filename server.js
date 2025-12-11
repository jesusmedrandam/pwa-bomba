const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ENDPOINT FAKE → luego lo conectaremos con LoRa/ESP32
app.get("/status", (req, res) => {
  res.json({ status: "desconocido" });
});

app.post("/command", (req, res) => {
  console.log("Comando recibido:", req.body.action);
  res.json({ ok: true });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

