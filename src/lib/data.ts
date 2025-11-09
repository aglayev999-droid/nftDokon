import { PlaceHolderImages } from './placeholder-images';

export interface UserAccount {
  id: string;
  telegramId: string;
  username: string;
  balance: number;
}

export interface Nft {
  id: string;
  name: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  collection: 'Crypto Critters' | 'Pixel Presents' | 'TON Treasures';
  model: 'Common' | 'Rare' | 'Epic';
  background: 'Space' | 'Neon' | 'Holographic';
  imageUrl: string;
  lottieUrl?: string;
  imageHint: string;
  isListed: boolean;
  ownerId?: string; // kim egalik qilishi
  
  // Auction fields
  highestBid?: number;
  highestBidderId?: string; // ID of the user with the highest bid
  endTime?: number;
  startTime?: number;
  startingPrice?: number;
}

export const nftsData: Nft[] = [];

// Auction data is now managed in Firestore, so this can be empty.
export const auctionNfts: Nft[] = [];
