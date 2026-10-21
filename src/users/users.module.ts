import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserUseCase } from './application/use-cases/create-User.CaseUse.js';
import { LoginUserUseCase } from './application/use-cases/login-User.CaseUse.js';
import { USER_REPOSITORY } from './domain/ports/UserRepository.port.js';
import { TOKEN_SERVICE } from './domain/ports/TokenService.port.js';
import { PASSWORD_HASHER } from './domain/ports/PasswordHasher.port.js';
import { UserOrmEntity } from './infrastructure/persistence/UserOrm.entity.js';
import { UserLoginController } from './infrastructure/http/controllers/UserLogin.controller.js';
import { UserRepositoryAdapter } from './infrastructure/persistence/User.repository.js';
import { JwtTokenService } from './infrastructure/security/JwtToken.service.js';
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher.service.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
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
  controllers: [UserLoginController],
  providers: [
    //cases uses
    CreateUserUseCase,
    LoginUserUseCase,

        { provide: USER_REPOSITORY, useClass: UserRepositoryAdapter},
        { provide: TOKEN_SERVICE, useClass: JwtTokenService},
        { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher}


  ],
})
export class UsersModule {}
