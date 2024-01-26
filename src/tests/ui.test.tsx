import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { calculateDeliveryFee } from "../services/feeCalculationService";
import App from "../App";

expect.extend(matchers);

describe("Fee calculation", () => {
  it("Renders the inputs correctly and allows them to be changed", () => {
    const { getByTestId } = render(<App />);

    const cartValueInput = getByTestId("cartValue");
    const itemCountInput = getByTestId("numberOfItems");
    const distanceInput = getByTestId("deliveryDistance");

    fireEvent.change(cartValueInput, { target: { value: "50" } });
    fireEvent.change(itemCountInput, { target: { value: "5" } });
    fireEvent.change(distanceInput, { target: { value: "1000" } });

    expect(cartValueInput).toHaveValue("50");
    expect(itemCountInput).toHaveValue("5");
    expect(distanceInput).toHaveValue("1000");
  });

  it("Displays the fee correctly", () => {
    const { getByTestId } = render(<App />);

    const cartValueInput = getByTestId("cartValue");
    const itemCountInput = getByTestId("numberOfItems");
    const distanceInput = getByTestId("deliveryDistance");

    fireEvent.change(cartValueInput, { target: { value: "50" } });
    fireEvent.change(itemCountInput, { target: { value: "5" } });
    fireEvent.change(distanceInput, { target: { value: "1000" } });

    const fee = calculateDeliveryFee(1000, 50, 5);
    const feeNode = getByTestId("fee");

    expect(feeNode).toHaveTextContent(fee.toString());
  });
});
