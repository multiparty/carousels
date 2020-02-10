/**
 * polynomium.js
 * https://github.com/lapets/polynomium
 *
 * Library for symbolically representing and working with polynomials.
 *
 * @namespace polynomium
 */

(function (polynomium) {

  /**
   * Wrapper because parseInt expects two arguments; we need a wrapper
   * for use with Array.map().
   */
  function num(s) {
    return parseInt(s);
  }

  /**
   * Zip two arrays.
   */
  function _zip(xs, ys) {
    var zs = [];
    for (var i = 0; i < xs.length && i < ys.length; i++)
      zs.push([xs[i], ys[i]]);
    return zs;
  }

  /**
   * Unzip array of pairs.
   */
  function _unzip(xys) {
    var xs = [], ys = [];
    for (var i = 0; i < xys.length; i++) {
      xs.push(xys[i][0]);
      ys.push(xys[i][1]);
    }
    return [xs, ys];
  }

  /**
   * Convert array of pairs into an object.
   */
  function _obj(xys) {
    var o = {};
    for (var i = 0; i < xys.length; i++)
      o[xys[i][0]] = xys[i][1];
    return o;
  }

  /**
   * Check whether an object has any attributes.
   */
  function _emp(obj) {
    for (var key in obj)
      if(obj.hasOwnProperty(key))
        return false;
    return JSON.stringify(obj) === JSON.stringify({});
  }

  /**
   * Retrieve by key from a dictionary (returning default if key is not mapped).
   */
  function _get_default(obj, key, val) {
    return (key in obj) ? obj[key] : val;
  }

  /**
   * Apply operation to a value deep within a dictionary (creating it
   * if necessary).
   */
  function _op_default(obj, path, val, op, arg) {
    if (path.length == 1) {
      if (!(path[0] in obj))
        obj[path[0]] = val;
      obj[path[0]] = op(obj[path[0]], arg);
    } else {
      if (!(path[0] in obj))
        obj[path[0]] = {};
      _op_default(obj[path[0]], path.slice(1), val, op, arg);
    }
  }

  /**
   * Add to a value deep within a dictionary (creating it if necessary).
   */
  function _add_default(obj, path, val, add) {
    return _op_default(obj, path, val, function (x,y) { return x+y; }, add) ;
  }

  /**
   * In case Object.entries() is not available.
   */
  function _entries(obj) {
    var entries = [];
	for (var key in obj)
	  entries.push([key, obj[key]]);
	return entries;
  }

  /**
   * Filter function for objects.
   */
  function _flt(obj, f) {
    var out = {};
    for (var key in obj)
      if (f(obj[key]))
        out[key] = obj[key];
    return out;
  }

  /**
   * Key-wise addition of two objects.
   */
  function _add(o1, o2) {
    var ks = [];
    for (var k in o1)
      ks.push(k);
    for (var k in o2)
      if (!(k in o1))
        ks.push(k);
    var o = {};
    for (var i = 0; i < ks.length; i++)
      o[ks[i]] = _get_default(o1, ks[i], 0) + _get_default(o2, ks[i], 0);
    return o;
  }

  /**
   * Build a polynomial as a function object.
   * @memberof polynomium
   * @param {object} terms - the object representation of the polynomial.
   * @return {polynomial-object} the polynomial represented as a function object.
   */
  polynomium.create = function(terms_or_obj) {
    var terms = ('polynomium' in terms_or_obj) ? terms_or_obj.terms : terms_or_obj;
    var f = function (bindings) { return f.evaluate(bindings); };
    f.polynomium = true;
    f.terms = terms;
    f.toString = function () { return polynomium.toString(f); };
    f.toObject = function () { return polynomium.toObject(f); };
    f.add = function (g) { return polynomium.add(f, g); };
    f.maxCoefficients = function (g) { return polynomium.maxCoefficients(f, g); };
    f.mul = function (g) { return polynomium.mul(f, g); };
    f.evaluate = function (bindings) { return polynomium.evaluate(f, bindings); };
    return f;
  }

  /**
   * Build a polynomial consisting of a single variable.
   * @memberof polynomium
   * @param {string} v - the string representation of the variable name.
   * @return {polynomial-object} the polynomial consisting of a single variable.
   * @throws error if the supplied string is not a valid variable name.
   */
  polynomium.variable = function (v) {
    if (typeof v === "string" && /^(([a-zA-Z])([a-zA-Z0-9]*))$/.test(v)) {
      var terms = {"#": {"1": 0}};
      terms[v] = {"1": 1};    
      return polynomium.create(terms);
    } else {
      throw new Error("Variable name must be an alphanumeric string that begins with a letter");
    }
  };
  polynomium.v = polynomium.variable;

  /**
   * Build a polynomial consisting of a single constant.
   * @memberof polynomium
   * @param {number} c - a numeric value representing the constant.
   * @return {polynomial-object} the polynomial consisting of a single constant.
   * @throws error if the supplied constant is not of a numeric type.
   */
  polynomium.constant = function (c) {
    if (typeof c === "number") {
      return polynomium.create({"#": {"1": c}});
    } else {
      throw new Error("Constant must be of a numeric type");
    }
  };
  polynomium.c = polynomium.constant;

  /**
   * Return a human-readable string representation of a polynomial object.
   * @memberof polynomium
   * @param {polynomial-object} p - a polynomial to display as a string.
   * @return {string} a string representation of the polynomial.
   */
  polynomium.toString = function (p) {
    var indexed = [];
    for (var base in p.terms) {
      var vs = base.split(",");
      for (var exps in p.terms[base]) {
        var es = exps.split(",").map(num);
        var term = [];
        var index = 0; // Term significance (i.e., sum of exponents).
        for (var i = 0; i < es.length; i++) {
          term.push(vs[i] + ((es[i] == 1) ? "" : ("^"+es[i])));
          index += (vs[i] != "#") ? es[i] : 0; // For sorting by significance.
        }
        var a = p.terms[base][exps], hasVars = !(term.length == 1 && term[0] == "#");
        if (Math.abs(a) > 0) { // This may drop all terms, so restore zero later.
          term = term.filter(function (v) { return v != "#"; });
          var oper = " + ";
          if (a < 0) { // Move negation symbol from term and into operator position.
            a = Math.abs(a);
            oper = " - ";
          }
          if (hasVars && a == 1) // Do not show a coefficient of 1.
            a = "";
          indexed.push([index, oper, a + term.join("*")]);
        }
      }
    }
    if (indexed.length == 0) // Restore zero or sort ascending by variables in terms.
      indexed = [[0, '', '0']];
    else
      indexed = indexed.sort(function(i, j) { return j[0] - i[0]; });

    // No leading + or spaces.
    indexed[0][1] = (indexed[0][1] == " + ") ? "" : indexed[0][1].trim();

    return indexed.map(function(i_t) { return i_t[1] + i_t[2]; }).join("");
  };

  /**
   * Return a non-function object representation of a polynomium object.
   * @memberof polynomium
   * @param {polynomial-object} p - a polynomial to return as an object.
   * @return {object} an object representation of the polynomial.
   */
  polynomium.toObject = function (p) {
    return {"polynomium":true, "terms":p.terms};
  };

  /**
   * Build a polynomial as a sum of two other polynomials.
   * @memberof polynomium
   * @param {polynomial-object} p - a polynomial addend.
   * @param {polynomial-object} q - a polynomial addend.
   * @return {polynomial-object} the polynomial sum of the two arguments.
   * @throws error if either argument is not a polynomial object.
   */
  polynomium.add = function (p, q) {
    if (typeof q === "number") // Convert number to polynomium object.
      q = polynomium.constant(q);

    if (typeof q === "string") // Convert string to polynomium object.
      q = polynomium.variable(q);

    if (q.polynomium == true) {
      var terms = [];
      var f = function () { return 0; };
      var terms = {};
      for (var p_base in p.terms)
        for (var p_exps in p.terms[p_base])
          _add_default(terms, [p_base, p_exps], 0, p.terms[p_base][p_exps]);
      for (var q_base in q.terms)
        for (var q_exps in q.terms[q_base])
          _add_default(terms, [q_base, q_exps], 0, q.terms[q_base][q_exps]);
      return polynomium.create(terms);
    } else {
      throw new Error("Only a polynomium object, number, or valid variable can be an argument");
    }
  };

  /**
   * Build a polynomial in which each coefficient is the maximum of
   * the corresponding coefficients in the two input polynomials.
   * @memberof polynomium
   * @param {polynomial-object} p - a polynomial argument.
   * @param {polynomial-object} q - a polynomial argument.
   * @return {polynomial-object} the term-wise "maximum" of the two arguments.
   * @throws error if either argument is not a polynomial object.
   */
  polynomium.maxCoefficients = function (p, q) {
    if (typeof q === "number") // Convert number to polynomium object.
      q = polynomium.constant(q);

    if (typeof q === "string") // Convert string to polynomium object.
      q = polynomium.variable(q);

    if (q.polynomium == true) {
      var terms = [];
      var f = function () { return 0; };
      var terms = {};
      for (var p_base in p.terms)
        for (var p_exps in p.terms[p_base])
          _op_default(terms, [p_base, p_exps], 0, Math.max, p.terms[p_base][p_exps]);
      for (var q_base in q.terms)
        for (var q_exps in q.terms[q_base])
          _op_default(terms, [q_base, q_exps], 0, Math.max, q.terms[q_base][q_exps]);
      return polynomium.create(terms);
    } else {
      throw new Error("Only a polynomium object, number, or valid variable can be an argument");
    }
  };

  /**
   * Build a polynomial as a product of two other polynomials.
   * @memberof polynomium
   * @param {polynomial-object} p - a polynomial factor.
   * @param {polynomial-object} q - a polynomial factor.
   * @return {polynomial-object} the polynomial product of the two arguments.
   * @throws error if either argument is not a polynomial object.
   */
  polynomium.mul = function (p, q) {
    if (typeof q === "number") // Convert number to polynomium object.
      q = polynomium.constant(q);
      
    if (typeof q === "string") // Convert string to polynomium object.
      q = polynomium.variable(q);

    if (q.polynomium == true) {
      var terms = [];
      var f = function () { return 0; };
      var terms = {};
      for (var p_base in p.terms) {
        for (var p_exps in p.terms[p_base]) {
          var p_v_to_e = _obj(_zip(p_base.split(","), p_exps.split(",").map(num)));
          for (var q_base in q.terms) {
            for (var q_exps in q.terms[q_base]) {
              var q_v_to_e = _obj(_zip(q_base.split(","), q_exps.split(",").map(num)));
              var ves = _entries(_add(p_v_to_e, q_v_to_e)).sort();
              // Fix constant case exponent to always be 1.
              var vs_es = _unzip(ves.length == 1 ? ves.map(ve => ve[0] == "#" ? ["#",1] : ve ) : ves.filter(ve => ve[0]!="#"));
              var base = vs_es[0].join(","), exps = vs_es[1].join(",");
              _add_default(terms, [base, exps], 0, p.terms[p_base][p_exps] * q.terms[q_base][q_exps]);
            } // for exponent arrays in q
          } // for bases in q
        } // for exponent arrays in p
      } // for bases in p

      // Filter out terms with zero coefficients.
      for (var base in terms)
        terms[base] = _flt(terms[base], function (v) { return Math.abs(v) > 0; });
      terms = _flt(terms, function (v) { return !_emp(v); });

      return polynomium.create(terms);
    } else {
      throw new Error("Only a polynomium object, number, or valid variable can be an argument");
    }
  };

  /**
   * Evaluate a polynomial given a mapping from variables to values.
   * @memberof polynomium
   * @param {polynomial-object} p - a polynomial to evaluate.
   * @param {object} bindings - a mapping from variable names to values.
   * @return {number} the result of evaluating the polynomial.
   * @throws error if a variable has no mapping.
   */
  polynomium.evaluate = function (p, bindings) {
    bindings["#"] = 1; // Account for placeholder non-variable.
    var sum = 0;
    for (var base in p.terms) {
      var vs = base.split(",");
      for (var exps in p.terms[base]) {
        var es = exps.split(",").map(num);
        var product = 1;
        for (var i = 0; i < vs.length; i++) {
          if (!(vs[i] in bindings))
            throw new Error("Variable '" + vs[i] + "' has no bound value in supplied bindings");
          product *= Math.pow(bindings[vs[i]], es[i]);
        }
        sum += p.terms[base][exps] * product;
      }
    }
    return sum;
  };

}) (typeof exports !== 'undefined' ? exports : (this.polynomium = {}));
