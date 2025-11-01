const requestLogger = (req, res, next) => {
    const start = process.hrtime();
    let responseBody = null;

    const originalSend = res.send;
    res.send = function (body) {
        responseBody = body;
        originalSend.apply(res, arguments);
    };

    const originalJson = res.json;
    res.json = function (body) {
        responseBody = body;
        originalJson.apply(res, arguments);
    };

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const responseTime = (diff[0] * 1e9 + diff[1]) / 1e6; // milliseconds

        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            requestBody: Object.keys(req.body).length > 0 ? req.body : undefined,
            status: res.statusCode,
            statusMessage: res.statusMessage,
            responseBody: (() => {
                try {
                    if (typeof responseBody === 'string') {
                        return JSON.parse(responseBody);
                    } else if (responseBody) {
                        return responseBody;
                    }
                } catch (e) {
                    return responseBody; // Return as-is if parsing fails (e.g., HTML)
                }
                return undefined;
            })(),
            responseTime: `${responseTime.toFixed(2)} ms`,
        };

        console.log(JSON.stringify(logData, null, 2));
    });

    next();
};

module.exports = requestLogger;
