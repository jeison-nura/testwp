// Tipos de tarjetas soportadas
export type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

// Función para detectar el tipo de tarjeta basado en el número
export const detectCardType = (cardNumber: string): CardType => {
  const cleanNumber = cardNumber.replace(/\s+/g, '');
  
  // Patrones para detectar el tipo de tarjeta
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/
  };
  
  if (patterns.visa.test(cleanNumber)) return 'visa';
  if (patterns.mastercard.test(cleanNumber)) return 'mastercard';
  if (patterns.amex.test(cleanNumber)) return 'amex';
  if (patterns.discover.test(cleanNumber)) return 'discover';
  
  return 'unknown';
};

// Función para formatear el número de tarjeta
export const formatCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\D+/g, '');
  const groups = [];
  
  for (let i = 0; i < cleanValue.length; i += 4) {
    groups.push(cleanValue.slice(i, i + 4));
  }
  
  return groups.join(' ');
};

// Función para formatear la fecha de expiración
export const formatExpiry = (value: string): string => {
  const cleanValue = value.replace(/\D+/g, '');
  
  if (cleanValue.length <= 2) {
    return cleanValue;
  }
  
  return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
};

// Función para validar el número de tarjeta usando el algoritmo de Luhn
export const validateCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D+/g, '').split('').map(Number).reverse();
  
  let sum = 0;
  let alt = false;
  
  for (let i = 0; i < digits.length; i++) {
    let digit = digits[i];
    
    if (alt) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    alt = !alt;
  }
  
  return sum % 10 === 0;
};

// Función para validar la fecha de expiración
export const validateExpiry = (expiry: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return false;
  }
  
  const [month, year] = expiry.split('/').map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  return true;
};

// Función para validar el código CVC
export const validateCVC = (cvc: string, cardType: CardType): boolean => {
  const cvcLength = cardType === 'amex' ? 4 : 3;
  return cvc.length === cvcLength && /^\d+$/.test(cvc);
};

// Obtener el nombre de la tarjeta para mostrar
export const getCardDisplayName = (cardType: CardType): string => {
  switch (cardType) {
    case 'visa': return 'Visa';
    case 'mastercard': return 'Mastercard';
    case 'amex': return 'American Express';
    case 'discover': return 'Discover';
    default: return 'Tarjeta';
  }
};