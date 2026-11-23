
let keepAliveTimer = null;

const startKeepAlive = () => {
    const url = process.env.SERVER_URL;

    if (!url) {
        console.log('ℹ️ Keep-Alive: No SERVER_URL set.');
        return null;
    }

    const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    console.log(`⏰ Keep-Alive scheduled: Pinging ${url} every 10 minutes.`);

    // Prevent multiple timers
    if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
    }

    keepAliveTimer = setInterval(async () => {
        try {
            const response = await fetch(url);

            if (response.ok) {
                console.log(
                    `[Keep-Alive] Ping successful at ${new Date().toLocaleTimeString()}`
                );
            } else {
                console.warn(
                    `[Keep-Alive] Ping received status ${response.status}`
                );
            }
        } catch (error) {
            console.error('[Keep-Alive] Ping error:', error.message);
        }
    }, INTERVAL_MS);

    return keepAliveTimer;
};

const stopKeepAlive = () => {
    if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
        console.log('[Keep-Alive] Stopped.');
    }
};

module.exports = {
    startKeepAlive,
    stopKeepAlive
};
