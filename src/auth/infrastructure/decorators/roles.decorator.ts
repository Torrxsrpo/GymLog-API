import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../users/domain/models/enums/Role.enum.js';

export const ROLES_KEY = 'roles';

// Sin este decorador, RolesGuard exige Role.USER
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
