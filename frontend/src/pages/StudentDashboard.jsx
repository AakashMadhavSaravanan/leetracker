import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2, BookOpen, Target, CheckCircle, Clock, Award } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axiosConfig';
import ProblemCard from '../components/ProblemCard';
import ProgressChart from '../components/ProgressChart';
import SubmissionForm from '../components/SubmissionForm';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [notesCount, setNotesCount] = useState(0);
  const [activeProblem, setActiveProblem] = useState(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [probRes, subRes, noteRes] = await Promise.all([
        api.get('/problems'),
        api.get('/submissions/mine'),
        api.get('/notes')
      ]);

      setProblems(probRes.data);
      setSubmissions(subRes.data);
      setNotesCount(noteRes.data.length);
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

  // Derived stats
  const totalAssigned = problems.length;
  const verifiedSubs = submissions.filter(s => s.verification?.final_status === 'verified');
  const totalSolved = verifiedSubs.length;
  const pendingSubs = submissions.filter(s => s.verification?.final_status === 'pending');
  const totalPending = pendingSubs.length;
  const totalScore = verifiedSubs.reduce((acc, curr) => acc + curr.score, 0);

  // Match problems with submissions for the table
  const getProblemStatus = (problemId) => {
    const probSubs = submissions.filter(s => s.problem_id._id === problemId || s.problem_id === problemId);
    if (!probSubs.length) return 'unsolved';
    if (probSubs.some(s => s.verification?.final_status === 'verified')) return 'verified';
    if (probSubs.some(s => s.verification?.final_status === 'pending')) return 'pending';
    return 'rejected';
  };

  const getProblemScore = (problemId) => {
    const probSubs = submissions.filter(s => (s.problem_id._id === problemId || s.problem_id === problemId) && s.verification?.final_status === 'verified');
    if (probSubs.length > 0) {
      // return the highest score if multiple
      return Math.max(...probSubs.map(s => s.score));
    }
    return undefined;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name}!</h1>
          <p className="text-gray-300 text-sm">Keep up the great work and maintain your streak.</p>
        </div>
        <div className="flex space-x-4">
          <div className="text-center px-4 border-r border-gray-700">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Score</p>
            <p className="text-3xl font-bold text-yellow-400">{totalScore.toFixed(0)}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Streak</p>
            <p className="text-3xl font-bold flex items-center justify-center text-orange-500">
              🔥 <span className="ml-1 text-white">{0}</span> {/* Streak requires fetching user object, simplified here */}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Problems', value: totalAssigned, icon: <Target size={20}/>, color: 'text-purple-600 bg-purple-100' },
          { label: 'Solved (Verified)', value: totalSolved, icon: <CheckCircle size={20}/>, color: 'text-green-600 bg-green-100' },
          { label: 'Pending Review', value: totalPending, icon: <Clock size={20}/>, color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Assigned Notes', value: notesCount, icon: <BookOpen size={20}/>, color: 'text-blue-600 bg-blue-100' }
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Assigned Problems</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problems.length === 0 ? (
                <p className="text-gray-500 italic text-sm p-4 col-span-2">No problems assigned yet.</p>
              ) : (
                problems.map(p => (
                  <ProblemCard 
                    key={p._id} 
                    problem={p} 
                    role="student" 
                    status={getProblemStatus(p._id)}
                    submissionScore={getProblemScore(p._id)}
                    onSubmit={setActiveProblem}
                  />
                ))
              )}
            </div>
          </div>
          
          {/* Submission History Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Recent Submissions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Problem</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.slice(0, 5).map(sub => (
                    <tr key={sub._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {sub.problem_id?.title || 'Unknown problem'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize w-fit
                            ${sub.verification?.final_status === 'verified' ? 'bg-green-100 text-green-700' : 
                              sub.verification?.final_status === 'rejected' ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'}`}>
                            {sub.verification?.final_status}
                          </span>
                          {sub.verification?.final_status === 'rejected' && (
                            <div className="flex gap-1 mt-1">
                              {!sub.verification.token_valid && <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded border border-red-100">Token</span>}
                              {!sub.verification.ocr_passed && <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded border border-red-100">OCR</span>}
                              {sub.verification.similarity_score < 0.3 && <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded border border-red-100">Similarity</span>}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {sub.score > 0 ? `+${sub.score.toFixed(1)}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(sub.submitted_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                     <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 italic">No submissions yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Weekly Activity</h3>
            <p className="text-xs text-gray-500 mb-6">Verified submissions over the last 7 days</p>
            <ProgressChart submissions={submissions} />
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-sm text-white relative overflow-hidden">
            <div className="relative z-10 w-2/3">
              <h3 className="font-bold text-lg mb-2">Learning Materials</h3>
              <p className="text-sm text-blue-100 mb-4">
                You have {notesCount} notes to read. Review the materials to improve your problem-solving skills!
              </p>
              <Link to="/student/notes" className="inline-flex items-center px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                Go to Notes <BookOpen size={16} className="ml-2" />
              </Link>
            </div>
            <Award size={100} className="absolute -right-6 -bottom-6 text-white opacity-10" />
          </div>
        </div>
      </div>

      {activeProblem && (
        <SubmissionForm 
          problem={activeProblem} 
          onClose={() => setActiveProblem(null)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
};

export default StudentDashboard;
