import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from './domain/ports/UserRepository.port.js';
import { UserOrmEntity } from './infrastructure/persistence/UserOrm.entity.js';
import { UserRepositoryAdapter } from './infrastructure/persistence/User.repository.js';


@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepositoryAdapter },
  ],
  // Se exporta para que auth pueda buscar y crear usuarios
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
