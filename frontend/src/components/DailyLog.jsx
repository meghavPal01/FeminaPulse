import { useState } from "react";
import { useApp } from "../context/AppContext";

const moods = [
  { key: "great", emoji: "🙂", label: "Great" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😞", label: "Low" },
  { key: "anxious", emoji: "😟", label: "Anxious" },
];

const symptomOptions = ["Cramps", "Acne", "Fatigue", "Bloating", "Irregular cycle", "Hair thinning", "None"];

function moodLabel(m) {
  const found = moods.find((x) => x.key === m);
  return found ? `${found.emoji} ${found.label}` : m;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyLog() {
  const { logs, addLog } = useApp();

  const [date, setDate] = useState(todayStr());
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState("");
  const [water, setWater] = useState("");
  const [exercised, setExercised] = useState(false);
  const [mood, setMood] = useState(null);
  const [symptoms, setSymptoms] = useState(new Set());
  const [toastMsg, setToastMsg] = useState("");
  const [busy, setBusy] = useState(false);

  function toggleSymptom(s) {
    setSymptoms((prev) => {
      const next = new Set(prev);
      if (s === "None") return new Set(["None"]);
      next.delete("None");
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  }

  async function submitLog() {
    const w = parseFloat(weight);
    const sl = parseFloat(sleep);
    if (!w || !sl) {
      showToast("Add at least weight and sleep to save.");
      return;
    }
    setBusy(true);
    try {
      await addLog({
        log_date: date || todayStr(),
        weight_kg: w,
        sleep_hours: sl,
        water_glasses: parseFloat(water) || 0,
        exercised,
        mood: mood || "okay",
        symptoms: symptoms.size ? Array.from(symptoms) : ["None"],
      });
      showToast(`Entry saved for ${date || todayStr()}`);
      setWeight("");
      setSleep("");
      setWater("");
      setMood(null);
      setSymptoms(new Set());
    } catch (e) {
      showToast(e.message || "Could not save entry.");
    } finally {
      setBusy(false);
    }
  }

  const recent = [...logs].reverse().slice(0, 8);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] text-wine-dark">Daily log</h1>
        <p className="text-muted text-[14.5px] mt-1">Takes under a minute. Consistency matters more than precision.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-start">
        <div className="card">
          <h3 className="text-[16px] text-wine-dark mb-4">Add today's entry</h3>
          <div className="field mb-4">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" placeholder="e.g. 64" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="field">
              <label>Sleep (hours)</label>
              <input type="number" step="0.5" placeholder="e.g. 7" value={sleep} onChange={(e) => setSleep(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="field">
              <label>Water (glasses)</label>
              <input type="number" placeholder="e.g. 6" value={water} onChange={(e) => setWater(e.target.value)} />
            </div>
            <div className="field">
              <label>Exercised today?</label>
              <select value={exercised ? "yes" : "no"} onChange={(e) => setExercised(e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          <div className="field mb-4">
            <label>Mood</label>
            <div className="flex gap-2.5">
              {moods.map((m) => (
                <div
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`flex-1 text-center py-3 px-1.5 rounded-xl border cursor-pointer text-[22px] ${
                    mood === m.key ? "border-rose bg-rose-tint" : "border-line bg-white"
                  }`}
                >
                  {m.emoji}
                  <span className="block text-[11px] mt-1 text-muted font-semibold">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="field mb-4">
            <label>Symptoms today</label>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map((s) => (
                <div key={s} onClick={() => toggleSymptom(s)} className={`chip cursor-pointer ${symptoms.has(s) ? "selected" : ""}`}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary w-full mt-2.5" onClick={submitLog} disabled={busy}>
            {busy ? "Saving…" : "Save entry"}
          </button>
        </div>

        <div className="card">
          <h3 className="text-[16px] text-wine-dark mb-4">Recent entries</h3>
          {recent.length === 0 ? (
            <div className="text-center py-10 px-5 text-muted">No entries yet — add your first one.</div>
          ) : (
            <table className="w-full text-[13.5px] border-collapse">
              <thead>
                <tr>
                  {["Date", "Weight", "Sleep", "Mood", "Symptoms"].map((h) => (
                    <th key={h} className="text-left text-muted font-semibold text-[12px] uppercase tracking-wide py-2.5 px-2 border-b border-line">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 px-2 border-b border-line">{l.log_date}</td>
                    <td className="py-3 px-2 border-b border-line">{l.weight_kg} kg</td>
                    <td className="py-3 px-2 border-b border-line">{l.sleep_hours} hr</td>
                    <td className="py-3 px-2 border-b border-line">{moodLabel(l.mood)}</td>
                    <td className="py-3 px-2 border-b border-line">
                      {l.symptoms.map((s) => (
                        <span key={s} className={`inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold mr-1 ${s === "None" ? "bg-sage-tint text-[#3F5A43]" : "bg-rose-tint text-[#9C3E52]"}`}>
                          {s}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-wine-dark text-white px-6 py-3 rounded-full text-[14px] font-medium shadow-card z-50">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
