import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const ProgressChart = ({ submissions }) => {
  // Generate last 7 days data
  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'MMM dd'),
      rawDate: startOfDay(d).getTime(),
      count: 0,
      score: 0
    };
  });

  if (submissions && submissions.length > 0) {
    submissions.forEach(sub => {
      // Only count verified
      if (sub.verification?.final_status === 'verified') {
        const subDate = startOfDay(new Date(sub.submitted_at)).getTime();
        const dayItem = data.find(d => d.rawDate === subDate);
        if (dayItem) {
          dayItem.count += 1;
          dayItem.score += sub.score;
        }
      }
    });
  }

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: '#F3F4F6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
          />
          <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={30} name="Verified Submissions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
