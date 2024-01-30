import { useState, ChangeEvent } from "react";
import { z } from "zod";

interface NumberInputProps extends Omit<JSX.IntrinsicElements["input"], "onChange"> {
  onChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  decimalPlaces?: number;
}

const createRegex = (decimalPlaces: number, isNegative: boolean) => {
  const decimalPart = decimalPlaces === 0 ? "" : `\\.?[0-9]{0,${decimalPlaces}}`;
  const negativePart = isNegative ? "-" : "";
  return new RegExp(`^${negativePart}[0-9]+${decimalPart}$`);
};

const NumberInput = ({ onChange, maxValue, minValue, decimalPlaces = 0, ...rest }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const regex = createRegex(decimalPlaces, minValue < 0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value === "") {
      setInputValue("");
      onChange(0);
      return;
    }

    if (!regex.test(value)) return;

    const validationResult = z.number().min(minValue).max(maxValue).safeParse(parseFloat(value));
    if (!validationResult.success) return;

    setInputValue(value);
    onChange(+parseFloat(value).toFixed(decimalPlaces));
  };

  return <input {...rest} autoComplete="off" type="text" value={inputValue} onChange={handleInputChange} />;
};

export default NumberInput;
