import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Marca una ruta como pública: los guards globales no exigen token ni rol
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
