import React from "react";

function Headers() {
  return (
    <div className="navbar mt-2 min-h-12 glass rounded-3xl bg-primary">
      <div className="navbar-start">
        <a className="btn py-0 btn-primary text-xl">daisyUI</a>
      </div>

      <div className="navbar-end">
        <a className="btn px-6 glass">Login</a>
      </div>
    </div>
  );
}

export default Headers;
