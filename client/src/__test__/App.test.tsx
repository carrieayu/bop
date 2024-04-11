import React from "react";
import { render } from "@testing-library/react";
import App from "../App";
import "@testing-library/jest-dom/jest-globals";
const { expect, describe, it } = require('@jest/globals');

jest.mock("react-router-dom", () => ({
  useRoutes: jest.fn(),
}));

describe("App component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it("renders content from routes", () => {
    const mockRoutes = <div>Mock Content</div>;
    require("react-router-dom").useRoutes.mockReturnValue(mockRoutes);
    const { getByText } = render(<App />);
    expect(getByText("Mock Content")).toBeInTheDocument();
  });
});
