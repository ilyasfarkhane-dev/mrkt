import { db } from "../connect.js"; // اتصال بالقاعدة

// Create a category
export const createCategory = (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json("Category name is required.");
  }

  const query = `INSERT INTO Categories (name, description) VALUES (?, ?)`;
  const values = [name, description || null];

  db.query(query, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json({ message: "Category created successfully", id: data.insertId });
  });
};

// Get all categories
export const getAllCategories = (req, res) => {
  const query = `SELECT * FROM Categories`;

  db.query(query, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// Get single category
export const getCategoryById = (req, res) => {
  const { id } = req.params;

  const query = `SELECT * FROM Categories WHERE id = ?`;

  db.query(query, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Category not found");
    return res.status(200).json(data[0]);
  });
};

// Update category
export const updateCategory = (req, res) => {
  const { id } = req.params;
  const updates = {};
  const allowedFields = ["name", "description"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json("No fields to update.");
  }

  const fieldsToUpdate = Object.keys(updates).map((field) => `${field} = ?`).join(", ");
  const values = [...Object.values(updates), id];

  const query = `UPDATE Categories SET ${fieldsToUpdate} WHERE id = ?`;

  db.query(query, values, (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("Category not found");
    return res.status(200).json("Category updated successfully");
  });
};

// Delete category
export const deleteCategory = (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM Categories WHERE id = ?`;

  db.query(query, [id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(404).json("Category not found");
    return res.status(200).json("Category deleted successfully");
  });
};
