import React from 'react';

const Leaderboard = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 p-4text-center bg-white rounded-xl shadow-sm border border-gray-100 italic">No leaderboard data available</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 pb-4 flex justify-between items-center">
        <h3 className="font-semibold-md text-gray-800 font-bold">Leaderboard</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
            <tr>
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Score</th>
              <th className="px-6 py-3">Solved</th>
              <th className="px-6 py-3">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium">
                  {student.rank === 1 ? '🥇 ' : student.rank === 2 ? '🥈 ' : student.rank === 3 ? '🥉 ' : ''}
                  <span className={student.rank <= 3 ? 'font-bold' : ''}>#{student.rank}</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 font-bold text-blue-600">{student.score.toFixed(1)}</td>
                <td className="px-6 py-4">{student.solved}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center space-x-1">
                    <span className="text-orange-500">🔥</span>
                    <span>{student.streak}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
