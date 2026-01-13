"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Trash2, Save, RefreshCw, Play, Pause } from "lucide-react";

// !!! ЗАМЕНИТЕ НА ВАШ EMAIL !!!
const ADMIN_EMAIL = "memoryweb.root@gmail.com"; 

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("topics"); // "topics" or "answers"
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      alert("Доступ запрещен. Вы не администратор.");
      router.push("/");
      return;
    }
    setUser(session.user);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    // Загружаем темы
    const { data: tData } = await supabase.from("topics").select("*").order("order");
    setTopics(tData || []);

    // Загружаем ответы пользователей
    const { data: aData } = await supabase
      .from("answers")
      .select("*, topics(title)") // Join table topics
      .order("created_at", { ascending: false });
    setAnswers(aData || []);
    setLoading(false);
  };

  // --- ФУНКЦИИ ДЛЯ ТЕМ ---
  
  const handleTopicChange = (id, field, value) => {
    setTopics(topics.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleQuestionsChange = (id, value) => {
    // Превращаем текст обратно в массив, разделяя по новой строке
    const qArray = value.split("\n").filter(line => line.trim() !== "");
    setTopics(topics.map(t => t.id === id ? { ...t, questions: qArray } : t));
  };

  const saveTopic = async (topic) => {
    try {
      const { error } = await supabase
        .from("topics")
        .update({ 
          title: topic.title, 
          description: topic.description, 
          questions: topic.questions 
        })
        .eq("id", topic.id);

      if (error) throw error;
      alert("Тема сохранена!");
    } catch (e) {
      alert("Ошибка: " + e.message);
    }
  };

  const deleteTopic = async (id) => {
    if(!confirm("Удалить тему?")) return;
    const { error } = await supabase.from("topics").delete().eq("id", id);
    if (!error) setTopics(topics.filter(t => t.id !== id));
    else alert("Ошибка удаления (возможно, есть ответы по этой теме)");
  };

  const createDefaultTopics = async () => {
    if(!confirm("Это создаст 8 стандартных тем. Продолжить?")) return;
    // SQL запрос через RPC или просто insert, если политики позволяют. 
    // Для простоты используем код, который вы уже знаете из SQL редактора, но через JS:
    const defaultTopics = [
        { title: 'Детство', description: 'О ранних годах', questions: ['Яркое воспоминание?', 'Лучший друг?'], order: 1 },
        { title: 'Школьные годы', description: 'Время учебы', questions: ['Любимый предмет?', 'Учитель?'], order: 2 },
        // ... можно добавить остальные
    ];
    
    const { error } = await supabase.from('topics').insert(defaultTopics);
    if(error) alert("Ошибка: " + error.message);
    else {
        alert("Темы созданы!");
        loadData();
    }
  };

  const addNewTopic = async () => {
    const { error } = await supabase.from('topics').insert({
        title: "Новая тема",
        description: "Описание",
        questions: ["Вопрос 1"],
        order: topics.length + 1
    });
    if(!error) loadData();
  };

  if (loading) return <div className="p-10 text-center">Проверка прав...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Админ-панель</h1>
          <button onClick={() => router.push("/")} className="text-blue-600 underline">Вернуться на сайт</button>
        </header>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab("topics")}
            className={`px-4 py-2 rounded ${activeTab === "topics" ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            Управление темами
          </button>
          <button 
            onClick={() => setActiveTab("answers")}
            className={`px-4 py-2 rounded ${activeTab === "answers" ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            Ответы пользователей ({answers.length})
          </button>
        </div>

        {activeTab === "topics" && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
                <button onClick={addNewTopic} className="bg-green-600 text-white px-4 py-2 rounded">
                    + Добавить тему
                </button>
                {topics.length === 0 && (
                    <button onClick={createDefaultTopics} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
                        <RefreshCw size={16}/> Загрузить стандартные
                    </button>
                )}
            </div>

            {topics.map(topic => (
              <div key={topic.id} className="bg-white p-4 rounded shadow border border-gray-200">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-500">Название</label>
                    <input 
                      className="w-full border p-2 rounded mb-2"
                      value={topic.title}
                      onChange={(e) => handleTopicChange(topic.id, 'title', e.target.value)}
                    />
                    <label className="block text-xs font-bold text-gray-500">Описание</label>
                    <textarea 
                      className="w-full border p-2 rounded h-20"
                      value={topic.description || ""}
                      onChange={(e) => handleTopicChange(topic.id, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500">Вопросы (каждый с новой строки)</label>
                    <textarea 
                      className="w-full border p-2 rounded h-32 font-mono text-sm"
                      value={topic.questions?.join("\n")}
                      onChange={(e) => handleQuestionsChange(topic.id, e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => deleteTopic(topic.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 size={20} />
                  </button>
                  <button onClick={() => saveTopic(topic)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Save size={18}/> Сохранить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "answers" && (
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Дата</th>
                            <th className="p-4">User ID</th>
                            <th className="p-4">Тема</th>
                            <th className="p-4">Аудио</th>
                        </tr>
                    </thead>
                    <tbody>
                        {answers.map(ans => (
                            <tr key={ans.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(ans.created_at).toLocaleString('ru-RU')}
                                </td>
                                <td className="p-4 font-mono text-xs text-blue-600">
                                    {ans.user_id.slice(0, 8)}...
                                </td>
                                <td className="p-4 font-medium">
                                    {ans.topics?.title || "Удаленная тема"}
                                </td>
                                <td className="p-4">
                                    <audio controls src={ans.audio_url} className="h-8 w-60" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}