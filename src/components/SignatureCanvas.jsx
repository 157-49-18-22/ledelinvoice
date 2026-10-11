import React, { useRef, useEffect } from 'react';

const SignatureCanvas = ({ onSave }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const contextRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5; // Slightly thicker for a smoother signature
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    contextRef.current = ctx;

    // Prevent scrolling when touching the canvas to avoid interruptions
    const preventScroll = (e) => {
      e.preventDefault();
    };
    
    canvas.addEventListener('touchstart', preventScroll, { passive: false });
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    
    const clientX = e.clientX !== undefined ? e.clientX : e.nativeEvent?.clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.nativeEvent?.clientY;

    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      contextRef.current.closePath();
      isDrawing.current = false;
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="signature-draw">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>
      <div className="canvas-controls">
        <button className="clear-canvas" onClick={clearCanvas}>
          Clear
        </button>
        <button className="save-signature" onClick={saveSignature}>
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignatureCanvas; 