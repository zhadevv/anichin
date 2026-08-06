export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function attachRetryInterceptor(
    client: any,
    maxRetries: number,
    retryDelay: number
): void {
    client.interceptors.response.use(
        (response: any) => response,
        async (error: any) => {
            const config = error.config;
            if (!config) {
                return Promise.reject(error);
            }
            config.retryCount = config.retryCount || 0;

            if (config.retryCount < maxRetries) {
                config.retryCount++;
                await delay(retryDelay * config.retryCount);
                return client(config);
            }
            return Promise.reject(error);
        }
    );
}

export function attachRateLimitInterceptor(
    client: any,
    getRequestDelay: () => number,
    getLastRequestTime: () => number,
    setLastRequestTime: (time: number) => void,
    getUserAgent: () => string
): void {
    client.interceptors.request.use(async (config: any) => {
        const now = Date.now();
        const elapsed = now - getLastRequestTime();
        const requestDelay = getRequestDelay();
        if (elapsed < requestDelay) {
            await delay(requestDelay - elapsed);
        }
        setLastRequestTime(Date.now());
        config.headers['User-Agent'] = getUserAgent();
        return config;
    });
}
