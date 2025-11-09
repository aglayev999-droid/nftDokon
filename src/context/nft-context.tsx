
'use client';

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { Nft, nftsData } from '@/lib/data';

interface NftContextType {
  nfts: Nft[];
  setNfts: Dispatch<SetStateAction<Nft[]>>;
}

const NftContext = createContext<NftContextType | undefined>(undefined);

export const NftProvider = ({ children }: { children: ReactNode }) => {
  const [nfts, setNfts] = useState<Nft[]>(nftsData);

  return (
    <NftContext.Provider value={{ nfts, setNfts }}>
      {children}
    </NftContext.Provider>
  );
};

export const useNft = () => {
  const context = useContext(NftContext);
  if (context === undefined) {
    throw new Error('useNft must be used within a NftProvider');
  }
  return context;
};
