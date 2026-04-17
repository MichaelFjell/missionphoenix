import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from './supabase.js';
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

// Nav bar
function Nav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={navStyles.bar}>
      <Link to="/" style={navStyles.logo}>MISSION PHOENIX</Link>
      <div style={navStyles.links}>
        <Link to="/quiz" style={navStyles.link}>Assessment</Link>
        <Link to="/tracker" style={navStyles.link}>Tracker</Link>
        <Link to="/community" style={navStyles.link}>Community</Link>
        <Link to="/archive" style={navStyles.link}>Archive</Link>
        <Link to="/about" style={navStyles.link}>About</Link>
        <Link to="/contact" style={navStyles.link}>Contact</Link>
        <Link to="/support" style={navStyles.link}>Donate</Link>
        {user && profile ? (
          <span style={navStyles.userArea}>
            <span style={navStyles.username}>{profile.username}</span>
            <button onClick={() => { signOut(); navigate('/'); }} style={navStyles.logoutBtn}>Logout</button>
          </span>
        ) : null}
      </div>
    </nav>
  );
}

const navStyles = {
  bar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px',
    background: 'rgba(26,21,18,0.95)',
    borderBottom: '1px solid #1a1a1a',
    backdropFilter: 'blur(8px)',
  },
  logo: {
    fontFamily: "'Oswald', sans-serif", fontSize: '14px', letterSpacing: '4px',
    color: '#c45a2a', textDecoration: 'none',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: '24px',
  },
  link: {
    fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px',
    color: '#666', textDecoration: 'none', textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  userArea: {
    display: 'flex', alignItems: 'center', gap: '12px',
    borderLeft: '1px solid #222', paddingLeft: '16px', marginLeft: '8px',
  },
  username: {
    fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '2px',
    color: '#888',
  },
  logoutBtn: {
    fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px',
    color: '#555', background: 'none', border: '1px solid #333',
    padding: '4px 10px', cursor: 'pointer',
  },
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: '#1a1512', color: '#d4d0c8', fontFamily: "'EB Garamond', Georgia, serif" }}>
          <Nav />
          <div style={{ paddingTop: '52px' }}>
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
          </div>

        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
