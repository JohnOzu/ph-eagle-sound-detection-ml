export type ModelPrediction = {
  is_eagle: boolean,
  confidence: number,
  probabilities: {
    non_eagle: number,
    eagle: number
  }
  feature_shape: number[]
};