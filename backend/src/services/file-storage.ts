import { Client, PutObjectResult } from 'minio';
import fs from 'fs';

console.log('yoyoyyo')
class MinioClient {
    private static instance: Client | null = null;

    private constructor() { }

    public static getInstance(): Client {
        if (!MinioClient.instance) {
            MinioClient.instance = new Client({
                endPoint: process.env.MINIO_ENDPOINT || 'localhost',
                port: parseInt(process.env.MINIO_PORT || '9000', 10),
                useSSL: false,  // Set this to false if MinIO is running without SSL
                accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
                secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
            });
        }
        return MinioClient.instance;
    }

    // Method to get file by path
    public static getFileByPath(bucket: string, filePath: string): Promise<fs.ReadStream> {
        const minioClient = MinioClient.getInstance();
        return new Promise((resolve, reject) => {
            // Get the file from MinIO as a stream
            minioClient.getObject(bucket, filePath, (err, dataStream) => {
                if (err) {
                    return reject(`Error fetching file from MinIO: ${err}`);
                }
                resolve(dataStream);
            });
        });
    }

    // Method to upload a file to a bucket
    public static async uploadFile(bucketName: string, filePath: string, objectName: string): Promise<PutObjectResult> {
        try {
            const minioClient = MinioClient.getInstance();

            // Check if the file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found at path: ${filePath}`);
            }

            // Upload file to MinIO bucket
            const result = await minioClient.fPutObject(bucketName, objectName, filePath);
            console.log(`File uploaded successfully to ${bucketName}/${objectName}`);
            return result;
        } catch (err) {
            console.error('Error uploading file:', err);
            throw err;
        }
    }

    public static async listBuckets(): Promise<string[]> {
        try {
            const minioClient = MinioClient.getInstance();
            const buckets = await minioClient.listBuckets();
            console.log('buckets', buckets);
            return buckets.map((bucket) => bucket.name);
        } catch (err) {
            console.error('Error listing buckets:', err);
            throw err;
        }
    }

}


export default MinioClient;
