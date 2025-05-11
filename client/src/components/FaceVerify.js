import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import apiUrl from '../services/api'; // Adjust the import to your API URL

const FaceVerify = ({userId, onVerified }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const loadModels = async () => {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert('Failed to access camera');
    }
  };

  const drawFaceLandmarks = async () => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended) return;

    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()

    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(detections, displaySize);

   const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  faceapi.draw.drawDetections(canvas, resized);
  faceapi.draw.drawFaceLandmarks(canvas, resized);
  };

  const verifyFace = async () => {
    setLoading(true);

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection || !detection.descriptor) {
      alert('No face detected. Try again.');
      setLoading(false);
      return;
    }

    const descriptor = Array.from(detection.descriptor);

    try {
      const response = await axios.post(
        `${apiUrl}/face/verify`,
        { userId, descriptors: descriptor }
      );

      if (response.data.success) {
        const stream = videoRef.current?.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setIsVerified(true);
        alert('Face verified successfully!');
        if (onVerified) onVerified(true);
      } else {
        alert('Face verification failed.');
        if (onVerified) onVerified(false);
      }
    } catch (error) {
      console.error('Error during face verification:', error.message);
      alert('Failed to verify face.');
    }

    setLoading(false);
  };

  useEffect(() => {
    let intervalId;
    loadModels().then(startCamera);
    intervalId = setInterval(drawFaceLandmarks, 200);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Verify Face</h4>
      <div className="d-flex justify-content-center">
        <div className="position-relative" style={{ width: '640px', height: '480px' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            width="640"
            height="480"
            className="border rounded"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="position-absolute"
            style={{ top: 0, left: 0, pointerEvents: 'none' }}
          />
        </div>
      </div>
      <div className="text-center mt-3">
        <button className="btn btn-success" onClick={verifyFace} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Face'}
        </button>
      </div>
      {isVerified && <p className="text-center text-success mt-3">Face Verified!</p>}
    </div>
  );
};

export default FaceVerify;
