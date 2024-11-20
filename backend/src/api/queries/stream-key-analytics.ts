export const averageSessionLengthQuery = `
WITH session_durations AS (
    SELECT
        log."sessionId",
        MIN(log."datetime")::timestamp AS first_view,  -- Cast to timestamp
        MAX(log."datetime")::timestamp AS last_view    -- Cast to timestamp
    FROM
        "log" log
    WHERE
        log."type" = 'view'  -- Filter by the 'view' event type
        AND log."eventId" = $1  -- Filter by the dynamic eventId
        AND log."sessionId" != 'testing-session-id'
    GROUP BY
        log."sessionId"  -- Group by sessionId to get each session's first and last view time
)

SELECT
    COUNT(DISTINCT session_durations."sessionId") AS total_visitors,
    ROUND(AVG(EXTRACT(EPOCH FROM (last_view - first_view)))) AS avg_view_length_seconds  -- Round to nearest second
FROM
    session_durations;
`;
