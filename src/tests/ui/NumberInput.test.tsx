import { describe, it, expect } from "vitest";
import { configure, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import NumberInput from "../../components/NumberInput.tsx";

configure({ testIdAttribute: "data-test-id" });
expect.extend(matchers);

describe("NumberInput", () => {
  it("Respects Min and Max values", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="minmax"
        decimalPlaces={2}
        minValue={0}
        maxValue={2000.01}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("minmax");

    await userEvent.type(inp, "30");
    expect(inp).toHaveValue("30");
    expect(value).toBe(30);

    await userEvent.clear(inp);

    //the minus cant be typed in the input on min value >= 0
    await userEvent.type(inp, "-50");
    expect(inp).toHaveValue("50");
    expect(value).toBe(50);

    await userEvent.clear(inp);
    await userEvent.type(inp, "2000.01");
    expect(inp).toHaveValue("2000.01");
    expect(value).toBe(2000.01);

    await userEvent.clear(inp);
    await userEvent.type(inp, "2000.02");
    expect(inp).toHaveValue("2000.0");
    expect(value).toBe(2000.0);

    await userEvent.clear(inp);
    await userEvent.type(inp, "2001");
    expect(inp).toHaveValue("200");
    expect(value).toBe(200);

    await userEvent.clear(inp);
    await userEvent.type(inp, "2000");
    expect(inp).toHaveValue("2000");
    expect(value).toBe(2000);

    await userEvent.clear(inp);
    await userEvent.type(inp, "20000");
    expect(inp).toHaveValue("2000");
    expect(value).toBe(2000);
  });

  it("Copy pasting invalid values doesnt change the input", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="copy"
        decimalPlaces={2}
        minValue={0}
        maxValue={2000.01}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("copy");
    inp.focus();
    await userEvent.paste("abc");
    expect(inp).toHaveValue("");
    expect(value).toBe(0);

    await userEvent.paste("-100");
    expect(inp).toHaveValue("");
  });

  it("copy pasting valid values changes the input", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="copy"
        decimalPlaces={2}
        minValue={0}
        maxValue={2000.01}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("copy");
    inp.focus();
    await userEvent.paste("100");
    expect(inp).toHaveValue("100");
    expect(value).toBe(100);

    await userEvent.clear(inp);
    await userEvent.paste("100.1");
    expect(inp).toHaveValue("100.1");
  });

  it("Handles integer input correctly.", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        decimalPlaces={0}
        maxValue={2000}
        minValue={0}
        data-test-id="integer"
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("integer");

    await userEvent.type(inp, "30");
    expect(inp).toHaveValue("30");
    expect(value).toBe(30);
  });

  it("Handles float input correctly.", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="decimal"
        maxValue={2000}
        decimalPlaces={2}
        minValue={0}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("decimal");
    await userEvent.type(inp, "30.5");
    expect(inp).toHaveValue("30.5");
    expect(value).toBe(30.5);
  });

  it("Respects the decimal places", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="decimal"
        maxValue={2000}
        decimalPlaces={3}
        minValue={0}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("decimal");
    await userEvent.type(inp, "3.333");
    expect(inp).toHaveValue("3.333");
    expect(value).toBe(3.333);
  });

  it("Clearing the input sets the value to 0", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="clear"
        maxValue={2000}
        minValue={0}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("clear");
    await userEvent.type(inp, "30");
    expect(inp).toHaveValue("30");
    expect(value).toBe(30);

    await userEvent.clear(inp);
    expect(inp).toHaveValue("");
    expect(value).toBe(0);
  });

  it("Doesnt allow non numeric characters", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        data-test-id="nonnumeric"
        maxValue={2000}
        minValue={0}
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("nonnumeric");
    await userEvent.type(inp, "abc");
    expect(inp).toHaveValue("");
    expect(value).toBe(0);
  });

  it("onChange calls only when number is complete, intermediary state is visible to the user (doesnt call when 1. but calls when 1.1)", async () => {
    let value = 0;
    const { getByTestId } = render(
      <NumberInput
        maxValue={2000}
        minValue={0}
        decimalPlaces={2}
        data-test-id="cb"
        onChange={(val) => {
          value = val;
        }}
      />
    );
    const inp = getByTestId("cb");
    await userEvent.type(inp, "1.");
    expect(inp).toHaveValue("1.");
    expect(value).toBe(1);

    await userEvent.clear(inp);
    await userEvent.type(inp, "1.1");
    expect(inp).toHaveValue("1.1");
    expect(value).toBe(1.1);
  });
});
