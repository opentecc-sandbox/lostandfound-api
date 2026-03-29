const express = require("express");
const router = express.Router();
const { prisma } = require("../lib/prisma"); // T-yqed mn had l'path 3la hsab l'structure dyalk

// 1. GET ALL ITEMS (Browsing)
router.get("/", async (req, res) => {
  const { type, category } = req.query; 
  try {
    const items = await prisma.item.findMany({
      where: {
        type: type || undefined,
        category: category || undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { fullname: true, email: true } // Bach t-biyen smiyt li lqah/wadro
        }
      }
    });
    res.json(items);
  } catch (error) {
    console.error("❌ FETCH ERROR:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// 2. POST NEW ITEM (Report Lost/Found)
router.post("/", async (req, res) => {
  const { title, description, category, location, type, date, userId, photoUrl } = req.body;

  // Validation dial l'userId (Convert to Integer)
  const parsedUserId = parseInt(userId);
  
  if (isNaN(parsedUserId)) {
    return res.status(400).json({ 
      error: "User ID is missing or invalid. Please ensure you are logged in." 
    });
  }

  try {
    const newItem = await prisma.item.create({
      data: {
        title,
        description: description || null,
        category,
        location: location || "",
        type, // "LOST" or "FOUND"
        // Mapping 'date' l'champ li 3ndek f schema
        date: date ? new Date(date) : new Date(), 
        userId: parsedUserId,
        photoUrl: photoUrl && photoUrl.trim() !== "" ? photoUrl : null,
        status: "open"
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("❌ PRISMA CREATE ERROR:", error);
    res.status(500).json({ 
      error: "Check your database connection or schema fields", 
      details: error.message 
    });
  }
});

module.exports = router;