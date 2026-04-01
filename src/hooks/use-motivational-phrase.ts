import { useEffect, useState } from "react";

import { motivationalPhrases } from "@/data/motivational-phrases";

function getCurrentPhrase(): string {
  const hourIndex = Math.floor(Date.now() / (60 * 60 * 1000));
  return motivationalPhrases[hourIndex % motivationalPhrases.length];
}

export function useMotivationalPhrase(): string {
  const [phrase, setPhrase] = useState(getCurrentPhrase);

  useEffect(() => {
    const msUntilNextHour = 60 * 60 * 1000 - (Date.now() % (60 * 60 * 1000));
    const timeout = window.setTimeout(() => {
      setPhrase(getCurrentPhrase());
      const interval = window.setInterval(() => setPhrase(getCurrentPhrase()), 60 * 60 * 1000);
      return () => window.clearInterval(interval);
    }, msUntilNextHour);

    return () => window.clearTimeout(timeout);
  }, []);

  return phrase;
}
