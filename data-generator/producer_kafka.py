import json
import time
import random
import datetime
import os
from kafka import KafkaProducer

#Konfiguracija producer-a
KAFKA_BROKER_URL = os.getenv('KAFKA_BROKER_URL', 'localhost:9092')
TOPIC_NAME = os.getenv('TOPIC_NAME', 'senzorski-podaci')

def generate_sensor_data():
    """Generiranje podataka"""
    sensor_id = f"sensor_{random.randint(1, 5)}"
    temperatorura = round(random.uniform(15, 30), 2)
    vlaznost = round(random.uniform(30, 70), 2)
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    return {
        "sensor_id": sensor_id,
        "temperatura": temperatorura,
        "vlaznost": vlaznost,
        "timestamp": timestamp,
        "source": 'Kafka'
    }

def serialize_json(data):
    """Serijalizacija podataka u JSON format"""
    return json.dumps(data).encode('utf-8')

if __name__ == '__main__':
    print(f"Pokretanje Kafka produceza na: {KAFKA_BROKER_URL}...")
    producer = None
    while producer is None:
        try:
            producer= KafkaProducer(
                bootstrap_servers=KAFKA_BROKER_URL,
                value_serializer=serialize_json
            )
            print(f"Producer spojen na {KAFKA_BROKER_URL}, Slanje podataka na temu '{TOPIC_NAME}'...")
        except Exception as e:
            print(f"Čekam Kafku ({KAFKA_BROKER_URL})... Greška: {e}")
            time.sleep(5)

        try:
            while True:
                sensor_data = generate_sensor_data()
                print(f"Generirani podaci: {sensor_data}")

                producer.send(TOPIC_NAME, key=sensor_data['sensor_id'].encode('utf-8'), value=sensor_data)
                # producer.flush() # za pozvati podatke

                time.sleep(2)

        except Exception as e:
            print(f"Greška u Kafka produceru: {e}")
        finally:
            if producer:
                print("Zatvaranje Kafka Producera...")
                producer.flush()
                producer.close()
                print("Producer zatvoren.")
