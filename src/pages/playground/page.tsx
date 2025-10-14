import React from 'react';
import CodePlayground from '../../components/CodePlayground';

export default function PlaygroundPage() {
  const handleBack = () => {
    // Navigate back to previous page or home
    window.history.back();
  };

  return (
    <div className="h-screen">
      <CodePlayground onBack={handleBack} />
    </div>
  );
}
