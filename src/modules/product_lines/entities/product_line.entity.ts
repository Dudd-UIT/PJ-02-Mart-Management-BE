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

  @ManyToOne(() => ProductType, (productType) => productType.productLines, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  productType: ProductType;

  @OneToMany(
    () => ProductSample,
    (productSample) => productSample.productLine,
    {
      createForeignKeyConstraints: false,
      cascade: true,
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  productSamples?: ProductSample[];
}
