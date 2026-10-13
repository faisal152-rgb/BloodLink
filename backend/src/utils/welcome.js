const Notification = require('../models/Notification');

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

async function sendWelcomeMessages(user, emailQueue) {
  if (user.welcomeSentAt) return;

  const safeName = escapeHtml(user.name);
  const text = `Hello ${user.name}! 👋

Welcome to BloodLink — Connecting Lives, Saving Lives. ❤️

Your account has been successfully created! You’re now part of a community dedicated to helping people in need of blood.

🤝 Together, we can make a difference and save lives.

Thank you for joining BloodLink. Every connection counts!

— Team BloodLink 🩸`;
  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif;color:#292929">
    <div style="max-width:600px;margin:32px auto;padding:32px;background:#fff;border-radius:12px;line-height:1.6">
      <h1 style="color:#c62828">🩸 Welcome to BloodLink!</h1>
      <p>Hello ${safeName}! 👋</p>
      <p>Welcome to BloodLink — Connecting Lives, Saving Lives. ❤️</p>
      <p>Your account has been successfully created! You’re now part of a community dedicated to helping people in need of blood.</p>
      <p>🤝 Together, we can make a difference and save lives.</p>
      <p>Thank you for joining BloodLink. Every connection counts!</p>
      <p>— Team BloodLink 🩸</p>
    </div>
  </body>
</html>`;

  const notification = {
    recipient: user._id,
    type: 'welcome',
    title: 'Welcome to BloodLink!',
    message: text,
    target: ['donor', 'hospital', 'bloodbank'].includes(user.role) ? user.role : 'all',
    status: 'sent',
    timestamp: new Date(),
  };

  try {
    await Notification.findOneAndUpdate(
      { recipient: user._id, type: 'welcome' },
      { $setOnInsert: notification },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  await emailQueue.add(
    'sendEmail',
    {
      to: user.email,
      subject: 'Welcome to BloodLink!',
      text,
      html,
    },
    {
      jobId: `welcome-${user._id}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    }
  );

  user.welcomeSentAt = new Date();
  await user.save();
}

module.exports = { sendWelcomeMessages };
