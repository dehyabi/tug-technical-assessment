# Backend

Wellness Package Management API built with NestJS, TypeORM, and MySQL.

## Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start MySQL (via Docker)
docker run -d \
  --name wellness-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=wellness_db \
  -e MYSQL_USER=wellness_user \
  -e MYSQL_PASSWORD=wellness_pass \
  -p 3306:3306 \
  mysql:8

# Run application
npm run start:dev
```

## API Endpoints

### Admin
- `GET /admin/packages` - List all packages
- `POST /admin/packages` - Create package
- `GET /admin/packages/:id` - Get package
- `PUT /admin/packages/:id` - Update package
- `DELETE /admin/packages/:id` - Delete package

### Mobile
- `GET /mobile/packages` - List active packages (limited fields)

## Swagger Docs

Visit `http://localhost:3001/api` when running.
