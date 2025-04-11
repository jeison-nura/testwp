import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { CheckExpiredTransactionsUseCase } from '../../../src/application/use-cases/check-expired-transactions.use-case';
import { PaymentSessionEntity } from '../../../src/domain/entities/payment-session.entity';
import { TransactionEntity } from '../../../src/domain/entities/transaction.entity';
import { ProductEntity } from '../../../src/domain/entities/product.entity';
import { Status } from '../../../src/domain/transactions/status.enum';
import { Logger } from '@nestjs/common';

describe('CheckExpiredTransactionsUseCase', () => {
  let useCase: CheckExpiredTransactionsUseCase;
  let entityManager: EntityManager;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Create mocks for the EntityManager and QueryBuilder
    mockQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
    };

    const mockEntityManager = {
      transaction: jest.fn((callback) => callback(mockEntityManager)),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckExpiredTransactionsUseCase,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    // Mock logger to prevent console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    useCase = module.get<CheckExpiredTransactionsUseCase>(CheckExpiredTransactionsUseCase);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should find expired sessions with pending transactions', async () => {
      // Act
      await useCase.execute();
      
      // Assert
      expect(entityManager.transaction).toHaveBeenCalled();
      expect(entityManager.createQueryBuilder).toHaveBeenCalledWith(PaymentSessionEntity, 'session');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
        TransactionEntity,
        'transaction',
        'transaction.sessionId = session.id AND transaction.status = :status',
        { status: Status.PENDING }
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('session.expiresAt < :now', expect.any(Object));
    });

    it('should update expired transactions and restore product stock', async () => {
      // Arrange
      const mockExpiredSession = new PaymentSessionEntity();
      mockExpiredSession.id = 'session-id';
      mockExpiredSession.productId = 'product-id';
      
      const mockTransaction = new TransactionEntity();
      mockTransaction.id = 'transaction-id';
      mockTransaction.sessionId = 'session-id';
      mockTransaction.status = Status.PENDING;
      mockTransaction.quantity = 2;
      
      const mockProduct = new ProductEntity();
      mockProduct.id = 'product-id';
      mockProduct.quantity = 10; // Changed from quantity to stock
      
      // Setup mock query results
      mockQueryBuilder.getMany = jest.fn().mockResolvedValue([mockExpiredSession]);
      
      // We need to reset getOne for each call
      const getOneMock = jest.fn();
      getOneMock
        .mockResolvedValueOnce(mockTransaction) // First call returns transaction
        .mockResolvedValueOnce(mockProduct);    // Second call returns product
      mockQueryBuilder.getOne = getOneMock;
      
      // Act
      await useCase.execute();
      
      // Assert
      expect(entityManager.save).toHaveBeenCalled();
      
      // Get all the calls to save
      const saveCalls = (entityManager.save as jest.Mock).mock.calls;
      
      // Find the calls for each entity type
      const transactionCall = saveCalls.find(call => call[0] instanceof TransactionEntity);
      const sessionCall = saveCalls.find(call => call[0] instanceof PaymentSessionEntity);
      const productCall = saveCalls.find(call => call[0] instanceof ProductEntity);
      
      // Check that all entities were saved
      expect(transactionCall).toBeDefined();
      expect(sessionCall).toBeDefined();
      expect(productCall).toBeDefined();
      
      // Check transaction updates
      if (transactionCall) {
        const savedTransaction = transactionCall[0] as TransactionEntity;
        expect(savedTransaction.status).toBe(Status.CANCELED);
        expect(savedTransaction.errorMessage).toBe('Payment session expired');
      }
      
      // Check session updates
      if (sessionCall) {
        const savedSession = sessionCall[0] as PaymentSessionEntity;
        expect(savedSession.isUsed).toBe(true);
      }
      
      // Check product updates
      if (productCall) {
        const savedProduct = productCall[0] as ProductEntity;
        expect(savedProduct.quantity).toBe(12); // 10 + 2
      }
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      const error = new Error('Test error');
      jest.spyOn(entityManager, 'transaction').mockRejectedValue(error);
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');
      
      // Act
      await useCase.execute();
      
      // Assert
      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });
});