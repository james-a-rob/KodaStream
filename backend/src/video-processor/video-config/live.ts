

export const getLiveConfig = (segmentLocation) => ([
    '-profile:v baseline',         // H.264 baseline profile for compatibility
    '-level 3.0',                  // Level 3.0 for broader compatibility
    '-start_number 0',             // Start numbering HLS segments from 0
    '-hls_time 10',                // Set HLS segment duration to 10 seconds
    '-sc_threshold 0',             // Disable scene change detection for consistent GOPs
    '-r', '25',                    // Normalize FPS to 25 (or another desired frame rate)

    `-hls_segment_filename ${segmentLocation}`, // HLS segment file naming
    '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
    '-hls_wrap 10',                // Wrap playlist after 10 segments
    '-f hls',                      // Set output format to HLS
    '-g 50',                       // Set GOP size (double the framerate, e.g., 25fps x 2)
    '-b:v 1500k',                  // Increase video bitrate to 1500 kbps (previously 800 kbps)
    '-maxrate 1500k',              // Set maximum bitrate to 1500 kbps (previously 800 kbps)
    '-bufsize 3000k',              // Set buffer size to 3000 kbps (previously 1600 kbps)
    '-b:a 128k',                   // Increase audio bitrate to 128 kbps (previously 96 kbps)
    '-ar 44100',                   // Audio sample rate of 44.1 kHz
    '-vf scale=-2:360',            // Scale video to 360p height (width auto-calculated)
    '-preset veryfast',            // Fast encoding preset
    '-movflags +faststart'         // Optimize MP4 for streaming 
])