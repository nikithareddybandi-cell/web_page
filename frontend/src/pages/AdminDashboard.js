import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, FileText, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, docsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/documents`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setDocuments(docsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const regularUsers = useMemo(
    () => users.filter((u) => u.role === 'user'),
    [users]
  );

  const handleStatusUpdate = async (docId, newStatus) => {
    try {
      await axios.patch(
        `${API}/admin/documents/${docId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7]">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <p className="text-[#5C5C5C]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]" data-testid="admin-dashboard">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight leading-none text-[#1A1A1A] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-base text-[#5C5C5C]">Manage users and documents</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12" data-testid="stats-grid">
          <Card className="p-6 border-black/5">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-[#123524]" size={32} />
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]" data-testid="total-users">
              {stats?.total_users || 0}
            </p>
            <p className="text-sm text-[#5C5C5C]">Total Users</p>
          </Card>

          <Card className="p-6 border-black/5">
            <div className="flex items-center justify-between mb-4">
              <FileText className="text-[#123524]" size={32} />
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]" data-testid="total-documents">
              {stats?.total_documents || 0}
            </p>
            <p className="text-sm text-[#5C5C5C]">Total Documents</p>
          </Card>

          <Card className="p-6 border-black/5">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-[#D4A373]" size={32} />
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]" data-testid="pending-documents">
              {stats?.pending_documents || 0}
            </p>
            <p className="text-sm text-[#5C5C5C]">Pending</p>
          </Card>

          <Card className="p-6 border-black/5">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="text-[#2D6A4F]" size={32} />
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]" data-testid="completed-documents">
              {stats?.completed_documents || 0}
            </p>
            <p className="text-sm text-[#5C5C5C]">Completed</p>
          </Card>
        </div>

        {/* Documents Management */}
        <div className="bg-white p-8 rounded-md border border-black/5 mb-8" data-testid="documents-section">
          <h2 className="text-2xl tracking-tight text-[#1A1A1A] mb-6">All Documents</h2>

          {documents.length === 0 ? (
            <p className="text-center text-[#5C5C5C] py-8">No documents available</p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => {
                const docUser = usersById.get(doc.user_id);
                return (
                  <div
                    key={doc.id}
                    className="grid md:grid-cols-12 gap-4 items-center p-4 border border-black/5 rounded-md"
                    data-testid={`admin-document-${doc.id}`}
                  >
                    <div className="md:col-span-4">
                      <p className="font-medium text-[#1A1A1A]">{doc.original_filename}</p>
                      <p className="text-sm text-[#5C5C5C]">User: {docUser?.name || 'Unknown'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-sm text-[#5C5C5C]">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <Select
                        value={doc.filing_status}
                        onValueChange={(value) => handleStatusUpdate(doc.id, value)}
                      >
                        <SelectTrigger className="w-full" data-testid={`status-select-${doc.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`${API}/documents/${doc.id}/download`, '_blank')
                        }
                        className="w-full border-[#123524] text-[#123524] hover:bg-[#123524] hover:text-white"
                        data-testid={`admin-download-${doc.id}`}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Users Management */}
        <div className="bg-white p-8 rounded-md border border-black/5" data-testid="users-section">
          <h2 className="text-2xl tracking-tight text-[#1A1A1A] mb-6">All Users</h2>

          <div className="space-y-4">
            {regularUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 border border-black/5 rounded-md"
                  data-testid={`user-${u.id}`}
                >
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{u.name}</p>
                    <p className="text-sm text-[#5C5C5C]">{u.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#5C5C5C]">
                      Joined: {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};