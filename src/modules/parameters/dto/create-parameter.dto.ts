import { IsNotEmpty } from 'class-validator';

export class CreateParameterDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  value: number;
}
