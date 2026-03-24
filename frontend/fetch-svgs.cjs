const https = require('https');
const fs = require('fs');

function fetchWikiImage(filename, title) {
    const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
    
    https.get(api, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                const pages = parsed.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId === "-1" || !pages[pageId].imageinfo) {
                    console.error("Not found on Commons:", title);
                    return;
                }
                let url = pages[pageId].imageinfo[0].url;
                console.log("Found URL:", url);
                
                https.get(url, (imgRes) => {
                    const file = fs.createWriteStream(filename);
                    imgRes.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log("Downloaded", filename);
                    });
                }).on('error', err => console.error("Download Error:", err));
            } catch (e) {
                console.error("Parse error:", e);
            }
        });
    }).on('error', err => console.error("API Error:", err));
}

// Ensure dir exists
if (!fs.existsSync("public")) fs.mkdirSync("public", { recursive: true });

fetchWikiImage('public/tubitak-logo.svg', 'TÜBİTAK_logo.svg');
fetchWikiImage('public/atauni-logo.svg', 'Atatürk_Üniversitesi.svg');
