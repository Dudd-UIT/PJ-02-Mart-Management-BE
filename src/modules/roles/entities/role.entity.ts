import { Group } from 'src/modules/groups/entities/group.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  description: string;

  @ManyToMany(() => Group, (group) => group.roles, {
    createForeignKeyConstraints: false,
  })
  groups: Group[];
}
