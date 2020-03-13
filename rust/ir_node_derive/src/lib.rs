extern crate proc_macro;
use self::proc_macro::TokenStream;

use syn;
use quote;

#[proc_macro_attribute]
pub fn ir_node(_attr: TokenStream, item: TokenStream) -> TokenStream {
    // parse the struct to which this attribute was attached
    let ast = syn::parse_macro_input!(item as syn::DeriveInput);

    // parse the fields (names and types) inside the struct
    let fields = match &ast.data {
        syn::Data::Struct(syn::DataStruct { fields: syn::Fields::Named(fields), .. }) => &fields.named,
        _ => panic!("expected a struct with named fields"),
    };
    let field_name = fields.iter().map(|field| &field.ident);
    let field_name2 = fields.iter().map(|field| &field.ident);
    let field_name3 = fields.iter().map(|field| &field.ident);

    let field_type = fields.iter().map(|field| &field.ty);
    let field_type2 = fields.iter().map(|field| &field.ty);

    // parse the struct name
    let name = &ast.ident;

    // regenerate struct with added field 'node_type'
    let gen = quote::quote! {
        #[derive(serde::Serialize, serde::Deserialize, std::fmt::Debug)]
        #[serde(rename_all = "camelCase")]
        pub struct #name {
            #[serde(skip)]
             pub node_type: String,
            #(
                pub #field_name: #field_type,
            )*
        }

        #[typetag::serde]
        impl IRNode for #name {
        }

        impl #name {
            pub fn new(#(#field_name2: #field_type2,)*) -> #name {
                #name {
                    node_type: stringify!(#name).to_string(),
                    #(#field_name3,)*
                }
            }
        }
    };

    return gen.into();
}
