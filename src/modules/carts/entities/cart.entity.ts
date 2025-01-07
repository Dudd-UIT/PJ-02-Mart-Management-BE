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
import { User } from 'src/modules/users/entities/user.entity';
import { CartDetail } from 'src/modules/cart_details/entities/cart_detail.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'tinyint', default: 0, comment: '0: inactive, 1: active' })
  public status: number;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => User, (customer) => customer.customerOrders, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.cart, {
    createForeignKeyConstraints: false,
    cascade: true,
  })
  cartDetails: CartDetail[];
}
