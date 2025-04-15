import { render, screen, fireEvent } from "@testing-library/react";
import InstallmentSelector from "../../../components/Payment/InstallmentSelector";

describe("InstallmentSelector Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test("debe renderizar correctamente con valor por defecto", () => {
    render(<InstallmentSelector value={1} onChange={mockOnChange} />);

    expect(screen.getByLabelText("Número de cuotas")).toBeInTheDocument();
    expect(screen.getByText("1 cuota (Pago único)")).toBeInTheDocument();
  });

  test("debe mostrar mensaje de error cuando se proporciona", () => {
    const errorMessage = "Este campo es requerido";
    render(
      <InstallmentSelector
        value={1}
        onChange={mockOnChange}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("debe estar deshabilitado cuando disabled es true", () => {
    render(
      <InstallmentSelector value={1} onChange={mockOnChange} disabled={true} />
    );

    expect(screen.getByLabelText("Número de cuotas")).toBeDisabled();
  });

  test("debe limitar las opciones según maxInstallments", () => {
    const maxInstallments = 3;
    render(
      <InstallmentSelector
        value={1}
        onChange={mockOnChange}
        maxInstallments={maxInstallments}
      />
    );

    // Abrir el menú desplegable
    fireEvent.mouseDown(screen.getByLabelText("Número de cuotas"));

    // Verificar que solo existan las opciones esperadas
    expect(screen.getByText("1 cuota (Pago único)")).toBeInTheDocument();
    expect(screen.getByText("2 cuotas")).toBeInTheDocument();
    expect(screen.getByText("3 cuotas")).toBeInTheDocument();
    expect(screen.queryByText("4 cuotas")).not.toBeInTheDocument();
  });

  test("debe llamar a onChange con el valor correcto cuando se selecciona una opción", () => {
    render(<InstallmentSelector value={1} onChange={mockOnChange} />);

    // Abrir el menú desplegable
    fireEvent.mouseDown(screen.getByLabelText("Número de cuotas"));

    // Seleccionar la opción de 3 cuotas
    fireEvent.click(screen.getByText("3 cuotas"));

    // Verificar que se haya llamado a onChange con el valor correcto
    expect(mockOnChange).toHaveBeenCalledWith(3);
  });
});
