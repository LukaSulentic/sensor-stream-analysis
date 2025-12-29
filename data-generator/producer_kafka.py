import json
import time
import random
import datetime
import os
from kafka import KafkaProducer

KAFKA_BROKER_URL = os.getenv('KAFKA_BROKER_URL', 'localhost:9092')
TOPIC_NAME = os.getenv('TOPIC_NAME', 'senzorski-podaci')

sensor_state = {
    "sensor_1": {"temp": 20.0, "hum": 50.0},
    "sensor_2": {"temp": 22.0, "hum": 45.0},
    "sensor_3": {"temp": 18.0, "hum": 60.0}
}

def serialize_json(data):
    return json.dumps(data).encode('utf-8')

if __name__ == '__main__':
    print(f"Pokretanje Kafka producera na: {KAFKA_BROKER_URL}...")
    producer = None

    while producer is None:
        try:
            producer = KafkaProducer(
                bootstrap_servers=KAFKA_BROKER_URL,
                value_serializer=serialize_json
            )
            print(f"Producer spojen!")
        except Exception as e:
            print(f"Čekam Kafku... {e}")
            time.sleep(5)

    try:
        while True:
            timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            for sensor_id in sensor_state.keys():
                current = sensor_state[sensor_id]
                
                change_temp = random.uniform(-0.3, 0.3)
                new_temp = round(max(10, min(40, current["temp"] + change_temp)), 2)
                
                change_hum = random.uniform(-1, 1)
                new_hum = round(max(0, min(100, current["hum"] + change_hum)), 2)
                
                sensor_state[sensor_id] = {"temp": new_temp, "hum": new_hum}
                
                message = {
                    "sensor_id": sensor_id,
                    "temperatura": new_temp,
                    "vlaznost": new_hum,
                    "timestamp": timestamp,
                    "source": 'Kafka'
                }
                
                print(f"Slanje: {sensor_id} -> {new_temp} C")
                producer.send(TOPIC_NAME, key=sensor_id.encode('utf-8'), value=message)
            
            time.sleep(2)

    except Exception as e:
        print(f"Error: {e}")