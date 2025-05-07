import  jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

// Middleware to authenticate the user
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
  if (!token) return res.status(401).json("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach the decoded user info to the request object
    next();
  } catch (err) {
    return res.status(400).json("Invalid token.");
  }
};

// Middleware to check if the user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json("Access denied. Admin role required.");
  }
  next();
};

export const isSeller = (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json("Access denied. seller role required.");
  }
  next();
};

export const isAdminSeller = (req, res, next) => {
  if (req.user.role !== "seller" && req.user.role !== "admin") {
    return res.status(403).json("Access denied. seller or Admin role required.");
  }
  next();
};

// Middleware to check if the user is authenticated or an admin
export const isAuthenticatedOrAdmin = (req, res, next) => {
  const userId = req.user?.id; // Get user ID from the decoded JWT

  // If the user is not authenticated AND not an admin, reject the request
  if (!userId && req.user?.role !== "admin") {
    return res.status(403).json("You need to be logged in or an admin to perform this action.");
  }

  // Proceed to the next middleware/controller
  next();
};

