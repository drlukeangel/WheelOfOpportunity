import { useMemo, useState } from "react";

const groupIcons = ["👥", "🧩", "🏴", "🎮", "🎤", "⚙️", "📣", "🛡️"];

export function GroupsPage({ data, addGroup, deleteGroup, setGroupMembers }: any) {
  const [form, setForm] = useState({ name: "", description: "", icon: "👥", color: "#0ea5e9" });
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const selectedMembers = useMemo(
    () => data.memberships.filter((m: any) => m.groupId === selectedGroupId).map((m: any) => m.userId),
    [data.memberships, selectedGroupId]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addGroup(form);
    setForm({ name: "", description: "", icon: "👥", color: "#0ea5e9" });
  };

  return (
    <section>
      <h2>Groups</h2>
      <p className="hint">A group is who's eligible to be picked — a standup, an oncall rotation, a working group.</p>

      <form onSubmit={submit} className="grid">
        <input placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="full-row">
          <p className="field-label">Pick an icon</p>
          <div className="icon-grid">
            {groupIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`icon-btn ${form.icon === icon ? "selected" : ""}`}
                onClick={() => setForm({ ...form, icon })}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <label>
          Color
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        </label>

        <button type="submit" className="primary">Add group</button>
      </form>

      <h3>Members</h3>
      <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
        <option value="">Pick a group to manage members</option>
        {data.groups.map((g: any) => <option key={g.id} value={g.id}>{g.icon ?? "👥"} {g.name}</option>)}
      </select>

      {selectedGroupId && (
        <div className="member-list">
          {data.users.length === 0 && <p className="hint">Add people first under the <em>People</em> tab.</p>}
          {data.users.map((u: any) => {
            const checked = selectedMembers.includes(u.id);
            return (
              <label key={u.id} className="check-row">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selectedMembers, u.id]
                      : selectedMembers.filter((id: string) => id !== u.id);
                    setGroupMembers(selectedGroupId, next);
                  }}
                />
                <span style={{ color: u.color }}>{u.icon ?? "🙂"} {u.name}</span>
              </label>
            );
          })}
        </div>
      )}

      <h3>All groups</h3>
      <ul className="person-list">
        {data.groups.map((g: any) => (
          <li key={g.id}>
            <span style={{ color: g.color }}>{g.icon ?? "👥"} {g.name}</span>
            <button onClick={() => deleteGroup(g.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
