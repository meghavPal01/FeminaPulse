import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

export default function Profile() {
  const { profile, setProfile, user } = useApp();
  const [form, setForm] = useState(profile);
  const [toastMsg, setToastMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  function update(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  }

  async function save() {
    setErr("");
    setBusy(true);
    try {
      await setProfile({
        age: form.age ? Number(form.age) : null,
        height_cm: form.height_cm ? Number(form.height_cm) : null,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
        family_history: !!form.family_history,
      });
      showToast("Profile saved");
    } catch (e) {
      setErr(e.message || "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] text-wine-dark">Your profile</h1>
        <p className="text-muted text-[14.5px] mt-1">
          Signed in as <strong>{user?.email}</strong>. This helps personalise your dashboard and recommendations.
        </p>
      </div>

      <div className="card max-w-[640px]">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="field">
            <label>Age</label>
            <input type="number" value={form.age ?? ""} onChange={(e) => update("age", e.target.value)} />
          </div>
          <div className="field">
            <label>Family history of PCOS / diabetes</label>
            <select
              value={form.family_history ? "yes" : "no"}
              onChange={(e) => update("family_history", e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="field">
            <label>Height (cm)</label>
            <input type="number" value={form.height_cm ?? ""} onChange={(e) => update("height_cm", e.target.value)} />
          </div>
          <div className="field">
            <label>Weight (kg)</label>
            <input type="number" value={form.weight_kg ?? ""} onChange={(e) => update("weight_kg", e.target.value)} />
          </div>
        </div>
        {err && <div className="text-[#B23A48] text-[12.5px] mb-3">{err}</div>}
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </div>

      {toastMsg && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-wine-dark text-white px-6 py-3 rounded-full text-[14px] font-medium shadow-card z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
