"use client";
import { useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Admin() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);

  // تشغيل الكاميرا الأمامية أو الخلفية
  const startCamera = async (facingMode = "user") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });

      videoRef.current.srcObject = stream;
      setCameraStream(stream);
      socket.emit("start-stream");
    } catch (error) {
      alert("⚠️ الرجاء السماح باستخدام الكاميرا!");
    }
  };

  // إيقاف الكاميرا
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // بدء التسجيل
  const startRecording = () => {
    if (!cameraStream) return;
    const recorder = new MediaRecorder(cameraStream);
    const chunks = [];

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded-video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // التقاط صورة
  const captureImage = () => {
    if (!cameraStream) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "captured-image.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">📡 التحكم في البث</h1>
      <video ref={videoRef} autoPlay playsInline className="w-96 h-72 border rounded-lg shadow-md"></video>
      <div className="mt-4 space-x-2">
        <button onClick={() => startCamera("user")} className="px-4 py-2 bg-blue-500 text-white rounded-md">📷 تشغيل الكاميرا الأمامية</button>
        <button onClick={() => startCamera("environment")} className="px-4 py-2 bg-blue-700 text-white rounded-md">📷 تشغيل الكاميرا الخلفية</button>
        <button onClick={stopCamera} className="px-4 py-2 bg-red-500 text-white rounded-md">⛔ إيقاف الكاميرا</button>
        <button onClick={captureImage} className="px-4 py-2 bg-green-500 text-white rounded-md">📸 التقاط صورة</button>
        {!isRecording ? (
          <button onClick={startRecording} className="px-4 py-2 bg-yellow-500 text-white rounded-md">🔴 بدء التسجيل</button>
        ) : (
          <button onClick={stopRecording} className="px-4 py-2 bg-yellow-700 text-white rounded-md">⏹️ إيقاف التسجيل</button>
        )}
      </div>
    </div>
  );
}
