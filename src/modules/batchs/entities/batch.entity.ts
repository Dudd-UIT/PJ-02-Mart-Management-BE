import { InboundReceipt } from 'src/modules/inbound_receipt/entities/inbound_receipt.entity';
import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  inboundPrice: number;

  @Column()
  discount: number;

  @Column()
  inventQuantity: number;

  @Column()
  inboundQuantity: number;

  @Column()
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => InboundReceipt, (inboundReceipt) => inboundReceipt.batchs, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  inboundReceipt: InboundReceipt;

  @OneToOne(() => ProductUnit, (productUnit) => productUnit.batch, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  productUnit: ProductUnit;
}
