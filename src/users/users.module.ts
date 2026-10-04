import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-User.CaseUse.js';
import { USER_REPOSITORY } from './domain/ports/UserRepository.port.js';
import { UserOrmEntity } from './infrastructure/persistence/UserOrm.entity.js';
import { UserLoginController } from './infrastructure/persistence/UserLogin.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';import { UserRepositoryAdapter } from './infrastructure/persistence/User.repository.js';


@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserLoginController],
  providers: [
    //cases uses
    CreateUserUseCase,
    
        { provide: USER_REPOSITORY, useClass: UserRepositoryAdapter}


  ],
})
export class UsersModule {}
