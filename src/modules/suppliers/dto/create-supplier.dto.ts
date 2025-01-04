import { Optional } from '@nestjs/common';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được bỏ trống' })
  @IsString({ message: 'Tên nhà cung cấp phải là chuỗi ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Số điện thoại không được bỏ trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone: string;

  @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống' })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  address: string;

  @IsNotEmpty({ message: 'Quốc gia không được bỏ trống' })
  @IsString({ message: 'Quốc gia phải là chuỗi ký tự' })
  country: string;

  @Optional()
  @IsArray()
  productUnitIds: number[];
}
