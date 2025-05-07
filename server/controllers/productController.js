import { db } from "../connect.js";
import moment from "moment";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';


export const createProduct = (req, res) => {
  const {
    title,
    description,
    lien_web,
    lien_insta,
    lien_fb,
    lien_linkedin,
    lien_tiktok,
    nmr_phone,
    category_id,
  } = req.body;

  const seller_id = req.user.id;

  if (!category_id) {
    return res.status(400).json("Category ID is required.");
  }

  // First check if user is active
  const checkUserQuery = `SELECT status FROM Users WHERE id = ?`;
  
  db.query(checkUserQuery, [seller_id], (err, userData) => {
    if (err) return res.status(500).json(err);
    
    if (userData.length === 0) {
      return res.status(404).json("User not found");
    }
    
    if (!userData[0].status) {
      return res.status(403).json("Your account is not active. Please contact support to activate your account.");
    }

    // Extract uploaded images
    const images = req.files?.images?.map((file) => file.filename) || [];

    const query = `
      INSERT INTO Products 
      (title, description, images, lien_web, lien_insta, lien_fb, lien_linkedin, lien_tiktok, nmr_phone, seller_id, category_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const createdAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const values = [
      title,
      description,
      JSON.stringify(images), // Store the filenames as a JSON string
      lien_web,
      lien_insta,
      lien_fb,
      lien_linkedin,
      lien_tiktok,
      nmr_phone,
      seller_id,
      category_id,
      createdAt,
    ];

    db.query(query, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(201).json({ message: "Product created successfully", id: data.insertId });
    });
  });
};



// Get all products
export const getAllProducts = (req, res) => {
  const query = `
    SELECT 
      p.*,
      u.user_name as seller_name
    FROM Products p
    LEFT JOIN Users u ON p.seller_id = u.id
  `;

  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);

    const products = data.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      seller: {
        id: product.seller_id,
        name: product.seller_name
      }
    }));

    return res.status(200).json(products);
  });
};

// Get products belonging to the current seller
export const getMyProducts = (req, res) => {
  const sellerId = req.user.id; // Get seller ID from authenticated user
  
  const query = `
    SELECT p.*,c.name as category_name 
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
    WHERE p.seller_id = ?
    ORDER BY p.created_at DESC
  `;

  db.query(query, [sellerId], (err, data) => {
    if (err) {
      return res.status(500).json({ 
        error: "Database error", 
        details: err.message 
      });
    }

    // Parse images JSON and add category name
    const products = data.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      Category: {
        name: product.category_name || "Uncategorized"
      }
    }));

    return res.status(200).json(products);
  });
};

export const getActiveProducts = (req, res) => {
  const query = `
    SELECT 
      p.*, 
      c.name as category_name,
      u.user_name as seller_name
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
    LEFT JOIN Users u ON p.seller_id = u.id
    WHERE p.status = TRUE
  `;
  
  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    
    // Return empty array instead of 404 when no products found
    if (data.length === 0) {
      return res.status(200).json([]);
    }

    const products = data.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      Category: {
        id: product.category_id,
        name: product.category_name || "Uncategorized"
      },
      seller: {
        id: product.seller_id,
        name: product.seller_name
      }
    }));

    return res.status(200).json(products);
  });
};


// Get single product
export const getProductById = (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      p.*, 
      c.name as category_name,
      u.user_name as seller_name,
      u.email as seller_email
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.id
    LEFT JOIN Users u ON p.seller_id = u.id
    WHERE p.id = ?`;

  db.query(query, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Product not found");

    const product = data[0];
    product.images = product.images ? JSON.parse(product.images) : [];
    
    // Add seller info to the response
    product.seller = {
      id: product.seller_id,
      name: product.seller_name,
      email: product.seller_email
    };

    return res.status(200).json(product);
  });
};

// Update product
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const seller_id = req.user.id; // Get the current user's ID

  try {
    // First check if user is active
    const checkUserQuery = `SELECT status FROM Users WHERE id = ?`;
    
    db.query(checkUserQuery, [seller_id], (err, userData) => {
      if (err) return res.status(500).json(err);
      
      if (userData.length === 0) {
        return res.status(404).json("User not found");
      }
      
      if (!userData[0].status) {
        return res.status(403).json("Your account is not active. Please contact support to activate your account.");
      }

      // Also verify the product belongs to this user
      const checkProductQuery = `SELECT seller_id FROM Products WHERE id = ?`;
      
      db.query(checkProductQuery, [id], (err, productData) => {
        if (err) return res.status(500).json(err);
        
        if (productData.length === 0) {
          return res.status(404).json("Product not found");
        }
        
        if (productData[0].seller_id !== seller_id) {
          return res.status(403).json("You can only update your own products");
        }

        // Handle file uploads if they exist
        const uploadedFiles = req.files?.images || [];
        const imagesToDelete = req.body.imagesToDelete ? JSON.parse(req.body.imagesToDelete) : [];
        const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];

        // Prepare updates object
        const updates = {
          title: req.body.title,
          description: req.body.description,
          category_id: req.body.category_id,
          lien_web: req.body.lien_web,
          lien_insta: req.body.lien_insta,
          lien_fb: req.body.lien_fb,
          lien_linkedin: req.body.lien_linkedin,
          lien_tiktok: req.body.lien_tiktok,
          nmr_phone: req.body.nmr_phone,
        };

        // Process images
        const newImageFilenames = uploadedFiles.map(file => file.filename);
        const allImages = [...existingImages, ...newImageFilenames];
        updates.images = JSON.stringify(allImages);

        // Build the SQL query
        const fieldsToUpdate = Object.keys(updates)
          .filter(key => updates[key] !== undefined)
          .map(field => `${field} = ?`)
          .join(", ");

        const values = [
          ...Object.values(updates).filter(val => val !== undefined),
          id
        ];

        // Start a transaction
        db.beginTransaction(err => {
          if (err) return res.status(500).json(err);

          // 1. Delete old images if needed
          if (imagesToDelete.length > 0) {
            const deleteQuery = `UPDATE Products SET images = JSON_REMOVE(images, JSON_UNQUOTE(JSON_SEARCH(images, 'one', ?))) WHERE id = ?`;
            
            imagesToDelete.forEach(filename => {
              db.query(deleteQuery, [filename, id], (err) => {
                if (err) {
                  return db.rollback(() => res.status(500).json(err));
                }
              });
            });
          }

          // 2. Update product data
          const updateQuery = `UPDATE Products SET ${fieldsToUpdate} WHERE id = ?`;
          
          db.query(updateQuery, values, (err, result) => {
            if (err) {
              return db.rollback(() => res.status(500).json(err));
            }

            if (result.affectedRows === 0) {
              return db.rollback(() => res.status(404).json("Product not found"));
            }

            // Commit the transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => res.status(500).json(err));
              }

              // Get the updated product
              db.query(`SELECT * FROM Products WHERE id = ?`, [id], (err, data) => {
                if (err) return res.status(500).json(err);
                
                const updatedProduct = data[0];
                updatedProduct.images = JSON.parse(updatedProduct.images || '[]');
                
                return res.status(200).json({
                  message: "Product updated successfully",
                  product: updatedProduct
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json("Internal server error");
  }
};

// Delete product
export const deleteProduct = (req, res) => {
  const { id } = req.params;

  // First get the product to access its images
  const getQuery = `SELECT images FROM Products WHERE id = ?`;
  //C:\Users\DELL\Desktop\MRKT\client\public\upload
  db.query(getQuery, [id], (err, productData) => {
    if (err) return res.status(500).json(err);
    if (productData.length === 0) return res.status(404).json("Product not found");

    const images = productData[0].images ? JSON.parse(productData[0].images) : [];
    
    // Delete the product from database
    const deleteQuery = `DELETE FROM Products WHERE id = ?`;
    
    db.query(deleteQuery, [id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows === 0) return res.status(404).json("Product not found");

      // Delete associated images from the upload folder
      if (images.length > 0) {
        // Get current directory path in ES modules
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        
        // Go up two levels from controllers directory to server root, then to client public upload
        const uploadDir = join(__dirname, '../../client/public/upload');
        
        images.forEach(filename => {
          const filePath = join(uploadDir, filename);
          
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Failed to delete image ${filename}:`, err);
              // Don't fail the whole request if image deletion fails
            }
          });
        });
      }

      return res.status(200).json("Product and associated images deleted successfully");
    });
  });
};


// Get related products (same category)
export const getRelatedProducts = (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 4;

  db.query(
    `SELECT category_id FROM Products WHERE id = ? AND status = TRUE`,
    [id],
    (err, productData) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json(err);
      }

      if (productData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found or inactive",
          productId: id
        });
      }

      const categoryId = productData[0].category_id;

      db.query(`
        SELECT 
          p.id,
          p.title,
          p.images,
          p.description,
          p.created_at,
          p.category_id,
          p.seller_id,
          u.user_name as seller_name,
          c.name as category_name
        FROM Products p
        LEFT JOIN Users u ON p.seller_id = u.id
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE p.category_id = ? 
          AND p.id != ? 
          AND p.status = TRUE
        ORDER BY p.created_at DESC
        LIMIT ?
      `, [categoryId, id, limit], (err, relatedData) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json(err);
        }

        const result = relatedData.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          created_at: p.created_at,
          images: p.images ? JSON.parse(p.images) : [], // Return all images as array
          category: {
            id: p.category_id,
            name: p.category_name
          },
          seller: {
            id: p.seller_id,
            name: p.seller_name,
            avatar: p.seller_avatar
          }
        }));

        res.json({
          success: true,
          count: result.length,
          related: result
        });
      });
    }
  );
};