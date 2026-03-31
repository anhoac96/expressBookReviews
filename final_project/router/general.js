const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchedBooks = Object.entries(books)
    .filter(([, book]) => book.author.toLowerCase() === author)
    .reduce((result, [isbn, book]) => {
      result[isbn] = book;
      return result;
    }, {});

  if (Object.keys(matchedBooks).length === 0) {
    return res.status(404).json({ message: "No books found for this author." });
  }

  return res.status(200).json(matchedBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchedBooks = Object.entries(books)
    .filter(([, book]) => book.title.toLowerCase() === title)
    .reduce((result, [isbn, book]) => {
      result[isbn] = book;
      return result;
    }, {});

  if (Object.keys(matchedBooks).length === 0) {
    return res.status(404).json({ message: "No books found for this title." });
  }

  return res.status(200).json(matchedBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (Object.keys(book.reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book." });
  }

  return res.status(200).json(book.reviews);
});

// Get all books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://127.0.0.1:5000/');
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch books." });
  }
});

// Get book details based on ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Unable to fetch book by ISBN." };
    return res.status(status).json(data);
  }
});

// Get book details based on author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Unable to fetch books by author." };
    return res.status(status).json(data);
  }
});

// Get book details based on title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const response = await axios.get(`http://127.0.0.1:5000/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: "Unable to fetch books by title." };
    return res.status(status).json(data);
  }
});

module.exports.general = public_users;
