# AI Vehicle & Driver Assistant — Backend Architecture

This document describes the high-performance, containerized backend architecture implemented for the **AI Vehicle & Driver Assistant** application, utilizing a hybrid RAG (Retrieval-Augmented Generation) pipeline, Cloud SQL PostgreSQL, pgvector, Drizzle ORM, and the Gemini generative AI suite.

---

## 🚀 Architectural Overview

The backend is built as a unified, full-stack **Express + TypeScript + Vite** server. It leverages Cloud SQL PostgreSQL as its primary relational engine, supplemented with the `pgvector` extension for semantic search and Retrieval-Augmented Generation (RAG).

```
                  ┌──────────────────────────────────────────────┐
                  │                 Vite Client                  │
                  └──────────────────────┬───────────────────────┘
                                         │ JSON API / HTTP
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │               Express Server                 │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │        Drizzle ORM        │                   │     @google/genai SDK     │
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │ SQL Queries                                   │ API Requests
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Cloud SQL PostgreSQL   │                   │    Gemini 3.5 Flash /     │
   │   (with pgvector index)   │                   │ gemini-embedding-2-preview│
   └───────────────────────────┘                   └───────────────────────────┘
```

---

## 🗄️ Database Schema & Drizzle ORM

All data models are managed declaratively using **Drizzle ORM** for 100% type safety and zero-overhead queries.

### 1. Relational Tables
We have established a robust schema mapping the full fleet domain:
*   `drivers`: Stores contact info, commercial driving license (CDL) numbers, expiries, and assigned vehicles.
*   `vehicles`: Stores fleet metadata (models, current odometer, status), fastag wallet balances, and critical compliance expiries (Insurance, Fitness Certificate, Permit, Road Tax, PUC).
*   `vehicle_expenses`: Tracks all operational expenditures categorized by type (Fuel, Repairs, Tolls, Insurance, Fines, Taxes, etc.).
*   `fuel_logs`: Tracks diesel refills, gas station details, liters loaded, cost, and active driver associations.
*   `service_history`: Logs vehicle repair services, service providers, cost, and odometer readings.
*   `trip_history`: Records origin/destination journeys, distances, fuel consumptions, and operating driver.
*   `vehicle_documents`: Links secure storage URLs for scanned receipts, certificates, and license PDFs.
*   `notifications`: System-generated compliance warnings, alerts, and operational updates.

### 2. Custom pgvector Integration
To support semantic search and vector matching directly in the database, we defined a custom column type inside Drizzle representing the PostgreSQL `vector(768)` type:

```typescript
export const pgVector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(768)'; // 768 dimensions for gemini-embedding-2-preview
  },
  toDriver(value: number[]) {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: unknown) {
    if (typeof value === 'string') {
      return value.slice(1, -1).split(',').map(Number);
    }
    return value as number[];
  }
});
```

---

## 🔍 Hybrid RAG & Vector Search Pipeline

The AI assistant handles operational queries (such as calculating monthly diesel fills or checking insurance expirations) using a **hybrid retrieval model**:

### 1. Structured Database Context
Before contacting the LLM, the backend compiles the full relational database state into a compact, highly dense JSON structure. This ensures that quantitative questions receive 100% mathematically precise answers based on real-time database facts.

### 2. Unstructured Document & Guideline Context (pgvector RAG)
For conceptual, regulatory, or policy-related questions (e.g., *"When should engine oil be changed?"* or *"How much money spent on tyres?"*):
1.  The user's query is encoded into a high-dimensional dense vector using the **`gemini-embedding-2-preview`** model.
2.  An optimized **Cosine Similarity** query is executed against the `kb_embeddings` table:
    ```sql
    SELECT text, (embedding <=> ?::vector) AS distance 
    FROM kb_embeddings 
    ORDER BY distance ASC 
    LIMIT 3;
    ```
3.  The top matching knowledge base chunks are retrieved and appended to the LLM system prompt as verified facts.

---

## 🤖 Generative AI & Tool calling

### 1. Unified Chat Core (`gemini-3.5-flash`)
The server uses the modern `@google/genai` TypeScript SDK. The model is primed with a highly structured `systemInstruction` containing:
*   The current UTC date for precise relative time offsets (e.g., "July", "this month").
*   The structured real-time relational fleet state.
*   The retrieved semantic RAG chunks.

This allows the assistant to answer qualitative compliance questions and perform math/aggregations on operational tables on the fly.

### 2. Client State Synchronization
If the assistant recognizes an intent to record a new transaction in natural language (e.g., *"log fuel TN68AB1234 120 liters costing Rs 10800"*):
*   It generates a special database action block formatted as JSON:
    ```json
    [DATABASE_ACTION_START]
    {
      "action": "ADD_FUEL",
      "payload": {
        "plateNumber": "TN68AB1234",
        "liters": 120,
        "amount": 10800,
        "date": "2026-07-17",
        "driverName": "Rajesh Kumar"
      }
    }
    [DATABASE_ACTION_END]
    ```
*   The Express server intercepts this block, registers the transaction in the PostgreSQL database, and feeds the updated fleet state back to the client UI.

---

## 📂 Multi-Modal AI Document Scanning

When users upload PDFs, receipts, or photos of compliance cards (e.g., fuel receipts, insurance certificates):
1.  The file is converted to Base64 and sent to `gemini-3.5-flash` with a strict structural JSON schema.
2.  Gemini extracts the key ledger variables (Plate Number, Vendor, Amount, Invoice Number, Expiry Dates, fuel quantities, or service logs) and assigns an **extraction confidence score** (0.0 to 1.0).
3.  If the confidence score is **high (>= 0.8)**, the backend automatically inserts the transaction and documents into the corresponding tables in PostgreSQL immediately.
4.  If the confidence score is **low (< 0.8)**, the app flags the document, prompts the user with a review modal to confirm/correct the values, and then saves the confirmed details to PostgreSQL.

---

## 📦 Container Configuration & Provisioning

*   **Cloud SQL Region**: Provisioned in `asia-southeast1` for low latency.
*   **Production Build Pipeline**: Compiles the Express server entry point into a standalone CommonJS bundle (`dist/server.cjs`) using `esbuild`.
*   **Startup Commands**: Configured with automated database migration (`UpdateSchema`) and data seeding (`seedDatabase`) to ensure a zero-setup container environment.
