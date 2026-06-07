import { useMemo, useState } from "react";

const groupIcons = ["👥", "🧩", "🏴", "🎮", "🎤", "⚙️", "📣", "🛡️"];

export function GroupsPage({ data, addGroup, deleteGroup, setGroupMembers }: any) {
  const [form, setForm] = useState({ name: "", description: "", icon: "👥", color: "#0ea5e9" });

  const membersByGroup = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const membership of data.memberships) {
      if (!map.has(membership.groupId)) map.set(membership.groupId, new Set());
      map.get(membership.groupId)?.add(membership.userId);
    }
    return map;
  }, [data.memberships]);

  const toggleMembership = (groupId: string, userId: string, checked: boolean) => {
    const currentMembers = [...(membersByGroup.get(groupId) ?? new Set<string>())];
    const nextMembers = checked
      ? Array.from(new Set([...currentMembers, userId]))
      : currentMembers.filter((id) => id !== userId);
    setGroupMembers(groupId, nextMembers);
  };
export function GroupsPage({ data, addGroup, deleteGroup, setGroupMembers }: any) {
  const [form, setForm] = useState({ name: "", description: "", icon: "", color: "#0ea5e9" });
  const [selectedGroupId, setSelectedGroupId] = useState("");

  const selectedMembers = useMemo(
    () => data.memberships.filter((m: any) => m.groupId === selectedGroupId).map((m: any) => m.userId),
    [data.memberships, selectedGroupId]
  );

  return (
    <section>
      <h2>Admin / Groups</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        addGroup(form);
        setForm({ name: "", description: "", icon: "", color: "#0ea5e9" });
      }} className="grid">
        <input placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input placeholder="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
        <button type="submit">Add Group</button>
      </form>

      <h3>Memberships</h3>
      <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
        <option value="">Select group</option>
        {data.groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>

      {selectedGroupId && (
        <div>
          {data.users.map((u: any) => {
            const checked = selectedMembers.includes(u.id);
            return (
              <label key={u.id} className="check-row">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked ? [...selectedMembers, u.id] : selectedMembers.filter((id: string) => id !== u.id);
                    setGroupMembers(selectedGroupId, next);
                  }}
                />
                {u.name}
              </label>
            );
          })}
        </div>
      )}

      <ul>
        {data.groups.map((g: any) => (
          <li key={g.id}>
            <span style={{ color: g.color }}>{g.icon ?? "👥"} {g.name}</span>
            <button onClick={() => deleteGroup(g.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
