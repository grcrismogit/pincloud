require('dotenv').config();

// Validar variables de entorno requeridas antes de arrancar
const REQUIRED_ENV = ['MONGO_URI','JWT_SECRET','AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','S3_BUCKET_NAME','SES_FROM_EMAIL'];
const missingEnv = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingEnv.length) {
  console.error('Faltan variables de entorno:', missingEnv.join(', '));
  process.exit(1);
}

const express   = require('express');
const path      = require('path');
const connectDB = require('./backend/config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/pins', require('./backend/routes/pins'));

// Contact form — simple email via SES
app.post('/api/contact', async (req, res) => {
  const { nombre, empresa, email, plan, mensaje } = req.body || {};
  if (!nombre || !empresa || !email || !plan)
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  try {
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
    const ses = new SESClient({ region: process.env.AWS_REGION });
    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL,
      Destination: { ToAddresses: [process.env.SES_FROM_EMAIL] },
      Message: {
        Subject: { Data: `[PinCloud Empresas] ${plan} — ${empresa}` },
        Body: { Text: { Data: `Nombre: ${nombre}\nEmpresa: ${empresa}\nEmail: ${email}\nPlan: ${plan}\n\n${mensaje || ''}` } },
      },
    }));
    res.json({ ok: true });
  } catch (err) {
    console.error('Contact SES error:', err.message);
    res.status(500).json({ message: 'Error al enviar el mensaje.' });
  }
});

// Serve React app (production build)
const clientDist = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  // Let API routes fall through; serve React for everything else
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
});
