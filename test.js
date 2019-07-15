function oddEvenSort(a, lo, n) {
    if (n > 1) {
      var m = Math.floor(n/2);
      oddEvenSort(a, lo, m);
      oddEvenSort(a, lo+m, m);
      oddEvenMerge(a, lo, n, 1);
    }
  }

  // lo: lower bound of indices, n: number of elements, r: step
  function oddEvenMerge(a, lo, n, r) {
    var m = r * 2;
    if (m < n) {
      oddEvenMerge(a, lo, n, m);
      oddEvenMerge(a, lo+r, n, m);

      for (var i = (lo+r); (i+r)<(lo+n); i+=m)  {
        compareExchange(a, i, i+r);
      }
    } else {
      compareExchange(a,lo,lo+r);
    }
  }

  function compareExchange(a, i, j) {
    if (j >= a.length || i >= a.length) {
      return;
    }

    var x = a[i];
    var y = a[j];

    var cmp = x.lt(y);
    a[i] = cmp.if_else(x, y);
    a[j] = cmp.if_else(y, x);
}
