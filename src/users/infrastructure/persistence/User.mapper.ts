import { User } from "../../domain/models/User.entity.js";
import { UserOrmEntity } from "./UserOrm.entity.js";





export class userMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User({
      id: orm.id,
      name: orm.name,
      email: orm.email,
      password: orm.password,
      status: orm.status,
      Roles: orm.Roles
    });
  }


  static toOrm(domain: User): UserOrmEntity {
     const orm = new UserOrmEntity();
        orm.id = domain.Id;
        orm.name = domain.getName();
        orm.email = domain.getEmail();
        orm.password = domain.getPassword();
        orm.status = domain.getStatus();
        orm.Roles = domain.getRoles();
    return orm;

  }
}
