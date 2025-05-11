import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import apiUrl from '../services/api';

const FaceRegister = ({ userId, onSuccess }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [loading, setLoading] = useState(false);

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
      .withFaceLandmarks();

    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(detections, displaySize);

    const ctx = canvas.getContext('2d');
    ctx.willReadFrequently = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resized);
    faceapi.draw.drawFaceLandmarks(canvas, resized);
  };

  const captureAndRegister = async () => {
  setLoading(true);
  try {
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

    if (descriptor.length !== 128) {
      alert('Invalid face descriptor. Try again.');
      setLoading(false);
      return;
    }

    if (!userId) {
      alert('No user ID found. Please log in again.');
      setLoading(false);
      return;
    }

    const response = await axios.post(`${apiUrl}/face/save`, { descriptor, userId });

    // SUCCESS handling
    if (response.status === 200) {
      if (onSuccess) {
        onSuccess(); // Notify parent to reset UI
      } else {
        alert('Face registered successfully!');
      }
    } else if (response.status === 409) {
      // Duplicate face detected
      const matchedUserId = response.data.matchedUserId;
      alert(`This face is already registered with another account. Matched user ID: ${matchedUserId}`);
    }

  } catch (error) {
    const status = error.response?.status;
    const msg = error.response?.data?.message;

    if (status === 409) {
      alert(msg || 'This face already exists in the system. Cannot register again.');
    } else {
      console.error('Face registration error:', msg || error.message);
      alert('Failed to register face. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadModels().then(startCamera);
    const interval = setInterval(drawFaceLandmarks, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Register Face</h4>
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
        <button className="btn btn-success" onClick={captureAndRegister} disabled={loading}>
          {loading ? 'Registering...' : 'Capture & Register'}
        </button>
      </div>
    </div>
  );
};

export default FaceRegister;
