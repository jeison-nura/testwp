import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { UpdateTransactionStatusUseCase } from 'src/application/use-cases/update-transaction-status.use-case';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';
import { ProductEntity } from 'src/domain/entities/product.entity';
import { Status } from 'src/domain/transactions/status.enum';
import { UpdateTransactionStatusDto } from 'src/application/dtos/update-transaction-status.dto';

describe('UpdateTransactionStatusUseCase', () => {
  let useCase: UpdateTransactionStatusUseCase;
  let entityManager: EntityManager;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    // Create mocks for the EntityManager and QueryBuilder
    mockQueryBuilder = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const mockEntityManager = {
      transaction: jest.fn((callback) => callback(mockEntityManager)),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTransactionStatusUseCase,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTransactionStatusUseCase>(UpdateTransactionStatusUseCase);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update transaction status to APPROVED', async () => {
      // Arrange
      const transactionId = 'test-transaction-id';
      const dto: UpdateTransactionStatusDto = {
        status: Status.APPROVED,
      };

      const mockTransaction = new TransactionEntity();
      mockTransaction.id = transactionId;
      mockTransaction.status = Status.PENDING;
      mockTransaction.quantity = 1;

      const mockSession = new PaymentSessionEntity();
      mockSession.id = 'test-session-id';
      mockSession.productId = 'test-product-id';
      mockSession.isUsed = false;

      // Setup mock query results
      mockQueryBuilder.getOne
        .mockResolvedValueOnce(mockTransaction) // First call returns transaction
        .mockResolvedValueOnce(mockSession);    // Second call returns session

      // Act
      const result = await useCase.execute(transactionId, dto);

      // Assert
      expect(result.isOk()).toBe(true);
      expect(entityManager.createQueryBuilder).toHaveBeenCalledWith(TransactionEntity, 'transaction');
      expect(mockQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('transaction.id = :id', { id: transactionId });
      
      // Check transaction updates
      const savedTransaction = result.getValue();
      expect(savedTransaction.status).toBe(Status.APPROVED);
      expect(savedTransaction.updatedAt).toBeDefined();
      
      // Check session was marked as used
      expect(entityManager.save).toHaveBeenCalledWith(expect.objectContaining({
        id: mockSession.id,
        isUsed: true
      }));
    });

    it('should update transaction status to CANCELED and restore product stock', async () => {
      // Arrange
      const transactionId = 'test-transaction-id';
      const dto: UpdateTransactionStatusDto = {
        status: Status.CANCELED,
      };

      const mockTransaction = new TransactionEntity();
      mockTransaction.id = transactionId;
      mockTransaction.status = Status.PENDING;
      mockTransaction.quantity = 2;
      mockTransaction.sessionId = 'test-session-id';

      const mockSession = new PaymentSessionEntity();
      mockSession.id = 'test-session-id';
      mockSession.productId = 'test-product-id';
      mockSession.isUsed = false;

      const mockProduct = new ProductEntity();
      mockProduct.id = 'test-product-id';
      mockProduct.quantity = 10;

      // Setup mock query results
      mockQueryBuilder.getOne
        .mockResolvedValueOnce(mockTransaction) // First call returns transaction
        .mockResolvedValueOnce(mockSession)     // Second call returns session
        .mockResolvedValueOnce(mockProduct);    // Third call returns product

      // Act
      const result = await useCase.execute(transactionId, dto);

      // Assert
      expect(result.isOk()).toBe(true);
      
      // Check transaction updates
      const savedTransaction = result.getValue();
      expect(savedTransaction.status).toBe(Status.CANCELED);
      
      // Check product stock was restored
      expect(entityManager.save).toHaveBeenCalledWith(expect.objectContaining({
        id: mockProduct.id,
        quantity: 12 // 10 + 2
      }));
      
      // Check session was marked as used
      expect(entityManager.save).toHaveBeenCalledWith(expect.objectContaining({
        id: mockSession.id,
        isUsed: true
      }));
    });

    it('should return error if transaction is not found', async () => {
      // Arrange
      const transactionId = 'non-existent-id';
      const dto: UpdateTransactionStatusDto = {
        status: Status.APPROVED,
      };

      // Setup mock query results
      mockQueryBuilder.getOne.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(transactionId, dto);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.getError().message).toBe('Transaction not found');
    });

    it('should return error if transaction is already in a final state', async () => {
      // Arrange
      const transactionId = 'test-transaction-id';
      const dto: UpdateTransactionStatusDto = {
        status: Status.APPROVED,
      };

      const mockTransaction = new TransactionEntity();
      mockTransaction.id = transactionId;
      mockTransaction.status = Status.CANCELED; // Already in a final state

      // Setup mock query results
      mockQueryBuilder.getOne.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(transactionId, dto);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.getError().message).toContain('Transaction is already in CANCELED state');
    });

    it('should return error if status is not a final state', async () => {
      // Arrange
      const transactionId = 'test-transaction-id';
      const dto: UpdateTransactionStatusDto = {
        status: Status.PENDING, // Not a final state
      };

      // Act
      const result = await useCase.execute(transactionId, dto);

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.getError().message).toContain('Transaction status must be a final state');
    });
  });
});