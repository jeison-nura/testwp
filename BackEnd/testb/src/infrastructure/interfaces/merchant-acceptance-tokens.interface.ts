export interface PresignedAcceptance {
  acceptance_token: string;
  permalink: string;
  type: string;
}

export interface MerchantData {
  presigned_acceptance?: PresignedAcceptance;
  presigned_personal_data_auth?: PresignedAcceptance;
}

export interface MerchantResponse {
  data: MerchantData;
}

export interface MerchantAcceptanceTokens {
  // End user policy acceptance
  endUserAcceptanceToken: string;
  endUserTermsUrl: string;
  endUserTermsType: string;
  
  // Personal data authorization
  personalDataAcceptanceToken: string;
  personalDataTermsUrl: string;
  personalDataTermsType: string;
  
  // For backward compatibility
  acceptanceToken: string;
  termsAndConditionsUrl: string;
}