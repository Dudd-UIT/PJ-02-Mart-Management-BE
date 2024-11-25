import { Order } from 'src/modules/orders/entities/order.entity';
import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public orderId: number;

  @Column()
  public productUnitId: number;

  @Column({
    type: 'int',
    default: 1,
    unsigned: true,
  })
  public quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    unsigned: true,
  })
  public currentPrice: number;

  @ManyToOne(() => Order, (order) => order.orderDetails, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
    nullable: false,
  })
  public order: Order;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit.orderDetails, {
    createForeignKeyConstraints: false,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  public productUnit: ProductUnit;
}
