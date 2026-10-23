import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  AlertCircle,
  Save,
  Send,
  Trash2,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { ApplicationCategory, DocumentItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';

export const ApplicationWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<ApplicationCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({
    applicant_name: user?.full_name || '',
  });
  const [uploadedDocs, setUploadedDocs] = useState<DocumentItem[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRefNo, setCreatedRefNo] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      } catch (err: any) {
        error('Failed to load application categories.');
      }
    }
    loadCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Auto-fill applicant name from auth context
  useEffect(() => {
    if (user && !formData.applicant_name) {
      setFormData((prev) => ({ ...prev, applicant_name: user.full_name }));
    }
  }, [user]);

  const handleCreateOrSaveDraft = async () => {
    if (!title.trim()) {
      error('Please enter an application title.');
      return null;
    }
    try {
      if (!applicationId) {
        const newApp = await api.createApplication({
          category_id: selectedCategoryId,
          title: title.trim(),
          form_data: formData,
          is_draft: true,
        });
        setApplicationId(newApp.id);
        success('Draft application saved.');
        return newApp.id;
      } else {
        await api.updateApplication(applicationId, {
          title: title.trim(),
          form_data: formData,
        });
        success('Draft updated successfully.');
        return applicationId;
      }
    } catch (err: any) {
      error(err.message || 'Failed to save draft.');
      return null;
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (!selectedCategoryId) {
        warning('Please select a category.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || !formData.applicant_name?.trim()) {
        warning('Please provide the application title and applicant full name.');
        return;
      }
      const appId = await handleCreateOrSaveDraft();
      if (appId) setStep(3);
    } else if (step === 3) {
      // Validate dynamic fields
      const fields = selectedCategory?.form_schema?.fields || [];
      for (const f of fields) {
        if (f.required && (formData[f.key] === undefined || formData[f.key] === '')) {
          warning(`Please complete required field: ${f.label}`);
          return;
        }
      }
      await handleCreateOrSaveDraft();
      setStep(4);
    } else if (step === 4) {
      // Check required documents
      const reqDocs = selectedCategory?.required_documents || [];
      const uploadedTypes = new Set(uploadedDocs.map((d) => d.document_type));
      const missing = reqDocs.filter((r) => r.required && !uploadedTypes.has(r.type));

      if (missing.length > 0) {
        warning(`Please upload mandatory document: ${missing[0].name}`);
        return;
      }
      setStep(5);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    if (!applicationId) {
      const appId = await handleCreateOrSaveDraft();
      if (!appId) return;
    }

    setUploadingDocType(docType);
    try {
      const doc = await api.uploadDocument(applicationId!, docType, file);
      setUploadedDocs((prev) => [...prev.filter((d) => d.document_type !== docType), doc]);
      success(`Uploaded ${file.name} successfully.`);
    } catch (err: any) {
      error(err.message || 'Upload failed. Ensure file is a valid PDF, PNG, or JPEG under 15MB.');
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleDeleteUploadedDoc = async (docId: string) => {
    try {
      await api.deleteDocument(docId);
      setUploadedDocs((prev) => prev.filter((d) => d.id !== docId));
      success('Document removed.');
    } catch (err: any) {
      error(err.message || 'Failed to remove document.');
    }
  };

  const handleFinalSubmit = async () => {
    if (!applicationId) return;
    setIsSubmitting(true);
    try {
      const submittedApp = await api.submitApplication(applicationId);
      setCreatedRefNo(submittedApp.reference_no);
      setStep(6);
      success('Application successfully submitted for verification!');
    } catch (err: any) {
      error(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels = ['Category', 'Applicant', 'Details', 'Documents', 'Review', 'Confirmed'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum || (step === 6 && stepNum === 6);
            const isCurrent = step === stepNum;
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-1 hidden sm:block ${
                      isCurrent ? 'text-indigo-600 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step > stepNum ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Application Category</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Choose the appropriate verification category. Each tier defines required documents and compliance check logic.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      if (!title) setTitle(cat.name);
                    }}
                    className={`p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                        {cat.code}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{cat.description}</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                      <strong>Mandatory Documents:</strong> {cat.required_documents.map((d) => d.name).join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="primary" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Continue to Applicant Info
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Applicant Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Primary Applicant Information</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Provide identifying information for the primary applicant or authorized representative.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2026 Academic Fellowship Request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicant Legal Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full name as printed on supporting government ID"
                value={formData.applicant_name || ''}
                onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Identification Serial (Passport / ID Number)
              </label>
              <input
                type="text"
                placeholder="e.g. P-9842103"
                value={formData.document_number || ''}
                onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Cross-checked during OCR verification against your uploaded identification document.
              </span>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateOrSaveDraft} leftIcon={<Save className="w-4 h-4" />}>
                Save Draft
              </Button>
              <Button variant="primary" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
                Proceed to Details
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Application Specific Details */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: {selectedCategory?.name} Details</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Fill in the category-specific attributes required for algorithmic compliance evaluation.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(selectedCategory?.form_schema?.fields || []).map((f) => {
              if (f.key === 'applicant_name') return null; // already captured
              return (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    step={f.type === 'number' ? 'any' : undefined}
                    required={f.required}
                    value={formData[f.key] ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [f.key]: f.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(2)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateOrSaveDraft} leftIcon={<Save className="w-4 h-4" />}>
                Save Draft
              </Button>
              <Button variant="primary" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
                Proceed to Document Upload
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Secure Document Upload */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Upload Supporting Documents</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Upload authenticated PDF, PNG, or JPEG files. Files are cryptographically fingerprinted (SHA-256) and verified with magic-byte checks.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {(selectedCategory?.required_documents || []).map((reqDoc) => {
              const uploaded = uploadedDocs.find((d) => d.document_type === reqDoc.type);
              const isUploading = uploadingDocType === reqDoc.type;

              return (
                <div key={reqDoc.type} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {reqDoc.name}
                        {reqDoc.required && (
                          <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Required
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">Type: {reqDoc.type}</span>
                    </div>

                    {uploaded ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Pending Upload
                      </span>
                    )}
                  </div>

                  {uploaded ? (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">{uploaded.original_filename}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            SHA-256: {uploaded.sha256_hash?.substring(0, 16)}... | {(uploaded.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteUploadedDoc(uploaded.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-700">
                          {isUploading ? 'Uploading & inspecting signature...' : 'Select PDF, PNG, or JPEG file (max 15MB)'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                          disabled={isUploading}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(reqDoc.type, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(3)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" onClick={handleNextStep} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Review Submission
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Review All Information */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Review Application Dossier</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Verify all entered data and attached records before initiating automated verification and reviewer routing.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Category & Title</h4>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{selectedCategory?.name} ({selectedCategory?.code})</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">Declared Field Values</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(formData).map(([k, v]) => (
                  <div key={k} className="p-2 bg-white rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-medium capitalize">{k.replace('_', ' ')}</span>
                    <span className="font-semibold text-slate-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Attached Documents ({uploadedDocs.length})
              </h4>
              <div className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <div key={doc.id} className="p-2.5 bg-white rounded border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-slate-800">{doc.original_filename}</span>
                      <span className="text-[11px] text-slate-500">({doc.document_type})</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">SHA-256 verified</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Automated Verification Notice:</span> Upon submission, our AI pipeline will extract document text, cross-verify field consistency, and evaluate compliance rules. The preliminary dossier will then queue for authorized human reviewer sign-off.
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(4)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
              Back to Documents
            </Button>
            <Button
              variant="primary"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 6: Confirmation Screen */}
      {step === 6 && (
        <Card className="text-center py-10">
          <CardContent className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Application Submitted Successfully</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Your application has been received and processed through preliminary automated verification checks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Unique Application Reference
              </span>
              <span className="font-mono text-xl font-bold text-indigo-700 tracking-wider">
                {createdRefNo}
              </span>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/applicant')}
              >
                Return to Dashboard
              </Button>
              {applicationId && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/applicant/applications/${applicationId}`)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  View Verification Status
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
