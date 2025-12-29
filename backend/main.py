import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from aiokafka import AIOKafkaConsumer
import os

KAFKA_BROKER_URL = os.getenv('KAFKA_BROKER_URL', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'senzorski-podaci')

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Sensor Stream API is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket klijent spojen.")

    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BROKER_URL,
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='latest'
    )

    try:
        await consumer.start()
        print(f"Kafka Consumer spojen na {KAFKA_BROKER_URL}")
        
        async for msg in consumer:
            data = msg.value
            await websocket.send_json(data)
            
    except WebSocketDisconnect:
        print("WebSocket klijent odspojen.")
    except Exception as e:
        print(f"Greška: {e}")
    finally:
        await consumer.stop()
        print("Kafka Consumer zatvoren.")