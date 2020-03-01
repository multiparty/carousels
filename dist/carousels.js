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

const analyze = function (IR, costs) {
  const visitor = new IRVisitor(IR);
  for (let i = 0; i < visitorImplementations.length; i++) {
    visitor.addVisitors(visitorImplementations[i]);
  }
  visitor.start();

  return 'b*2';
};

module.exports = analyze;
},{"../ir/visitor.js":19,"./visitors/array.js":3,"./visitors/expression.js":4,"./visitors/for.js":5,"./visitors/function.js":6,"./visitors/if.js":7,"./visitors/oblivIf.js":8,"./visitors/value.js":9,"./visitors/variable.js":10}],3:[function(require,module,exports){
const ArrayAccess = function (node, args) {};
const SliceExpression  = function (node, args) {};

module.exports = {
  ArrayAccess: ArrayAccess,
  SliceExpression: SliceExpression
};
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
const ForEach = function (node, args) {};
const For = function (node, args) {};

module.exports = {
  For: For,
  ForEach: ForEach
};
},{}],6:[function(require,module,exports){
const FunctionDefinition = function (node, args) {};

const ReturnStatement = function (node, args) {};

const FunctionCall = function (node, args) {};

module.exports = {
  FunctionDefinition: FunctionDefinition,
  ReturnStatement: ReturnStatement,
  FunctionCall: FunctionCall
};
},{}],7:[function(require,module,exports){
const If = function (node, args) {};

module.exports = {
  If: If
};
},{}],8:[function(require,module,exports){
const OblivIf = function (node, args) {};

module.exports = {
  OblivIf: OblivIf
};
},{}],9:[function(require,module,exports){
const ArrayExpression = function (node, args) {};
const RangeExpression = function (node, args) {};
const LiteralExpression = function (node, args) {};

module.exports = {
  ArrayExpression: ArrayExpression,
  RangeExpression: RangeExpression,
  LiteralExpression: LiteralExpression
};
},{}],10:[function(require,module,exports){
const TypeNode = function (node, args) {};
const VariableDefinition = function (node, args) {};
const VariableAssignment = function (node, args) {};

module.exports = {
  TypeNode: TypeNode,
  VariableDefinition: VariableDefinition,
  VariableAssignment: VariableAssignment
};
},{}],11:[function(require,module,exports){
const jiff = require('./jiff.json');
const rustBGW = require('./rustBGW.json');

module.exports = {
  jiff: jiff,
  rustBGW: rustBGW
};
},{"./jiff.json":12,"./rustBGW.json":13}],12:[function(require,module,exports){
module.exports={
  "parameters": [
    {"parameter": "p", "description": "number of parties"},
    {"parameter": "b", "description": "number of bits in field"}
  ],
  "metrics": [
    "Online Messages",
    "Online Rounds"
  ],
  "operations": [
    {
      "rule": {
        "nodeType": "FunctionCall",
        "match": "^jiffClient\\.share(@P)$"
      },
      "cost": "p-1"
    },
    {
      "rule": {
        "nodeType": "FunctionCall",
        "match": "^<type:number,secret:true>\\.smult(<type:number,secret:true>@P)$"
      },
      "cost": "p-1"
    }
  ]
}
},{}],13:[function(require,module,exports){
module.exports={
  "parameters": [
    {"parameter": "p", "description": "number of parties"},
    {"parameter": "b", "description": "number of bits in field"}
  ],
  "metrics": [
    "Online Messages",
    "Online Rounds"
  ],
  "operations": [
    {
      "rule": {
        "nodeType": "DirectExpression",
        "match": "^<type:number,secret:true>\\+<type:number,secret:true>$"
      },
      "cost": {
        "Online Messages": "0",
        "Online Rounds": "0"
      }
    },
    {
      "rule": {
        "nodeType": "DirectExpression",
        "match": "^<type:number,secret:true>\\*<type:number,secret:true>$"
      },
      "cost": {
        "Online Messages": "p-1",
        "Online Rounds": "1"
      }
    },
    {
      "rule": {
        "nodeType": "DirectExpression",
        "match": "^<type:number,secret:true><<type:number,secret:true>$"
      },
      "cost": {
        "Online Messages": "b*(p-1)",
        "Online Rounds": "b-1"
      }
    }
  ]
}
},{}],14:[function(require,module,exports){
const costs = require('./costs/index.js');
const parsers = require('./ir/parsers.js');
const analyze = require('./analyze/analyze.js');

module.exports = {
  costs: costs,
  parsers: parsers,
  analyze: analyze
};
},{"./analyze/analyze.js":2,"./costs/index.js":11,"./ir/parsers.js":17}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
const parseJavascript = function (code) {
  return {};
};

module.exports = parseJavascript;
},{}],17:[function(require,module,exports){
const rust = require('./rust.js');
const javascript = require('./javascript.js');

module.exports = {
  rust: rust,
  javascript: javascript
};
},{"./javascript.js":16,"./rust.js":18}],18:[function(require,module,exports){
const IR = require('../../docs/merge_sort_dedup_ir.json');
// TODO: require wasm bundle from rust/dist/bundle.js and use it to parse into IR
const parseRust = function (code) {
  return IR;
};

module.exports = parseRust;
},{"../../docs/merge_sort_dedup_ir.json":1}],19:[function(require,module,exports){
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
},{"./ir.js":15}]},{},[14])(14)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkb2NzL21lcmdlX3NvcnRfZGVkdXBfaXIuanNvbiIsInNyYy9hbmFseXplL2FuYWx5emUuanMiLCJzcmMvYW5hbHl6ZS92aXNpdG9ycy9hcnJheS5qcyIsInNyYy9hbmFseXplL3Zpc2l0b3JzL2V4cHJlc3Npb24uanMiLCJzcmMvYW5hbHl6ZS92aXNpdG9ycy9mb3IuanMiLCJzcmMvYW5hbHl6ZS92aXNpdG9ycy9mdW5jdGlvbi5qcyIsInNyYy9hbmFseXplL3Zpc2l0b3JzL2lmLmpzIiwic3JjL2FuYWx5emUvdmlzaXRvcnMvb2JsaXZJZi5qcyIsInNyYy9hbmFseXplL3Zpc2l0b3JzL3ZhbHVlLmpzIiwic3JjL2FuYWx5emUvdmlzaXRvcnMvdmFyaWFibGUuanMiLCJzcmMvY29zdHMvaW5kZXguanMiLCJzcmMvY29zdHMvamlmZi5qc29uIiwic3JjL2Nvc3RzL3J1c3RCR1cuanNvbiIsInNyYy9pbmRleC5qcyIsInNyYy9pci9pci5qcyIsInNyYy9pci9qYXZhc2NyaXB0LmpzIiwic3JjL2lyL3BhcnNlcnMuanMiLCJzcmMvaXIvcnVzdC5qcyIsInNyYy9pci92aXNpdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibW9kdWxlLmV4cG9ydHM9W1xuICB7XG4gICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uRGVmaW5pdGlvblwiLFxuICAgIFwibmFtZVwiOiB7XG4gICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgIFwibmFtZVwiOiBcIm1lcmdlX3NvcnRfZGVkdXBcIlxuICAgIH0sXG4gICAgXCJwYXJhbWV0ZXJzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIlZhcmlhYmxlRGVmaW5pdGlvblwiLFxuICAgICAgICBcIm5hbWVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgIFwibmFtZVwiOiBcImFcIlxuICAgICAgICB9LFxuICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgIFwic2VjcmV0XCI6IHRydWUsXG4gICAgICAgICAgXCJ0eXBlXCI6IFwiYXJyYXlcIlxuICAgICAgICB9XG4gICAgICB9XG4gICAgXSxcbiAgICBcInJldHVyblR5cGVcIjoge1xuICAgICAgXCJub2RlVHlwZVwiOiBcIlR5cGVOb2RlXCIsXG4gICAgICBcInNlY3JldFwiOiB0cnVlLFxuICAgICAgXCJ0eXBlXCI6IFwiYXJyYXlcIlxuICAgIH0sXG4gICAgXCJib2R5XCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIlZhcmlhYmxlRGVmaW5pdGlvblwiLFxuICAgICAgICBcIm5hbWVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgIFwibmFtZVwiOiBcIm5cIlxuICAgICAgICB9LFxuICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgIFwic2VjcmV0XCI6IGZhbHNlLFxuICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJWYXJpYWJsZUFzc2lnbm1lbnRcIixcbiAgICAgICAgXCJuYW1lXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgICAgICBcIm5hbWVcIjogXCJuXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCJleHByZXNzaW9uXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRnVuY3Rpb25DYWxsXCIsXG4gICAgICAgICAgXCJmdW5jdGlvblwiOiB7XG4gICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRG90RXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgXCJsZWZ0XCI6IFwiYVwiLFxuICAgICAgICAgICAgXCJyaWdodFwiOiBcImxlblwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInBhcmFtZXRlcnNcIjogW11cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIklmXCIsXG4gICAgICAgIFwiY29uZGl0aW9uXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICAgIFwib3BlcmF0b3JcIjogXCI+XCIsXG4gICAgICAgICAgXCJhcml0eVwiOiAyLFxuICAgICAgICAgIFwib3BlcmFuZHNcIjogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiblwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTGl0ZXJhbEV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICBcImlmQm9keVwiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIlZhcmlhYmxlRGVmaW5pdGlvblwiLFxuICAgICAgICAgICAgXCJuYW1lXCI6IHtcbiAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgIFwibmFtZVwiOiBcIm1cIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHlwZVwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgICAgICBcInNlY3JldFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJWYXJpYWJsZUFzc2lnbm1lbnRcIixcbiAgICAgICAgICAgIFwibmFtZVwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJtXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImV4cHJlc3Npb25cIjoge1xuICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICBcIm9wZXJhdG9yXCI6IFwiL1wiLFxuICAgICAgICAgICAgICBcImFyaXR5XCI6IDIsXG4gICAgICAgICAgICAgIFwib3BlcmFuZHNcIjogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiblwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTGl0ZXJhbEV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogMlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICAgICAgXCJmdW5jdGlvblwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJtZXJnZV9kZWR1cFwiXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJwYXJhbWV0ZXJzXCI6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJGdW5jdGlvbkNhbGxcIixcbiAgICAgICAgICAgICAgICBcImZ1bmN0aW9uXCI6IHtcbiAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibWVyZ2Vfc29ydF9kZWR1cFwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInBhcmFtZXRlcnNcIjogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiU2xpY2VFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYXJyYXlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcImFcIlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBcInJhbmdlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiUmFuZ2VFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJzdGFydFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJMaXRlcmFsRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiAwXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBcImVuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibVwiXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICAgICAgICAgIFwiZnVuY3Rpb25cIjoge1xuICAgICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJtZXJnZV9zb3J0X2RlZHVwXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFwicGFyYW1ldGVyc1wiOiBbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJTbGljZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgICAgXCJhcnJheVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiYVwiXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwicmFuZ2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJSYW5nZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgICAgICBcInN0YXJ0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwibVwiXG4gICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICBcImVuZFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiTmFtZUV4cHJlc3Npb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcIm5cIlxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgXCJlbHNlQm9keVwiOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICAgICAgXCJmdW5jdGlvblwiOiB7XG4gICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJEb3RFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgIFwibGVmdFwiOiB7XG4gICAgICAgICAgICAgICAgXCJub2RlVHlwZVwiOiBcIk5hbWVFeHByZXNzaW9uXCIsXG4gICAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiYVwiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIFwicmlnaHRcIjoge1xuICAgICAgICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJOYW1lRXhwcmVzc2lvblwiLFxuICAgICAgICAgICAgICAgIFwibmFtZVwiOiBcInRvX293bmVkXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwicGFyYW1ldGVyc1wiOiBbXVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwibm9kZVR5cGVcIjogXCJGdW5jdGlvbkRlZmluaXRpb25cIixcbiAgICBcIm5hbWVcIjogXCJtZXJnZV9kZWR1cFwiLFxuICAgIFwicGFyYW1ldGVyc1wiOiBbXG4gICAgICB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJWYXJpYWJsZURlZmluaXRpb25cIixcbiAgICAgICAgXCJuYW1lXCI6IFwiYVwiLFxuICAgICAgICBcInR5cGVcIjoge1xuICAgICAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgICAgIFwic2VjcmV0XCI6IHRydWUsXG4gICAgICAgICAgXCJ0eXBlXCI6IFwiYXJyYXlcIlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBcIm5vZGVUeXBlXCI6IFwiVmFyaWFibGVEZWZpbml0aW9uXCIsXG4gICAgICAgIFwibmFtZVwiOiBcImJcIixcbiAgICAgICAgXCJ0eXBlXCI6IHtcbiAgICAgICAgICBcIm5vZGVUeXBlXCI6IFwiVHlwZU5vZGVcIixcbiAgICAgICAgICBcInNlY3JldFwiOiB0cnVlLFxuICAgICAgICAgIFwidHlwZVwiOiBcImFycmF5XCJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0sXG4gICAgXCJyZXR1cm5UeXBlXCI6IHtcbiAgICAgIFwibm9kZVR5cGVcIjogXCJUeXBlTm9kZVwiLFxuICAgICAgXCJzZWNyZXRcIjogdHJ1ZSxcbiAgICAgIFwidHlwZVwiOiBcImFycmF5XCJcbiAgICB9LFxuICAgIFwiYm9keVwiOiBbXG4gICAgXVxuICB9XG5dXG4iLCJjb25zdCBJUlZpc2l0b3IgPSByZXF1aXJlKCcuLi9pci92aXNpdG9yLmpzJyk7XG5jb25zdCB2aXNpdG9ySW1wbGVtZW50YXRpb25zID0gW1xuICByZXF1aXJlKCcuL3Zpc2l0b3JzL2FycmF5LmpzJyksXG4gIHJlcXVpcmUoJy4vdmlzaXRvcnMvZXhwcmVzc2lvbi5qcycpLFxuICByZXF1aXJlKCcuL3Zpc2l0b3JzL2Zvci5qcycpLFxuICByZXF1aXJlKCcuL3Zpc2l0b3JzL2Z1bmN0aW9uLmpzJyksXG4gIHJlcXVpcmUoJy4vdmlzaXRvcnMvaWYuanMnKSxcbiAgcmVxdWlyZSgnLi92aXNpdG9ycy9vYmxpdklmLmpzJyksXG4gIHJlcXVpcmUoJy4vdmlzaXRvcnMvdmFsdWUuanMnKSxcbiAgcmVxdWlyZSgnLi92aXNpdG9ycy92YXJpYWJsZS5qcycpXG5dO1xuXG5jb25zdCBhbmFseXplID0gZnVuY3Rpb24gKElSLCBjb3N0cykge1xuICBjb25zdCB2aXNpdG9yID0gbmV3IElSVmlzaXRvcihJUik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmlzaXRvckltcGxlbWVudGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIHZpc2l0b3IuYWRkVmlzaXRvcnModmlzaXRvckltcGxlbWVudGF0aW9uc1tpXSk7XG4gIH1cbiAgdmlzaXRvci5zdGFydCgpO1xuXG4gIHJldHVybiAnYioyJztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYW5hbHl6ZTsiLCJjb25zdCBBcnJheUFjY2VzcyA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcbmNvbnN0IFNsaWNlRXhwcmVzc2lvbiAgPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBBcnJheUFjY2VzczogQXJyYXlBY2Nlc3MsXG4gIFNsaWNlRXhwcmVzc2lvbjogU2xpY2VFeHByZXNzaW9uXG59OyIsImNvbnN0IFBhcmVudGhlc2VzRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcbmNvbnN0IERpcmVjdEV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBEb3RFeHByZXNzaW9uID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuY29uc3QgTmFtZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBQYXJlbnRoZXNlc0V4cHJlc3Npb246IFBhcmVudGhlc2VzRXhwcmVzc2lvbixcbiAgRGlyZWN0RXhwcmVzc2lvbjogRGlyZWN0RXhwcmVzc2lvbixcbiAgRG90RXhwcmVzc2lvbjogRG90RXhwcmVzc2lvbixcbiAgTmFtZUV4cHJlc3Npb246IE5hbWVFeHByZXNzaW9uXG59OyIsImNvbnN0IEZvckVhY2ggPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBGb3IgPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBGb3I6IEZvcixcbiAgRm9yRWFjaDogRm9yRWFjaFxufTsiLCJjb25zdCBGdW5jdGlvbkRlZmluaXRpb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5cbmNvbnN0IFJldHVyblN0YXRlbWVudCA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcblxuY29uc3QgRnVuY3Rpb25DYWxsID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRnVuY3Rpb25EZWZpbml0aW9uOiBGdW5jdGlvbkRlZmluaXRpb24sXG4gIFJldHVyblN0YXRlbWVudDogUmV0dXJuU3RhdGVtZW50LFxuICBGdW5jdGlvbkNhbGw6IEZ1bmN0aW9uQ2FsbFxufTsiLCJjb25zdCBJZiA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIElmOiBJZlxufTsiLCJjb25zdCBPYmxpdklmID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgT2JsaXZJZjogT2JsaXZJZlxufTsiLCJjb25zdCBBcnJheUV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBSYW5nZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAobm9kZSwgYXJncykge307XG5jb25zdCBMaXRlcmFsRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChub2RlLCBhcmdzKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFycmF5RXhwcmVzc2lvbjogQXJyYXlFeHByZXNzaW9uLFxuICBSYW5nZUV4cHJlc3Npb246IFJhbmdlRXhwcmVzc2lvbixcbiAgTGl0ZXJhbEV4cHJlc3Npb246IExpdGVyYWxFeHByZXNzaW9uXG59OyIsImNvbnN0IFR5cGVOb2RlID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuY29uc3QgVmFyaWFibGVEZWZpbml0aW9uID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuY29uc3QgVmFyaWFibGVBc3NpZ25tZW50ID0gZnVuY3Rpb24gKG5vZGUsIGFyZ3MpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZU5vZGU6IFR5cGVOb2RlLFxuICBWYXJpYWJsZURlZmluaXRpb246IFZhcmlhYmxlRGVmaW5pdGlvbixcbiAgVmFyaWFibGVBc3NpZ25tZW50OiBWYXJpYWJsZUFzc2lnbm1lbnRcbn07IiwiY29uc3QgamlmZiA9IHJlcXVpcmUoJy4vamlmZi5qc29uJyk7XG5jb25zdCBydXN0QkdXID0gcmVxdWlyZSgnLi9ydXN0QkdXLmpzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGppZmY6IGppZmYsXG4gIHJ1c3RCR1c6IHJ1c3RCR1dcbn07IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcInBhcmFtZXRlcnNcIjogW1xuICAgIHtcInBhcmFtZXRlclwiOiBcInBcIiwgXCJkZXNjcmlwdGlvblwiOiBcIm51bWJlciBvZiBwYXJ0aWVzXCJ9LFxuICAgIHtcInBhcmFtZXRlclwiOiBcImJcIiwgXCJkZXNjcmlwdGlvblwiOiBcIm51bWJlciBvZiBiaXRzIGluIGZpZWxkXCJ9XG4gIF0sXG4gIFwibWV0cmljc1wiOiBbXG4gICAgXCJPbmxpbmUgTWVzc2FnZXNcIixcbiAgICBcIk9ubGluZSBSb3VuZHNcIlxuICBdLFxuICBcIm9wZXJhdGlvbnNcIjogW1xuICAgIHtcbiAgICAgIFwicnVsZVwiOiB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJGdW5jdGlvbkNhbGxcIixcbiAgICAgICAgXCJtYXRjaFwiOiBcIl5qaWZmQ2xpZW50XFxcXC5zaGFyZShAUCkkXCJcbiAgICAgIH0sXG4gICAgICBcImNvc3RcIjogXCJwLTFcIlxuICAgIH0sXG4gICAge1xuICAgICAgXCJydWxlXCI6IHtcbiAgICAgICAgXCJub2RlVHlwZVwiOiBcIkZ1bmN0aW9uQ2FsbFwiLFxuICAgICAgICBcIm1hdGNoXCI6IFwiXjx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT5cXFxcLnNtdWx0KDx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT5AUCkkXCJcbiAgICAgIH0sXG4gICAgICBcImNvc3RcIjogXCJwLTFcIlxuICAgIH1cbiAgXVxufSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJwYXJhbWV0ZXJzXCI6IFtcbiAgICB7XCJwYXJhbWV0ZXJcIjogXCJwXCIsIFwiZGVzY3JpcHRpb25cIjogXCJudW1iZXIgb2YgcGFydGllc1wifSxcbiAgICB7XCJwYXJhbWV0ZXJcIjogXCJiXCIsIFwiZGVzY3JpcHRpb25cIjogXCJudW1iZXIgb2YgYml0cyBpbiBmaWVsZFwifVxuICBdLFxuICBcIm1ldHJpY3NcIjogW1xuICAgIFwiT25saW5lIE1lc3NhZ2VzXCIsXG4gICAgXCJPbmxpbmUgUm91bmRzXCJcbiAgXSxcbiAgXCJvcGVyYXRpb25zXCI6IFtcbiAgICB7XG4gICAgICBcInJ1bGVcIjoge1xuICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICBcIm1hdGNoXCI6IFwiXjx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT5cXFxcKzx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT4kXCJcbiAgICAgIH0sXG4gICAgICBcImNvc3RcIjoge1xuICAgICAgICBcIk9ubGluZSBNZXNzYWdlc1wiOiBcIjBcIixcbiAgICAgICAgXCJPbmxpbmUgUm91bmRzXCI6IFwiMFwiXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInJ1bGVcIjoge1xuICAgICAgICBcIm5vZGVUeXBlXCI6IFwiRGlyZWN0RXhwcmVzc2lvblwiLFxuICAgICAgICBcIm1hdGNoXCI6IFwiXjx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT5cXFxcKjx0eXBlOm51bWJlcixzZWNyZXQ6dHJ1ZT4kXCJcbiAgICAgIH0sXG4gICAgICBcImNvc3RcIjoge1xuICAgICAgICBcIk9ubGluZSBNZXNzYWdlc1wiOiBcInAtMVwiLFxuICAgICAgICBcIk9ubGluZSBSb3VuZHNcIjogXCIxXCJcbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwicnVsZVwiOiB7XG4gICAgICAgIFwibm9kZVR5cGVcIjogXCJEaXJlY3RFeHByZXNzaW9uXCIsXG4gICAgICAgIFwibWF0Y2hcIjogXCJePHR5cGU6bnVtYmVyLHNlY3JldDp0cnVlPjw8dHlwZTpudW1iZXIsc2VjcmV0OnRydWU+JFwiXG4gICAgICB9LFxuICAgICAgXCJjb3N0XCI6IHtcbiAgICAgICAgXCJPbmxpbmUgTWVzc2FnZXNcIjogXCJiKihwLTEpXCIsXG4gICAgICAgIFwiT25saW5lIFJvdW5kc1wiOiBcImItMVwiXG4gICAgICB9XG4gICAgfVxuICBdXG59IiwiY29uc3QgY29zdHMgPSByZXF1aXJlKCcuL2Nvc3RzL2luZGV4LmpzJyk7XG5jb25zdCBwYXJzZXJzID0gcmVxdWlyZSgnLi9pci9wYXJzZXJzLmpzJyk7XG5jb25zdCBhbmFseXplID0gcmVxdWlyZSgnLi9hbmFseXplL2FuYWx5emUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvc3RzOiBjb3N0cyxcbiAgcGFyc2VyczogcGFyc2VycyxcbiAgYW5hbHl6ZTogYW5hbHl6ZVxufTsiLCIvLyBBbGwgbm9kZSB0eXBlcyB0aGF0IGNhbiBiZSB2aXNpdGVkXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgLy8gbG9naWNhbCBub2Rlc1xuICAnVHlwZU5vZGUnLFxuICAvLyBzdGF0ZW1lbnRzXG4gICdGdW5jdGlvbkRlZmluaXRpb24nLFxuICAnUmV0dXJuU3RhdGVtZW50JyxcbiAgJ1ZhcmlhYmxlRGVmaW5pdGlvbicsXG4gICdGb3JFYWNoJyxcbiAgJ0ZvcicsXG4gICdWYXJpYWJsZUFzc2lnbm1lbnQnLFxuICAvLyBleHByZXNzaW9uc1xuICAnSWYnLFxuICAnT2JsaXZJZicsXG4gICdMaXRlcmFsRXhwcmVzc2lvbicsXG4gICdOYW1lRXhwcmVzc2lvbicsXG4gICdEaXJlY3RFeHByZXNzaW9uJyxcbiAgJ1BhcmVudGhlc2VzRXhwcmVzc2lvbicsXG4gICdBcnJheUFjY2VzcycsXG4gICdSYW5nZUV4cHJlc3Npb24nLFxuICAnU2xpY2VFeHByZXNzaW9uJyxcbiAgJ0FycmF5RXhwcmVzc2lvbicsXG4gICdGdW5jdGlvbkNhbGwnLFxuICAnRG90RXhwcmVzc2lvbidcbl07IiwiY29uc3QgcGFyc2VKYXZhc2NyaXB0ID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgcmV0dXJuIHt9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZUphdmFzY3JpcHQ7IiwiY29uc3QgcnVzdCA9IHJlcXVpcmUoJy4vcnVzdC5qcycpO1xuY29uc3QgamF2YXNjcmlwdCA9IHJlcXVpcmUoJy4vamF2YXNjcmlwdC5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcnVzdDogcnVzdCxcbiAgamF2YXNjcmlwdDogamF2YXNjcmlwdFxufTsiLCJjb25zdCBJUiA9IHJlcXVpcmUoJy4uLy4uL2RvY3MvbWVyZ2Vfc29ydF9kZWR1cF9pci5qc29uJyk7XG4vLyBUT0RPOiByZXF1aXJlIHdhc20gYnVuZGxlIGZyb20gcnVzdC9kaXN0L2J1bmRsZS5qcyBhbmQgdXNlIGl0IHRvIHBhcnNlIGludG8gSVJcbmNvbnN0IHBhcnNlUnVzdCA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gIHJldHVybiBJUjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VSdXN0OyIsImNvbnN0IElSX05PREVTID0gcmVxdWlyZSgnLi9pci5qcycpO1xuXG4vLyBUaGUgdmlzaXRvciBjbGFzc1xuZnVuY3Rpb24gSVJWaXNpdG9yKGFyZ3MpIHtcbiAgdGhpcy5hcmdzID0gYXJncztcbn1cblxuLy8gU3RhcnQgdmlzaXRpbmdcbklSVmlzaXRvci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbiAoSVJOb2RlLCBhcmdzKSB7XG4gIHRoaXMudmlzaXQoSVJOb2RlLCBhcmdzKTtcbn07XG5cbklSVmlzaXRvci5wcm90b3R5cGUudmlzaXQgPSBmdW5jdGlvbiAobm9kZSwgYXJncykge1xuICBpZiAobm9kZSA9PSBudWxsIHx8IG5vZGUubm9kZVR5cGUgPT0gbnVsbCkge1xuICAgIHJldHVybiBhcmdzO1xuICB9XG4gIHJldHVybiB0aGlzWyd2aXNpdCcrbm9kZS5ub2RlVHlwZV0obm9kZSwgYXJncyk7XG59O1xuXG5JUlZpc2l0b3IucHJvdG90eXBlLmFkZFZpc2l0b3IgPSBmdW5jdGlvbiAobm9kZVR5cGUsIHZpc2l0b3JGdW5jdGlvbikge1xuICBpZiAoSVJfTk9ERVMuaW5kZXhPZihub2RlVHlwZSkgPT09IC0xKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gYWRkIHZpc2l0b3IgZm9yIGlsbGVnYWwgbm9kZSB0eXBlIFwiJyArIG5vZGVUeXBlICsgJ1wiIScpO1xuICB9XG5cbiAgdGhpc1sndmlzaXQnK25vZGVUeXBlXSA9IHZpc2l0b3JGdW5jdGlvbi5iaW5kKHRoaXMpO1xufTtcblxuSVJWaXNpdG9yLnByb3RvdHlwZS5hZGRWaXNpdG9ycyA9IGZ1bmN0aW9uICh2aXNpdG9yc01hcCkge1xuICBmb3IgKGxldCBub2RlVHlwZSBpbiB2aXNpdG9yc01hcCkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmlzaXRvcnNNYXAsIG5vZGVUeXBlKSkge1xuICAgICAgdGhpcy5hZGRWaXNpdG9yKG5vZGVUeXBlLCB2aXNpdG9yc01hcFtub2RlVHlwZV0pO1xuICAgIH1cbiAgfVxufTtcblxuLy8gRGVmYXVsdCB2aXNpdG9yIHVzZWQgZm9yIG5vZGUgdHlwZXMgZm9yIHdoaWNoIGEgdXNlciB2aXNpdG9yIHdhcyBub3Qgc2V0XG5jb25zdCBkZWZhdWx0VmlzaXRvciA9IGZ1bmN0aW9uIChub2RlVHlwZSwgbm9kZSwgYXJncykge1xuICBjb25zb2xlLmxvZygnV2FybmluZzogdmlzaXRvciBmdW5jdGlvbiBmb3InLCBub2RlVHlwZSwgJ2lzIHVuZGVmaW5lZCEnKTtcbiAgcmV0dXJuIGFyZ3M7XG59O1xuZm9yIChsZXQgaSA9IDA7IGkgPCBJUl9OT0RFUy5sZW5ndGg7IGkrKykge1xuICBjb25zdCBub2RlVHlwZSA9IElSX05PREVTW2ldO1xuICBJUlZpc2l0b3IucHJvdG90eXBlWyd2aXNpdCcrbm9kZVR5cGVdID0gZGVmYXVsdFZpc2l0b3IuYmluZChudWxsLCBub2RlVHlwZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSVJWaXNpdG9yOyJdfQ==
