// utils/faceRecognitionUtils.js

export const compareDescriptors = (inputDescriptors, storedDescriptors) => {
  const distance = calculateEuclideanDistance(inputDescriptors, storedDescriptors);
  return distance < 0.45; // Tighter threshold for accuracy
};

export const calculateEuclideanDistance = (inputDescriptors, storedDescriptors) => {
  let sum = 0;
  for (let i = 0; i < inputDescriptors.length; i++) {
    sum += Math.pow(inputDescriptors[i] - storedDescriptors[i], 2);
  }
  return Math.sqrt(sum);
};

export const cosineSimilarity = (vec1, vec2) => {
  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  return dot / (mag1 * mag2);
};
