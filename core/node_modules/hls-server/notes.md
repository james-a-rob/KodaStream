Live Streaming
- Cycle .ts (media) and update .m3u8 (playlist)
- .ts are Transport Stream MPEG-2 video streams
- .m3u8 are text files (playlist files)

  The server MUST NOT change the Media Playlist file, except to:

      Append lines to it (Section 6.2.1).

      Remove Media Segment URIs from the Playlist in the order that they
      appear, along with any tags that apply only to those segments
      (Section 6.2.2).

      Increment the value of the EXT-X-MEDIA-SEQUENCE or EXT-X
      -DISCONTINUITY-SEQUENCE tags (Section 6.2.2).

      Add an EXT-X-ENDLIST tag to the Playlist (Section 6.2.1).

   The server MAY limit the availability of Media Segments by removing
   Media Segments from the Playlist file (Section 6.2.1).  If Media
   Segments are to be removed, the Playlist file MUST contain an EXT-X
   -MEDIA-SEQUENCE tag.  Its value MUST be incremented by 1 for every
   Media Segment that is removed from the Playlist file; it MUST NOT
   decrease or wrap.  Clients can malfunction if each Media Segment does
   not have a consistent, unique Media Sequence Number.

   Media Segments MUST be removed from the Playlist file in the order
   that they appear in the Playlist; otherwise, client playback can
   malfunction.

   The server MUST NOT remove a Media Segment from a Playlist file
   without an EXT-X-ENDLIST tag if that would produce a Playlist whose
   duration is less than three times the target duration.  Doing so can
   trigger playback stalls.

   When the server removes a Media Segment URI from the Playlist, the
   corresponding Media Segment MUST remain available to clients for a
   period of time equal to the duration of the segment plus the duration
   of the longest Playlist file distributed by the server containing
   that segment.  Removing a Media Segment earlier than that can
   interrupt in-progress playback.
   
- Client will automatically reload the playlist file (not my problem)


To take an existing rtmp stream, transcode to wrapping HLS (I guess runs continuously?)

ffmpeg -i rtmp://<host>:<port>/<stream> -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -flags -global_header -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 <pathToFolderYouWantTo>/<streamName>.m3u8