import { IsArray, IsInt } from 'class-validator';

export class FindProductUnitsByIdsDto {
  @IsArray()
  @IsInt({ each: true })
  ids?: number[];
}
