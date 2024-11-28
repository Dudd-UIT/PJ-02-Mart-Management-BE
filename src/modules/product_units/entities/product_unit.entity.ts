import { Batch } from 'src/modules/batchs/entities/batch.entity';
import { OrderDetail } from 'src/modules/order_details/entities/order_detail.entity';
import { ProductSample } from 'src/modules/product_samples/entities/product_sample.entity';
import { SupplierProduct } from 'src/modules/supplier_products/entities/supplier_product.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ProductUnit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sellPrice: number;

  @Column({ nullable: true })
  conversionRate: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  volumne: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(
    () => ProductSample,
    (productSample) => productSample.productUnits,
    { createForeignKeyConstraints: false },
  )
  @JoinColumn()
  productSample?: ProductSample;

  @ManyToOne(() => Unit, (unit) => unit.productUnits, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  unit: Unit;

  @OneToMany(
    () => SupplierProduct,
    (supplierProduct) => supplierProduct.productUnit,
    { createForeignKeyConstraints: false },
  )
  supplierProducts?: SupplierProduct[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.productUnit, {
    createForeignKeyConstraints: false,
  })
  orderDetails?: OrderDetail[];

  @OneToOne(() => Batch, (batch) => batch.productUnit, {
    createForeignKeyConstraints: false,
  })
  batch?: Batch;

  @ManyToOne(() => Unit, (unit) => unit.productUnits, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'compareUnitId' })
  compareUnit?: Unit;
}
