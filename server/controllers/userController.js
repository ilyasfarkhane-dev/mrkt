import {db} from "../connect.js"; 


export const getAllUsers = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Access denied. Admin role required.");
  }

  const query = "SELECT id, first_name,faculte,cne,affiliation, last_name, user_name, email, role, status, created_at FROM Users";
  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};
// Get user by ID
export const getUserById = (req, res) => {
  const userId = req.params.id;

  const query = "SELECT id, first_name, last_name, user_name, email, role, status, created_at FROM Users WHERE id = ?";
  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found");
    return res.status(200).json(data[0]);
  });
};

export const updateUser = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Access denied. Admin role required.");
  }

  const userId = req.params.id;

  const updates = {};

  
  Object.keys(req.body).forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json("No fields to update.");
  }

  const fieldsToUpdate = Object.keys(updates).map((field) => `${field} = ?`).join(", ");
  const values = [...Object.values(updates), userId];

  const query = `UPDATE Users SET ${fieldsToUpdate} WHERE id = ?`;

  db.query(query, values, (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("User not found");
    return res.status(200).json("User updated successfully");
  });
};


export const updateMyProfile = (req, res) => {
  const userId = req.user.id; // Retrieve the authenticated user's ID from the token
console.log(userId)
  // Extract fields provided in the request body
  const updates = {};
  const allowedFields = [
    "first_name",
    "last_name",
    "user_name",
    "email",
    "about",
    "faculte",
    "affiliation",
    "cne",
    "linkedin",
    "twitter",
    "github",
    "facebook",
    "instagram",
  ];

  // Filter out undefined or null values
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      updates[field] = req.body[field];
    }
  });

  // If no fields are provided for update, return an error
  if (Object.keys(updates).length === 0) {
    return res.status(400).json("No fields to update.");
  }

  // Build the dynamic SQL query
  const fieldsToUpdate = Object.keys(updates)
    .map((field) => `${field} = ?`)
    .join(", ");
  const values = [...Object.values(updates), userId]; // Include the user ID at the end

  const query = `UPDATE Users SET ${fieldsToUpdate} WHERE id = ?`;

  // Execute the query
  db.query(query, values, (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    if (data.affectedRows === 0) {
      return res.status(404).json("User not found.");
    }

    return res.status(200).json("Profile updated successfully.");
  });
};

// Get my profile
export const getMyProfile = (req, res) => {
  const userId = req.user.id; 
console.log(userId)
  const query =
    "SELECT id, first_name, last_name, user_name, email, picture, about, faculte, affiliation, cne, role, status, linkedin, twitter, github, facebook, instagram, created_at FROM Users WHERE id = ?";
  db.query(query, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found");
    return res.status(200).json(data[0]);
  });
};

// Get all sellers
export const getSellers = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Access denied. Admin role required.");
  }

  const query = `
    SELECT id, first_name, last_name,faculte,affiliation,notif_read_status, user_name, email_verified, email, role, status, created_at 
    FROM Users 
    WHERE role = 'seller'
  `;
  
  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// Get all buyers
export const getBuyers = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Access denied. Admin role required.");
  }

  const query = `
    SELECT id, first_name, last_name,faculte,affiliation, email_verified,notif_read_status, user_name, email, role, status, created_at 
    FROM Users 
    WHERE role = 'buyer'
  `;
  
  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// DELETE User and all their products + images
export const deleteUserWithProducts = (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Access denied. Admin role required.");
  }

  const userId = req.params.id;

  // Step 1: Get all products of this user
  const getProductQuery = `SELECT id, images FROM Products WHERE seller_id = ?`;
  db.query(getProductQuery, [userId], (err, products) => {
    if (err) return res.status(500).json(err);

    // Step 2: Delete each product and its images
    let deletedCount = 0;

    if (!products.length) {
      // No products, just delete user
      return deleteUser(userId, req, res);
    }

    products.forEach((product, index) => {
      const { id: productId, images } = product;
      const parsedImages = images ? JSON.parse(images) : [];

      // Delete product from DB
      const deleteProductQuery = `DELETE FROM Products WHERE id = ?`;
      db.query(deleteProductQuery, [productId], (err) => {
        if (err) console.error(`Failed to delete product ID ${productId}:`, err);

        // Delete associated images
        if (parsedImages.length > 0) {
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
          const uploadDir = join(__dirname, '../../client/public/upload');

          parsedImages.forEach(filename => {
            const filePath = join(uploadDir, filename);
            fs.unlink(filePath, (err) => {
              if (err) console.error(`Failed to delete image ${filename}:`, err);
            });
          });
        }

        deletedCount++;
        if (deletedCount === products.length) {
          // All products deleted, now delete the user
          deleteUser(userId, req, res);
        }
      });
    });
  });
};

// Helper function to delete user after all products are gone
function deleteUser(userId, req, res) {
  const deleteUserQuery = `DELETE FROM Users WHERE id = ?`;

  db.query(deleteUserQuery, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json("User not found");

    return res.status(200).json("User and all associated products and images deleted successfully");
  });
}