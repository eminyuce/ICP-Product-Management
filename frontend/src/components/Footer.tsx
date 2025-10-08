import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto w-[85%] flex h-16 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    © 2025. Built with{' '}
                    <Heart className="inline h-4 w-4 fill-destructive text-destructive" />{' '}
                    using{' '}
                    <a
                        href="https://caffeine.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:underline"
                    >
                        caffeine.ai
                    </a>
                </p>
            </div>
        </footer>
    );
}
