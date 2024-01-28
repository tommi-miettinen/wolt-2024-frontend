import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import App from "../../App.tsx";

expect.extend(matchers);

describe("App", () => {
  it("Skip link works", async () => {
    const { getByTestId } = render(<App />);

    const skipLink = getByTestId("skipLink");
    const main = document.querySelector("main") as HTMLElement;

    await userEvent.tab();
    expect(skipLink).toHaveFocus();

    main.focus();
    expect(main).toHaveFocus();
  });
});
