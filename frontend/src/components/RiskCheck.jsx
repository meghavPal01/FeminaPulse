import { useState } from "react";
import { useApp } from "../context/AppContext";

const yesNo = [
  { label: "No", val: false },
  { label: "Yes", val: true },
];

function RadioRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2.5 flex-wrap">
      {options.map((o) => (
        <div
          key={o.label}
          onClick={() => onChange(o.val)}
          className={`px-4 py-2.5 rounded-[10px] border text-[13.5px] cursor-pointer ${
            value === o.val ? "bg-wine border-wine text-white" : "bg-white border-line text-ink"
          }`}
        >
          {o.label}
        </div>
      ))}
    </div>
  );
}

export default function RiskCheck() {
  const { runRiskCheck } = useApp();
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [answers, setAnswers] = useState({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  function setAnswer(key, val) {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  }

  async function compute() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age, 10);
    const needed = ["cycle_irregular", "weight_gain", "hair_growth", "pimples"];
    if (!h || !w || !a || needed.some((k) => answers[k] === undefined)) {
      setErr("Fill in your age, height, weight, and every required question first.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const payload = {
        age: a,
        height_cm: h,
        weight_kg: w,
        cycle_irregular: !!answers.cycle_irregular,
        weight_gain: !!answers.weight_gain,
        hair_growth: !!answers.hair_growth,
        skin_darkening: !!answers.skin_darkening,
        hair_loss: !!answers.hair_loss,
        pimples: !!answers.pimples,
        fast_food: !!answers.fast_food,
        reg_exercise: !!answers.reg_exercise,
      };
      const res = await runRiskCheck(payload);
      setResult(res);
    } catch (e) {
      setErr(e.message || "Could not run the risk check.");
    } finally {
      setBusy(false);
    }
  }

  const cls =
    result?.risk_level === "High" ? "bg-rose-tint" :
    result?.risk_level === "Moderate" ? "bg-[#FCEFDC]" : "bg-sage-tint";
  const levelTextClass =
    result?.risk_level === "High" ? "text-[#9C3E52]" :
    result?.risk_level === "Moderate" ? "text-[#8A5A17]" : "text-[#3F5A43]";

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] text-wine-dark">PCOS risk check</h1>
        <p className="text-muted text-[14.5px] mt-1">
          A short screening questionnaire, scored by a trained model — not a diagnosis, but a useful starting point for a conversation with a doctor.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-start">
        <div className="card">
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="field">
              <label>Age</label>
              <input type="number" placeholder="e.g. 24" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="field">
              <label>Height (cm)</label>
              <input type="number" placeholder="e.g. 162" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="field">
              <label>Weight (kg)</label>
              <input type="number" placeholder="e.g. 68" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>

          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">How regular are your periods?</label>
            <RadioRow
              options={[{ label: "Regular", val: false }, { label: "Irregular / absent", val: true }]}
              value={answers.cycle_irregular}
              onChange={(v) => setAnswer("cycle_irregular", v)}
            />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">Noticeable weight gain in the last year?</label>
            <RadioRow options={yesNo} value={answers.weight_gain} onChange={(v) => setAnswer("weight_gain", v)} />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">Excess facial or body hair growth?</label>
            <RadioRow options={yesNo} value={answers.hair_growth} onChange={(v) => setAnswer("hair_growth", v)} />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">
              Darkening of skin (neck, underarms, or skin folds)?
            </label>
            <RadioRow options={yesNo} value={answers.skin_darkening} onChange={(v) => setAnswer("skin_darkening", v)} />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">Hair thinning or hair loss?</label>
            <RadioRow options={yesNo} value={answers.hair_loss} onChange={(v) => setAnswer("hair_loss", v)} />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">Persistent acne (adult-onset or jawline)?</label>
            <RadioRow options={yesNo} value={answers.pimples} onChange={(v) => setAnswer("pimples", v)} />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">Frequent fast food / ultra-processed meals?</label>
            <RadioRow options={yesNo} value={answers.fast_food} onChange={(v) => setAnswer("fast_food", v)} />
          </div>
          <div className="mb-5">
            <label className="block font-semibold text-[14.5px] text-wine-dark mb-2.5">Do you exercise regularly?</label>
            <RadioRow options={yesNo} value={answers.reg_exercise} onChange={(v) => setAnswer("reg_exercise", v)} />
          </div>

          <button className="btn btn-primary w-full" onClick={compute} disabled={busy}>
            {busy ? "Scoring…" : "See my result"}
          </button>
          {err && <div className="text-[#B23A48] text-[12.5px] mt-2">{err}</div>}
        </div>

        <div>
          {!result ? (
            <div className="card text-center py-10 px-5 text-muted">
              Your result will appear here once you complete the questionnaire.
            </div>
          ) : (
            <div className={`card ${cls}`}>
              <div className={`font-serif text-[24px] mb-1.5 ${levelTextClass}`}>
                {result.risk_level} risk — {result.risk_percent}%
              </div>
              <p className="mb-3.5">
                BMI: {result.bmi}. Top contributing factors: {result.top_reasons.join(", ")}.
              </p>
              <p className="font-semibold mb-2">Suggested next steps</p>
              <ul className="list-disc pl-[18px] m-0">
                {result.recommendations.map((r) => (
                  <li key={r} className="mb-1.5">{r}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-[12.5px] text-muted mt-3.5">
            This model is trained on self-reportable symptoms only (no lab tests). It is a screening aid, not a medical diagnosis — please see a doctor for a proper evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
