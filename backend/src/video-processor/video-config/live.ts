

export const getLiveConfig = (segmentLocation) => ([
    '-profile:v main',             // Use "main" instead of "high" for better decoding performance
    '-level 3.1',                  // Level 3.1 for compatibility
    '-start_number 0',             // Start numbering HLS segments from 0
    '-hls_time 10',                // HLS segment duration (10s per chunk)
    '-sc_threshold 0',             // Disable scene change detection
    '-r', '24',                    // Lower FPS to reduce CPU load

    `-hls_segment_filename ${segmentLocation}`, // HLS segment file naming
    '-hls_flags program_date_time+append_list+omit_endlist+independent_segments+discont_start',
    '-hls_wrap 10',                // Wrap playlist after 10 segments
    '-f hls',                      // Set output format to HLS
    '-g', '144',                    // Longer GOP (for 24 FPS, this is 6 seconds)

    // Adaptive bitrate for efficient compression
    '-crf', '24',                   // CRF-based encoding (lower = better quality)
    '-maxrate 2000k',               // Slightly lower bitrate for efficiency
    '-bufsize 4000k',               // Reduce buffer size to lower memory usage

    // Audio settings
    '-b:a 96k',                     // Reduce audio bitrate slightly to save bandwidth
    '-ar 44100',                     // Keep standard 44.1 kHz sample rate

    // Scaling to 720p with CPU-efficient filtering
    '-vf', 'scale=1280:720:sws_flags=fast_bilinear',

    // Encoding options
    '-preset veryfast',                // Saves CPU (use "slow" for even more savings)
    '-movflags +faststart'           // Optimize MP4 for streaming 
])