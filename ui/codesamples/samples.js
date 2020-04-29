window.carouselsCodeSamples = {
  merge_sort: 'fn merge_sort<T: Debug, P: Obliv>(slice: &[Possession<T, P>]) -> Vec<Possession<T, P>> where T: Ord + Clone {\n' +
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
    '    let mut li = P::run(0);\n' +
    '    let mut ri = P::run(0);\n' +
    '\n' +
    '    let left_len = left.len();\n' +
    '    let right_len = right.len();\n' +
    '\n' +
    '    for _ in 0..out_len {\n' +
    '        out.push({\n' +
    '            obliv if li == left_len || ri < right_len && Oram(right)[ri] > Oram(left)[li] {\n' +
    '                let arr = Oram(right);\n' +
    '                let o = arr[ri].clone();\n' +
    '                ri = ri + 1;\n' +
    '                o\n' +
    '            } else {\n' +
    '                let arr = Oram(left);\n' +
    '                let o = arr[li].clone();\n' +
    '                li = li + 1;\n' +
    '                o\n' +
    '            }\n' +
    '        });\n' +
    '    }\n' +
    '    out\n' +
    '}',
  max: 'fn max<T: Debug, P: Obliv>(arr: &[Possession<T, P>]) -> Possession<T, P> where T: Ord + Clone {\n' +
    '    let max = arr[0];\n' +
    '    for x in arr {\n' +
    '        max = obliv if x > max {\n' +
    '            x\n' +
    '        } else {\n' +
    '            max\n' +
    '        }\n' +
    '    }\n' +
    '    max\n' +
    '}\n',
  innerProduct: 'fn inner_product<T: Debug, P: Obliv>(arr1: &[Possession<T, P>], arr2: &[Possession<T, P>]) -> Possession<T, P> where T: Ord + Clone {\n' +
    '    let product = arr1[0] * arr2[0];\n' +
    '    for i in 1..arr1.len() {\n' +
    '        product = product + (arr1[i] * arr2[i])\n' +
    '    }\n' +
    '    product\n' +
    '}\n'
};
