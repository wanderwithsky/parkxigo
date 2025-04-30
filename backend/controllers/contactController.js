import transporter from '../config/mail.js';

export const sendContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  await transporter.sendMail({
    from: `"${name}" <${email}>`,
    to: process.env.MAIL_USER,
    subject: `Contact Form: ${subject}`,
    text: message
  });
  res.json({ message: 'Message sent' });
}; 