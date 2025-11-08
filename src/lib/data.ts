
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

export const nfts: Nft[] = [];

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
