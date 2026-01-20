"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    fetchTopic();
  }, [id]);

  const fetchTopic = async () => {
    const { data } = await supabase.from('topics').select('*').eq('id', id).single();
    setTopic(data);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: answer } = await supabase
        .from('answers')
        .select('*')
        .eq('topic_id', id)
        .eq('user_id', session.user.id)
        .single();
      
      if (answer) {
        setTranscript(answer.content);
        setAudioUrl(answer.audio_url);
      }
    }
    setLoading(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      alert("Не удалось получить доступ к микрофону");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfaf6]">
      <div className="glass-card p-6 font-header text-amber-900 animate-pulse">Открываем страницу...</div>
    </div>
  );

  return (
    // bg-[#fdfaf6] перекрывает глобальное фоновое изображение для этой страницы
    <main className="min-h-screen bg-[#fdfaf6] flex flex-col items-center p-4 md:p-10">
      
      {/* Кнопка назад */}
      <div className="w-full max-w-[500px] mb-6">
        <Link href="/" className="inline-flex items-center text-amber-900/60 hover:text-amber-900 transition-colors font-body text-sm">
          <span className="mr-2">←</span> К списку глав
        </Link>
      </div>

      {/* Основная карточка интерфейса */}
      <div className="glass-card w-full max-w-[500px] p-6 md:p-10 flex flex-col items-center shadow-xl border-white/60">
        
        <header className="text-center w-full mb-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-amber-900/40 uppercase block mb-2">
            Глава {topic?.order || "I"}
          </span>
          <h1 className="text-2xl md:text-3xl font-header text-amber-950 mb-4 leading-tight">
            {topic?.title}
          </h1>
          <div className="h-px w-16 bg-amber-900/10 mx-auto mb-4"></div>
          <p className="text-sm md:text-base font-body italic text-amber-900/70 leading-relaxed px-2">
            {topic?.description}
          </p>
        </header>

        <div className="w-full flex flex-col items-center gap-6">
          
          {/* Индикатор записи */}
          <div className={`h-6 flex items-center gap-1 transition-opacity duration-300 ${recording ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div>
            <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Запись идет</span>
          </div>

          {/* Кнопка управления записью */}
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`group relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              recording 
              ? 'bg-red-50 border-2 border-red-600 scale-105' 
              : 'bg-amber-900 border-2 border-amber-800 hover:bg-amber-800 active:scale-95'
            }`}
          >
            {recording ? (
              <div className="w-6 h-6 bg-red-600 rounded-sm shadow-sm"></div>
            ) : (
              <div className="ml-1 w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-amber-50 border-b-[10px] border-b-transparent"></div>
            )}
          </button>

          <p className="text-xs font-body text-amber-900/50 mb-4">
            {recording ? "Нажмите, чтобы закончить" : "Нажмите, чтобы начать рассказ"}
          </p>

          {/* Результат: Плеер и Текст */}
          {(audioUrl || transcript) && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {audioUrl && (
                <div className="p-3 bg-white/50 rounded-2xl border border-amber-900/5">
                   <audio src={audioUrl} controls className="w-full h-8 accent-amber-900" />
                </div>
              )}
              
              <div className="p-5 bg-white/60 rounded-2xl border border-amber-900/5 shadow-inner">
                <h4 className="text-[10px] font-bold text-amber-900/40 uppercase tracking-widest mb-3 text-center">Ваша история</h4>
                <div className="text-sm md:text-base font-body text-amber-950/90 leading-relaxed italic text-center">
                  {transcript || "Ваши слова бережно преобразуются в текст..."}
                </div>
              </div>
            </div>
          )}

          {/* Кнопка сохранения */}
          <button 
            disabled={!audioUrl || saving}
            className="w-full py-4 mt-4 rounded-full bg-amber-900 text-amber-50 font-header text-lg hover:bg-amber-800 transition-all shadow-md active:scale-[0.98] disabled:opacity-20 disabled:grayscale"
          >
            {saving ? "Сохраняем главу..." : "Записать в летопись"}
          </button>
        </div>

      </div>

      <p className="mt-8 text-[10px] text-amber-900/30 font-body uppercase tracking-[0.2em] text-center max-w-[300px]">
        Это воспоминание будет сохранено для будущих поколений вашей семьи
      </p>
    </main>
  );
}