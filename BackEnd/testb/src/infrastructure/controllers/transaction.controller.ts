import { Controller, Post, Body, Param, UseGuards, UsePipes, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { PaymentTokenGuard } from '../guards/payment-token.guard';
import { UpdateTransactionStatusDto } from 'src/application/dtos/update-transaction-status.dto';

@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly updateTransactionStatusUseCase: UpdateTransactionStatusUseCase,
  ) {}

  @Post(':transactionId/status')
  @UseGuards(PaymentTokenGuard)
  @UsePipes(new ValidationPipe())
  async updateTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Body() updateTransactionStatusDto: UpdateTransactionStatusDto,
  ) {
    const result = await this.updateTransactionStatusUseCase.execute(
      transactionId,
      updateTransactionStatusDto,
    );
  
    if (result.isErr()) {
      // Check for specific error conditions and return appropriate status codes
      const error = result.getError();
      if (error.message.includes('already in') && error.message.includes('state')) {
        // This is a conflict error - the resource is in an incompatible state
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else if (error.message.includes('not found')) {
        // Resource not found
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        // For other validation errors, use BAD_REQUEST
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  
    return result.getValue();
  }
}