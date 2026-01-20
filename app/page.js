"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [session, setSession] = useState(null);
  const [topics, setTopics] = useState([]);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) router.push('/login');
      else {
        fetchData(session.user.id);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push('/login');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchData = async (userId) => {
    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .order('order', { ascending: true });
    setTopics(topicsData || []);

    const { data: answersData } = await supabase
      .from('answers')
      .select('topic_id')
      .eq('user_id', userId);
    
    const completed = new Set(answersData?.map(a => a.topic_id));
    setCompletedTopics(completed);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center animate-pulse">
          <p className="font-header text-2xl text-amber-900">Открываем книгу памяти...</p>
        </div>
      </div>
    );
  }

  return (
    // Убираем bg-gray-50, чтобы был виден наш фон из globals.css
    <div className="min-h-screen p-4 md:p-8">
      {/* Header в стиле Glassmorphism */}
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12 glass-card p-6 border-white/50">
        <div>
          <h1 className="text-3xl font-header text-amber-950">Семейная Летопись</h1>
          <p className="text-sm font-body italic text-amber-900/70">{session.user.email}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="px-5 py-2 text-sm bg-amber-900/10 text-amber-900 rounded-full hover:bg-amber-900/20 transition border border-amber-900/20">
            Архив
          </Link>
          <button onClick={handleLogout} className="px-5 py-2 text-sm bg-white/50 text-gray-700 rounded-full hover:bg-white/80 transition border border-gray-200">
            Выход
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
        {topics.map((topic) => {
          const isDone = completedTopics.has(topic.id);
          return (
            <div 
              key={topic.id} 
              className={`glass-card p-8 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl ${
                isDone ? 'border-amber-400/50 bg-amber-50/40' : 'border-white/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-header text-amber-950 leading-tight">{topic.title}</h2>
                  {isDone ? (
                    <span className="bg-amber-200/80 text-amber-900 text-[10px] tracking-widest font-bold px-3 py-1 rounded-full uppercase">
                      Сохранено
                    </span>
                  ) : (
                    <span className="bg-white/40 text-gray-500 text-[10px] tracking-widest font-bold px-3 py-1 rounded-full uppercase">
                      Чистая глава
                    </span>
                  )}
                </div>
                <p className="text-amber-900/80 font-body text-base leading-relaxed mb-8">
                  {topic.description}
                </p>
              </div>

              <Link 
                href={`/topic/${topic.id}`}
                className={`block text-center w-full py-3.5 rounded-full font-header text-lg transition-all ${
                  isDone 
                    ? 'bg-amber-900/10 text-amber-900 hover:bg-amber-900/20 border border-amber-900/20' 
                    : 'bg-amber-900 text-amber-50 hover:bg-amber-800 shadow-lg shadow-amber-900/20'
                }`}
              >
                {isDone ? "Прочитать главу" : "Записать воспоминание"}
              </Link>
            </div>
          )
        })}
      </main>

      <footer className="max-w-5xl mx-auto text-center mt-16 mb-8 text-amber-900/50 font-body text-sm">
        <p>© Книга памяти вашей семьи — Сохраняя историю для потомков</p>
      </footer>
    </div>
  );
}