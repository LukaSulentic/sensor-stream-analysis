CREATE STREAM sensor_data_stream (
    sensor_id VARCHAR,
    temperatura DOUBLE,
    vlaznost DOUBLE,
    timestamp VARCHAR,
    source VARCHAR
) WITH (
    KAFKA_TOPIC = 'senzorski-podaci',
    VALUE_FORMAT = 'JSON'
);

CREATE TABLE current_sensor_values AS
    SELECT
        sensor_id,
        LATEST_BY_OFFSET(temperatura) AS last_temp,
        LATEST_BY_OFFSET(vlaznost) AS last_humidity,
        LATEST_BY_OFFSET(timestamp) AS last_seen
    FROM sensor_data_stream
    GROUP BY sensor_id
    EMIT CHANGES;

CREATE TABLE sensor_stats_1min AS
    SELECT
        sensor_id,
        AVG(temperatura) AS avg_temp,
        MAX(temperatura) AS max_temp,
        COUNT(*) AS reading_count
    FROM sensor_data_stream
    WINDOW TUMBLING (SIZE 1 MINUTE)
    GROUP BY sensor_id
    EMIT CHANGES;