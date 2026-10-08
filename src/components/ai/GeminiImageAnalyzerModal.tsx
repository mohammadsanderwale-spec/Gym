import React, { useState, useRef } from 'react';
import { useGym } from '../../context/GymContext';
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle, AlertTriangle, Utensils, Activity, Image as ImageIcon } from 'lucide-react';

// Generate genuine Base64 JPEG raster images for presets via HTML Canvas
const createSampleCanvasImage = (type: 'meal' | 'deadlift' | 'whey'): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 600, 420);

  if (type === 'meal') {
    // Thali Plate
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(300, 230, 155, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Paneer Katori
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(225, 180, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Paneer 200g', 180, 185);

    // Dal Tadka Katori
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(375, 180, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Dal Tadka', 340, 185);

    // Rotis
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(300, 295, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('2 Whole Wheat Roti', 230, 300);

    // Title header
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Indian High-Protein Fitness Thali', 145, 45);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px sans-serif';
    ctx.fillText('Paneer Bhurji • Dal Tadka • Roti • Sprouts (42g Protein)', 135, 70);
  } else if (type === 'deadlift') {
    // Platform
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(50, 340, 500, 10);

    // Barbell
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(70, 280, 460, 10);

    // Red Olympic Plates
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(100, 210, 28, 150);
    ctx.fillRect(470, 210, 28, 150);

    // Lifter Stick Figure
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#60a5fa';
    // Head
    ctx.beginPath();
    ctx.arc(300, 130, 22, 0, Math.PI * 2);
    ctx.fill();
    // Spine
    ctx.beginPath();
    ctx.moveTo(300, 152);
    ctx.lineTo(265, 235);
    ctx.lineTo(335, 300);
    ctx.lineTo(335, 340);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(280, 190);
    ctx.lineTo(295, 285);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Barbell Deadlift Biomechanics Setup', 135, 45);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px sans-serif';
    ctx.fillText('Neutral Lumbar Spine • Hip Hinge • Bar over Mid-Foot', 125, 70);
  } else {
    // Whey Tub
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(220, 130, 160, 220);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.strokeRect(220, 130, 160, 220);

    // Lid
    ctx.fillStyle = '#312e81';
    ctx.fillRect(240, 95, 120, 35);

    // Text on tub
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('WHEY', 265, 190);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('ISOLATE 1KG', 242, 225);
    ctx.fillText('27g PROTEIN', 244, 255);
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '13px sans-serif';
    ctx.fillText('100% Genuine Seal', 246, 285);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Whey Protein Isolate Authentication', 135, 45);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px sans-serif';
    ctx.fillText('Official Batch Verification & Nutrition Facts Check', 140, 70);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
};

const SAMPLE_PRESETS = [
  {
    id: 'sample-meal',
    type: 'meal' as const,
    presetType: 'meal' as const,
    name: 'Indian High-Protein Thali',
    desc: 'Paneer bhurji, yellow dal tadka, 2 rotis & salad (42g protein)',
  },
  {
    id: 'sample-deadlift',
    type: 'workout_form' as const,
    presetType: 'deadlift' as const,
    name: 'Barbell Deadlift Setup',
    desc: 'Hip hinge, neutral lumbar spine & barbell over mid-foot',
  },
  {
    id: 'sample-whey',
    type: 'meal' as const,
    presetType: 'whey' as const,
    name: 'Authentic Whey Isolate Tub',
    desc: 'Verifiable seal check & nutrition facts label inspection',
  },
];

export const GeminiImageAnalyzerModal: React.FC = () => {
  const { isAiImageAnalyzerOpen, setIsAiImageAnalyzerOpen, aiAnalyzerPreset } = useGym();

  const [analysisType, setAnalysisType] = useState<'meal' | 'workout_form'>(aiAnalyzerPreset || 'meal');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAiImageAnalyzerOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    const dataUrl = createSampleCanvasImage(preset.presetType);
    setSelectedImage(dataUrl);
    setAnalysisType(preset.type);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMsg('Please select or upload a photo first.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          analysisType,
          prompt: customPrompt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to analyze image with Gemini');
      }

      setAnalysisResult(data.text);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with Gemini image analysis API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-zinc-950 px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 font-black shadow-md shadow-emerald-500/20">
              <Camera className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Gemini Image Understanding</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  gemini-3.1-pro-preview
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Visual analysis for Indian gym meals, workout postures &amp; supplement authenticity
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiImageAnalyzerOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Analysis Category Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Select Analysis Focus:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAnalysisType('meal')}
                className={`p-3 rounded-xl border flex items-center space-x-3 text-left transition ${
                  analysisType === 'meal'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    analysisType === 'meal' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Indian Meal &amp; Macro Breakdown</h4>
                  <p className="text-[11px] text-zinc-400">Protein, carbs, fats, calories &amp; desi substitutes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnalysisType('workout_form')}
                className={`p-3 rounded-xl border flex items-center space-x-3 text-left transition ${
                  analysisType === 'workout_form'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    analysisType === 'workout_form' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold">Workout Form &amp; Biomechanics</h4>
                  <p className="text-[11px] text-zinc-400">Spine neutrality, joint alignment &amp; injury precautions</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick presets for instant 1-click test */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Or Try A Quick Preset Demo Photo:
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2.5 rounded-lg border text-left flex items-center space-x-2.5 transition text-xs border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                >
                  <div className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center text-emerald-400">
                    {preset.presetType === 'meal' && <Utensils className="w-5 h-5" />}
                    {preset.presetType === 'deadlift' && <Activity className="w-5 h-5 text-amber-400" />}
                    {preset.presetType === 'whey' && <Sparkles className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{preset.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{preset.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload / Camera Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-950/40 hover:bg-zinc-950 transition text-center group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center mb-3 transition">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                Upload Member Photo
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Upload your meal thali, squat/deadlift setup, or gym equipment
              </p>
            </div>

            {/* Preview Box */}
            <div className="border border-zinc-800 rounded-2xl bg-zinc-950/80 p-3 flex flex-col items-center justify-center min-h-[160px]">
              {selectedImage ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img
                    src={selectedImage}
                    alt="Selected preview"
                    className="max-h-48 rounded-lg object-contain border border-zinc-700 shadow"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full text-xs shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-zinc-500 text-xs flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 mb-1.5 opacity-40" />
                  <span>No image selected yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Custom Instructions / Question */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Specific Question or Goal (Optional):
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Is this sufficient protein for post-workout? Or check if my lower back is rounding."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Analyze Button */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 text-xs sm:text-sm transition active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with gemini-3.1-pro-preview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Analyze with Gemini Pro Vision</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Analysis Report Card */}
          {analysisResult && (
            <div className="p-5 bg-gradient-to-b from-zinc-950 to-zinc-900 border border-emerald-500/40 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">Gemini 3.1 Pro Vision Analysis</h4>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
