const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// ================================
//   VARIABLES DE ENTORNO (Render)
// ================================
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const ADMIN_CHAT = process.env.ADMIN_CHAT || "";
const DOMAIN = process.env.DOMAIN || ""; // ejemplo: https://mi-backend.onrender.com

let bot = null;

if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN);
  console.log("Bot de Telegram habilitado");
} else {
  console.warn("BOT_TOKEN no configurado — bot deshabilitado");
}

// ================================
//    ESTADO GLOBAL DEL SISTEMA
// ================================
let estado = {
  nivelTanque: 0,
  nivelPozo: 0,
  modoAutomatico: true,
  bombaOn: false,
  conectadoPozo: false,
  lastUpdate: null
};

// Cola de comandos para el ESP32
let lastCommand = { action: null, ts: null };

// ====================================
//   API QUE ENVÍA EL ESP32 AL SERVIDOR
// ====================================
app.post('/api/status', (req, res) => {
  const data = req.body || {};

  if (typeof data.nivelTanque === "number") estado.nivelTanque = data.nivelTanque;
  if (typeof data.nivelPozo === "number") estado.nivelPozo = data.nivelPozo;
  if (typeof data.modoAutomatico === "boolean") estado.modoAutomatico = data.modoAutomatico;
  if (typeof data.bombaOn === "boolean") estado.bombaOn = data.bombaOn;
  if (typeof data.conectadoPozo === "boolean") estado.conectadoPozo = data.conectadoPozo;

  estado.lastUpdate = new Date().toISOString();

  res.json({ ok: true });
});

// ====================================
//   API QUE LA PWA CONSULTA EL ESTADO
// ====================================
app.get('/api/status', (req, res) => {
  res.json(estado);
});

// ====================================
//  API PARA ENVIAR COMANDOS DESDE LA PWA
// ====================================
app.post('/api/command', async (req, res) => {
  const action = req.body?.action;

  if (!action) {
    return res.status(400).json({ error: "action requerido" });
  }

  // Validación: si está en automático, no permitir encendido
  if (action === "encender" && estado.modoAutomatico) {
    return res.status(400).json({ error: "No permitido: modo AUTOMÁTICO" });
  }

  // Actualizar estado local
  if (action === "encender") estado.bombaOn = true;
  if (action === "apagar") estado.bombaOn = false;
  if (action === "manual") estado.modoAutomatico = false;
  if (action === "automatico") estado.modoAutomatico = true;

  // Registrar comando para ESP32
  lastCommand = { action, ts: new Date().toISOString() };

  // Notificar por Telegram
  if (bot && ADMIN_CHAT) {
    bot.sendMessage(ADMIN_CHAT, `Comando recibido: ${action}`);
  }

  res.json({ ok: true, result: action });
});

// ===============================
//  API PARA QUE EL ESP32 POLLEE
// ===============================
app.get('/api/command/poll', (req, res) => {
  res.json(lastCommand);
});

// =================================
//   ENDPOINT DEL WEBHOOK TELEGRAM
// =================================
app.post('/telegram/webhook', async (req, res) => {
  const update = req.body;

  try {
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = (update.message.text || "").trim().toLowerCase();

      if (text === "/start") {
        await bot.sendMessage(chatId, "Bot funcionando.\nUsa:\n/estado\n/encender\n/apagar\n/manual\n/automatico");
      }

      else if (text === "/estado") {
        const msg = 
          `Tanque: ${estado.nivelTanque}%\n` +
          `Pozo: ${estado.nivelPozo}%\n` +
          `Modo: ${estado.modoAutomatico ? "AUTO" : "MANUAL"}\n` +
          `Bomba: ${estado.bombaOn ? "ON" : "OFF"}`;
        await bot.sendMessage(chatId, msg);
      }

      else if (["/encender", "/apagar", "/manual", "/automatico"].includes(text)) {
        const action = text.replace("/", "");

        // Llamar internamente a la API
        await axios.post(`${DOMAIN}/api/command`, { action });

        await bot.sendMessage(chatId, `Comando ejecutado: ${action}`);
      }

      else {
        await bot.sendMessage(chatId, "Comando no válido.");
      }
    }
  } catch (e) {
    console.error("Error procesando Telegram:", e);
  }

  res.sendStatus(200);
});

// ===============================
//   HEALTH CHECK
// ===============================
app.get('/health', (req, res) => res.send("OK"));

// ===============================
//   INICIAR SERVIDOR
// ===============================
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
  console.log("DOMAIN:", DOMAIN);
});
