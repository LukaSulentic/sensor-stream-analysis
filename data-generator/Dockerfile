FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY producer_kafka.py .

ENV KAFKA_BROKER_URL=kafka:9092
ENV TOPIC_NAME=senzorski-podaci

CMD ["python", "-u", "producer_kafka.py"]