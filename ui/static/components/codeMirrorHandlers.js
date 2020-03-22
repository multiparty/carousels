/* global CodeMirror */
(function () {
  const initialCode = 'fn merge_sort<T: Debug, P: Obliv>(slice: &[Possession<T, P>]) -> Vec<Possession<T, P>> where T: Ord + Clone {\n' +
    '    if slice.len() == 1 {\n' +
    '        return slice.to_owned()\n' +
    '    }\n' +
    '\n' +
    '    let mid   = slice.len() / 2;\n' +
    '    let left  = merge_sort(&slice[0..mid]);\n' +
    '    let right = merge_sort(&slice[mid..slice.len()]);\n' +
    '    merge(&left, &right)\n' +
    '}\n' +
    '\n' +
    'fn merge<T: Debug, P: Obliv>(left: &[Possession<T, P>], right: &[Possession<T, P>]) -> Vec<Possession<T, P>> where T: Ord + Clone {\n' +
    '    let out_len = left.len() + right.len();\n' +
    '    let mut out = Vec::with_capacity(out_len);\n' +
    '\n' +
    '    let mut li = 0;\n' +
    '    let mut ri = 0;\n' +
    '\n' +
    '    let left_len = left.len();\n' +
    '    let right_len = right.len();\n' +
    '\n' +
    '    for _ in 0..out_len {\n' +
    '        out.push({\n' +
    '            obliv if li == left_len || ri < right_len && Oram(right)[ri] > Oram(left)[li] {\n' +
    '                let o = Oram(right)[ri].clone();\n' +
    '                ri += 1;\n' +
    '                o\n' +
    '            } else {\n' +
    '                let o = Oram(left)[li].clone();\n' +
    '                li += 1;\n' +
    '                o\n' +
    '            }\n' +
    '        });\n' +
    '    }\n' +
    '    out\n' +
    '}';

  window.addEventListener('DOMContentLoaded', function () {
    // CodeMirror code editor
    const textarea = document.getElementById('inputCode');
    const codeMirrorInstance = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      matchBrackets: true,
      tabMode: 'indent'
    });
    codeMirrorInstance.setSize('100%', 'auto');
    codeMirrorInstance.setValue(initialCode);
    textarea.__codeMirrorInstance = codeMirrorInstance;
  });
})();