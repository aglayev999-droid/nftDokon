'use client';

import Lottie from 'lottie-react';
import { Skeleton } from './ui/skeleton';

interface LottiePlayerProps {
  src: string;
}

export function LottiePlayer({ src }: LottiePlayerProps) {
  return (
    <Lottie
      path={src} // Use `path` for URLs
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
