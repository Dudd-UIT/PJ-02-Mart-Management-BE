import { Batch } from 'src/modules/batchs/entities/batch.entity';
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class InboundReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '0: Chưa nhận, 1: Đã nhận',
  })
  isReceived: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '0: Chưa thanh toán, 1: Đã thanh toán',
  })
  isPaid: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  vat: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.inboundReceipts, {
    createForeignKeyConstraints: false,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'staffId' })
  staff: User;

  @OneToMany(() => Batch, (batch) => batch.inboundReceipt, {
    createForeignKeyConstraints: false,
  })
  batchs: Batch[];

  @OneToOne(() => Supplier, (supplier) => supplier.inboundReceipt, {
    createForeignKeyConstraints: false,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  supplier: Supplier;
}
