use cozo::*;

pub fn init() {
    let db = DbInstance::new("mem", "", Default::default()).unwrap();
    let mut script = "
    :create leaf {
        id 
        => 
        title, 
        body, 
        title_vec: <F32; 3>, 
        body_vec: <F32; 3>
    }
    ";
    let mut result = db.run_default(script).unwrap();
    println!("{:?}", result);

    script = "
    ::hnsw create leaf:semantic{
        fields: [title_vec, body_vec], 
        dim: 3, 
        ef: 16, 
        m: 32
    }
    ";
    result = db.run_default(script).unwrap();
    println!("{:?}", result);

    script = "
    ?[id, title, body, title_vec, body_vec] <- [
        ['1', 'hello', 'how are you', [1,2,3], [1,2,3]],
        ['2', 'yolo', 'woohoo', [0,1,1], [0,2,1]]
    ]
    :put leaf {id => title, body, title_vec, body_vec}
    ";
    result = db.run_default(script).unwrap();
    println!("{:?}", result);

    script = "
    ?[id, title, body, title_vec, body_vec] := *leaf{id, title, body, title_vec, body_vec}
    ";
    result = db.run_default(script).unwrap();
    println!("{:?}", result);

    script = "
    ?[dist, title] :=
    *leaf{title: 'hello', title_vec: v},
    ~leaf:semantic{title | query: v, bind_distance: dist, k: 10, ef: 50}

    :order dist
    :limit 10
    ";
    result = db.run_default(script).unwrap();

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
