import { useState, ChangeEvent } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  [key: string]: any;
}

const NumberInput = ({ value = 0, onChange, ...rest }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const regex = /^[0-9]*\.?[0-9]{0,2}$/;

    if (!regex.test(newValue) && newValue !== "") return;

    setInputValue(newValue);
    onChange(parseFloat(newValue));
  };

  return <input {...rest} type="text" value={inputValue} onChange={handleInputChange} />;
};

export default NumberInput;
