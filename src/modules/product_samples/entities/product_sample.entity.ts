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

  @Column()
  name: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string;

  @OneToMany(() => ProductUnit, (productUnit) => productUnit.productSample, {
    createForeignKeyConstraints: false,
  })
  productUnits?: ProductUnit[];

  @ManyToOne(() => ProductLine, (productLine) => productLine.productSamples, {
    createForeignKeyConstraints: false,
  })
  productLine?: ProductLine;
}
