# Node.js GraphQL Server with MySQL

This project provides a basic Node.js server using Apollo Server for GraphQL, connected to a MySQL database. It supports CRUD operations for a User entity.

## Features
- GraphQL API for User CRUD
- MySQL database integration
- Apollo Server setup

## Setup Instructions

1. Install dependencies:
   npm install

2. Configure MySQL connection in .env (see .env.example)

3. Start the server:
   npm start

## Folder Structure
- index.js: Entry point
- schema.js: GraphQL schema and resolvers
- db.js: MySQL connection
- .env.example: Environment variable template

## Environment Variables
Create a .env file in the server directory:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdbname

## Example GraphQL Query
```
query {
  users {
    id
    name
    email
    company
    salary
  }
}
```
