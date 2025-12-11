require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ---------- BOT DE TELEGRAM ----------
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const CHAT_ID = process.env.CHAT_ID;

// Enviar mensajes de prueba
bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, "Bot funcionando correctamente 😄");
});

// ---------- API PARA EL ESP32 ----------
let estado = {
    conexion: "desconocido",
    pozo: "desconocido",
    tanque: 0,
    pozo_nivel: 0,
    bomba: "apagada",
    modo: "manual"
};

// ESP32 → Servidor
app.post("/api/actualizar", (req, res) => {
    estado = { ...estado, ...req.body };

    bot.sendMessage(
        CHAT_ID,
        `📡 Actualización recibida:
▪ Conexión: ${estado.conexion}
▪ Pozo: ${estado.pozo}
▪ Nivel tanque: ${estado.tanque}%
▪ Nivel pozo: ${estado.pozo_nivel}%
▪ Bomba: ${estado.bomba}
▪ Modo: ${estado.modo}`
    );

    res.json({ ok: true });
});

// PWA → Servidor (obtener datos)
app.get("/api/estado", (req, res) => {
    res.json(estado);
});

// PWA → Servidor (cambiar bomba o modo)
app.post("/api/comando", (req, res) => {
    const { accion } = req.body;
    estado.bomba = accion;
    res.json({ ok: true });
});

// ---------- SERVIDOR ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Servidor backend corriendo en puerto " + PORT);
});
