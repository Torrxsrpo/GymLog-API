<img width="1396" height="748" alt="image" src="https://github.com/user-attachments/assets/7d444ba5-74b4-4d95-82b3-16d0ba6c07fa" />

# Gym Log API

## Cómo ejecutar

```bash
npm install
cp .env.template .env      # completa los valores, JWT_SECRET es obligatorio
docker compose up -d       # levanta PostgreSQL
npm run start:dev          # corre los tests unitarios y arranca en http://localhost:3000
```

## Rutas

| Método | Ruta              | Body / Header                          |
| ------ | ----------------- | -------------------------------------- |
| POST   | `/auth/register` | `{ "name", "email", "password" }`      |
| POST   | `/auth/login`    | `{ "email", "password" }`              |
| GET    | `/products`       | `Authorization: Bearer <accessToken>`  |

```bash
# Registrarse
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Emmanuel","email":"emmanuel@test.com","password":"Abcdef12"}'

# Login (devuelve accessToken; credenciales incorrectas → 401)
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"emmanuel@test.com","password":"Abcdef12"}'

# Ver productos con el token
curl http://localhost:3000/products -H "Authorization: Bearer <accessToken>"
```

## Tests

```bash
npm test            # unitarios
npm run test:e2e    # e2e (requiere la base de datos levantada)
```
