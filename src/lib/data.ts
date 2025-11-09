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

export const nfts: Nft[] = [
  {
    id: 'ice-cream-1',
    name: 'Ice Cream 1',
    price: 15,
    rarity: 'Common',
    collection: 'Pixel Presents',
    model: 'Common',
    background: 'Neon',
    imageUrl: 'https://nft.fragment.com/gift/icecream-1.medium.jpg',
    imageHint: 'ice cream',
    isListed: true,
  },
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
