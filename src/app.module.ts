import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { RolesModule } from './modules/roles/roles.module';
import { ProductSamplesModule } from './modules/product_samples/product_samples.module';
import { ProductLinesModule } from './modules/product_lines/product_lines.module';
import { ProductTypesModule } from './modules/product_types/product_types.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderDetailsModule } from './modules/order_details/order_details.module';
import { UnitsModule } from './modules/units/units.module';
import { ParametersModule } from './modules/parameters/parameters.module';
import { BatchsModule } from './modules/batchs/batchs.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { SupplierProductsModule } from './modules/supplier_products/supplier_products.module';
import { InboundReceiptModule } from './modules/inbound_receipt/inbound_receipt.module';
import { User } from './modules/users/entities/user.entity';
import { Group } from './modules/groups/entities/group.entity';
import { Batch } from './modules/batchs/entities/batch.entity';
import { InboundReceipt } from './modules/inbound_receipt/entities/inbound_receipt.entity';
import { OrderDetail } from './modules/order_details/entities/order_detail.entity';
import { Order } from './modules/orders/entities/order.entity';
import { Parameters } from './modules/parameters/entities/parameter.entity';
import { ProductLine } from './modules/product_lines/entities/product_line.entity';
import { ProductSample } from './modules/product_samples/entities/product_sample.entity';
import { ProductType } from './modules/product_types/entities/product_type.entity';
import { Role } from './modules/roles/entities/role.entity';
import { SupplierProduct } from './modules/supplier_products/entities/supplier_product.entity';
import { Supplier } from './modules/suppliers/entities/supplier.entity';
import { Unit } from './modules/units/entities/unit.entity';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.response.interceptor';
import { AllExceptionsFilter } from './filters/exceptions.filter';
import { ProductUnitsModule } from './modules/product_units/product_units.module';

@Module({
  imports: [
    UsersModule,
    GroupsModule,
    RolesModule,
    ProductSamplesModule,
    ProductLinesModule,
    ProductTypesModule,
    OrdersModule,
    OrderDetailsModule,
    UnitsModule,
    ParametersModule,
    BatchsModule,
    SuppliersModule,
    SupplierProductsModule,
    InboundReceiptModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'mysql-db',
      port: 3306,
      username: 'root',
      password: 'Admin@123',
      database: 'minimart',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Batch,
      Group,
      InboundReceipt,
      OrderDetail,
      Order,
      Parameters,
      ProductLine,
      ProductSample,
      ProductType,
      Role,
      SupplierProduct,
      Supplier,
      Unit,
      User,
    ]),
    ProductUnitsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
