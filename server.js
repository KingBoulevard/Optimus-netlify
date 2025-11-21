/**
 * Simple Express backend to relay contact form submissions via SMTP.
 *
 * Usage:
 * 1. npm init -y
 * 2. npm install express cors nodemailer dotenv
 * 3. Create a .env file with:
 *    SMTP_HOST=smtp.yourprovider.com
 *    SMTP_PORT=587
 *    SMTP_USER=your_username
 *    SMTP_PASS=your_password
 *    CONTACT_RECIPIENT=optimusbcc@gmail.com
 *    CONTACT_SENDER=no-reply@optimusbcc.co.zm   # optional, default uses CONTACT_RECIPIENT
 *    PORT=4000                                   # optional
 * 4. Start the server with `node server.js` or `npm start`.
 *
 * Frontend should POST JSON to /api/contact with:
 * { name: "", email: "", subject: "", message: "" }
 */

const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "static")));
app.use(
  "/Images",
  express.static(path.join(__dirname, "Images"), {
    extensions: ["jpg", "jpeg", "png", "svg", "webp"],
  })
);

// Specific route for PDF download to handle spaces in filename (must be before static middleware)
app.get("/Profile/:filename", (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  
  // Security: Prevent path traversal attacks
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return res.status(400).send("Invalid filename");
  }
  
  const profileDir = path.join(__dirname, "Profile");
  const filePath = path.join(profileDir, filename);
  
  // Security: Verify resolved path is within Profile directory
  const resolvedPath = path.resolve(filePath);
  const resolvedProfileDir = path.resolve(profileDir);
  
  if (!resolvedPath.startsWith(resolvedProfileDir)) {
    return res.status(403).send("Access denied");
  }
  
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(404).send("File not found");
    }
  });
});

app.use(
  "/Profile",
  express.static(path.join(__dirname, "Profile"))
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP configuration error:", error.message);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const mailOptions = {
    from: process.env.CONTACT_SENDER || process.env.CONTACT_RECIPIENT,
    to: process.env.CONTACT_RECIPIENT,
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

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Inquiry sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ error: "Failed to send inquiry. Please try again later." });
  }
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Contact form server listening on http://localhost:${PORT}`);
});

module.exports = app;

