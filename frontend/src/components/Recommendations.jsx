import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../api";

export default function Recommendations() {
  const { recommendations: cached } = useApp();
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.getRecommendations();
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Could not load recommendations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] text-wine-dark">Recommendations</h1>
        <p className="text-muted text-[14.5px] mt-1">
          Generated from your profile, recent logs, and last risk check — gets sharper the more you log.
        </p>
      </div>

      {loading && <div className="card text-center py-10 px-5 text-muted">Loading your recommendations…</div>}
      {err && <div className="card text-center py-10 px-5 text-[#B23A48]">{err}</div>}

      {!loading && !err && data && (
        <div className="grid gap-4">
          {data.items.map((item, i) => (
            <div key={i} className="card">
              <div className="text-[11.5px] font-bold uppercase tracking-wide text-rose mb-2">{item.trigger}</div>
              <p className="text-[15px]">{item.suggestion}</p>
            </div>
          ))}

          {Object.keys(data.based_on || {}).length > 0 && (
            <div className="card bg-wine-tint mt-2">
              <h3 className="text-[14px] text-wine-dark mb-3">Based on</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.based_on).map(([k, v]) => (
                  <span key={k} className="chip">
                    {k.replace(/_/g, " ")}: <strong className="ml-1">{String(v)}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
