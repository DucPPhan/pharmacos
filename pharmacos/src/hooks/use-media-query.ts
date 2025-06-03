import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state with the current value
    const updateMatches = () => {
      setMatches(media.matches);
    };
    
    // Initial check
    updateMatches();
    
    // Listen for changes
    media.addEventListener("change", updateMatches);
    
    // Cleanup
    return () => {
      media.removeEventListener("change", updateMatches);
    };
  }, [query]);
  
  return matches;
}