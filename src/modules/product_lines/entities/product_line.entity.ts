import { ProductSample } from 'src/modules/product_samples/entities/product_sample.entity';
import { ProductType } from 'src/modules/product_types/entities/product_type.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class ProductLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: string;

  @DeleteDateColumn()
  deletedAt: string;

  @ManyToOne(() => ProductType, (productType) => productType.productLines, { createForeignKeyConstraints: false })
  productType: ProductType;

  @OneToMany(() => ProductSample, (productSample) => productSample.productLine, { createForeignKeyConstraints: false })
  productSamples?: ProductSample[];
}
