use syn::{Item, Expr};

fn main() {
    let src = "
            fn main() {
            println!(\"Hello World!\");
            let x = 5;
            println!(\"Blob!\");
            }
        ";
    let syntax = syn::parse_file(&src).unwrap();
    let syntax = &syntax.items[0];
    let s: String = match_file(syntax);
}

fn match_file(syntax: &Item)-> String{
    match syntax {
        Item::Fn(_item) => {
            let attributes = &_item.attrs;
            let body = &_item.block;

            println!("{}",format!("{:#?}\n", body));
            let s = String::from("hello");
            s
        }
        _=>{
            let s = String::from("hello");
            s
        }
    }
}

fn match_expression(expression: &Expr)-> String{
    match expression {
        _=>{
            let s = String::from("hello");
            s
        }
    }
}
