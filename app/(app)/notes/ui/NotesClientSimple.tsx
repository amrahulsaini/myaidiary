"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Save, Volume2, Sparkles, Lock, Loader2, MessageCircle, X, Send, Square } from "lucide-react";
import { storage, initDemoData } from "@/app/lib/storage";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  theme?: string;
  font?: string;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

function formatDay(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesClientSimple() {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [playingChatIndex, setPlayingChatIndex] = useState<number | null>(null);
  const [playingAnalysis, setPlayingAnalysis] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatAudioRef = useRef<HTMLAudioElement | null>(null);
  const analysisAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    initDemoData();
    loadNotes();
  }, []);

  function loadNotes() {
    const allNotes = storage.get<NoteRow[]>('notes', []);
    setNotes(allNotes.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ));
  }

  function handleSelectNote(note: NoteRow) {
    setActiveId(note.id);
    setDraftTitle(note.title);
    setDraftContent(note.content);
  }

  function handleSave() {
    if (!draftTitle.trim() && !draftContent.trim()) return;

    const allNotes = storage.get<NoteRow[]>('notes', []);
    
    if (activeId) {
      // Update existing
      const updated = allNotes.map(n => 
        n.id === activeId 
          ? { ...n, title: draftTitle, content: draftContent, updated_at: new Date().toISOString() }
          : n
      );
      storage.set('notes', updated);
    } else {
      // Create new
      const newNote: NoteRow = {
        id: Date.now().toString(),
        title: draftTitle,
        content: draftContent,
        theme: 'default',
        font: 'sans',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      storage.set('notes', [newNote, ...allNotes]);
    }

    loadNotes();
  }

  function handleNew() {
    setActiveId(null);
    setDraftTitle("");
    setDraftContent("");
    setAiAnalysis(null);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    
    const allNotes = storage.get<NoteRow[]>('notes', []);
    storage.set('notes', allNotes.filter(n => n.id !== id));
    
    if (activeId === id) {
      handleNew();
    }
    loadNotes();
  }

  async function handleAiAnalysis() {
    if (!draftContent.trim()) {
      alert("Please write some content first!");
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const response = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draftContent }),
      });

      if (!response.ok) {
        throw new Error("AI analysis failed");
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSendChat() {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          journalContext: notes.slice(0, 5) // Last 5 entries for context
        }),
      });

      if (!response.ok) {
        throw new Error("Chat failed");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: "ai", content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  }

  async function handleListen(note: NoteRow) {
    if (!note.content?.trim()) return;

    if (isPlaying === note.id) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(null);
      return;
    }

    try {
      setTtsLoading(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: note.content })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('TTS error:', data.error);
        alert(data.error || 'Failed to generate speech');
        return;
      }

      // Convert base64 to audio and play
      const audioData = `data:audio/wav;base64,${data.audioContent}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioData);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(null);
      audio.onerror = () => {
        setIsPlaying(null);
        alert('Failed to play audio');
      };

      await audio.play();
      setIsPlaying(note.id);
    } catch (error) {
      console.error('TTS error:', error);
      alert('Failed to generate speech');
    } finally {
      setTtsLoading(false);
    }
  }

  async function handleChatTTS(messageContent: string, messageIndex: number) {
    if (!messageContent?.trim()) return;

    if (playingChatIndex === messageIndex) {
      // Stop current audio
      if (chatAudioRef.current) {
        chatAudioRef.current.pause();
        chatAudioRef.current.currentTime = 0;
      }
      setPlayingChatIndex(null);
      return;
    }

    try {
      setTtsLoading(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageContent })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('TTS error:', data.error);
        alert(data.error || 'Failed to generate speech');
        return;
      }

      // Convert base64 to audio and play
      const audioData = `data:audio/wav;base64,${data.audioContent}`;
      
      if (chatAudioRef.current) {
        chatAudioRef.current.pause();
      }

      const audio = new Audio(audioData);
      chatAudioRef.current = audio;

      audio.onended = () => setPlayingChatIndex(null);
      audio.onerror = () => {
        setPlayingChatIndex(null);
        alert('Failed to play audio');
      };

      await audio.play();
      setPlayingChatIndex(messageIndex);
    } catch (error) {
      console.error('TTS error:', error);
      alert('Failed to generate speech');
    } finally {
      setTtsLoading(false);
    }
  }

  async function handleAnalysisTTS() {
    if (!aiAnalysis?.trim()) return;

    if (playingAnalysis) {
      // Stop current audio
      if (analysisAudioRef.current) {
        analysisAudioRef.current.pause();
        analysisAudioRef.current.currentTime = 0;
      }
      setPlayingAnalysis(false);
      return;
    }

    try {
      setTtsLoading(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiAnalysis })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('TTS error:', data.error);
        alert(data.error || 'Failed to generate speech');
        return;
      }

      // Convert base64 to audio and play
      const audioData = `data:audio/wav;base64,${data.audioContent}`;
      
      if (analysisAudioRef.current) {
        analysisAudioRef.current.pause();
      }

      const audio = new Audio(audioData);
      analysisAudioRef.current = audio;

      audio.onended = () => setPlayingAnalysis(false);
      audio.onerror = () => {
        setPlayingAnalysis(false);
        alert('Failed to play audio');
      };

      await audio.play();
      setPlayingAnalysis(true);
    } catch (error) {
      console.error('TTS error:', error);
      alert('Failed to generate speech');
    } finally {
      setTtsLoading(false);
    }
  }

  const active = notes.find(n => n.id === activeId);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* AI Chat Banner - HIGHLIGHTED */}
      <div className="rounded-3xl border-4 border-gradient-to-r from-indigo-400 to-fuchsia-400 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 p-6 shadow-2xl animate-pulse-slow">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 animate-bounce">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">
              💬 NEW: Chat with Your Sentiment AI!
            </h3>
            <p className="text-sm leading-6 text-white/90 mb-3">
              I've read all your journal entries and I'm here to chat about your thoughts, feelings, and emotional patterns. Click the floating button or ask me anything!
            </p>
            <button
              onClick={() => {
                setShowChat(true);
                if (chatMessages.length === 0) {
                  setChatMessages([{
                    role: "ai",
                    content: "Hi! I'm your sentiment AI. I can see all your journal entries and I'm here to chat about your thoughts and feelings. How are you doing today? 💜"
                  }]);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 shadow-lg hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-4 w-4" />
              Start Chatting Now
              <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold text-white">
                LIVE
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Features Banner */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 p-6 shadow-lg dark:border-indigo-500/30 dark:from-indigo-950/30 dark:to-fuchsia-950/30">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              🤖 AI-Powered Intelligence
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Our AI analyzes your journal entries to provide personalized insights, emotional patterns, and productivity trends. Available features:
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Volume2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span><strong>Gemini TTS:</strong> Listen to your entries with AI voice</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Sparkles className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                <span><strong>AI Analysis:</strong> Emotional insights & patterns in expenses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Your Notes</p>
          <button
            onClick={handleNew}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleSelectNote(note)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                activeId === note.id
                  ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-950/30'
                  : 'border-zinc-200 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              <p className="text-sm font-semibold line-clamp-1">
                {note.title || "Untitled"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {note.content || "Empty note"}
              </p>
              <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                {formatDay(note.updated_at)}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">
            {activeId ? 'Edit Note' : 'New Note'}
          </p>
          <div className="flex gap-2">
            {/* Listen to Note */}
            <button
              onClick={() => activeId && handleListen(notes.find(n => n.id === activeId)!)}
              disabled={!activeId || !draftContent.trim() || ttsLoading}
              className={`group relative inline-flex h-9 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-all ${
                !activeId || !draftContent.trim() || ttsLoading
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-400 opacity-50 cursor-not-allowed dark:border-indigo-500/30 dark:bg-indigo-950/30'
                  : 'border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400 dark:hover:bg-indigo-500'
              }`}
            >
              {ttsLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Loading...</span>
                </>
              ) : isPlaying === activeId ? (
                <>
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>

            {/* AI Analysis - NOW WORKING */}
            <button
              onClick={handleAiAnalysis}
              disabled={isAnalyzing || !draftContent.trim()}
              className="group relative inline-flex h-9 items-center gap-2 rounded-full border-2 border-fuchsia-200 bg-fuchsia-50 px-4 text-sm font-semibold text-fuchsia-700 hover:bg-fuchsia-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:border-fuchsia-500/30 dark:bg-fuchsia-950/30 dark:text-fuchsia-300"
              title={isAnalyzing ? "Analyzing..." : "Get AI sentiment analysis"}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Insights</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    NEW
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            {activeId && (
              <button
                onClick={() => handleDelete(activeId)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-lg font-semibold outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
        />

        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Start writing..."
          className="mt-4 min-h-[400px] w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
        />

        {/* AI Analysis Result */}
        {aiAnalysis && (
          <div className="mt-4 rounded-2xl border-2 border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-purple-50 p-5 dark:border-fuchsia-500/30 dark:from-fuchsia-950/30 dark:to-purple-950/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                <h4 className="font-bold text-fuchsia-900 dark:text-fuchsia-200">AI Sentiment Analysis</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalysisTTS}
                  disabled={ttsLoading}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-fuchsia-200 bg-white hover:bg-fuchsia-50 transition disabled:opacity-50 dark:border-fuchsia-500/30 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                  title="Listen to analysis"
                >
                  {playingAnalysis ? (
                    <Square className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowChat(true);
                    if (chatMessages.length === 0) {
                      setChatMessages([{
                        role: "ai",
                        content: "Hi! I've been reading your journal entries. What would you like to talk about? 💜"
                      }]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white hover:scale-105 transition-transform"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Chat with AI
                </button>
              </div>
            </div>
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{aiAnalysis}</p>
            <button
              onClick={() => setAiAnalysis(null)}
              className="mt-3 text-xs text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400"
            >
              Close
            </button>
          </div>
        )}
      </main>
      </div>

      {/* Floating Chat Button */}
      {!showChat && (
        <button
          onClick={() => {
            setShowChat(true);
            if (chatMessages.length === 0) {
              setChatMessages([{
                role: "ai",
                content: "Hi! I'm your sentiment AI. I can see all your journal entries and I'm here to chat about your thoughts and feelings. How are you doing today? 💜"
              }]);
            }
          }}
          className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-2xl hover:scale-110 transition-transform animate-bounce"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* AI Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          <div className="w-full max-w-md h-[600px] rounded-3xl border-2 border-indigo-200 bg-white shadow-2xl flex flex-col dark:border-indigo-500/30 dark:bg-zinc-900">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-indigo-100 dark:border-indigo-500/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Sentiment AI</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Based on {notes.length} journal entries</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      <p className="text-sm leading-6">{msg.content}</p>
                    </div>
                    {msg.role === "ai" && (
                      <button
                        onClick={() => handleChatTTS(msg.content, idx)}
                        disabled={ttsLoading}
                        className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-white hover:bg-indigo-50 transition disabled:opacity-50 dark:border-indigo-500/30 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                        title="Listen to message"
                      >
                        {playingChatIndex === idx ? (
                          <Square className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-indigo-100 dark:border-indigo-500/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Type your message..."
                  disabled={isChatLoading}
                  className="flex-1 rounded-full border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 disabled:opacity-50 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
                />
                <button
                  onClick={handleSendChat}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
