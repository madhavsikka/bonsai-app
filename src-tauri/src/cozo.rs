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
    {:create leaf {
        id 
        => 
        title,
        title_vec: <F32; 384>
    }}
    {::hnsw create leaf:semantic{
        fields: [title_vec], 
        dim: 384, 
        ef: 16, 
        m: 32,
        distance: Cosine
    }}
    ";
    let mut result = db.run_default(script).unwrap();
    println!("{:?}", result);

    let records = vec![
        vec!["1", "This is an HNSW (hierarchical navigable small world) vector index, and ef and m are parameters that control the quality-performance trade-off of the index. Now when inserting rows for the product table, we use an embedding model (such as text-embedding-ada-002 provided by OpenAI) to compute embeddings for the texts and insert them together with the other fields. Now an iPhone and a Samsung phone are related even without a manually curated knowledge graph."],
        vec!["2", "Lets go for a basketball game tonight."],
        vec!["3", "I am all for wildlife."],
        vec!["4", "I am going to the nba game tonight."],
    ];

    for record in records {
        let id = record[0].to_string();
        let title = record[1].to_string();
        let input = vec![title.clone()];
        let embeddings = bert.embed(input).unwrap();
        let title_vec = embeddings[0].to_vec();
        let script = format!(
            "?[id, title, title_vec] <- [['{}', '{}', {:?}]]
            :put leaf {{id => title, title_vec}}
            ",
            id, title, title_vec
        );
        db.run_default(&script).unwrap();
    }

    script = "
    ?[dist, fr_id, to_id] :=
        *leaf:semantic{layer: 0, dist, fr_id, to_id},
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
