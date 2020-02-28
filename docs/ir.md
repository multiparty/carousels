# Description of our Intermediate Language

Every type of element in our language must have at least the following properties:

1. nodeType: string. The type of this node, the same as the title in what follows with the same casing.




## Logical Entities

These are logical entities that do not correspond to statements/expressions.

#### TypeNode

1. secret: boolean
2. type: string

For now, it is ok for the type string to be either array or number




## Statement

These node types are statements but cannot be expressions.

#### FunctionDefinition

1. name: NameExpression
2. parameters: array<VariableDefinition>
3. body: array<Statement>
4. return type: TypeNode

#### ReturnStatement

1. expression: Expression

#### VariableDefinition

1. name: NameExpression
2. type: TypeNode

#### ForEach

1. iteratorDefinition: VariableDefinition (the loop variable)
2. range: rangeExpression
3. body: array<statements>

#### For

1. initial: array<Statement> (includes potentially several VariableDefinition and VariableAssignments)
2. condition: Expression
3. increment: array<Statement>
4. body: array<statement>




## Expressions

These can be expressions (or statements).

#### VariableAssignment

1. name: NameExpression
2. expression: Expression


#### If

1. condition: Expression
2. ifBody: array<Statement>
3. elseBody: array<Statement> (empty if no else)

if { } else if { } else { } should be represented as:
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

_Note:_ The last statement in both if and else body is considered to be
the return value of this statement.

#### OblivIf

1. condition: Expression
2. ifBody: array<Statement>
3. elseBody: array<Statement>

_Note_: The last statement in both if and else body is considered to be
the return value of this statement.

#### LiteralExpression

1. value: number | string | boolean

#### NameExpression

1. name: string

Represent variable or function names (no dots).

#### DirectExpression

1. operator: string ('+', '-', ...)
2. arity: number
3. operands: array<Expression>

Binary and unary expressions.

#### ParenthesesExpression

1. expression: Expression

#### ArrayAccess

1. array: Expression
2. index: Expression

#### RangeExpression
1. start: Expression
2. end: Expression
3. increment: Expression (optional)

#### SliceExpression

1. array: Expression
2. range: RangeExpression

#### ArrayExpression
1. elements: array<Expression>

Represents a direct array value ([1, 2, 3] or [1, func(), 2 + 3]).

#### FunctionCall

1. function: NameExpression | DotExpression (the function name or obj.name etc)
2. parameters: array<Expression>

#### DotExpression

1. left: NameExpression | DotExpression
2. right: NameExpression
