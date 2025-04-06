import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  CardToken,
  CardTokenResponse,
} from '../interfaces/cardToken.interface';
import { firstValueFrom } from 'rxjs';
import { Result } from 'src/common/result';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly apiKey: string;
  private readonly publicKey: string;
  private readonly baseUrl: string;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('WOMPI_API_KEY', '');
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY', '');
    this.baseUrl = this.configService.get<string>(
      'WOMPI_API_URL',
      'https://sandbox.wompi.co/v1',
    );
  }

  async generateCardToken(
    cardData: CardToken,
  ): Promise<Result<CardTokenResponse, Error>> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ data: CardTokenResponse }>(
          `${this.baseUrl}/tokens/cards`,
          {
            number: cardData.cardNumber,
            cvc: cardData.cvv,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year,
            card_holder: cardData.cardHolder,
          },
          {
            headers: {
              Authorization: `Bearer ${this.publicKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      if (
        !response ||
        !response.data ||
        response.data.data.status !== 'CREATED'
      ) {
        return Result.err(new Error('Failed to generate card token'));
      }

      if (!response.data.data || !response.data.data.data.id) {
        return Result.err(
          new Error('Invalid response format from card token API'),
        );
      }
      return Result.ok(response.data.data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && axios.isAxiosError(error)) {
        const errorMessage = String(
          error.response?.data ?? 'Failed to generate card token',
        );
        return Result.err(new Error(errorMessage));
      }
      return Result.err(new Error('Failed to generate card token'));
    }
  }
  async processPayment(paymentData: any): Promise<Result<any, Error>> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{
          data: any;
        }>(`${this.baseUrl}/transactions`, paymentData, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      if (!response || !response.data || !response.data.data) {
        return Result.err(new Error('Invalid response from payment API'));
      }

      return Result.ok(response.data.data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && axios.isAxiosError(error)) {
        const errorMessage = String(
          error.response?.data ?? 'Failed to process payment',
        );
        return Result.err(new Error(errorMessage));
      }
      return Result.err(new Error('Failed to process payment'));
    }
  }

  getSecretKey(): string {
    return this.configService.get<string>('WOMPI_SECRET_KEY', '');
  }
}
