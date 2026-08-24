'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, History, AlertCircle, AlertTriangle, ArrowLeftRight, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { updateKnowledgeProfile, getProfileValidationResults, getProfileVersions, rollbackToProfileVersion } from '../actions';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandTone, BusinessModel, TonePreference, BusinessProfileInput } from '@/features/knowledge/types';

export function KnowledgeProfile({ initialData }: { initialData: BusinessProfileInput | null }) {
   const [isSaving, setIsSaving] = useState(false);
   const [activeTab, setActiveTab] = useState<'profile' | 'versions'>('profile');
   const [validation, setValidation] = useState<{ complete: boolean; missingFields: string[]; conflicts: string[] } | null>(null);
   const [versions, setVersions] = useState<any[]>([]);
   const [isLoadingVersions, setIsLoadingVersions] = useState(false);
   const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      core: true,
      dna: true,
      audience: false,
      style: false,
   });

   const [formData, setFormData] = useState({
      mission: initialData?.mission || '',
      vision: initialData?.vision || '',
      uvp: initialData?.uvp || '',
      targetAudience: initialData?.targetAudience || '',
      tone: initialData?.tone || '',
      industry: initialData?.industry || '',
      forbiddenWords: Array.isArray(initialData?.forbiddenWords)
         ? initialData.forbiddenWords.join(', ')
         : initialData?.forbiddenWords || '',
      brandTone: initialData?.brandTone || BrandTone.PROFESSIONAL,
      usp: initialData?.usp || '',
      colorPalette: initialData?.colorPalette || [],
      watermark: initialData?.watermark || '',

      // Extended Fields
      tagline: initialData?.tagline || '',
      slogan: initialData?.slogan || '',
      coreValues: Array.isArray(initialData?.coreValues)
         ? initialData.coreValues.join(', ')
         : '',
      uniqueValueProposition: initialData?.uniqueValueProposition || '',
      businessModel: initialData?.businessModel || BusinessModel.B2B,
      geographicMarkets: Array.isArray(initialData?.geographicMarkets)
         ? initialData.geographicMarkets.join(', ')
         : '',
      targetAudienceDetails: typeof initialData?.targetAudienceDetails === 'object'
         ? JSON.stringify(initialData.targetAudienceDetails, null, 2)
         : initialData?.targetAudienceDetails || '',
      productsServices: typeof initialData?.productsServices === 'object'
         ? JSON.stringify(initialData.productsServices, null, 2)
         : initialData?.productsServices || '',
      keyBenefits: Array.isArray(initialData?.keyBenefits)
         ? initialData.keyBenefits.join(', ')
         : '',
      competitiveAdvantages: Array.isArray(initialData?.competitiveAdvantages)
         ? initialData.competitiveAdvantages.join(', ')
         : '',
      tonePreferences: Array.isArray(initialData?.tonePreferences)
         ? initialData.tonePreferences
         : [] as TonePreference[]
   });

   const toggleSection = (section: string) => {
      setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
   };

   const loadValidation = async () => {
      try {
         const res = await getProfileValidationResults();
         setValidation(res);
      } catch (e) {
         console.error("Failed to load brand validation metrics", e);
      }
   };

   const loadVersions = async () => {
      try {
         setIsLoadingVersions(true);
         const res = await getProfileVersions();
         setVersions(res);
      } catch (e) {
         toast.error("Failed to load audit versions history");
      } finally {
         setIsLoadingVersions(false);
      }
   };

   useEffect(() => {
      loadValidation();
      loadVersions();
   }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      try {
         let parsedProducts = formData.productsServices;
         try {
            if (formData.productsServices.trim()) {
               parsedProducts = JSON.parse(formData.productsServices);
            }
         } catch (e) {
            // Keep as string if not valid JSON
         }

         let parsedAudience = formData.targetAudienceDetails;
         try {
            if (formData.targetAudienceDetails.trim()) {
               parsedAudience = JSON.parse(formData.targetAudienceDetails);
            }
         } catch (e) {
            // Keep as string if not valid JSON
         }

         await updateKnowledgeProfile({
            mission: formData.mission,
            vision: formData.vision,
            uvp: formData.uvp,
            targetAudience: formData.targetAudience,
            tone: formData.tone,
            industry: formData.industry,
            forbiddenWords: formData.forbiddenWords.split(',').map((s: string) => s.trim()).filter(Boolean),
            brandTone: formData.brandTone as BrandTone,
            usp: formData.usp,
            colorPalette: formData.colorPalette.filter(Boolean),
            watermark: formData.watermark,

            // Extended properties
            tagline: formData.tagline,
            slogan: formData.slogan,
            coreValues: formData.coreValues.split(',').map((s: string) => s.trim()).filter(Boolean),
            uniqueValueProposition: formData.uniqueValueProposition,
            businessModel: formData.businessModel as BusinessModel,
            geographicMarkets: formData.geographicMarkets.split(',').map((s: string) => s.trim()).filter(Boolean),
            targetAudienceDetails: parsedAudience,
            productsServices: parsedProducts,
            keyBenefits: formData.keyBenefits.split(',').map((s: string) => s.trim()).filter(Boolean),
            competitiveAdvantages: formData.competitiveAdvantages.split(',').map((s: string) => s.trim()).filter(Boolean),
            tonePreferences: formData.tonePreferences
         });

         toast.success('Brand DNA profile successfully updated & version logged!');
         await loadValidation();
         await loadVersions();
      } catch (error: any) {
         toast.error(error.message || 'Failed to update brand profile');
      } finally {
         setIsSaving(false);
      }
   };

   const handleRollback = async (versionNum: number) => {
      if (!confirm(`Are you absolutely sure you want to revert all fields back to Version #${versionNum}?`)) {
         return;
      }
      try {
         setIsLoadingVersions(true);
         await rollbackToProfileVersion(versionNum);
         toast.success(`Successfully rolled back to Version #${versionNum}! Reloading profile details...`);
         
         // Trigger complete browser reload of data or refresh states
         window.location.reload();
      } catch (e: any) {
         toast.error(e.message || 'Failed to rollback version');
      } finally {
         setIsLoadingVersions(false);
      }
   };

   const handleTonePreferenceToggle = (tone: TonePreference) => {
      setFormData(prev => {
         const current = [...prev.tonePreferences];
         const index = current.indexOf(tone);
         if (index > -1) {
            current.splice(index, 1);
         } else {
            current.push(tone);
         }
         return { ...prev, tonePreferences: current };
      });
   };

   const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white transition-all";
   const labelClasses = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2";

   const brandTones = [
      { value: BrandTone.PROFESSIONAL, label: 'Professional', desc: 'Formal, authoritative, trustworthy' },
      { value: BrandTone.FRIENDLY, label: 'Friendly', desc: 'Warm, approachable, conversational' },
      { value: BrandTone.CREATIVE, label: 'Creative', desc: 'Innovative, artistic, imaginative' },
      { value: BrandTone.TECHNICAL, label: 'Technical', desc: 'Precise, detailed, expert' },
      { value: BrandTone.LUXURY, label: 'Luxury', desc: 'Premium, sophisticated, exclusive' },
      { value: BrandTone.CASUAL, label: 'Casual', desc: 'Relaxed, informal, authentic' }
   ];

   const tonePreferencesOptions = Object.values(TonePreference);
   const businessModelOptions = Object.values(BusinessModel);

   return (
      <div className="space-y-6">
         {/* Validation checklist header banner */}
         {validation && (
            <div className={`p-5 rounded-3xl border transition-all ${
               validation.complete && validation.conflicts.length === 0
                  ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                  : 'bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30'
            }`}>
               <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-2xl ${
                     validation.complete && validation.conflicts.length === 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                     {validation.complete && validation.conflicts.length === 0 ? (
                        <CheckCircle2 className="h-6 w-6" />
                     ) : (
                        <AlertTriangle className="h-6 w-6" />
                     )}
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Brand DNA Auditor Checklist
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                           validation.complete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                           {validation.complete ? 'Complete Profile' : 'Incomplete Profile'}
                        </span>
                      </h4>
                      {validation.missingFields.length > 0 && (
                         <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            Missing elements: <span className="font-semibold text-amber-700 dark:text-amber-400">{validation.missingFields.join(', ')}</span>. Fill these in below to unlock complete AI context mapping.
                         </p>
                      )}
                      {validation.conflicts.map((conflict, i) => (
                         <div key={i} className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-400 mt-2 bg-amber-100/40 dark:bg-amber-950/20 p-2.5 rounded-xl">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{conflict}</span>
                         </div>
                      ))}
                      {validation.complete && validation.conflicts.length === 0 && (
                         <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Your brand profile matches all compliance checkers. Perfect style instructions will be dispatched to the LLM.
                         </p>
                      )}
                  </div>
               </div>
            </div>
         )}

         {/* Navigation Tab Header */}
         <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
               onClick={() => setActiveTab('profile')}
               className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                  activeTab === 'profile'
                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                     : 'border-transparent text-slate-500 hover:text-slate-700'
               }`}
            >
               Brand DNA Profile
            </button>
            <button
               onClick={() => setActiveTab('versions')}
               className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'versions'
                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                     : 'border-transparent text-slate-500 hover:text-slate-700'
               }`}
            >
               <History className="h-4 w-4" /> Version History Logs
            </button>
         </div>

         <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
               <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
               >
                  <form onSubmit={handleSubmit} className="space-y-6">
                     
                     {/* Section 1: Core Identity */}
                     <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden">
                        <button
                           type="button"
                           onClick={() => toggleSection('core')}
                           className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 text-left font-black text-slate-900 dark:text-white"
                        >
                           <span className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              1. Core Identity Properties
                           </span>
                           {expandedSections.core ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        <AnimatePresence>
                           {expandedSections.core && (
                              <motion.div
                                 initial={{ height: 0 }}
                                 animate={{ height: 'auto' }}
                                 exit={{ height: 0 }}
                                 className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-transparent"
                              >
                                 <div>
                                    <label className={labelClasses}>Tagline</label>
                                    <input
                                       className={inputClasses}
                                       placeholder="e.g. Automate your brand narrative with elite AI"
                                       value={formData.tagline}
                                       onChange={e => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                                    />
                                 </div>
                                 <div>
                                    <label className={labelClasses}>Slogan</label>
                                    <input
                                       className={inputClasses}
                                       placeholder="e.g. Elevate Brand DNA"
                                       value={formData.slogan}
                                       onChange={e => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                                    />
                                 </div>
                                 <div>
                                    <label className={labelClasses}>Industry / Category</label>
                                    <input
                                       className={inputClasses}
                                       placeholder="e.g. Fintech, SaaS, Healthcare"
                                       value={formData.industry}
                                       onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                    />
                                 </div>
                                 <div>
                                    <label className={labelClasses}>Business Model</label>
                                    <select
                                       className={inputClasses}
                                       value={formData.businessModel}
                                       onChange={e => setFormData(prev => ({ ...prev, businessModel: e.target.value as BusinessModel }))}
                                    >
                                       {businessModelOptions.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                       ))}
                                    </select>
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Section 2: Strategy & Brand DNA */}
                     <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden">
                        <button
                           type="button"
                           onClick={() => toggleSection('dna')}
                           className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 text-left font-black text-slate-900 dark:text-white"
                        >
                           <span className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-purple-500" />
                              2. Strategy & DNA Blueprint
                           </span>
                           {expandedSections.dna ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        <AnimatePresence>
                           {expandedSections.dna && (
                              <motion.div
                                 initial={{ height: 0 }}
                                 animate={{ height: 'auto' }}
                                 exit={{ height: 0 }}
                                 className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-transparent"
                              >
                                 <div className="md:col-span-2">
                                    <label className={labelClasses}>Unique Value Proposition (UVP)</label>
                                    <textarea
                                       className={inputClasses}
                                       rows={3}
                                       placeholder="Explain what exactly sets you apart..."
                                       value={formData.uniqueValueProposition}
                                       onChange={e => setFormData(prev => ({ ...prev, uniqueValueProposition: e.target.value }))}
                                    />
                                 </div>
                                 <div>
                                    <label className={labelClasses}>Mission Statement</label>
                                    <textarea
                                       className={inputClasses}
                                       rows={3}
                                       placeholder="Your core purpose..."
                                       value={formData.mission}
                                       onChange={e => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                                    />
                                 </div>
                                 <div>
                                    <label className={labelClasses}>Vision Statement</label>
                                    <textarea
                                       className={inputClasses}
                                       rows={3}
                                       placeholder="Your long-term aspirations..."
                                       value={formData.vision}
                                       onChange={e => setFormData(prev => ({ ...prev, vision: e.target.value }))}
                                    />
                                 </div>
                                 <div className="md:col-span-2">
                                    <label className={labelClasses}>Core Values (comma separated)</label>
                                    <input
                                       className={inputClasses}
                                       placeholder="e.g. Innovation, Transparency, Client Success"
                                       value={formData.coreValues}
                                       onChange={e => setFormData(prev => ({ ...prev, coreValues: e.target.value }))}
                                    />
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Section 3: Audience & Offerings */}
                     <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden">
                        <button
                           type="button"
                           onClick={() => toggleSection('audience')}
                           className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 text-left font-black text-slate-900 dark:text-white"
                        >
                           <span className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-emerald-500" />
                              3. Audience Segmentations & Offerings
                           </span>
                           {expandedSections.audience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        <AnimatePresence>
                           {expandedSections.audience && (
                              <motion.div
                                 initial={{ height: 0 }}
                                 animate={{ height: 'auto' }}
                                 exit={{ height: 0 }}
                                 className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-transparent"
                              >
                                 <div>
                                    <label className={labelClasses}>Target Audience (General Overview)</label>
                                    <textarea
                                       className={inputClasses}
                                       rows={3}
                                       placeholder="e.g. High networth digital product managers aged 30-50"
                                       value={formData.targetAudience}
                                       onChange={e => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                                    />
                                 </div>
                                 <div>
                                    <label className={labelClasses}>Geographic Markets (comma separated)</label>
                                    <textarea
                                       className={inputClasses}
                                       rows={3}
                                       placeholder="e.g. North America, European Union, APAC"
                                       value={formData.geographicMarkets}
                                       onChange={e => setFormData(prev => ({ ...prev, geographicMarkets: e.target.value }))}
                                    />
                                 </div>

                                 <div>
                                    <label className={labelClasses}>Products & Services (JSON List or Description)</label>
                                    <textarea
                                       className={`${inputClasses} font-mono text-xs`}
                                       rows={5}
                                       placeholder='[\n  { "name": "Basic SaaS Module", "price": 49 },\n  { "name": "Elite Automation Plan", "price": 199 }\n]'
                                       value={formData.productsServices}
                                       onChange={e => setFormData(prev => ({ ...prev, productsServices: e.target.value }))}
                                    />
                                 </div>

                                 <div>
                                    <label className={labelClasses}>Target Audience Details (JSON Details)</label>
                                    <textarea
                                       className={`${inputClasses} font-mono text-xs`}
                                       rows={5}
                                       placeholder='{\n  "demographics": "Millennial SaaS Founders",\n  "challenges": ["lead generation", "high churn"]\n}'
                                       value={formData.targetAudienceDetails}
                                       onChange={e => setFormData(prev => ({ ...prev, targetAudienceDetails: e.target.value }))}
                                    />
                                 </div>

                                 <div>
                                    <label className={labelClasses}>Key Benefits (comma separated)</label>
                                    <input
                                       className={inputClasses}
                                       placeholder="e.g. 10x content throughput, Zero-hallucination accuracy"
                                       value={formData.keyBenefits}
                                       onChange={e => setFormData(prev => ({ ...prev, keyBenefits: e.target.value }))}
                                    />
                                 </div>

                                 <div>
                                    <label className={labelClasses}>Competitive Advantages (comma separated)</label>
                                    <input
                                       className={inputClasses}
                                       placeholder="e.g. Built-in vector RAG, Custom branding guards"
                                       value={formData.competitiveAdvantages}
                                       onChange={e => setFormData(prev => ({ ...prev, competitiveAdvantages: e.target.value }))}
                                    />
                                 </div>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Section 4: Style, Tone & Rules compliance */}
                     <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden">
                        <button
                           type="button"
                           onClick={() => toggleSection('style')}
                           className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 text-left font-black text-slate-900 dark:text-white"
                        >
                           <span className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-pink-500" />
                              4. Style Guidelines, Compliance & Tone preferences
                           </span>
                           {expandedSections.style ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>

                        <AnimatePresence>
                           {expandedSections.style && (
                              <motion.div
                                 initial={{ height: 0 }}
                                 animate={{ height: 'auto' }}
                                 exit={{ height: 0 }}
                                 className="p-5 md:p-6 space-y-6 bg-white dark:bg-transparent"
                              >
                                 {/* Brand Tone Button Grid */}
                                 <div>
                                    <label className={labelClasses}>Primary AI Tone Profile</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                       {brandTones?.map((tone) => (
                                          <button
                                             key={tone.value}
                                             type="button"
                                             onClick={() => setFormData(prev => ({ ...prev, brandTone: tone.value }))}
                                             className={`p-3 rounded-xl border-2 text-left transition-all ${formData.brandTone === tone.value
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                                : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'}`}
                                          >
                                             <div className="font-bold text-sm text-slate-900 dark:text-white">{tone.label}</div>
                                             <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">{tone.desc}</div>
                                          </button>
                                       ))}
                                    </div>
                                 </div>

                                 {/* Multi-select checklist of TonePreferences */}
                                 <div>
                                    <label className={labelClasses}>Supporting Style Preferences (Select multiple)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                       {tonePreferencesOptions.map((toneOpt) => {
                                          const isActive = formData.tonePreferences.includes(toneOpt);
                                          return (
                                             <button
                                                key={toneOpt}
                                                type="button"
                                                onClick={() => handleTonePreferenceToggle(toneOpt)}
                                                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                                                   isActive 
                                                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                                }`}
                                             >
                                                {toneOpt}
                                             </button>
                                          );
                                       })}
                                    </div>
                                 </div>

                                 {/* General description box and formatting */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                       <label className={labelClasses}>Custom Tone of Voice Context</label>
                                       <textarea
                                          className={inputClasses}
                                          rows={3}
                                          placeholder="e.g. Empathetic but analytical, avoids sales pitches..."
                                          value={formData.tone}
                                          onChange={e => setFormData(prev => ({ ...prev, tone: e.target.value }))}
                                       />
                                    </div>
                                    <div>
                                       <label className={labelClasses}>Forbidden Terms / Negative Guards</label>
                                       <textarea
                                          className={inputClasses}
                                          rows={3}
                                          placeholder="e.g. cheap, guarantee, best, low-price"
                                          value={formData.forbiddenWords}
                                          onChange={e => setFormData(prev => ({ ...prev, forbiddenWords: e.target.value }))}
                                       />
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                       <label className={labelClasses}>Watermark / Social Tag Signature</label>
                                       <input
                                          className={inputClasses}
                                          placeholder="e.g. @yourbrand or Powered by Antigravity"
                                          value={formData.watermark}
                                          onChange={e => setFormData(prev => ({ ...prev, watermark: e.target.value }))}
                                       />
                                    </div>
                                    <div>
                                       <label className={labelClasses}>Brand Color Palette</label>
                                       <div className="flex flex-wrap gap-2">
                                          {Array.from({ length: 6 }).map((_, i) => (
                                             <input
                                                key={i}
                                                type="color"
                                                value={formData.colorPalette[i] || '#3B82F6'}
                                                onChange={(e) => {
                                                   const newPalette = [...formData.colorPalette];
                                                   newPalette[i] = e.target.value;
                                                   setFormData(prev => ({ ...prev, colorPalette: newPalette }));
                                                }}
                                                className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-800 cursor-pointer"
                                             />
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
                        <button
                           type="submit"
                           disabled={isSaving}
                           className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
                        >
                           {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                           {isSaving ? 'Saving Profile...' : 'Save Brand DNA Profile'}
                        </button>
                     </div>
                  </form>
               </motion.div>
            ) : (
               /* Version History timeline logs */
               <motion.div
                  key="versions-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
               >
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-500" />
                        Audit Trail Version History Logs
                     </h3>
                     <button
                        onClick={loadVersions}
                        disabled={isLoadingVersions}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                     >
                        Refresh Logs
                     </button>
                  </div>

                  {isLoadingVersions ? (
                     <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                     </div>
                  ) : versions.length === 0 ? (
                     <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <History className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 dark:text-slate-300">No profile versions logged yet</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                           Any changes you save to your Brand DNA profile will automatically log a version checkpoint here for auditing and rollback capabilities.
                        </p>
                     </div>
                  ) : (
                     <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-8">
                        {versions.map((ver) => {
                           const changedDate = new Date(ver.changedAt);
                           const changes = ver.changes as Record<string, { from: any; to: any }>;
                           const rolledBack = ver.reason.includes('Rolled back');

                           return (
                              <div key={ver.id} className="relative">
                                 {/* timeline circular indicator */}
                                 <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                                    rolledBack 
                                       ? 'bg-amber-500 border-amber-200 dark:border-amber-950'
                                       : 'bg-blue-600 border-blue-100 dark:border-blue-900'
                                 }`}></span>

                                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                                    <div>
                                       <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                          Version #{ver.versionNumber}
                                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                             rolledBack ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                          }`}>
                                             {ver.reason}
                                          </span>
                                       </h4>
                                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                          Saved at {changedDate.toLocaleString()} by User {ver.changedBy.substring(0, 8)}
                                       </p>

                                       {/* Render keys changed list */}
                                       <div className="mt-3 flex flex-wrap gap-1.5">
                                          {Object.keys(changes).map((key) => (
                                             <span key={key} className="text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                                                {key}
                                             </span>
                                          ))}
                                       </div>
                                    </div>

                                    <div>
                                       <button
                                          onClick={() => handleRollback(ver.versionNumber)}
                                          disabled={isLoadingVersions}
                                          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-black text-slate-900 dark:text-white rounded-xl shadow-sm disabled:opacity-50 transition-all"
                                       >
                                           {isLoadingVersions ? (
                                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                           ) : (
                                              <ArrowLeftRight className="h-3.5 w-3.5" />
                                           )}
                                           {isLoadingVersions ? 'Reverting...' : `Revert to Version #${ver.versionNumber}`}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}
