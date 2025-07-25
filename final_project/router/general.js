const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body; // Extract username and password from request body

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Check if the username already exists
    if (users[username]) {
      return res.status(409).json({ message: "Username already exists." }); // Conflict status
    }
  
    // Add the new user
    users[username] = { password }; // Store the user with username as key
    return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    const book = books[isbn]; // Find the book by ISBN
  
    if (book) {
      return res.status(200).json(book); // Return the book details if found
    } else {
      return res.status(404).json({ message: "Book not found" }); // Return a 404 if not found
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author; // Retrieve the author from request parameters
    const foundBooks = []; // Array to hold books by the specified author
  
    // Iterate through the books object
    for (const key in books) {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        foundBooks.push(books[key]); // Add matching books to the array
      }
    }
  
    // Check if any books were found
    if (foundBooks.length > 0) {
      return res.status(200).json(foundBooks); // Return the array of found books
    } else {
      return res.status(404).json({ message: "No books found for this author" }); // Return 404 if none found
    }
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title; // Retrieve the title from request parameters
    const foundBooks = []; // Array to hold books by the specified title
  
    // Iterate through the books object
    for (const key in books) {
      if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
        foundBooks.push(books[key]); // Add matching books to the array
      }
    }
  
    // Check if any books were found
    if (foundBooks.length > 0) {
      return res.status(200).json(foundBooks); // Return the array of found books
    } else {
      return res.status(404).json({ message: "No books found with this title" }); // Return 404 if none found
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Retrieve the ISBN from the request parameters
    const book = books[isbn]; // Find the book by ISBN
  
    if (book) {
      // Check if there are any reviews for the book
      if (Object.keys(book.reviews).length > 0) {
        return res.status(200).json(book.reviews); // Return the reviews if found
      } else {
        return res.status(404).json({ message: "No reviews found for this book" }); // Return 404 if no reviews
      }
    } else {
      return res.status(404).json({ message: "Book not found" }); // Return 404 if book not found
    }
});

module.exports.general = public_users;
