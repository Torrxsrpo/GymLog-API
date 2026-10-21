import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../domain/models/User.entity.js";
import { UserRepositoryPort } from "../../domain/ports/UserRepository.port.js";
import { Email } from "../../domain/value-objects/Email.vo.js";
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
            return userMapper.toDomain(await this.repository.save(UserOrm));
        }

        async findByEmail(email: Email): Promise<User | null> {
            const userOrm = await this.repository.findOneBy({ email: email.getValue() });
            return userOrm ? userMapper.toDomain(userOrm) : null;
        }




}
