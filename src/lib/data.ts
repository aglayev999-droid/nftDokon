
import { PlaceHolderImages } from './placeholder-images';

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
  endTime?: number;
  startTime?: number;
  startingPrice?: number;
}

export interface Achievement {
  name: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  avatarHint: string;
  volume: number;
  bought: number;
  sold: number;
  cashbackBonus: number;
  seasonAchievements: { name: string; value: string; progress: number }[];
  giveaways: number;
  portalsLevel: number;
  referrals: number;
  friendsVolume: number;
}

const getImage = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return {
    url: image?.imageUrl || 'https://picsum.photos/seed/error/600/600',
    hint: image?.imageHint || 'error',
  };
};

export const nftsData: Nft[] = [
  {
    id: 'moon-pendant-2075',
    name: 'Moon Pendant',
    price: 250000,
    rarity: 'Legendary',
    collection: 'TON Treasures',
    model: 'Epic',
    background: 'Space',
    imageUrl: 'https://nft.fragment.com/gift/MoonPendant-2075.jpg',
    lottieUrl: 'https://nft.fragment.com/gift/MoonPendant-2075.lottie.json',
    imageHint: 'moon pendant',
    isListed: true,
    ownerId: 'user-3' // Not the current user
  },
  {
    id: 'fresh-socks-91000',
    name: 'Fresh Socks',
    price: 91000,
    rarity: 'Epic',
    collection: 'TON Treasures',
    model: 'Epic',
    background: 'Neon',
    imageUrl: 'https://nft.fragment.com/gift/FreshSocks-91000.jpg',
    lottieUrl: 'https://nft.fragment.com/gift/FreshSocks-91000.lottie.json',
    imageHint: 'fresh socks',
    isListed: false, // Start as unlisted so we can auction it
    ownerId: 'user-1' // Belongs to our test user
  }
];

// Auction data is now managed in Firestore, so this can be empty.
export const auctionNfts: Nft[] = [];

export const user: User = {
  id: 'user-1',
  username: 'Foydalanuvchi',
  name: 'R/B',
  avatarUrl: getImage('userAvatar').url,
  avatarHint: getImage('userAvatar').hint,
  volume: 0,
  bought: 0,
  sold: 0,
  cashbackBonus: 0,
  seasonAchievements: [],
  giveaways: 0,
  portalsLevel: 0,
  referrals: 0,
  friendsVolume: 0,
};
