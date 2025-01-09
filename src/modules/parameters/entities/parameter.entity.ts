import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Parameter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'int',
    default: 0,
  })
  value: number;
}
