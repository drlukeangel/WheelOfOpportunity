export type User = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  icon?: string;
  color?: string;
  photoDataUrl?: string;
  createdAt: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
};

export type GroupMembership = {
  id: string;
  groupId: string;
  userId: string;
};

export type GameType = "slot" | "claw" | "race" | "cards" | "wheelEdge" | "plinkoWrong";
export type PickMode = "depleting" | "fullRandom";

export type GameRun = {
  id: string;
  groupId: string;
  gameType: GameType;
  mode: PickMode;
  selectedUserId: string;
  candidateUserIds: string[];
  timestamp: string;
};

export type DepletionPool = {
  key: string;
  remainingUserIds: string[];
};

export type AppData = {
  users: User[];
  groups: Group[];
  memberships: GroupMembership[];
  runs: GameRun[];
  depletionPools: DepletionPool[];
  settings: {
    soundEnabled: boolean;
    animationSpeed: number;
    theme: "dark" | "light";
  };
};
