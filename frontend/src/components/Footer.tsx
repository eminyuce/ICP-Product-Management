import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-card shadow-classic">
            <div className="mx-auto w-[85%] flex h-20 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    © 2025. Built with{' '}
                    <Heart className="inline h-4 w-4 fill-destructive text-destructive" />{' '}
                    using{' '}
                    <a
                        href="https://caffeine.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary hover:text-accent transition-colors underline"
                    >
                        caffeine.ai
                    </a>
                </p>
            </div>
        </footer>
    );
}
