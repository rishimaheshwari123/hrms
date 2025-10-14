import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
            <BrowserRouter>

    <Provider store={store}>
      <HelmetProvider>
        <App />
        <ToastContainer />
      </HelmetProvider>
    </Provider>
            </BrowserRouter>

  </StrictMode>
);
