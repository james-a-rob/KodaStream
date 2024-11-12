import { S3Client, PutObjectCommand, GetObjectCommand, ListBucketsCommand, PutObjectCommandInput, GetObjectCommandOutput, DeleteObjectsCommand, ListObjectsV2CommandOutput, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';

import { Readable, PassThrough } from 'stream'; // Import the Node.js Readable stream

class FileStorage {
    private static instance: S3Client | null = null;

    private constructor() { }

    public static getInstance(): S3Client {
        if (!FileStorage.instance) {
            FileStorage.instance = new S3Client({
                // region: 'eu-west-2',
                // credentials: {
                //     accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIA2WIG7OB4NKCH4W6S',
                //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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',
                // },
                // endpoint: process.env.AWS_S3_ENDPOINT || 'https://s3.eu-west-2.amazonaws.com',

                // @ts-ignore
                sslEnabled: false,
                region: "eu-west-1",

                credentials: {
                    accessKeyId: "minioadmin",
                    secretAccessKey: "minioadmin",
                },
                endpoint: "http://127.0.0.1:9000",
            });
        }
        return FileStorage.instance;
    }

    // Updated method to return a Readable stream from S3
    public static async getFileByPath(bucket: string, filePath: string): Promise<Readable> {
        const s3Client = FileStorage.getInstance();
        const getObjectParams = {
            Bucket: bucket,
            Key: filePath,
        };

        try {
            const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
            if (Body instanceof Readable) {
                return Body; // Return the Body as a Readable stream
            } else {
                throw new Error('The object Body is not a readable stream.');
            }
        } catch (err) {
            console.error(`Error fetching file from S3: ${err}`);
            throw err;
        }
    }

    // Method to upload a file to an S3 bucket
    public static async uploadFile(bucketName: string, filePath: string, objectName: string): Promise<void> {
        const s3Client = FileStorage.getInstance();

        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found at path: ${filePath}`);
        }

        const fileStream = fs.createReadStream(filePath);
        const uploadParams: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: objectName,
            Body: fileStream,
        };

        try {
            await s3Client.send(new PutObjectCommand(uploadParams));
            console.log(`File uploaded successfully to ${bucketName}/${objectName}`);
        } catch (err) {
            console.error('Error uploading file:', err);
            throw err;
        }
    }

    // Method to create a writable stream for S3 (e.g., for uploading a file)
    public static createWriteStream(bucket: string, objectKey: string): NodeJS.WritableStream {
        const s3Client = FileStorage.getInstance();
        const passThroughStream = new PassThrough();

        const uploadParams = {
            Bucket: bucket,
            Key: objectKey,
            Body: passThroughStream,
        };

        s3Client.send(new PutObjectCommand(uploadParams))
            .then(() => {
                console.log(`File uploaded successfully to ${bucket}/${objectKey}`);
            })
            .catch((err) => {
                console.error('Error uploading file to S3:', err);
            });

        return passThroughStream;
    }

    // Method to list all S3 buckets
    public static async listBuckets(): Promise<string[]> {
        const s3Client = FileStorage.getInstance();

        try {
            const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
            if (Buckets) {
                return Buckets.map((bucket) => bucket.Name!);
            }
            return [];
        } catch (err) {
            console.error('Error listing buckets:', err);
            throw err;
        }
    }

    // New method to delete all files in a specific directory (prefix) in an S3 bucket
    public static async deleteAllFilesInDirectory(bucket: string, prefix: string): Promise<void> {
        const s3Client = FileStorage.getInstance();

        // List all objects with the given prefix (directory)
        const listParams = {
            Bucket: bucket,
            Prefix: prefix, // directory prefix
        };

        try {
            const data: ListObjectsV2CommandOutput = await s3Client.send(new ListObjectsV2Command(listParams));

            if (data.Contents && data.Contents.length > 0) {
                // Prepare a list of object keys to delete
                const objectsToDelete = data.Contents.map((obj) => ({ Key: obj.Key }));

                // Delete the objects in the directory
                const deleteParams = {
                    Bucket: bucket,
                    Delete: {
                        Objects: objectsToDelete,
                    },
                };

                await s3Client.send(new DeleteObjectsCommand(deleteParams));
                console.log(`All files in the directory ${prefix} have been deleted.`);
            } else {
                console.log(`No files found in directory ${prefix}.`);
            }
        } catch (err) {
            console.error(`Error deleting files in directory ${prefix}:`, err);
            throw err;
        }
    }
}

export default FileStorage;
