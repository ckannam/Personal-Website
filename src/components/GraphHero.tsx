import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { GraphNode, GraphLink } from '../data/graph';

type Props = { nodes: GraphNode[]; links: GraphLink[] };

const LOBE_COLOR: Record<string, string> = {
  neuro: '#c879e6',
  venture: '#3dd6c4',
  ai: '#f5b041',
  center: '#ffffff',
};

const NODE_R = (lobe: string) => (lobe === 'center' ? 9 : lobe === 'ai' ? 7 : 5.5);

export default function GraphHero({ nodes, links }: Props) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // signal-propagation reveal: edges light up over the first ~1.6s unless reduced-motion
  const [t0] = useState(() => (typeof performance !== 'undefined' ? performance.now() : 0));
  const [lit, setLit] = useState(reduced ? 1 : 0);

  // clone data so the lib can mutate x/y freely
  const data = useMemo(
    () => ({ nodes: nodes.map((n) => ({ ...n })), links: links.map((l) => ({ ...l })) }),
    [nodes, links],
  );

  // adjacency for hover highlighting
  const adj = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const n of nodes) m.set(n.id, new Set());
    for (const l of links) {
      m.get(l.source)?.add(l.target);
      m.get(l.target)?.add(l.source);
    }
    return m;
  }, [nodes, links]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / 1600);
      setLit(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, t0]);

  // spread the graph a bit so lobes separate
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-170);
    const lf = fg.d3Force('link');
    lf?.distance((l: GraphLink) => (l.source === 'cole' || (l as any).source?.id === 'cole' ? 90 : 55));
    fg.d3ReheatSimulation?.();
  }, [size.w]);

  const isActive = useCallback(
    (id: string) => !hover || hover === id || adj.get(hover)?.has(id),
    [hover, adj],
  );

  const onClick = useCallback((node: GraphNode) => {
    if (node.id === 'cole') return;
    const el = document.getElementById(`node-${node.id}`);
    el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }, [reduced]);

  if (size.w === 0) return <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }} />;

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <ForceGraph2D
        ref={fgRef as any}
        width={size.w}
        height={size.h}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTicks={120}
        enableNodeDrag={true}
        onNodeHover={(n: any) => setHover(n ? n.id : null)}
        onNodeClick={onClick as any}
        nodeRelSize={1}
        linkColor={(l: any) => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          const active = !hover || hover === src || hover === tgt;
          const spine = l.spine;
          const base = spine ? 'rgba(245,176,65,' : 'rgba(120,130,170,';
          const a = (spine ? 0.55 : 0.28) * (active ? 1 : 0.18) * (spine ? lit : 1);
          return `${base}${a})`;
        }}
        linkWidth={(l: any) => (l.spine ? 1.6 : 0.8)}
        nodeCanvasObject={(node: any, ctx, scale) => {
          const color = LOBE_COLOR[node.lobe] ?? '#888';
          const r = NODE_R(node.lobe);
          const active = isActive(node.id);
          ctx.globalAlpha = active ? 1 : 0.22;

          // glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = node.lobe === 'center' ? 22 : 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // label when zoomed-in enough or hovered/active
          if (scale > 1.2 || (hover && active)) {
            const label = node.title as string;
            ctx.font = `500 ${11 / scale}px 'General Sans', sans-serif`;
            ctx.fillStyle = '#e8eaf2';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(label, node.x, node.y + r + 3 / scale);
          }
          ctx.globalAlpha = 1;
        }}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, NODE_R(node.lobe) + 4, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
    </div>
  );
}
