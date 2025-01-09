import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateRoleGroupDto {
  @IsNotEmpty()
  @IsArray()
  roleIds: number[];
}
