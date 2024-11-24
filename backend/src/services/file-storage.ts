import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListBucketsCommand,
    HeadObjectCommandInput,
    HeadObjectCommand,
    PutObjectCommandInput,
    GetObjectCommandOutput,
    DeleteObjectsCommand,
    ListObjectsV2CommandOutput,
    ListObjectsV2Command,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { tmpdir } from 'os';

import fs from 'fs';
import os from 'os';
import { ConfiguredRetryStrategy } from "@smithy/util-retry";
import { Readable, PassThrough } from 'stream';
import path from 'path';
import Logger from '../services/logger';

const logger = Logger.getLogger();

class FileStorage {
    private s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            retryStrategy: new ConfiguredRetryStrategy(
                5, // max attempts.
                (attempt: number) => 100 + attempt * 1000 // backoff function.
            ),
            region: "eu-west-2",
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID || 'minioadmin',
                secretAccessKey: process.env.SECRET_ACCESS_KEY || 'minioadmin',
            },
            endpoint: process.env.STORAGE_ENDPOINT || "http://127.0.0.1:9000",
            //@ts-ignore
            sslEnabled: process.env.STORAGE_SSL_ON === 'true' // Explicit boolean cast from string env
        });
    }

    public async getFileAndSave(bucket: string, filePath: string): Promise<Buffer> {
        try {
            // Get the temporary file path after downloading the file from S3
            const file = await this.getFileByPath(bucket, filePath);


            logger.info('File saved successfully', { fileLength: file.length });
            return file;
        } catch (err) {
            logger.error('Error downloading or saving file from storage', { error: err.message });
            throw err;
        }
    }

    public async getFileByPath(bucket: string, filePath: string): Promise<Buffer> {
        const getObjectParams = { Bucket: bucket, Key: filePath };
        try {
            const { Body } = await this.s3Client.send(new GetObjectCommand(getObjectParams));

            if (Body instanceof Readable) {
                // Instead of using async chunking, we use the .on() method to read synchronously
                const chunks: Buffer[] = [];
                Body.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                // Wait for the end of the stream
                await new Promise<void>((resolve, reject) => {
                    Body.on('end', () => resolve()); // Resolve when the stream ends
                    Body.on('error', (err) => reject(err)); // Reject on stream error
                });

                // Once the stream ends, concatenate the chunks into a single Buffer
                const fileContentBuffer = Buffer.concat(chunks);

                logger.info('File fetched successfully from S3', { bucket, filePath });
                return fileContentBuffer;
            } else {
                throw new Error('Unexpected body type received from S3');
            }
        } catch (err: any) {
            logger.error('Error fetching file from S3', { bucket, filePath, error: err.message });
            throw err;
        }
    }

    public async saveStreamToFile(inputStream: Readable, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(outputPath);

            inputStream.pipe(writeStream);

            writeStream.on('finish', () => {
                logger.info('Stream saved to file', { outputPath });
                resolve();
            });

            writeStream.on('error', (err) => {
                logger.error('Error writing stream to file', { outputPath, error: err.message });
                reject(err);
            });
        });
    }

    public async deleteFile(bucketName: string, objectName: string): Promise<void> {
        logger.info('Attempting to delete file from storage', { bucketName, objectName });

        try {
            await this.s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectName }));
            logger.info('File deleted successfully', { bucketName, objectName });
        } catch (err) {
            logger.error('Error deleting file from S3', { bucketName, objectName, error: err.message });
            throw err;
        }
    }

    public async uploadFile(bucketName: string, filePath: string, objectName: string): Promise<void> {
        logger.info('Preparing to upload file', { bucketName, objectName });

        if (!fs.existsSync(filePath)) {
            const errorMsg = `File not found at path: ${filePath}`;
            logger.error(errorMsg);
            throw new Error(errorMsg); // Early exit if file doesn't exist
        }

        let fileContent: Buffer | null = null;

        try {
            // Read the file content into memory
            fileContent = fs.readFileSync(filePath);
            logger.info('File read into memory', { bucketName, objectName });

            const uploadParams: PutObjectCommandInput = {
                Bucket: bucketName,
                Key: objectName,
                Body: fileContent,
                CacheControl: 'no-store',
            };
            logger.info('Attempting file upload', { bucketName, objectName });

            try {
                // Upload the file to S3
                const response = await this.s3Client.send(new PutObjectCommand(uploadParams));
                logger.info('File uploaded successfully', { bucketName, objectName, response });
            } catch (err: any) {
                logger.error('Error uploading file to S3', { bucketName, objectName, error: err.message });
                throw err; // Rethrow the error to propagate it
            }
        } catch (err: any) {
            // Catch any errors during file read or upload
            logger.error('Error during file processing', { bucketName, objectName, error: err.message });
            throw err; // Rethrow the error to allow higher-level handling
        } finally {
            // Clean-up logic can go here if needed (e.g., temporary files)
            if (fileContent) {
                logger.info('File content processed successfully', { bucketName, objectName });
            }
        }
    }

    public createWriteStream(bucket: string, objectKey: string): NodeJS.WritableStream {
        const passThroughStream = new PassThrough();

        const uploadParams = { Bucket: bucket, Key: objectKey, Body: passThroughStream };

        this.s3Client.send(new PutObjectCommand(uploadParams))
            .then(() => {
                logger.info('File uploaded successfully via stream', { bucket, objectKey });
            })
            .catch((err) => {
                logger.error('Error uploading file via stream to S3', { bucket, objectKey, error: err.message });
            });

        return passThroughStream;
    }

    public async listBuckets(): Promise<string[]> {
        try {
            const { Buckets } = await this.s3Client.send(new ListBucketsCommand({}));
            if (Buckets) {
                const bucketNames = Buckets.map((bucket) => bucket.Name!);
                logger.info('Buckets listed successfully', { bucketNames });
                return bucketNames;
            }
            return [];
        } catch (err) {
            logger.error('Error listing S3 buckets', { error: err.message });
            throw err;
        }
    }

    public async deleteAllFilesInDirectory(bucket: string, prefix: string): Promise<void> {
        const listParams = { Bucket: bucket, Prefix: prefix };

        try {
            const data: ListObjectsV2CommandOutput = await this.s3Client.send(new ListObjectsV2Command(listParams));

            if (data.Contents && data.Contents.length > 0) {
                const objectsToDelete = data.Contents.map((obj) => ({ Key: obj.Key }));

                const deleteParams = {
                    Bucket: bucket,
                    Delete: { Objects: objectsToDelete },
                };

                await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
                logger.info('All files in the directory deleted successfully', { bucket, prefix });
            } else {
                logger.info('No files found in the directory', { bucket, prefix });
            }
        } catch (err) {
            logger.error('Error deleting files in directory', { bucket, prefix, error: err.message });
            throw err;
        }
    }

    public async listAllFilesInBucket(bucket: string): Promise<{ id: string, location: string }[]> {
        logger.info('Fetching all files from bucket', { bucket });

        const fileList: { id: string, location: string }[] = [];

        try {
            let continuationToken: string | undefined = undefined;
            do {
                const listParams = {
                    Bucket: bucket,
                    ContinuationToken: continuationToken,
                };

                const data: ListObjectsV2CommandOutput = await this.s3Client.send(new ListObjectsV2Command(listParams));
                if (data.Contents) {
                    data.Contents.forEach((file) => {
                        if (file.Key) {
                            fileList.push({
                                id: file.Key,
                                location: file.Key,
                            });
                        }
                    });
                }

                continuationToken = data.NextContinuationToken;
            } while (continuationToken);

            logger.info('Files listed successfully', { bucket, fileCount: fileList.length });
            return fileList;
        } catch (err) {
            logger.error('Error listing files in bucket', { bucket, error: err.message });
            throw err;
        }
    }
}

export default FileStorage;
