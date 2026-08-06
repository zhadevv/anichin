import axios from 'axios';
import { ScraperConfig } from '../types/common';
import {
    DEFAULT_BASE_URL,
    DEFAULT_TIMEOUT,
    DEFAULT_MAX_RETRIES,
    DEFAULT_RETRY_DELAY,
    DEFAULT_REQUEST_DELAY,
    DEFAULT_USER_AGENTS,
} from '../constants/config';
import { buildDefaultHeaders, getRandomUserAgent } from '../network/headers';
import { attachRetryInterceptor, attachRateLimitInterceptor } from '../network/retry';

const isBrowser = typeof window !== 'undefined';
let HttpsProxyAgent: any, SocksProxyAgent: any;

if (!isBrowser) {
    try {
        HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
        SocksProxyAgent = require('socks-proxy-agent').SocksProxyAgent;
    } catch (e) {}
}

export interface BuiltClient {
    client: any;
    baseUrl: string;
}

export function createRequestClient(config: ScraperConfig = {}): BuiltClient {
    const baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    const maxRetries = config.maxRetries || DEFAULT_MAX_RETRIES;
    const retryDelay = config.retryDelay || DEFAULT_RETRY_DELAY;
    const requestDelay = config.requestDelay || DEFAULT_REQUEST_DELAY;

    let lastRequestTime = 0;

    const headers = buildDefaultHeaders(baseUrl, config.userAgent || DEFAULT_USER_AGENTS[0]);

    const axiosConfig: any = {
        baseURL: baseUrl,
        timeout: config.timeout || DEFAULT_TIMEOUT,
        headers,
        validateStatus: (status: number) => status < 500,
    };

    if (config.proxy) {
        const { host, port, protocol = 'http', auth } = config.proxy;
        const proxyUrl = auth
            ? `${protocol}://${auth.username}:${auth.password}@${host}:${port}`
            : `${protocol}://${host}:${port}`;

        if (protocol.includes('socks')) {
            axiosConfig.httpsAgent = new SocksProxyAgent(proxyUrl);
            axiosConfig.httpAgent = new SocksProxyAgent(proxyUrl);
        } else {
            axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
            axiosConfig.httpAgent = new HttpsProxyAgent(proxyUrl);
        }
    }

    const client = axios.create(axiosConfig);

    attachRateLimitInterceptor(
        client,
        () => requestDelay,
        () => lastRequestTime,
        (time: number) => {
            lastRequestTime = time;
        },
        () => getRandomUserAgent()
    );

    attachRetryInterceptor(client, maxRetries, retryDelay);

    return { client, baseUrl };
}
