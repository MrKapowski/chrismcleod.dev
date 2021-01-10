const builtins = require('@erquhart/rollup-plugin-node-builtins');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const json = require('rollup-plugin-json');
import { terser } from "rollup-plugin-terser";

export default [{
  input: 'src/admin/util',
  output: {
    file: 'dist/admin/util.js',
    format: 'iife',
    name: 'previewUtil',
    plugins: [terser()],
  },
  plugins: [
    builtins(),
    nodeResolve(),
    commonjs(),
    json(),
  ]
},{
  input: "src/main.js",
  output: [
    {
      file: "dist/js/min.js",
      format: "iife",
      sourcemap: true,
      plugins: [terser()],
    },
  ],
}];
