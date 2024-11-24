export const getVodConfig = (segmentLocation) => ([
    '-profile:v baseline',         // H.264 baseline profile for compatibility
    '-level 3.0',                  // H.264 Level for compatibility
    '-start_number 0',             // Number segments from 0
    '-hls_time 10',                // HLS segment duration of 10 seconds
    '-sc_threshold 0',             // Disable scene change detection
    '-g 50',                       // GOP size (double the frame rate, e.g., 25 fps * 2)
    '-b:v 1500k',                  // Target video bitrate
    '-maxrate 1500k',              // Set max video bitrate
    '-bufsize 3000k',              // Buffer size for rate control
    '-b:a 128k',                   // Audio bitrate
    '-ar 44100',                   // Audio sample rate
    `-hls_segment_filename ${segmentLocation}`, // Naming for segment files
    '-hls_flags independent_segments+append_list', // Independent segments with appending
    '-hls_list_size 0',            // Include all segments in the playlist
    '-f hls',                      // Format set to HLS
    '-preset veryfast',            // Faster encoding
    '-movflags +faststart',        // Optimize MP4 for streaming
    '-vf scale=-2:360'
])