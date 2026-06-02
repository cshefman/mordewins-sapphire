import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import gemArt from "../assets/sapphire.png";
import { POWERS, POWER_ORDER } from "../powers";
import { POWER_ICONS } from "../icons";
import type { PowerKey, TierLevel } from "../types";

const SVGNS = "http://www.w3.org/2000/svg";
const SW = 412;
const SH = 360;
const CX = 206;
const CY = 180;

export interface GemHandle {
  /** gem charge + shake (on open / tap). */
  pulse: () => void;
  /** full activation: bolt down the wire, shockwave ring, shake, flash, wire light. */
  dramatize: (key: PowerKey) => void;
}

interface Props {
  unlocked: Record<PowerKey, TierLevel>;
  onOpenPower: (key: PowerKey) => void;
  onManage: (key: PowerKey) => void;
  flashRef: React.RefObject<HTMLDivElement>;
}

function P(cx: number, cy: number, ang: number, r: number): [number, number] {
  const a = (ang * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}
function boltPts(x1: number, y1: number, x2: number, y2: number, seg: number, jit: number) {
  const pts: [number, number][] = [[x1, y1]];
  const nx = -(y2 - y1);
  const ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  for (let i = 1; i < seg; i++) {
    const t = i / seg;
    const mx = x1 + (x2 - x1) * t;
    const my = y1 + (y2 - y1) * t;
    const off = (Math.random() * 2 - 1) * jit;
    pts.push([mx + (nx / len) * off, my + (ny / len) * off]);
  }
  pts.push([x2, y2]);
  return pts;
}

export const GemHub = forwardRef<GemHandle, Props>(function GemHub(
  { unlocked, onOpenPower, onManage, flashRef },
  ref,
) {
  const sapphireRef = useRef<HTMLDivElement>(null);
  const wiresRef = useRef<SVGSVGElement>(null);
  const fxRef = useRef<SVGSVGElement>(null);
  const fxOverRef = useRef<SVGSVGElement>(null); // viewport overlay, paints above the drawer
  const pressTimer = useRef<number | null>(null);

  // stable wire midpoint jitter per node
  const wireGeom = useMemo(() => {
    const g: Record<string, { d: string }> = {};
    for (const key of POWER_ORDER) {
      if (unlocked[key] === 0) continue; // locked → no wire
      const n = POWERS[key].node;
      const nx = (SW * n.x) / 100;
      const ny = (SH * n.y) / 100;
      const mx = (nx + CX) / 2 + (Math.random() * 20 - 10);
      const my = (ny + CY) / 2 + (Math.random() * 16 - 8);
      g[key] = { d: `M${nx} ${ny} Q${mx} ${my} ${CX} ${CY}` };
    }
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.values(unlocked).join(",")]);

  function fireFlash() {
    const f = flashRef.current;
    if (!f) return;
    f.style.transition = "none";
    f.style.opacity = ".62";
    void f.offsetWidth;
    f.style.transition = "opacity .5s ease";
    f.style.opacity = "0";
  }

  function pulse() {
    const s = sapphireRef.current;
    if (!s) return;
    s.classList.remove("fire");
    void s.offsetWidth;
    s.classList.add("fire");
    setTimeout(() => s.classList.remove("fire"), 680);
  }

  function drawBolt(svg: SVGSVGElement, x1: number, y1: number, x2: number, y2: number) {
    const pts = boltPts(x1, y1, x2, y2, 7, 16);
    const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
    const mk = (stroke: string, w: string) => {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", stroke);
      p.setAttribute("stroke-width", w);
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("class", "bolt");
      return p;
    };
    const glow = mk("rgba(120,180,255,.55)", "7");
    const core = mk("#eaf6ff", "2");
    svg.appendChild(glow);
    svg.appendChild(core);
    setTimeout(() => {
      glow.remove();
      core.remove();
    }, 540);
  }

  function dramatize(key: PowerKey) {
    pulse();
    fireFlash();

    // Render the activation burst on the viewport overlay (above the drawer), in screen
    // pixels measured from the DOM — the overlay has no viewBox, so its units are CSS px.
    const over = fxOverRef.current;
    const gem = sapphireRef.current;
    if (over && gem) {
      const ob = over.getBoundingClientRect(); // origin offset (handles transformed ancestors)
      const gr = gem.getBoundingClientRect();
      const gx = gr.left + gr.width / 2 - ob.left;
      const gy = gr.top + gr.height / 2 - ob.top;

      // shockwave ring centred on the gem
      const ring = document.createElementNS(SVGNS, "circle");
      ring.setAttribute("cx", String(gx));
      ring.setAttribute("cy", String(gy));
      ring.setAttribute("r", "16");
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "#bfe3ff");
      ring.setAttribute("stroke-width", "3");
      ring.setAttribute("class", "ring");
      ring.style.transformOrigin = `${gx}px ${gy}px`;
      over.appendChild(ring);
      setTimeout(() => ring.remove(), 660);

      // forked bolt from the firing node's icon to the gem
      const disc = document.querySelector<HTMLElement>(`[data-node="${key}"] .disc`);
      if (disc) {
        const nr = disc.getBoundingClientRect();
        const nx = nr.left + nr.width / 2 - ob.left;
        const ny = nr.top + nr.height / 2 - ob.top;
        drawBolt(over, nx, ny, gx, gy);
      }
    }

    // briefly light the wire (in-stage, behind the drawer — unchanged)
    const wire = wiresRef.current?.querySelector<SVGPathElement>(`path[data-key="${key}"]`);
    if (wire) {
      wire.setAttribute("stroke", "rgba(190,225,255,.95)");
      wire.setAttribute("stroke-width", "2.6");
      setTimeout(() => {
        wire.setAttribute("stroke", "rgba(233,189,76,.32)");
        wire.setAttribute("stroke-width", "1.2");
      }, 620);
    }
  }

  useImperativeHandle(ref, () => ({ pulse, dramatize }));

  // idle ambient arcs near the gem
  useEffect(() => {
    const id = window.setInterval(() => {
      const fx = fxRef.current;
      if (!fx) return;
      const a = Math.random() * 360;
      const b = a + 90 + Math.random() * 120;
      const p1 = P(CX, CY, a, 52);
      const p2 = P(CX, CY, b, 52);
      const pts = boltPts(p1[0], p1[1], p2[0], p2[1], 5, 9);
      const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L ");
      const arc = document.createElementNS(SVGNS, "path");
      arc.setAttribute("d", d);
      arc.setAttribute("fill", "none");
      arc.setAttribute("stroke", "rgba(150,200,255,.5)");
      arc.setAttribute("stroke-width", "1.4");
      arc.setAttribute("stroke-linecap", "round");
      arc.setAttribute("class", "bolt");
      fx.appendChild(arc);
      setTimeout(() => arc.remove(), 540);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  function startPress(key: PowerKey) {
    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      onManage(key);
    }, 500);
  }
  function endPress(key: PowerKey, active: boolean) {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
      if (active) onOpenPower(key);
    }
  }

  return (
    <div className="stage" id="stage">
      <svg className="wires" ref={wiresRef} viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none">
        {POWER_ORDER.filter((k) => wireGeom[k]).map((k) => {
          const active = POWERS[k].kind === "active";
          return (
            <path
              key={k}
              data-key={k}
              d={wireGeom[k].d}
              fill="none"
              stroke={active ? "rgba(233,189,76,.32)" : "rgba(91,155,255,.26)"}
              strokeWidth="1.2"
            />
          );
        })}
      </svg>
      <svg className="fx" ref={fxRef} viewBox={`0 0 ${SW} ${SH}`} preserveAspectRatio="none" />
      {/* viewport-level activation overlay — paints above the drawer (z 8); px coordinate space */}
      <svg
        className="fx-over"
        ref={fxOverRef}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 60 }}
      />

      <div className="sapphire" ref={sapphireRef} onClick={pulse} title="Mordewin's Sapphire">
        <img className="gemArt" src={gemArt} alt="Mordewin's Sapphire" width={156} />
      </div>

      {POWER_ORDER.map((key) => {
        const meta = POWERS[key];
        const level = unlocked[key];
        const locked = level === 0;
        const passive = meta.kind === "passive";
        const active = meta.kind === "active" && !locked;
        const Icon = POWER_ICONS[meta.icon];
        const cls = "node" + (passive ? " passive" : "") + (locked ? " locked" : "");
        return (
          <div
            key={key}
            className={cls}
            data-node={key}
            style={{
              left: `calc(${meta.node.x}% - 42px)`,
              top: `calc(${meta.node.y}% - 36px)`,
            }}
            onPointerDown={() => startPress(key)}
            onPointerUp={() => endPress(key, active)}
            onPointerLeave={() => {
              if (pressTimer.current !== null) {
                window.clearTimeout(pressTimer.current);
                pressTimer.current = null;
              }
            }}
          >
            <div className="disc">
              <Icon size={24} stroke={1.75} />
            </div>
            <div className="nm">{shortName(key)}</div>
            <div className="pips">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={"pip2" + (passive ? " passive" : "") + (i <= level ? " on" : "")}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

function shortName(key: PowerKey): string {
  return {
    tornado: "Storm Tornado",
    thunder: "Thunder Step",
    coral: "Static Coral",
    bull: "Bull's Strength",
    stormBorn: "Storm Born",
    owl: "Owl's Wisdom",
  }[key];
}
