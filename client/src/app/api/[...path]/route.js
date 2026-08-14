export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import path from 'path';
import { Readable } from 'stream';

let expressApp = null;

function getExpressApp() {
    if (expressApp) return expressApp;
    try {
        const rootServer = path.resolve(process.cwd(), '../server.js');
        expressApp = require(rootServer);
    } catch (e) {
        try {
            expressApp = require('../../../../../server.js');
        } catch (err) {
            expressApp = require(path.resolve(process.cwd(), 'server.js'));
        }
    }
    return expressApp;
}

async function handleRequest(request) {
    return new Promise(async (resolve) => {
        try {
            const app = getExpressApp();
            const url = new URL(request.url);
            
            let bodyBuffer = Buffer.from([]);
            if (request.method !== 'GET' && request.method !== 'HEAD') {
                try {
                    const arrayBuffer = await request.arrayBuffer();
                    bodyBuffer = Buffer.from(arrayBuffer);
                } catch (e) {}
            }

            const reqStream = new Readable({
                read() {
                    this.push(bodyBuffer.length > 0 ? bodyBuffer : null);
                    this.push(null);
                }
            });

            const reqHeaders = {};
            request.headers.forEach((value, key) => {
                reqHeaders[key.toLowerCase()] = value;
            });

            const req = Object.assign(reqStream, {
                url: url.pathname + url.search,
                method: request.method,
                headers: reqHeaders,
                rawHeaders: [],
                socket: { remoteAddress: '127.0.0.1' },
                connection: { remoteAddress: '127.0.0.1' },
                httpVersion: '1.1',
                httpVersionMajor: 1,
                httpVersionMinor: 1
            });

            let statusCode = 200;
            const responseHeaders = {};
            const chunks = [];

            const res = {
                statusCode: 200,
                status(code) {
                    statusCode = code;
                    return this;
                },
                setHeader(name, value) {
                    responseHeaders[name.toLowerCase()] = value;
                    return this;
                },
                getHeader(name) {
                    return responseHeaders[name.toLowerCase()];
                },
                writeHead(code, headers = {}) {
                    statusCode = code;
                    for (const [k, v] of Object.entries(headers)) {
                        responseHeaders[k.toLowerCase()] = v;
                    }
                    return this;
                },
                write(chunk) {
                    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                    return true;
                },
                end(chunk) {
                    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                    const body = Buffer.concat(chunks);
                    
                    const nextResponse = new Response(body, {
                        status: statusCode,
                        headers: responseHeaders
                    });
                    resolve(nextResponse);
                },
                on() { return this; },
                once() { return this; },
                emit() { return true; },
                removeListener() { return this; }
            };

            app(req, res);
        } catch (err) {
            console.error("Next.js App Router API Bridge Error:", err);
            resolve(new Response(JSON.stringify({ success: false, message: err.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }));
        }
    });
}

export async function GET(request) { return handleRequest(request); }
export async function POST(request) { return handleRequest(request); }
export async function PUT(request) { return handleRequest(request); }
export async function DELETE(request) { return handleRequest(request); }
export async function PATCH(request) { return handleRequest(request); }
export async function OPTIONS(request) { return handleRequest(request); }
