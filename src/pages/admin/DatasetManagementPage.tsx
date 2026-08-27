import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DatasetInfo } from '../../types';
import {
  Database,
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';

export const DatasetManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  const fetchDatasets = async () => {
    try {
      const res = await fetch('/api/admin/datasets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDatasets(data.datasets || []);
      }
    } catch (e) {
      console.error('Failed to load datasets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/datasets/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setUploading(false);

      if (res.ok) {
        setMessage({ type: 'success', text: `Dataset "${data.dataset.name}" ingested successfully with ${data.dataset.rowCount} rows.` });
        fetchDatasets();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload dataset.' });
      }
    } catch (e) {
      setUploading(false);
      setMessage({ type: 'error', text: 'Network upload error.' });
    }
  };

  const handlePreviewDataset = async (dataset: DatasetInfo) => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/datasets/${dataset.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedDataset(data.dataset);
      }
    } catch (e) {
      console.error('Failed to preview dataset:', e);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeleteDataset = async (dataset: DatasetInfo) => {
    if (!confirm(`Delete dataset ${dataset.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/datasets/${dataset.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Dataset deleted.` });
        fetchDatasets();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete dataset.' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Database size={14} />
            <span>Ocean Telemetry Ingestion Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Dataset Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload CSV oceanographic records, validate column schematics, and prepare training sets
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* CSV Ingestion Dropzone */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 transition text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
          <UploadCloud size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-100 font-heading">
            Upload Ocean Telemetry CSV File
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Drop your <code className="text-cyan-300 font-mono">.csv</code> file with columns: <span className="font-mono text-[11px] text-slate-300">wave_height, wave_period, wind_speed, pressure, temp, current</span>
          </p>
        </div>

        <div className="pt-2">
          <label
            htmlFor="dataset-file-input"
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <FileSpreadsheet size={16} />
            <span>{uploading ? 'Parsing & Ingesting...' : 'Browse & Upload CSV'}</span>
          </label>
          <input
            id="dataset-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>
      </div>

      {/* Datasets Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-heading">
          Available Training &amp; Validation Datasets
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading datasets...
          </div>
        ) : datasets.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No datasets uploaded yet. Upload a CSV file above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 px-3">Dataset Name</th>
                  <th className="pb-3 px-3">Total Rows</th>
                  <th className="pb-3 px-3">File Size</th>
                  <th className="pb-3 px-3">Feature Columns</th>
                  <th className="pb-3 px-3">Ingested At</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-200 block">{d.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {d.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {d.rowCount.toLocaleString()} rows
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{d.fileSize}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800">
                        {d.columns.length} columns
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(d.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handlePreviewDataset(d)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-semibold transition"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDeleteDataset(d)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Delete Dataset"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dataset Inspection Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Dataset Inspection &amp; Schema
                </span>
                <h3 className="text-xl font-bold text-slate-100 font-heading">
                  {selectedDataset.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDataset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Feature Columns Chips */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-mono">Recognized Feature Schema:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDataset.columns?.map((col: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Sample Rows Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-200">Sample Row Records:</span>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px]">
                      {selectedDataset.columns?.map((col: string, i: number) => (
                        <th key={i} className="py-2 px-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {selectedDataset.sampleRows?.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-900/50">
                        {selectedDataset.columns?.map((col: string, cIdx: number) => (
                          <td key={cIdx} className="py-2 px-3">{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDataset(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
