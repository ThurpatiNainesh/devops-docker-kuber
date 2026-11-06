# Static IP and Microservices Architecture

Notes on Elastic IPs in AWS, how microservices compare to monoliths, how services talk to each other, and what an API Gateway does.

---

## Table of Contents

1. [Static IP (Elastic IP)](#1-static-ip-elastic-ip)
2. [Monolithic vs. Microservices Architecture](#2-monolithic-vs-microservices-architecture)
3. [Advantages of Microservices](#3-advantages-of-microservices)
4. [Disadvantages of Microservices](#4-disadvantages-of-microservices)
5. [Communication Between Microservices](#5-communication-between-microservices)
6. [API Gateway](#6-api-gateway)
7. [Summary](#7-summary)

---

## 1. Static IP (Elastic IP)

By default, an EC2 instance gets a **public IP address from AWS's pool**. When the instance is **stopped and started again**, AWS releases that IP and assigns a new one. (A simple reboot keeps the same IP.)

This is a problem when:
- A domain name (DNS record) points to the server's IP.
- Clients, partners, or firewalls have whitelisted the IP.
- Other services connect to the server using its IP.

**Solution:** Allocate an **Elastic IP (EIP)** and associate it with the instance. An Elastic IP is a static public IPv4 address that belongs to your AWS account until you release it.

| Feature | Default Public IP | Elastic IP |
|---|---|---|
| Changes on stop/start | Yes | No |
| Can move to another instance | No | Yes (re-associate) |
| Owned by your account | No | Yes, until released |

**Tip:** AWS charges for public IPv4 addresses, including Elastic IPs that are allocated but not attached to a running instance. Release EIPs you no longer use.

---

## 2. Monolithic vs. Microservices Architecture

### Monolithic Architecture

The entire application (UI, business logic, data access) is built, deployed, and run as **a single unit**, usually with one shared database.

```
┌──────────────────────────────────┐
│         Monolithic App           │
│  ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │ User │ │Order │ │ Payment  │  │
│  └──────┘ └──────┘ └──────────┘  │
└───────────────┬──────────────────┘
                │
         ┌──────▼──────┐
         │  Single DB  │
         └─────────────┘
```

- Simple to build, test, and deploy at the start.
- A crash or memory leak in one module can bring down the **whole application** — a single point of failure.
- To scale one busy feature, you must scale the entire app.

### Microservices Architecture

The application is split into **small, independent services**, each responsible for one business capability and usually owning its own data.

```
           ┌──────────────┐
Client ──▶ │ API Gateway  │
           └──┬────┬────┬─┘
              │    │    │
     ┌────────▼┐ ┌─▼──────┐ ┌▼─────────┐
     │  User   │ │ Order  │ │ Payment  │
     │ Service │ │Service │ │ Service  │
     └────┬────┘ └───┬────┘ └────┬─────┘
          │          │           │
       ┌──▼──┐    ┌──▼──┐     ┌──▼──┐
       │ DB  │    │ DB  │     │ DB  │
       └─────┘    └─────┘     └─────┘
```

If one service goes down, the others keep running — **as long as they don't depend on the failed service**.

| Aspect | Monolith | Microservices |
|---|---|---|
| Deployment | One unit | Each service separately |
| Scaling | Whole app | Per service |
| Failure impact | Can affect everything | Usually isolated |
| Tech stack | One | Can differ per service |
| Complexity | Low at start | High (distributed system) |

---

## 3. Advantages of Microservices

### 3.1 Fault Isolation
A failure in one service (e.g. Recommendations) does not crash unrelated services (e.g. Login, Checkout). Patterns like circuit breakers and fallbacks help contain failures further.

### 3.2 Independent Scalability
Each service scales based on its own load. Example: during a sale, scale only the Order and Payment services instead of the whole application. This improves resource utilization and reduces infrastructure cost.

### 3.3 Independent Deployment
A service can be developed, updated, and deployed on its own, without redeploying the entire application. Smaller deployments mean faster releases and lower risk.

### 3.4 Technology Flexibility
Each service can use the language, framework, and database that best fits its job:
- Search service → Elasticsearch
- Payment service → PostgreSQL
- Real-time chat → Node.js + Redis

### 3.5 Team Autonomy
Small teams can own a service end-to-end and work in parallel without blocking each other.

### Quick list
- Better fault isolation
- Independent scalability
- Independent deployment
- Technology flexibility
- Better resource utilization

---

## 4. Disadvantages of Microservices

Microservices solve some problems but introduce the challenges of a **distributed system**.

### 4.1 Needs a Strong DevOps Team
Many services mean many pipelines, containers, servers, configs, and monitoring setups. You typically need CI/CD, containerization (Docker), orchestration (Kubernetes/ECS), and infrastructure-as-code. This requires dedicated DevOps skills and effort.

### 4.2 Hard to Debug
A single user request may pass through 5–10 services. When something fails, finding *where* and *why* is difficult. You need:
- **Centralized logging** (ELK stack, CloudWatch)
- **Distributed tracing** with a request/correlation ID (Jaeger, Zipkin, OpenTelemetry)
- **Monitoring and alerting** (Prometheus, Grafana)

### 4.3 Data Management is Complex
Each service owns its own database, so:
- No simple cross-service `JOIN` queries.
- No single database transaction across services — you need patterns like **Saga** for distributed transactions.
- Data may be **eventually consistent** rather than immediately consistent.
- Data may be duplicated across services.

### 4.4 Network Calls
In a monolith, modules call each other as in-memory function calls. In microservices, they communicate over the **network**, which can:
- Fail or time out
- Return partial responses
- Require retries, timeouts, and circuit breakers to handle reliably

### 4.5 Latency
Every network hop adds delay (serialization, transfer, deserialization). A request that chains through several services is slower than an equivalent in-process call. Reduce this with caching, parallel calls, async communication, and avoiding long chains of synchronous calls.

### Quick list
- Requires a strong DevOps team
- Hard to debug and trace
- Complex data management and consistency
- Unreliable network calls
- Higher latency

---

## 5. Communication Between Microservices

Services communicate either **synchronously** (caller waits for a response) or **asynchronously** (caller sends a message and moves on).

### 5.1 HTTP/HTTPS (REST) — Synchronous
Services expose REST APIs and call each other over HTTP, usually with JSON.

```
Order Service ── GET /users/42 ──▶ User Service
              ◀── 200 OK {json} ──
```

- ✅ Simple, widely supported, human-readable, easy to test (Postman, curl)
- ❌ Text-based JSON is heavier; caller is blocked while waiting
- **Use for:** public APIs, simple request/response between services

### 5.2 gRPC — Synchronous (high performance)
A framework by Google using **HTTP/2** and **Protocol Buffers** (binary format). Services define contracts in `.proto` files, and client/server code is generated.

```proto
service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
}
```

- ✅ Fast and compact, strongly typed contracts, supports streaming
- ❌ Not human-readable, limited direct browser support, harder to debug
- **Use for:** internal service-to-service calls where performance matters

### 5.3 Event Broker (Message Broker) — Asynchronous
Services publish **events/messages** to a broker; other services subscribe and process them independently. Examples: **Kafka, RabbitMQ, AWS SQS/SNS**.

```
Order Service ── "OrderPlaced" ──▶ [ Event Broker ] ──▶ Email Service
                                                  ├──▶ Inventory Service
                                                  └──▶ Analytics Service
```

- ✅ Loose coupling (publisher doesn't know who consumes), absorbs traffic spikes, consumers can be down temporarily without losing messages
- ❌ Eventual consistency, harder to trace flow, must handle duplicate and out-of-order messages
- **Use for:** notifications, background jobs, event-driven workflows

### Comparison

| Method | Type | Format | Speed | Best For |
|---|---|---|---|---|
| HTTP/REST | Sync | JSON (text) | Moderate | Public APIs, simple calls |
| gRPC | Sync | Protobuf (binary) | Fast | Internal high-performance calls |
| Event Broker | Async | Messages/events | Decoupled | Background & event-driven work |

---

## 6. API Gateway

An **API Gateway** is a single entry point that sits between clients and the microservices. Clients talk only to the gateway; the gateway forwards requests to the right service.

```
Mobile / Web Client
        │
        ▼
┌───────────────────────────────┐
│          API Gateway          │
│ Auth · Rate Limit · Routing   │
│ IP Allow/Block List           │
└──┬──────────┬──────────┬──────┘
   ▼          ▼          ▼
 User       Order     Payment
Service    Service    Service
```

Examples: **AWS API Gateway, Kong, NGINX, Spring Cloud Gateway, Traefik**.

### 6.1 Routing
Forwards each request to the correct service based on path, method, or headers.

```
/api/users/*    → User Service
/api/orders/*   → Order Service
/api/payments/* → Payment Service
```
Clients don't need to know each service's address, and services can move or scale without affecting clients.

### 6.2 Rate Limiting
Limits how many requests a client can make in a time window (e.g. 100 requests/minute per user or API key). Excess requests get `429 Too Many Requests`.
- Protects services from overload and abuse
- Helps mitigate brute-force and DoS attempts
- Enables usage tiers (free vs. paid plans)

### 6.3 Authentication
Verifies the client's identity (e.g. validating a **JWT** or API key) once, at the gateway, before the request reaches any service.
- Services don't each need to re-implement login/token validation
- Unauthenticated requests are rejected early with `401 Unauthorized`
- The gateway can pass the verified user info to services in headers

### 6.4 IP Address Listing (Allowlist / Blocklist)
Controls access based on the client's IP address:
- **Allowlist (whitelist):** only listed IPs can access (e.g. admin APIs only from the office network)
- **Blocklist (blacklist):** listed IPs are denied (e.g. known malicious sources)

### Other common gateway features
- SSL/TLS termination
- Load balancing
- Response caching
- Request/response transformation
- Centralized logging and metrics

**Note:** The gateway itself can become a single point of failure or bottleneck, so run multiple instances behind a load balancer.

---

## 7. Summary

- **Elastic IP** keeps an EC2 instance's public IP fixed across stop/start.
- **Monoliths** are simple but fail and scale as one unit; **microservices** split the app into independent services.
- **Advantages:** fault isolation, independent scaling and deployment, technology flexibility, better resource use.
- **Disadvantages:** needs strong DevOps, hard to debug, complex data management, unreliable network calls, added latency.
- **Communication:** HTTP/REST (simple), gRPC (fast, internal), event brokers (async, decoupled).
- **API Gateway:** single entry point handling routing, rate limiting, authentication, and IP allow/block lists.