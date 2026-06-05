import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Upload, FileText, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/documents`, {
        withCredentials: true,
      });
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post(`${API}/documents/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document uploaded successfully!');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`${API}/documents/${docId}`, {
        withCredentials: true,
      });
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-[#2D6A4F] text-white';
      case 'processing':
        return 'bg-[#D4A373] text-white';
      default:
        return 'bg-[#5C5C5C] text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="user-dashboard">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight leading-none text-[#1A1A1A] mb-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-base text-[#5C5C5C]">Manage your tax documents and track filing status</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-8 rounded-md border border-black/5 mb-8" data-testid="upload-section">
          <h2 className="text-2xl tracking-tight text-[#1A1A1A] mb-4">Upload Documents</h2>
          <div className="border-2 border-dashed border-[#123524]/20 rounded-md p-12 text-center hover:border-[#123524]/40 transition-colors">
            <Upload className="mx-auto mb-4 text-[#123524]" size={48} />
            <p className="text-base text-[#5C5C5C] mb-4">
              Upload your tax documents (PDF, Images, Excel, Word, CSV)
            </p>
            <Button
              className="bg-[#C86B53] text-white hover:bg-[#D87B63]"
              onClick={() => document.getElementById('file-upload').click()}
              disabled={uploading}
              data-testid="upload-button"
            >
              {uploading ? 'Uploading...' : 'Select File'}
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.docx,.doc,.csv"
              data-testid="file-input"
            />
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white p-8 rounded-md border border-black/5" data-testid="documents-section">
          <h2 className="text-2xl tracking-tight text-[#1A1A1A] mb-6">Your Documents</h2>

          {loading ? (
            <p className="text-center text-[#5C5C5C] py-8">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-center text-[#5C5C5C] py-8" data-testid="no-documents-message">
              No documents uploaded yet. Upload your first document above.
            </p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-black/5 rounded-md hover:shadow-sm transition-shadow"
                  data-testid={`document-${doc.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <FileText className="text-[#123524]" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-[#1A1A1A]">{doc.original_filename}</p>
                      <p className="text-sm text-[#5C5C5C]">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        doc.filing_status
                      )}`}
                      data-testid={`status-${doc.id}`}
                    >
                      {doc.filing_status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`${API}/documents/${doc.id}/download`, '_blank')}
                      className="border-[#123524] text-[#123524] hover:bg-[#123524] hover:text-white"
                      data-testid={`download-${doc.id}`}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="border-[#9B2226] text-[#9B2226] hover:bg-[#9B2226] hover:text-white"
                      data-testid={`delete-${doc.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};