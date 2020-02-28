extern crate proc_macro;

use crate::proc_macro::TokenStream;
use quote;
use syn;

#[proc_macro_derive(IRNode)]
pub fn ir_node_derive(input: TokenStream) -> TokenStream {
    // Construct a representation of Rust code as a syntax tree
    // that we can manipulate
    let ast = syn::parse_macro_input!(input as syn::DeriveInput);

    // Build the trait implementation
    let name = &ast.ident;
    let gen = quote::quote! {
        impl IRNode for #name {
            fn node_type(&self) -> &str {
                return stringify!(#name);
            }
        }
    };
    return gen.into();
}
