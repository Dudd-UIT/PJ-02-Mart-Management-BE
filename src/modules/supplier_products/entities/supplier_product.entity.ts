import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class SupplierProduct {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public supplierId: number;

  @Column()
  public productUnitId: number;

  @Column()
  public status: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.supplierProducts, { createForeignKeyConstraints: false })
  public supplier: Supplier;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit.supplierProducts, { createForeignKeyConstraints: false })
  public productUnit: ProductUnit;
}
