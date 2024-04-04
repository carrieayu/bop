import React from "react";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../app/store";
import App from "../App";

describe("App component", () => {
  it("renders without crashing", () => {
    act(() => {
      render(
        <Provider store={store}>
          <HelmetProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </HelmetProvider>
        </Provider>
      );
    });
  });
});
