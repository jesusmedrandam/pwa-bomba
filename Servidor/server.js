const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando ✔️");
});

// Ruta /status
app.get("/status", (req, res) => {
  res.json({ ok: true, message: "Servidor activo" });
});

// Puerto asignado por Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto " + PORT);
});
