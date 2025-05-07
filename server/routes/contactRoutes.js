import express from "express";
import { sendContactEmail } from '../controllers/contactController.js';


const router = express.Router();

// POST /api/contact
router.post('/', sendContactEmail);


export default router;  