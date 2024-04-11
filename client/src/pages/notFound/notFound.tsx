import React from "react";

const NotFound = () => {
  return (
    <div
      className="is-flex is-justify-content-center is-align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="has-text-centered">
        <h1 className="is-size-1 has-text-weight-bold has-text-primary">404</h1>
        <p className="is-size-5 has-text-weight-medium">
          {" "}
          <span className="has-text-danger">Opps!</span> Page not found.
        </p>
        <p className="is-size-6 mb-2">
          The page you’re looking for doesn’t exist.
        </p>
        <a href="index.html" className="button is-primary">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
