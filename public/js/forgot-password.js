/* ===== FORGOT PASSWORD — 4-STEP FLOW ===== */

let resetEmail = '';
let resetToken = '';

function showStep(n) {
  [1, 2, 3, 4].forEach(i => {
    const el = document.getElementById('step-' + i);
    if (el) el.classList.toggle('hidden', i !== n);
  });
}

// Step 1 — Send code
document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) return showAlert('Ingresa tu correo electrónico.', 'error', 'alert-box');

  setLoading('btn-send', true);
  try {
    const res  = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      resetEmail = email;
      document.getElementById('email-display').textContent = email;
      showStep(2);
      setupOtpInputs();
      startCountdown('resend-btn', 'countdown', 60);
    } else {
      showAlert(data.message || 'No se encontró esa cuenta.', 'error', 'alert-box');
    }
  } catch {
    showAlert('Error de conexión. Intenta de nuevo.', 'error', 'alert-box');
  } finally {
    setLoading('btn-send', false);
  }
});

// Step 2 — Verify code
document.getElementById('code-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = [...document.querySelectorAll('.otp-input')].map(i => i.value).join('');
  if (code.length < 6) return showAlert('Ingresa el código de 6 dígitos.', 'error', 'alert-box-2');

  setLoading('btn-verify', true);
  try {
    const res  = await fetch('/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, code })
    });
    const data = await res.json();
    if (res.ok) {
      resetToken = data.resetToken;
      showStep(3);
    } else {
      showAlert(data.message || 'Código incorrecto o expirado.', 'error', 'alert-box-2');
    }
  } catch {
    showAlert('Error de conexión.', 'error', 'alert-box-2');
  } finally {
    setLoading('btn-verify', false);
  }
});

// Resend code
document.getElementById('resend-btn')?.addEventListener('click', async () => {
  try {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail })
    });
    showAlert('Código reenviado. Revisa tu correo.', 'success', 'alert-box-2');
    startCountdown('resend-btn', 'countdown', 60);
  } catch {
    showAlert('Error al reenviar.', 'error', 'alert-box-2');
  }
});

// Step 3 — Reset password
document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPwd     = document.getElementById('new-password').value;
  const confirmPwd = document.getElementById('confirm-password').value;

  if (!newPwd || !confirmPwd) return showAlert('Completa todos los campos.', 'error', 'alert-box-3');
  if (newPwd !== confirmPwd)  return showAlert('Las contraseñas no coinciden.', 'error', 'alert-box-3');
  if (newPwd.length < 8)     return showAlert('Mínimo 8 caracteres.', 'error', 'alert-box-3');

  setLoading('btn-reset', true);
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, resetToken, newPassword: newPwd })
    });
    const data = await res.json();
    if (res.ok) {
      showStep(4);
    } else {
      showAlert(data.message || 'Error al cambiar la contraseña.', 'error', 'alert-box-3');
    }
  } catch {
    showAlert('Error de conexión.', 'error', 'alert-box-3');
  } finally {
    setLoading('btn-reset', false);
  }
});
