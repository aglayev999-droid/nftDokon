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

export const nfts: Nft[] = [
  {
    id: '1',
    name: 'Crystalline Fox',
    price: 150,
    rarity: 'Epic',
    collection: 'Crypto Critters',
    model: 'Rare',
    background: 'Holographic',
    imageUrl: getImage('nft1').url,
    imageHint: getImage('nft1').hint,
    isListed: true,
  },
  {
    id: '2',
    name: 'Pixel Giftbox',
    price: 25,
    rarity: 'Common',
    collection: 'Pixel Presents',
    model: 'Common',
    background: 'Neon',
    imageUrl: getImage('nft2').url,
    imageHint: getImage('nft2').hint,
    isListed: true,
  },
  {
    id: '3',
    name: 'HoloTON Token',
    price: 500,
    rarity: 'Legendary',
    collection: 'TON Treasures',
    model: 'Epic',
    background: 'Holographic',
    imageUrl: getImage('nft3').url,
    imageHint: getImage('nft3').hint,
    isListed: true,
  },
  {
    id: '4',
    name: 'Cyber Kitty',
    price: 80,
    rarity: 'Rare',
    collection: 'Crypto Critters',
    model: 'Rare',
    background: 'Neon',
    imageUrl: getImage('nft4').url,
    imageHint: getImage('nft4').hint,
    isListed: true,
  },
  {
    id: '5',
    name: 'Glowing Sword',
    price: 120,
    rarity: 'Epic',
    collection: 'TON Treasures',
    model: 'Epic',
    background: 'Space',
    imageUrl: getImage('nft5').url,
    imageHint: getImage('nft5').hint,
    isListed: false,
  },
  {
    id: '6',
    name: 'Space Boombox',
    price: 45,
    rarity: 'Common',
    collection: 'Pixel Presents',
    model: 'Common',
    background: 'Space',
    imageUrl: getImage('nft6').url,
    imageHint: getImage('nft6').hint,
    isListed: true,
  },
    {
    id: '7',
    name: 'Digital Whale',
    price: 220,
    rarity: 'Rare',
    collection: 'Crypto Critters',
    model: 'Rare',
    background: 'Holographic',
    imageUrl: getImage('nft7').url,
    imageHint: getImage('nft7').hint,
    isListed: true,
  },
  {
    id: '8',
    name: 'Sky Island',
    price: 75,
    rarity: 'Common',
    collection: 'TON Treasures',
    model: 'Common',
    background: 'Space',
    imageUrl: getImage('nft8').url,
    imageHint: getImage('nft8').hint,
    isListed: false,
  },
  {
    id: '9',
    name: 'Mecha Bee',
    price: 310,
    rarity: 'Epic',
    collection: 'Crypto Critters',
    model: 'Epic',
    background: 'Neon',
    imageUrl: getImage('nft9').url,
    imageHint: getImage('nft9').hint,
    isListed: true,
  },
];

export const user: User = {
  username: 'Azico_uzb',
  avatarUrl: getImage('userAvatar').url,
  avatarHint: getImage('userAvatar').hint,
  volume: 12540,
  bought: 88,
  sold: 42,
  cashbackBonus: 15,
  seasonAchievements: [
    { name: 'TON APR', value: '4/8', progress: 50 },
    { name: 'TON Summer', value: '1/8', progress: 12.5 },
  ],
  giveaways: 3,
  portalsLevel: 7,
  referrals: 12,
  friendsVolume: 2345,
};
