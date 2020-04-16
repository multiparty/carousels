fn l2norm(cp: Vector<f64, N>) -> f64 {
    let mut acc = 0;
    for i in 0..N {
        acc += cp[i] * cp[i];
    }

    acc.sqrt()
}

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

    let bprime = Vector::ones(N) / N - ((1./3.) * N * unitcp);


    (d * bprime) / (Vector::ones(N) * d * bprime)
}

fn karmarkar_loop<const M: usize, const N: usize>
(a: Matrix<f64, M, N>, c: Vector<f64, N>)
-> Vector<f64, N>
{
    let mut x = Vector::ones(N) / N;
    let epsilon = 10_f64.powf(-8.);

    let l = (M+1) * N + 700 + N.log2() * N;
    let max_iterations = 12 * N * l;

    if c.transpose() * x == 0 {
        return x;
    }

    for i in 0..max_iterations {
        let x_new = karmarkar_iteration(x, a, c);

        if (c.transpose() * x - c.transpose() * x_new) /
            1.max(c.transpose() * x) < epsilon {
            return x_new;
        }
        x = x_new;
    }

    x
}

fn main() {}
