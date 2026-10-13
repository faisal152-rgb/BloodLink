require('dotenv').config();

let accessToken;
let accessTokenExpiresAt = 0;
let tokenRequest;

const getAccessToken = async () => {
  if (accessToken && Date.now() < accessTokenExpiresAt - 60_000) {
    return accessToken;
  }

  if (!tokenRequest) {
    tokenRequest = (async () => {
      const credentials = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
        grant_type: 'refresh_token',
      };
      const missing = Object.entries(credentials)
        .filter(([key, value]) => key !== 'grant_type' && !value)
        .map(([key]) => key);

      if (missing.length) {
        throw new Error(`Missing Gmail OAuth configuration: ${missing.join(', ')}`);
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(credentials),
        signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json();

      if (!response.ok || !result.access_token) {
        throw new Error(
          `Gmail OAuth token request failed (${response.status}): ${result.error_description || result.error || 'No access token returned'}`
        );
      }

      accessToken = result.access_token;
      accessTokenExpiresAt = Date.now() + result.expires_in * 1000;
      return accessToken;
    })().finally(() => {
      tokenRequest = undefined;
    });
  }

  return tokenRequest;
};

const wrapBase64 = (value) => value.match(/.{1,76}/g)?.join('\r\n') || '';

const sendEmail = async (to, subject, text, html) => {
  const sender = process.env.GOOGLE_USER;
  if (!sender) {
    throw new Error('Missing Gmail sender configuration: GOOGLE_USER');
  }
  if (/[\r\n]/.test(to) || /[\r\n]/.test(subject)) {
    throw new Error('Email recipient and subject must not contain line breaks');
  }

  const boundary = `bloodlink_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const mimeMessage = [
    `From: "Faisal Abbas" <${sender}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(Buffer.from(text).toString('base64')),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(Buffer.from(html).toString('base64')),
    `--${boundary}--`,
    '',
  ].join('\r\n');
  const raw = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail API send failed (${response.status}): ${details}`);
  }

  const result = await response.json();
  const [localPart, domain] = to.split('@');
  const maskedRecipient = domain
    ? `${localPart.slice(0, 1)}***@${domain}`
    : '[invalid email]';
  console.info('Gmail API accepted email', {
    recipient: maskedRecipient,
    messageId: result.id,
  });

  return result;
};

module.exports = { sendEmail };
