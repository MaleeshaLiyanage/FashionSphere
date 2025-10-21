const verifyEmailTemplate = (code, name) => {
  return `
    <!DOCTYPE html>
<html>
  <head>
    <title>Email Verification</title>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f7f7f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 480px;
        margin: 40px auto;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        padding: 36px 32px 28px 32px;
      }
      .brand {
        text-align: center;
        font-size: 2rem;
        font-weight: bold;
        color: #e6007a;
        margin-bottom: 8px;
        letter-spacing: 1px;
      }
      .subtitle {
        text-align: center;
        color: #888;
        font-size: 1.1rem;
        margin-bottom: 28px;
      }
      .greeting {
        font-size: 1.1rem;
        color: #222;
        margin-bottom: 18px;
      }
      .info {
        color: #444;
        margin-bottom: 18px;
        font-size: 1rem;
      }
      .code-box {
        display: flex;
        justify-content: center;
        margin: 28px 0 22px 0;
      }
      .code {
        background: linear-gradient(90deg, #e6007a 0%, #ff3be5 100%);
        color: #fff;
        font-size: 2.2rem;
        font-weight: bold;
        letter-spacing: 6px;
        padding: 18px 38px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(230,0,122,0.07);
      }
      .footer {
        margin-top: 32px;
        text-align: center;
        color: #aaa;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="brand">FashionSphere</div>
      <div class="subtitle">Verify your email address</div>
      <div class="greeting">Hi ${name},</div>
      <div class="info">
        Please use the code below to verify your account:
      </div>
      <div class="code-box">
        <span class="code">${code}</span>
      </div>
      <div class="info">
        If you did not request this verification, you can safely ignore this email.<br>
        This code will expire soon for your security.
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} FashionSphere &mdash; All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
};

module.exports = { verifyEmailTemplate };
