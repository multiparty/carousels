// Module needs to be load dynamically (async) for WebAssembly to function
import("../pkg/index.js").then(rust => {
    document.getElementById('myButton').addEventListener('click', getAST);

    function getAST (e) {
        e.preventDefault();
        const res = rust.get_ast(document.getElementById('myTextarea').value);
        document.getElementById('result').innerHTML  = res;
    }
}).catch(console.error);
