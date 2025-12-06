<!-- 
  EMAIL TEMPLATES
  Create these files in: src/templates/emails/
  File naming: template_name.hbs
-->

<!-- ========================================
  1. WELCOME EMAIL (welcome_email.hbs)
========================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{appName}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{appName}}! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      
      <p>Welcome to {{appName}}! We're excited to have you join our community as a <strong>{{role}}</strong>.</p>
      
      <p>To get started, please verify your email address:</p>
      
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #fff; padding: 10px; word-break: break-all; font-size: 12px;">{{verificationUrl}}</p>
      
      <p>Once verified, you'll have full access to:</p>
      <ul>
        <li>{{#if (eq role "student")}}Browse and apply for jobs{{/if}}{{#if (eq role "company")}}Post job openings and review applications{{/if}}</li>
        <li>Complete your profile</li>
        <li>Connect with opportunities</li>
      </ul>
      
      <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
      
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{appName}}. All rights reserved.</p>
      <p>This email was sent to {{email}}.</p>
    </div>
  </div>
</body>
</html>

<!-- ========================================
  2. EMAIL VERIFICATION (email_verification.hbs)
========================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email Address</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      
      <p>Thanks for signing up! Please verify your email address to activate your account.</p>
      
      <div style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Verify Email</a>
      </div>
      
      <p>This link will expire in 24 hours.</p>
      
      <p>If you didn't create an account, you can safely ignore this email.</p>
      
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

<!-- ========================================
  3. PASSWORD RESET (password_reset.hbs)
========================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      
      <div style="text-align: center;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </div>
      
      <p>Or copy and paste this link:</p>
      <p style="background: #fff; padding: 10px; word-break: break-all; font-size: 12px;">{{resetUrl}}</p>
      
      <p><strong>This link will expire in 1 hour.</strong></p>
      
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

<!-- ========================================
  4. APPLICATION RECEIVED (application_received.hbs)
========================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Received! ✅</h1>
    </div>
    <div class="content">
      <p>Hi {{studentName}},</p>
      
      <p>Great news! Your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been successfully submitted.</p>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">What's Next?</h3>
        <ul>
          <li>The hiring team will review your application</li>
          <li>You'll be notified of any status updates</li>
          <li>Keep an eye on your email for responses</li>
        </ul>
      </div>
      
      <p>You can track your application status in your <a href="{{appUrl}}/student/applications">dashboard</a>.</p>
      
      <p>Good luck! 🍀</p>
      
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

<!-- ========================================
  5. APPLICATION STATUS UPDATE (application_status_update.hbs)
========================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Update</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Status Update</h1>
    </div>
    <div class="content">
      <p>Hi {{studentName}},</p>
      
      <p>Your application for <strong>{{jobTitle}}</strong> {{statusMessage}}.</p>
      
      <div style="background: {{#if (eq status "accepted")}}#d4edda{{else}}#f8f9fa{{/if}}; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Status:</strong> {{status}}</p>
        {{#if notes}}
        <p><strong>Notes:</strong> {{notes}}</p>
        {{/if}}
      </div>
      
      {{#if (eq status "accepted")}}
      <p>Congratulations! 🎉 The company will be in touch with next steps.</p>
      {{else if (eq status "rejected")}}
      <p>We encourage you to keep applying! Check out other opportunities on our platform.</p>
      {{/if}}
      
      <div style="text-align: center;">
        <a href="{{appUrl}}/student/applications" class="button">View Applications</a>
      </div>
      
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>

<!-- ========================================
  6. ACCOUNT APPROVED (account_approved.hbs)
========================================= -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved</title>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Account is Approved! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      
      <p>Great news! Your {{role}} account has been approved. You now have full access to all platform features.</p>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Get Started:</h3>
        <ul>
          {{#if (eq role "student")}}
          <li>Complete your profile</li>
          <li>Browse available opportunities</li>
          <li>Start applying for jobs</li>
          {{else if (eq role "company")}}
          <li>Complete your company profile</li>
          <li>Post your first job opening</li>
          <li>Review incoming applications</li>
          {{/if}}
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="{{loginUrl}}" class="button">Go to Dashboard</a>
      </div>
      
      <p>If you have any questions, don't hesitate to reach out to our support team.</p>
      
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>