import { Order } from 'src/modules/orders/entities/order.entity';
import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public quantity: number;

  @Column()
  public currentPrice: number;

  @ManyToOne(() => Order, (order) => order.orderDetails, {
    createForeignKeyConstraints: false,
  })
  public order: Order;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit.orderDetails, {
    createForeignKeyConstraints: false,
  })
  public productUnit: ProductUnit;
}
