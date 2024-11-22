import { loadTest, LoadTestOptions, LoadTestResult } from 'loadtest';

// Define the load test options with types
const options: LoadTestOptions = {
    url: 'http://localhost:3000/events/274/file-1613-007.ts', // Replace with your URL

    maxRequests: 1000, // Number of requests to send
    concurrency: 50, // Number of concurrent requests
    method: 'GET', // HTTP method
    statusCallback: (error: Error | null, result: { requestIndex: number; statusCode: number }, latency: { meanLatencyMs: number; maxLatencyMs: number; minLatencyMs: number }) => {
        if (error) {
            console.error('Request error:', error.message);
        } else {
            console.log(`Request #${result.requestIndex + 1} completed with status ${result.statusCode}`);
        }
        console.log('Current latency:', latency);
    },
};

// Starting the load test
console.log('Starting load test...');

// Run the load test with callback
loadTest(options, (error: Error | null, result: LoadTestResult) => {
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
