const nodemailer = require("nodemailer");

exports.sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //email options
  const emailOptions = {
    form: "Cineflix support<support@cineflix.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transport.sendMail(emailOptions);
};
