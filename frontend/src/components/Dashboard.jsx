import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useApp } from "../context/AppContext";

const moodOrder = ["low", "anxious", "okay", "great"];
const moodLabelMap = { great: "Great", okay: "Okay", low: "Low", anxious: "Anxious" };

function MetricCard({ label, value, sub, subClass = "text-sage" }) {
  return (
    <div className="card">
      <div className="text-[12.5px] text-muted font-semibold uppercase tracking-wide">{label}</div>
      <div className="font-serif text-[28px] text-wine-dark mt-2">{value}</div>
      {sub && <div className={`text-[12.5px] mt-1 font-semibold ${subClass}`}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, logs, riskResult } = useApp();
  const navigate = useNavigate();
  const last7 = logs.slice(-7);

  const bmi = profile.height_cm && profile.weight_kg
    ? profile.weight_kg / (profile.height_cm / 100) ** 2
    : null;

  const avgSleep = last7.length ? last7.reduce((s, l) => s + l.sleep_hours, 0) / last7.length : 0;
  const irregularCount = last7.filter((l) => l.symptoms.includes("Irregular cycle")).length;

  const weightData = last7.map((l) => ({ date: l.log_date.slice(5), weight: l.weight_kg }));
  const sleepWaterData = last7.map((l) => ({ date: l.log_date.slice(5), Sleep: l.sleep_hours, Water: l.water_glasses }));
  const moodData = last7.map((l) => ({ date: l.log_date.slice(5), moodIndex: moodOrder.indexOf(l.mood), mood: moodLabelMap[l.mood] }));

  const symCount = {};
  logs.forEach((l) => l.symptoms.forEach((s) => { if (s !== "None") symCount[s] = (symCount[s] || 0) + 1; }));
  const symptomData = Object.keys(symCount).length
    ? Object.entries(symCount).map(([name, count]) => ({ name, count }))
    : [{ name: "No symptoms logged", count: 0 }];

  const displayName = user?.name || "";

  return (
    <div>
      <div className="flex justify-between items-end mb-7 flex-wrap gap-3.5">
        <div>
          <h1 className="text-[28px] text-wine-dark">Welcome back{displayName ? `, ${displayName.split(" ")[0]}` : ""}</h1>
          <p className="text-muted text-[14.5px] mt-1">Here's how the last few weeks have looked.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/app/log")}>+ Log today</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <MetricCard
          label="Current BMI"
          value={bmi ? bmi.toFixed(1) : "–"}
          sub={bmi ? (bmi >= 25 ? "Above typical range" : "Within typical range") : "Set your profile"}
          subClass={bmi && bmi >= 25 ? "text-rose" : "text-sage"}
        />
        <MetricCard label="Avg sleep" value={avgSleep ? `${avgSleep.toFixed(1)} hr` : "–"} sub="last 7 logs" />
        <MetricCard
          label="Cycle regularity"
          value={last7.length ? (irregularCount >= 2 ? "Irregular" : "Mostly regular") : "–"}
          sub="based on your logs"
          subClass={irregularCount >= 2 ? "text-rose" : "text-sage"}
        />
        <MetricCard
          label="Risk level"
          value={riskResult ? riskResult.risk_level : "–"}
          sub={riskResult ? `${riskResult.risk_percent}% from your last check` : "take the risk check"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div className="card">
          <h3 className="text-[16px] text-wine-dark mb-4">Weight trend</h3>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid stroke="#EEE2E7" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#6B2E4D" strokeWidth={2.5} dot={{ r: 3 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="text-[16px] text-wine-dark mb-4">Sleep &amp; water</h3>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepWaterData}>
                <CartesianGrid stroke="#EEE2E7" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Sleep" fill="#D97C93" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Water" fill="#6E8B72" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="text-[16px] text-wine-dark mb-4">Mood over time</h3>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <CartesianGrid stroke="#EEE2E7" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                  tickFormatter={(v) => moodOrder[v] || ""}
                />
                <Tooltip formatter={(_, __, item) => [item.payload.mood, "Mood"]} />
                <Line type="monotone" dataKey="moodIndex" stroke="#C79A52" strokeWidth={2.5} dot={{ r: 3 }} name="Mood" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="text-[16px] text-wine-dark mb-4">Symptom frequency</h3>
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={symptomData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke="#EEE2E7" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#D97C93" radius={[0, 4, 4, 0]} name="Times logged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
