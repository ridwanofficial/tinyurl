import request from 'supertest';
import fs from 'fs';
import express from 'express';
import {  server ,app} from './root.js';
import { isValidUrl } from './utils.js';

describe('Short URL Service Tests', () => {
    beforeAll(() => {
        // Reset the storage file before each test
        fs.writeFileSync('urlStorage.json', JSON.stringify({}));
    });

    afterAll((done) => {
        // Close the server to avoid open handles
        server.close(done);
    });



    test('Should generate a short URL for a valid long URL', async () => {
        const response = await request(app)
            .post('/shorten')
            .send({ longUrl: 'https://example.com' });

        expect(response.status).toBe(200);
        expect(response.body.shortUrl).toHaveLength(6);
    });

    test('Should return the same short URL for an already shortened URL', async () => {
        const longUrl = 'https://example.com';
        const firstResponse = await request(app)
            .post('/shorten')
            .send({ longUrl });

        const secondResponse = await request(app)
            .post('/shorten')
            .send({ longUrl });

        expect(firstResponse.body.shortUrl).toBe(secondResponse.body.shortUrl);
    });

    test('Should return 400 for an invalid URL', async () => {
        const response = await request(app)
            .post('/shorten')
            .send({ longUrl: 'invalid-url' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL');
    });

    test('Should redirect to the original URL for a valid short URL', async () => {
        const longUrl = 'https://example.com';
        const { body } = await request(app)
            .post('/shorten')
            .send({ longUrl });

        const shortUrl = body.shortUrl;

        const redirectResponse = await request(app).get(`/${shortUrl}`);

        expect(redirectResponse.status).toBe(302);
        expect(redirectResponse.headers.location).toBe(longUrl);
    });

    test('Should return 404 for a non-existing short URL', async () => {
        const response = await request(app).get('/nonexistent');

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Short URL not found');
    });
});

describe('Utility Function Tests', () => {
    test('Should validate a correct URL', () => {
        expect(isValidUrl('https://example.com')).toBe(true);
    });

    test('Should invalidate an incorrect URL', () => {
        expect(isValidUrl('invalid-url')).toBe(false);
    });
});
