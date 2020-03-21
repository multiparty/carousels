fn merge_sort_dedup<T, P: Obliv>(a: &[Possession<T, P>])
                                 -> Vec<Possession<T, P>>
    where T: Ord + Clone
{
    let n = a.len();
    if n > 1 {
        let m = n/2;
        merge_dedup(&merge_sort_dedup(&a[0..m]),
                    &merge_sort_dedup(&a[m..n]))
    } else {
        a.to_owned()
    }
}

fn merge_dedup<T, P: Obliv>(a: &[Possession<T, P>], b: &[Possession<T, P>])
                            -> Vec<Possession<T, P>>
    where T: Ord + Clone
{ }