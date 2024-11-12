// Import required AWS SDK clients and commands
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

// Set your AWS region, access key, and secret key (use environment variables or IAM role in production)
const REGION = 'eu-west-2'; // Example: us-west-2 or your region
const BUCKET_NAME = 'kodastream-streams';
const ACCESS_KEY = 'AKIA2WIG7OB4NKCH4W6S';  // Ensure to use environment variables or a safe method in production
const SECRET_KEY = 'Zyl4kdgUwPibpp4pDZS1LIJlWyL7WFIKncbFREhL';  // Ensure to use environment variables or a safe method in production

// Initialize the S3 client
const s3 = new S3Client({
    // region: REGION,
    // credentials: {
    //     accessKeyId: ACCESS_KEY,
    //     secretAccessKey: SECRET_KEY,
    // },
    sslEnabled: false,
    // s3ForcePathStyle: true,
    region: "eu-west-1",

    credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
    },
    endpoint: "http://127.0.0.1:9000",
});

// Define the file you want to upload and its destination key
const filePath = './file.txt'; // Local file to upload
const fileStream = fs.createReadStream(filePath);
const key = 'uploads/file.txt'; // S3 destination key (filename in the bucket)

// Prepare parameters for the S3 upload
const uploadParams = {
    Bucket: BUCKET_NAME, // The name of the S3 bucket
    Key: key, // The key (path) in the bucket where the file will be stored
    Body: fileStream, // The content of the file
};

// Upload the file to S3
async function uploadFile() {
    try {
        const data = await s3.send(new PutObjectCommand(uploadParams));
        console.log('File uploaded successfully:', data);
    } catch (err) {
        console.error('Error uploading file:', err);
    }
}

// Execute the upload function
uploadFile();