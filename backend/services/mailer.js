const nodemailer = require('nodemailer');

function smtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
  } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return {
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
    secure: SMTP_SECURE ? SMTP_SECURE === 'true' : false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    from: SMTP_FROM || SMTP_USER
  };
}

let cachedTransporter = null;
let cachedFrom = 'no-reply@example.com';
let cachedMode = 'smtp'; // 'smtp' or 'test'

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const cfg = smtpConfig();
  if (cfg) {
    cachedFrom = cfg.from;
    cachedTransporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.auth
    });
    cachedMode = 'smtp';
    return cachedTransporter;
  }
  // Fallback to Nodemailer test account (no external SMTP required)
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  cachedFrom = `Health Buddy <${testAccount.user}>`;
  cachedMode = 'test';
  return cachedTransporter;
}

function fromAddress() {
  return cachedFrom;
}

function isTestMode() {
  return cachedMode === 'test';
}

function getPreviewUrl(info) {
  try { return nodemailer.getTestMessageUrl(info) || null; } catch (_) { return null; }
}

module.exports = { getTransporter, fromAddress, isTestMode, getPreviewUrl };
