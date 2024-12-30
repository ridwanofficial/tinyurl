import fs from 'fs';
import { generateShortUrl } from './generateUniqueString.js';

// JSON file to store URL mappings
const storageFile = 'urlStorage.json';

// Helper function to load data from JSON file
export function loadData() {
    if (!fs.existsSync(storageFile)) {
        fs.writeFileSync(storageFile, JSON.stringify({}));
    }

    try {
        const content = fs.readFileSync(storageFile, 'utf-8');
        return content.trim() ? JSON.parse(content) : {};
    } catch (error) {
        console.error('Error reading or parsing JSON file:', error);
        return {};
    }
}
// Helper function to save data to JSON file
export function saveData(data) {
    fs.writeFileSync(storageFile, JSON.stringify(data, null, 2));
}

// Utility function to validate URLs
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}


// Utility function to find the original URL by short URL
export function findOriginalUrl(shortUrl) {
    const data = loadData();
    console.log('data:', data);

    const urlData = data[shortUrl];
    if (!urlData) {
        return null;
    }

    return urlData.longUrl;
}

// Utility function to check if a URL is already shortened
export function findShortUrlForLongUrl(longUrl) {
    const data = loadData();
    for (const [shortUrl, urlData] of Object.entries(data)) {
        if (urlData.longUrl === longUrl) {
            return shortUrl;
        }
    }
    return null;
}

// Utility function to generate and save a unique short URL
export function createShortUrl(longUrl) {
    const data = loadData();
    let shortUrl;
    do {
        shortUrl = generateShortUrl(longUrl);
    } while (data[shortUrl]); // Ensure uniqueness

    // Save the mapping
    data[shortUrl] = { longUrl, createdAt: new Date().toISOString() };
    saveData(data);

    return shortUrl;
}

// Utility function to validate the URL input
export function validateUrlInput(longUrl) {
    if (!longUrl) {
        return { isValid: false, error: 'URL is required' };
    }
    if (!isValidUrl(longUrl)) {
        return { isValid: false, error: 'Invalid URL' };
    }
    return { isValid: true };
}