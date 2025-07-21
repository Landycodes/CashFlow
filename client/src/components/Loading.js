import React, { useEffect, useState } from "react";

const Loading = ({ message }) => {
  const [render, setRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRender(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (render) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ marginTop: "20vh" }}
      >
        <div className="d-flex flex-row align-items-center justify-content-between bg-light bg-gradient p-3 rounded border border-primary">
          <h4>{message || "Loading..."}</h4>
          <div className="spinner-border text-primary ms-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default Loading;
