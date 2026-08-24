import { EmailType } from '@/lib/emailQueue';

export const getEmailTemplate = (
  type: EmailType,
  data: Record<string, any>
): { subject: string; html: string } => {
  const currentYear = new Date().getFullYear();
  const appName = 'AI Social Media Automation';

  switch (type) {
    case 'forgot-password':
      return {
        subject: 'Reset Your Password',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif; background-color:#0B0F19; color:#f8fafc; line-height:1.6; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 40px 20px; text-align: center; }
    .container { max-width:600px; margin:0 auto; background-color:#141A29; border: 1px solid #1E293B; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4); text-align: left; }
    .header { background-color: #141A29; padding:40px 40px 20px 40px; text-align:center; border-bottom: 1px solid #1E293B; }
    .header .icon-container { width: 64px; height: 64px; margin: 0 auto 20px auto; background-color: rgba(45, 70, 255, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(45, 70, 255, 0.2); }
    .header h1 { margin:0; font-size:24px; font-weight:700; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding:40px; }
    .message { font-size:16px; color:#94a3b8; margin:0 0 24px 0; }
    .message strong { color: #ffffff; font-weight: 600; }
    .button-container { text-align: center; margin: 40px 0; }
    .reset-button { display:inline-block; background-color: #2D46FF; color:#ffffff !important; padding:16px 36px; text-decoration:none; border-radius:12px; font-weight:600; font-size:16px; margin:0; box-shadow: 0 8px 20px rgba(45, 70, 255, 0.3); transition: all 0.2s ease; border: 1px solid #4359FF; }
    .link-fallback { font-size: 13px; color: #64748b; word-break: break-all; margin-top: 24px; background: #0B0F19; padding: 16px; border-radius: 8px; border: 1px solid #1E293B; }
    .link-fallback a { color: #60A5FA; text-decoration: none; }
    .footer { padding:30px 40px; text-align:center; color:#64748b; font-size:13px; border-top: 1px solid #1E293B; background-color: #0B0F19; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="icon-container">
          <span style="font-size: 28px; line-height: 64px;">🔐</span>
        </div>
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <p class="message">Hi <strong>${data.name || 'there'}</strong>,</p>
        <p class="message">We received a request to reset your password for your <strong>${appName}</strong> account. If you didn't make this request, you can safely ignore this email.</p>
        <p class="message">To choose a new password, click the button below:</p>
        <div class="button-container">
          <a href="${data.resetUrl}" class="reset-button">Reset Password</a>
        </div>
        <div class="link-fallback">
          If the button doesn't work, copy and paste this link into your browser:<br><br>
          <a href="${data.resetUrl}">${data.resetUrl}</a>
        </div>
      </div>
      <div class="footer">
        © ${currentYear} ${appName}. All rights reserved.<br>
        This is an automated message, please do not reply.
      </div>
    </div>
  </div>
</body>
</html>
        `,
      };

    case 'registration':
      return {
        subject: 'Welcome to AI Social Media Automation!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${appName}</title>
  <style>
    body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif; background-color:#0B0F19; color:#f8fafc; line-height:1.6; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 40px 20px; text-align: center; }
    .container { max-width:600px; margin:0 auto; background-color:#141A29; border: 1px solid #1E293B; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4); text-align: left; }
    .header { background-color: #141A29; padding:40px 40px 20px 40px; text-align:center; border-bottom: 1px solid #1E293B; }
    .header .icon-container { width: 64px; height: 64px; margin: 0 auto 20px auto; background-color: rgba(45, 70, 255, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(45, 70, 255, 0.2); }
    .header h1 { margin:0; font-size:24px; font-weight:700; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding:40px; }
    .welcome-message { font-size:16px; color:#94a3b8; margin:0 0 24px 0; }
    .welcome-message strong { color: #ffffff; font-weight: 600; }
    .feature-list { margin: 30px 0; padding: 0; list-style: none; }
    .feature-list li { margin-bottom: 12px; font-size: 15px; color: #cbd5e1; padding-left: 24px; position: relative; }
    .feature-list li::before { content: "✨"; position: absolute; left: 0; top: 0; font-size: 14px; }
    .button-container { text-align: center; margin: 40px 0 10px 0; }
    .cta-button { display:inline-block; background-color: #2D46FF; color:#ffffff !important; padding:16px 36px; text-decoration:none; border-radius:12px; font-weight:600; font-size:16px; margin:0; box-shadow: 0 8px 20px rgba(45, 70, 255, 0.3); transition: all 0.2s ease; border: 1px solid #4359FF; }
    .footer { padding:30px 40px; text-align:center; color:#64748b; font-size:13px; border-top: 1px solid #1E293B; background-color: #0B0F19; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="icon-container">
          <span style="font-size: 28px; line-height: 64px;">🚀</span>
        </div>
        <h1>Welcome Aboard!</h1>
      </div>
      <div class="content">
        <p class="welcome-message">Hi <strong>${data.name || 'there'}</strong>,</p>
        <p class="welcome-message">Welcome to <strong>${appName}</strong>! Your account has been successfully created and you're ready to start automating your social media presence.</p>

        <ul class="feature-list">
          <li>Connect your social media accounts (Twitter, LinkedIn, Instagram, etc.)</li>
          <li>Set up your brand's unique knowledge base</li>
          <li>Generate AI content tailored to your voice</li>
          <li>Schedule and automate your publishing</li>
        </ul>

        <div class="button-container">
          <a href="${data.dashboardUrl || 'http://localhost:3000/dashboard'}" class="cta-button">Go to Dashboard</a>
        </div>
      </div>
      <div class="footer">
        © ${currentYear} ${appName}. All rights reserved.<br>
        You are receiving this email because you recently created an account.
      </div>
    </div>
  </div>
</body>
</html>
        `,
      };

    case 'team-invitation':
      return {
        subject: `You have been invited to join ${data.businessName} on ${appName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Details of Your Invitation</title>
  <style>
    body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif; background-color:#0B0F19; color:#f8fafc; line-height:1.6; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 40px 20px; text-align: center; }
    .container { max-width:600px; margin:0 auto; background-color:#141A29; border: 1px solid #1E293B; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4); text-align: left; }
    .header { background-color: #141A29; padding:40px 40px 20px 40px; text-align:center; border-bottom: 1px solid #1E293B; }
    .header .icon-container { width: 64px; height: 64px; margin: 0 auto 20px auto; background-color: rgba(45, 70, 255, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(45, 70, 255, 0.2); }
    .header h1 { margin:0; font-size:24px; font-weight:700; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding:40px; }
    .message { font-size:16px; color:#94a3b8; margin:0 0 24px 0; }
    .message strong { color: #ffffff; font-weight: 600; }
    .button-container { text-align: center; margin: 40px 0; }
    .accept-button { display:inline-block; background-color: #2D46FF; color:#ffffff !important; padding:16px 36px; text-decoration:none; border-radius:12px; font-weight:600; font-size:16px; margin:0; box-shadow: 0 8px 20px rgba(45, 70, 255, 0.3); transition: all 0.2s ease; border: 1px solid #4359FF; }
    .link-fallback { font-size: 13px; color: #64748b; word-break: break-all; margin-top: 24px; background: #0B0F19; padding: 16px; border-radius: 8px; border: 1px solid #1E293B; }
    .link-fallback a { color: #60A5FA; text-decoration: none; }
    .footer { padding:30px 40px; text-align:center; color:#64748b; font-size:13px; border-top: 1px solid #1E293B; background-color: #0B0F19; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="icon-container">
          <span style="font-size: 28px; line-height: 64px;">🤝</span>
        </div>
        <h1>You've been invited!</h1>
      </div>
      <div class="content">
        <p class="message">Hi there,</p>
        <p class="message"><strong>${data.inviterName}</strong> has invited you to join <strong>${data.businessName}</strong> on ${appName} as a <strong>${data.role}</strong>.</p>
        <p class="message">Click the button below to accept the invitation and join the workspace.</p>
        <div class="button-container">
          <a href="${data.inviteUrl}" class="accept-button">Accept Invitation</a>
        </div>
        <div class="link-fallback">
          If the button doesn't work, copy and paste this link into your browser:<br><br>
          <a href="${data.inviteUrl}">${data.inviteUrl}</a>
        </div>
      </div>
      <div class="footer">
        © ${currentYear} ${appName}. All rights reserved.<br>
        If you don't know who ${data.inviterName} is, you can safely ignore this email.
      </div>
    </div>
  </div>
</body>
</html>
        `,
      };

    case 'admin-invitation':
      return {
        subject: `Welcome to the ${appName} Admin Panel`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Admin Panel</title>
  <style>
    body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif; background-color:#0B0F19; color:#f8fafc; line-height:1.6; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 40px 20px; text-align: center; }
    .container { max-width:600px; margin:0 auto; background-color:#141A29; border: 1px solid #1E293B; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4); text-align: left; }
    .header { background-color: #141A29; padding:40px 40px 20px 40px; text-align:center; border-bottom: 1px solid #1E293B; }
    .header .icon-container { width: 64px; height: 64px; margin: 0 auto 20px auto; background-color: rgba(45, 70, 255, 0.1); border-radius: 16px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(45, 70, 255, 0.2); }
    .header h1 { margin:0; font-size:24px; font-weight:700; color: #ffffff; letter-spacing: -0.5px; }
    .content { padding:40px; }
    .message { font-size:16px; color:#94a3b8; margin:0 0 24px 0; }
    .message strong { color: #ffffff; font-weight: 600; }
    .button-container { text-align: center; margin: 40px 0; }
    .login-button { display:inline-block; background-color: #2D46FF; color:#ffffff !important; padding:16px 36px; text-decoration:none; border-radius:12px; font-weight:600; font-size:16px; margin:0; box-shadow: 0 8px 20px rgba(45, 70, 255, 0.3); transition: all 0.2s ease; border: 1px solid #4359FF; }
    .footer { padding:30px 40px; text-align:center; color:#64748b; font-size:13px; border-top: 1px solid #1E293B; background-color: #0B0F19; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="icon-container">
          <span style="font-size: 28px; line-height: 64px;">🛡️</span>
        </div>
        <h1>Admin Access Granted</h1>
      </div>
      <div class="content">
        <p class="message">Hi <strong>${data.name || 'Admin'}</strong>,</p>
        <p class="message">You have been added as an administrator to the <strong>${appName}</strong> platform with the role of <strong>${data.role}</strong>.</p>
        <p class="message">You can now access the admin panel using your email and the password provided by your system administrator.</p>
        <div class="button-container">
          <a href="${data.loginUrl}" class="login-button">Login to Admin Panel</a>
        </div>
      </div>
      <div class="footer">
        © ${currentYear} ${appName}. All rights reserved.<br>
        This is an automated security notification.
      </div>
    </div>
  </div>
</body>
</html>
        `,
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
};
