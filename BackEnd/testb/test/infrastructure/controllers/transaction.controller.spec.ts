import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from 'src/infrastructure/controllers/transaction.controller';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { UpdateTransactionStatusDto } from 'src/application/dtos/update-transaction-status.dto';
import { Status } from 'src/domain/transactions/status.enum';
import { Result } from 'src/common/result';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PaymentTokenGuard } from 'src/infrastructure/guards/payment-token.guard';

describe('TransactionController', () => {
  let controller: TransactionController;
  let updateTransactionStatusUseCase: UpdateTransactionStatusUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: UpdateTransactionStatusUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PaymentTokenGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    updateTransactionStatusUseCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      // Arrange
      const transactionId = 'test-transaction-id';
      const updateDto: UpdateTransactionStatusDto = {
        status: Status.APPROVED,
      };

      const mockTransaction = new TransactionEntity();
      mockTransaction.id = transactionId;
      mockTransaction.status = Status.APPROVED;
      mockTransaction.updatedAt = new Date();

      jest.spyOn(updateTransactionStatusUseCase, 'execute').mockResolvedValue(Result.ok(mockTransaction));

      // Act
      const result = await controller.updateTransactionStatus(transactionId, updateDto);

      // Assert
      expect(updateTransactionStatusUseCase.execute).toHaveBeenCalledWith(transactionId, updateDto);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw HttpException when update transaction status fails', async () => {
      // Arrange
      const transactionId = 'test-transaction-id';
      const updateDto: UpdateTransactionStatusDto = {
        status: Status.APPROVED,
      };

      jest.spyOn(updateTransactionStatusUseCase, 'execute').mockResolvedValue(
        Result.err(new Error('Transaction is already in CANCELED state'))
      );

      // Act & Assert
      await expect(controller.updateTransactionStatus(transactionId, updateDto)).rejects.toThrow(
        new HttpException('Transaction is already in CANCELED state', HttpStatus.BAD_REQUEST)
      );
    });
  });
});