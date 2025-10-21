const nodeMailer = require("nodemailer");

// create reusable transporter object using the nodemailer
const sendEmail = async (to, subject, html, replyTo) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        return false;
      }
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `FashionSphere Alerts <${process.env.EMAIL_USER}>`,
      sender: process.env.EMAIL_USER,
      to,
      subject,
      html,
      replyTo: replyTo || process.env.EMAIL_USER,
    });

    if (info) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
};

module.exports = { sendEmail };
