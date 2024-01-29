import { describe, it, expect } from "vitest";
import { configure } from "@testing-library/react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import App from "../../App.tsx";

configure({ testIdAttribute: "data-test-id" });
expect.extend(matchers);

describe("App", () => {
  it("App renders correctly", () => {
    const { getByTestId } = render(<App />);

    const calculator = getByTestId("calculator");
    const main = document.querySelector("main") as HTMLElement;
    const navbar = getByTestId("navbar");
    const skipLink = getByTestId("skipLink");

    expect(navbar).toBeInTheDocument();
    expect(calculator).toBeInTheDocument();
    expect(skipLink).toBeInTheDocument();
    expect(main).toBeInTheDocument();
  });

  it("Skip link works", async () => {
    const { getByTestId } = render(<App />);

    const skipLink = getByTestId("skipLink");
    const main = document.querySelector("main") as HTMLElement;

    await userEvent.tab();
    expect(skipLink).toHaveFocus();

    await userEvent.keyboard("{enter}");
    expect(main).toHaveFocus();
  });
});
