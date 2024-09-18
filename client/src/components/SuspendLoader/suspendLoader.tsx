import React, { useEffect } from "react";
import NProgress from "nprogress";

function SuspendLoader() {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <div className="has-text-centered is-flex is-justify-content-center is-align-items-center is-full-height">
      <div className="loader-container">
        <progress
          className="progress is-large is-primary"
          max="100"
          value="50"
        />
      </div>
    </div>
  );
}

export default SuspendLoader;
