const Notification = require('../models/Notification');
const { sendEmail } = require('../services/EmailOtp');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

async function sendWelcomeMessages(user) {
  if (user.welcomeEmailSentAt) return;

  const safeName = escapeHtml(user.name || 'User');

  const text = `Hello ${user.name || 'User'}! 👋

Welcome to BloodLink — Connecting Lives, Saving Lives. ❤️

Your account has been successfully created! You’re now part of a community dedicated to helping people in need of blood.

Visit BloodLink:
https://bloodlink-donation.vercel.app

🤝 Together, we can make a difference and save lives.

Thank you for joining BloodLink. Every connection counts!

— Team BloodLink 🩸`;

  const notificationMessage = `Hello ${user.name || 'User'}! 👋

Welcome to BloodLink — Connecting Lives, Saving Lives. ❤️

Your account has been successfully created! You’re now part of a community dedicated to helping people in need of blood.

🤝 Together, we can make a difference and save lives.

Thank you for joining BloodLink. Every connection counts!

— Team BloodLink 🩸`;

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif;color:#292929">
    <div style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border-radius:12px;line-height:1.6">

      <h1 style="color:#c62828;margin-top:0;">
        🩸 Welcome to BloodLink!
      </h1>

      <p>Hello ${safeName}! 👋</p>

      <p>
        Welcome to BloodLink — Connecting Lives, Saving Lives. ❤️
      </p>

      <p>
        Your account has been successfully created! You’re now part of a
        community dedicated to helping people in need of blood.
      </p>

      <p style="text-align:center;margin:28px 0;">
        <a
          href="https://bloodlink-donation.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display:inline-block;
            background:#c62828;
            color:#ffffff;
            text-decoration:none;
            padding:12px 24px;
            border-radius:6px;
            font-weight:bold;
          "
        >
          Visit BloodLink ❤️
        </a>
      </p>

      <p>
        🤝 Together, we can make a difference and save lives.
      </p>

      <p>
        Thank you for joining BloodLink. Every connection counts!
      </p>

      <p>
        — Team BloodLink 🩸
      </p>

    </div>
  </body>
</html>`;

  const notification = {
    recipient: user._id,
    type: 'welcome',
    title: 'Welcome to BloodLink!',
    message: notificationMessage,
    target: ['donor', 'hospital', 'bloodbank'].includes(user.role)
      ? user.role
      : 'all',
    status: 'sent',
    timestamp: new Date(),
  };

  await sendEmail(
    user.email,
    'Welcome to BloodLink!',
    text,
    html
  );

  user.welcomeEmailSentAt = new Date();
  await user.save();

  try {
    await Notification.findOneAndUpdate(
      {
        recipient: user._id,
        type: 'welcome',
      },
      {
        $setOnInsert: notification,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }
  }
}

module.exports = { sendWelcomeMessages };
