
'use client';

import Lottie from 'lottie-react';
import { Skeleton } from './ui/skeleton';

interface LottiePlayerProps {
  src: string;
}

export function LottiePlayer({ src }: LottiePlayerProps) {
  return (
    <div className="aspect-square w-full">
      <Lottie
        animationData={src}
        loop={true}
        className="h-full w-full"
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
    </div>
  );
}
