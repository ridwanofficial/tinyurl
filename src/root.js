
import fs from 'fs'
import express from 'express'
import {nanoid} from 'nanoid'
import {  findOriginalUrl, findShortUrlForLongUrl, createShortUrl, validateUrlInput } from './utils.js';


 const app = express();
app.use(express.json());


// POST endpoint to generate short URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;

    // Validate the URL input
    const { isValid, error } = validateUrlInput(longUrl);
    if (!isValid) {
        return res.status(400).json({ error });
    }
    // Check if the URL is already shortened
    const existingShortUrl = findShortUrlForLongUrl(longUrl);
    if (existingShortUrl) {
        return res.json({ shortUrl: existingShortUrl });
    }

    // Generate and save a unique short URL
    const shortUrl = createShortUrl(longUrl);
    res.json({ shortUrl });
});

// GET endpoint to redirect to the original URL
app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    console.log('req.params:', req.params)

    const longUrl = findOriginalUrl(shortUrl);
    if (!longUrl) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(longUrl);
});


// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Export the app and server for testing
export { app, server };