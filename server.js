const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
// Sajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));


// --- FUNGSI SCRAPER ---
async function scrapeInstagramStats(username) {
    if (!username) return { followers: 0 };
    const url = `https://www.instagram.com/${username}/`;
    try {
        const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
        const { data } = await axios.get(url, { headers });
        const $ = cheerio.load(data);
        let followersCount = 0;
        $('script[type="application/ld+json"]').each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent) {
                try {
                    const jsonData = JSON.parse(scriptContent);
                    if (jsonData.mainEntityofPage?.interactionStatistic) {
                        const followerStat = jsonData.mainEntityofPage.interactionStatistic.find(s => s.interactionType === 'http://schema.org/FollowAction');
                        if (followerStat) followersCount = parseInt(followerStat.userInteractionCount, 10);
                    }
                } catch (e) {}
            }
        });
        return { followers: followersCount };
    } catch (error) {
        console.error(`Gagal scrape Instagram untuk ${username}:`, error.message);
        return { followers: 0, error: 'Profil tidak ditemukan atau privat.' };
    }
}

// --- API ENDPOINT ---
app.post('/scrape', async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username harus diisi.' });
    }
    
    console.log(`Menerima permintaan scrape untuk: ${username}`);
    const data = await scrapeInstagramStats(username);
    res.status(200).json(data);
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
