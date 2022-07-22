import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "esm",
  },
  external: ["react/jsx-runtime", "styled-components"],
  plugins: [
    typescript({
      typescript: require("typescript"),
    }),
  ],
};
