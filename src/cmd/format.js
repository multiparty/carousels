module.exports = {
  formatHTML: function (body) {
    return '<html><body><div>' + body + '</div></body></html>';
  },
  formatJSON: function (json) {
    return JSON.stringify(json, null, 4);
  }
};