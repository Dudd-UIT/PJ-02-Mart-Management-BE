import { Group } from 'src/modules/groups/entities/group.entity';
import { InboundReceipt } from 'src/modules/inbound_receipt/entities/inbound_receipt.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 'Chưa có', length: 100 })
  email: string;

  @Column({ default: 'Chưa có' })
  password: string;

  @Column({ default: 0, type: 'int', unsigned: true })
  score: number;

  @Column({ default: 'Chưa có', length: 255 })
  address: string;

  @Column({ length: 10, unique: true })
  phone: string;

  @Column({ type: 'tinyint', default: 0, comment: '0: inactive, 1: active' })
  isActive: number;

  @Column({ nullable: true, length: 32 })
  codeId: string;

  @Column({ nullable: true, type: 'datetime' })
  codeExpired: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Group, (group) => group.users, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  group: Group;

  @OneToMany(() => Order, (user) => user.customer, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  customerOrders: Order[];

  @OneToMany(() => Order, (user) => user.staff, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  staffOrders: Order[];

  @OneToMany(() => InboundReceipt, (inboundReceipt) => inboundReceipt.staff, {
    createForeignKeyConstraints: false,
  })
  inboundReceipts: InboundReceipt[];
}
