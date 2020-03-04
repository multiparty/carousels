// fn main() {
//     party!(A);
//     impl ConcealFrom for A {}
//     let a = A("dummy_address".into());
//     let a_numbers: Vec<Possession<u32, A>> = (0..50).map(|_| {
//         A::run(|| rand::thread_rng().gen_range(0, 100))
//     }).collect();
//
//     party!(B);
//     impl ConcealFrom for B {}
//     let b = B("dummy_address_2".into());
//     let b_numbers: Vec<Possession<u32, B>> = (0..50).map(|_| {
//         B::run(|| rand::thread_rng().gen_range(0, 1000))
//     }).collect();
//
//     protocol!(P: Obliv);
//     let mut p = P(Gc { garbler: &a, evaluator: &b });
//
//     let mut numbers = vec![];
//     for n in a_numbers { numbers.push(p.conceal(n)) }  // First A
//     for n in b_numbers { numbers.push(p.conceal(n)) }  // Then B
//     println!("{:?}", merge_sort(&numbers));
// }

fn merge_dedup<T, P>(a: &[Possession<T, P>], b: &[Possession<T, P>])
-> Vec<Possession<T, P>>
where T: Ord + Clone
{

}


// if alen < 1 { return b[0..blen].to_owned() }
// if blen < 1 { return a[0..blen].to_owned() }
//
// // NOTE: This is the only obliv if below.
// if a[0] < b[0] {
//     merge_dedup(&a[1..alen], &b[0..blen]).concat(a[0].clone())
// } else if a[0] > b[0] {
//     merge_dedup(&a[0..alen], &b[1..blen]).concat(b[0].clone())
// } else {
//     merge_dedup(&a[0..alen], &b[1..blen])
// }
