export const otpTemp = (otp:any) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Brainly OTP Verification</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: Arial, sans-serif;
          }
          body {
              background-color: #ffffff;
              color: #000;
              padding: 0;
              margin: 0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 22px;
              text-align: center;
          }
          .logo {
              width: 140px;
              margin-bottom: 22px;
          }
          .message {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 18px;
              color: #5a2dff;
          }
          .body {
              font-size: 16px;
              margin-bottom: 22px;
              line-height: 1.5;
          }
          .otp-box {
              font-size: 32px;
              font-weight: 700;
              letter-spacing: 3px;
              margin: 18px 0;
              color: #5a2dff;
              background: #f4f2ff;
              padding: 12px 22px;
              display: inline-block;
              border-radius: 8px;
              border: 2px solid #5a2dff;
          }
          .support {
              font-size: 14px;
              color: #666;
              margin-top: 25px;
          }
          .support a {
              color: #5a2dff;
              font-weight: bold;
              text-decoration: none;
          }
      </style>
  </head>

  <body>
      <div class="container">
          <img class="logo" src="https://i.ibb.co/9p9tcMd/brainly-logo.png" alt="Brainly Logo" />
          <div class="message">Email Verification OTP</div>

          <div class="body">
              <p>Welcome to <b>Brainly</b> 👋</p>
              <p>To complete your sign-up, please enter the verification code below:</p>

              <div class="otp-box">${otp}</div>

              <p>This OTP will expire in <b>2 minutes</b>. Do not share it with anyone for security reasons.</p>
          </div>

          <div class="support">
              Need assistance? Contact us at
              <a href="mailto:brainly.webapp@gmail.com">brainly.webapp@gmail.com</a>
          </div>
      </div>
  </body>
  </html>`;
};
