import nodemailer from 'nodemailer'

// Create a transporter using ethereal email (for testing) or real SMTP credentials
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    let transporter;

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Use Ethereal for testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    const info = await transporter.sendMail({
      from: '"Form Builder" <no-reply@formbuilder.com>',
      to,
      subject,
      text,
      html
    });

    console.log('Message sent: %s', info.messageId)
    if (!process.env.SMTP_USER) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    }
    
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
