// -----------------------------
// 📌 IMPORTS
// -----------------------------
const express = require("express");
const path = require("path");
const TelegramBot = require("node-telegram-bot-api");

// -----------------------------
// 📌 CONFIG SERVIDOR
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// -----------------------------
// 📌 TELEGRAM BOT (se activa solo si hay token)
// -----------------------------
let bot = null;

if (process.env.BOT_TOKEN) {
  bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
  console.log("🤖 Bot de Telegram cargado correctamente.");

  // 🔔 Función para enviar mensajes
  const sendTelegram = (message) => {
    if (!bot) return;
    if (!process.env.CHAT_ID) return;

    bot.sendMessage(process.env.CHAT_ID, message).catch(console.error);
  };

  // Ejemplo: mensaje al iniciar
  sendTelegram("🚀 Backend iniciado en Render.");
}

// -----------------------------
// 📌 ENDPOINT PRINCIPAL (para evitar Cannot GET /)
// -----------------------------
app.get("/", (req, res) => {
  res.send(`
    <h2>✔️ Backend funcionando</h2>
    <p>Este servidor es solo API para la PWA del sistema de bombeo.</p>
  `);
});

// -----------------------------
// 📌 ENDPOINT DE ESTADO (lo consumirá tu PWA)
// -----------------------------
app.get("/status", (req, res) => {
  res.json({
    conexion_micro: "desconocido", // luego lo reemplazaremos
    conexion_pozo: "desconocido",
    tanque: 0,
    pozo: 0,
    bomba: "apagada",
    modo: "manual"
  });
});

// -----------------------------
// 📌 ENDPOINT PARA COMANDOS
// -----------------------------
app.post("/command", (req, res) => {
  const cmd = req.body.action;
  console.log("Comando recibido:", cmd);

  if (bot) {
    bot.sendMessage(
      process.env.CHAT_ID,
      `⚙️ Comando ejecutado: ${cmd}`
    );
  }

  res.json({ ok: true });
});

// -----------------------------
// 📌 ENDPOINT DE SALUD (Render lo usa)
// -----------------------------
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// -----------------------------
// 📌 INICIAR SERVIDOR
// -----------------------------
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
});
