import { InboundReceipt } from 'src/modules/inbound_receipt/entities/inbound_receipt.entity';
import { SupplierProduct } from 'src/modules/supplier_products/entities/supplier_product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(
    () => SupplierProduct,
    (supplierProduct) => supplierProduct.supplier,
    { createForeignKeyConstraints: false },
  )
  supplierProducts: SupplierProduct[];

  @OneToOne(() => InboundReceipt, (inboundReceipt) => inboundReceipt.supplier, {
    createForeignKeyConstraints: false,
  })
  inboundReceipt: InboundReceipt;
}
