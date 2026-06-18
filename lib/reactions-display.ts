import type { ReactionType } from "@prisma/client";

export const REACTION_ICON_SRC = {
  LOVE: "/assets/images/icons/love.webp",
  LOL: "/assets/images/icons/lol.webp",
  CUTE: "/assets/images/icons/cute.webp",
  WIN: "/assets/images/icons/win.webp",
  WTF: "/assets/images/icons/wtf.webp",
  OMG: "/assets/images/icons/omg.webp",
  GEEKY: "/assets/images/icons/geeky.webp",
  SCARY: "/assets/images/icons/scary.webp",
  FAIL: "/assets/images/icons/fail.webp",
} as const;

export const CONTENT_REACTIONS = [
  { key: "LOVE" as const, emoji: "❤️", label: "Love", iconSrc: REACTION_ICON_SRC.LOVE },
  { key: "LOL" as const, emoji: "😂", label: "Lol", iconSrc: REACTION_ICON_SRC.LOL },
  { key: "CUTE" as const, emoji: "🥰", label: "Cute", iconSrc: REACTION_ICON_SRC.CUTE },
  { key: "WIN" as const, emoji: "😎", label: "Win", iconSrc: REACTION_ICON_SRC.WIN },
  { key: "WTF" as const, emoji: "🤨", label: "WTF", iconSrc: REACTION_ICON_SRC.WTF },
  { key: "OMG" as const, emoji: "😮", label: "OMG", iconSrc: REACTION_ICON_SRC.OMG },
  { key: "GEEKY" as const, emoji: "🤓", label: "Geeky", iconSrc: REACTION_ICON_SRC.GEEKY },
  { key: "SCARY" as const, emoji: "😱", label: "Scary", iconSrc: REACTION_ICON_SRC.SCARY },
  { key: "FAIL" as const, emoji: "😖", label: "Fail", iconSrc: REACTION_ICON_SRC.FAIL },
] as const;

export type ContentReactionKey = (typeof CONTENT_REACTIONS)[number]["key"];

export function getReactionDisplay(type: string) {
  return (
    CONTENT_REACTIONS.find((r) => r.key === type) ?? {
      key: "LOVE" as ReactionType,
      emoji: "❤️",
      label: "Love",
      iconSrc: REACTION_ICON_SRC.LOVE,
    }
  );
}
