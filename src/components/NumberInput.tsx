import { useState, ChangeEvent } from "react";

type CustomInputElement = Omit<JSX.IntrinsicElements["input"], "onChange">;

interface NumberInputProps extends CustomInputElement {
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  isInteger?: boolean;
}

const NumberInput = ({ value = 0, onChange, isInteger, maxValue, minValue = 1, ...rest }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const regex = isInteger ? /^[0-9]*$/ : /^[0-9]*\.?[0-9]{0,2}$/;

    if (!regex.test(newValue) && newValue !== "") return;

    if (maxValue && parseFloat(newValue) > maxValue) return;

    if (minValue && parseFloat(newValue) < minValue) return;

    setInputValue(newValue);
    onChange(isInteger ? parseInt(newValue) : parseFloat(newValue));
  };

  return <input {...rest} type="text" value={inputValue} onChange={handleInputChange} />;
};

export default NumberInput;
