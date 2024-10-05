const express = require('express');
const axios = require('axios');
const { query, validationResult } = require('express-validator');
require('dotenv').config(); 
const app = express();
const PORT = 3003;

const cors = require("cors");
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

const validateQueryParams = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0.'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be greater than 0.'),
  query('search').optional().isString().withMessage('Search must be a string.'),
  query('title').optional().isString().withMessage('Title must be a string.'),
  query('categoryName').optional().isString().withMessage('Category Name must be a string.'),
];


// Middleware for handling errors
const errorHandler = (err, req, res, next) => {
  if (err.response) {
    res.status(err.response.status).json({ error: err.response.data });
  } else if (err.request) {
    res.status(500).json({ error: 'No response received from the podcast service' });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Route to handle GET /podcasts with query parameters and pagination
app.get('/podcasts', validateQueryParams, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const response = await axios.get(process.env.PODCAST_SERVICE_URL, { params: req.query });
    res.status(200).json(response.data);
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Middleware to handle 404 - Not Found
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Middleware to handle any other errors
app.use(errorHandler);

// Base route for health check
app.get('/', (req, res) => {
    res.send('Podcast Gateway service is running...');
});

app.listen(PORT, () => {
    console.log(`Podcast Gateway service is running on http://localhost:${PORT}`);
});
