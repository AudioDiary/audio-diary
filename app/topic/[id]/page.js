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
    
    // Проверяем, есть ли уже ответ
    const { data: session } = await supabase.auth.getSession();
    if (session?.session) {
      const { data: answer } = await supabase
        .from('answers')
        .select('*')
        .eq('topic_id', id)
        .eq('user_id', session.session.user.id)
        .single();
      
      if (answer) {
        setTranscript(answer.content);
        setAudioUrl(answer.audio_url);
      }
    }
    setLoading(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' });
      setAudioUrl(URL.createObjectURL(audioBlob));
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-6 animate-pulse font-header text-amber-900">Открываем главу...</div>
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Кнопка назад */}
      <div className="w-full max-w-3xl mb-6">
        <Link href="/" className="text-amber-900/60 hover:text-amber-900 flex items-center gap-2 font-body transition-all">
          ← Вернуться к списку глав
        </Link>
      </div>

      <div className="glass-card w-full max-w-3xl p-8 md:p-12 shadow-2xl border-white/40 relative overflow-hidden">
        {/* Декоративный элемент - номер главы */}
        <div className="absolute top-4 right-8 font-header text-5xl opacity-5 text-amber-900">
          {topic?.order || "I"}
        </div>

        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-header text-amber-950 mb-4">
            {topic?.title}
          </h1>
          <div className="w-24 h-px bg-amber-900/20 mx-auto mb-6"></div>
          <p className="text-lg font-body italic text-amber-900/80 leading-relaxed">
            «{topic?.description}»
          </p>
        </header>

        <section className="flex flex-col items-center gap-8">
          {/* Визуализатор записи (упрощенный) */}
          {recording && (
            <div className="flex gap-1 items-center h-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1 bg-amber-700 rounded-full animate-bounce" 
                     style={{ height: '60%', animationDelay: `${i * 0.1}s` }}></div>
              ))}
              <span className="ml-3 text-red-700 font-mono text-sm animate-pulse">ИДЕТ ЗАПИСЬ...</span>
            </div>
          )}

          {/* Кнопка записи в стиле ретро */}
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
              recording 
              ? 'bg-red-50 border-4 border-red-700 scale-110 shadow-red-200' 
              : 'bg-amber-900 border-4 border-amber-800 hover:scale-105 shadow-amber-900/30'
            }`}
          >
            {recording ? (
              <div className="w-8 h-8 bg-red-700 rounded-sm"></div>
            ) : (
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-amber-50 border-b-[12px] border-b-transparent ml-2"></div>
            )}
          </button>

          <p className="text-sm font-body text-amber-900/60 text-center">
            {recording ? "Нажмите, чтобы завершить рассказ" : "Нажмите и начните говорить"}
          </p>

          {/* Блок с результатом (Транскрипт / Аудио) */}
          {(transcript || audioUrl) && (
            <div className="w-full mt-8 p-6 rounded-2xl bg-white/40 border border-amber-900/10">
              <h3 className="font-header text-amber-900 mb-3 uppercase tracking-widest text-xs font-bold">Ваше воспоминание:</h3>
              
              {audioUrl && (
                <audio src={audioUrl} controls className="w-full mb-4 h-10 accent-amber-900" />
              )}
              
              <div className="font-body text-amber-950 leading-relaxed whitespace-pre-wrap italic opacity-90">
                {transcript || "Текст воспоминания скоро появится здесь после обработки..."}
              </div>
            </div>
          )}

          <button 
            disabled={!audioUrl || saving}
            className="mt-4 px-10 py-3 rounded-full bg-amber-900 text-amber-50 font-header text-lg hover:bg-amber-800 transition-all disabled:opacity-30 shadow-lg"
          >
            {saving ? "Сохраняем в летопись..." : "Сохранить в книгу"}
          </button>
        </section>
      </div>

      <footer className="mt-12 text-amber-900/40 font-body italic text-sm text-center max-w-md">
        Это воспоминание станет частью истории вашей семьи и будет передано вашим детям и внукам.
      </footer>
    </main>
  );
}