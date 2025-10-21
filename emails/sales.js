const saleNotificationTemplate = (
  name,
  discountPercentage,
  startDate,
  endDate
) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>New Sale Notification</title>
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
            .info {
              color: #444;
              margin-bottom: 18px;
              font-size: 1rem;
              text-align: center;
            }
            .sale-details {
              background: #f2f2f2;
              border-radius: 8px;
              padding: 18px 0;
              margin: 24px 0;
              text-align: center;
            }
            .percentage {
              color: #e6007a;
              font-size: 2.2rem;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .dates {
              color: #333;
              font-size: 1.1rem;
              margin-top: 8px;
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
            <div class="subtitle">Exciting Sale Alert!</div>
            <div class="info">
              We are thrilled to announce a new sale: <b>${name}</b>
            </div>
            <div class="sale-details">
              <div class="percentage">${discountPercentage}% OFF</div>
              <div class="dates">
                <div><b>Start Date:</b> ${new Date(
                  startDate
                ).toLocaleDateString()}</div>
                <div><b>End Date:</b> ${new Date(
                  endDate
                ).toLocaleDateString()}</div>
              </div>
            </div>
            <div class="info">
              Don't miss out on these amazing discounts!<br>
              Shop now and save big during the sale period.
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} FashionSphere &mdash; Sale Notification
            </div>
          </div>
        </body>
      </html>
    `;
};

module.exports = { saleNotificationTemplate };
