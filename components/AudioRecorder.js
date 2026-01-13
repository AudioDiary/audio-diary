"use client";
import { useState, useRef } from "react";
import { Mic, Square, Pause, Play, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AudioRecorder({ topicId, userId, onComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/mp3" });
        setAudioBlob(blob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      alert("Разрешите доступ к микрофону!");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    } else {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  };

  const saveRecording = async () => {
    setUploading(true);
    try {
      const fileName = `${userId}/theme_${topicId}_${Date.now()}.mp3`;

      // 1. Загрузка файла в Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('audio-answers')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Получаем публичную ссылку
      const { data: { publicUrl } } = supabase
        .storage
        .from('audio-answers')
        .getPublicUrl(fileName);

      // 2. Запись в таблицу answers
      const { error: dbError } = await supabase
        .from('answers')
        .insert({
          user_id: userId,
          topic_id: topicId,
          audio_url: publicUrl
        });

      if (dbError) throw dbError;

      alert("Сохранено!");
      setAudioBlob(null);
      if (onComplete) onComplete();

    } catch (error) {
      console.error(error);
      alert("Ошибка сохранения: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded bg-gray-50 mt-4">
      {!isRecording && !audioBlob && (
        <button onClick={startRecording} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700">
          <Mic /> Начать ответ
        </button>
      )}

      {isRecording && (
        <div className="flex gap-4">
          <button onClick={pauseRecording} className="p-4 bg-yellow-500 text-white rounded-full">
            {isPaused ? <Play /> : <Pause />}
          </button>
          <button onClick={stopRecording} className="p-4 bg-red-600 text-white rounded-md">
            <Square />
          </button>
        </div>
      )}

      {audioBlob && (
        <div className="flex flex-col items-center gap-3 w-full">
          <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
          <button 
            onClick={saveRecording} 
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full justify-center disabled:opacity-50"
          >
            {uploading ? "Загрузка..." : "Сохранить запись"} <Save size={18} />
          </button>
          <button onClick={() => setAudioBlob(null)} className="text-sm text-red-500 underline">Сбросить</button>
        </div>
      )}
    </div>
  );
}