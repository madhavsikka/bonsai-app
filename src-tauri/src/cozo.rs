use cozo::*;

pub fn init() {
    let db = DbInstance::new("sqlite", "/tmp/cozo", Default::default()).unwrap();
    let script = "?[a] := a in [1, 2, 3]";
    let result = db
        .run_script(script, Default::default(), ScriptMutability::Immutable)
        .unwrap();
    println!("{:?}", result);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init() {
        init();
    }
}
