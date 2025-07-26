const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Array to hold user records

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Middleware to authenticate user based on JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
    if (token) {
        jwt.verify(token, 'my_jwt_secret', (err, user) => { 
            if (err) {
                return res.sendStatus(403); // Forbidden if token is invalid
            }
            req.user = user; // Attach user info to request
            next(); 
        });
    } else {
        res.sendStatus(401); // Unauthorized if no token
    }
};

// Only registered users can log in
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username) || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });

    return res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    const { review } = req.query; // Get the review from the query string
    const username = req.user.username; // Get the username from the authenticated user

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully." });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateJWT, (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the request parameters
    const username = req.user.username; // Get the username from the authenticated user

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if reviews exist for the book
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Delete the review for the authenticated user
        return res.status(200).json({ message: "Review deleted successfully." });
    } else {
        return res.status(404).json({ message: "Review not found for this user." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;