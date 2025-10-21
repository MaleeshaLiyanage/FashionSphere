const restockAlertTemplate = (client, product, qty) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Restock Alert</title>
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
          h2 {
            color: #e6007a;
            margin-bottom: 18px;
            font-size: 2rem;
            text-align: center;
            letter-spacing: 1px;
          }
          .info {
            color: #444;
            margin-bottom: 18px;
            font-size: 1rem;
            text-align: center;
          }
          .product-box {
            background: #fff0fa;
            border-radius: 8px;
            padding: 22px 0;
            margin: 24px 0;
            text-align: center;
            border: 1.5px solid #e6007a22;
          }
          .product-name {
            font-size: 1.3rem;
            font-weight: bold;
            color: #e6007a;
            margin-bottom: 10px;
          }
          .stock {
            color: #e6007a;
            font-size: 1.8rem;
            font-weight: bold;
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
          <h2>FashionSphere Restock Alert</h2>
          <div class="info">
            Hello ${client},<br>
            The following product has been <b>restocked</b>:
          </div>
          <div class="product-box">
            <div class="product-name">${product}</div>
            <div>New Stock:</div>
            <div class="stock">${qty}</div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} FashionSphere &mdash; Inventory Alert
          </div>
        </div>
      </body>
    </html>
  `;
};

module.exports = { restockAlertTemplate };
