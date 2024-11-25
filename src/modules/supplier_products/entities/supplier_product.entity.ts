import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['supplierId', 'productUnitId'])
export class SupplierProduct {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public supplierId: number;

  @Column()
  public productUnitId: number;

  @Column({ type: 'tinyint', default: 0, comment: '0: inactive, 1: active' })
  public status: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.supplierProducts, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  public supplier: Supplier;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit.supplierProducts, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  public productUnit: ProductUnit;
}
