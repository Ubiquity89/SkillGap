import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Skill } from '../types';

interface SkillTagProps {
  skill: Skill;
  onRemove?: (skill: Skill) => void;
  showExperience?: boolean;
  variant?: 'default' | 'matched' | 'missing' | 'extra';
}

const SkillTag: React.FC<SkillTagProps> = ({ 
  skill, 
  onRemove, 
  showExperience = false,
  variant = 'default' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'matched':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'missing':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'extra':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getVariantClasses()}`}>
      <span>{skill.name}</span>
      {showExperience && skill.yearsOfExperience && (
        <span className="ml-2 text-xs opacity-75">
          ({skill.yearsOfExperience} years)
        </span>
      )}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="ml-2 hover:opacity-70"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default SkillTag;
