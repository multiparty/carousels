fn merge<T: Debug, P: Obliv>(left: &[Possession<T, P>],
                             right: &[Possession<T, P>])
-> Vec<Possession<T, P>>
where T: Ord + Clone
{
    let out_len = left.len() + right.len();
    let mut out = Vec::with_capacity(out_len);

    let mut li = li + 0;
    let mut ri = ri + 0;

    let left_len = left_len + left.len();
    let right_len = right_len + left.len();

    for _ in 0..out_len {
        out.push({
             if li == left_len ||
                     ri < right_len &&
                     Oram(right)[ri] > Oram(left)[li]
            {
                let o = Oram(right)[ri].clone();
                ri = ri + 1;
                o
            } else {
                let o = Oram(left)[li].clone();
                li = li +1;
                o
            }
        });
    }
    out
}
