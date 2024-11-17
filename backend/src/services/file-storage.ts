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
                1, // max attempts.
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

    public async getFileAndSave(bucket: string, filePath: string): Promise<string> {
        try {
            // Get the temporary file path after downloading the file from S3
            const tempFilePath = await this.getFileByPath(bucket, filePath);

            const tempFolder = os.tmpdir();
            const outputFilePath = path.join(tempFolder, path.basename(filePath));

            // Move the downloaded file to the desired output path
            await this.moveFile(tempFilePath, outputFilePath);

            logger.info('File saved successfully', { outputFilePath });
            return outputFilePath;
        } catch (err) {
            logger.error('Error downloading or saving file from storage', { error: err.message });
            throw err;
        }
    }

    // Helper method to move the file from temp location to output location
    private async moveFile(sourcePath: string, destPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.rename(sourcePath, destPath, (err) => {
                if (err) {
                    logger.error('Error moving file', { sourcePath, destPath, error: err.message });
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async getFileByPath(bucket: string, filePath: string): Promise<string> {
        const tempFilePath = path.join(tmpdir(), 'temp-file');
        const getObjectParams = { Bucket: bucket, Key: filePath };

        try {
            const { Body } = await this.s3Client.send(new GetObjectCommand(getObjectParams));
            if (Body instanceof Readable) {
                await new Promise((resolve, reject) => {
                    const writeStream = fs.createWriteStream(tempFilePath);
                    Body.pipe(writeStream);
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });
                return tempFilePath;
            }
        } catch (err) {
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
            throw new Error(errorMsg);
        }

        const fileStream = fs.createReadStream(filePath);
        logger.info('Created read stream', { bucketName, objectName });

        const uploadParams: PutObjectCommandInput = {
            Bucket: bucketName,
            Key: objectName,
            Body: fileStream,
            CacheControl: 'no-store'
        };
        logger.info('Attempting file upload', { bucketName, objectName });

        try {
            const response = await this.s3Client.send(new PutObjectCommand(uploadParams));
            logger.info('File uploaded successfully', { bucketName, objectName, response });
        } catch (err) {
            logger.error('Error uploading file to S3', { bucketName, objectName, error: err.message });
            throw err;
        } finally {
            logger.info('File stream closed', { bucketName, objectName });

            fileStream.close();
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
}

export default FileStorage;
