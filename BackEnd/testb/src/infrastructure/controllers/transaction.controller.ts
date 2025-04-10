import { Controller, Post, Body, Param, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
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
    @Body() updateStatusDto: UpdateTransactionStatusDto
  ) {
    const result = await this.updateTransactionStatusUseCase.execute(
      transactionId,
      updateStatusDto
    );

    if (result.isErr()) {
      throw new Error(result.getError().message);
    }

    return result.getValue();
  }
}