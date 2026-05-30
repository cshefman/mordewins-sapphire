import { IconChevronRight } from "@tabler/icons-react";
import { config } from "../config";

interface Props {
  aurum: number;
  onManage: () => void;
}

export function Header({ aurum, onManage }: Props) {
  return (
    <div className="hdr">
      <div className="who">
        <h1 style={{ whiteSpace: "nowrap" }}>Mordewin's Sapphire</h1>
        <p>{config.character.subtitle}</p>
      </div>
      <button className="aurum" onClick={onManage} title="Manage Aurum & tiers">
        <span className="pip" />
        {aurum}
        <small>Aurum</small>
        <IconChevronRight size={14} style={{ opacity: 0.7 }} />
      </button>
    </div>
  );
}
