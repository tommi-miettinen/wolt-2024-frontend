import { describe, it, expect } from "vitest";
import { render, fireEvent, configure } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import { getDeliveryFee } from "../../services/feeCalculationService/internal";
import Calculator from "../../components/Calculator";

configure({ testIdAttribute: "data-test-id" });
expect.extend(matchers);

describe("Fee calculation", () => {
  it("Renders the inputs correctly and allows them to be changed", () => {
    const { getByTestId } = render(<Calculator />);

    const cartValueInput = getByTestId("cartValue") as HTMLInputElement;
    const itemCountInput = getByTestId("numberOfItems") as HTMLInputElement;
    const distanceInput = getByTestId("deliveryDistance") as HTMLInputElement;

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

    const fee = getDeliveryFee({ distance: 1000, cartValue: 50, itemCount: 5, date: new Date() });
    const feeNode = getByTestId("fee");

    expect(fee).toBe(2.5);
    expect(feeNode).toHaveTextContent(fee!.toString());
  });

  it("Inputs have correct types", () => {
    const { getByTestId } = render(<Calculator />);

    const cartValueInput = getByTestId("cartValue") as HTMLInputElement;
    const itemCountInput = getByTestId("numberOfItems") as HTMLInputElement;
    const distanceInput = getByTestId("deliveryDistance") as HTMLInputElement;

    fireEvent.change(cartValueInput, { target: { value: "1.50" } });
    fireEvent.change(itemCountInput, { target: { value: "5" } });
    fireEvent.change(distanceInput, { target: { value: "1000" } });

    expect(cartValueInput.value).toBe("1.50");
    expect(itemCountInput.value).toBe("5");
    expect(distanceInput.value).toBe("1000");

    //Integers
    fireEvent.change(itemCountInput, { target: { value: "5.4" } });
    fireEvent.change(distanceInput, { target: { value: "1000.5" } });
    expect(itemCountInput.value).toBe("5");
    expect(distanceInput.value).toBe("1000");

    //Floats
    fireEvent.change(cartValueInput, { target: { value: "1.50" } });
    expect(cartValueInput.value).toBe("1.50");
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

    const fee = getDeliveryFee({ distance: 1000, cartValue: 50, itemCount: 5, date: new Date() });
    const feeNode = getByTestId("fee");

    expect(fee).toBe(2.5);
    expect(feeNode).toHaveTextContent(fee.toString());
  });
});
