import { React, ReactDOM, html } from "./deps.js";

const App = (props) => {
    return html`<div>Hello World! foo: ${props.foo}</div>`;
}

ReactDOM.render(
    html`<${App} foo=${"bar"} />`,
    document.getElementById("root")
);