let keepAliveTimer = null;

export const startKeepAlive = () => {
    const url = process.env.SERVER_URL;

    if (!url) {
        console.log('ℹ️  Keep-Alive: No SERVER_URL set.');
        return null;
    }

    // Ping the target URL
    const targetUrl = url;
    const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (600,000 ms)

    console.log(`⏰ Keep-Alive scheduled: Pinging ${targetUrl} every 10 minutes.`);

    keepAliveTimer = setInterval(async () => {
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

    return keepAliveTimer;
};

export const stopKeepAlive = () => {
    if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
        console.log('[Keep-Alive] Stopped.');
    }
};

export default startKeepAlive;
