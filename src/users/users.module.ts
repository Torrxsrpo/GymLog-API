import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserUseCase } from './application/use-cases/create-User.CaseUse.js';
import { USER_REPOSITORY } from './domain/ports/UserRepository.port.js';
import { TOKEN_SERVICE } from './domain/ports/TokenService.port.js';
import { UserOrmEntity } from './infrastructure/persistence/UserOrm.entity.js';
import { UserLoginController } from './infrastructure/http/controllers/UserLogin.controller.js';
import { UserRepositoryAdapter } from './infrastructure/persistence/User.repository.js';
import { JwtTokenService } from './infrastructure/security/JwtToken.service.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
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

        { provide: USER_REPOSITORY, useClass: UserRepositoryAdapter},
        { provide: TOKEN_SERVICE, useClass: JwtTokenService}


  ],
})
export class UsersModule {}
