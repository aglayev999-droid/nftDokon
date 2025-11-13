import { PlaceHolderImages } from './placeholder-images';

export interface UserAccount {
  id: string;
  telegramId: string;
  username: string;
  fullName: string;
  balance: number;
}

export interface Nft {
  id: string;
  name: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  collection: 'Crypto Critters' | 'Pixel Presents' | 'TON Treasures' | 'Plush Pepe' | 'Fresh Socks';
  model: 'Common' | 'Rare' | 'Epic' | 'pumpkin'; // Updated model
  background: 'Space' | 'Neon' | 'Holographic' | 'Rainbow' | 'onyx black'; // Updated background
  symbol?: 'illuminati' | string; // New field for symbol
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

export interface WithdrawalRequest {
    userId: string;
    telegramUsername: string;
    nftId: string;
    nftName: string;
    status: 'completed' | 'pending';
    requestedAt: any; // Firestore Timestamp
    completedAt: any; // Firestore Timestamp
}


// This is now empty. NFTs are only added via the deposit flow.
export const nftsData: Nft[] = [];

// Auction data is now managed in Firestore, so this can be empty.
export const auctionNfts: Nft[] = [];
