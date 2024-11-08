import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Parameters {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  value: number;
}
