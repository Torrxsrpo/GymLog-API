import { Reflector } from '@nestjs/core';
import { PATH_METADATA } from '@nestjs/common/constants.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { Role } from '../../../users/domain/models/enums/Role.enum.js';
import { AuthController } from '../http/controllers/Auth.controller.js';
import { ProductsController } from '../../../products/infrastructure/http/controllers/Products.controller.js';
import { ExercisesController } from '../../../exercises/infrastructure/http/controllers/Exercises.controller.js';
import { MuscleGroupsController } from '../../../exercises/infrastructure/http/controllers/MuscleGroups.controller.js';
import { RoutinesController } from '../../../routines/infrastructure/http/controllers/Routines.controller.js';
import { WorkoutSessionsController } from '../../../workouts/infrastructure/http/controllers/WorkoutSessions.controller.js';

// Red de seguridad: si alguien marca otra ruta como pública o le quita el rol USER, este test falla
describe('Protección de rutas', () => {
  const reflector = new Reflector();
  const controllers = [
    AuthController,
    ProductsController,
    ExercisesController,
    MuscleGroupsController,
    RoutinesController,
    WorkoutSessionsController,
  ];

  const routes = controllers.flatMap((controller) =>
    Object.getOwnPropertyNames(controller.prototype)
      .filter((name) => name !== 'constructor')
      .map((name) => {
        const handler = (controller.prototype as unknown as Record<string, () => unknown>)[name];
        const targets = [handler, controller];
        return {
          route: `${reflector.get<string>(PATH_METADATA, controller)}.${name}`,
          isPublic: reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets) ?? false,
          roles: reflector.getAllAndOverride<Role[]>(ROLES_KEY, targets),
        };
      }),
  );

  it('solo login y register son públicas', () => {
    const publicRoutes = routes.filter((route) => route.isPublic).map((route) => route.route);

    expect(publicRoutes.sort()).toEqual(['auth.createuser', 'auth.login']);
  });

  it('las demás rutas exigen el rol USER', () => {
    const privateRoutes = routes.filter((route) => !route.isPublic);

    expect(privateRoutes.length).toBeGreaterThan(0);
    for (const route of privateRoutes) {
      // Sin @Roles, RolesGuard aplica Role.USER por defecto
      expect(route.roles ?? [Role.USER], route.route).toContain(Role.USER);
    }
  });
});
