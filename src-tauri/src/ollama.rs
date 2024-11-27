use ollama_rs::{Ollama, generation::embeddings::request::GenerateEmbeddingsRequest};

pub async fn get_ollama_embedding(text: &str) -> Result<Vec<f32>, Box<dyn std::error::Error>> {
    let ollama = Ollama::default();
    
    let request = GenerateEmbeddingsRequest::new(
        "llama3.2:3b".to_string(),
        text.to_string().into()
    );
    
    let response = ollama.generate_embeddings(request).await?;
    Ok(response.embeddings[0].clone())
}
