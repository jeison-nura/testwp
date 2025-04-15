import {
  detectCardType,
  formatCardNumber,
  formatExpiry,
} from "../../../components/Payment/utils/cardUtils";

describe("Utilidades de tarjetas", () => {
  describe("detectCardType", () => {
    test("debe detectar tarjeta Visa correctamente", () => {
      expect(detectCardType("4111111111111111")).toBe("visa");
      expect(detectCardType("4242 4242 4242 4242")).toBe("visa");
    });

    test("debe detectar tarjeta Mastercard correctamente", () => {
      expect(detectCardType("5555555555554444")).toBe("mastercard");
      expect(detectCardType("5105 1051 0510 5100")).toBe("mastercard");
    });

    test("debe detectar tarjeta American Express correctamente", () => {
      expect(detectCardType("371449635398431")).toBe("amex");
      expect(detectCardType("3714 496353 98431")).toBe("amex");
    });

    test("debe detectar tarjeta Discover correctamente", () => {
      expect(detectCardType("6011111111111117")).toBe("discover");
      expect(detectCardType("6011 0000 0000 0004")).toBe("discover");
    });

    test('debe retornar "unknown" para números no reconocidos', () => {
      expect(detectCardType("9999999999999999")).toBe("unknown");
      expect(detectCardType("")).toBe("unknown");
    });
  });

  describe("formatCardNumber", () => {
    test("debe formatear correctamente números de tarjeta", () => {
      expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
      expect(formatCardNumber("5555555555554444")).toBe("5555 5555 5555 4444");
      expect(formatCardNumber("371449635398431")).toBe("3714 4963 5398 431");
    });

    test("debe eliminar caracteres no numéricos", () => {
      expect(formatCardNumber("4111-1111-1111-1111")).toBe(
        "4111 1111 1111 1111"
      );
      expect(formatCardNumber("5555 / 5555 / 5555 / 4444")).toBe(
        "5555 5555 5555 4444"
      );
    });

    test("debe manejar cadenas vacías", () => {
      expect(formatCardNumber("")).toBe("");
    });
  });

  describe("formatExpiry", () => {
    test("debe formatear correctamente fechas de expiración", () => {
      expect(formatExpiry("1224")).toBe("12/24");
      expect(formatExpiry("0525")).toBe("05/25");
    });

    test("debe manejar entradas parciales", () => {
      expect(formatExpiry("12")).toBe("12");
      expect(formatExpiry("1")).toBe("1");
    });

    test("debe eliminar caracteres no numéricos", () => {
      expect(formatExpiry("12/24")).toBe("12/24");
      expect(formatExpiry("05-25")).toBe("05/25");
    });

    test("debe manejar cadenas vacías", () => {
      expect(formatExpiry("")).toBe("");
    });
  });
});
