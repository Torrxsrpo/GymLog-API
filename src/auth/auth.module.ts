import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { CreateUserUseCase } from './application/use-cases/create-User.CaseUse.js';
import { LoginUserUseCase } from './application/use-cases/login-User.CaseUse.js';
import { TOKEN_SERVICE } from './domain/ports/TokenService.port.js';
import { PASSWORD_HASHER } from './domain/ports/PasswordHasher.port.js';
import { AuthController } from './infrastructure/http/controllers/Auth.controller.js';
import { JwtTokenService } from './infrastructure/security/JwtToken.service.js';
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher.service.js';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard.js';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy.js';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({defaultStrategy: 'jwt'}),
    // Global para que otros módulos (p. ej. products) puedan usar JwtAuthGuard
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    //cases uses
    CreateUserUseCase,
    LoginUserUseCase,

    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [PassportModule, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
