import { useState, useEffect, ChangeEvent } from "react";

interface NumberInputProps {
  id?: string;
  name?: string;
  value?: number;
  onChange: (value: number) => void;
  className?: string;
}

const NumberInput = ({ id, name, value = 0, onChange, className, ...rest }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState<string>(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const regex = /^[0-9]*\.?[0-9]{0,2}$/;

    if (!regex.test(newValue) && newValue !== "") return;

    if (newValue === "") {
      setInputValue("0");
      onChange(0);
      return;
    }

    setInputValue(newValue);

    if (regex.test(newValue)) {
      onChange(parseFloat(newValue));
    }
  };

  return (
    <input
      {...rest}
      id={id}
      name={name}
      onClick={(e) => e.stopPropagation()}
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      className={className}
    />
  );
};

export default NumberInput;
