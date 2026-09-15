import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, getToken, setToken } from "../api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfileState] = useState({ age: null, height_cm: null, weight_kg: null, family_history: false });
  const [logs, setLogs] = useState([]);
  const [riskResult, setRiskResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState(null);

  const loadEverything = useCallback(async () => {
    try {
      const [profileData, logsData, riskData] = await Promise.all([
        api.getProfile(),
        api.getLogs(),
        api.getLatestRisk().catch(() => null),
      ]);
      setProfileState(profileData);
      setLogs(logsData);
      setRiskResult(riskData);
      api.getRecommendations().then(setRecommendations).catch(() => {});
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // On mount: if a token already exists (page refresh), try to restore session
  // by simply attempting to load data — if the token is invalid/expired the
  // calls will 401 and we fall back to logged-out state.
  useEffect(() => {
    async function restore() {
      const token = getToken();
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const profileData = await api.getProfile();
        setProfileState(profileData);
        const [logsData, riskData] = await Promise.all([
          api.getLogs(),
          api.getLatestRisk().catch(() => null),
        ]);
        setLogs(logsData);
        setRiskResult(riskData);
        api.getRecommendations().then(setRecommendations).catch(() => {});
        // We don't have a /me endpoint, so name/email are re-derived from
        // local storage set at login time.
        const cachedUser = localStorage.getItem("fp_user");
        if (cachedUser) setUser(JSON.parse(cachedUser));
      } catch {
        setToken(null);
        localStorage.removeItem("fp_user");
      } finally {
        setAuthReady(true);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const data = await api.login(email, password);
    setToken(data.access_token);
    localStorage.setItem("fp_user", JSON.stringify(data.user));
    setUser(data.user);
    await loadEverything();
  }, [loadEverything]);

  const signup = useCallback(async (name, email, password) => {
    setError(null);
    const data = await api.register(name, email, password);
    setToken(data.access_token);
    localStorage.setItem("fp_user", JSON.stringify(data.user));
    setUser(data.user);
    await loadEverything();
  }, [loadEverything]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("fp_user");
    setUser(null);
    setProfileState({ age: null, height_cm: null, weight_kg: null, family_history: false });
    setLogs([]);
    setRiskResult(null);
    setRecommendations(null);
  }, []);

  const setProfile = useCallback(async (newProfile) => {
    const saved = await api.updateProfile(newProfile);
    setProfileState(saved);
    api.getRecommendations().then(setRecommendations).catch(() => {});
    return saved;
  }, []);

  const addLog = useCallback(async (entry) => {
    const saved = await api.addLog(entry);
    setLogs((prev) => [...prev, saved].sort((a, b) => new Date(a.log_date) - new Date(b.log_date)));
    api.getRecommendations().then(setRecommendations).catch(() => {});
    return saved;
  }, []);

  const runRiskCheck = useCallback(async (answers) => {
    const result = await api.predict(answers);
    setRiskResult(result);
    api.getRecommendations().then(setRecommendations).catch(() => {});
    return result;
  }, []);

  const value = {
    user,
    authReady,
    error,
    login,
    signup,
    logout,
    profile,
    setProfile,
    logs,
    addLog,
    riskResult,
    runRiskCheck,
    recommendations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
