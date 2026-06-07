import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { GameType, PickMode } from "../types";

const gameLabels: Record<GameType, string> = {
  slot: "Slot Machine",
  claw: "Claw Machine",
  race: "Race to the Mic",
  cards: "Mystery Card",
  wheelEdge: "Spinning Wheel",
  plinko: "Plinko Drop"
};

const plinkoSlotLabels = ["GO", "NEXT", "SPEAK", "STAGE", "LEAD"];

type PlayResult = { selectedUserId: string } | null;

export function PlayPage({ data, playRun }: any) {
  const [groupId, setGroupId] = useState("");
  const [gameType, setGameType] = useState<GameType>("wheelEdge");
  const [mode, setMode] = useState<PickMode>("depleting");
  const [resultText, setResultText] = useState("Pick a group, then spin.");
  const [displayName, setDisplayName] = useState("Ready");
  const [isPlaying, setIsPlaying] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [plinkoX, setPlinkoX] = useState(0);
  const playTimer = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);

  const groupUsers = useMemo(() => {
    const ids = data.memberships.filter((m: any) => m.groupId === groupId).map((m: any) => m.userId);
    return data.users.filter((u: any) => ids.includes(u.id));
  }, [data.memberships, data.users, groupId]);

  const wheelSegments = useMemo(() => groupUsers.slice(0, 10), [groupUsers]);

  const poolKey = `${groupId}:${gameType}`;
  const remainingPool = useMemo(() => {
    if (!groupId) return [];
    const pool = data.depletionPools.find((p: any) => p.key === poolKey);
    return pool?.remainingUserIds ?? groupUsers.map((u: any) => u.id);
  }, [data.depletionPools, poolKey, groupUsers, groupId]);

  const alreadyPickedThisRound = useMemo(
    () => groupUsers.filter((u: any) => !remainingPool.includes(u.id)),
    [groupUsers, remainingPool]
  );

  useEffect(() => {
    return () => {
      if (playTimer.current) window.clearInterval(playTimer.current);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, []);

  const resolveRun = (result: PlayResult) => {
    if (!result) {
      setResultText("No one in this group yet.");
      setDisplayName("Empty group");
      setIsPlaying(false);
      return;
    }
    const winner = data.users.find((u: any) => u.id === result.selectedUserId);
    setDisplayName(`${winner?.icon ?? "🎉"} ${winner?.name ?? "Unknown"}`);
    setResultText(`Up next: ${winner?.icon ?? "🎉"} ${winner?.name ?? "Unknown"}`);
    setIsPlaying(false);
  };

  const run = () => {
    if (!groupId || isPlaying) return;
    if (groupUsers.length === 0) {
      setResultText("No one in this group yet.");
      setDisplayName("Empty group");
      return;
    }

    setIsPlaying(true);
    setResultText("Spinning…");

    if (gameType === "wheelEdge") {
      setWheelRotation((prev) => prev + 1080 + Math.floor(Math.random() * 900));
    }

    if (gameType === "plinko") {
      setPlinkoX(Math.floor(Math.random() * 7) - 3);
    }

    let tick = 0;
    playTimer.current = window.setInterval(() => {
      const user = groupUsers[tick % groupUsers.length];
      setDisplayName(`${user.icon ?? "🙂"} ${user.name}`);
      tick += 1;
    }, 95);

    settleTimer.current = window.setTimeout(() => {
      if (playTimer.current) window.clearInterval(playTimer.current);
      const result = playRun(groupId, gameType, mode);
      resolveRun(result);
    }, 1500);
  };

  return (
    <section>
      <h2>Play</h2>
      <div className="grid">
        <label>
          Group
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">Select group</option>
            {data.groups.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.icon ?? "👥"} {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Style
          <select value={gameType} onChange={(e) => setGameType(e.target.value as GameType)}>
            {Object.entries(gameLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value as PickMode)}>
            <option value="depleting">Round-robin (everyone goes once)</option>
            <option value="fullRandom">Pure random</option>
          </select>
        </label>
      </div>

      {groupId && mode === "depleting" && groupUsers.length > 0 && (
        <div className="pool-status">
          <div className="pool-headline">
            <strong>{remainingPool.length}</strong> of {groupUsers.length} still to be picked this round
            {remainingPool.length === groupUsers.length && " — fresh round"}
            {remainingPool.length === 0 && " — round complete, next spin starts a new one"}
          </div>
          <div className="pool-dots" aria-label="round status">
            {groupUsers.map((u: any) => {
              const picked = !remainingPool.includes(u.id);
              return (
                <span
                  key={u.id}
                  className={`pool-dot ${picked ? "picked" : ""}`}
                  title={`${u.name}${picked ? " (already picked)" : " (still queued)"}`}
                >
                  {u.icon ?? "•"}
                </span>
              );
            })}
          </div>
          {alreadyPickedThisRound.length > 0 && (
            <p className="hint">
              Already picked: {alreadyPickedThisRound.map((u: any) => u.name).join(", ")}
            </p>
          )}
        </div>
      )}

      {groupId && mode === "fullRandom" && groupUsers.length > 0 && (
        <div className="pool-status warn">
          Pure random — someone may be picked twice before others are picked once.
        </div>
      )}

      <div className={`game-stage game-${gameType} ${isPlaying ? "playing" : ""}`}>
        {gameType === "slot" && (
          <div className="slot-machine">
            <div className="reel">🎰</div>
            <div className="reel focus">{displayName}</div>
            <div className="reel">🎲</div>
          </div>
        )}
        {gameType === "claw" && (
          <div className="claw-machine">
            <div className="claw">🕹️</div>
            <div className="prize">{displayName}</div>
          </div>
        )}
        {gameType === "race" && (
          <div className="race-track">
            <div className="lane">🏁 Finish</div>
            <div className="runner">{displayName}</div>
          </div>
        )}
        {gameType === "cards" && (
          <div className="card-flip">
            <div className="card">🂠</div>
            <div className="card winner">{displayName}</div>
          </div>
        )}
        {gameType === "wheelEdge" && (
          <div className="wheel-wrap">
            <div className="wheel-pointer">▼</div>
            <div className="wheel" style={{ transform: `rotate(${wheelRotation}deg)` }}>
              {wheelSegments.map((u: any, idx: number) => (
                <div
                  key={u.id}
                  className="wheel-segment"
                  style={{ transform: `rotate(${(360 / Math.max(1, wheelSegments.length)) * idx}deg)` }}
                >
                  <span>{u.icon ?? "🙂"}</span>
                </div>
              ))}
              <div className="wheel-center">{displayName}</div>
            </div>
          </div>
        )}
        {gameType === "plinko" && (
          <div className="plinko-wrap">
            <h4>🎯 Plinko Drop</h4>
            <div className="plinko-board">
              <div className={`plinko-chip ${isPlaying ? "dropping" : ""}`} style={{ "--x": plinkoX } as CSSProperties}>🪙</div>
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="peg" />
              ))}
            </div>
            <div className="plinko-slots">
              {plinkoSlotLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <p className="plinko-caption">{displayName}</p>
          </div>
        )}
      </div>

      <button disabled={!groupId || isPlaying} onClick={run} className="primary big">
        ▶ {isPlaying ? "Spinning…" : "Spin"}
      </button>
      <p className="result">{resultText}</p>
    </section>
  );
}
