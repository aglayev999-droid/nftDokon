
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
  highestBid?: number;
  endTime?: number;
}

export interface Achievement {
  name: string;
  icon: React.ComponentType<any>;
  unlocked: boolean;
}

export interface User {
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
    id: 'ice-cream-1',
    name: 'Ice Cream 1',
    price: 35000,
    rarity: 'Common',
    collection: 'Pixel Presents',
    model: 'Common',
    background: 'Neon',
    imageUrl: 'https://nft.fragment.com/gift/icecream-1.medium.jpg',
    imageHint: 'ice cream',
    isListed: true,
  },
  {
    id: 'ice-cream-2',
    name: 'Ice Cream 2',
    price: 0,
    rarity: 'Rare',
    collection: 'Pixel Presents',
    model: 'Rare',
    background: 'Space',
    imageUrl: 'https://nft.fragment.com/gift/icecream-2.medium.jpg',
    imageHint: 'ice cream cone',
    isListed: false,
  },
  {
    id: 'ice-cream-3',
    name: 'Ice Cream 3',
    price: 150000,
    rarity: 'Epic',
    collection: 'Pixel Presents',
    model: 'Epic',
    background: 'Holographic',
    imageUrl: 'https://nft.fragment.com/gift/icecream-3.medium.jpg',
    imageHint: 'ice cream sundae',
    isListed: true,
  },
    {
    id: 'gift-1',
    name: 'Gift 1',
    price: 25000,
    rarity: 'Common',
    collection: 'Pixel Presents',
    model: 'Common',
    background: 'Neon',
    imageUrl: 'https://nft.fragment.com/gift/gift-1.medium.jpg',
    imageHint: 'gift box',
    isListed: true,
  },
  {
    id: 'gift-2',
    name: 'Gift 2',
    price: 0,
    rarity: 'Rare',
    collection: 'Pixel Presents',
    model: 'Rare',
    background: 'Space',
    imageUrl: 'https://nft.fragment.com/gift/gift-2.medium.jpg',
    imageHint: 'glowing gift',
    isListed: false,
  },
  {
    id: 'gift-3',
    name: 'Gift 3',
    price: 175000,
    rarity: 'Epic',
    collection: 'Pixel Presents',
    model: 'Epic',
    background: 'Holographic',
    imageUrl: 'https://nft.fragment.com/gift/gift-3.medium.jpg',
    imageHint: 'crystal gift',
    isListed: true,
  },
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
    isListed: true,
  }
];

export const auctionNfts: Nft[] = [
    {
        id: 'auction-1',
        name: 'B-Day Candle',
        price: 0,
        highestBid: 11,
        endTime: Date.now() + 1000 * 60 * 2.35, // ~2m 21s
        rarity: 'Rare',
        collection: 'Pixel Presents',
        model: 'Rare',
        background: 'Neon',
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/app-interact-dev-001.appspot.com/o/studio%2Fuser%2Fz5t3o1n349%2F301f251d-c8b5-4b02-8a9d-5bdc1b52a5a0.webp?alt=media&token=366cfc7a-9a00-4b05-b02f-b47590881b24",
        imageHint: 'birthday candle',
        isListed: true,
    },
    {
        id: 'auction-2',
        name: 'Hex Pot',
        price: 0,
        highestBid: 2.62,
        endTime: Date.now() + 1000 * 60 * 2.35, // ~2m 21s
        rarity: 'Epic',
        collection: 'Crypto Critters',
        model: 'Epic',
        background: 'Space',
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/app-interact-dev-001.appspot.com/o/studio%2Fuser%2Fz5t3o1n349%2F719ac51c-6d6f-442a-9e12-c2081d25d19a.webp?alt=media&token=8544c770-5b65-4f4c-b472-a1f0f15d2a98",
        imageHint: 'magic cauldron',
        isListed: true,
    },
    {
        id: 'auction-3',
        name: 'Mousse Cake',
        price: 0,
        highestBid: 17,
        endTime: Date.now() + 1000 * 60 * 2.55, // ~2m 33s
        rarity: 'Common',
        collection: 'TON Treasures',
        model: 'Common',
        background: 'Holographic',
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/app-interact-dev-001.appspot.com/o/studio%2Fuser%2Fz5t3o1n349%2F205f013d-5b32-47ed-b36d-9993322a36b3.webp?alt=media&token=c1aa5610-d88e-4a6c-bc05-b44c01740924",
        imageHint: 'dessert cake',
        isListed: true,
    },
    {
        id: 'auction-4',
        name: 'Instant Ramen',
        price: 0,
        highestBid: 1.57,
        endTime: Date.now() + 1000 * 60 * 2.91, // ~2m 55s
        rarity: 'Legendary',
        collection: 'Pixel Presents',
        model: 'Epic',
        background: 'Neon',
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/app-interact-dev-001.appspot.com/o/studio%2Fuser%2Fz5t3o1n349%2F16a3f124-768a-49f8-8aa0-9c29806443c2.webp?alt=media&token=d1ed16f7-b7d1-447a-8b9a-7c989104085b",
        imageHint: 'noodle bowl',
        isListed: true,
    }
];

export const user: User = {
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
