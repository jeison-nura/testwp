export interface CardToken {
  cardNumber: string;
  cardHolder: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

export interface CardTokenResponse {
  status: string;
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
    expires_at: string;
  };
}
