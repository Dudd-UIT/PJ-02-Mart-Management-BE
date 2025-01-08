import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformInterceptor } from './interceptors/transform.response.interceptor';
import { AllExceptionsFilter } from './filters/exceptions.filter';
import { JwtAuthGuard } from './modules/auths/passport/guards/jwt-auth.guard';
import { AuthsModule } from './modules/auths/auths.module';

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
import { ProductUnitsModule } from './modules/product_units/product_units.module';

import { User } from './modules/users/entities/user.entity';
import { Group } from './modules/groups/entities/group.entity';
import { Batch } from './modules/batchs/entities/batch.entity';
import { InboundReceipt } from './modules/inbound_receipt/entities/inbound_receipt.entity';
import { OrderDetail } from './modules/order_details/entities/order_detail.entity';
import { Order } from './modules/orders/entities/order.entity';
import { Parameter } from './modules/parameters/entities/parameter.entity';
import { ProductLine } from './modules/product_lines/entities/product_line.entity';
import { ProductSample } from './modules/product_samples/entities/product_sample.entity';
import { ProductType } from './modules/product_types/entities/product_type.entity';
import { Role } from './modules/roles/entities/role.entity';
import { SupplierProduct } from './modules/supplier_products/entities/supplier_product.entity';
import { Supplier } from './modules/suppliers/entities/supplier.entity';
import { Unit } from './modules/units/entities/unit.entity';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { UploadModule } from './modules/upload/upload.module';
import { StatisticModule } from './modules/statistic/statistic.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CartDetailsModule } from './modules/cart_details/cart_details.module';
import { CartsModule } from './modules/carts/carts.module';
import { Cart } from './modules/carts/entities/cart.entity';
import { CartDetail } from './modules/cart_details/entities/cart_detail.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Batch,
      Group,
      InboundReceipt,
      OrderDetail,
      Order,
      Parameter,
      ProductLine,
      ProductSample,
      ProductType,
      Role,
      SupplierProduct,
      Supplier,
      Unit,
      User,
      Cart,
      CartDetail
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: process.cwd() + '/src/mail/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'public'),
    // }),
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
    AuthsModule,
    ProductUnitsModule,
    UploadModule,
    StatisticModule,
    CartDetailsModule,
    CartsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
