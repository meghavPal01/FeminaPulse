import KnowledgeGrid from "./KnowledgeGrid";

export default function Knowledge() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-[28px] text-wine-dark">Knowledge centre</h1>
        <p className="text-muted text-[14.5px] mt-1">Clear, judgement-free reads on PCOS and PCOD.</p>
      </div>
      <KnowledgeGrid />
    </div>
  );
}
