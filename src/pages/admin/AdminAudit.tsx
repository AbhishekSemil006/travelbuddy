import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminAudit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Audit Logs</h1>
      <p>Audit logs will appear here.</p>
    </div>
  );
};
export default AdminAudit;
