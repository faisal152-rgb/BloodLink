require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientId: process.env.CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  return transporter.sendMail({
    from: `"Faisal Abbas" <${process.env.GOOGLE_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };







