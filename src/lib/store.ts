import { useEffect, useMemo, useState } from "react";
import { localStorageAdapter } from "./storage";
import { nowIso, uid } from "./utils";
import type {
  AppData,
  GameRun,
  GameType,
  Group,
  GroupMembership,
  PickMode,
  User
} from "../types";

const DATA_KEY = "strategy-picker-arcade:v1";

const defaultData: AppData = {
  users: [],
  groups: [],
  memberships: [],
  runs: [],
  depletionPools: [],
  settings: { soundEnabled: false, animationSpeed: 1, theme: "dark" }
};

export const useAppStore = () => {
  const [data, setData] = useState<AppData>(() => localStorageAdapter.get<AppData>(DATA_KEY) ?? defaultData);

  useEffect(() => {
    localStorageAdapter.set(DATA_KEY, data);
  }, [data]);

  const api = useMemo(
    () => ({
      addUser: (input: Omit<User, "id" | "createdAt">) =>
        setData((prev) => ({ ...prev, users: [...prev.users, { ...input, id: uid(), createdAt: nowIso() }] })),
      updateUser: (id: string, patch: Partial<User>) =>
        setData((prev) => ({ ...prev, users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
      deleteUser: (id: string) =>
        setData((prev) => ({
          ...prev,
          users: prev.users.filter((u) => u.id !== id),
          memberships: prev.memberships.filter((m) => m.userId !== id)
        })),
      addGroup: (input: Omit<Group, "id" | "createdAt">) =>
        setData((prev) => ({ ...prev, groups: [...prev.groups, { ...input, id: uid(), createdAt: nowIso() }] })),
      updateGroup: (id: string, patch: Partial<Group>) =>
        setData((prev) => ({ ...prev, groups: prev.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGroup: (id: string) =>
        setData((prev) => ({
          ...prev,
          groups: prev.groups.filter((g) => g.id !== id),
          memberships: prev.memberships.filter((m) => m.groupId !== id),
          runs: prev.runs.filter((r) => r.groupId !== id)
        })),
      setGroupMembers: (groupId: string, userIds: string[]) =>
        setData((prev) => {
          const preserved = prev.memberships.filter((m) => m.groupId !== groupId);
          const replacements: GroupMembership[] = userIds.map((userId) => ({ id: uid(), groupId, userId }));
          return { ...prev, memberships: [...preserved, ...replacements] };
        }),
      addUsersBulk: (users: Array<Omit<User, "id" | "createdAt">>) =>
        setData((prev) => ({
          ...prev,
          users: [...prev.users, ...users.map((u) => ({ ...u, id: uid(), createdAt: nowIso() }))]
        })),
      playRun: (groupId: string, gameType: GameType, mode: PickMode): GameRun | null => {
        const groupUserIds = data.memberships.filter((m) => m.groupId === groupId).map((m) => m.userId);
        if (groupUserIds.length === 0) return null;

        const poolKey = `${groupId}:${gameType}`;
        let candidatePool = groupUserIds;

        if (mode === "depleting") {
          const pool = data.depletionPools.find((p) => p.key === poolKey);
          candidatePool = pool?.remainingUserIds.length ? pool.remainingUserIds : groupUserIds;
        }

        const selectedUserId = candidatePool[Math.floor(Math.random() * candidatePool.length)];

        const run: GameRun = {
          id: uid(),
          groupId,
          gameType,
          mode,
          selectedUserId,
          candidateUserIds: [...candidatePool],
          timestamp: nowIso()
        };

        setData((prev) => {
          if (mode !== "depleting") return { ...prev, runs: [...prev.runs, run] };

          const idx = prev.depletionPools.findIndex((p) => p.key === poolKey);
          const current = idx >= 0 && prev.depletionPools[idx].remainingUserIds.length
            ? prev.depletionPools[idx].remainingUserIds
            : groupUserIds;
          const remaining = current.filter((id) => id !== selectedUserId);
          const nextPools = [...prev.depletionPools];
          const nextPool = { key: poolKey, remainingUserIds: remaining };
          if (idx >= 0) nextPools[idx] = nextPool;
          else nextPools.push(nextPool);

          return { ...prev, runs: [...prev.runs, run], depletionPools: nextPools };
        });

        return run;
      },
      updateSettings: (patch: Partial<AppData["settings"]>) => setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } })),
      resetAll: () => setData(defaultData)
    }),
    [data.memberships, data.depletionPools]
  );

  return { data, ...api };
};
