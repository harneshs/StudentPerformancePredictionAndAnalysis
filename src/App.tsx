import React, { useState, useEffect } from 'react';
import { StaffUser, Student, SettingsConfig, ThemeMode } from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { Navbar, NavTab } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { StudentsListView } from './components/StudentsListView';
import { StudentFormView } from './components/StudentFormView';
import { PerformanceAnalysisView } from './components/PerformanceAnalysisView';
import { AIAssistantView } from './components/AIAssistantView';
import { ReportsView } from './components/ReportsView';
import { DataBackupView } from './components/DataBackupView';
import { SettingsView } from './components/SettingsView';
import { StudentParentPortalView } from './components/StudentParentPortalView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    return authService.getCurrentUser();
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [students, setStudents] = useState<Student[]>(() => {
    return storageService.getStudents();
  });
  const [settings, setSettings] = useState<SettingsConfig>(() => {
    return storageService.getSettings();
  });

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    return storageService.getTheme();
  });

  // Check URL query parameters for student portal access
  const [viewMode, setViewMode] = useState<'staff' | 'student-portal'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'student') {
        return 'student-portal';
      }
    }
    return 'staff';
  });

  const [portalInitialRegNo, setPortalInitialRegNo] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('reg') || '';
    }
    return '';
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(
    students.length > 0 ? students[0].id : undefined
  );
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Apply theme on load and changes
  useEffect(() => {
    storageService.applyTheme(currentTheme);
  }, [currentTheme]);

  // Initialize demo data if first time
  useEffect(() => {
    const existing = storageService.getStudents();
    if (existing.length === 0) {
      const demoList = storageService.loadDemoData();
      setStudents(demoList);
      if (demoList.length > 0) {
        setSelectedStudentId(demoList[0].id);
      }
    }
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    storageService.saveTheme(newTheme);
  };

  const handleLoginSuccess = (user: StaffUser) => {
    setCurrentUser(user);
    setViewMode('staff');
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleNavigate = (tab: NavTab, studentId?: string) => {
    if (studentId) {
      setSelectedStudentId(studentId);
    }
    if (tab === 'add-student' && !studentId) {
      setEditingStudent(null);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setCurrentTab('add-student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudent = (student: Student) => {
    storageService.saveStudent(student);
    const updated = storageService.getStudents();
    setStudents(updated);
    setSelectedStudentId(student.id);
    setEditingStudent(null);
    setCurrentTab('students');
  };

  const handleDeleteStudent = (id: string) => {
    storageService.deleteStudent(id);
    const updated = storageService.getStudents();
    setStudents(updated);
    if (selectedStudentId === id) {
      setSelectedStudentId(updated.length > 0 ? updated[0].id : undefined);
    }
  };

  const handleLoadDemoData = () => {
    const demo = storageService.loadDemoData();
    setStudents(demo);
    if (demo.length > 0) {
      setSelectedStudentId(demo[0].id);
    }
  };

  const handleDataChanged = () => {
    const fresh = storageService.getStudents();
    setStudents(fresh);
    if (fresh.length > 0 && !selectedStudentId) {
      setSelectedStudentId(fresh[0].id);
    }
  };

  const handleUpdateSettings = (newSettings: SettingsConfig) => {
    setSettings(newSettings);
    if (newSettings.theme && newSettings.theme !== currentTheme) {
      setCurrentTheme(newSettings.theme);
    }
    // Update currentUser display name immediately if logged in
    if (currentUser && newSettings.professorName) {
      const updatedUser: StaffUser = {
        ...currentUser,
        name: newSettings.professorName,
        role: newSettings.professorRole || currentUser.role,
        department: newSettings.departmentName || currentUser.department,
        institution: newSettings.institutionName || currentUser.institution,
      };
      setCurrentUser(updatedUser);
    }
  };

  const handleOpenStudentPortal = (regNo?: string) => {
    if (regNo) {
      setPortalInitialRegNo(regNo);
    }
    setViewMode('student-portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStaff = () => {
    setViewMode('staff');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Student & Parent Portal mode, show the dedicated public portal
  if (viewMode === 'student-portal') {
    return (
      <StudentParentPortalView
        students={students}
        settings={settings}
        onBackToStaff={handleBackToStaff}
        initialRegNo={portalInitialRegNo}
      />
    );
  }

  // If staff is not logged in, display the Login view
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onOpenStudentPortal={() => handleOpenStudentPortal()}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'add-student') {
            setEditingStudent(null);
          }
          setCurrentTab(tab);
        }}
        staffUser={currentUser}
        onLogout={handleLogout}
        studentCount={students.length}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onOpenStudentPortal={() => handleOpenStudentPortal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            students={students}
            settings={settings}
            onNavigate={handleNavigate}
            onLoadDemoData={handleLoadDemoData}
          />
        )}

        {currentTab === 'students' && (
          <StudentsListView
            students={students}
            settings={settings}
            onNavigate={handleNavigate}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onLoadDemoData={handleLoadDemoData}
          />
        )}

        {currentTab === 'add-student' && (
          <StudentFormView
            initialStudent={editingStudent}
            onSave={handleSaveStudent}
            onCancel={() => {
              setEditingStudent(null);
              setCurrentTab('students');
            }}
          />
        )}

        {currentTab === 'performance' && (
          <PerformanceAnalysisView
            students={students}
            selectedStudentId={selectedStudentId}
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'ai-assistant' && (
          <AIAssistantView
            students={students}
            selectedStudentId={selectedStudentId}
            settings={settings}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            students={students}
            selectedStudentId={selectedStudentId}
            settings={settings}
          />
        )}

        {currentTab === 'backup' && (
          <DataBackupView
            students={students}
            onDataChanged={handleDataChanged}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AI-Based Student Performance Prediction &amp; Smart Academic Assistant &copy; {new Date().getFullYear()}
          </span>
          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <button
              onClick={() => handleOpenStudentPortal()}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Public Student/Parent Scorecard Portal
            </button>
            <span>•</span>
            <span>Local Storage • Dynamic Courses • Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
