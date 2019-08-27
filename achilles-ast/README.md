# achilles-ast
WASM version of Rust AST parser

## Prerequisites
- Download and install [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

## Install dependencies
```$ npm i```

## Run
Debug mode: 

```$ npm start```

Production mode:

```$ npm run build```

Testing:

```$ npm test -- --chrome```


Rust code goes into `src/lib.rs`. Method decorated with `#[wasm_bindgen]` are automatically exported in the generated file `pkg/index.js`. Call them from `js/index.js`.
