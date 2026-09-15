import { articles } from "../data/articles";
import { KnowledgeIcons } from "./Icons";

export default function KnowledgeGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {articles.map((a) => (
        <div key={a.title} className="bg-white border border-line rounded-card overflow-hidden">
          <div className="h-[130px] flex items-center justify-center" style={{ background: a.color }}>
            {KnowledgeIcons[a.icon]}
          </div>
          <div className="p-5">
            <div className="text-[11.5px] font-bold uppercase tracking-wide text-rose">{a.tag}</div>
            <h3 className="text-[16.5px] my-2 text-wine-dark">{a.title}</h3>
            <p className="text-[13.5px] text-muted">{a.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
