import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderDetail } from 'src/modules/order_details/entities/order_detail.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  total_price: number;

  @Column()
  payment_method: string;

  @Column()
  payment_time: Date;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (customer) => customer.customerOrders, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @ManyToOne(() => User, (staff) => staff.staffOrders, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, { createForeignKeyConstraints: false })
  orderDetails: OrderDetail[];
}
