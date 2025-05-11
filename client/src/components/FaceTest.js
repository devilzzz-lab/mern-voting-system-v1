import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceTest = () => {
  const videoRef = useRef();
  const [descriptor, setDescriptor] = useState(null);
  const [status, setStatus] = useState('Loading models...');

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        setStatus('Models loaded. Please look into the camera.');
        startVideo();
      } catch (err) {
        console.error('Error loading models:', err);
        setStatus('Failed to load models.');
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('Camera error:', err);
          setStatus('Unable to access camera.');
        });
    };

    loadModels();
  }, []);

  const captureDescriptor = async () => {
    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const desc = Array.from(detection.descriptor);
      setDescriptor(desc);
      setStatus('Descriptor captured. Copy it below.');
      console.log('Face Descriptor:', desc);
    } else {
      setStatus('No face detected. Try again.');
    }
  };

  return (
    <div className="container text-center mt-4">
      <h4>Test Face Descriptor Capture</h4>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="480"
        height="360"
        style={{ transform: 'scaleX(-1)', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}
      />
      <div className="mt-3">
        <button className="btn btn-primary" onClick={captureDescriptor}>
          Capture Descriptor
        </button>
      </div>
      <p className="mt-2 text-muted">{status}</p>
      {descriptor && (
        <textarea
          className="form-control mt-3"
          rows="6"
          value={JSON.stringify(descriptor, null, 2)}
          readOnly
        />
      )}
    </div>
  );
};

export default FaceTest;
