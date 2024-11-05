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

  @Column()
  name: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  score: number;

  @Column()
  address: string;

  @Column()
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Group, (group) => group.users, { createForeignKeyConstraints: false })
  @JoinColumn()
  group: Group;

  @OneToMany(() => Order, (user) => user.customer, { createForeignKeyConstraints: false })
  customerOrders: Order[];

  @OneToMany(() => Order, (user) => user.staff, { createForeignKeyConstraints: false })
  staffOrders: Order[];

  @OneToMany(() => InboundReceipt, (inboundReceipt) => inboundReceipt.staff, { createForeignKeyConstraints: false })
  inboundReceipts: InboundReceipt[];
}
