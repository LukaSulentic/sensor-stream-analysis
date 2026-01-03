# Analiza strujanja senzorskih podataka (Kafka + ksqlDB + Angular)

Ovaj projekt implementira sustav za analizu podataka u stvarnom vremenu (Real-time Streaming Analytics). Simulira IoT okolinu gdje senzori šalju podatke o temperaturi i vlažnosti, sustav ih obrađuje te vizualizira na kontrolnoj ploči.

## Arhitektura sustava

Projekt se sastoji od mikroservisa orkestriranih putem Docker Compose-a:

1.  **Data Generator (Python):** Simulira 3 IoT senzora koji generiraju sinkronizirane podatke (temperatura, vlažnost) i šalju ih u Kafku.
2.  **Apache Kafka & Zookeeper:** Središnja sabirnica za prijenos poruka (Message Broker).
3.  **ksqlDB (Streaming Database):**
    *   Služi kao baza podataka za streamove.
    *   **Automatizacija:** Putem `ksqldb-cli` servisa, sustav automatski kreira streamove i materijalizirane poglede (Materialized Views) pri pokretanju.
    *   Izračunava 1-minutne prosjeke i prati zadnje stanje senzora u stvarnom vremenu.
4.  **Backend API (Python FastAPI):**
    *   Konzumira podatke iz Kafke asinkrono (`aiokafka`).
    *   Prosljeđuje podatke klijentima putem WebSocketa.
5.  **Frontend (Angular v21 + ngx-charts):**
    *   Prikazuje podatke na interaktivnom grafu u stvarnom vremenu.
    *   Koristi Nginx za serviranje optimizirane produkcijske verzije aplikacije.
6.  **AKHQ:** Grafičko sučelje za nadzor Kafka klastera i topica.

## Pokretanje projekta

Sustav je u potpunosti kontejneriziran.

**Preduvjeti:**
*   Docker & Docker Compose

**Upute:**

1.  Pozicionirajte se u korijenski direktorij projekta.
2.  Pokrenite sustav naredbom:
    ```bash
    docker-compose up -d --build
    ```
3.  Pričekajte da se svi servisi podignu (cca 1-2 minute). Skripta za inicijalizaciju baze javit će `✅ Baza podataka je uspješno kreirana!`.

## Pristup aplikacijama

*   **Glavna aplikacija (Dashboard):** [http://localhost:4200](http://localhost:4200)
*   **Backend API Status:** [http://localhost:8000](http://localhost:8000)
*   **AKHQ (Kafka GUI):** [http://localhost:8080](http://localhost:8080)

## Struktura baze podataka (ksqlDB)

Sustav automatski kreira sljedeće strukture:
*   `SENSOR_DATA_STREAM`: Ulazni tok sirovih podataka.
*   `CURRENT_SENSOR_VALUES`: Tablica stanja (zadnja vrijednost senzora).
*   `SENSOR_STATS_1MIN`: Agregirani podaci (prosjek, min, max) kroz vremenski prozor.

## 📝 Napomena

Frontend aplikacija koristi `Multi-stage` Docker build proces. U prvoj fazi se aplikacija automatski gradi (kompajlira) iz izvornog koda, dok se u drugoj fazi generirani artefakti serviraju putem optimiziranog Nginx servera. Ovo osigurava konzistentnost okoline i manju veličinu konačnog image-a.
