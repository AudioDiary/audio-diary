"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [session, setSession] = useState(null);
  const [topics, setTopics] = useState([]);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const router = useRouter();

  useEffect(() => {
    // Проверка сессии пользователя
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) router.push('/login');
      else fetchData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push('/login');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchData = async (userId) => {
    // Получаем темы
    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .order('order', { ascending: true });
    setTopics(topicsData || []);

    // Получаем список тем, на которые пользователь уже ответил
    const { data: answersData } = await supabase
      .from('answers')
      .select('topic_id')
      .eq('user_id', userId);
    
    // Создаем набор ID завершенных тем
    const completed = new Set(answersData?.map(a => a.topic_id));
    setCompletedTopics(completed);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!session) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Интервью Жизни</h1>
          <p className="text-sm text-gray-500">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
           {/* Кнопка админа простая, реальную защиту делаем в БД */}
          <Link href="/admin" className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg">Админ</Link>
          <button onClick={handleLogout} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Выход</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid gap-4 md:grid-cols-2">
        {topics.map((topic) => {
          const isDone = completedTopics.has(topic.id);
          return (
            <div key={topic.id} className={`bg-white p-6 rounded-xl border transition hover:shadow-md ${isDone ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold text-gray-800">{topic.title}</h2>
                {isDone ? (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">ЗАПИСАНО</span>
                ) : (
                  <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-full">ОЖИДАЕТ</span>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-6 h-10">{topic.description}</p>
              <Link 
                href={`/topic/${topic.id}`}
                className={`block text-center w-full py-2.5 rounded-lg font-medium transition ${isDone ? 'bg-white border border-green-300 text-green-700 hover:bg-green-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isDone ? "Прослушать / Изменить" : "Начать запись"}
              </Link>
            </div>
          )
        })}
      </main>
    </div>
  );
}