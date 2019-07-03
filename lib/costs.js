var ops = ["share",
    "open",

    "sadd",
    "ssub",
    "smult",
    "sdiv",

    "cadd",
    "csub",
    "cmult",
    "cdiv",

    "lt",
    "lteq",
    "gt",
    "gteq",

    "clt",
    "clteq",
    "c>gt" ,
    "cgteq",

    "eq",
    "neq",

    "ceq",
    "cneq"
  ];

var costs = {
  "onlineRounds" : {
    "share": "1",
    "open": "2",

    "sadd": "3",
    "ssub": "0",
    "smult": "2",
    "sdiv":"b*b + 5b",

    "cadd": "0",
    "csub": "0",
    "cmult": "0",
    "cdiv": "2*(b+3)+5",

    "lt": "2*(b+3)",
    "lteq": "2*(b+3)",
    "gt": "2*(b+3)",
    "gteq": "2*(b+3)",

    "clt": "2*(b+3)",
    "clteq": "2*(b+3)",
    "c>gt" : "2*(b+3)",
    "cgteq": "2*(b+3)",

    "eq": "2*(b+4)",
    "neq": "2*(b+4)",

    "ceq": "2*(b+4)",
    "cneq": "2*(b+4)"
  },

  "offlineRounds" : {
    "share": "0",
    "open": "1",

    "sadd": "0",
    "ssub": "0",
    "smult": "2",
    "sdiv":"3",

    "cadd": "0",
    "csub": "0",
    "cmult": "0",
    "cdiv": "3",

    "lt": "3",
    "lteq": "3",
    "gt": "3",
    "gteq": "3  ",

    "clt": "3",
    "clteq": "3",
    "c>gt": "3",
    "cgteq": "3",

    "eq": "3",
    "neq": "3",

    "ceq": "3",
    "cneq": "3"
  },

  "onlineMsg" : {
    "share": "n*n", //should be s*r (senders*receivers, doing big oh)
    "open": "n + n*n", // should be s(1+r)

    "sadd": "0",
    "ssub": "0",
    "smult": "n*(n+1)", // 2n+n*(n-1)
    "sdiv":"b*b*n*n",

    "cadd": "0",
    "csub": "0",
    "cmult": "0",
    "cdiv": "b*n*n",

    "lt": "b*n*n",
    "lteq": "b*n*n",
    "gt": "b*n*n",
    "gteq": "b*n*n",

    "clt": "b*n*n",
    "clteq": "b*n*n",
    "c>gt": "b*n*n",
    "cgteq": "b*n*n",

    "eq": "b*n*n",
    "neq": "b*n*n",

    "ceq": "b*n*n",
    "cneq": "b*n*n"
  },

  "offlineMsg" : {
    "share": "0",
    "open": "n*n",

    "sadd": "0",
    "ssub": "0",
    "smult": "2*n*(n-1)",
    "sdiv":"b*2*b*(2*n+n*n)",

    "cadd": "0",
    "csub": "0",
    "cmult": "0",
    "cdiv": "4*b*(2*n+n*n)",

    "lt": "b*(2*n+n*n)",
    "lteq": "b*(2*n+n*n)",
    "gt": "b*(2*n+n*n)",
    "gteq": "b*(2*n+n*n)",

    "clt": "b*(2*n+n*n)",
    "clteq": "b*(2*n+n*n)",
    "c>gt:": "b*(2*n+n*n)",
    "cgteq": "b*(2*n+n*n)",

    "eq": "2*b*(2*n+n*n)",
    "neq": "2*b*(2*n+n*n)",

    "ceq": "2*b*(2*n+n*n)",
    "cneq": "2*b*(2*n+n*n)",
  }
}
