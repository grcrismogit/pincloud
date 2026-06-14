/* ===== SHARED AUTH UTILITIES ===== */

function showAlert(message, type = 'error', boxId = 'alert-box') {
  const icons = { error: 'fa-circle-xmark', success: 'fa-circle-check', warning: 'fa-triangle-exclamation' };
  const box = document.getElementById(boxId);
  if (!box) return;
  box.className = `alert ${type}`;
  box.innerHTML = `<i class="fa-solid ${icons[type] || icons.error}"></i> ${message}`;
  box.classList.remove('hidden');
  if (type !== 'error') setTimeout(() => box.classList.add('hidden'), 5000);
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.querySelector('.btn-text').classList.toggle('hidden', loading);
  btn.querySelector('.btn-spinner').classList.toggle('hidden', !loading);
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eye   = document.getElementById('eye-' + inputId);
  if (!input || !eye) return;
  if (input.type === 'password') {
    input.type = 'text';
    eye.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    eye.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function getPasswordStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 5);
}

function setupOtpInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(-1);
      input.classList.toggle('filled', input.value !== '');
      if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) {
        inputs[i - 1].focus();
        inputs[i - 1].value = '';
        inputs[i - 1].classList.remove('filled');
      }
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      pasted.split('').forEach((char, j) => {
        if (inputs[i + j]) {
          inputs[i + j].value = char;
          inputs[i + j].classList.add('filled');
        }
      });
      const next = inputs[Math.min(i + pasted.length, inputs.length - 1)];
      if (next) next.focus();
    });
  });
}

let countdownTimer = null;
function startCountdown(btnId, countdownId, seconds) {
  const btn       = document.getElementById(btnId);
  const countdown = document.getElementById(countdownId);
  if (!btn || !countdown) return;
  if (countdownTimer) clearInterval(countdownTimer);
  btn.disabled = true;
  let remaining = seconds;
  countdown.textContent = `Puedes reenviar en ${remaining}s`;
  countdown.classList.remove('hidden');
  countdownTimer = setInterval(() => {
    remaining--;
    countdown.textContent = `Puedes reenviar en ${remaining}s`;
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      btn.disabled = false;
      countdown.classList.add('hidden');
    }
  }, 1000);
}

// Init OTP + countdown on pages that need it
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.otp-input')) setupOtpInputs();
});
