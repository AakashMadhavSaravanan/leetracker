import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Users, FileCode, CheckCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';
import Leaderboard from '../components/Leaderboard';

const TrainerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0, problems: 0, verified: 0, pending: 0, notes: 0
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // We can fetch data in parallel
      const [lbRes, probRes, subRes, noteRes] = await Promise.all([
        api.get('/leaderboard'),
        api.get('/problems'),
        api.get('/submissions/all'),
        api.get('/notes')
      ]);

      const subs = subRes.data;
      const verified = subs.filter(s => s.verification.final_status === 'verified').length;
      const pending = subs.filter(s => s.verification.final_status === 'pending').length;

      setStats({
        students: lbRes.data.length,
        problems: probRes.data.length,
        verified,
        pending,
        notes: noteRes.data.length
      });

      setLeaderboard(lbRes.data);
      setProblems(probRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
         <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // Calculate difficulty breakdown
  const diffStatus = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach(p => {
    if (diffStatus[p.difficulty] !== undefined) diffStatus[p.difficulty]++;
  });
  const pieData = [
    { name: 'Easy', value: diffStatus.Easy, color: '#10B981' }, // Green
    { name: 'Medium', value: diffStatus.Medium, color: '#F59E0B' }, // Yellow
    { name: 'Hard', value: diffStatus.Hard, color: '#EF4444' } // Red
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
        <button onClick={fetchDashboardData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Students', value: stats.students, icon: <Users size={20}/>, color: 'text-blue-600 bg-blue-100' },
          { label: 'Problems', value: stats.problems, icon: <FileCode size={20}/>, color: 'text-purple-600 bg-purple-100' },
          { label: 'Verified Subs', value: stats.verified, icon: <CheckCircle size={20}/>, color: 'text-green-600 bg-green-100' },
          { label: 'Pending', value: stats.pending, icon: <Clock size={20}/>, color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Notes Uploaded', value: stats.notes, icon: <Users size={20}/>, color: 'text-indigo-600 bg-indigo-100' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          <Leaderboard data={leaderboard} />
        </div>

        {/* Right Column: Charts */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Problem Difficulty Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-1 text-sm">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-gray-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
