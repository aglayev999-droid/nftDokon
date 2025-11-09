'use client';

import Lottie from 'lottie-react';
import { Skeleton } from './ui/skeleton';

interface LottiePlayerProps {
  src: string;
}

export function LottiePlayer({ src }: LottiePlayerProps) {
  return (
    <Lottie
      path={src}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
      // Show skeleton while loading
      onDataReady={() => {}} 
    />
  );
}
