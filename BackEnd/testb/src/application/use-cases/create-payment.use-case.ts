import { Injectable } from '@nestjs/common';
import { Result } from 'src/common/result';
import { PaymentGatewayService } from 'src/infrastructure/services/payment-gateway.service';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { TransactionData } from '../interfaces/transaction-response.interface';
import { PaymentSignatureService } from 'src/domain/services/payment-signature.service';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from 'src/domain/entities/transaction.entity';
import { PaymentSessionEntity } from 'src/domain/entities/payment-session.entity';

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly paymentSignatureService: PaymentSignatureService,
    private readonly entityManager: EntityManager,
  ) {}

  async execute(paymentRequest: CreatePaymentDto): Promise<Result<TransactionData, Error>> {
    try {
     
      const signatureParams = {
        reference: paymentRequest.reference,
        amountInCents: paymentRequest.amount_in_cents,
        currency: paymentRequest.currency,
        expirationDate: paymentRequest.expiration_time
      };

      // Generate the signature
      const signatureResult = await this.paymentSignatureService.generateSignature(signatureParams);
      
      if (signatureResult.isErr()) {
        return Result.err(signatureResult.getError());
      }
      
      const integrityString = signatureResult.getValue();
      
      // Create a new object that matches the CreatePaymentRequest interface
      const paymentRequestWithSignature = {
        ...paymentRequest,
        signature: integrityString // Ensure signature is always a string
      };

      // Call the payment gateway service to create the payment
      const paymentResult = await this.paymentGatewayService.createPayment(paymentRequestWithSignature);
      
      if (paymentResult.isErr()) {
        return Result.err(paymentResult.getError());
      }
      
      // Update transaction and payment session if payment was successful
      const paymentData = paymentResult.getValue();
      
      if (paymentData) {
        await this.entityManager.transaction(async (transactionalEntityManager) => {
          // Find the transaction by reference
          const transaction = await transactionalEntityManager.findOne(TransactionEntity, {
            where: { 
              paymentSession: { 
                sessionToken: paymentRequest.reference 
              } 
            },
            relations: ['paymentSession']
          });
          
          if (transaction) {
            // Update transaction with payment gateway data
            transaction.paymentTransactionId = paymentData.id;
            transaction.paymentMethod = paymentData.payment_method_type;
            transaction.expDate = paymentData.created_at;
            
            // Save the updated transaction
            await transactionalEntityManager.save(transaction);
            
            // Update payment session
            if (transaction.paymentSession) {
              const session = transaction.paymentSession;
              session.isUsed = true;
              await transactionalEntityManager.save(session);
            }
          }
        });
      }
      
      return Result.ok(paymentResult.getValue());
    } catch (error) {
      return Result.err(
        error instanceof Error 
          ? error 
          : new Error(`Failed to create payment: ${error}`)
      );
    }
  }
}