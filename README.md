# NestJS Microservices + API Gateway + RabbitMQ (RMQ) Demo

This repository is a practical reference project that demonstrates a **microservices architecture** built using **NestJS** with:

- **API Gateway** (HTTP REST entry point)
- **RabbitMQ** (RMQ transport for inter-service communication)
- **PostgreSQL** (multiple databases for service-owned data)
- **MongoDB** (logging + rider coordinates)
- **Async processing** example using an **Outbox-style** email workflow

> Goal: Show how to structure, run, and test a gateway + RMQ + multiple NestJS services setup (RPC + events), including a realistic order → event → email flow.

---

## Why this architecture exists

This architecture is useful when you want:

- **Separation of concerns**: each service owns its domain logic and database.
- **Independent scaling**: scale orders without scaling auth/logging.
- **Fault isolation**: email/logging failures shouldn’t break core flows.
- **Async workloads**: notifications, analytics, emails, audit logs, etc.
- **Clear boundaries**: teams can work on separate services.

### When NOT to use it
This approach is usually a bad fit if:
- Your app is small (monolith is simpler and cheaper).
- You need strict cross-service ACID transactions everywhere.
- You don’t have monitoring/logging/tracing (debugging becomes painful).

---

## What’s included (services)

### 1) API Gateway (HTTP)
**Path:** `apps/api-gateway`  
**Role:** Public REST API. Calls microservices via RMQ (RabbitMQ).  
**Port:** `3000`

Typical flows:
- Client → API Gateway → Auth/Rider/Order/Logging services (RMQ)

---

### 2) Authentication Service (Prisma + Postgres)
**Path:** `apps/authentication`  
**Queue:** `auth_queue`  
**DB:** `auth_db` (Postgres)

Responsibilities:
- Register (hash password)
- Login (JWT)
- Token validation
- Creates rider profile by calling Rider service

---

### 3) Rider Service (TypeORM + Postgres)
**Path:** `apps/rider`  
**Queue:** `rider_queue`  
**DB:** `riders_db` (Postgres)

Responsibilities:
- Create rider
- Get rider by id

---

### 4) Logging / Coordinates Service (Mongoose + MongoDB)
**Path:** `apps/logging`  
**Queue:** `rider_coordinates_queue`  
**DB:** `logs_db` (MongoDB)

Responsibilities:
- Save rider coordinates
- Fetch rider coordinates
- Can combine rider details (via Rider service) with coordinates data

---

### 5) Order Service (TypeORM + Postgres)
**Path:** `apps/order`  
**Queue:** `order_queue`  
**DB:** `orders_db` (Postgres)

Responsibilities:
- Seed stock
- Get stock by SKU
- Place order (transactional stock decrement)
- Get order by id
- Publish `order.placed` event after successful commit

---

### 6) Emailer Service (Outbox in Postgres)
**Path:** `apps/emailer`  
**Queue:** `email_queue`  
**DB:** Uses `orders_db` for `EmailOutboxEntity` table

Responsibilities:
- Consumes `order.placed` event
- Writes email record to outbox (`PENDING`)
- Background worker periodically marks `SENDING` → `SENT` (or retries → `FAILED`)

---

## Repository layout

```
apps/
  api-gateway/
  authentication/
  rider/
  logging/
  order/
  emailer/
docker-compose.yml
rest.http
load-register-http.js
package.json
```

---

## Prerequisites

- Node.js (LTS recommended)
- npm
- Docker Desktop (for Postgres, MongoDB, RabbitMQ)
- Git

Optional:
- VS Code REST Client extension (to run `rest.http`)

---

## Clone and setup

### 1) Clone repo
```bash
git clone https://github.com/v1shalx/nestjs-microservices-api-gateway-rabbitmq.git
cd nestjs-microservices-api-gateway-rabbitmq
```

### 2) Install dependencies (root)
```bash
npm install
```

### 3) Start infrastructure (RabbitMQ + Postgres + MongoDB)
```bash
docker compose up -d
```

Infra typically exposes:
- RabbitMQ AMQP: `localhost:5672`
- RabbitMQ UI: `http://localhost:15672` (default: `guest/guest`)
- MongoDB: `localhost:27017`
- Postgres ports are defined in `docker-compose.yml`

Check containers:
```bash
docker ps
```

---

## Prisma setup (Authentication service)

Auth uses Prisma, so generate client + push schema:

```bash
cd apps/authentication
npm install
npx prisma generate
npx prisma db push
cd ../..
```

> If Prisma fails due to DB not ready, wait a few seconds and run `npx prisma db push` again.

---

## Run the system

### Option A (recommended): run all services together
From repo root:
```bash
npm run dev:all
```

### Option B: run services one-by-one
From repo root (in separate terminals):
```bash
nest start api-gateway --builder swc --watch
nest start authentication --builder swc --watch
nest start rider --builder swc --watch
nest start logging --builder swc --watch
nest start order --builder swc --watch
nest start emailer --builder swc --watch
```

---

## Quick test (REST)

You can use `rest.http` (VS Code REST Client) or use curl.

### 1) Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"Pass@123","name":"Test User"}'
```

### 2) Login (get JWT)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"Pass@123"}'
```

Copy the token from the response.

### 3) Profile (protected)
```bash
curl http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

### 4) Seed stock
```bash
curl -X POST http://localhost:3000/stocks/seed \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"SKU-1","quantity":10,"price":100}]}'
```

### 5) Place order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"sku":"SKU-1","quantity":1,"userId":1}'
```

Then watch the Emailer logs:
- You should see the `order.placed` consumption and outbox processing.

---

## Stress test (Auth register load)

Script: `load-register-http.js`

Run:
```bash
node load-register-http.js
```

This helps observe:
- API Gateway behavior under concurrency
- RMQ RPC behavior
- Queue backlog if you stop a consumer service

---

## Configuration notes (important)

This project is a demo/PoC. Some values may be hardcoded (depending on your code version), such as:
- RabbitMQ URL (e.g., `amqp://localhost:5672`)
- DB connection strings
- JWT secret

For production-like setup, you should:
- Move configs to `.env` and commit a `.env.example`
- Use durable queues + persistent messages in RabbitMQ
- Add retries + dead-letter queues (DLQ)
- Add distributed tracing (OpenTelemetry)
- Add idempotency in consumers (avoid duplicate email on re-delivery)
- Add centralized logging (Loki/ELK) + metrics (Prometheus/Grafana)

---

## Troubleshooting

### RabbitMQ UI login
- URL: `http://localhost:15672`
- Default creds: `guest / guest`

### “Port already in use”
Stop the conflicting process or change ports in `docker-compose.yml`.

### Prisma cannot connect
- Ensure docker is running and Postgres container is healthy.
- Retry:
```bash
cd apps/authentication
npx prisma db push
```

---

