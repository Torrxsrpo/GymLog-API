import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../domain/models/User.entity.js";
import { UserRepositoryPort } from "../../domain/ports/UserRepository.port.js";
import { userMapper } from "./User.mapper.js";
import { UserOrmEntity } from "./UserOrm.entity.js";
import { Repository } from "typeorm";





export class  UserRepositoryAdapter implements UserRepositoryPort {

    constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

        async createUser(user: User): Promise<User> {
            const UserOrm = userMapper.toOrm(user);
            return userMapper.toDomain(await this.repository.create(UserOrm));
        }


        
    
}