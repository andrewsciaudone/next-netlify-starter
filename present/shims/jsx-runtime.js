// Automatic JSX runtime on top of the React UMD global.
import React from "react";

export const Fragment = React.Fragment;
export function jsx(type, props, key) {
  return React.createElement(type, key === undefined ? props : { ...props, key });
}
export const jsxs = jsx;
