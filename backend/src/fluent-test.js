import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// Define the directory and file
const directoryPath = '/Users/jamesrobertson/Code/KodaStream/backend/example-videos';
const fileName = 'short-test.mp4'; // Replace with your actual file name
const filePath = path.join(directoryPath, fileName);
const inputStream = fs.createReadStream(filePath);
const writableStream = fs.createWriteStream('/Users/jamesrobertson/Code/KodaStream/backend/file.mp4');


// Check if the file exists
if (fs.existsSync(filePath)) {
    // Create the FFmpeg command and specify the input file
    ffmpeg()
        .input(inputStream)
        .inputFormat('mp4')
        .output('file.mp4') // Specify output location

        .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
        })
        .on('end', () => {
            console.log('Processing finished.');
        })
        .on('error', (err, stdout, stderr) => {
            console.error('Error occurred:', err.message);
            console.error('FFmpeg stderr:', stderr);
        })
        .run();
} else {
    console.error('File not found:', filePath);
}
