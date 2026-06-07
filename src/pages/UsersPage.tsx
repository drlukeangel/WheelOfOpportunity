import { useState } from "react";
import { readFileDataUrl } from "../lib/utils";

const userIcons = ["🙂", "🦊", "🦉", "🐢", "🦄", "🐙", "🐳", "🐝", "🦋", "🌿", "🌊", "⭐", "🚀", "🎨", "🎵", "🔧"];

export function UsersPage({ data, addUser, deleteUser }: any) {
  const [form, setForm] = useState({ name: "", email: "", employeeId: "", icon: "🙂", color: "#7c3aed", photoDataUrl: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.email && data.users.some((u: any) => u.email && u.email === form.email)) {
      alert("Email must be unique");
      return;
    }
    if (form.employeeId && data.users.some((u: any) => u.employeeId === form.employeeId)) {
      alert("ID must be unique");
      return;
    }
    addUser(form);
    setForm({ name: "", email: "", employeeId: "", icon: "🙂", color: "#7c3aed", photoDataUrl: "" });
  };

  return (
    <section>
      <h2>People</h2>
      <p className="hint">Add everyone who might be picked. Email and ID are optional.</p>

      <form onSubmit={submit} className="grid">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="ID (optional)" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />

        <div className="full-row">
          <p className="field-label">Pick an icon</p>
          <div className="icon-grid">
            {userIcons.map((icon) => (
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

        <label>
          Photo (optional)
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const photoDataUrl = await readFileDataUrl(file);
              setForm((prev) => ({ ...prev, photoDataUrl }));
            }}
          />
        </label>

        <button type="submit" className="primary">Add person</button>
      </form>

      <ul className="person-list">
        {data.users.map((u: any) => (
          <li key={u.id}>
            <span style={{ color: u.color }}>
              {u.icon ?? "🙂"} {u.name}{u.employeeId ? ` (${u.employeeId})` : ""}
            </span>
            <button onClick={() => deleteUser(u.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
