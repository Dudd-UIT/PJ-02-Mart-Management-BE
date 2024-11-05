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

  @Column()
  totalPrice: number;

  @Column()
  isReceived: number;

  @Column()
  isPaid: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.inboundReceipts, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @OneToMany(() => Batch, (batch) => batch.inboundReceipt, { createForeignKeyConstraints: false })
  batchs: Batch[];

  @OneToOne(() => Supplier, (supplier) => supplier.inboundReceipt, { createForeignKeyConstraints: false })
  @JoinColumn()
  supplier: Supplier;
}
