import { ProductLine } from 'src/modules/product_lines/entities/product_line.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string;

  @OneToMany(() => ProductLine, (productLine) => productLine.productType, { createForeignKeyConstraints: false })
  productLines?: ProductLine[];
}
