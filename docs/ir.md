# Description of our Intermediate Language

Every type of element in our language must have at least the following properties:

1. nodeType: string. The type of this node, the same as the title in what follows in camel case






## Logical Entities

These are logical entities that do not correspond to statements/expressions.

#### Type

1. secret: boolean
2. type: string

For now, it is ok for the type string to be exactly what the parser gives.






## Statements

These are statements but cannot be expressions.

#### functionDefinition

1. name: nameExpression
2. parameters: array<variable definition>
3. body: array<statements>
4. return type: type

#### returnStatement

1. expression: expression

## variableDefinition

1. name: nameExpression
2. type: type

#### forEach

1. iterator: variable definition (the loop variable)
2. range: rangeExpression
3. body: array<statements>

#### for

1. initial: statement
2. condition: expression
3. increment: statement






## Expressions

These can be expressions (or statements).

#### variableAssignment

1. name: nameExpression
2. expression: expression


#### if

1. condition: expression
2. ifBody: array<statements>
3. elseBody: array<statements> (empty if no else)

if else if else should be represented as:
```javascript
if(condition1) {
  // ifBody1
} else {
  // all of this is elseBody1
  if (condition2) {
    // ifBody2
  } else {
    // elseBody2
  }
}
```

_Note:_ The last statment in both if and else body is considered to be
the return value of this statement.

#### oblivIf

1. condition: expression
2. ifBody: array<statements>
3. elseBody: array<statements>

_Note_: The last statment in both if and else body is considered to be
the return value of this statement.

#### literalExpression

1. value: number | string | boolean

#### nameExpression

1. name: string

Represent variable or function names (no dots).

#### directExpression

1. operator: string ('+', '-', ...)
2. arity: number
3. operands: array<expression>

Binary and uniary expressions.

#### paranthesisExpression

1. expression: expression

#### arrayAccess

1. array: expression
2. index: expression

#### rangeExpression
1. start: expression
2. end: expression
3. increment: expression (optional)

#### sliceExpression

1. array: expression
2. range: rangeExpression

#### arrayExpression

1. elements: array<expression>

Represents a direct array value ([1, 2, 3] or [1, func(), 2 + 3]).

#### functionCall

1. function: nameExpression | dotExpression (the function name or obj.name etc)
2. params: array<expressions>

#### dotExpression

1. left: nameExpression | dotExpression
2. right: nameExpression
