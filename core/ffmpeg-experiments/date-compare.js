console.log("compare dates");

const startOfVid1Segmentation = "2023-05-10T17:13:21.804Z";
const startOfVid2Segmentation = "2023-05-10T17:13:50.071Z";

const segment1ProgramDate = "2023-05-10T18:13:21.980+0100";
const segment2ProgramDate = "2023-05-10T18:13:27.980+0100";



const segmentProgramDates = [5, 10, 15, 20];
const videoStartMarker = [4, 14];

console.log(new Date(segment1ProgramDate) > new Date(startOfVid1Segmentation))
console.log(new Date(segment2ProgramDate) > new Date(startOfVid1Segmentation))
console.log(new Date(segment2ProgramDate) > new Date(startOfVid2Segmentation))


console.log(new Date(segment1ProgramDate))
console.log(new Date(startOfVid1Segmentation))