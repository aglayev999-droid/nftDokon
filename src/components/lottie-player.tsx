
'use client';

import Lottie, { useLottie } from 'lottie-react';
import { Skeleton } from './ui/skeleton';

interface LottiePlayerProps {
  src: string;
}

export function LottiePlayer({ src }: LottiePlayerProps) {
  const { View, animationData } = useLottie({
    animationData: null, // Initially null
    loop: true,
    autoplay: true,
    path: src, // Load animation from URL
  }, {
    height: '100%',
    width: '100%',
  });

  if (!animationData) {
    return <Skeleton className="aspect-square w-full rounded-none" />;
  }

  return (
    <div className="aspect-square w-full">
      {View}
    </div>
  );
}
