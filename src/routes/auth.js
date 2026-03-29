const express = require("express");
const router = express.Router();
const { prisma } = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require('joi');

const registerSchema = Joi.object({
    fullName: Joi.string().min(3).required().messages({
        'string.empty': 'Full name cannot be empty',
        'string.min': 'Full name must be at least 3 characters'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});



router.post("/register", async (req, res) => {
    
    const { error } = registerSchema.validate(req.body);
    if (error) {

        return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                fullname: fullName,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: "User created", userId: newUser.id });
    } catch (error) {
        console.error(error); 
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post("/login", async (req, res) => {
    
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id }, "YOUR_SECRET", { expiresIn: "1d" });

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: { id: user.id, email: user.email, fullname: user.fullname } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during login" });
    }
});

module.exports = router;