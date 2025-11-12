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
  collection: 'Crypto Critters' | 'Pixel Presents' | 'TON Treasures' | 'Plush Pepe';
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

export const nftsData: Nft[] = [
    {
        id: 'plush-pepe-1',
        name: 'Plush Pepe 1',
        price: 0, // Not listed for sale initially
        rarity: 'Rare',
        collection: 'Plush Pepe',
        model: 'pumpkin',
        background: 'onyx black',
        symbol: 'illuminati',
        imageUrl: 'https://nft.fragment.com/gift/plushpepe-1.png',
        lottieUrl: 'https://nft.fragment.com/gift/plushpepe-1.tgs',
        imageHint: 'cartoon frog',
        isListed: false,
        ownerId: '', // Owner will be set by the context
    },
];

// Auction data is now managed in Firestore, so this can be empty.
export const auctionNfts: Nft[] = [];
