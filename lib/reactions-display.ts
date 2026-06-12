import type { ReactionType } from "@prisma/client";

export const CONTENT_REACTIONS = [
  { key: "LOVE" as const, emoji: "❤️", label: "Love" },
  { key: "LOL" as const, emoji: "😂", label: "Lol" },
  { key: "CUTE" as const, emoji: "🥰", label: "Cute" },
  { key: "WIN" as const, emoji: "😎", label: "Win" },
  { key: "WTF" as const, emoji: "🤨", label: "WTF" },
  { key: "OMG" as const, emoji: "😮", label: "OMG" },
  { key: "GEEKY" as const, emoji: "🤓", label: "Geeky" },
  { key: "SCARY" as const, emoji: "😱", label: "Scary" },
  { key: "FAIL" as const, emoji: "😖", label: "Fail" },
] as const;

export type ContentReactionKey = (typeof CONTENT_REACTIONS)[number]["key"];

export function getReactionDisplay(type: string) {
  return (
    CONTENT_REACTIONS.find((r) => r.key === type) ?? {
      key: "LOVE" as ReactionType,
      emoji: "❤️",
      label: "Love",
    }
  );
}
