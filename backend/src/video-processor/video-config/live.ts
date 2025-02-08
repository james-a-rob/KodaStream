

export const getLiveConfig = (segmentLocation) => ([
    '-profile:v high',             // H.264 high profile for better quality
    '-level 4.0',                  // Level 4.0 for better quality
    '-start_number 0',             // Start numbering HLS segments from 0
    '-hls_time 10',                // Set HLS segment duration to 10 seconds
    '-sc_threshold 0',             // Disable scene change detection for consistent GOPs
    '-r', '30',                    // Normalize FPS to 30 (or another desired frame rate for smoother playback)

    `-hls_segment_filename ${segmentLocation}`, // HLS segment file naming
    '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
    '-hls_wrap 10',                // Wrap playlist after 10 segments
    '-f hls',                      // Set output format to HLS
    '-g 60',                       // Set GOP size (double the framerate, e.g., 30fps x 2)

    // Video bitrate adjustments for 1080p
    '-b:v 3000k',                  // Set video bitrate to 3000 kbps (you can adjust as needed for quality/size)
    '-maxrate 3000k',              // Set maximum video bitrate to 3000 kbps
    '-bufsize 6000k',              // Set buffer size to 6000 kbps

    // Audio settings
    '-b:a 128k',                   // Audio bitrate of 128 kbps
    '-ar 44100',                   // Audio sample rate of 44.1 kHz

    // Scaling to 1080p (1920x1080 resolution)
    '-vf scale=1920:1080',         // Scale video to 1080p resolution

    // Encoding options
    '-preset veryfast',            // Fast encoding preset
    '-movflags +faststart'         // Optimize MP4 for streaming 
])