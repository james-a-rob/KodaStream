const express = require('express');
const app = express();
const port = 3000; // You can change the port if needed

// Middleware to parse JSON bodies
app.use(express.json());

// Simple route for the home page
app.get('/', (req, res) => {
    res.send('Welcome to the Home Page!');
});

// Another route example
app.get('/about', (req, res) => {
    res.send('This is the About Page');
});

// Handle POST requests
app.post('/data', (req, res) => {
    const data = req.body;
    res.send(`Received data: ${JSON.stringify(data)}`);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});