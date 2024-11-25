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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalPrice: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Tiền mặt',
    comment: 'Phương thức thanh toán, VD: Tiền mặt, Chuyển khoản',
  })
  paymentMethod: string;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  paymentTime: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Trực tiếp',
    comment: 'Loại đơn hàng, VD: Trực tiếp, Online',
  })
  orderType: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (customer) => customer.customerOrders, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => User, (staff) => staff.staffOrders, {
    createForeignKeyConstraints: false,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'staffId' })
  staff: User;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  orderDetails: OrderDetail[];
}
