import { describe, it, expect, beforeAll } from "vitest";
import { configure } from "@testing-library/react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as matchers from "@testing-library/jest-dom/matchers";
import App from "../../App.tsx";
import Navbar from "../../components/Navbar.tsx";
import { initializei18n } from "../../i18n/index.ts";

configure({ testIdAttribute: "data-test-id" });
expect.extend(matchers);

beforeAll(async () => {
  await initializei18n();
});

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

  it("Language switching works", async () => {
    const { getByTestId } = render(<Navbar />);

    const languageSwitch = getByTestId("languageSwitch") as HTMLButtonElement;
    expect(languageSwitch).toBeInTheDocument();

    const initialLanguage = document.documentElement.getAttribute("lang") || "en";
    await userEvent.click(languageSwitch);

    expect(document.documentElement).toHaveAttribute("lang", initialLanguage === "en" ? "fi" : "en");
  });

  it("Theme switching works", async () => {
    const { getByTestId } = render(<Navbar />);

    const themeSwitch = getByTestId("themeSwitch") as HTMLButtonElement;

    expect(themeSwitch).toBeInTheDocument();
    const theme = document.documentElement.getAttribute("data-theme");

    await userEvent.click(themeSwitch);
    expect(document.documentElement).toHaveAttribute("data-theme", theme === "light" ? "dark" : "light");
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
