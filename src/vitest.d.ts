import type { Assertion, AsymmetricMatchersContaining } from "vitest";
import type { Matchers } from "@testing-library/jest-dom";

declare module "vitest" {
  interface Assertion<T = any> extends Matchers<T> {}
  interface AsymmetricMatchersContaining extends Matchers {}
}
