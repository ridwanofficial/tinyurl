
import fs from 'fs'
import express from 'express'
import {nanoid} from 'nanoid'
import { generateShortUrl } from './generateUniqueString.js';

 const app = express();
app.use(express.json());

// JSON file to store URL mappings
const storageFile = 'urlStorage.json';

// Helper function to load data from JSON file
export function loadData() {
    if (!fs.existsSync(storageFile)) {
        fs.writeFileSync(storageFile, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(storageFile, 'utf-8'));
}

// Helper function to save data to JSON file
export function saveData(data) {
    fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
}

// POST endpoint to generate short URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl || !isValidUrl(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const data = loadData();

    // Check if the URL is already shortened
    for (const [shortUrl, urlData] of Object.entries(data)) {
        if (urlData.longUrl === longUrl) {
            return res.json({ shortUrl });
        }
    }

    // Generate a unique short URL
    let shortUrl;
    do {
        shortUrl = generateShortUrl(longUrl)//;
    } while (data[shortUrl]); // Ensure uniqueness

    // Save the mapping
    data[shortUrl] = { longUrl, createdAt: new Date().toISOString() };
    saveData(data);

    res.json({ shortUrl });
});

// GET endpoint to redirect to the original URL
app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    console.log('req.params:', req.params)

    const data = loadData();
    console.log('data:', data)
    const urlData = data[shortUrl];

    if (!urlData) {
        return res.status(404).json({ error: 'Short URL not found' });
    }

    res.redirect(urlData.longUrl);
});

// Utility function to validate URLs
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// Export the app and server for testing
export { app, server };