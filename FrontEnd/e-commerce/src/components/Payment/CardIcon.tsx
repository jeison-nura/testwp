import React from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import { CardType } from "../../types/payment.types";

interface CardIconProps {
  cardType: CardType;
  className?: string;
}

const CardIcon: React.FC<CardIconProps> = ({ cardType, className = "" }) => {
  // Estilos base para todos los iconos de tarjeta
  const baseStyles = `inline-flex items-center justify-center rounded px-2 py-1 text-xs font-bold mr-2 ${className}`;

  switch (cardType) {
    case "visa":
      return (
        <div
          data-testid="card-icon-visa"
          className={`${baseStyles} bg-blue-900 text-white`}
        >
          VISA
        </div>
      );
    case "mastercard":
      return (
        <div
          data-testid="card-icon-mastercard"
          className={`${baseStyles} bg-red-600 text-white`}
        >
          MC
        </div>
      );
    case "amex":
      return (
        <div
          data-testid="card-icon-amex"
          className={`${baseStyles} bg-blue-500 text-white`}
        >
          AMEX
        </div>
      );
    case "discover":
      return (
        <div
          data-testid="card-icon-discover"
          className={`${baseStyles} bg-orange-500 text-white`}
        >
          DISC
        </div>
      );
    default:
      return (
        <CreditCardIcon
          data-testid="card-icon-unknown"
          className={`h-5 w-5 text-gray-400 ${className}`}
        />
      );
  }
};

export default CardIcon;
