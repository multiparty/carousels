// Similar to path tracker, but does not remove consumed scopes
// instead, it tracks elements like in the form of a tree matching their visit order
// mostly useful for pretty printing and debugging
const PLACEHOLDER = '###';

// a node in the tree
const Node = function (parent, element, children) {
  this.parent = parent;
  this.element = element;
  this.children = children;
};

function TreeTracker() {
  this.head = new Node(null, PLACEHOLDER, []);
  this.current = this.head;
  this._empty = true;
}

TreeTracker.prototype.addChild = function (element) {
  if (element == null) {
    element = PLACEHOLDER;
  } else {
    this._empty = false;
  }

  const newNode = new Node(this.current, element, []);
  this.current.children.push(newNode);
  this.current = newNode;
};

TreeTracker.prototype.setElement = function (element) {
  this._empty = false;
  this.current.element = element;
};

TreeTracker.prototype.toParent = function () {
  this.current = this.current.parent;
};

TreeTracker.prototype.empty = function () {
  return this._empty;
};

TreeTracker.prototype.traverse = function (enter, exit) {
  enter = enter ? enter : function () {};
  exit = exit ? exit : function () {};

  const _traverse = function (current) {
    const currentIsReal = current.element !== PLACEHOLDER;
    if (currentIsReal) {
      enter(current.element);
    }

    for (let i = 0; i < current.children.length; i++) {
      _traverse(current.children[i]);
    }

    if (currentIsReal) {
      exit(current.element);
    }
  };

  _traverse(this.head);
};

module.exports = TreeTracker;