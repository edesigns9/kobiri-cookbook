import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

const BackButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate(-1)}
      title="Go back"
      variant="ghost"
      className={`pl-2 ${className}`}
    >
      <ArrowLeft className="w-5 h-5 mr-2" />
      <span>Back</span>
    </Button>
  );
};

export default BackButton;