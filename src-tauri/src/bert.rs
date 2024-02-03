#[cfg(feature = "mkl")]
extern crate intel_mkl_src;

#[cfg(feature = "accelerate")]
extern crate accelerate_src;
use candle_transformers::models::bert::{BertModel, Config, HiddenAct, DTYPE};

use anyhow::{Error as E, Result};
use candle::Tensor;
use candle_nn::VarBuilder;
use hf_hub::{api::sync::Api, Repo, RepoType};
use tokenizers::Tokenizer;

#[derive(Debug)]
pub struct EmbeddingArgs {
    cpu: bool,
    model_id: String,
    revision: String,
    use_pth: bool,
    normalize_embeddings: bool,
    approximate_gelu: bool,
}

impl EmbeddingArgs {
    pub fn new(
        cpu: bool,
        model_id: String,
        revision: String,
        use_pth: bool,
        normalize_embeddings: bool,
        approximate_gelu: bool,
    ) -> Self {
        Self {
            cpu,
            model_id,
            revision,
            use_pth,
            normalize_embeddings,
            approximate_gelu,
        }
    }
    pub fn build(&self) -> Result<(VarBuilder, Config, Tokenizer)> {
        let device = if self.cpu {
            candle::Device::Cpu
        } else {
            candle::Device::Cuda(candle::CudaDevice)
        };
        let model_id = self.model_id.clone();
        let revision = self.revision.clone();

        let repo = Repo::with_revision(model_id, RepoType::Model, revision);
        let (config_filename, tokenizer_filename, weights_filename) = {
            let api = Api::new()?;
            let api = api.repo(repo);
            let config = api.get("config.json")?;
            let tokenizer = api.get("tokenizer.json")?;
            let weights = if self.use_pth {
                api.get("pytorch_model.bin")?
            } else {
                api.get("model.safetensors")?
            };
            (config, tokenizer, weights)
        };
        let config = std::fs::read_to_string(config_filename)?;
        let mut config: Config = serde_json::from_str(&config)?;
        let tokenizer = Tokenizer::from_file(tokenizer_filename).map_err(E::msg)?;

        let vb = if self.use_pth {
            VarBuilder::from_pth(&weights_filename, DTYPE, &device)?
        } else {
            unsafe { VarBuilder::from_mmaped_safetensors(&[weights_filename], DTYPE, &device)? }
        };
        if self.approximate_gelu {
            config.hidden_act = HiddenAct::GeluApproximate;
        }
        Ok((vb, config, tokenizer))
    }
}

pub fn normalize_l2(v: &Tensor) -> Result<Tensor> {
    Ok(v.broadcast_div(&v.sqr()?.sum_keepdim(1)?.sqrt()?)?)
}

pub struct BertModelEmbeddings {
    model: BertModel,
    tokenizer: Tokenizer,
    args: EmbeddingArgs,
}

impl BertModelEmbeddings {
    pub fn new(args: EmbeddingArgs) -> Result<Self> {
        let (vb, config, tokenizer) = args.build()?;
        let model = BertModel::load(vb, &config)?;
        Ok(Self {
            model,
            tokenizer,
            args,
        })
    }

    pub fn embed(&self, input: Vec<String>) -> Result<Vec<Vec<f32>>> {
        let tokens = self.tokenizer.encode_batch(input, true).map_err(E::msg)?;
        let device = candle::Device::Cpu;
        let token_ids = tokens
            .iter()
            .map(|tokens| {
                let tokens = tokens.get_ids().to_vec();
                Ok(Tensor::new(tokens.as_slice(), &device)?)
            })
            .collect::<Result<Vec<_>>>()?;

        let token_ids = Tensor::stack(&token_ids, 0)?;
        let token_type_ids = token_ids.zeros_like()?;
        let embeddings = self.model.forward(&token_ids, &token_type_ids)?;

        // Apply some avg-pooling by taking the mean embedding value for all tokens (including padding)
        let (_n_sentence, n_tokens, _hidden_size) = embeddings.dims3()?;
        let embeddings = (embeddings.sum(1)? / (n_tokens as f64))?;
        let embeddings = if self.args.normalize_embeddings {
            normalize_l2(&embeddings)?
        } else {
            embeddings
        };
        Ok(embeddings.to_vec2()?)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_run_bert() {
        let args = EmbeddingArgs {
            cpu: true,
            model_id: "sentence-transformers/all-MiniLM-L6-v2".to_string(),
            revision: "refs/pr/21".to_string(),
            use_pth: false,
            normalize_embeddings: true,
            approximate_gelu: true,
        };
        let bert = BertModelEmbeddings::new(args).unwrap();
        let input = vec![
            "I feel great".to_string(),
            "I feel awesome".to_string(),
            "I feel amazing".to_string(),
        ];
        let embeddings = bert.embed(input).unwrap();
        assert_eq!(embeddings.len(), 3);
        assert_eq!(embeddings[0].len(), 384);
        println!("{:?}", embeddings);
    }
}
