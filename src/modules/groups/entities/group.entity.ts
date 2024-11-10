import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deleteAt: string;

  @OneToMany(() => User, (user) => user.group, {
    createForeignKeyConstraints: false,
  })
  users: User[];

  @ManyToMany(() => Role, (role) => role.groups, {
    createForeignKeyConstraints: false,
  })
  @JoinTable({
    name: 'role_group',
    joinColumn: { name: 'groupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];
}
