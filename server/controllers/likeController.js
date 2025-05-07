import { db } from "../connect.js";


export const toggleLike = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body; // Assuming the product_id is sent in the body

  // Check if the user has already liked this product
  const checkLikeQuery = "SELECT * FROM Likes WHERE user_id = ? AND product_id = ?";
  db.query(checkLikeQuery, [userId, product_id], (err, data) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });

    if (data.length > 0) {
      // If the user already liked it, we unlike the product
      const unlikeQuery = "DELETE FROM Likes WHERE user_id = ? AND product_id = ?";
      db.query(unlikeQuery, [userId, product_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        return res.status(200).json({ message: "Product unliked successfully" });
      });
    } else {
      // If the user has not liked it, we like the product
      const likeQuery = "INSERT INTO Likes (user_id, product_id) VALUES (?, ?)";
      db.query(likeQuery, [userId, product_id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error", details: err.message });

        return res.status(200).json({ message: "Product liked successfully" });
      });
    }
  });
};


// Get all likes of a product
export const getLikesByProduct = (req, res) => {
  const { product_id } = req.params;
  const user_id = req.user?.id; // Assuming the authenticated user's ID is available in `req.user`

  // Query to count total likes for the product
  const likeCountQuery = "SELECT COUNT(*) AS likeCount FROM Likes WHERE product_id = ?";

  // Query to check if the current user has liked the product
  const isLikedQuery = "SELECT EXISTS(SELECT 1 FROM Likes WHERE product_id = ? AND user_id = ?) AS is_liked";

  // Execute both queries
  db.query(likeCountQuery, [product_id], (err, likeCountResult) => {
    if (err) return res.status(500).json(err);

    const likeCount = likeCountResult[0]?.likeCount || 0;

    db.query(isLikedQuery, [product_id, user_id], (err, isLikedResult) => {
      if (err) return res.status(500).json(err);

      const is_liked = isLikedResult[0]?.is_liked === 1;

      // Return the combined response
      return res.status(200).json({
        likeCount,
        is_liked,
      });
    });
  });
};
// Check if a user liked a specific product
export const checkIfUserLiked = (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.params;

  const query = "SELECT * FROM Likes WHERE user_id = ? AND product_id = ?";

  db.query(query, [userId, product_id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ liked: data.length > 0 });
  });
};
