import React, { useState, useEffect } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import CardIcon from "./CardIcon";
import {
  AcceptanceTokensResponse,
  CardType,
  PaymentFormData,
} from "../../types/payment.types";

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  isLoading: boolean;
  error: string | null;
  acceptanceTokens: AcceptanceTokensResponse;
}

// Función para detectar el tipo de tarjeta basado en el número
const detectCardType = (cardNumber: string): CardType => {
  const cleanNumber = cardNumber.replace(/\s+/g, "");

  // Patrones para detectar el tipo de tarjeta
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };

  if (patterns.visa.test(cleanNumber)) return "visa";
  if (patterns.mastercard.test(cleanNumber)) return "mastercard";
  if (patterns.amex.test(cleanNumber)) return "amex";
  if (patterns.discover.test(cleanNumber)) return "discover";

  return "unknown";
};

// Función para formatear el número de tarjeta
const formatCardNumber = (value: string): string => {
  const cleanValue = value.replace(/\D+/g, "");
  const groups = [];

  for (let i = 0; i < cleanValue.length; i += 4) {
    groups.push(cleanValue.slice(i, i + 4));
  }

  return groups.join(" ");
};

// Función para formatear la fecha de expiración
const formatExpiry = (value: string): string => {
  const cleanValue = value.replace(/\D+/g, "");

  if (cleanValue.length <= 2) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  isLoading,
  error,
  acceptanceTokens,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    fullName: "",
    email: "",
    identification: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
    cardType: "unknown",
    phoneNumber: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    country: "CO",
    acceptTerms: false,
    acceptPrivacy: false,
    installments: 1,
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof PaymentFormData, string>>
  >({});
  // Estado para controlar la visibilidad de la información de cuotas
  const [showInstallmentInfo, setShowInstallmentInfo] =
    useState<boolean>(false);
  // Ya no necesitamos el estado local ni el useEffect para obtener los términos
  // porque ahora los recibimos como prop desde el PaymentModal

  // Actualizar el tipo de tarjeta cuando cambia el número
  useEffect(() => {
    if (formData.cardNumber.length >= 4) {
      setFormData((prev) => ({
        ...prev,
        cardType: detectCardType(prev.cardNumber),
      }));
    }
  }, [formData.cardNumber]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    // Procesadores específicos para cada tipo de campo
    const fieldProcessors: Record<string, (val: string) => any> = {
      cardNumber: formatCardNumber,
      cardExpiry: formatExpiry,
      cardCVC: (val) => val.replace(/\D+/g, "").slice(0, 4),
      installments: (val) => parseInt(val, 10),
    };

    let formattedValue: string = value;

    // Si es un campo con procesamiento especial
    if (name in fieldProcessors) {
      const processedValue = fieldProcessors[name](value);

      // Caso especial para installments que necesita ser convertido a número
      if (name === "installments") {
        setFormData((prev) => ({ ...prev, [name]: processedValue }));
        // Limpiar error si existe
        if (formErrors[name as keyof PaymentFormData]) {
          setFormErrors((prev) => ({ ...prev, [name]: "" }));
        }
        return;
      }

      formattedValue = processedValue;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue,
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[name as keyof PaymentFormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PaymentFormData, string>> = {};

    // Validar nombre completo
    if (!formData.fullName.trim()) {
      errors.fullName = "El nombre es obligatorio";
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Ingrese un correo electrónico válido";
    }

    // Validar identificación
    if (!formData.identification.trim()) {
      errors.identification = "La identificación es obligatoria";
    }

    // Validar teléfono
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "El número de teléfono es obligatorio";
    }

    // Validar dirección
    if (!formData.address.trim()) {
      errors.address = "La dirección es obligatoria";
    }

    // Validar ciudad
    if (!formData.city.trim()) {
      errors.city = "La ciudad es obligatoria";
    }

    // Validar región/estado
    if (!formData.region.trim()) {
      errors.region = "El departamento/estado es obligatorio";
    }

    // Validar código postal
    if (!formData.postalCode.trim()) {
      errors.postalCode = "El código postal es obligatorio";
    }

    // Validar número de tarjeta
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = "El número de tarjeta es obligatorio";
    } else if (formData.cardNumber.replace(/\s+/g, "").length < 15) {
      errors.cardNumber = "Número de tarjeta inválido";
    }

    // Validar fecha de expiración
    if (!formData.cardExpiry.trim()) {
      errors.cardExpiry = "La fecha de expiración es obligatoria";
    } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      errors.cardExpiry = "Formato inválido (MM/YY)";
    } else {
      const [month, year] = formData.cardExpiry.split("/");
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.cardExpiry = "Mes inválido";
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        errors.cardExpiry = "La tarjeta ha expirado";
      }
    }

    // Validar CVC
    if (!formData.cardCVC.trim()) {
      errors.cardCVC = "El código de seguridad es obligatorio";
    } else if (
      (formData.cardType === "amex" && formData.cardCVC.length !== 4) ||
      (formData.cardType !== "amex" && formData.cardCVC.length !== 3)
    ) {
      errors.cardCVC = `El CVC debe tener ${
        formData.cardType === "amex" ? "4" : "3"
      } dígitos`;
    }

    // Validar aceptación de términos y condiciones
    if (!formData.acceptTerms) {
      errors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    // Validar aceptación de política de privacidad
    if (!formData.acceptPrivacy) {
      errors.acceptPrivacy = "Debes aceptar la política de privacidad";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Renderizar el icono de la tarjeta según el tipo detectado
  const renderCardIcon = () => {
    return <CardIcon cardType={formData.cardType} />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900 text-white rounded-md">{error}</div>
      )}

      {/* Información personal */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nombre completo"
            className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
            required
          />
        </div>
        {formErrors.fullName && (
          <p className="text-red-500 text-sm">{formErrors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo electrónico"
            className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
            required
          />
        </div>
        {formErrors.email && (
          <p className="text-red-500 text-sm">{formErrors.email}</p>
        )}
      </div>

      {/* Identificación */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IdentificationIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
            placeholder="Número de identificación"
            className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
            required
          />
        </div>
        {formErrors.identification && (
          <p className="text-red-500 text-sm">{formErrors.identification}</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Número de teléfono"
            className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
            required
          />
        </div>
        {formErrors.phoneNumber && (
          <p className="text-red-500 text-sm">{formErrors.phoneNumber}</p>
        )}
      </div>

      {/* Dirección */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-[#08d9d6] mb-1">
          Dirección de envío
        </h3>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Dirección (Calle, Número, Apto)"
              className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
              required
            />
          </div>
          {formErrors.address && (
            <p className="text-red-500 text-sm">{formErrors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ciudad"
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
              required
            />
            {formErrors.city && (
              <p className="text-red-500 text-sm">{formErrors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Departamento/Estado"
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
              required
            />
            {formErrors.region && (
              <p className="text-red-500 text-sm">{formErrors.region}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Código Postal"
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
              required
            />
            {formErrors.postalCode && (
              <p className="text-red-500 text-sm">{formErrors.postalCode}</p>
            )}
          </div>

          <div className="space-y-2">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#08d9d6]"
              required
            >
              <option value="CO">Colombia</option>
              <option value="US">Estados Unidos</option>
              <option value="MX">México</option>
              <option value="AR">Argentina</option>
              <option value="CL">Chile</option>
              <option value="PE">Perú</option>
            </select>
            {formErrors.country && (
              <p className="text-red-500 text-sm">{formErrors.country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Datos de la tarjeta */}
      <div className="pt-2 border-t border-gray-700">
        <h3 className="text-md font-medium text-[#08d9d6] mb-3">
          Información de pago
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          Ingresa los datos de tu tarjeta y selecciona el número de cuotas para
          tu compra.
        </p>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="cardNumber"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Número de tarjeta
            </label>
            <div className="relative">
              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                style={{ minWidth: "40px" }}
              >
                {renderCardIcon()}
              </div>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                className="bg-[#16213e] text-white block w-full pl-16 pr-3 py-2 rounded-md focus:ring-[#08d9d6] focus:border-[#08d9d6] border border-gray-700"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            {formErrors.cardNumber && (
              <p className="mt-1 text-sm text-red-400">
                {formErrors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="cardExpiry"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Fecha de expiración
              </label>
              <input
                type="text"
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleChange}
                className="bg-[#16213e] text-white block w-full px-3 py-2 rounded-md focus:ring-[#08d9d6] focus:border-[#08d9d6] border border-gray-700"
                placeholder="MM/YY"
                maxLength={5}
              />
              {formErrors.cardExpiry && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.cardExpiry}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cardCVC"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Código de seguridad
              </label>
              <input
                type="text"
                id="cardCVC"
                name="cardCVC"
                value={formData.cardCVC}
                onChange={handleChange}
                className="bg-[#16213e] text-white block w-full px-3 py-2 rounded-md focus:ring-[#08d9d6] focus:border-[#08d9d6] border border-gray-700"
                placeholder={
                  formData.cardType === "amex" ? "4 dígitos" : "3 dígitos"
                }
                maxLength={formData.cardType === "amex" ? 4 : 3}
              />
              {formErrors.cardCVC && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.cardCVC}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="installments"
                className="block text-sm font-medium text-gray-300"
              >
                Número de cuotas
              </label>
              <button
                type="button"
                onClick={() => setShowInstallmentInfo(!showInstallmentInfo)}
                className="text-xs text-[#08d9d6] hover:text-[#06b6b3] focus:outline-none"
              >
                {showInstallmentInfo
                  ? "Ocultar información"
                  : "Más información"}
              </button>
            </div>

            {showInstallmentInfo && (
              <div className="p-3 bg-gray-700 rounded-md mb-2 text-sm text-gray-200">
                <p>
                  Seleccione el número de cuotas en las que desea diferir su
                  pago. Recuerde que a mayor número de cuotas, mayor será el
                  interés aplicado por su entidad bancaria.
                </p>
              </div>
            )}

            <select
              id="installments"
              name="installments"
              value={formData.installments}
              onChange={handleChange}
              className="bg-[#16213e] text-white block w-full px-3 py-2 rounded-md focus:ring-[#08d9d6] focus:border-[#08d9d6] border border-[#08d9d6]"
            >
              <option value={1} className="text-black font-medium">
                1 cuota
              </option>
              <option value={2} className="text-black font-medium">
                2 cuotas
              </option>
              <option value={3} className="text-black font-medium">
                3 cuotas
              </option>
              <option value={6} className="text-black font-medium">
                6 cuotas
              </option>
              <option value={12} className="text-black font-medium">
                12 cuotas
              </option>
              <option value={18} className="text-black font-medium">
                18 cuotas
              </option>
              <option value={24} className="text-black font-medium">
                24 cuotas
              </option>
              <option value={36} className="text-black font-medium">
                36 cuotas
              </option>
            </select>
            {formErrors.installments && (
              <p className="mt-1 text-sm text-red-400">
                {formErrors.installments}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={
            isLoading || !formData.acceptTerms || !formData.acceptPrivacy
          }
          className="w-full bg-[#08d9d6] hover:bg-[#06b6b3] text-[#1a1a2e] font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-lg border-2 border-[#08d9d6] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? "Procesando..." : "Pagar ahora"}
        </button>
      </div>

      {/* Términos y condiciones */}
      <div className="pt-4 border-t border-gray-700">
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms || false}
                onChange={handleChange}
                className="h-4 w-4 text-[#08d9d6] focus:ring-[#08d9d6] border-gray-600 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-300">
                Acepto los{" "}
                <a
                  href={acceptanceTokens.termsAndConditionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#08d9d6] hover:underline"
                >
                  términos y condiciones
                </a>
              </label>
              {formErrors.acceptTerms && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.acceptTerms}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptPrivacy"
                name="acceptPrivacy"
                type="checkbox"
                checked={formData.acceptPrivacy || false}
                onChange={handleChange}
                className="h-4 w-4 text-[#08d9d6] focus:ring-[#08d9d6] border-gray-600 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptPrivacy" className="text-gray-300">
                Acepto la{" "}
                <a
                  href={acceptanceTokens.personalDataTermsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#08d9d6] hover:underline"
                >
                  política de privacidad
                </a>
              </label>
              {formErrors.acceptPrivacy && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.acceptPrivacy}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        <p>Tus datos están seguros y encriptados</p>
      </div>
    </form>
  );
};

export default PaymentForm;
