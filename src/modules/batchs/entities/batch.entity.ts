import { CartDetail } from 'src/modules/cart_details/entities/cart_detail.entity';
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
  OneToMany,
} from 'typeorm';

@Entity()
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  inboundPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount: number;

  @Column({
    type: 'int',
    default: 0,
  })
  inventQuantity: number;

  @Column({
    type: 'int',
    default: 0,
  })
  inboundQuantity: number;

  @Column()
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => InboundReceipt, (inboundReceipt) => inboundReceipt.batchs, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  inboundReceipt: InboundReceipt;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit.batches, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  productUnit: ProductUnit;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.batch, {
    createForeignKeyConstraints: false,
  })
  public cartDetails: CartDetail[];
}
