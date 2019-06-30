(function(exports) {

  var onlineRounds = {
    "share": "1",
    "open": "2",

    "+": "0",
    "-": "0",
    "*": "2",
    "/":"b*b + 5b",

    "c+": "0",
    "c-": "0",
    "c*": "0",
    "c/": "2*(b+3)+5",

    "<": "2*(b+3)",
    "<=": "2*(b+3)",
    ">": "2*(b+3)",
    ">=": "2*(b+3)",

    "c<": "2*(b+3)",
    "c<=": "2*(b+3)",
    "c>": "2*(b+3)",
    "c>=": "2*(b+3)",

    "==": "2*(b+4)",
    "!=": "2*(b+4)",

    "c=": "2*(b+4)",
    "c!=": "2*(b+4)"
  };

  exports.onlineRounds = onlineRounds;
}((typeof exports == 'undefined' ? this.costs = {} : exports), typeof exports != 'undefined'));
