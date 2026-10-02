import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './application/use-cases/create-User.CaseUse.js';
import { USER_REPOSITORY } from './domain/ports/UserRepository.port.js';
import { UserOrmEntity } from './infrastructure/persistence/UserOrm.entity.js';

@Module({
  controllers: [],
  providers: [
    //cases uses
    CreateUserUseCase,
    
        { provide: USER_REPOSITORY, useClass: UserOrmEntity }


  ],
})
export class UsersModule {}
