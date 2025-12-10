import Meyda from 'meyda';
import * as tf from '@tensorflow/tfjs';
import type { ModelPrediction } from '../types/modelPrediction.type';

let model: tf.GraphModel | null = null;

async function loadModel() {
  if (!model) {
    model = await tf.loadGraphModel('/tfjs_model/model.json');
  }
  return model;
}

async function extractMelSpectrogram(audioFile: File): Promise<number[][]> {
    const audioContext = new AudioContext({ sampleRate: 16000 }); // Adjust to your model's expected rate
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const audioData = audioBuffer.getChannelData(0);
    
    // Extract mel-spectrogram frames
    const hopSize = 512;
    const frameSize = 1024;
    const melBands = 128; // Adjust to your model's expected mel bands
    
    const melSpectrograms: number[][] = [];
    
    Meyda.bufferSize = frameSize;
    Meyda.sampleRate = audioContext.sampleRate;
    Meyda.melBands = melBands;
    
    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
        const frame = audioData.slice(i, i + frameSize);
        
        // Extract without passing config in the call
        const melSpec = Meyda.extract('melBands', frame) as number[];
        
        if (melSpec) {
        melSpectrograms.push(melSpec);
        }
    }
    
    return melSpectrograms;
}

function flattenMelSpectrogram(melSpec: number[][], targetSize: number = 1024): number[] {
    // Flatten the 2D array
    const flattened = melSpec.flat();
    
    if (flattened.length > targetSize) {
        // Truncate if too long
        return flattened.slice(0, targetSize);
    } else if (flattened.length < targetSize) {
        // Pad with zeros if too short
        return [...flattened, ...new Array(targetSize - flattened.length).fill(0)];
    }
    
    return flattened;
}

async function predictBird(features: number[][]): Promise<Float32Array | Int32Array | Uint8Array> {
    const model = await loadModel();

    const processedFeatures = flattenMelSpectrogram(features, 1024);
    const inputTensor = tf.tensor2d([processedFeatures], [1, 1024]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const output = await prediction.data();
    
    inputTensor.dispose();
    prediction.dispose();
    
    return output;
}

async function detectEagle(audioFile: File): Promise<ModelPrediction> {
  const features = await extractMelSpectrogram(audioFile);
  const prediction = await predictBird(features);
  
  const probability = prediction.length === 1 ? prediction[0] : prediction[1];
  const threshold = 0.5;
  const isEagle = probability >= threshold;
  
  return {
    isEagle,
    confidence: probability * 100,
    label: isEagle ? 'Eagle Detected' : 'No Eagle'
  };
}

const fetchAudioAsFile = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  // Convert to File
  const file = new File([blob], url.split("/").pop() || "audio.wav", { type: blob.type });
  return file;
};

export { loadModel, detectEagle, fetchAudioAsFile };