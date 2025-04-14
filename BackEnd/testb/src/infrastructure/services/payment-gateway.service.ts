import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentConfig } from 'src/application/interfaces/payment-config.interface';
import { MerchantAcceptanceTokens, MerchantResponse } from '../interfaces/merchant-acceptance-tokens.interface';
import { CreatePaymentRequest } from 'src/application/interfaces/payment-request.interface';
import { Result } from 'src/common/result';
import { TransactionData, TransactionResponse } from 'src/application/interfaces/transaction-response.interface';

@Injectable()
export class PaymentGatewayService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('PAYMENT_GATEWAY_API_URL', '');
  }

  async getMerchantAcceptanceTokens(): Promise<Result<MerchantAcceptanceTokens, Error>> {
    try {
      const merchantPublicKey = this.configService.get('PUBLIC_KEY', '');
      
      const response = await firstValueFrom(
        this.httpService.get<MerchantResponse>(`${this.apiUrl}/merchants/${merchantPublicKey}`)
      );

      // Extract acceptance tokens from the response
      const { data } = response.data;
      
      const tokens = {
        // End user policy acceptance
        endUserAcceptanceToken: data.presigned_acceptance?.acceptance_token || '',
        endUserTermsUrl: data.presigned_acceptance?.permalink || '',
        endUserTermsType: data.presigned_acceptance?.type || '',
        
        // Personal data authorization
        personalDataAcceptanceToken: data.presigned_personal_data_auth?.acceptance_token || '',
        personalDataTermsUrl: data.presigned_personal_data_auth?.permalink || '',
        personalDataTermsType: data.presigned_personal_data_auth?.type || '',
        
        // For backward compatibility
        acceptanceToken: data.presigned_acceptance?.acceptance_token || '',
        termsAndConditionsUrl: data.presigned_acceptance?.permalink || ''
      };
      
      return Result.ok(tokens);
    } catch (error) {
      console.error('Error fetching merchant acceptance tokens:', error.response?.data || error.message);
      return Result.err(new Error('Failed to fetch merchant acceptance tokens'));
    }
  }

  async getTransactionStatus(transactionId: string): Promise<Result<TransactionData, Error>> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.configService.get('PAYMENT_GATEWAY_PRIVATE_KEY')}`,
      };

      const response = await firstValueFrom(
        this.httpService.get<TransactionResponse>(`${this.apiUrl}/transactions/${transactionId}`, { headers })
      );

      return Result.ok(response.data.data);
    } catch (error) {
      console.error('Error getting transaction status:', error.response?.data || error.message);
      return Result.err(new Error('Failed to get transaction status'));
    }
  }

  async createPayment(paymentRequest: CreatePaymentRequest): Promise<Result<TransactionData, Error>> {
    try {
      // The acceptance_token must be provided by the client as it represents user consent
      if (!paymentRequest.acceptance_token) {
        return Result.err(new Error('Acceptance token is required and must be provided by the client'));
      }

      const headers = {
        'Authorization': `Bearer ${this.configService.get('PUBLIC_KEY')}`,
        'Content-Type': 'application/json',
      };

      const response = await firstValueFrom(
        this.httpService.post<TransactionResponse>(
          `${this.apiUrl}/transactions`, 
          paymentRequest, 
          { headers }
        )
      );

      return Result.ok(response.data.data);
    } catch (error) {
      console.error('Error creating payment:', error.response?.data || error.message);
      
      // Handle structured validation errors from the payment gateway
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        
        if (apiError.type === 'INPUT_VALIDATION_ERROR' && apiError.messages) {
          // Extract validation error messages
          const errorMessages = Object.entries(apiError.messages)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          
          return Result.err(new Error(`Validation error: ${errorMessages}`));
        }
        
        return Result.err(new Error(`${apiError.type}: ${apiError.message || 'Unknown error'}`));
      }
      
      return Result.err(
        new Error(`Failed to create payment: ${error.message}`)
      );
    }
  }
}