/**
 * Netlify serverless function to handle contact form submissions via SMTP.
 * 
 * Environment variables required in Netlify dashboard:
 * - SMTP_HOST: Your SMTP server hostname (e.g., smtp.gmail.com)
 * - SMTP_PORT: SMTP port (usually 587 or 465)
 * - SMTP_USER: Your SMTP username
 * - SMTP_PASS: Your SMTP password
 * - CONTACT_RECIPIENT: Email address to receive inquiries (e.g., optimusbcc@gmail.com)
 * - CONTACT_SENDER: Email address to send from (optional, defaults to CONTACT_RECIPIENT)
 */

const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body || "{}");

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "All fields are required." }),
      };
    }

    // Get environment variables from Netlify
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactRecipient = process.env.CONTACT_RECIPIENT;
    const contactSender = process.env.CONTACT_SENDER || contactRecipient;

    // Validate environment variables
    if (!smtpHost || !smtpUser || !smtpPass || !contactRecipient) {
      console.error("Missing required environment variables");
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Server configuration error." }),
      };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      requireTLS: smtpPort === 587,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Prepare email
    const mailOptions = {
      from: contactSender,
      to: contactRecipient,
      replyTo: email,
      subject: `[Optimus Website] ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
      html: `
        <h2>New Inquiry from Optimus Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: true, message: "Inquiry sent successfully." }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Failed to send inquiry." }),
    };
  }
};

