export type CoreErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export type CoreTokenResponse = {
  token: string;
  expiresIn: string;
};

export type CoreAwardXpInput = {
  userId: string;
  application: string;
  activityType: string;
  xpGained: number;
  pointsGained?: number;
  sourceRefId?: string;
  idempotencyKey: string;
};

export type CoreAwardXpResponse = {
  idempotent: boolean;
  log: {
    id: string;
    userId: string;
    xpGained: number;
    pointsGained: number;
    idempotencyKey: string;
    createdAt: string;
  };
  user: {
    totalXp: number;
    currentPoints: number;
    currentLevel: number;
  };
};

export type CoreHealthResponse = {
  status: string;
  service: string;
  timestamp: string;
};

export type CorePublicUser = {
  id: string;
  name: string;
  imageUrl: string | null;
  totalXp: number;
  currentPoints: number;
  currentLevel: number;
  levelTitle: string | null;
};

export type CoreLeaderboardResponse = {
  items: Array<CorePublicUser & { rank: number }>;
  total: number;
  limit: number;
  offset: number;
};

export type CoreUserProfile = CorePublicUser & {
  email: string;
  roles: string[];
  clerkSyncedAt: string | null;
  createdAt: string;
};
