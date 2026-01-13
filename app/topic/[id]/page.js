"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AudioRecorder from "@/components/AudioRecorder";
import { ArrowLeft } from "lucide-react";

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [user, setUser] = useState(null);
  const [existingAudio, setExistingAudio] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        loadTopicData(id, session.user.id);
      }
    });
  }, [id, router]);

  const loadTopicData = async (topicId, userId) => {
    // 1. Грузим тему
    const { data: topicData } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .single();
    setTopic(topicData);

    // 2. Проверяем, есть ли уже ответ
    const { data: answerData } = await supabase
      .from('answers')
      .select('audio_url')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single(); // берем последний
      
    if (answerData) setExistingAudio(answerData.audio_url);
  };

  if (!topic) return <div className="p-10 text-center">Загрузка темы...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft size={16} className="mr-1" /> Назад к темам
        </Link>
        
        <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
        <p className="text-gray-500 mb-6">{topic.description}</p>

        <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-4 uppercase text-sm tracking-wide">Список вопросов:</h3>
          <ul className="list-disc list-inside space-y-2">
            {topic.questions?.map((q, idx) => (
              <li key={idx} className="text-gray-800 text-lg">{q}</li>
            ))}
          </ul>
        </div>

        {existingAudio && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-bold mb-2 text-sm">ВЫ УЖЕ ЗАПИСАЛИ ОТВЕТ:</p>
            <audio src={existingAudio} controls className="w-full" />
            <p className="text-xs text-gray-500 mt-2">Запись новой версии заменит предыдущую.</p>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-center font-bold mb-2">Ваш ответ</h3>
          <p className="text-center text-gray-500 text-sm mb-4">Нажмите кнопку, прочитайте вопросы и ответьте на них голосом.</p>
          
          <AudioRecorder 
            topicId={topic.id} 
            userId={user?.id}
            onComplete={() => loadTopicData(topic.id, user.id)}
          />
        </div>
      </div>
    </div>
  );
}