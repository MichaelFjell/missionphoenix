import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabase.js';
import './site.css';
import Home from './Home.jsx';
import Quiz from './Quiz.jsx';
import Tracker from './Tracker.jsx';
import Community from './Community.jsx';
import Journal from './Journal.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import Support from './Support.jsx';
import Archive from './Archive.jsx';
import JourneyPreview from './JourneyPreview.jsx';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import ThemeSwitcher from './ThemeSwitcher.jsx';

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  };

  const signUp = async (username, password) => {
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@missionphoenix.life`;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username,
      });
      if (profileError) throw profileError;
      await loadProfile(data.user.id);
    }
    return data;
  };

  const signIn = async (username, password) => {
    const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@missionphoenix.life`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateProfile, loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/community" element={<Community />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/journey-preview" element={<JourneyPreview />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<Support />} />
        </Routes>
        <SiteFooter />
        <ThemeSwitcher />
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
