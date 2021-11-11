fn max<T: Debug, P: Obliv>(arr: &[Possession<T, P>]) -> Possession<T, P> where T: Ord + Clone {
    let max = arr[0];
    for x in arr {
        max = #[__carouselsobliv__] if x > max {
            x
        } else {
            max
        }
    }
    max
}
