import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ProductSample } from './modules/product_samples/entities/product_sample.entity';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(ProductSample)
    private productSampleRepository: Repository<ProductSample>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    console.log({
      P: process.env.PORT,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const result = await queryRunner.query(
        `SELECT COUNT(*) as count FROM product_sample;`,
      );

      console.log('Check du lieu', result);
      const count = parseInt(result[0].count, 10);

      if (count === 0) {
        console.log('result[0].count: ', count);
        console.log('Bang chua co du lieu tien hanh insert du lieu moi: ');
        const sql = readFileSync(join(__dirname, 'dump', 'dump.sql'), 'utf8');
        const statements = sql.split(';').filter((stmt) => stmt.trim() !== '');

        for (const statement of statements) {
          await queryRunner.query(statement);
        }
      }
    } catch (error) {
      console.error('Error executing seed SQL:', error);
    } finally {
      await queryRunner.release();
    }
  }
}
