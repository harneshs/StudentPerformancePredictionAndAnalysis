import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  HelpCircle,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { storageService, CSVParseResult } from '../services/storageService';
import { Student } from '../types';

interface DataBackupViewProps {
  students: Student[];
  onDataChanged: () => void;
}

export const DataBackupView: React.FC<DataBackupViewProps> = ({
  students,
  onDataChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'maintenance'>('csv');
  const [dragOver, setDragOver] = useState(false);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // CSV Import States
  const [csvInputMethod, setCsvInputMethod] = useState<'file' | 'paste'>('file');
  const [csvRawText, setCsvRawText] = useState('');
  const [csvParsedResult, setCsvParsedResult] = useState<CSVParseResult | null>(null);
  const [csvMergeMode, setCsvMergeMode] = useState<'merge' | 'append' | 'replace'>('merge');
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvContent = storageService.generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_academic_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonString = storageService.exportDataAsJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_students_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Process imported JSON file
  const processJsonFile = (file: File) => {
    setImportStatus(null);
    if (!file.name.endsWith('.json')) {
      setImportStatus({
        success: false,
        message: 'Invalid file format. Please upload a valid .json file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = storageService.importDataFromJSON(text);
        if (result.success) {
          setImportStatus({
            success: true,
            message: `Successfully restored ${result.count} student records from JSON backup!`,
          });
          onDataChanged();
        } else {
          setImportStatus({
            success: false,
            message: result.error || 'Failed to import JSON data.',
          });
        }
      } catch (err: any) {
        setImportStatus({
          success: false,
          message: 'Error reading JSON file: ' + err.message,
        });
      }
    };
    reader.readAsText(file);
  };

  // Parse CSV text and preview
  const handleParseCsv = (content: string, filename?: string) => {
    setImportStatus(null);
    if (filename) setCsvFileName(filename);
    const res = storageService.parseCSVStudents(content);
    setCsvParsedResult(res);
    if (!res.success && res.errors.length > 0) {
      setImportStatus({
        success: false,
        message: res.errors.join(' | '),
      });
    }
  };

  // Process CSV File
  const processCsvFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setImportStatus({
        success: false,
        message: 'Invalid file type. Please upload a comma-separated .csv file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleParseCsv(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  };

  const handleCsvDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setCsvDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCsvFile(file);
    }
  };

  // Confirm CSV Bulk Import
  const handleExecuteCsvImport = () => {
    if (!csvParsedResult || csvParsedResult.students.length === 0) return;

    try {
      const { added, updated, total } = storageService.bulkImport(
        csvParsedResult.students,
        csvMergeMode
      );
      setImportStatus({
        success: true,
        message: `Bulk import completed! ${added} new students added, ${updated} records updated. Total active students: ${total}.`,
      });
      onDataChanged();
      // Clear preview after successful import
      setCsvParsedResult(null);
      setCsvRawText('');
      setCsvFileName(null);
    } catch (err: any) {
      setImportStatus({
        success: false,
        message: 'Failed to complete bulk import: ' + err.message,
      });
    }
  };

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all student records from Local Storage? This cannot be undone.'
    );
    if (confirmed) {
      storageService.saveStudents([]);
      onDataChanged();
      setImportStatus({
        success: true,
        message: 'All local student records have been cleared.',
      });
    }
  };

  const handleLoadSampleData = () => {
    const confirmed = window.confirm(
      'Load sample college dataset with 5 realistic students with diverse dynamic subjects, IA scores, and attendance?'
    );
    if (confirmed) {
      storageService.loadDemoData();
      onDataChanged();
      setImportStatus({
        success: true,
        message: 'Sample demo dataset successfully loaded!',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Data Backup &amp; Bulk CSV Operations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bulk import student cohorts from Excel / CSV, download standardized templates, and manage local backups.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {students.length} Registered Students
            </span>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 dark:border-slate-800">
          <button
            id="tab-csv-import"
            onClick={() => setActiveTab('csv')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk CSV Import</span>
            <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              Staff Tool
            </span>
          </button>

          <button
            id="tab-json-backup"
            onClick={() => setActiveTab('json')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>JSON Snapshot Backup</span>
          </button>

          <button
            id="tab-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'maintenance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Storage Maintenance</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {importStatus && (
        <div
          className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {importStatus.success ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">{importStatus.message}</div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-slate-400 hover:text-slate-600 text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: BULK CSV IMPORT */}
      {activeTab === 'csv' && (
        <div className="space-y-6">
          {/* Action Row & Instructions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Bulk Add Students from CSV</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Import an entire cohort, semester class, or department with course marks and attendance in seconds.
                </p>
              </div>

              {/* Template Download Button */}
              <button
                id="download-csv-template-btn"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                <span>Download Sample CSV Template</span>
              </button>
            </div>

            {/* Format Instructions Accordion / Explainer */}
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center space-x-1.5 font-medium text-slate-800 dark:text-slate-200">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>CSV Structure Guidelines:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-slate-700 dark:text-slate-300">Mandatory Columns:</strong>{' '}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">RegisterNo</code> and{' '}
                  <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400">Name</code>.
                </li>
                <li>
                  <strong className="text-slate-700 dark:text-slate-300">Multiple Courses:</strong> If a student has multiple courses (e.g. 5 subjects), list each course on a separate row sharing the same RegisterNo. They will automatically be aggregated into one student record!
                </li>
                <li>
                  <strong className="text-slate-700 dark:text-slate-300">Optional Metrics:</strong>{' '}
                  <code className="text-slate-700 dark:text-slate-300">SubjectName, SubjectCode, IA1 (0-50), IA2 (0-50), IA3 (0-50), ConsolidatedInternal (0-100), Assignment1-3 (0-5), PeriodsConducted, PeriodsAttended</code>.
                </li>
                <li>
                  <strong className="text-slate-700 dark:text-slate-300">Auto-Calculations:</strong> If Consolidated Internal is left blank, the portal automatically computes it using the assessment average scaled to 100.
                </li>
              </ul>
            </div>

            {/* Input Selection: Upload File vs Paste Raw CSV */}
            <div className="mt-5">
              <div className="flex items-center space-x-3 mb-4">
                <button
                  type="button"
                  onClick={() => setCsvInputMethod('file')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    csvInputMethod === 'file'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Upload .CSV File
                </button>
                <button
                  type="button"
                  onClick={() => setCsvInputMethod('paste')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    csvInputMethod === 'paste'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Paste CSV Text Directly
                </button>
              </div>

              {csvInputMethod === 'file' ? (
                /* Drag & Drop File Zone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setCsvDragOver(true);
                  }}
                  onDragLeave={() => setCsvDragOver(false)}
                  onDrop={handleCsvDrop}
                  onClick={() => csvFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    csvDragOver
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[0.99]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/40 dark:bg-slate-800/20'
                  }`}
                >
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-emerald-500 mb-2.5" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {csvFileName ? `Selected: ${csvFileName}` : 'Click to select or drag & drop .csv file here'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                    Accepts comma-separated spreadsheet exports (.csv, .txt)
                  </span>
                  <input
                    ref={csvFileInputRef}
                    id="csv-file-input"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Direct Textarea Paste */
                <div className="space-y-3">
                  <textarea
                    id="csv-raw-textarea"
                    rows={6}
                    value={csvRawText}
                    onChange={(e) => setCsvRawText(e.target.value)}
                    placeholder="RegisterNo,Name,Department,Year,Semester,Section,AcademicYear,SubjectName,SubjectCode,IA1,IA2,IA3,ConsolidatedInternal,Assignment1,Assignment2,Assignment3,PeriodsConducted,PeriodsAttended&#10;710022104010,Vikram S,Computer Science and Engineering,III Year,5,A,2024-2025,Design & Analysis of Algorithms,CS8501,40,42,45,87,5,4,5,45,42"
                    className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    id="parse-csv-text-btn"
                    type="button"
                    onClick={() => handleParseCsv(csvRawText, 'Pasted Text')}
                    disabled={!csvRawText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
                  >
                    Parse Pasted CSV Data
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PARSED PREVIEW & IMPORT CONTROLS */}
          {csvParsedResult && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Import Preview &amp; Verification</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Found {csvParsedResult.studentCount} unique student records across {csvParsedResult.subjectCount} course mark entries.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setCsvParsedResult(null);
                      setCsvFileName(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Warnings if any */}
              {csvParsedResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200 text-xs">
                  <span className="font-semibold block mb-1">Warnings during parsing:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {csvParsedResult.warnings.slice(0, 3).map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                    {csvParsedResult.warnings.length > 3 && (
                      <li>...and {csvParsedResult.warnings.length - 3} more warnings.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Import Mode Radio Options */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Select Import Behavior:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <label
                    className={`flex items-start p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      csvMergeMode === 'merge'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="csvMergeMode"
                      value="merge"
                      checked={csvMergeMode === 'merge'}
                      onChange={() => setCsvMergeMode('merge')}
                      className="mt-0.5 mr-2 text-indigo-600"
                    />
                    <div>
                      <span className="block font-semibold">Merge &amp; Update (Recommended)</span>
                      <span className="text-[11px] opacity-80">
                        Updates existing students by RegisterNo and appends new ones.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      csvMergeMode === 'append'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="csvMergeMode"
                      value="append"
                      checked={csvMergeMode === 'append'}
                      onChange={() => setCsvMergeMode('append')}
                      className="mt-0.5 mr-2 text-indigo-600"
                    />
                    <div>
                      <span className="block font-semibold">Append New Only</span>
                      <span className="text-[11px] opacity-80">
                        Skips students whose RegisterNo is already present.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      csvMergeMode === 'replace'
                        ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="csvMergeMode"
                      value="replace"
                      checked={csvMergeMode === 'replace'}
                      onChange={() => setCsvMergeMode('replace')}
                      className="mt-0.5 mr-2 text-rose-600"
                    />
                    <div>
                      <span className="block font-semibold">Full Replace</span>
                      <span className="text-[11px] opacity-80">
                        Overwrites all existing records with this new batch.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="px-3 py-2.5">Register No</th>
                      <th className="px-3 py-2.5">Student Name</th>
                      <th className="px-3 py-2.5">Department</th>
                      <th className="px-3 py-2.5">Year / Sem</th>
                      <th className="px-3 py-2.5 text-center">Courses Count</th>
                      <th className="px-3 py-2.5">Course Sample</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {csvParsedResult.students.slice(0, 8).map((st, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-3 py-2 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                          {st.registerNo}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                          {st.name}
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                          {st.department}
                        </td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {st.year} - Sem {st.semester}
                        </td>
                        <td className="px-3 py-2 text-center font-semibold">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {st.subjects.length}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                          {st.subjects.map((s) => s.subjectName).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvParsedResult.students.length > 8 && (
                <div className="text-center text-xs text-slate-500">
                  Showing first 8 of {csvParsedResult.students.length} students in this import.
                </div>
              )}

              {/* Confirm Import Button */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCsvParsedResult(null);
                    setCsvFileName(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Discard Batch
                </button>
                <button
                  id="confirm-csv-import-btn"
                  type="button"
                  onClick={handleExecuteCsvImport}
                  className="inline-flex items-center px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Confirm &amp; Import {csvParsedResult.studentCount} Students</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JSON SNAPSHOT BACKUP */}
      {activeTab === 'json' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export JSON Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>Export JSON Snapshot</span>
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {students.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Downloads a complete machine-readable snapshot containing all registered students, full course lists, IA1-IA3 scores, assignments, and attendance logs.
              </p>
            </div>

            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              disabled={students.length === 0}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Download Full Backup (.json)</span>
            </button>
          </div>

          {/* Import JSON Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Restore JSON Backup</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Upload a JSON archive generated from this portal. Validates the schema before writing to browser Local Storage.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processJsonFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <FileJson className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 block">
                Click to select or drag &amp; drop .json backup file
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Standard Academic Portal Schema
              </span>
              <input
                ref={fileInputRef}
                id="import-json-file-input"
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processJsonFile(file);
                }}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STORAGE MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Local Storage Database Controls</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All records are stored securely in your browser's persistent Local Storage. You can re-populate sample college data or purge local records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  Load Realistic Sample College Cohort
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Populates the portal with 5 demo students with diverse subject counts, varying IA trends, and attendance alerts.
                </p>
              </div>
              <button
                id="load-sample-dataset-btn"
                onClick={handleLoadSampleData}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                <span>Reset to Sample College Data</span>
              </button>
            </div>

            <div className="p-4 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">
                  Purge All Local Records
                </h4>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mb-3">
                  Permanently clears all student records, course lists, and marks stored in this browser session.
                </p>
              </div>
              <button
                id="clear-all-data-btn"
                onClick={handleResetData}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Clear All Student Records</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
