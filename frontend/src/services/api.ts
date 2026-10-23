import {
  AuthResponse,
  User,
  ApplicationCategory,
  ApplicationListItem,
  ApplicationDetail,
  DocumentItem,
  VerificationRun,
  ComplianceRule,
  NotificationItem,
  AuditEventItem,
  AdminMetrics,
  ReviewDecision
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '') : '') + '/api/v1';

function getAuthToken(): string | null {
  return localStorage.getItem('ai_verify_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default Content-Type to JSON if not uploading FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg || e.message).join(', ');
        }
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { email: string; password: string; full_name: string; organization?: string; role?: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  forgotPassword: (data: { email: string; new_password: string }) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Applications
  getCategories: () => request<ApplicationCategory[]>('/applications/categories'),

  listApplications: (params?: { status?: string; category_id?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.category_id) q.append('category_id', params.category_id);
    if (params?.search) q.append('search', params.search);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<ApplicationListItem[]>(`/applications/${queryString}`);
  },

  getApplication: (id: string) => request<ApplicationDetail>(`/applications/${id}`),

  createApplication: (data: { category_id: string; title: string; form_data: Record<string, any>; is_draft?: boolean }) =>
    request<ApplicationDetail>('/applications/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateApplication: (id: string, data: { title?: string; form_data?: Record<string, any> }) =>
    request<ApplicationDetail>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submitApplication: (id: string) =>
    request<ApplicationDetail>(`/applications/${id}/submit`, {
      method: 'POST',
    }),

  withdrawApplication: (id: string, reason?: string) => {
    const q = reason ? `?reason=${encodeURIComponent(reason)}` : '';
    return request<ApplicationDetail>(`/applications/${id}/withdraw${q}`, {
      method: 'POST',
    });
  },

  // Documents
  uploadDocument: (applicationId: string, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    return request<DocumentItem>(`/documents/${applicationId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteDocument: (documentId: string) =>
    request<{ message: string }>(`/documents/${documentId}`, {
      method: 'DELETE',
    }),

  retryDocument: (documentId: string) =>
    request<DocumentItem>(`/documents/${documentId}/retry`, {
      method: 'POST',
    }),

  getDocumentDownloadUrl: (documentId: string) => `${API_BASE}/documents/${documentId}/download`,

  // Verification
  runVerification: (applicationId: string) =>
    request<VerificationRun>(`/verification/${applicationId}/run`, {
      method: 'POST',
    }),

  getLatestVerification: (applicationId: string) =>
    request<VerificationRun>(`/verification/${applicationId}/latest`),

  // Compliance Rules
  listRules: () => request<ComplianceRule[]>('/compliance-rules/'),

  createRule: (rule: Partial<ComplianceRule>) =>
    request<ComplianceRule>('/compliance-rules/', {
      method: 'POST',
      body: JSON.stringify(rule),
    }),

  updateRule: (id: string, rule: Partial<ComplianceRule>) =>
    request<ComplianceRule>(`/compliance-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    }),

  toggleRule: (id: string) =>
    request<ComplianceRule>(`/compliance-rules/${id}/toggle`, {
      method: 'POST',
    }),

  // Reviews
  assignReviewer: (applicationId: string, reviewerId: string) =>
    request<{ message: string }>(`/reviews/${applicationId}/assign?reviewer_id=${reviewerId}`, {
      method: 'POST',
    }),

  recordDecision: (applicationId: string, data: { decision: string; reason: string; explanation: string }) =>
    request<ReviewDecision>(`/reviews/${applicationId}/decision`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  addNote: (applicationId: string, data: { note_text: string; is_internal: boolean }) =>
    request<any>(`/reviews/${applicationId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reports
  generateReport: (applicationId: string) =>
    request<any>(`/reports/${applicationId}/generate`, {
      method: 'POST',
    }),

  getReportDownloadUrl: (applicationId: string) => `${API_BASE}/reports/${applicationId}/download`,

  // Admin
  getMetrics: () => request<AdminMetrics>('/admin/metrics'),

  listUsers: (role?: string) => {
    const q = role ? `?role=${role}` : '';
    return request<User[]>(`/admin/users${q}`);
  },

  updateUserRole: (id: string, newRole: string) =>
    request<User>(`/admin/users/${id}/role?new_role=${newRole}`, {
      method: 'PUT',
    }),

  toggleUserStatus: (id: string) =>
    request<User>(`/admin/users/${id}/status`, {
      method: 'PUT',
    }),

  getAuditLogs: (params?: { action?: string; resource_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.action) q.append('action', params.action);
    if (params?.resource_type) q.append('resource_type', params.resource_type);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request<AuditEventItem[]>(`/admin/audit-logs${queryString}`);
  },

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications/'),

  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/read-all', {
      method: 'PUT',
    }),

  // Contact
  sendContactMessage: (data: { name: string; email: string; subject: string; organization?: string; message: string }) =>
    request<any>('/contact/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
