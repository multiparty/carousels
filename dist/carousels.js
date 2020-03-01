(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.carousels = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports=[
  {
    "nodeType": "FunctionDefinition",
    "name": {
      "nodeType": "NameExpression",
      "name": "merge_sort_dedup"
    },
    "parameters": [
      {
        "nodeType": "VariableDefinition",
        "name": {
          "nodeType": "NameExpression",
          "name": "a"
        },
        "type": {
          "nodeType": "TypeNode",
          "secret": true,
          "type": "array"
        }
      }
    ],
    "returnType": {
      "nodeType": "TypeNode",
      "secret": true,
      "type": "array"
    },
    "body": [
      {
        "nodeType": "VariableDefinition",
        "name": {
          "nodeType": "NameExpression",
          "name": "n"
        },
        "type": {
          "nodeType": "TypeNode",
          "secret": false,
          "type": "number"
        }
      },
      {
        "nodeType": "VariableAssignment",
        "name": {
          "nodeType": "NameExpression",
          "name": "n"
        },
        "expression": {
          "nodeType": "FunctionCall",
          "function": {
            "nodeType": "DotExpression",
            "left": "a",
            "right": "len"
          },
          "parameters": []
        }
      },
      {
        "nodeType": "If",
        "condition": {
          "nodeType": "DirectExpression",
          "operator": ">",
          "arity": 2,
          "operands": [
            {
              "nodeType": "NameExpression",
              "name": "n"
            },
            {
              "nodeType": "LiteralExpression",
              "value": 1
            }
          ]
        },
        "ifBody": [
          {
            "nodeType": "VariableDefinition",
            "name": {
              "nodeType": "NameExpression",
              "name": "m"
            },
            "type": {
              "nodeType": "TypeNode",
              "secret": false,
              "type": "number"
            }
          },
          {
            "nodeType": "VariableAssignment",
            "name": {
              "nodeType": "NameExpression",
              "name": "m"
            },
            "expression": {
              "nodeType": "DirectExpression",
              "operator": "/",
              "arity": 2,
              "operands": [
                {
                  "nodeType": "NameExpression",
                  "name": "n"
                },
                {
                  "nodeType": "LiteralExpression",
                  "value": 2
                }
              ]
            }
          },
          {
            "nodeType": "FunctionCall",
            "function": {
              "nodeType": "NameExpression",
              "name": "merge_dedup"
            },
            "parameters": [
              {
                "nodeType": "FunctionCall",
                "function": {
                  "nodeType": "NameExpression",
                  "name": "merge_sort_dedup"
                },
                "parameters": [
                  {
                    "nodeType": "SliceExpression",
                    "array": {
                      "nodeType": "NameExpression",
                      "name": "a"
                    },
                    "range": {
                      "nodeType": "RangeExpression",
                      "start": {
                        "type": "LiteralExpression",
                        "value": 0
                      },
                      "end": {
                        "type": "NameExpression",
                        "name": "m"
                      }
                    }
                  }
                ]
              },
              {
                "nodeType": "FunctionCall",
                "function": {
                  "nodeType": "NameExpression",
                  "name": "merge_sort_dedup"
                },
                "parameters": [
                  {
                    "nodeType": "SliceExpression",
                    "array": {
                      "nodeType": "NameExpression",
                      "name": "a"
                    },
                    "range": {
                      "nodeType": "RangeExpression",
                      "start": {
                        "nodeType": "NameExpression",
                        "name": "m"
                      },
                      "end": {
                        "nodeType": "NameExpression",
                        "name": "n"
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        "elseBody": [
          {
            "nodeType": "FunctionCall",
            "function": {
              "nodeType": "DotExpression",
              "left": {
                "nodeType": "NameExpression",
                "name": "a"
              },
              "right": {
                "nodeType": "NameExpression",
                "name": "to_owned"
              }
            },
            "parameters": []
          }
        ]
      }
    ]
  },
  {
    "nodeType": "FunctionDefinition",
    "name": "merge_dedup",
    "parameters": [
      {
        "nodeType": "VariableDefinition",
        "name": "a",
        "type": {
          "nodeType": "TypeNode",
          "secret": true,
          "type": "array"
        }
      },
      {
        "nodeType": "VariableDefinition",
        "name": "b",
        "type": {
          "nodeType": "TypeNode",
          "secret": true,
          "type": "array"
        }
      }
    ],
    "returnType": {
      "nodeType": "TypeNode",
      "secret": true,
      "type": "array"
    },
    "body": [
    ]
  }
]

},{}],2:[function(require,module,exports){
(function() {
    const __exports = {};
    let wasm;

    /**
    * @returns {number}
    */
    __exports.test_wasm_now = function() {
        const ret = wasm.test_wasm_now();
        return ret >>> 0;
    };

    function init(module) {

        let result;
        const imports = {};

        if ((typeof URL === 'function' && module instanceof URL) || typeof module === 'string' || (typeof Request === 'function' && module instanceof Request)) {

            const response = fetch(module);
            if (typeof WebAssembly.instantiateStreaming === 'function') {
                result = WebAssembly.instantiateStreaming(response, imports)
                .catch(e => {
                    return response
                    .then(r => {
                        if (r.headers.get('Content-Type') != 'application/wasm') {
                            console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                            return r.arrayBuffer();
                        } else {
                            throw e;
                        }
                    })
                    .then(bytes => WebAssembly.instantiate(bytes, imports));
                });
            } else {
                result = response
                .then(r => r.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes, imports));
            }
        } else {

            result = WebAssembly.instantiate(module, imports)
            .then(result => {
                if (result instanceof WebAssembly.Instance) {
                    return { instance: result, module };
                } else {
                    return result;
                }
            });
        }
        return result.then(({instance, module}) => {
            wasm = instance.exports;
            init.__wbindgen_wasm_module = module;

            return wasm;
        });
    }

    self.wasm_bindgen = Object.assign(init, __exports);

})();

},{}],3:[function(require,module,exports){
// Generated Code
// will add wasm_bindgen to global scope
require('./index.js');

// remove wasm_bindgen from global scope, make it only accessible in this file
const wasm_bindgen = window.wasm_bindgen;
delete window['wasm_bindgen'];

const wasmBinary = (function (base64String) {
  var raw = window.atob(base64String);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
})('AGFzbQEAAAABBQFgAAF/AwIBAAUDAQARBxoCBm1lbW9yeQIADXRlc3Rfd2FzbV9ub3cAAAoGAQQAQQoLC04BAEGgiMAAC0UBAAAAAAAAAAEAAAACAAAAAwAAAAQAAAAFAAAABAAAAAQAAAAGAAAABwAAAAgAAAAJAAAAAAAAAAEAAAACAAAAAwAAAAQAewlwcm9kdWNlcnMCCGxhbmd1YWdlAQRSdXN0AAxwcm9jZXNzZWQtYnkDBXJ1c3RjHTEuNDEuMSAoZjNlMWE5NTRkIDIwMjAtMDItMjQpBndhbHJ1cwYwLjExLjAMd2FzbS1iaW5kZ2VuEjAuMi41MCAoNWM1NmMwMjM4KQ==');

const wasmModule = new WebAssembly.Module(wasmBinary);
const wasmPromise = wasm_bindgen(wasmModule);

module.exports = wasmPromise;
// End of Generated Code
},{"./index.js":2}],4:[function(require,module,exports){
// Module needs to be load dynamically (async) for WebAssembly to function
let WASMParser;

const WASMPromise = require('../dist/wasm.js');
WASMPromise.then(function (_WASMParser) {
  WASMParser = _WASMParser;
});

// Parsing Wrapper: preprocess code as a string to remove obliv keyword
const REPLACE_PATTERNS = [
  {
    pattern: new RegExp('else\\s+obliv\\s+if', 'g'),
    replace: 'else if'
  },
  {
    pattern: new RegExp('obliv\\s+if', 'g'),
    replace: 'let __obliv = !__obliv;\nif'
  }
];

const parseWrapper = function (code) {
  if (WASMParser == null) {
    throw new Error('WASM binaries did not finish loading asynchronously yet! please make sure WASMPromise is resolved first!');
  }

  for (let i = 0; i < REPLACE_PATTERNS.length; i++) {
    const pattern = REPLACE_PATTERNS[i].pattern;
    const replace = REPLACE_PATTERNS[i].replace;
    code = code.replace(pattern, replace);
  }

  return WASMParser.test_wasm_now(code);
};

module.exports = {
  promise: WASMPromise,
  parse: parseWrapper
};

},{"../dist/wasm.js":3}],5:[function(require,module,exports){
const parsers = require('../ir/parsers.js');
const typings = require('../typing/index.js');

const TypingRuleBook = require('./rules/typingRuleBook.js');
const CostRuleBook = require('./rules/costRuleBook.js');

const ScopedMap = require('./symbols/scopedMap.js');

const IRVisitor = require('../ir/visitor.js');
const visitorImplementations = [
  require('./visitors/array.js'),
  require('./visitors/expression.js'),
  require('./visitors/for.js'),
  require('./visitors/function.js'),
  require('./visitors/if.js'),
  require('./visitors/oblivIf.js'),
  require('./visitors/value.js'),
  require('./visitors/variable.js')
];

function Analyzer(language, code, costs, extraTyping) {
  this.language = language;
  this.code = code;

  // parse into IR
  const parser = parsers[this.language];
  this.IR = parser(this.code);

  // typing rules
  const typingRules = (extraTyping || []).concat(typings[this.language]);
  this.typings = new TypingRuleBook(typingRules);

  // costs parsing
  this.costs = new CostRuleBook(costs);

  // Scoped tables
  this.variableTypeMap = new ScopedMap();
  this.functionTypeMap = new ScopedMap();
  this.functionDependentTypeMap = new ScopedMap();
  this.functionMetricMap = new ScopedMap();
  this.functionSymbolEquationMap = new ScopedMap();

  // visitor pattern
  this.visitor = new IRVisitor(this);
  for (let i = 0; i < visitorImplementations.length; i++) {
    this.visitor.addVisitors(visitorImplementations[i]);
  }
}

Analyzer.prototype.analyze = function () {
  this.visitor.start(this.IR);
  return 'b*2';
};

module.exports = Analyzer;
},{"../ir/parsers.js":25,"../ir/visitor.js":28,"../typing/index.js":29,"./rules/costRuleBook.js":6,"./rules/typingRuleBook.js":9,"./symbols/scopedMap.js":10,"./visitors/array.js":12,"./visitors/expression.js":13,"./visitors/for.js":14,"./visitors/function.js":15,"./visitors/if.js":16,"./visitors/oblivIf.js":17,"./visitors/value.js":18,"./visitors/variable.js":19}],6:[function(require,module,exports){
const RuleBook = require('./ruleBook.js');

function CostRuleBook(rules) {
  RuleBook.call(this, rules.operations);
}

CostRuleBook.prototype.applyMatch = function (node, expressionTypeString, args, metrics) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return Object.assign({}, metrics);
  }

  const newMetrics = {};
  for (let metricTitle in metrics) {
    if (!Object.hasOwnProperty.call(metrics, metricTitle)) {
      continue;
    }

    newMetrics[metricTitle] = metrics[metricTitle].addCost(matchedValue);
  }

  return newMetrics;
};

// inherit RuleBook
CostRuleBook.prototype = Object.create(RuleBook.prototype);

module.exports = CostRuleBook;
},{"./ruleBook.js":8}],7:[function(require,module,exports){
const MACROS = {};
MACROS['@T'] = '(<.*>)'; // ANY TYPE
MACROS['@\'P'] = '(' + MACROS['@T'] + ',)*'; // ANY PARAMETERS FOLLOWED BY COMMA IF PARAMETERS EXISTS
MACROS['@,P'] = '(,' + MACROS['@T'] + ')*'; // ANY PARAMETERS PRECEDED BY COMMA IF PARAMETERS EXISTS
MACROS['@P'] = '(' + MACROS['@\'P'] + MACROS['@T'] + ')?'; // ANY PARAMETERS WITHOUT LEADING OR TRAILING COMMAS

function Rule(pattern, value) {
  this.pattern = pattern;
  this.value = value;

  this.parsePattern();
}

Rule.prototype.parsePattern = function () {
  for (let macro in MACROS) {
    if (!Object.prototype.hasOwnProperty.call(MACROS, macro)) {
      continue;
    }

    const find = new RegExp(macro, 'g');
    this.pattern = this.pattern.replace(find, MACROS[macro]);
  }

  this.pattern = new RegExp('^' + this.pattern + '$');
};

Rule.prototype.appliesTo = function (expressionTypeString) {
  return this.pattern.test(expressionTypeString);
};

module.exports = Rule;
},{}],8:[function(require,module,exports){
const Rule = require('./rule.js');

function RuleBook(rules) {
  this.rules = {};

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];

    const bookArray = this.rules[rule.nodeType] || [];
    this.rules[rule.rule.nodeType] = bookArray;

    bookArray.push(new Rule(rule.rule.match, rule.value));
  }
}

RuleBook.prototype.findMatch = function (node, expressionTypeString) {
  const rules = this.rules[node.nodeType] || [];
  for (let i = 0; i < rules.length; i++) {
    if (rules[i].appliesTo(expressionTypeString)) {
      return rules[i].value;
    }
  }

  return undefined;
};

module.exports = RuleBook;
},{"./rule.js":7}],9:[function(require,module,exports){
const RuleBook = require('./ruleBook.js');
const carouselTypes = require('../symbols/types.js');

const DEFAULT_TYPE = new carouselTypes.Type(carouselTypes.TYPE_ENUM.ANY, false);

function TypingRuleBook(rules) {
  RuleBook.call(this, rules);
}

TypingRuleBook.prototype.applyMatch = function (node, expressionTypeString, args, childrenTypes) {
  const matchedValue = this.findMatch(node, expressionTypeString);
  if (matchedValue === undefined) {
    return DEFAULT_TYPE;
  }

  return matchedValue(node, args, childrenTypes);
};

// inherit RuleBook
TypingRuleBook.prototype = Object.create(RuleBook.prototype);

module.exports = TypingRuleBook;
},{"../symbols/types.js":11,"./ruleBook.js":8}],10:[function(require,module,exports){
function ScopedMap() {
  this.scopes = [{}];
}
ScopedMap.prototype.addScope = function () {
  this.scopes.push({});
};
ScopedMap.prototype.removeScope = function () {
  this.scopes.pop();
};
ScopedMap.prototype.add = function (key, val) {
  const index = this.scopes.length - 1;
  this.scopes[index][name] = val;
};
ScopedMap.prototype.get = function (name) {
  for (let i = this.scopes.length - 1; i >= 0; i--) {
    const scope = this.scopes[i];
    const val = scope[name];
    if (val != null) {
      return val;
    }
  }

  return undefined;
};

module.exports = ScopedMap;
},{}],11:[function(require,module,exports){
const Enum = require('../../utils/enum.js');

// Enum containing supported types
const TYPE_ENUM = new Enum('TYPE_ENUM', 'NUMBER', 'ARRAY', 'BOOLEAN', 'STRING', 'ANY');

// Type abstraction
function Type(dataType, secret, dependentType) {
  this.secret = secret;
  this.dataType = dataType;
  this.dependentType = dependentType;

  TYPE_ENUM.__assert(this.dataType);
  if (this.secret !== true && this.secret !== false) {
    throw new Error('Secret must be either true or false! Instead it was "' + this.secret + '".');
  }
  if (this.hasDependentType() && this.dependentType.compatible(this.dataType)) {
    throw new Error('Unexpected dependent type "' + this.dependentType + '" given for non array type "' + this.dataType + '"!');
  }
}
Type.prototype.toString = function () { // used for regex matching against cost rules
  const dependentTypeString = this.hasDependentType() ? this.dependentType.toString() : '';
  const secretString = this.secret ? ',secret:true' : '';
  const preambleString = this.secret ? 'type:' : '';

  return '<' + preambleString + this.dataType.toLowerCase() + dependentTypeString + secretString + '>';
};
Type.prototype.hasDependentType = function (prop) {
  return this.dependentType != null && (prop == null || this.dependentType[prop] == null);
};

// Function type behaves differently
// thisType can be null when this is not a method
function FunctionType(thisType, parameterTypes, returnType) {
  this.thisType = thisType;
  this.parameterTypes = parameterTypes;
  this.returnType = returnType;
}
FunctionType.prototype.toString = function () {
  const thisType = this.thisType != null ? this.thisType.toString() : '';
  const params = this.parameterTypes.map(function (parameterType) {
    return parameterType.toString();
  });
  return '<' + thisType + '(' + params.join(',') + ')=>' + this.returnType.toString() + '>';
};

// All dependent types must have this interface (constructors can differ)
function NumberDependentType(value) {
  this.value = value;
}
NumberDependentType.compatible = function (dataType) {
  return dataType === TYPE_ENUM.NUMBER;
};
NumberDependentType.toString = function () {
  return '<value:' + this.value + '>';
};

// length: either constant number or Parameter
function ArrayDependentType(dataType, length) {
  this.dataType = dataType;
  this.length = length;
}
ArrayDependentType.prototype.compatible = function (dataType) {
  return dataType === TYPE_ENUM.ARRAY;
};
ArrayDependentType.prototype.toString = function () {
  return '<datatype:' + this.dataType.toString() + ',length:' + this.length + '>';
};

module.exports = {
  TYPE_ENUM: TYPE_ENUM,
  Type: Type,
  FunctionType: FunctionType,
  NumberDependentType: NumberDependentType,
  ArrayDependentType: ArrayDependentType
};
},{"../../utils/enum.js":32}],12:[function(require,module,exports){
const ArrayAccess = function (node, args) {};
const SliceExpression  = function (node, args) {};

module.exports = {
  ArrayAccess: ArrayAccess,
  SliceExpression: SliceExpression
};
},{}],13:[function(require,module,exports){
const ParenthesesExpression = function (node, args) {};
const DirectExpression = function (node, args) {};
const DotExpression = function (node, args) {};
const NameExpression = function (node, args) {};

module.exports = {
  ParenthesesExpression: ParenthesesExpression,
  DirectExpression: DirectExpression,
  DotExpression: DotExpression,
  NameExpression: NameExpression
};
},{}],14:[function(require,module,exports){
const ForEach = function (node, args) {};
const For = function (node, args) {};

module.exports = {
  For: For,
  ForEach: ForEach
};
},{}],15:[function(require,module,exports){
const FunctionDefinition = function (node, args) {};

const ReturnStatement = function (node, args) {};

const FunctionCall = function (node, args) {};

module.exports = {
  FunctionDefinition: FunctionDefinition,
  ReturnStatement: ReturnStatement,
  FunctionCall: FunctionCall
};
},{}],16:[function(require,module,exports){
const If = function (node, args) {};

module.exports = {
  If: If
};
},{}],17:[function(require,module,exports){
const OblivIf = function (node, args) {};

module.exports = {
  OblivIf: OblivIf
};
},{}],18:[function(require,module,exports){
const ArrayExpression = function (node, args) {};
const RangeExpression = function (node, args) {};
const LiteralExpression = function (node, args) {};

module.exports = {
  ArrayExpression: ArrayExpression,
  RangeExpression: RangeExpression,
  LiteralExpression: LiteralExpression
};
},{}],19:[function(require,module,exports){
const TypeNode = function (node, args) {};
const VariableDefinition = function (node, args) {};
const VariableAssignment = function (node, args) {};

module.exports = {
  TypeNode: TypeNode,
  VariableDefinition: VariableDefinition,
  VariableAssignment: VariableAssignment
};
},{}],20:[function(require,module,exports){
const jiff = require('./jiff.json');
const rustBGW = require('./rustBGW.json');

module.exports = {
  jiff: jiff,
  rustBGW: rustBGW
};
},{"./jiff.json":21,"./rustBGW.json":22}],21:[function(require,module,exports){
module.exports={
  "parameters": [
    {"parameter": "p", "description": "number of parties"},
    {"parameter": "b", "description": "number of bits in field"}
  ],
  "metrics": [
    {
      "title": "Online Messages",
      "description": "Total number of messages sent by a single party during the online phase",
      "metric": "TotalMetric"
    },
    {
      "title": "Online Rounds",
      "description": "Total number of rounds of communication during the online phase",
      "metric": "RoundMetric"
    }
  ],
  "operations": [
    {
      "rule": {
        "nodeType": "FunctionCall",
        "match": "^jiffClient\\.share(@P)$"
      },
      "value": {
        "Online Messages": "p-1",
        "Online Rounds": "1"
      }
    },
    {
      "rule": {
        "nodeType": "FunctionCall",
        "match": "^<type:number@T,secret:true>\\.smult(<type:number@T,secret:true>@P)$"
      },
      "value": {
        "Online Messages": "p-1",
        "Online Rounds": "1"
      }
    }
  ]
}
},{}],22:[function(require,module,exports){
module.exports={
  "parameters": [
    {"parameter": "p", "description": "number of parties"},
    {"parameter": "b", "description": "number of bits in field"}
  ],
  "metrics": [
    {
      "title": "Online Messages",
      "description": "Total number of messages sent during the online phase",
      "metric": "TotalMetric"
    },
    {
      "title": "Online Rounds",
      "description": "Total number of rounds of communication during the online phase",
      "metric": "RoundMetric"
    }
  ],
  "operations": [
    {
      "rule": {
        "nodeType": "DirectExpression",
        "match": "^<type:number,secret:true>\\+<type:number,secret:true>$"
      },
      "value": {
        "Online Messages": "0",
        "Online Rounds": "0"
      }
    },
    {
      "rule": {
        "nodeType": "DirectExpression",
        "match": "^<type:number,secret:true>\\*<type:number,secret:true>$"
      },
      "value": {
        "Online Messages": "p-1",
        "Online Rounds": "1"
      }
    },
    {
      "rule": {
        "nodeType": "DirectExpression",
        "match": "^<type:number,secret:true><<type:number,secret:true>$"
      },
      "value": {
        "Online Messages": "b*(p-1)",
        "Online Rounds": "b-1"
      }
    }
  ]
}
},{}],23:[function(require,module,exports){
const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const Analyzer = require('./analyze/analyzer.js');

const analyze = function (language, code, costs, extraTyping) {
  const analyzer = new Analyzer(language, code, costs, extraTyping);
  return analyzer.analyze();
};

module.exports = {
  languages: ['javascript', 'rust'],
  costs: costs,
  analyze: analyze,
  promise: parsers.promise,
  parsers: parsers // TODO: remove this after debugging
};
},{"./analyze/analyzer.js":5,"./costs/index.js":20,"./ir/parsers.js":25}],24:[function(require,module,exports){
// All node types that can be visited
module.exports = [
  // logical nodes
  'TypeNode',
  // statements
  'FunctionDefinition',
  'ReturnStatement',
  'VariableDefinition',
  'ForEach',
  'For',
  'VariableAssignment',
  // expressions
  'If',
  'OblivIf',
  'LiteralExpression',
  'NameExpression',
  'DirectExpression',
  'ParenthesesExpression',
  'ArrayAccess',
  'RangeExpression',
  'SliceExpression',
  'ArrayExpression',
  'FunctionCall',
  'DotExpression'
];
},{}],25:[function(require,module,exports){
const rust = require('./parsers/rust/index.js');
const javascript = require('./parsers/javascript/index.js');

module.exports = {
  rust: rust.parse,
  javascript: javascript,
  promise: rust.promise
};
},{"./parsers/javascript/index.js":26,"./parsers/rust/index.js":27}],26:[function(require,module,exports){
const parseJavascript = function (code) {
  return [];
};

module.exports = parseJavascript;
},{}],27:[function(require,module,exports){
const WASMParser = require('../../../../rust/js/wrapper.js');

const parseRust = function (code) {
  console.log('test_wasm_now() = ', WASMParser.parse(code));
  // TODO: require wasm bundle from rust/dist/bundle.js and use it to parse into IR
  return require('../../../../docs/merge_sort_dedup_ir.json');
};

module.exports = {
  parse: parseRust,
  promise: WASMParser.promise
};
},{"../../../../docs/merge_sort_dedup_ir.json":1,"../../../../rust/js/wrapper.js":4}],28:[function(require,module,exports){
const IR_NODES = require('./ir.js');

// The visitor class
function IRVisitor(args) {
  this.args = args;
}

// Start visiting
IRVisitor.prototype.start = function (IRNode, args) {
  this.visit(IRNode, args);
};

IRVisitor.prototype.visit = function (node, args) {
  if (node == null || node.nodeType == null) {
    return args;
  }
  return this['visit'+node.nodeType](node, args);
};

IRVisitor.prototype.addVisitor = function (nodeType, visitorFunction) {
  if (IR_NODES.indexOf(nodeType) === -1) {
    throw new Error('Attempted to add visitor for illegal node type "' + nodeType + '"!');
  }

  this['visit'+nodeType] = visitorFunction.bind(this);
};

IRVisitor.prototype.addVisitors = function (visitorsMap) {
  for (let nodeType in visitorsMap) {
    if (Object.prototype.hasOwnProperty.call(visitorsMap, nodeType)) {
      this.addVisitor(nodeType, visitorsMap[nodeType]);
    }
  }
};

// Default visitor used for node types for which a user visitor was not set
const defaultVisitor = function (nodeType, node, args) {
  console.log('Warning: visitor function for', nodeType, 'is undefined!');
  return args;
};
for (let i = 0; i < IR_NODES.length; i++) {
  const nodeType = IR_NODES[i];
  IRVisitor.prototype['visit'+nodeType] = defaultVisitor.bind(null, nodeType);
}

module.exports = IRVisitor;
},{"./ir.js":24}],29:[function(require,module,exports){
const javascript = require('./javascript.js');
const rust = require('./rust.js');

module.exports = {
  javascript: javascript,
  rust: rust
};
},{"./javascript.js":30,"./rust.js":31}],30:[function(require,module,exports){
const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'dotExpression',
      match: '^<array@T>\\.length$'
    },
    value: function (node, args, children) {
      // <array<type: ..., length: n>.length is of type: <number <value: n>>
      const arrayType = children.left;
      if (arrayType.dataType === carouselsTypes.ARRAY && arrayType.hasDependentType('length')) {
        const arrayDependentType = arrayType.dependentType;
        const resultDependentType = new carouselsTypes.NumberDependentType(arrayDependentType.length);
        return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, resultDependentType);
      }

      return new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
    }
  }
];
},{"../analyze/symbols/types.js":11}],31:[function(require,module,exports){
const carouselsTypes = require('../analyze/symbols/types.js');

module.exports = [
  {
    rule: {
      nodeType: 'dotExpression',
      match: '^<array@T>\\.len$'
    },
    value: function (node, args, children) {
      const arrayType = children.left;

      if (arrayType.dataType === carouselsTypes.ARRAY && arrayType.hasDependentType('length')) {
        // <array>.len() is of type: < <array <type: any, length: n>>() => <number <value: n> >
        const arrayDependentType = arrayType.dependentType;
        const returnDependentType = new carouselsTypes.NumberDependentType(arrayDependentType.length);
        const returnType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false, returnDependentType);

        return new carouselsTypes.FunctionType(arrayType, [], returnType);
      }

      const plainNumberType = new carouselsTypes.Type(carouselsTypes.TYPE_ENUM.NUMBER, false);
      return new carouselsTypes.FunctionType(null, [], plainNumberType);
    }
  }
];
},{"../analyze/symbols/types.js":11}],32:[function(require,module,exports){
function Enum() {
  this.__name = arguments[0];
  this.__values = Array.from(arguments).slice(1);
  for (let i = 0; i < arguments.length; i++) {
    const val = arguments[i];
    this[val] = val;

    if (Enum.prototype[val] != null) {
      throw new Error('Cannot use reserved value "' + val + '" inside Enum "' + this.__name + '"!');
    }
  }
}

Enum.prototype.__name = 'ENUM_NAME';
Enum.prototype.__has = function (val) {
  return this.__values.indexOf(val) > -1;
};
Enum.prototype.__assert = function (val) {
  if (!this.__has(val)) {
    throw new Error('Illegal value "' + val + '" for Enum "' + this.__name + '"!');
  }
};

module.exports = Enum;
},{}]},{},[23])(23)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkb2NzL21lcmdlX3NvcnRfZGVkdXBfaXIuanNvbiIsInJ1c3QvZGlzdC9pbmRleC5qcyIsInJ1c3QvZGlzdC93YXNtLmpzIiwicnVzdC9qcy93cmFwcGVyLmpzIiwic3JjL2FuYWx5emUvYW5hbHl6ZXIuanMiLCJzcmMvYW5hbHl6ZS9ydWxlcy9jb3N0UnVsZUJvb2suanMiLCJzcmMvYW5hbHl6ZS9ydWxlcy9ydWxlLmpzIiwic3JjL2FuYWx5emUvcnVsZXMvcnVsZUJvb2suanMiLCJzcmMvYW5hbHl6ZS9ydWxlcy90eXBpbmdSdWxlQm9vay5qcyIsInNyYy9hbmFseXplL3N5bWJvbHMvc2NvcGVkTWFwLmpzIiwic3JjL2FuYWx5emUvc3ltYm9scy90eXBlcy5qcyIsInNyYy9hbmFseXplL3Zpc2l0b3JzL2FycmF5LmpzIiwic3JjL2FuYWx5emUvdmlzaXRvcnMvZXhwcmVzc2lvbi5qcyIsInNyYy9hbmFseXplL3Zpc2l0b3JzL2Zvci5qcyIsInNyYy9hbmFseXplL3Zpc2l0b3JzL2Z1bmN0aW9uLmpzIiwic3JjL2FuYWx5emUvdmlzaXRvcnMvaWYuanMiLCJzcmMvYW5hbHl6ZS92aXNpdG9ycy9vYmxpdklmLmpzIiwic3JjL2FuYWx5emUvdmlzaXRvcnMvdmFsdWUuanMiLCJzcmMvYW5hbHl6ZS92aXNpdG9ycy92YXJpYWJsZS5qcyIsInNyYy9jb3N0cy9pbmRleC5qcyIsInNyYy9jb3N0cy9qaWZmLmpzb24iLCJzcmMvY29zdHMvcnVzdEJHVy5qc29uIiwic3JjL2luZGV4LmpzIiwic3JjL2lyL2lyLmpzIiwic3JjL2lyL3BhcnNlcnMuanMiLCJzcmMvaXIvcGFyc2Vycy9qYXZhc2NyaXB0L2luZGV4LmpzIiwic3JjL2lyL3BhcnNlcnMvcnVzdC9pbmRleC5qcyIsInNyYy9pci92aXNpdG9yLmpzIiwic3JjL3R5cGluZy9pbmRleC5qcyIsInNyYy90eXBpbmcvamF2YXNjcmlwdC5qcyIsInNyYy90eXBpbmcvcnVzdC5qcyIsInNyYy91dGlscy9lbnVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHM9W1xuICB7XG4gICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uRGVmaW5pdGlvblwiLFxuICAgIFwibmFtZVwiOiB7XG4gICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgIFwibmFtZVwiOiBcIm1lcmdlX3NvcnRfZGVkdXBcIlxuICAgIH0sXG4gICAgXCJwYXJhbWV0ZXJzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIlZhcmlhYmxlRGVmaW5pdGlvblwiLFxuICAgICAgICBcIm5hbWVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgIFwibmFtZVwiOiBcImFcIlxuICAgICAgICB9LFxuICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgIFwic2VjcmV0XCI6IHRydWUsXG4gICAgICAgICAgXCJ0eXBlXCI6IFwiYXJyYXlcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSxcbiAgICBcInJldHVyblR5cGVcIjoge1xuICAgICAgXCJub2RlVHlwZVwiOiBcIlR5cGVOb2RlXCIsXG4gICAgICBcInNlY3JldFwiOiB0cnVlLFxuICAgICAgXCJ0eXBlXCI6IFwiYXJyYXlcIlxuICAgIH0sXG4gICAgXCJib2R5XCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIlZhcmlhYmxlRGVmaW5pdGlvblwiLFxuICAgICAgICBcIm5hbWVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgIFwibmFtZVwiOiBcIm5cIlxuICAgICAgICB9LFxuICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgIFwic2VjcmV0XCI6IGZhbHNlLFxuICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJWYXJpYWJsZUFzc2lnbm1lbnRcIixcbiAgICAgICAgXCJuYW1lXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgICAgICBcIm5hbWVcIjogXCJuXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJleHByZXNzaW9uXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRnVuY3Rpb25DYWxsXCIsXG4gICAgICAgICAgXCJmdW5jdGlvblwiOiB7XG4gICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRG90RXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgXCJsZWZ0XCI6IFwiYVwiLFxuICAgICAgICAgICAgXCJyaWdodFwiOiBcImxlblwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInBhcmFtZXRlcnNcIjogW11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIklmXCIsXG4gICAgICAgIFwiY29uZGl0aW9uXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICAgIFwib3BlcmF0b3JcIjogXCI+XCIsXG4gICAgICAgICAgXCJhcml0eVwiOiAyLFxuICAgICAgICAgIFwib3BlcmFuZHNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiblwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTGl0ZXJhbEV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBcImlmQm9keVwiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIlZhcmlhYmxlRGVmaW5pdGlvblwiLFxuICAgICAgICAgICAgXCJuYW1lXCI6IHtcbiAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcIm1cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHlwZVwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgICAgICBcInNlY3JldFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJWYXJpYWJsZUFzc2lnbm1lbnRcIixcbiAgICAgICAgICAgIFwibmFtZVwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJtXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImV4cHJlc3Npb25cIjoge1xuICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICBcIm9wZXJhdG9yXCI6IFwiL1wiLFxuICAgICAgICAgICAgICBcImFyaXR5XCI6IDIsXG4gICAgICAgICAgICAgIFwib3BlcmFuZHNcIjogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiblwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTGl0ZXJhbEV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICAgICAgXCJmdW5jdGlvblwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJtZXJnZV9kZWR1cFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJwYXJhbWV0ZXJzXCI6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJGdW5jdGlvbkNhbGxcIixcbiAgICAgICAgICAgICAgICBcImZ1bmN0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibWVyZ2Vfc29ydF9kZWR1cFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInBhcmFtZXRlcnNcIjogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiU2xpY2VFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJyYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImFcIlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcInJhbmdlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiUmFuZ2VFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdGFydFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJMaXRlcmFsRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAwXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBcImVuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibVwiXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICAgICAgICAgIFwiZnVuY3Rpb25cIjoge1xuICAgICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJtZXJnZV9zb3J0X2RlZHVwXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwicGFyYW1ldGVyc1wiOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJTbGljZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcnJheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiYVwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwicmFuZ2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJSYW5nZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgICAgICBcInN0YXJ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibVwiXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBcImVuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIm5cIlxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgXCJlbHNlQm9keVwiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICAgICAgXCJmdW5jdGlvblwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJEb3RFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgIFwibGVmdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiYVwiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIFwicmlnaHRcIjoge1xuICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcInRvX293bmVkXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicGFyYW1ldGVyc1wiOiBbXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwibm9kZVR5cGVcIjogXCJGdW5jdGlvbkRlZmluaXRpb25cIixcbiAgICBcIm5hbWVcIjogXCJtZXJnZV9kZWR1cFwiLFxuICAgIFwicGFyYW1ldGVyc1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJWYXJpYWJsZURlZmluaXRpb25cIixcbiAgICAgICAgXCJuYW1lXCI6IFwiYVwiLFxuICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgIFwic2VjcmV0XCI6IHRydWUsXG4gICAgICAgICAgXCJ0eXBlXCI6IFwiYXJyYXlcIlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm5vZGVUeXBlXCI6IFwiVmFyaWFibGVEZWZpbml0aW9uXCIsXG4gICAgICAgIFwibmFtZVwiOiBcImJcIixcbiAgICAgICAgXCJ0eXBlXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiVHlwZU5vZGVcIixcbiAgICAgICAgICBcInNlY3JldFwiOiB0cnVlLFxuICAgICAgICAgIFwidHlwZVwiOiBcImFycmF5XCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0sXG4gICAgXCJyZXR1cm5UeXBlXCI6IHtcbiAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgXCJzZWNyZXRcIjogdHJ1ZSxcbiAgICAgIFwidHlwZVwiOiBcImFycmF5XCJcbiAgICB9LFxuICAgIFwiYm9keVwiOiBbXG4gICAgXVxuICB9XG5dXG4iLCIoZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgX19leHBvcnRzID0ge307XG4gICAgbGV0IHdhc207XG5cbiAgICAvKipcbiAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgKi9cbiAgICBfX2V4cG9ydHMudGVzdF93YXNtX25vdyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCByZXQgPSB3YXNtLnRlc3Rfd2FzbV9ub3coKTtcbiAgICAgICAgcmV0dXJuIHJldCA+Pj4gMDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaW5pdChtb2R1bGUpIHtcblxuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICBjb25zdCBpbXBvcnRzID0ge307XG5cbiAgICAgICAgaWYgKCh0eXBlb2YgVVJMID09PSAnZnVuY3Rpb24nICYmIG1vZHVsZSBpbnN0YW5jZW9mIFVSTCkgfHwgdHlwZW9mIG1vZHVsZSA9PT0gJ3N0cmluZycgfHwgKHR5cGVvZiBSZXF1ZXN0ID09PSAnZnVuY3Rpb24nICYmIG1vZHVsZSBpbnN0YW5jZW9mIFJlcXVlc3QpKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gZmV0Y2gobW9kdWxlKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhyZXNwb25zZSwgaW1wb3J0cylcbiAgICAgICAgICAgICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSAhPSAnYXBwbGljYXRpb24vd2FzbScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmdgIGZhaWxlZCBiZWNhdXNlIHlvdXIgc2VydmVyIGRvZXMgbm90IHNlcnZlIHdhc20gd2l0aCBgYXBwbGljYXRpb24vd2FzbWAgTUlNRSB0eXBlLiBGYWxsaW5nIGJhY2sgdG8gYFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlYCB3aGljaCBpcyBzbG93ZXIuIE9yaWdpbmFsIGVycm9yOlxcblwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gci5hcnJheUJ1ZmZlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbihieXRlcyA9PiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShieXRlcywgaW1wb3J0cykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXNwb25zZVxuICAgICAgICAgICAgICAgIC50aGVuKHIgPT4gci5hcnJheUJ1ZmZlcigpKVxuICAgICAgICAgICAgICAgIC50aGVuKGJ5dGVzID0+IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKGJ5dGVzLCBpbXBvcnRzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHJlc3VsdCA9IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKG1vZHVsZSwgaW1wb3J0cylcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFdlYkFzc2VtYmx5Lkluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IGluc3RhbmNlOiByZXN1bHQsIG1vZHVsZSB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKCh7aW5zdGFuY2UsIG1vZHVsZX0pID0+IHtcbiAgICAgICAgICAgIHdhc20gPSBpbnN0YW5jZS5leHBvcnRzO1xuICAgICAgICAgICAgaW5pdC5fX3diaW5kZ2VuX3dhc21fbW9kdWxlID0gbW9kdWxlO1xuXG4gICAgICAgICAgICByZXR1cm4gd2FzbTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi53YXNtX2JpbmRnZW4gPSBPYmplY3QuYXNzaWduKGluaXQsIF9fZXhwb3J0cyk7XG5cbn0pKCk7XG4iLCIvLyBHZW5lcmF0ZWQgQ29kZVxuLy8gd2lsbCBhZGQgd2FzbV9iaW5kZ2VuIHRvIGdsb2JhbCBzY29wZVxucmVxdWlyZSgnLi9pbmRleC5qcycpO1xuXG4vLyByZW1vdmUgd2FzbV9iaW5kZ2VuIGZyb20gZ2xvYmFsIHNjb3BlLCBtYWtlIGl0IG9ubHkgYWNjZXNzaWJsZSBpbiB0aGlzIGZpbGVcbmNvbnN0IHdhc21fYmluZGdlbiA9IHdpbmRvdy53YXNtX2JpbmRnZW47XG5kZWxldGUgd2luZG93Wyd3YXNtX2JpbmRnZW4nXTtcblxuY29uc3Qgd2FzbUJpbmFyeSA9IChmdW5jdGlvbiAoYmFzZTY0U3RyaW5nKSB7XG4gIHZhciByYXcgPSB3aW5kb3cuYXRvYihiYXNlNjRTdHJpbmcpO1xuICB2YXIgcmF3TGVuZ3RoID0gcmF3Lmxlbmd0aDtcbiAgdmFyIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkobmV3IEFycmF5QnVmZmVyKHJhd0xlbmd0aCkpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcmF3TGVuZ3RoOyBpKyspIHtcbiAgICBhcnJheVtpXSA9IHJhdy5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn0pKCdBR0Z6YlFFQUFBQUJCUUZnQUFGL0F3SUJBQVVEQVFBUkJ4b0NCbTFsYlc5eWVRSUFEWFJsYzNSZmQyRnpiVjl1YjNjQUFBb0dBUVFBUVFvTEMwNEJBRUdnaU1BQUMwVUJBQUFBQUFBQUFBRUFBQUFDQUFBQUF3QUFBQVFBQUFBRkFBQUFCQUFBQUFRQUFBQUdBQUFBQndBQUFBZ0FBQUFKQUFBQUFBQUFBQUVBQUFBQ0FBQUFBd0FBQUFRQWV3bHdjbTlrZFdObGNuTUNDR3hoYm1kMVlXZGxBUVJTZFhOMEFBeHdjbTlqWlhOelpXUXRZbmtEQlhKMWMzUmpIVEV1TkRFdU1TQW9aak5sTVdFNU5UUmtJREl3TWpBdE1ESXRNalFwQm5kaGJISjFjd1l3TGpFeExqQU1kMkZ6YlMxaWFXNWtaMlZ1RWpBdU1pNDFNQ0FvTldNMU5tTXdNak00S1E9PScpO1xuXG5jb25zdCB3YXNtTW9kdWxlID0gbmV3IFdlYkFzc2VtYmx5Lk1vZHVsZSh3YXNtQmluYXJ5KTtcbmNvbnN0IHdhc21Qcm9taXNlID0gd2FzbV9iaW5kZ2VuKHdhc21Nb2R1bGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdhc21Qcm9taXNlO1xuLy8gRW5kIG9mIEdlbmVyYXRlZCBDb2RlIiwiLy8gTW9kdWxlIG5lZWRzIHRvIGJlIGxvYWQgZHluYW1pY2FsbHkgKGFzeW5jKSBmb3IgV2ViQXNzZW1ibHkgdG8gZnVuY3Rpb25cbmxldCBXQVNNUGFyc2VyO1xuXG5jb25zdCBXQVNNUHJvbWlzZSA9IHJlcXVpcmUoJy4uL2Rpc3Qvd2FzbS5qcycpO1xuV0FTTVByb21pc2UudGhlbihmdW5jdGlvbiAoX1dBU01QYXJzZXIpIHtcbiAgV0FTTVBhcnNlciA9IF9XQVNNUGFyc2VyO1xufSk7XG5cbi8vIFBhcnNpbmcgV3JhcHBlcjogcHJlcHJvY2VzcyBjb2RlIGFzIGEgc3RyaW5nIHRvIHJlbW92ZSBvYmxpdiBrZXl3b3JkXG5jb25zdCBSRVBMQUNFX1BBVFRFUk5TID0gW1xuICB7XG4gICAgcGF0dGVybjogbmV3IFJlZ0V4cCgnZWxzZVxcXFxzK29ibGl2XFxcXHMraWYnLCAnZycpLFxuICAgIHJlcGxhY2U6ICdlbHNlIGlmJ1xuICB9LFxuICB7XG4gICAgcGF0dGVybjogbmV3IFJlZ0V4cCgnb2JsaXZcXFxccytpZicsICdnJyksXG4gICAgcmVwbGFjZTogJ2xldCBfX29ibGl2ID0gIV9fb2JsaXY7XFxuaWYnXG4gIH1cbl07XG5cbmNvbnN0IHBhcnNlV3JhcHBlciA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gIGlmIChXQVNNUGFyc2VyID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dBU00gYmluYXJpZXMgZGlkIG5vdCBmaW5pc2ggbG9hZGluZyBhc3luY2hyb25vdXNseSB5ZXQhIHBsZWFzZSBtYWtlIHN1cmUgV0FTTVByb21pc2UgaXMgcmVzb2x2ZWQgZmlyc3QhJyk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IFJFUExBQ0VfUEFUVEVSTlMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gUkVQTEFDRV9QQVRURVJOU1tpXS5wYXR0ZXJuO1xuICAgIGNvbnN0IHJlcGxhY2UgPSBSRVBMQUNFX1BBVFRFUk5TW2ldLnJlcGxhY2U7XG4gICAgY29kZSA9IGNvZGUucmVwbGFjZShwYXR0ZXJuLCByZXBsYWNlKTtcbiAgfVxuXG4gIHJldHVybiBXQVNNUGFyc2VyLnRlc3Rfd2FzbV9ub3coY29kZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJvbWlzZTogV0FTTVByb21pc2UsXG4gIHBhcnNlOiBwYXJzZVdyYXBwZXJcbn07XG4iLCJjb25zdCBwYXJzZXJzID0gcmVxdWlyZSgnLi4vaXIvcGFyc2Vycy5qcycpO1xuY29uc3QgdHlwaW5ncyA9IHJlcXVpcmUoJy4uL3R5cGluZy9pbmRleC5qcycpO1xuXG5jb25zdCBUeXBpbmdSdWxlQm9vayA9IHJlcXVpcmUoJy4vcnVsZXMvdHlwaW5nUnVsZUJvb2suanMnKTtcbmNvbnN0IENvc3RSdWxlQm9vayA9IHJlcXVpcmUoJy4vcnVsZXMvY29zdFJ1bGVCb29rLmpzJyk7XG5cbmNvbnN0IFNjb3BlZE1hcCA9IHJlcXVpcmUoJy4vc3ltYm9scy9zY29wZWRNYXAuanMnKTtcblxuY29uc3QgSVJWaXNpdG9yID0gcmVxdWlyZSgnLi4vaXIvdmlzaXRvci5qcycpO1xuY29uc3QgdmlzaXRvckltcGxlbWVudGF0aW9ucyA9IFtcbiAgcmVxdWlyZSgnLi92aXNpdG9ycy9hcnJheS5qcycpLFxuICByZXF1aXJlKCcuL3Zpc2l0b3JzL2V4cHJlc3Npb24uanMnKSxcbiAgcmVxdWlyZSgnLi92aXNpdG9ycy9mb3IuanMnKSxcbiAgcmVxdWlyZSgnLi92aXNpdG9ycy9mdW5jdGlvbi5qcycpLFxuICByZXF1aXJlKCcuL3Zpc2l0b3JzL2lmLmpzJyksXG4gIHJlcXVpcmUoJy4vdmlzaXRvcnMvb2JsaXZJZi5qcycpLFxuICByZXF1aXJlKCcuL3Zpc2l0b3JzL3ZhbHVlLmpzJyksXG4gIHJlcXVpcmUoJy4vdmlzaXRvcnMvdmFyaWFibGUuanMnKVxuXTtcblxuZnVuY3Rpb24gQW5hbHl6ZXIobGFuZ3VhZ2UsIGNvZGUsIGNvc3RzLCBleHRyYVR5cGluZykge1xuICB0aGlzLmxhbmd1YWdlID0gbGFuZ3VhZ2U7XG4gIHRoaXMuY29kZSA9IGNvZGU7XG5cbiAgLy8gcGFyc2UgaW50byBJUlxuICBjb25zdCBwYXJzZXIgPSBwYXJzZXJzW3RoaXMubGFuZ3VhZ2VdO1xuICB0aGlzLklSID0gcGFyc2VyKHRoaXMuY29kZSk7XG5cbiAgLy8gdHlwaW5nIHJ1bGVzXG4gIGNvbnN0IHR5cGluZ1J1bGVzID0gKGV4dHJhVHlwaW5nIHx8IFtdKS5jb25jYXQodHlwaW5nc1t0aGlzLmxhbmd1YWdlXSk7XG4gIHRoaXMudHlwaW5ncyA9IG5ldyBUeXBpbmdSdWxlQm9vayh0eXBpbmdSdWxlcyk7XG5cbiAgLy8gY29zdHMgcGFyc2luZ1xuICB0aGlzLmNvc3RzID0gbmV3IENvc3RSdWxlQm9vayhjb3N0cyk7XG5cbiAgLy8gU2NvcGVkIHRhYmxlc1xuICB0aGlzLnZhcmlhYmxlVHlwZU1hcCA9IG5ldyBTY29wZWRNYXAoKTtcbiAgdGhpcy5mdW5jdGlvblR5cGVNYXAgPSBuZXcgU2NvcGVkTWFwKCk7XG4gIHRoaXMuZnVuY3Rpb25EZXBlbmRlbnRUeXBlTWFwID0gbmV3IFNjb3BlZE1hcCgpO1xuICB0aGlzLmZ1bmN0aW9uTWV0cmljTWFwID0gbmV3IFNjb3BlZE1hcCgpO1xuICB0aGlzLmZ1bmN0aW9uU3ltYm9sRXF1YXRpb25NYXAgPSBuZXcgU2NvcGVkTWFwKCk7XG5cbiAgLy8gdmlzaXRvciBwYXR0ZXJuXG4gIHRoaXMudmlzaXRvciA9IG5ldyBJUlZpc2l0b3IodGhpcyk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmlzaXRvckltcGxlbWVudGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHRoaXMudmlzaXRvci5hZGRWaXNpdG9ycyh2aXNpdG9ySW1wbGVtZW50YXRpb25zW2ldKTtcbiAgfVxufVxuXG5BbmFseXplci5wcm90b3R5cGUuYW5hbHl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy52aXNpdG9yLnN0YXJ0KHRoaXMuSVIpO1xuICByZXR1cm4gJ2IqMic7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFuYWx5emVyOyIsImNvbnN0IFJ1bGVCb29rID0gcmVxdWlyZSgnLi9ydWxlQm9vay5qcycpO1xuXG5mdW5jdGlvbiBDb3N0UnVsZUJvb2socnVsZXMpIHtcbiAgUnVsZUJvb2suY2FsbCh0aGlzLCBydWxlcy5vcGVyYXRpb25zKTtcbn1cblxuQ29zdFJ1bGVCb29rLnByb3RvdHlwZS5hcHBseU1hdGNoID0gZnVuY3Rpb24gKG5vZGUsIGV4cHJlc3Npb25UeXBlU3RyaW5nLCBhcmdzLCBtZXRyaWNzKSB7XG4gIGNvbnN0IG1hdGNoZWRWYWx1ZSA9IHRoaXMuZmluZE1hdGNoKG5vZGUsIGV4cHJlc3Npb25UeXBlU3RyaW5nKTtcbiAgaWYgKG1hdGNoZWRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG1ldHJpY3MpO1xuICB9XG5cbiAgY29uc3QgbmV3TWV0cmljcyA9IHt9O1xuICBmb3IgKGxldCBtZXRyaWNUaXRsZSBpbiBtZXRyaWNzKSB7XG4gICAgaWYgKCFPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChtZXRyaWNzLCBtZXRyaWNUaXRsZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIG5ld01ldHJpY3NbbWV0cmljVGl0bGVdID0gbWV0cmljc1ttZXRyaWNUaXRsZV0uYWRkQ29zdChtYXRjaGVkVmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIG5ld01ldHJpY3M7XG59O1xuXG4vLyBpbmhlcml0IFJ1bGVCb29rXG5Db3N0UnVsZUJvb2sucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShSdWxlQm9vay5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvc3RSdWxlQm9vazsiLCJjb25zdCBNQUNST1MgPSB7fTtcbk1BQ1JPU1snQFQnXSA9ICcoPC4qPiknOyAvLyBBTlkgVFlQRVxuTUFDUk9TWydAXFwnUCddID0gJygnICsgTUFDUk9TWydAVCddICsgJywpKic7IC8vIEFOWSBQQVJBTUVURVJTIEZPTExPV0VEIEJZIENPTU1BIElGIFBBUkFNRVRFUlMgRVhJU1RTXG5NQUNST1NbJ0AsUCddID0gJygsJyArIE1BQ1JPU1snQFQnXSArICcpKic7IC8vIEFOWSBQQVJBTUVURVJTIFBSRUNFREVEIEJZIENPTU1BIElGIFBBUkFNRVRFUlMgRVhJU1RTXG5NQUNST1NbJ0BQJ10gPSAnKCcgKyBNQUNST1NbJ0BcXCdQJ10gKyBNQUNST1NbJ0BUJ10gKyAnKT8nOyAvLyBBTlkgUEFSQU1FVEVSUyBXSVRIT1VUIExFQURJTkcgT1IgVFJBSUxJTkcgQ09NTUFTXG5cbmZ1bmN0aW9uIFJ1bGUocGF0dGVybiwgdmFsdWUpIHtcbiAgdGhpcy5wYXR0ZXJuID0gcGF0dGVybjtcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gIHRoaXMucGFyc2VQYXR0ZXJuKCk7XG59XG5cblJ1bGUucHJvdG90eXBlLnBhcnNlUGF0dGVybiA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yIChsZXQgbWFjcm8gaW4gTUFDUk9TKSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoTUFDUk9TLCBtYWNybykpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbmQgPSBuZXcgUmVnRXhwKG1hY3JvLCAnZycpO1xuICAgIHRoaXMucGF0dGVybiA9IHRoaXMucGF0dGVybi5yZXBsYWNlKGZpbmQsIE1BQ1JPU1ttYWNyb10pO1xuICB9XG5cbiAgdGhpcy5wYXR0ZXJuID0gbmV3IFJlZ0V4cCgnXicgKyB0aGlzLnBhdHRlcm4gKyAnJCcpO1xufTtcblxuUnVsZS5wcm90b3R5cGUuYXBwbGllc1RvID0gZnVuY3Rpb24gKGV4cHJlc3Npb25UeXBlU3RyaW5nKSB7XG4gIHJldHVybiB0aGlzLnBhdHRlcm4udGVzdChleHByZXNzaW9uVHlwZVN0cmluZyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJ1bGU7IiwiY29uc3QgUnVsZSA9IHJlcXVpcmUoJy4vcnVsZS5qcycpO1xuXG5mdW5jdGlvbiBSdWxlQm9vayhydWxlcykge1xuICB0aGlzLnJ1bGVzID0ge307XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJ1bGUgPSBydWxlc1tpXTtcblxuICAgIGNvbnN0IGJvb2tBcnJheSA9IHRoaXMucnVsZXNbcnVsZS5ub2RlVHlwZV0gfHwgW107XG4gICAgdGhpcy5ydWxlc1tydWxlLnJ1bGUubm9kZVR5cGVdID0gYm9va0FycmF5O1xuXG4gICAgYm9va0FycmF5LnB1c2gobmV3IFJ1bGUocnVsZS5ydWxlLm1hdGNoLCBydWxlLnZhbHVlKSk7XG4gIH1cbn1cblxuUnVsZUJvb2sucHJvdG90eXBlLmZpbmRNYXRjaCA9IGZ1bmN0aW9uIChub2RlLCBleHByZXNzaW9uVHlwZVN0cmluZykge1xuICBjb25zdCBydWxlcyA9IHRoaXMucnVsZXNbbm9kZS5ub2RlVHlwZV0gfHwgW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAocnVsZXNbaV0uYXBwbGllc1RvKGV4cHJlc3Npb25UeXBlU3RyaW5nKSkge1xuICAgICAgcmV0dXJuIHJ1bGVzW2ldLnZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJ1bGVCb29rOyIsImNvbnN0IFJ1bGVCb29rID0gcmVxdWlyZSgnLi9ydWxlQm9vay5qcycpO1xuY29uc3QgY2Fyb3VzZWxUeXBlcyA9IHJlcXVpcmUoJy4uL3N5bWJvbHMvdHlwZXMuanMnKTtcblxuY29uc3QgREVGQVVMVF9UWVBFID0gbmV3IGNhcm91c2VsVHlwZXMuVHlwZShjYXJvdXNlbFR5cGVzLlRZUEVfRU5VTS5BTlksIGZhbHNlKTtcblxuZnVuY3Rpb24gVHlwaW5nUnVsZUJvb2socnVsZXMpIHtcbiAgUnVsZUJvb2suY2FsbCh0aGlzLCBydWxlcyk7XG59XG5cblR5cGluZ1J1bGVCb29rLnByb3RvdHlwZS5hcHBseU1hdGNoID0gZnVuY3Rpb24gKG5vZGUsIGV4cHJlc3Npb25UeXBlU3RyaW5nLCBhcmdzLCBjaGlsZHJlblR5cGVzKSB7XG4gIGNvbnN0IG1hdGNoZWRWYWx1ZSA9IHRoaXMuZmluZE1hdGNoKG5vZGUsIGV4cHJlc3Npb25UeXBlU3RyaW5nKTtcbiAgaWYgKG1hdGNoZWRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfVFlQRTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVkVmFsdWUobm9kZSwgYXJncywgY2hpbGRyZW5UeXBlcyk7XG59O1xuXG4vLyBpbmhlcml0IFJ1bGVCb29rXG5UeXBpbmdSdWxlQm9vay5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFJ1bGVCb29rLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVHlwaW5nUnVsZUJvb2s7IiwiZnVuY3Rpb24gU2NvcGVkTWFwKCkge1xuICB0aGlzLnNjb3BlcyA9IFt7fV07XG59XG5TY29wZWRNYXAucHJvdG90eXBlLmFkZFNjb3BlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNjb3Blcy5wdXNoKHt9KTtcbn07XG5TY29wZWRNYXAucHJvdG90eXBlLnJlbW92ZVNjb3BlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnNjb3Blcy5wb3AoKTtcbn07XG5TY29wZWRNYXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICBjb25zdCBpbmRleCA9IHRoaXMuc2NvcGVzLmxlbmd0aCAtIDE7XG4gIHRoaXMuc2NvcGVzW2luZGV4XVtuYW1lXSA9IHZhbDtcbn07XG5TY29wZWRNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIGZvciAobGV0IGkgPSB0aGlzLnNjb3Blcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IHNjb3BlID0gdGhpcy5zY29wZXNbaV07XG4gICAgY29uc3QgdmFsID0gc2NvcGVbbmFtZV07XG4gICAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNjb3BlZE1hcDsiLCJjb25zdCBFbnVtID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvZW51bS5qcycpO1xuXG4vLyBFbnVtIGNvbnRhaW5pbmcgc3VwcG9ydGVkIHR5cGVzXG5jb25zdCBUWVBFX0VOVU0gPSBuZXcgRW51bSgnVFlQRV9FTlVNJywgJ05VTUJFUicsICdBUlJBWScsICdCT09MRUFOJywgJ1NUUklORycsICdBTlknKTtcblxuLy8gVHlwZSBhYnN0cmFjdGlvblxuZnVuY3Rpb24gVHlwZShkYXRhVHlwZSwgc2VjcmV0LCBkZXBlbmRlbnRUeXBlKSB7XG4gIHRoaXMuc2VjcmV0ID0gc2VjcmV0O1xuICB0aGlzLmRhdGFUeXBlID0gZGF0YVR5cGU7XG4gIHRoaXMuZGVwZW5kZW50VHlwZSA9IGRlcGVuZGVudFR5cGU7XG5cbiAgVFlQRV9FTlVNLl9fYXNzZXJ0KHRoaXMuZGF0YVR5cGUpO1xuICBpZiAodGhpcy5zZWNyZXQgIT09IHRydWUgJiYgdGhpcy5zZWNyZXQgIT09IGZhbHNlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTZWNyZXQgbXVzdCBiZSBlaXRoZXIgdHJ1ZSBvciBmYWxzZSEgSW5zdGVhZCBpdCB3YXMgXCInICsgdGhpcy5zZWNyZXQgKyAnXCIuJyk7XG4gIH1cbiAgaWYgKHRoaXMuaGFzRGVwZW5kZW50VHlwZSgpICYmIHRoaXMuZGVwZW5kZW50VHlwZS5jb21wYXRpYmxlKHRoaXMuZGF0YVR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGRlcGVuZGVudCB0eXBlIFwiJyArIHRoaXMuZGVwZW5kZW50VHlwZSArICdcIiBnaXZlbiBmb3Igbm9uIGFycmF5IHR5cGUgXCInICsgdGhpcy5kYXRhVHlwZSArICdcIiEnKTtcbiAgfVxufVxuVHlwZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7IC8vIHVzZWQgZm9yIHJlZ2V4IG1hdGNoaW5nIGFnYWluc3QgY29zdCBydWxlc1xuICBjb25zdCBkZXBlbmRlbnRUeXBlU3RyaW5nID0gdGhpcy5oYXNEZXBlbmRlbnRUeXBlKCkgPyB0aGlzLmRlcGVuZGVudFR5cGUudG9TdHJpbmcoKSA6ICcnO1xuICBjb25zdCBzZWNyZXRTdHJpbmcgPSB0aGlzLnNlY3JldCA/ICcsc2VjcmV0OnRydWUnIDogJyc7XG4gIGNvbnN0IHByZWFtYmxlU3RyaW5nID0gdGhpcy5zZWNyZXQgPyAndHlwZTonIDogJyc7XG5cbiAgcmV0dXJuICc8JyArIHByZWFtYmxlU3RyaW5nICsgdGhpcy5kYXRhVHlwZS50b0xvd2VyQ2FzZSgpICsgZGVwZW5kZW50VHlwZVN0cmluZyArIHNlY3JldFN0cmluZyArICc+Jztcbn07XG5UeXBlLnByb3RvdHlwZS5oYXNEZXBlbmRlbnRUeXBlID0gZnVuY3Rpb24gKHByb3ApIHtcbiAgcmV0dXJuIHRoaXMuZGVwZW5kZW50VHlwZSAhPSBudWxsICYmIChwcm9wID09IG51bGwgfHwgdGhpcy5kZXBlbmRlbnRUeXBlW3Byb3BdID09IG51bGwpO1xufTtcblxuLy8gRnVuY3Rpb24gdHlwZSBiZWhhdmVzIGRpZmZlcmVudGx5XG4vLyB0aGlzVHlwZSBjYW4gYmUgbnVsbCB3aGVuIHRoaXMgaXMgbm90IGEgbWV0aG9kXG5mdW5jdGlvbiBGdW5jdGlvblR5cGUodGhpc1R5cGUsIHBhcmFtZXRlclR5cGVzLCByZXR1cm5UeXBlKSB7XG4gIHRoaXMudGhpc1R5cGUgPSB0aGlzVHlwZTtcbiAgdGhpcy5wYXJhbWV0ZXJUeXBlcyA9IHBhcmFtZXRlclR5cGVzO1xuICB0aGlzLnJldHVyblR5cGUgPSByZXR1cm5UeXBlO1xufVxuRnVuY3Rpb25UeXBlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgdGhpc1R5cGUgPSB0aGlzLnRoaXNUeXBlICE9IG51bGwgPyB0aGlzLnRoaXNUeXBlLnRvU3RyaW5nKCkgOiAnJztcbiAgY29uc3QgcGFyYW1zID0gdGhpcy5wYXJhbWV0ZXJUeXBlcy5tYXAoZnVuY3Rpb24gKHBhcmFtZXRlclR5cGUpIHtcbiAgICByZXR1cm4gcGFyYW1ldGVyVHlwZS50b1N0cmluZygpO1xuICB9KTtcbiAgcmV0dXJuICc8JyArIHRoaXNUeXBlICsgJygnICsgcGFyYW1zLmpvaW4oJywnKSArICcpPT4nICsgdGhpcy5yZXR1cm5UeXBlLnRvU3RyaW5nKCkgKyAnPic7XG59O1xuXG4vLyBBbGwgZGVwZW5kZW50IHR5cGVzIG11c3QgaGF2ZSB0aGlzIGludGVyZmFjZSAoY29uc3RydWN0b3JzIGNhbiBkaWZmZXIpXG5mdW5jdGlvbiBOdW1iZXJEZXBlbmRlbnRUeXBlKHZhbHVlKSB7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cbk51bWJlckRlcGVuZGVudFR5cGUuY29tcGF0aWJsZSA9IGZ1bmN0aW9uIChkYXRhVHlwZSkge1xuICByZXR1cm4gZGF0YVR5cGUgPT09IFRZUEVfRU5VTS5OVU1CRVI7XG59O1xuTnVtYmVyRGVwZW5kZW50VHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICc8dmFsdWU6JyArIHRoaXMudmFsdWUgKyAnPic7XG59O1xuXG4vLyBsZW5ndGg6IGVpdGhlciBjb25zdGFudCBudW1iZXIgb3IgUGFyYW1ldGVyXG5mdW5jdGlvbiBBcnJheURlcGVuZGVudFR5cGUoZGF0YVR5cGUsIGxlbmd0aCkge1xuICB0aGlzLmRhdGFUeXBlID0gZGF0YVR5cGU7XG4gIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xufVxuQXJyYXlEZXBlbmRlbnRUeXBlLnByb3RvdHlwZS5jb21wYXRpYmxlID0gZnVuY3Rpb24gKGRhdGFUeXBlKSB7XG4gIHJldHVybiBkYXRhVHlwZSA9PT0gVFlQRV9FTlVNLkFSUkFZO1xufTtcbkFycmF5RGVwZW5kZW50VHlwZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnPGRhdGF0eXBlOicgKyB0aGlzLmRhdGFUeXBlLnRvU3RyaW5nKCkgKyAnLGxlbmd0aDonICsgdGhpcy5sZW5ndGggKyAnPic7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVFlQRV9FTlVNOiBUWVBFX0VOVU0sXG4gIFR5cGU6IFR5cGUsXG4gIEZ1bmN0aW9uVHlwZTogRnVuY3Rpb25UeXBlLFxuICBOdW1iZXJEZXBlbmRlbnRUeXBlOiBOdW1iZXJEZXBlbmRlbnRUeXBlLFxuICBBcnJheURlcGVuZGVudFR5cGU6IEFycmF5RGVwZW5kZW50VHlwZVxufTsiLCJjb25zdCBBcnJheUFjY2VzcyA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcbmNvbnN0IFNsaWNlRXhwcmVzc2lvbiAgPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBcnJheUFjY2VzczogQXJyYXlBY2Nlc3MsXG4gIFNsaWNlRXhwcmVzc2lvbjogU2xpY2VFeHByZXNzaW9uXG59OyIsImNvbnN0IFBhcmVudGhlc2VzRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcbmNvbnN0IERpcmVjdEV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBEb3RFeHByZXNzaW9uID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuY29uc3QgTmFtZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBQYXJlbnRoZXNlc0V4cHJlc3Npb246IFBhcmVudGhlc2VzRXhwcmVzc2lvbixcbiAgRGlyZWN0RXhwcmVzc2lvbjogRGlyZWN0RXhwcmVzc2lvbixcbiAgRG90RXhwcmVzc2lvbjogRG90RXhwcmVzc2lvbixcbiAgTmFtZUV4cHJlc3Npb246IE5hbWVFeHByZXNzaW9uXG59OyIsImNvbnN0IEZvckVhY2ggPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBGb3IgPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBGb3I6IEZvcixcbiAgRm9yRWFjaDogRm9yRWFjaFxufTsiLCJjb25zdCBGdW5jdGlvbkRlZmluaXRpb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbmNvbnN0IFJldHVyblN0YXRlbWVudCA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcblxuY29uc3QgRnVuY3Rpb25DYWxsID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRnVuY3Rpb25EZWZpbml0aW9uOiBGdW5jdGlvbkRlZmluaXRpb24sXG4gIFJldHVyblN0YXRlbWVudDogUmV0dXJuU3RhdGVtZW50LFxuICBGdW5jdGlvbkNhbGw6IEZ1bmN0aW9uQ2FsbFxufTsiLCJjb25zdCBJZiA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIElmOiBJZlxufTsiLCJjb25zdCBPYmxpdklmID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgT2JsaXZJZjogT2JsaXZJZlxufTsiLCJjb25zdCBBcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBSYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBMaXRlcmFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFycmF5RXhwcmVzc2lvbjogQXJyYXlFeHByZXNzaW9uLFxuICBSYW5nZUV4cHJlc3Npb246IFJhbmdlRXhwcmVzc2lvbixcbiAgTGl0ZXJhbEV4cHJlc3Npb246IExpdGVyYWxFeHByZXNzaW9uXG59OyIsImNvbnN0IFR5cGVOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuY29uc3QgVmFyaWFibGVEZWZpbml0aW9uID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuY29uc3QgVmFyaWFibGVBc3NpZ25tZW50ID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZU5vZGU6IFR5cGVOb2RlLFxuICBWYXJpYWJsZURlZmluaXRpb246IFZhcmlhYmxlRGVmaW5pdGlvbixcbiAgVmFyaWFibGVBc3NpZ25tZW50OiBWYXJpYWJsZUFzc2lnbm1lbnRcbn07IiwiY29uc3QgamlmZiA9IHJlcXVpcmUoJy4vamlmZi5qc29uJyk7XG5jb25zdCBydXN0QkdXID0gcmVxdWlyZSgnLi9ydXN0QkdXLmpzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGppZmY6IGppZmYsXG4gIHJ1c3RCR1c6IHJ1c3RCR1dcbn07IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInBhcmFtZXRlcnNcIjogW1xuICAgIHtcInBhcmFtZXRlclwiOiBcInBcIiwgXCJkZXNjcmlwdGlvblwiOiBcIm51bWJlciBvZiBwYXJ0aWVzXCJ9LFxuICAgIHtcInBhcmFtZXRlclwiOiBcImJcIiwgXCJkZXNjcmlwdGlvblwiOiBcIm51bWJlciBvZiBiaXRzIGluIGZpZWxkXCJ9XG4gIF0sXG4gIFwibWV0cmljc1wiOiBbXG4gICAge1xuICAgICAgXCJ0aXRsZVwiOiBcIk9ubGluZSBNZXNzYWdlc1wiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRvdGFsIG51bWJlciBvZiBtZXNzYWdlcyBzZW50IGJ5IGEgc2luZ2xlIHBhcnR5IGR1cmluZyB0aGUgb25saW5lIHBoYXNlXCIsXG4gICAgICBcIm1ldHJpY1wiOiBcIlRvdGFsTWV0cmljXCJcbiAgICB9LFxuICAgIHtcbiAgICAgIFwidGl0bGVcIjogXCJPbmxpbmUgUm91bmRzXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVG90YWwgbnVtYmVyIG9mIHJvdW5kcyBvZiBjb21tdW5pY2F0aW9uIGR1cmluZyB0aGUgb25saW5lIHBoYXNlXCIsXG4gICAgICBcIm1ldHJpY1wiOiBcIlJvdW5kTWV0cmljXCJcbiAgICB9XG4gIF0sXG4gIFwib3BlcmF0aW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJydWxlXCI6IHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICBcIm1hdGNoXCI6IFwiXmppZmZDbGllbnRcXFxcLnNoYXJlKEBQKSRcIlxuICAgICAgfSxcbiAgICAgIFwidmFsdWVcIjoge1xuICAgICAgICBcIk9ubGluZSBNZXNzYWdlc1wiOiBcInAtMVwiLFxuICAgICAgICBcIk9ubGluZSBSb3VuZHNcIjogXCIxXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwicnVsZVwiOiB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJGdW5jdGlvbkNhbGxcIixcbiAgICAgICAgXCJtYXRjaFwiOiBcIl48dHlwZTpudW1iZXJAVCxzZWNyZXQ6dHJ1ZT5cXFxcLnNtdWx0KDx0eXBlOm51bWJlckBULHNlY3JldDp0cnVlPkBQKSRcIlxuICAgICAgfSxcbiAgICAgIFwidmFsdWVcIjoge1xuICAgICAgICBcIk9ubGluZSBNZXNzYWdlc1wiOiBcInAtMVwiLFxuICAgICAgICBcIk9ubGluZSBSb3VuZHNcIjogXCIxXCJcbiAgICAgIH1cbiAgICB9XG4gIF1cbn0iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwicGFyYW1ldGVyc1wiOiBbXG4gICAge1wicGFyYW1ldGVyXCI6IFwicFwiLCBcImRlc2NyaXB0aW9uXCI6IFwibnVtYmVyIG9mIHBhcnRpZXNcIn0sXG4gICAge1wicGFyYW1ldGVyXCI6IFwiYlwiLCBcImRlc2NyaXB0aW9uXCI6IFwibnVtYmVyIG9mIGJpdHMgaW4gZmllbGRcIn1cbiAgXSxcbiAgXCJtZXRyaWNzXCI6IFtcbiAgICB7XG4gICAgICBcInRpdGxlXCI6IFwiT25saW5lIE1lc3NhZ2VzXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVG90YWwgbnVtYmVyIG9mIG1lc3NhZ2VzIHNlbnQgZHVyaW5nIHRoZSBvbmxpbmUgcGhhc2VcIixcbiAgICAgIFwibWV0cmljXCI6IFwiVG90YWxNZXRyaWNcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0aXRsZVwiOiBcIk9ubGluZSBSb3VuZHNcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUb3RhbCBudW1iZXIgb2Ygcm91bmRzIG9mIGNvbW11bmljYXRpb24gZHVyaW5nIHRoZSBvbmxpbmUgcGhhc2VcIixcbiAgICAgIFwibWV0cmljXCI6IFwiUm91bmRNZXRyaWNcIlxuICAgIH1cbiAgXSxcbiAgXCJvcGVyYXRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcInJ1bGVcIjoge1xuICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICBcIm1hdGNoXCI6IFwiXjx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT5cXFxcKzx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT4kXCJcbiAgICAgIH0sXG4gICAgICBcInZhbHVlXCI6IHtcbiAgICAgICAgXCJPbmxpbmUgTWVzc2FnZXNcIjogXCIwXCIsXG4gICAgICAgIFwiT25saW5lIFJvdW5kc1wiOiBcIjBcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJydWxlXCI6IHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIkRpcmVjdEV4cHJlc3Npb25cIixcbiAgICAgICAgXCJtYXRjaFwiOiBcIl48dHlwZTpudW1iZXIsc2VjcmV0OnRydWU+XFxcXCo8dHlwZTpudW1iZXIsc2VjcmV0OnRydWU+JFwiXG4gICAgICB9LFxuICAgICAgXCJ2YWx1ZVwiOiB7XG4gICAgICAgIFwiT25saW5lIE1lc3NhZ2VzXCI6IFwicC0xXCIsXG4gICAgICAgIFwiT25saW5lIFJvdW5kc1wiOiBcIjFcIlxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJydWxlXCI6IHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIkRpcmVjdEV4cHJlc3Npb25cIixcbiAgICAgICAgXCJtYXRjaFwiOiBcIl48dHlwZTpudW1iZXIsc2VjcmV0OnRydWU+PDx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT4kXCJcbiAgICAgIH0sXG4gICAgICBcInZhbHVlXCI6IHtcbiAgICAgICAgXCJPbmxpbmUgTWVzc2FnZXNcIjogXCJiKihwLTEpXCIsXG4gICAgICAgIFwiT25saW5lIFJvdW5kc1wiOiBcImItMVwiXG4gICAgICB9XG4gICAgfVxuICBdXG59IiwiY29uc3QgY29zdHMgPSByZXF1aXJlKCcuL2Nvc3RzL2luZGV4LmpzJyk7XG5jb25zdCBwYXJzZXJzID0gcmVxdWlyZSgnLi9pci9wYXJzZXJzLmpzJyk7XG5jb25zdCBBbmFseXplciA9IHJlcXVpcmUoJy4vYW5hbHl6ZS9hbmFseXplci5qcycpO1xuXG5jb25zdCBhbmFseXplID0gZnVuY3Rpb24gKGxhbmd1YWdlLCBjb2RlLCBjb3N0cywgZXh0cmFUeXBpbmcpIHtcbiAgY29uc3QgYW5hbHl6ZXIgPSBuZXcgQW5hbHl6ZXIobGFuZ3VhZ2UsIGNvZGUsIGNvc3RzLCBleHRyYVR5cGluZyk7XG4gIHJldHVybiBhbmFseXplci5hbmFseXplKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbGFuZ3VhZ2VzOiBbJ2phdmFzY3JpcHQnLCAncnVzdCddLFxuICBjb3N0czogY29zdHMsXG4gIGFuYWx5emU6IGFuYWx5emUsXG4gIHByb21pc2U6IHBhcnNlcnMucHJvbWlzZSxcbiAgcGFyc2VyczogcGFyc2VycyAvLyBUT0RPOiByZW1vdmUgdGhpcyBhZnRlciBkZWJ1Z2dpbmdcbn07IiwiLy8gQWxsIG5vZGUgdHlwZXMgdGhhdCBjYW4gYmUgdmlzaXRlZFxubW9kdWxlLmV4cG9ydHMgPSBbXG4gIC8vIGxvZ2ljYWwgbm9kZXNcbiAgJ1R5cGVOb2RlJyxcbiAgLy8gc3RhdGVtZW50c1xuICAnRnVuY3Rpb25EZWZpbml0aW9uJyxcbiAgJ1JldHVyblN0YXRlbWVudCcsXG4gICdWYXJpYWJsZURlZmluaXRpb24nLFxuICAnRm9yRWFjaCcsXG4gICdGb3InLFxuICAnVmFyaWFibGVBc3NpZ25tZW50JyxcbiAgLy8gZXhwcmVzc2lvbnNcbiAgJ0lmJyxcbiAgJ09ibGl2SWYnLFxuICAnTGl0ZXJhbEV4cHJlc3Npb24nLFxuICAnTmFtZUV4cHJlc3Npb24nLFxuICAnRGlyZWN0RXhwcmVzc2lvbicsXG4gICdQYXJlbnRoZXNlc0V4cHJlc3Npb24nLFxuICAnQXJyYXlBY2Nlc3MnLFxuICAnUmFuZ2VFeHByZXNzaW9uJyxcbiAgJ1NsaWNlRXhwcmVzc2lvbicsXG4gICdBcnJheUV4cHJlc3Npb24nLFxuICAnRnVuY3Rpb25DYWxsJyxcbiAgJ0RvdEV4cHJlc3Npb24nXG5dOyIsImNvbnN0IHJ1c3QgPSByZXF1aXJlKCcuL3BhcnNlcnMvcnVzdC9pbmRleC5qcycpO1xuY29uc3QgamF2YXNjcmlwdCA9IHJlcXVpcmUoJy4vcGFyc2Vycy9qYXZhc2NyaXB0L2luZGV4LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBydXN0OiBydXN0LnBhcnNlLFxuICBqYXZhc2NyaXB0OiBqYXZhc2NyaXB0LFxuICBwcm9taXNlOiBydXN0LnByb21pc2Vcbn07IiwiY29uc3QgcGFyc2VKYXZhc2NyaXB0ID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgcmV0dXJuIFtdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZUphdmFzY3JpcHQ7IiwiY29uc3QgV0FTTVBhcnNlciA9IHJlcXVpcmUoJy4uLy4uLy4uLy4uL3J1c3QvanMvd3JhcHBlci5qcycpO1xuXG5jb25zdCBwYXJzZVJ1c3QgPSBmdW5jdGlvbiAoY29kZSkge1xuICBjb25zb2xlLmxvZygndGVzdF93YXNtX25vdygpID0gJywgV0FTTVBhcnNlci5wYXJzZShjb2RlKSk7XG4gIC8vIFRPRE86IHJlcXVpcmUgd2FzbSBidW5kbGUgZnJvbSBydXN0L2Rpc3QvYnVuZGxlLmpzIGFuZCB1c2UgaXQgdG8gcGFyc2UgaW50byBJUlxuICByZXR1cm4gcmVxdWlyZSgnLi4vLi4vLi4vLi4vZG9jcy9tZXJnZV9zb3J0X2RlZHVwX2lyLmpzb24nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBwYXJzZTogcGFyc2VSdXN0LFxuICBwcm9taXNlOiBXQVNNUGFyc2VyLnByb21pc2Vcbn07IiwiY29uc3QgSVJfTk9ERVMgPSByZXF1aXJlKCcuL2lyLmpzJyk7XG5cbi8vIFRoZSB2aXNpdG9yIGNsYXNzXG5mdW5jdGlvbiBJUlZpc2l0b3IoYXJncykge1xuICB0aGlzLmFyZ3MgPSBhcmdzO1xufVxuXG4vLyBTdGFydCB2aXNpdGluZ1xuSVJWaXNpdG9yLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uIChJUk5vZGUsIGFyZ3MpIHtcbiAgdGhpcy52aXNpdChJUk5vZGUsIGFyZ3MpO1xufTtcblxuSVJWaXNpdG9yLnByb3RvdHlwZS52aXNpdCA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7XG4gIGlmIChub2RlID09IG51bGwgfHwgbm9kZS5ub2RlVHlwZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cbiAgcmV0dXJuIHRoaXNbJ3Zpc2l0Jytub2RlLm5vZGVUeXBlXShub2RlLCBhcmdzKTtcbn07XG5cbklSVmlzaXRvci5wcm90b3R5cGUuYWRkVmlzaXRvciA9IGZ1bmN0aW9uIChub2RlVHlwZSwgdmlzaXRvckZ1bmN0aW9uKSB7XG4gIGlmIChJUl9OT0RFUy5pbmRleE9mKG5vZGVUeXBlKSA9PT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRlZCB0byBhZGQgdmlzaXRvciBmb3IgaWxsZWdhbCBub2RlIHR5cGUgXCInICsgbm9kZVR5cGUgKyAnXCIhJyk7XG4gIH1cblxuICB0aGlzWyd2aXNpdCcrbm9kZVR5cGVdID0gdmlzaXRvckZ1bmN0aW9uLmJpbmQodGhpcyk7XG59O1xuXG5JUlZpc2l0b3IucHJvdG90eXBlLmFkZFZpc2l0b3JzID0gZnVuY3Rpb24gKHZpc2l0b3JzTWFwKSB7XG4gIGZvciAobGV0IG5vZGVUeXBlIGluIHZpc2l0b3JzTWFwKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2aXNpdG9yc01hcCwgbm9kZVR5cGUpKSB7XG4gICAgICB0aGlzLmFkZFZpc2l0b3Iobm9kZVR5cGUsIHZpc2l0b3JzTWFwW25vZGVUeXBlXSk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBEZWZhdWx0IHZpc2l0b3IgdXNlZCBmb3Igbm9kZSB0eXBlcyBmb3Igd2hpY2ggYSB1c2VyIHZpc2l0b3Igd2FzIG5vdCBzZXRcbmNvbnN0IGRlZmF1bHRWaXNpdG9yID0gZnVuY3Rpb24gKG5vZGVUeXBlLCBub2RlLCBhcmdzKSB7XG4gIGNvbnNvbGUubG9nKCdXYXJuaW5nOiB2aXNpdG9yIGZ1bmN0aW9uIGZvcicsIG5vZGVUeXBlLCAnaXMgdW5kZWZpbmVkIScpO1xuICByZXR1cm4gYXJncztcbn07XG5mb3IgKGxldCBpID0gMDsgaSA8IElSX05PREVTLmxlbmd0aDsgaSsrKSB7XG4gIGNvbnN0IG5vZGVUeXBlID0gSVJfTk9ERVNbaV07XG4gIElSVmlzaXRvci5wcm90b3R5cGVbJ3Zpc2l0Jytub2RlVHlwZV0gPSBkZWZhdWx0VmlzaXRvci5iaW5kKG51bGwsIG5vZGVUeXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJUlZpc2l0b3I7IiwiY29uc3QgamF2YXNjcmlwdCA9IHJlcXVpcmUoJy4vamF2YXNjcmlwdC5qcycpO1xuY29uc3QgcnVzdCA9IHJlcXVpcmUoJy4vcnVzdC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgamF2YXNjcmlwdDogamF2YXNjcmlwdCxcbiAgcnVzdDogcnVzdFxufTsiLCJjb25zdCBjYXJvdXNlbHNUeXBlcyA9IHJlcXVpcmUoJy4uL2FuYWx5emUvc3ltYm9scy90eXBlcy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAge1xuICAgIHJ1bGU6IHtcbiAgICAgIG5vZGVUeXBlOiAnZG90RXhwcmVzc2lvbicsXG4gICAgICBtYXRjaDogJ148YXJyYXlAVD5cXFxcLmxlbmd0aCQnXG4gICAgfSxcbiAgICB2YWx1ZTogZnVuY3Rpb24gKG5vZGUsIGFyZ3MsIGNoaWxkcmVuKSB7XG4gICAgICAvLyA8YXJyYXk8dHlwZTogLi4uLCBsZW5ndGg6IG4+Lmxlbmd0aCBpcyBvZiB0eXBlOiA8bnVtYmVyIDx2YWx1ZTogbj4+XG4gICAgICBjb25zdCBhcnJheVR5cGUgPSBjaGlsZHJlbi5sZWZ0O1xuICAgICAgaWYgKGFycmF5VHlwZS5kYXRhVHlwZSA9PT0gY2Fyb3VzZWxzVHlwZXMuQVJSQVkgJiYgYXJyYXlUeXBlLmhhc0RlcGVuZGVudFR5cGUoJ2xlbmd0aCcpKSB7XG4gICAgICAgIGNvbnN0IGFycmF5RGVwZW5kZW50VHlwZSA9IGFycmF5VHlwZS5kZXBlbmRlbnRUeXBlO1xuICAgICAgICBjb25zdCByZXN1bHREZXBlbmRlbnRUeXBlID0gbmV3IGNhcm91c2Vsc1R5cGVzLk51bWJlckRlcGVuZGVudFR5cGUoYXJyYXlEZXBlbmRlbnRUeXBlLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBuZXcgY2Fyb3VzZWxzVHlwZXMuVHlwZShjYXJvdXNlbHNUeXBlcy5UWVBFX0VOVU0uTlVNQkVSLCBmYWxzZSwgcmVzdWx0RGVwZW5kZW50VHlwZSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgY2Fyb3VzZWxzVHlwZXMuVHlwZShjYXJvdXNlbHNUeXBlcy5UWVBFX0VOVU0uTlVNQkVSLCBmYWxzZSk7XG4gICAgfVxuICB9XG5dOyIsImNvbnN0IGNhcm91c2Vsc1R5cGVzID0gcmVxdWlyZSgnLi4vYW5hbHl6ZS9zeW1ib2xzL3R5cGVzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gW1xuICB7XG4gICAgcnVsZToge1xuICAgICAgbm9kZVR5cGU6ICdkb3RFeHByZXNzaW9uJyxcbiAgICAgIG1hdGNoOiAnXjxhcnJheUBUPlxcXFwubGVuJCdcbiAgICB9LFxuICAgIHZhbHVlOiBmdW5jdGlvbiAobm9kZSwgYXJncywgY2hpbGRyZW4pIHtcbiAgICAgIGNvbnN0IGFycmF5VHlwZSA9IGNoaWxkcmVuLmxlZnQ7XG5cbiAgICAgIGlmIChhcnJheVR5cGUuZGF0YVR5cGUgPT09IGNhcm91c2Vsc1R5cGVzLkFSUkFZICYmIGFycmF5VHlwZS5oYXNEZXBlbmRlbnRUeXBlKCdsZW5ndGgnKSkge1xuICAgICAgICAvLyA8YXJyYXk+LmxlbigpIGlzIG9mIHR5cGU6IDwgPGFycmF5IDx0eXBlOiBhbnksIGxlbmd0aDogbj4+KCkgPT4gPG51bWJlciA8dmFsdWU6IG4+ID5cbiAgICAgICAgY29uc3QgYXJyYXlEZXBlbmRlbnRUeXBlID0gYXJyYXlUeXBlLmRlcGVuZGVudFR5cGU7XG4gICAgICAgIGNvbnN0IHJldHVybkRlcGVuZGVudFR5cGUgPSBuZXcgY2Fyb3VzZWxzVHlwZXMuTnVtYmVyRGVwZW5kZW50VHlwZShhcnJheURlcGVuZGVudFR5cGUubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgcmV0dXJuVHlwZSA9IG5ldyBjYXJvdXNlbHNUeXBlcy5UeXBlKGNhcm91c2Vsc1R5cGVzLlRZUEVfRU5VTS5OVU1CRVIsIGZhbHNlLCByZXR1cm5EZXBlbmRlbnRUeXBlKTtcblxuICAgICAgICByZXR1cm4gbmV3IGNhcm91c2Vsc1R5cGVzLkZ1bmN0aW9uVHlwZShhcnJheVR5cGUsIFtdLCByZXR1cm5UeXBlKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGxhaW5OdW1iZXJUeXBlID0gbmV3IGNhcm91c2Vsc1R5cGVzLlR5cGUoY2Fyb3VzZWxzVHlwZXMuVFlQRV9FTlVNLk5VTUJFUiwgZmFsc2UpO1xuICAgICAgcmV0dXJuIG5ldyBjYXJvdXNlbHNUeXBlcy5GdW5jdGlvblR5cGUobnVsbCwgW10sIHBsYWluTnVtYmVyVHlwZSk7XG4gICAgfVxuICB9XG5dOyIsImZ1bmN0aW9uIEVudW0oKSB7XG4gIHRoaXMuX19uYW1lID0gYXJndW1lbnRzWzBdO1xuICB0aGlzLl9fdmFsdWVzID0gQXJyYXkuZnJvbShhcmd1bWVudHMpLnNsaWNlKDEpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHZhbCA9IGFyZ3VtZW50c1tpXTtcbiAgICB0aGlzW3ZhbF0gPSB2YWw7XG5cbiAgICBpZiAoRW51bS5wcm90b3R5cGVbdmFsXSAhPSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB1c2UgcmVzZXJ2ZWQgdmFsdWUgXCInICsgdmFsICsgJ1wiIGluc2lkZSBFbnVtIFwiJyArIHRoaXMuX19uYW1lICsgJ1wiIScpO1xuICAgIH1cbiAgfVxufVxuXG5FbnVtLnByb3RvdHlwZS5fX25hbWUgPSAnRU5VTV9OQU1FJztcbkVudW0ucHJvdG90eXBlLl9faGFzID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gdGhpcy5fX3ZhbHVlcy5pbmRleE9mKHZhbCkgPiAtMTtcbn07XG5FbnVtLnByb3RvdHlwZS5fX2Fzc2VydCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgaWYgKCF0aGlzLl9faGFzKHZhbCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0lsbGVnYWwgdmFsdWUgXCInICsgdmFsICsgJ1wiIGZvciBFbnVtIFwiJyArIHRoaXMuX19uYW1lICsgJ1wiIScpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVudW07Il19
