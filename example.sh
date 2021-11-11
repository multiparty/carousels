#!/bin/bash
# Example for using the command line interface of carousels
node src/main.js --file ../achilles/examples/carousels/quick_sort.rs --protocol rustBGW --debug logs --evaluate quick_sort --at "b = 128; p = 64; n5 = 256; v26 = 0; v34 = 0; v40 = 0; L7(m35, m37, m39, n33, v36, v38, i42) = iff(i42 <= 0, 0, n33*F5(m35, m39, m37, m39, m37, 0, n33, 0, 0, 0, 0, 0)); L7i(m35, m37, m39, n33, v36, v38, i42) = iff(i42 <= 0, 0, n33*F5(0,0,0,0,0, 0, n33, 0, 0, 0, 0, 0))" --verbose
