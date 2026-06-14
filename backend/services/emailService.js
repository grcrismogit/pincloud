const { ses } = require('../config/aws');
const { SendEmailCommand } = require('@aws-sdk/client-ses');

const FROM = process.env.SES_FROM_EMAIL || 'noreply@pincloud.com';

async function sendEmail({ to, subject, html }) {
  const cmd = new SendEmailCommand({
    Source: FROM,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body:    { Html: { Data: html, Charset: 'UTF-8' } },
    },
  });
  return ses.send(cmd);
}

const crypto = require('crypto');
function generateCode() {
  return (crypto.randomInt(100000, 999999)).toString();
}

async function sendVerificationEmail(email, code) {
  await sendEmail({
    to: email,
    subject: 'PinCloud – Verifica tu correo electrónico',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:2rem;border-radius:12px;border:1px solid #eee;">
        <h1 style="color:#e60023;margin-bottom:0.25rem;">PinCloud</h1>
        <p style="color:#555;margin-bottom:1.5rem;">Verifica tu cuenta</p>
        <p style="color:#333;">Tu código de verificación es:</p>
        <div style="font-size:2.5rem;font-weight:900;letter-spacing:0.3rem;color:#e60023;text-align:center;padding:1rem;background:#fff0f1;border-radius:10px;margin:1rem 0;">
          ${code}
        </div>
        <p style="color:#888;font-size:0.85rem;">Este código expira en <strong>15 minutos</strong>. Si no creaste esta cuenta, ignora este mensaje.</p>
      </div>`,
  });
}

async function sendPasswordResetEmail(email, code) {
  await sendEmail({
    to: email,
    subject: 'PinCloud – Código para restablecer contraseña',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:2rem;border-radius:12px;border:1px solid #eee;">
        <h1 style="color:#e60023;margin-bottom:0.25rem;">PinCloud</h1>
        <p style="color:#555;margin-bottom:1.5rem;">Restablece tu contraseña</p>
        <p style="color:#333;">Tu código para restablecer la contraseña es:</p>
        <div style="font-size:2.5rem;font-weight:900;letter-spacing:0.3rem;color:#e60023;text-align:center;padding:1rem;background:#fff0f1;border-radius:10px;margin:1rem 0;">
          ${code}
        </div>
        <p style="color:#888;font-size:0.85rem;">Este código expira en <strong>15 minutos</strong>. Si no solicitaste esto, ignora este mensaje.</p>
      </div>`,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail, generateCode };
