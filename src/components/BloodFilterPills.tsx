import { useState, useCallback } from 'react';
import { BloodGroup, BLOOD_GROUPS } from '@/types/donor';
import { motion } from 'framer-motion';

interface BloodFilterPillsProps {
  selected: BloodGroup | null;
  onSelect: (group: BloodGroup | null) => void;
  donorCounts: Record<BloodGroup, number>;
}

const BloodFilterPills = ({ selected, onSelect, donorCounts }: BloodFilterPillsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => onSelect(null)}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
          selected === null
            ? 'bg-primary border-primary/50 text-primary-foreground'
            : 'glass-surface text-muted-foreground hover:text-foreground'
        }`}
      >
        All
      </motion.button>
      {BLOOD_GROUPS.map((group) => (
        <motion.button
          key={group}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(selected === group ? null : group)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all border ${
            selected === group
              ? 'bg-primary border-primary/50 text-primary-foreground'
              : 'glass-surface text-muted-foreground hover:text-foreground'
          }`}
        >
          {group}
          <span className="ml-1 opacity-60">{donorCounts[group] || 0}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default BloodFilterPills;
