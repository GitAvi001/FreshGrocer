# FreshGrocer - Microservices Grocery Management System

FreshGrocer is a modern, scalable grocery management backend built with NestJS microservices. It features a decentralized architecture with an API Gateway and dedicated services for Authentication, Inventory, and Ordering.

## 🚀 Architecture Overview

The system is designed using the **Microservices Pattern**, communicating via **TCP** for high performance.

- **API Gateway**: The entry point for all client requests. It provides a unified RESTful API and delegates business logic to the internal services.
- **Auth Service**: Handles user registration, authentication, and identity management.
- **Inventory Service**: Manages the product catalog, real-time stock levels, categorization, and expiration tracking for perishable goods.
- **Order Service**: Orchestrates the order lifecycle, from creation and payment status to delivery tracking and driver assignment.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Caching & Messaging**: [Redis](https://redis.io/)
- **Infrastructure**: [Docker](https://www.docker.com/) & Docker Compose

## 📁 Project Structure

```text
FreshGrocer/
├── apps/
│   ├── gateway/           # Entry point & Routing
│   ├── auth-service/      # Identity & User Management
│   ├── inventory-service/ # Product & Stock Management
│   └── order-service/     # Order Processing & Tracking
├── libs/
│   └── common/            # Shared utilities and modules
├── docker-compose.yml     # Infrastructure (PostgreSQL, Redis)
├── nest-cli.json          # Monorepo configuration
└── package.json           # Dependencies and scripts
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FreshGrocer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up infrastructure**:
   Start the database and caching services using Docker:
   ```bash
   docker-compose up -d
   ```

4. **Run the application**:
   You can start all services in development mode:
   ```bash
   npm run start:dev
   ```
   *Note: NestJS will start the gateway and all microservices defined in the monorepo.*

## 🛣️ API Endpoints

### Health Check
- `GET /health` - Check the status of the API Gateway.

### Authentication
- `POST /auth/register` - Register a new user.
- `POST /auth/login` - Authenticate and get a token.

### Products & Inventory
- `GET /products` - List all products (with pagination).
- `POST /products` - Create a new product.
- `GET /products/:id` - Get product details.
- `PUT /products/:id` - Update product information.
- `PATCH /products/:id/stock` - Update product stock quantity.
- `GET /products/low-stock` - List products below their threshold.
- `GET /products/expiring` - List perishable products nearing expiration.

### Orders
- `POST /orders` - Create a new order.
- `GET /orders/:id` - Get order status and details.
- `GET /orders/user/:userId` - Get all orders for a specific user.
- `PATCH /orders/:id/status` - Update order status (Pending → Delivered).
- `PATCH /orders/:id/driver` - Assign a driver to an order.

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📄 License

This project is [UNLICENSED](LICENSE).
