// jest-dom.d.ts
import "@testing-library/jest-dom/extend-expect";

declare global {
  namespace Vi {
    interface JestAssertion extends jest.Matchers<void, any> {}
  }
}
