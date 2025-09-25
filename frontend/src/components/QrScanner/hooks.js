import { useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

import { isMediaDevicesSupported, isValidType } from './utils';

// TODO: add support for debug logs
export const useQrReader = ({
  scanDelay: delayBetweenScanAttempts,
  constraints: video,
  onResult,
  videoId,
  isActive = true,
}) => {
  const controlsRef = useRef(null);

  useEffect(() => {
    // Only initialize camera if isActive is true
    if (!isActive) {
      // Stop camera if it was running and isActive becomes false
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch (error) {
          console.warn('Error stopping camera controls:', error);
        }
        controlsRef.current = null;
      }
      
      // Stop all media streams completely
      const videoElement = document.getElementById(videoId);
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('Track stopped:', track.kind);
          });
        }
        videoElement.srcObject = null;
        videoElement.load();
      }
      return;
    }

    const codeReader = new BrowserQRCodeReader(null, {
      delayBetweenScanAttempts,
    });

    if (
      !isMediaDevicesSupported() &&
      isValidType(onResult, 'onResult', 'function')
    ) {
      const message =
        'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';

      onResult(null, new Error(message), codeReader);
    }

    if (isValidType(video, 'constraints', 'object')) {
      codeReader
        .decodeFromConstraints({ video }, videoId, (result, error) => {
          if (result) {
            console.log('✅ QR detectado en hook:', result);
          }
          if (isValidType(onResult, 'onResult', 'function')) {
            onResult(result, error, codeReader);
          }
        })
        .then((controls) => {
          controlsRef.current = controls;
          console.log(' Cámara iniciada correctamente');
        })
        .catch((error) => {
          console.error(' Error iniciando cámara:', error);
          if (isValidType(onResult, 'onResult', 'function')) {
            onResult(null, error, codeReader);
          }
        });
    }

    return () => {
      // Cleanup function - detener todo al desmontar
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch (error) {
          console.warn('Error stopping camera on cleanup:', error);
        }
      }
      
      // También detener streams si existen
      const videoElement = document.getElementById(videoId);
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('Cleanup - Track stopped:', track.kind);
          });
        }
        videoElement.srcObject = null;
      }
    };
  }, [isActive, delayBetweenScanAttempts, video, onResult, videoId]);
};
