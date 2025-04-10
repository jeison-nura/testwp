import { IsEnum, IsString, IsOptional, IsUUID } from 'class-validator';
import { Status } from 'src/domain/transactions/status.enum';
import { EntityManager } from 'typeorm';

export class UpdateTransactionStatusDto {

  @IsEnum(Status, { message: 'Status must be APPROVED, CANCELED, or REJECTED' })
  status: Status;

  @IsOptional()
  entityManager?: EntityManager;
}