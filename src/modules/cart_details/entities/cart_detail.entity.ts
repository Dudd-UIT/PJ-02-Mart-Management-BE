import { Batch } from 'src/modules/batchs/entities/batch.entity';
import { Cart } from 'src/modules/carts/entities/cart.entity';
import { ProductUnit } from 'src/modules/product_units/entities/product_unit.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class CartDetail {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public cartId: number;

  @Column()
  public productUnitId: number;

  @Column()
  public batchId: number;

  @Column({
    type: 'int',
    default: 1,
    unsigned: true,
  })
  public quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.cartDetails, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
    nullable: false,
  })
  public cart: Cart;

  @ManyToOne(() => ProductUnit, (productUnit) => productUnit.orderDetails, {
    createForeignKeyConstraints: false,
    onDelete: 'RESTRICT',
    nullable: false,
  })
  public productUnit: ProductUnit;

  @ManyToOne(() => Batch, (batch) => batch.cartDetails, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'batchId' })
  public batch: Batch;
}
