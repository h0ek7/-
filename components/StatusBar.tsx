
import React from 'react';
import { Heart, Utensils, Droplets, Brain } from 'lucide-react';

interface StatusBarProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const Bar: React.FC<StatusBarProps> = ({ value, color, icon }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className={`${color} p-1 rounded`}>{icon}</div>
    <div className="flex-1 bg-gray-800 h-4 rounded-full overflow-hidden border border-gray-700">
      <div 
        className={`${color} h-full transition-all duration-500`} 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
    <span className="text-xs font-mono w-8">{Math.ceil(value)}%</span>
  </div>
);

export const StatusBarGroup: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="bg-black/60 p-4 pixel-border rounded-lg">
    <Bar label="生命" value={stats.health} color="bg-red-600" icon={<Heart size={14} color="white" />} />
    <Bar label="饱食" value={stats.hunger} color="bg-orange-500" icon={<Utensils size={14} color="white" />} />
    <Bar label="口渴" value={stats.thirst} color="bg-blue-500" icon={<Droplets size={14} color="white" />} />
    <Bar label="精神" value={stats.sanity} color="bg-purple-500" icon={<Brain size={14} color="white" />} />
  </div>
);
