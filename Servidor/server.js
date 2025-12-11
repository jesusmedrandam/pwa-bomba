// server.js - Backend simple para control de bomba
// Endpoints:
// GET  /status      -> devuelve el estado actual { status: "ON"|"OFF", nivelTanque, nivelPozo, modoAutomatico }
// POST /command     -> recibe { action: "ON"|"OFF"|"manual"|"automatic" } y actualiza estado
// POST /tanque/data -> (opcional) el nodo tanque puede enviar niveles { nivelTanque, nivelPozo, conectadoPozo }
// CORS: permitir tu GitHub Pages (o '*' para pruebas)

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

// Cambia esto por la URL de tu PWA si quieres restringir orígenes
// Para comenzar puedes usar cors({ origin: '*' }) y luego reemplazar por tu dominio:
// cors({ origin: 'https://jesusmedrandam.github.io' })
app.use(cors({ origin: '*' }));

// Estado en memoria (simple). Para producción usa BD.
let estado = {
  status: "OFF",          // "ON" o "OFF" -> bomba encendida o apagada
  nivelTanque: 0,         // porcentaje 0-100 (opcional)
  nivelPozo: 0,           // porcentaje 0-100 (opcional)
  modoAutomatico: true,   // true = automático, false = manual
  conectadoPozo: false    // si el nodo pozo responde
};

// Endpoint para que la PWA consulte el estado
app.get('/status', (req, res) => {
  return res.json(estado);
});

// Endpoint para recibir comandos desde PWA
// body: { action: "ON" | "OFF" | "manual" | "automatic" }
app.post('/command', (req, res) => {
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: 'Falta campo action' });

  if (action === 'ON') {
    // solo permitir encender si estamos en manual o reglas que definas
    estado.status = 'ON';
    return res.json({ ok: true, status: estado.status });
  }

  if (action === 'OFF') {
    estado.status = 'OFF';
    return res.json({ ok: true, status: estado.status });
  }

  if (action === 'manual') {
    estado.modoAutomatico = false;
    return res.json({ ok: true, modoAutomatico: estado.modoAutomatico });
  }

  if (action === 'automatic') {
    estado.modoAutomatico = true;
    // en automático tal vez apagues la bomba (según tu lógica)
    return res.json({ ok: true, modoAutomatico: estado.modoAutomatico });
  }

  return res.status(400).json({ error: 'Acción no válida' });
});

// Endpoint opcional para que el nodo tanque reporte datos (POST)
app.post('/tanque/data', (req, res) => {
  const { nivelTanque, nivelPozo, conectadoPozo } = req.body || {};
  if (typeof nivelTanque === 'number') estado.nivelTanque = Math.max(0, Math.min(100, Math.round(nivelTanque)));
  if (typeof nivelPozo === 'number') estado.nivelPozo = Math.max(0, Math.min(100, Math.round(nivelPozo)));
  if (typeof conectadoPozo === 'boolean') estado.conectadoPozo = conectadoPozo;
  return res.json({ ok: true, estado });
});

// Health check básico
app.get('/health', (req, res) => res.json({ ok: true }));

// Render proporciona PORT en env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend bomba escuchando en puerto ${PORT}`);
});

