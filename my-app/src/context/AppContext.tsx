import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanReport {
  id: string;
  type: 'message' | 'url' | 'qr';
  content: string;
  riskScore: number;
  riskLevel: 'LOW' | 'CAUTION' | 'HIGH' | 'CRITICAL';
  category: string;
  summary: string;
  indicators: Array<{ name: string; explanation: string }>;
  recommendations: string[];
  urls: string[];
  confidence: number;
  analysisMethod: 'ai' | 'rule-based';
  timestamp: string;
  saved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface AppContextType {
  user: User | null;
  reports: ScanReport[];
  isOnline: boolean;
  addReport: (report: ScanReport) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  clearReports: () => Promise<void>;
  toggleSaveReport: (id: string) => Promise<void>;
  setUser: (user: User | null) => void;
  loadReports: () => Promise<void>;
  stats: { total: number; highRisk: number; safe: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const REPORTS_KEY = '@scamlens_reports';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(REPORTS_KEY);
      if (stored) setReports(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  const saveReports = async (newReports: ScanReport[]) => {
    await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(newReports));
    setReports(newReports);
  };

  const addReport = async (report: ScanReport) => {
    const updated = [report, ...reports].slice(0, 100);
    await saveReports(updated);
  };

  const deleteReport = async (id: string) => {
    await saveReports(reports.filter(r => r.id !== id));
  };

  const clearReports = async () => {
    await AsyncStorage.removeItem(REPORTS_KEY);
    setReports([]);
  };

  const toggleSaveReport = async (id: string) => {
    await saveReports(reports.map(r => r.id === id ? { ...r, saved: !r.saved } : r));
  };

  const setUser = (u: User | null) => setUserState(u);

  const stats = {
    total: reports.length,
    highRisk: reports.filter(r => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length,
    safe: reports.filter(r => r.riskLevel === 'LOW').length,
  };

  return (
    <AppContext.Provider value={{ user, reports, isOnline, addReport, deleteReport, clearReports, toggleSaveReport, setUser, loadReports, stats }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
