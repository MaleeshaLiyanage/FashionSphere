export const lowStockEmailTemplate = (products) => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Low stock alert</title>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f7f7;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          padding: 32px 24px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.07);
        }
        h2 {
          color: #e6007a;
          margin-bottom: 18px;
          font-size: 2rem;
          text-align: center;
          letter-spacing: 1px;
        }
        p {
          margin-bottom: 10px;
          color: #333;
          font-size: 16px;
        }
        .product-list {
          margin-top: 18px;
          border-collapse: collapse;
          width: 100%;
        }
        .product-list th, .product-list td {
          border: 1px solid #eee;
          padding: 10px 8px;
          text-align: left;
        }
        .product-list th {
          background-color: #f2f2f2;
          color: #e6007a;
          font-weight: 600;
        }
        .product-list tr:nth-child(even) {
          background-color: #fafafa;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #aaa;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>FashionSphere Alerts</h2>
        <p>Hello Admin,</p>
        <p>The following products are <b>low on stock</b>:</p>
        <table class="product-list">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock Left</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (product) =>
                  `<tr>
                    <td>${product.product}</td>
                    <td style="color:#e6007a;font-weight:bold;">${product.qty}</td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
        <div class="footer">
          &copy; ${new Date().getFullYear()} FashionSphere &mdash; Inventory Alert
        </div>
      </div>
    </body>
  </html>`;
};
