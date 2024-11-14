import { S3Client, PutObjectCommand, GetObjectCommand, ListBucketsCommand, HeadObjectCommandInput, HeadObjectCommand, PutObjectCommandInput, GetObjectCommandOutput, DeleteObjectsCommand, ListObjectsV2CommandOutput, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import os from 'os';
import { Readable, PassThrough } from 'stream';
import path from 'path';


// ensure this has been run - minio server /tmp/data
class FileStorage {
    private static instance: S3Client | null = null;

    private constructor() { }

    public static getInstance(): S3Client {
        console.log(process.env.ACCESS_KEY_ID)
        if (!FileStorage.instance) {
            FileStorage.instance = new S3Client({
                retryMode: 'standard',
                region: "eu-west-2",

                credentials: {
                    accessKeyId: process.env.ACCESS_KEY_ID || 'minioadmin',
                    secretAccessKey: process.env.SECRET_ACCESS_KEY || 'minioadmin',
                },
                endpoint: process.env.STORAGE_ENDPOINT || "http://127.0.0.1:9000",
                // @ts-ignore
                sslEnabled: process.env.STORAGE_SSL_ON || false,

            });
        }
        return FileStorage.instance;
    }

    public static async getFileAndSave(bucket: string, filePath: string): Promise<string> {
        try {
            // Fetch the file stream from S3
            const fileStream = await FileStorage.getFileByPath(bucket, filePath);

            // Create a temp folder and file path to save the file
            const tempFolder = os.tmpdir();  // Get the system's temp directory
            const outputFilePath = path.join(tempFolder, path.basename(filePath));  // Save the file with the same name as in S3

            // Save the file stream to disk
            await FileStorage.saveStreamToFile(fileStream, outputFilePath);

            console.log(`File saved successfully at ${outputFilePath}`);

            // Return the file path where it was saved
            return outputFilePath;

        } catch (err) {
            console.error(`Error in downloading or saving file from storage: ${err}`);
            throw err;
        }
    }

    // Helper method to get a file from S3 as a readable stream
    public static async getFileByPath(bucket: string, filePath: string): Promise<Readable> {
        const s3Client = FileStorage.getInstance();
        const getObjectParams = {
            Bucket: bucket,
            Key: filePath,
        };

        try {
            const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));

            if (Body instanceof Readable) {
                return Body;
            } else if (Buffer.isBuffer(Body)) {
                const stream = new Readable();
                stream.push(Body);
                stream.push(null);  // End the stream
                return stream;
            } else {
                throw new Error('The object Body is neither a readable stream nor a Buffer.');
            }
        } catch (err) {
            console.error(`Error fetching ${filePath} from ${bucket}: ${err}`);
            throw err;
        }
    }

    // Helper method to save a readable stream to a file on disk
    public static async saveStreamToFile(inputStream: Readable, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(outputPath);

            inputStream.pipe(writeStream);

            writeStream.on('finish', () => {
                resolve();
            });

            writeStream.on('error', (err) => {
                reject(`Error writing stream to file: ${err}`);
            });
        });
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
