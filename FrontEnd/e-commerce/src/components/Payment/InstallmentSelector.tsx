import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";

interface InstallmentSelectorProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  maxInstallments?: number;
}

// Estilos personalizados para el selector de cuotas
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#1F2937", // Fondo oscuro para mantener consistencia
    color: "#FFFFFF",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#08d9d6",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#08d9d6",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#9CA3AF",
    "&.Mui-focused": {
      color: "#08d9d6",
    },
  },
  "& .MuiSelect-icon": {
    color: "#9CA3AF",
  },
  "& .MuiFormHelperText-root": {
    color: "#EF4444",
  },
}));

const InstallmentSelector: React.FC<InstallmentSelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  maxInstallments = 36,
}) => {
  // Generar opciones de cuotas desde 1 hasta maxInstallments
  const installmentOptions = Array.from(
    { length: maxInstallments },
    (_, i) => i + 1
  );

  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(Number(event.target.value));
  };

  return (
    <StyledFormControl
      variant="outlined"
      error={!!error}
      disabled={disabled}
      data-testid="installment-selector"
    >
      <InputLabel id="installment-select-label">Número de cuotas</InputLabel>
      <Select
        labelId="installment-select-label"
        id="installment-select"
        value={value}
        onChange={handleChange}
        label="Número de cuotas"
        MenuProps={{
          PaperProps: {
            style: {
              backgroundColor: "#1F2937",
              color: "#FFFFFF",
              maxHeight: 300,
            },
          },
        }}
      >
        {installmentOptions.map((option) => (
          <MenuItem key={option} value={option}>
            {option === 1 ? "1 cuota (Pago único)" : `${option} cuotas`}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </StyledFormControl>
  );
};

export default InstallmentSelector;
