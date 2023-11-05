import ReactDOM from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App";
//import Rating from "./Rating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <Rating color="blue" maxRating={3} messages={["bad", "good", "perfect"]} />
    <Rating color="red" maxRating={10} size={30} /> */}
    <App />
  </React.StrictMode>
);
