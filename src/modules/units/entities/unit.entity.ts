import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    unique: true,
  })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ProductUnit, (productUnit) => productUnit.unit, {
    createForeignKeyConstraints: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  productUnits?: ProductUnit[];
}
