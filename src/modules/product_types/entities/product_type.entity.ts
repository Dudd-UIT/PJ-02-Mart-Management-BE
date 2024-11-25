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

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ProductLine, (productLine) => productLine.productType, {
    createForeignKeyConstraints: false,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    cascade: true,
  })
  productLines?: ProductLine[];
}
