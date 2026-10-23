<img width="1396" height="748" alt="image" src="https://github.com/user-attachments/assets/7d444ba5-74b4-4d95-82b3-16d0ba6c07fa" />

# Gym Log API

## Cómo ejecutar

```bash
npm install
cp .env.template .env      # completa los valores, JWT_SECRET es obligatorio
docker compose up -d       # levanta PostgreSQL
npm run start:dev          # corre los tests unitarios y arranca en http://localhost:3000
```

## Autenticación

Todas las rutas exigen `Authorization: Bearer <accessToken>` y el rol `user`, **excepto** `POST /auth/register` y `POST /auth/login`.
El token se valida con Passport (`JwtStrategy`); sin token o con token inválido la API responde `401`, y sin el rol `user` responde `403`.
Las rutinas y sesiones son privadas: cada usuario solo ve y modifica las suyas (las de otro usuario responden `404`).

## Rutas

| Método | Ruta                                   | Body                                                                 |
| ------ | -------------------------------------- | -------------------------------------------------------------------- |
| POST   | `/auth/register` (pública)             | `{ "name", "email", "password" }`                                    |
| POST   | `/auth/login` (pública)                | `{ "email", "password" }`                                            |
| GET    | `/products`                            |                                                                      |
| GET    | `/muscle-groups`                       |                                                                      |
| POST   | `/muscle-groups`                       | `{ "name" }`                                                         |
| GET    | `/exercises?muscleGroupId=pecho`       | filtro opcional                                                      |
| GET    | `/exercises/:id`                       |                                                                      |
| POST   | `/exercises`                           | `{ "name", "muscleGroupId", "img"? }`                                |
| GET    | `/routines`                            | rutinas del usuario                                                  |
| GET    | `/routines/:id`                        |                                                                      |
| POST   | `/routines`                            | `{ "name", "frequency" (1-7 días/semana), "date"?, "exercises": [{ "exerciseId", "targetSets", "targetReps" }] }` |
| PATCH  | `/routines/:id`                        | cualquier campo de POST; `exercises` reemplaza la lista completa     |
| DELETE | `/routines/:id`                        | las sesiones de esa rutina se conservan con `routineId: null`        |
| GET    | `/workout-sessions`                    | sesiones del usuario con sus series                                  |
| GET    | `/workout-sessions/:id`                |                                                                      |
| POST   | `/workout-sessions`                    | `{ "routineId"?, "time"?, "notes"? }` → empieza `in_progress`        |
| PATCH  | `/workout-sessions/:id`                | `{ "status"?: "completed" \| "cancelled", "notes"? }`                |
| DELETE | `/workout-sessions/:id`                |                                                                      |
| POST   | `/workout-sessions/:id/sets`           | `{ "exerciseId", "reps", "weight" }` (solo con la sesión en curso)   |
| DELETE | `/workout-sessions/:id/sets/:setId`    | (solo con la sesión en curso)                                        |

Al arrancar se cargan grupos musculares y ejercicios de ejemplo si el catálogo está vacío.

```bash
# Registrarse
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json"   -d '{"name":"Emmanuel","email":"emmanuel@test.com","password":"Abcdef12"}'

# Login (devuelve accessToken; credenciales incorrectas → 401)
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json"   -d '{"email":"emmanuel@test.com","password":"Abcdef12"}'

# Cualquier otra ruta con el token
curl http://localhost:3000/routines -H "Authorization: Bearer <accessToken>"
```

## Tests

```bash
npm test            # unitarios
npm run test:e2e    # e2e (requiere la base de datos levantada)
```
