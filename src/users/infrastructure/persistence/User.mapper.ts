import { User } from "../../domain/models/User.entity.js";
import { UserOrmEntity } from "./UserOrm.entity.js";
import { Email } from "../../domain/value-objects/Email.vo.js";
import { Password } from "../../domain/value-objects/Password.vo.js";





export class userMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      name: orm.name,
      email: Email.create(orm.email),
      password: Password.fromHash(orm.password),
      status: orm.status,
      Roles: orm.Roles
    });
  }


  static toOrm(domain: User): UserOrmEntity {
     const orm = new UserOrmEntity();
        orm.id = domain.Id;
        orm.name = domain.getName();
        orm.email = domain.getEmail().getValue();
        orm.password = domain.getPassword().getValue();
        orm.status = domain.getStatus();
        orm.Roles = domain.getRoles();
    return orm;

  }
}
