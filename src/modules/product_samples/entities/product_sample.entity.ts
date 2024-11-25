import { ProductLine } from 'src/modules/product_lines/entities/product_line.entity';
import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class ProductSample {
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

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ProductUnit, (productUnit) => productUnit.productSample, {
    createForeignKeyConstraints: false,
    cascade: true,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  productUnits?: ProductUnit[];

  @ManyToOne(() => ProductLine, (productLine) => productLine.productSamples, {
    createForeignKeyConstraints: false,
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  productLine?: ProductLine;
}
