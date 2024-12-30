import crypto from 'crypto';
import fs from 'fs';
import { loadData } from './utils.js';

// File to store the URL mappings
const storageFile = 'urlStorage.json';



// Helper function to save data to the JSON file
function saveData(data) {
    fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
}

// Helper function to convert a number to Base62
function toBase62(num) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    while (num > 0) {
        result = chars[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result.padStart(6, '0'); // Ensure the length is always 6 characters
}

// Generate a unique short URL
export function generateShortUrl(longUrl) {
    const data = loadData();

    // Check if the URL is already shortened
    for (const [shortUrl, urlData] of Object.entries(data)) {
        if (urlData.longUrl === longUrl) {
            return shortUrl; // Return existing short URL
        }
    }

    // Hash the long URL using SHA-256
    const hash = crypto.createHash('sha256').update(longUrl).digest('hex');

    // Convert the first part of the hash to Base62 (6 characters)
    let shortUrl = toBase62(parseInt(hash.slice(0, 8), 16));

    // Ensure uniqueness
    let counter = 0;
    while (data[shortUrl]) {
        counter++;
        shortUrl = toBase62(parseInt(hash.slice(0, 8), 16) + counter);
    }

    // Save the new short URL to the storage
    data[shortUrl] = { longUrl, createdAt: new Date().toISOString() };
    saveData(data);

    return shortUrl;
}

