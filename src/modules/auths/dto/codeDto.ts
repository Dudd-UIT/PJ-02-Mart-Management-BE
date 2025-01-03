import { IsNotEmpty } from 'class-validator';

export class CodeDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  code: string;
}
