import React from "react";
import logo from "./logo.svg";
import "bulma/css/bulma.min.css";
import { useRoutes } from "react-router-dom";
import routes from "./routes";

function App() {
  const content = useRoutes(routes);

  return <div className="App">{content}</div>;
}

export default App;
