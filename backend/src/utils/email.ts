import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Parking App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendReviewNotification = async (to: string, spotTitle: string, reviewerName: string, rating: number, comment: string) => {
  const subject = `New Review for ${spotTitle}`;
  const text = `A new review has been submitted for ${spotTitle} by ${reviewerName}.\nRating: ${rating}\nComment: ${comment}`;
  const html = `
    <h2>New Review for ${spotTitle}</h2>
    <p>A new review has been submitted by ${reviewerName}.</p>
    <p>Rating: ${rating}</p>
    <p>Comment: ${comment}</p>
  `;

  return sendEmail(to, subject, text, html);
}; 