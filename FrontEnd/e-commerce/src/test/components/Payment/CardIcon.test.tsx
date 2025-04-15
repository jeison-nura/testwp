import React from "react";
import { render, screen } from "@testing-library/react";
import CardIcon from "../../../components/Payment/CardIcon";

describe("CardIcon Component", () => {
  test("debe renderizar el icono de Visa correctamente", () => {
    render(<CardIcon cardType="visa" />);
    const visaIcon = screen.getByTestId("card-icon-visa");
    expect(visaIcon).toBeInTheDocument();
  });

  test("debe renderizar el icono de Mastercard correctamente", () => {
    render(<CardIcon cardType="mastercard" />);
    const mastercardIcon = screen.getByTestId("card-icon-mastercard");
    expect(mastercardIcon).toBeInTheDocument();
  });

  test("debe renderizar el icono de American Express correctamente", () => {
    render(<CardIcon cardType="amex" />);
    const amexIcon = screen.getByTestId("card-icon-amex");
    expect(amexIcon).toBeInTheDocument();
  });

  test("debe renderizar el icono de Discover correctamente", () => {
    render(<CardIcon cardType="discover" />);
    const discoverIcon = screen.getByTestId("card-icon-discover");
    expect(discoverIcon).toBeInTheDocument();
  });

  test("debe renderizar el icono genérico para tipo desconocido", () => {
    render(<CardIcon cardType="unknown" />);
    const unknownIcon = screen.getByTestId("card-icon-unknown");
    expect(unknownIcon).toBeInTheDocument();
  });

  test("debe aplicar clases personalizadas cuando se proporcionan", () => {
    render(<CardIcon cardType="visa" className="custom-class" />);
    const visaIcon = screen.getByTestId("card-icon-visa");
    expect(visaIcon).toHaveClass("custom-class");
  });
});
