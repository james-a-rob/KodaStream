import { loadTest } from 'loadtest';

const options = {
    // url: 'https://squid-app-e84i3.ondigitalocean.app/content/events/65/output.m3u8',
    url: 'https://squid-app-e84i3.ondigitalocean.app/content/events/65/file-789-000.ts',

    maxRequests: 100, // Number of requests to send
    concurrency: 20, // Number of concurrent requests
    method: 'GET', // HTTP method
    statusCallback: (error, result, latency) => {
        if (error) {
            console.error('Request error:', error.message);
        } else {
            console.log(`Request #${result.requestIndex + 1} completed with status ${result.statusCode}`);
        }
        console.log('Current latency:', latency);
    },
};

console.log('Starting load test...');
loadTest(options, (error, result) => {
    if (error) {
        console.error('Error during load test:', error.message);
    } else {
        console.log('Load test completed');
        console.log('Total requests:', result.totalRequests);
        console.log('Total failures:', result.totalErrors);
        console.log('Mean latency (ms):', result.meanLatencyMs);
        console.log('Requests per second:', result.rps);
    }
});