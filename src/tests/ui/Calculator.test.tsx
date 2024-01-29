import { describe, it, expect } from "vitest";
import { render, configure, fireEvent } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { getDeliveryFee } from "../../services/feeCalculationService/internal";
import Calculator from "../../components/Calculator";
import userEvent from "@testing-library/user-event";

configure({ testIdAttribute: "data-test-id" });
expect.extend(matchers);

const NOT_RUSH_HOUR = new Date("2021-01-01T12:00:00.000Z");

describe("Fee calculation", () => {
  it("Renders the inputs correctly and allows them to be changed", async () => {
    const { getByTestId } = render(<Calculator />);

    const cartValueInput = getByTestId("cartValue") as HTMLInputElement;
    const itemCountInput = getByTestId("numberOfItems") as HTMLInputElement;
    const distanceInput = getByTestId("deliveryDistance") as HTMLInputElement;

    await userEvent.type(cartValueInput, "50");
    await userEvent.type(itemCountInput, "5");
    await userEvent.type(distanceInput, "1000");

    expect(cartValueInput).toHaveValue("50");
    expect(itemCountInput).toHaveValue("5");
    expect(distanceInput).toHaveValue("1000");
  });

  it("Displays the fee correctly", async () => {
    const { getByTestId } = render(<Calculator />);

    const cartValueInput = getByTestId("cartValue");
    const itemCountInput = getByTestId("numberOfItems");
    const distanceInput = getByTestId("deliveryDistance");
    const orderTimeInput = getByTestId("orderTime");

    await userEvent.type(cartValueInput, "50");
    await userEvent.type(itemCountInput, "5");
    await userEvent.type(distanceInput, "1000");

    fireEvent.input(orderTimeInput, { target: { value: NOT_RUSH_HOUR.toISOString().slice(0, 16) } });
    const fee = getDeliveryFee({ distance: 1000, cartValue: 50, itemCount: 5, date: NOT_RUSH_HOUR });
    const feeNode = getByTestId("fee");

    expect(fee).toBe(2.5);
    expect(feeNode).toHaveTextContent(fee.toString());
  });

  it("Inputs have correct types", async () => {
    const { getByTestId } = render(<Calculator />);

    const cartValueInput = getByTestId("cartValue") as HTMLInputElement;
    const itemCountInput = getByTestId("numberOfItems") as HTMLInputElement;
    const distanceInput = getByTestId("deliveryDistance") as HTMLInputElement;

    await userEvent.type(cartValueInput, "50");
    await userEvent.type(itemCountInput, "5");
    await userEvent.type(distanceInput, "1000");

    expect(cartValueInput.value).toBe("50");
    expect(itemCountInput.value).toBe("5");
    expect(distanceInput.value).toBe("1000");

    await userEvent.clear(cartValueInput);
    await userEvent.clear(itemCountInput);
    await userEvent.clear(distanceInput);
    //Integers

    await userEvent.type(itemCountInput, "5.4");
    await userEvent.type(distanceInput, "1000.5");

    expect(itemCountInput.value).toBe("54");
    expect(distanceInput.value).toBe("10005");
    //Floats
    await userEvent.type(cartValueInput, "1.5");
    expect(cartValueInput.value).toBe("1.5");

    await userEvent.clear(cartValueInput);
    await userEvent.type(cartValueInput, "1.55");
    expect(cartValueInput.value).toBe("1.55");
  });

  it("Is keyboard accessible", async () => {
    const { getByTestId } = render(<Calculator />);

    const calculator = getByTestId("calculator");
    const cartValueInput = getByTestId("cartValue") as HTMLInputElement;
    const itemCountInput = getByTestId("numberOfItems") as HTMLInputElement;
    const distanceInput = getByTestId("deliveryDistance") as HTMLInputElement;

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

    expect(cartValueInput.value).toBe("50");
    expect(itemCountInput.value).toBe("5");
    expect(distanceInput.value).toBe("1000");
  });
});
