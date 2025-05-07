import { config } from "dotenv";
config();
import nodemailer from "nodemailer";

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "******" : "Not set"); // Mask password
    console.log("RECEIVING_EMAIL:", process.env.RECEIVING_EMAIL); // ✅ Fixed

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    // Check if RECEIVING_EMAIL is set
    if (!process.env.RECEIVING_EMAIL) {
      console.error("Error: RECEIVING_EMAIL is not set.");
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVING_EMAIL, // ✅ Now properly checked
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>This message was sent from your website contact form.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation to user (if enabled)
    if (process.env.SEND_CONFIRMATION === 'true') {
      const userMailOptions = {
        from: `"${process.env.EMAIL_SENDER_NAME || 'Website'}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `We've received your message`,
        html: `
          <h2>Thank you for contacting us, ${name}!</h2>
          <p>We've received your message and will get back to you soon.</p>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p>${process.env.EMAIL_SIGNATURE || 'Best regards,<br>Our Team'}</p>
        `,
      };
      await transporter.sendMail(userMailOptions);
    }

    res.status(200).json({ 
      success: true,
      message: 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send message. Please try again later.' 
    });
  }
};