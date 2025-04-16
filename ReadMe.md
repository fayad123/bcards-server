<h1 align="center">📘 Business Cards API - Quick Reference & Examples</h1>

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Server Configuration](#server-configuration)
4. [MongoDB Setup](#mongodb-setup)
5. [Middleware](#middleware)
6. [Routing](#routing)
7. [Global Error Handler](#global-error-handler)
8. [Logging](#logging)
9. [Run Server](#run-server)
10. [User Register](#user-register-example)
11. [User Register](#user-login-example)
12. [Card Creation](#card-creation-example)

---

## Overview

This API handles:

-   User authentication (JWT)
-   Admin & business user features
-   Business card management (CRUD)
-   Custom logging & global error handling

---

Before running the server, make sure you have the following:

-   **Node.js** version 18+
-   **MongoDB** installed locally or MongoDB Atlas
-   `.env` file with the following variables like:
    -   NODE_ENV=development
    -   PORT=8000
    -   DB="mongodb://localhost:27017/bcards"
    -   JWT_SECRET="bammms"

- **and for production mode you need to setup:**
- `.env.` file with the following variables like:
    -   NODE_ENV=production
    -   PORT=8030
    -   DB="mongodb/atlas"
    -   JWT_SECRET="bammms" 

---

## Server Configuration

-   Server is set up using `Express`, `mongoose`, and `dotenv`. Example start command:

```bash
npm run start:develop
```

-   for production

```bash
npm run start:product
```

## MongoDB Setup

Collection: users, cards

You can use MongoDB Compass for local or connect to MongoDB Atlas.

Required DB name: bcards

# Middleware

-   **Includes:**

    -   express.json() for body parsing

    -   cors() for cross-origin access

    -   logger middleware to log requests

    -   Custom logToFile() for daily logs

# Routing

-   /api/users – User registration, login, info

-   /api/cards – Card CRUD endpoints

# Logging

-   All requests and errors are logged using chalk and saved to log files via logger

# User Register Example

Endpoint

-   POST /api/users

Body (JSON)

card body

```bash
{
  "name": {
    "first": "fayad",
    "middle": "ahmad",
    "last": "mhamid"
  },
  "image": {
    "url": "https://images.unsplash.com/photo-1742240216264-f0aac25ef4ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxzZWFyY2h8OHx8YnVzaW5lc3N8ZW58MHx8MHx8fDA%3D",
    "alt": "profile picture"
  },
  "isBusiness": true,
  "isAdmin": true, # this just for check
  "phone": "0535265487",
  "email": "fayad@business.com",
  "password": "fayad12345",
  "address": {
    "state": "umm al fahm",
    "country": "IL",
    "city": "mhamid",
    "street": "456 Business Ave",
    "houseNumber": 789,
    "zip": 55
  }
}
```

---

# Card Creation Example

Endpoint

-   POST /api/cards

Body (JSON)

```bash
{
  "title": "Business Card Title",
  "subtitle": "Business Card Subtitle",
  "description": "This is a description of the business card.",
  "phone": "0538346915",
  "email": "examsspדle22@business.com",
  "web": "https://www.businesswebsite.com",
  "image": {
    "url": "https://example.com/image.jpg",
    "alt": "Business Card Image"
  },
  "address": {
    "state": "California",
    "country": "USA",
    "city": "Los Angeles",
    "street": "123 Business St",
    "houseNumber": 456,
    "zip": "90001"
  }
}

```
