import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { GameType, PickMode } from "../types";

const gameLabels: Record<GameType, string> = {
  slot: "A - Emoji Slot Machine",
  claw: "B - Claw Machine",
  race: "C - Race Game",
  cards: "D - Mystery Card Flip",
  wheelEdge: "E - Spin the Wheel (Edge)",
  plinkoWrong: "F - Plinko: The Price is Wrong"
};

type PlayResult = { selectedUserId: string } | null;

export function PlayPage({ data, playRun }: any) {
  const [groupId, setGroupId] = useState("");
  const [gameType, setGameType] = useState<GameType>("slot");
  const [mode, setMode] = useState<PickMode>("depleting");
  const [resultText, setResultText] = useState("No run yet");
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

  useEffect(() => {
    return () => {
      if (playTimer.current) window.clearInterval(playTimer.current);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
  }, []);

  const resolveRun = (result: PlayResult) => {
    if (!result) {
      setResultText("No users in this group.");
      setDisplayName("No candidates");
      setIsPlaying(false);
      return;
    }
    const winner = data.users.find((u: any) => u.id === result.selectedUserId);
    setDisplayName(`${winner?.icon ?? "🏆"} ${winner?.name ?? "Unknown"}`);
    setResultText(`Winner: ${winner?.icon ?? "🏆"} ${winner?.name ?? "Unknown"}`);
    setIsPlaying(false);
  };

  const run = () => {
    if (!groupId || isPlaying) return;
    if (groupUsers.length === 0) {
      setResultText("No users in this group.");
      setDisplayName("No candidates");
      return;
    }

    setIsPlaying(true);
    setResultText("Spinning...");

    if (gameType === "wheelEdge") {
      setWheelRotation((prev) => prev + 1080 + Math.floor(Math.random() * 900));
    }

    if (gameType === "plinkoWrong") {
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
          Game
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
            <option value="depleting">Depleting pool</option>
            <option value="fullRandom">Full random</option>
          </select>
        </label>
      </div>

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
            <div className="wheel-pointer">▼ EDGE</div>
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
        {gameType === "plinkoWrong" && (
          <div className="plinko-wrap">
            <h4>💥 Plinko: The Price is Wrong 💥</h4>
            <div className="plinko-board">
              <div className={`plinko-chip ${isPlaying ? "dropping" : ""}`} style={{ "--x": plinkoX } as CSSProperties}>🪙</div>
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="peg" />
              ))}
            </div>
            <div className="plinko-slots">
              <span>NOPE</span>
              <span>TRY AGAIN</span>
              <span>WRONG</span>
              <span>ALMOST</span>
              <span>CHAOS</span>
            </div>
            <p className="plinko-caption">And the loser-winner is: {displayName}</p>
          </div>
        )}
      </div>

      <button disabled={!groupId || isPlaying} onClick={run}>
        ▶ {isPlaying ? "Playing..." : "Play"}
      </button>
      <p className="result">{resultText}</p>
      <p>Participants in group: {groupUsers.length}</p>
    </section>
  );
}
