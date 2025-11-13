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

export const nftsData: Nft[] = [
    {
        id: 'fresh-socks-1111',
        name: 'Fresh Socks 1111',
        price: 0,
        rarity: 'Rare',
        collection: 'Fresh Socks',
        model: 'Rare',
        background: 'Holographic',
        imageUrl: '', // Rasm yo'q
        lottieUrl: 'https://nft.fragment.com/gift/freshsocks-1111.json',
        imageHint: 'animated socks',
        isListed: false,
        ownerId: '',
    },
    {
        id: 'plush-pepe-222',
        name: 'Plush Pepe 222',
        price: 0,
        rarity: 'Epic',
        collection: 'Plush Pepe',
        model: 'pumpkin',
        background: 'onyx black',
        symbol: 'illuminati',
        imageUrl: '', // Rasm yo'q
        lottieUrl: 'https://nft.fragment.com/gift/plushpepe-222.json',
        imageHint: 'cartoon frog',
        isListed: false,
        ownerId: '',
    },
    {
        id: 'plush-pepe-777',
        name: 'Plush Pepe 777',
        price: 0,
        rarity: 'Legendary',
        collection: 'Plush Pepe',
        model: 'pumpkin',
        background: 'Rainbow',
        symbol: 'illuminati',
        imageUrl: '', // Rasm yo'q
        lottieUrl: 'https://nft.fragment.com/gift/plushpepe-777.json',
        imageHint: 'cartoon frog',
        isListed: false,
        ownerId: '',
    },
];

// Auction data is now managed in Firestore, so this can be empty.
export const auctionNfts: Nft[] = [];
