use cozo::*;

use crate::bert::{BertModelEmbeddings, EmbeddingArgs};

pub fn init() {
    let db = DbInstance::new("mem", "", Default::default()).unwrap();
    let bert_args = EmbeddingArgs::new(
        true,
        "sentence-transformers/all-MiniLM-L6-v2".to_string(),
        "refs/pr/21".to_string(),
        false,
        true,
        true,
    );
    let bert = BertModelEmbeddings::new(bert_args).unwrap();

    let mut script = "
    :create leaf {
        id 
        => 
        title, 
        body, 
        title_vec: <F32; 384>, 
        body_vec: <F32; 384>
    }
    ";
    let mut result = db.run_default(script).unwrap();
    println!("{:?}", result);

    script = "
    ::hnsw create leaf:semantic{
        fields: [title_vec, body_vec], 
        dim: 384, 
        ef: 16, 
        m: 32
    }
    ";
    result = db.run_default(script).unwrap();
    println!("{:?}", result);

    let records = vec![
        vec!["1", "i am a good driver", "how are you"],
        vec!["2", "i drive well", "woohoo"],
        vec!["3", "sun is out there", "cool"],
    ];

    for record in records {
        let id = record[0].to_string();
        let title = record[1].to_string();
        let body = record[2].to_string();
        let input = vec![title.clone(), body.clone()];
        let embeddings = bert.embed(input).unwrap();
        let title_vec = embeddings[0].to_vec();
        let body_vec = embeddings[1].to_vec();
        let script = format!(
            "?[id, title, body, title_vec, body_vec] <- [['{}', '{}', '{}', {:?}, {:?}]]
            :put leaf {{id => title, body, title_vec, body_vec}}
            ",
            id, title, body, title_vec, body_vec
        );
        db.run_default(&script).unwrap();
    }

    script = "
    ?[id, title, body, title_vec, body_vec] := *leaf{id, title, body, title_vec, body_vec}
    ";
    result = db.run_default(script).unwrap();
    println!("{:?}", result);

    script = "
    ?[dist, title] :=
    *leaf{title: 'i am a good driver', title_vec: v},
    ~leaf:semantic{title | query: v, bind_distance: dist, k: 5, ef: 20}

    :order dist
    :limit 5
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
