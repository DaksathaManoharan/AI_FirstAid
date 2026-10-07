import nodemailer from 'nodemailer';

// Create transporter based on environment configuration
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Fallback: If SMTP is not provided, create a transporter that logs in dev mode
  return null;
}

export async function sendPasswordResetEmail({ to, resetToken, otpCode, name = 'User', resetUrl }) {
  const transporter = createTransporter();

  const subject = 'Password Reset Request - AI First Aid Assistant';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 20px; }
        .container { max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .brand-icon { width: 36px; height: 36px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; text-align: center; line-height: 36px; }
        .brand-title { font-size: 20px; font-weight: 800; color: #f8fafc; }
        .greeting { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
        .otp-box { background: rgba(59, 130, 246, 0.1); border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 20px 0; }
        .otp-label { font-size: 12px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; font-family: 'Courier New', Courier, monospace; }
        .btn-container { text-align: center; margin: 24px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); }
        .expiry { font-size: 13px; color: #f59e0b; margin-top: 16px; text-align: center; }
        .footer { border-top: 1px solid #1f2937; margin-top: 28px; padding-top: 16px; font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">
          <div class="brand-icon">✚</div>
          <div class="brand-title">AI First Aid Assistant</div>
        </div>
        <div class="greeting">Hello,</div>
        <div class="message">
          We received a request to reset the password for your AI First Aid account associated with <strong>${to}</strong>.
          Use the 6-digit verification code below or click the button to set a new password:
        </div>

        <div class="otp-box">
          <div class="otp-label">Your 6-Digit Verification Code</div>
          <div class="otp-code">${otpCode}</div>
        </div>

        ${resetUrl ? `
        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Password Directly</a>
        </div>
        ` : ''}

        <div class="expiry">
          ⚠️ This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.
        </div>

        <div class="footer">
          AI First Aid Emergency Decision Support System<br>
          For medical emergencies, immediately dial 112 or 108.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
AI First Aid Assistant - Password Reset Request

Hello,

We received a request to reset your password for ${to}.

Your 6-Digit Verification Code: ${otpCode}

${resetUrl ? `Direct Reset Link: ${resetUrl}\n` : ''}
This code will expire in 15 minutes.
If you did not request this, please ignore this email.
`;

  const fromAddress = process.env.SMTP_FROM || `"AI First Aid Support" <${process.env.SMTP_USER || 'no-reply@aifirstaid.org'}>`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });
      console.log(`[EmailService] Password reset email sent to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (err) {
      console.error(`[EmailService] Failed to send email via SMTP:`, err.message);
      // Fallback: log for development/testing
      console.log(`\n======================================================`);
      console.log(`[EmailService Fallback] Password Reset for ${to}`);
      console.log(`Verification Code: ${otpCode}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`======================================================\n`);
      return { 
        success: true, 
        mode: 'fallback', 
        warning: `SMTP delivery failed (${err.message}), code logged for development`,
        otpCode,
        resetUrl 
      };
    }
  } else {
    // No SMTP configured in .env -> Log clearly to console
    console.log(`\n======================================================`);
    console.log(`[EmailService Development Mode] Password Reset for ${to}`);
    console.log(`SMTP not configured in .env (add SMTP_HOST, SMTP_USER, SMTP_PASS to send live emails).`);
    console.log(`Verification Code: ${otpCode}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      mode: 'dev_mock',
      otpCode,
      resetUrl,
      message: 'Email generated. In development mode without SMTP credentials, code is logged to server console.'
    };
  }
}
