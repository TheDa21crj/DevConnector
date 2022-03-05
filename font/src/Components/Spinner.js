import React, { Fragment } from "react";
import spiner from "./../img/spinner.gif";

export default function Spinner() {
  return (
    <Fragment>
      <img
        src={spiner}
        style={{ width: "200px", margin: "auto", display: "block" }}
        alt="Loading..."
      />
    </Fragment>
  );
}
