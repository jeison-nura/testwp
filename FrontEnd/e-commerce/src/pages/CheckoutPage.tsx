import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";

const steps = ["Información de envío", "Método de pago", "Confirmación"];

const CheckoutPage: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState(false);
  const navigate = useNavigate();

  // Datos de ejemplo para la página de checkout
  const sampleItems = [
    { id: '1', name: 'Producto de ejemplo 1', price: 29.99, quantity: 2 },
    { id: '2', name: 'Producto de ejemplo 2', price: 49.99, quantity: 1 },
  ];

  const [items, setItems] = React.useState(sampleItems);

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      setItems(items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      setCompleted(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGoToHome = () => {
    navigate("/");
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="mt-4">
            <h6 className="text-lg font-medium mb-2">Información de envío</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  required
                  id="firstName"
                  name="firstName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="given-name"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  required
                  id="lastName"
                  name="lastName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="family-name"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                  required
                  id="address1"
                  name="address1"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="shipping address-line1"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                <input
                  required
                  id="city"
                  name="city"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="shipping address-level2"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                <input
                  required
                  id="zip"
                  name="zip"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="shipping postal-code"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  required
                  id="phone"
                  name="phone"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="mt-4">
            <h6 className="text-lg font-medium mb-2">Método de pago</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-1">
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta *</label>
                <input
                  required
                  id="cardName"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="cc-name"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta *</label>
                <input
                  required
                  id="cardNumber"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="cc-number"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="expDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración *</label>
                <input
                  required
                  id="expDate"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="cc-exp"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                <input
                  required
                  id="cvv"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#08d9d6] focus:border-transparent"
                  autoComplete="cc-csc"
                />
                <p className="text-xs text-gray-500 mt-1">Últimos tres dígitos en la franja de firma</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mt-4">
            <h6 className="text-lg font-medium mb-2">Resumen del pedido</h6>
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <div className="flex items-center mt-1">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={`w-6 h-6 flex items-center justify-center rounded-l ${item.quantity <= 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        -
                      </button>
                      <span className="w-8 h-6 flex items-center justify-center bg-white border-y border-gray-200 text-sm">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-r bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        +
                      </button>
                      <span className="ml-2 text-sm text-gray-500">x ${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
              <li className="py-3 flex justify-between">
                <p className="font-bold">Total</p>
                <p className="font-bold">
                  ${calculateTotal().toFixed(2)}
                </p>
              </li>
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <h6 className="text-lg font-medium mt-2 mb-2">Envío</h6>
                <p className="mb-1">John Doe</p>
                <p className="mb-1">Calle Principal 123, Ciudad</p>
              </div>
              <div>
                <h6 className="text-lg font-medium mt-2 mb-2">Detalles de pago</h6>
                <p className="mb-1">Tarjeta terminada en 1234</p>
                <p className="mb-1">Expiración: 04/2024</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 my-6">
        {completed ? (
          <div className="text-center py-8">
            <h5 className="text-xl font-medium mb-2">¡Gracias por tu compra!</h5>
            <p className="text-gray-600 mb-4">
              Tu número de pedido es #2001539. Hemos enviado un correo
              electrónico con la confirmación de tu pedido y te enviaremos una
              actualización cuando tu pedido haya sido enviado.
            </p>
            <button
              onClick={handleGoToHome}
              className="mt-3 ml-1 bg-[#08d9d6] hover:bg-[#06c2c0] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md border-2 border-[#08d9d6]/30 ring-2 ring-[#08d9d6]/20 ring-offset-1"
            >
              Volver a la tienda
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center">Checkout</h1>
            <div className="pt-6 pb-8">
              <div className="flex items-center justify-between mb-8">
                {steps.map((label, index) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${index <= activeStep ? 'border-[#08d9d6] bg-[#08d9d6] text-white' : 'border-gray-300 text-gray-500'} mb-2`}>
                      {index + 1}
                    </div>
                    <div className={`text-sm ${index <= activeStep ? 'text-[#08d9d6] font-medium' : 'text-gray-500'}`}>{label}</div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block absolute left-0 w-full h-0.5 ${index < activeStep ? 'bg-[#08d9d6]' : 'bg-gray-200'}`} style={{ top: '25%', zIndex: -1 }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {renderStepContent(activeStep)}
            <div className="flex justify-end mt-6">
              {activeStep !== 0 && (
                <button 
                  onClick={handleBack} 
                  className="mr-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md ring-2 ring-gray-300/20 ring-offset-1"
                >
                  Atrás
                </button>
              )}
              <button 
                onClick={handleNext}
                className="bg-[#08d9d6] hover:bg-[#06c2c0] text-white font-medium py-2 px-4 rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1 active:translate-y-0 active:shadow-md border-2 border-[#08d9d6]/30 ring-2 ring-[#08d9d6]/20 ring-offset-1"
              >
                {activeStep === steps.length - 1 ? "Realizar pedido" : "Siguiente"}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
