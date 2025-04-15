import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentForm from "../../../components/Payment/PaymentForm";

// Mock de los tokens de aceptación para las pruebas
const mockAcceptanceTokens = {
  endUserAcceptanceToken: "test-user-token",
  endUserTermsUrl: "https://example.com/terms",
  endUserTermsType: "POS",
  personalDataAcceptanceToken: "test-data-token",
  personalDataTermsUrl: "https://example.com/privacy",
  personalDataTermsType: "POS",
  acceptanceToken: "test-acceptance-token",
  termsAndConditionsUrl: "https://example.com/conditions",
};

describe("PaymentForm Component", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test("debe renderizar el formulario correctamente", () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={null}
        acceptanceTokens={mockAcceptanceTokens}
      />
    );

    // Verificar que los campos principales estén presentes
    expect(screen.getByPlaceholderText("Nombre completo")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Correo electrónico")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Número de identificación")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Número de tarjeta")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MM/YY")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("CVC")).toBeInTheDocument();

    // Verificar que el selector de cuotas esté presente
    expect(screen.getByLabelText("Número de cuotas")).toBeInTheDocument();

    // Verificar que los checkboxes de términos estén presentes
    expect(
      screen.getByText(/Acepto los términos y condiciones/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Acepto la política de privacidad/i)
    ).toBeInTheDocument();
  });

  test("debe mostrar errores de validación cuando se envía el formulario vacío", async () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={null}
        acceptanceTokens={mockAcceptanceTokens}
      />
    );

    // Enviar el formulario sin completar campos
    fireEvent.click(screen.getByText("Pagar"));

    // Verificar que aparezcan mensajes de error
    await waitFor(() => {
      expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument();
      expect(
        screen.getByText("El correo electrónico es obligatorio")
      ).toBeInTheDocument();
      expect(
        screen.getByText("La identificación es obligatoria")
      ).toBeInTheDocument();
      expect(
        screen.getByText("El número de tarjeta es obligatorio")
      ).toBeInTheDocument();
      expect(
        screen.getByText("La fecha de expiración es obligatoria")
      ).toBeInTheDocument();
      expect(
        screen.getByText("El código de seguridad es obligatorio")
      ).toBeInTheDocument();
    });

    // Verificar que no se haya llamado a onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test("debe llamar a onSubmit con los datos correctos cuando el formulario es válido", async () => {
    const user = userEvent.setup();

    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={null}
        acceptanceTokens={mockAcceptanceTokens}
      />
    );

    // Completar el formulario
    await user.type(
      screen.getByPlaceholderText("Nombre completo"),
      "Juan Pérez"
    );
    await user.type(
      screen.getByPlaceholderText("Correo electrónico"),
      "juan@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Número de identificación"),
      "12345678"
    );
    await user.type(
      screen.getByPlaceholderText("Número de teléfono"),
      "3001234567"
    );
    await user.type(screen.getByPlaceholderText("Dirección"), "Calle 123");
    await user.type(screen.getByPlaceholderText("Ciudad"), "Bogotá");
    await user.type(
      screen.getByPlaceholderText("Departamento/Estado"),
      "Cundinamarca"
    );
    await user.type(screen.getByPlaceholderText("Código postal"), "110111");

    // Completar datos de tarjeta
    await user.type(
      screen.getByPlaceholderText("Número de tarjeta"),
      "4242 4242 4242 4242"
    );
    await user.type(screen.getByPlaceholderText("MM/YY"), "12/25");
    await user.type(screen.getByPlaceholderText("CVC"), "123");

    // Seleccionar número de cuotas
    await user.selectOptions(screen.getByLabelText("Número de cuotas"), "1");

    // Aceptar términos
    await user.click(
      screen.getByLabelText(/Acepto los términos y condiciones/i)
    );
    await user.click(
      screen.getByLabelText(/Acepto la política de privacidad/i)
    );

    // Enviar formulario
    await user.click(screen.getByText("Pagar"));

    // Verificar que se haya llamado a onSubmit con los datos correctos
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Juan Pérez",
          email: "juan@example.com",
          identification: "12345678",
          cardNumber: "4242 4242 4242 4242",
          cardExpiry: "12/25",
          cardCVC: "123",
          cardType: "visa",
          installments: 1,
          acceptTerms: true,
          acceptPrivacy: true,
        })
      );
    });
  });

  test("debe mostrar el indicador de carga cuando isLoading es true", () => {
    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={true}
        error={null}
        acceptanceTokens={mockAcceptanceTokens}
      />
    );

    // Verificar que el botón de pago muestre el indicador de carga
    expect(screen.getByText("Procesando...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Procesando/i })).toBeDisabled();
  });

  test("debe mostrar mensaje de error cuando se proporciona", () => {
    const errorMessage = "Error en el procesamiento del pago";

    render(
      <PaymentForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        error={errorMessage}
        acceptanceTokens={mockAcceptanceTokens}
      />
    );

    // Verificar que se muestre el mensaje de error
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
