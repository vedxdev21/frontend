'use client';

import React from 'react';

export default function GlassCard({ 
  children, 
  className = '', 
  hoverable = true,
  onClick,
  ...props 
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${hoverable ? 'hover:border-orange-200 hover:shadow-[0_24px_52px_-24px_rgba(249,115,22,0.5)] transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
