const express  = require('express');
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const User     = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail, generateCode } = require('../services/emailService');

const router = express.Router();
const CODE_TTL = 15 * 60 * 1000; // 15 min

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password)
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    if (password.length < 8)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Formato de correo inválido.' });
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username))
      return res.status(400).json({ message: 'El usuario debe tener 3-20 caracteres (letras, números, _ -).' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      const field = exists.email === email.toLowerCase() ? 'correo' : 'nombre de usuario';
      return res.status(409).json({ message: `Este ${field} ya está registrado.` });
    }

    const code = generateCode();
    const user = await User.create({
      name, username, email, password,
      verifyCode:        code,
      verifyCodeExpires: new Date(Date.now() + CODE_TTL),
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error('SES error:', emailErr.message);
      // Cuenta creada pero email falló — avisamos al usuario sin bloquear el flujo
      return res.status(201).json({
        message: 'Cuenta creada, pero no se pudo enviar el correo de verificación. Usa "Reenviar código" en la pantalla de verificación.',
        emailError: true,
      });
    }
    res.status(201).json({ message: 'Cuenta creada. Revisa tu correo para verificar.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    if (user.isVerified) return res.status(400).json({ message: 'El correo ya fue verificado.' });
    if (user.verifyCode !== code || user.verifyCodeExpires < Date.now())
      return res.status(400).json({ message: 'Código incorrecto o expirado.' });

    user.isVerified        = true;
    user.verifyCode        = undefined;
    user.verifyCodeExpires = undefined;
    await user.save();
    res.json({ message: 'Correo verificado exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.isVerified) return res.status(400).json({ message: 'No se puede reenviar.' });

    const code = generateCode();
    user.verifyCode        = code;
    user.verifyCodeExpires = new Date(Date.now() + CODE_TTL);
    await user.save();
    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error('SES error (resend):', emailErr.message);
    }
    res.json({ message: 'Código reenviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas.' });
    if (!user.isVerified) return res.status(403).json({ message: 'Verifica tu correo antes de iniciar sesión.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Credenciales incorrectas.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, username: user.username, email: user.email, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Always respond OK to avoid user enumeration
    if (!user || !user.isVerified) return res.json({ message: 'Si el correo existe, recibirás un código.' });

    const code = generateCode();
    user.resetCode        = code;
    user.resetCodeExpires = new Date(Date.now() + CODE_TTL);
    await user.save();
    try {
      await sendPasswordResetEmail(email, code);
    } catch (emailErr) {
      console.error('SES error (reset):', emailErr.message);
    }
    res.json({ message: 'Código enviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno.' });
  }
});

// POST /api/auth/verify-reset-code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.resetCode !== code || user.resetCodeExpires < Date.now())
      return res.status(400).json({ message: 'Código incorrecto o expirado.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken       = resetToken;
    user.resetCode        = undefined;
    user.resetCodeExpires = undefined;
    await user.save();
    res.json({ resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.resetToken !== resetToken)
      return res.status(400).json({ message: 'Token inválido.' });

    user.password   = newPassword;
    user.resetToken = undefined;
    await user.save();
    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno.' });
  }
});

module.exports = router;
