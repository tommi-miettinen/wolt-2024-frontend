import { useState, ChangeEvent } from "react";

interface NumberInputProps extends Omit<JSX.IntrinsicElements["input"], "onChange"> {
  onChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  decimalPlaces?: number;
  icon?: JSX.Element;
}

const NumberInput = ({ onChange, maxValue, minValue, decimalPlaces = 0, icon, ...rest }: NumberInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const regex = new RegExp(`^-?[0-9]*\\.?[0-9]{0,${decimalPlaces}}$`);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (!regex.test(newValue)) return;
    if (newValue === "") {
      setInputValue("");
      onChange(0);
      return;
    }
    if (newValue[0] === ".") return;
    if (decimalPlaces === 0 && newValue.includes(".")) return;
    if (minValue >= 0 && newValue.includes("-")) return;
    if (parseFloat(newValue) > maxValue) return;
    if (parseFloat(newValue) < minValue) return;

    setInputValue(newValue);
    onChange(+parseFloat(newValue).toFixed(decimalPlaces));
  };

  return (
    <div style={{ display: "flex", position: "relative", alignItems: "center" }}>
      <input {...rest} type="text" value={inputValue} onChange={handleInputChange} />
      {icon && <div style={{ position: "absolute", right: 8 }}>{icon}</div>}
    </div>
  );
};

export default NumberInput;
