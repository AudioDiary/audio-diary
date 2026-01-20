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
      else { fetchData(session.user.id); setLoading(false); }
    });
  }, [router]);

  const fetchData = async (userId) => {
    const { data: topicsData } = await supabase.from('topics').select('*').order('order', { ascending: true });
    setTopics(topicsData || []);
    const { data: answersData } = await supabase.from('answers').select('topic_id').eq('user_id', userId);
    setCompletedTopics(new Set(answersData?.map(a => a.topic_id)));
  };

  if (loading || !session) return <div className="min-h-screen bg-[#fdfaf6]" />;

  return (
    <main className="min-h-screen bg-[#fdfaf6] p-6 md:p-12">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-3xl font-header text-amber-950">Семейная Летопись</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-sm opacity-40 hover:opacity-100">Выход</button>
      </header>

      <div className="max-w-5xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2">
        {topics.map((topic) => {
          const isDone = completedTopics.has(topic.id);
          return (
            <div key={topic.id} className="glass-card p-8 flex flex-col justify-between border-amber-900/5 shadow-sm">
              <div>
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] tracking-widest opacity-30 font-bold uppercase">Глава {topic.order}</span>
                  {isDone && <span className="text-[10px] text-amber-700 font-bold tracking-widest">СОХРАНЕНО</span>}
                </div>
                <h2 className="text-2xl font-header text-amber-950 mb-3">{topic.title}</h2>
                <p className="text-sm text-amber-900/60 italic mb-8 leading-relaxed">{topic.description}</p>
              </div>
              <Link href={`/topic/${topic.id}`} 
                className={`w-full py-3 rounded-full text-center font-header transition-all ${
                  isDone ? 'bg-amber-900/5 text-amber-900 border border-amber-900/10' : 'bg-amber-900 text-white shadow-lg shadow-amber-900/20'
                }`}>
                {isDone ? "Прочитать" : "Начать запись"}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}