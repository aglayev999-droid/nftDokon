
import { Gift } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

const TwitterIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">
              NFT kerak
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NFT kerak. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Twitter">
                <TwitterIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="#" aria-label="Telegram">
                <TelegramIcon className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
