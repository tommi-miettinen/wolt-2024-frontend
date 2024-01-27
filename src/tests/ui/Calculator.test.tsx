import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import { getDeliveryFee } from "../../services/feeCalculationService";
import Calculator from "../../components/Calculator";

expect.extend(matchers);

describe("Fee calculation", () => {
  it("Renders the inputs correctly and allows them to be changed", () => {
    const { getByTestId } = render(<Calculator />);

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
    const { getByTestId } = render(<Calculator />);

    const cartValueInput = getByTestId("cartValue");
    const itemCountInput = getByTestId("numberOfItems");
    const distanceInput = getByTestId("deliveryDistance");

    fireEvent.change(cartValueInput, { target: { value: "50" } });
    fireEvent.change(itemCountInput, { target: { value: "5" } });
    fireEvent.change(distanceInput, { target: { value: "1000" } });

    const fee = getDeliveryFee({ distance: 1000, cartValue: 50, itemCount: 5 });
    const feeNode = getByTestId("fee");

    expect(fee).toBe(2.5);
    expect(feeNode).toHaveTextContent(fee!.toString());
  });

  it("Is keyboard accessible", async () => {
    const { getByTestId } = render(<Calculator />);

    const calculator = getByTestId("calculator");
    const cartValueInput = getByTestId("cartValue");
    const itemCountInput = getByTestId("numberOfItems");
    const distanceInput = getByTestId("deliveryDistance");

    calculator.focus();
    expect(calculator).toHaveFocus();

    await userEvent.tab();
    expect(cartValueInput).toHaveFocus();
    await userEvent.type(cartValueInput, "50");

    await userEvent.tab();
    expect(itemCountInput).toHaveFocus();
    await userEvent.type(itemCountInput, "5");

    await userEvent.tab();
    expect(distanceInput).toHaveFocus();
    await userEvent.type(distanceInput, "1000");

    const fee = getDeliveryFee({ distance: 1000, cartValue: 50, itemCount: 5 });
    const feeNode = getByTestId("fee");

    expect(fee).toBe(2.5);
    expect(feeNode).toHaveTextContent(fee.toString());
  });
});
