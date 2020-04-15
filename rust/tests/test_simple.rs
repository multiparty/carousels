fn karmarkar_iteration<const M: usize, const N: usize>
(initial_point: f64, a: Matrix<f64, M, N>, c: Vector<f64, N>)
-> Vector<f64, N>
{
    let d = Matrix::diagonal(initial_point);
    // NxN * Nx1 matrix mult
    let cprime = d * c;
    // MxN * NxN matrix mult
    let ad = a * d;

    // (M+1)xN matrix
    let b = ad.append(Vector::ones(N));

    // Calc pseudoinverse, (M+1)xN * Nx(M+1) matrix mult
    let bbt = b * b.transpose();
    // Invert NxN matrix
    let bbt_inv = bbt.inverse();

    // Nx(M+1) * (M+1)x(M+1) * (M+1)xN * Nx1
    let cp = cprime - b.transpose() * bbt_inv * b * cprime;

    let norm = l2norm(cp);
    let unitcp = cp.copy();
    for i in 0..N {
        unitcp[i] = cp[i] / norm;
    }

    // Nx1
    let bprime = Vector::ones(N) / N - ((1./3.) * N * unitcp);


    // guessing, seems like we need to use the vector as both a
    // column and row matrix using the sample code
    // (NxN * Nx1) / (1xN * NxN * Nx1
    (d * bprime) / (Vector::ones(N) * d * bprime)
}
