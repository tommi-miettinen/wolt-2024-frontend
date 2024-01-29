import { useState, ChangeEvent } from "react";

interface NumberInputProps extends Omit<JSX.IntrinsicElements["input"], "onChange"> {
  onChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  decimalPlaces?: number;
}

const NumberInput = ({ onChange, maxValue, minValue, decimalPlaces = 0, ...rest }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const isInteger = decimalPlaces === 0;
  const regex = isInteger ? /^-?[0-9]*$/ : new RegExp(`^-?[0-9]*\\.?[0-9]{0,${decimalPlaces}}$`);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!regex.test(newValue)) return;
    if (newValue === "") {
      setInputValue("");
      onChange(0);
      return;
    }
    if (newValue[0] === ".") return;
    if (minValue >= 0 && newValue[0] === "-") return;
    if (parseFloat(newValue) > maxValue) return;
    if (parseFloat(newValue) < minValue) return;

    setInputValue(newValue);
    onChange(+parseFloat(newValue).toFixed(decimalPlaces));
  };

  return <input {...rest} type="text" value={inputValue} onChange={handleInputChange} />;
};

export default NumberInput;
