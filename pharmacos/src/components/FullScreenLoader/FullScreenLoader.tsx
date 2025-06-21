import React from 'react';
import { Loader2 } from 'lucide-react';

const FullScreenLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading Page...</p>
            </div>
        </div>
    );
};

export default FullScreenLoader;