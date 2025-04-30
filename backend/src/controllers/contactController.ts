import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

export const sendContactMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
}; 