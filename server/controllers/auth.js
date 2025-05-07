import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
import nodemailer from "nodemailer";

export const register = (req, res) => {
  // Validate password confirmation
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json("Passwords do not match!");
  }

  // Check if user already exists
  const checkUserQuery = "SELECT * FROM users WHERE user_name = ? OR email = ?";
  db.query(checkUserQuery, [req.body.user_name, req.body.email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    // Generate a verification token
    const verificationToken = Math.random().toString(36).substring(2, 15); // Random string

    // Determine the role: Use the provided role or default to 'buyer'
    const role = req.body.role || "buyer"; // Default to 'buyer' if no role is specified

    // Insert the new user into the database
    const insertUserQuery =
      "INSERT INTO users (`first_name`, `last_name`, `user_name`, `email`, `password`, `role`, `email_verified`, `verification_token`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      req.body.first_name,
      req.body.last_name,
      req.body.user_name,
      req.body.email,
      hashedPassword,
      role, // Include the role in the query
      false, // Email not verified yet
      verificationToken,
    ];

    db.query(insertUserQuery, values, (err, data) => {
      if (err) return res.status(500).json(err);

      // Send verification email
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use your email service
        auth: {
          user: process.env.EMAIL_USER, // Your email
          pass: process.env.EMAIL_PASS, // Your email password or app-specific password
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: "Verify Your Email",
        text: `Please click the following link to verify your email: http://localhost:3000/verify-email?token=${verificationToken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json("Failed to send verification email.");
        }
        return res.status(200).json("User has been created. Please verify your email.");
      });
    });
  });
};
export const verifyEmail = (req, res) => {
  const { token } = req.query;

  if (!token) {
    console.log("No token provided.");
    return res.status(400).json("Verification token is required.");
  }

  console.log("Verifying email with token:", token);

  // Check if the token exists in the database
  const checkTokenQuery =
    "SELECT * FROM users WHERE verification_token = ?";
  db.query(checkTokenQuery, [token], (err, data) => {
    if (err) {
      console.error("Database error while checking token:", err);
      return res.status(500).json("Internal server error.");
    }
    if (data.length === 0) {
      console.log("Invalid or expired token:", token);
      return res.status(400).json("Invalid or expired verification token.");
    }

    console.log("Token is valid. Updating email_verified status...");

    // Update the user's email_verified status
    const updateQuery =
      "UPDATE users SET email_verified = TRUE WHERE verification_token = ?";
    db.query(updateQuery, [token], (err, data) => {
      if (err) {
        console.error("Database error during email verification:", err);
        return res.status(500).json("Internal server error.");
      }
      if (data.affectedRows === 0) {
        console.log("No rows updated. Invalid or expired token:", token);
        return res.status(400).json("Invalid or expired verification token.");
      }
      console.log("Email verified successfully for token:", token);
      return res.status(200).json("Email verified successfully.");
    });
  });
};

export const requestPasswordReset = (req, res) => {
  const { email } = req.body;

  // 1. Check if user exists
  const q = "SELECT * FROM users WHERE email = ?";
  db.query(q, [email], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const user = data[0];
    
    // 2. Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    // 3. Store token in database
    const updateQuery = "UPDATE users SET reset_token = ? WHERE id = ?";
    db.query(updateQuery, [resetToken, user.id], (err) => {
      if (err) return res.status(500).json(err);

      // 4. Send email with reset link
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `
          <p>You requested a password reset for your account.</p>
          <p>Click this link to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending reset email:", error);
          return res.status(500).json("Failed to send reset email.");
        }
        return res.status(200).json("Password reset link sent to your email.");
      });
    });
  });
};

export const resetPassword = (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // 1. Validate passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json("Passwords do not match!");
  }

  // 2. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json("Invalid or expired token.");
    }

    // 3. Check if token exists in database
    const q = "SELECT * FROM users WHERE id = ? AND reset_token = ?";
    db.query(q, [decoded.id, token], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.length === 0) return res.status(401).json("Invalid token.");

      // 4. Hash new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // 5. Update password and clear reset token
      const updateQuery = "UPDATE users SET password = ?, reset_token = NULL WHERE id = ?";
      db.query(updateQuery, [hashedPassword, decoded.id], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Password has been reset successfully.");
      });
    });
  });
};

export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE user_name = ?";

  db.query(q, [req.body.user_name], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    const user = data[0];

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(403).json("Please verify your email before logging in.");
    }

    // Check password
    const checkPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!checkPassword) return res.status(400).json("Wrong password or username!");

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h' // Token expires in 24 hours
    });

    const { password, ...userData } = user;

    // Return token in response body instead of cookie
    res.status(200).json({
      token, // Send token directly in response
      user: userData
    });
  });
};
export const logout = (req, res) => {
  res.clearCookie("accessToken",{
    secure:true,
    sameSite:"none"
  }).status(200).json("User has been logged out.")
};
