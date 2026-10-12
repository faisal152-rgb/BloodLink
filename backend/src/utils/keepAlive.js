
const startKeepAlive = () => {

    const url = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;

    if (!url) {
        console.log('ℹ️  Keep-Alive: No SERVER_URL or RENDER_EXTERNAL_URL set. (Self-ping will activate when deployed on Render or when SERVER_URL is provided)');
        return;
    }

    // Ping the root endpoint directly: "/"
    const targetUrl = url;
    const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)

    console.log(`⏰ Keep-Alive scheduled: Pinging ${targetUrl} every 10 minutes.`);

    setInterval(async () => {
        try {
            const response = await fetch(targetUrl);
            if (response.ok) {
                console.log(`[Keep-Alive] Ping successful at ${new Date().toLocaleTimeString()}`);
            } else {
                console.warn(`[Keep-Alive] Ping received status ${response.status}`);
            }
        } catch (error) {
            console.error(`[Keep-Alive] Ping error:`, error.message);
        }
    }, INTERVAL_MS);
};

module.exports = startKeepAlive;
