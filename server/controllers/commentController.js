import { db } from "../connect.js";

// Add a comment
export const addComment = (req, res) => {
  const userId = req.user.id;
  const { content, product_id } = req.body;

  if (!content || !product_id) {
    return res.status(400).json({ error: "Content and Product ID are required." });
  }

  // 1. Insert the comment
  const insertQuery = "INSERT INTO Comments (content, user_id, product_id) VALUES (?, ?, ?)";
  
  db.query(insertQuery, [content, userId, product_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Fetch the newly inserted comment with user details (if needed)
    const selectQuery = `
      SELECT c.*, u.user_name 
      FROM Comments c
      LEFT JOIN Users u ON c.user_id = u.id
      WHERE c.id = ?
    `;

    db.query(selectQuery, [result.insertId], (err, data) => {
      if (err) return res.status(500).json({ error: err.message });

      const newComment = data[0];
      return res.status(201).json({
        message: "Comment added successfully.",
        comment: newComment, // Send back the full comment data
      });
    });
  });
};

// Delete a comment
  export const deleteComment = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if the user is an admin or the owner of the comment
    const checkQuery = "SELECT * FROM Comments WHERE id = ?";

    db.query(checkQuery, [id], (err, data) => {
      if (err) return res.status(500).json(err);

      if (data.length === 0) {
        return res.status(404).json("Comment not found.");
      }

      // If user is not an admin and not the owner of the comment
      if (req.user.role !== "admin" && data[0].user_id !== userId) {
        return res.status(403).json("You can only delete your own comments.");
      }

      // Proceed to delete the comment
      const deleteQuery = "DELETE FROM Comments WHERE id = ?";
      db.query(deleteQuery, [id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Comment deleted successfully.");
      });
    });
  };


// Get all comments for a product
export const getCommentsByProduct = (req, res) => {
  const { product_id } = req.params;

  const query = `
    SELECT Comments.*, Users.user_name, Users.first_name, Users.last_name 
    FROM Comments 
    JOIN Users ON Comments.user_id = Users.id
    WHERE product_id = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [product_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};
