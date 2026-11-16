import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import type { GraphNode, GraphLink } from '../data/graph';

type Props = { nodes: GraphNode[]; links: GraphLink[] };

// muted lobe fills (match global.css)
const LOBE_COLOR: Record<string, string> = {
  neuro: '#8b5cf6',
  venture: '#0fb5a5',
  ai: '#e0912f',
  center: '#14161b',
};

const NODE_R = (lobe: string) => (lobe === 'center' ? 7.5 : lobe === 'ai' ? 6 : 5);

export default function GraphHero({ nodes, links }: Props) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const data = useMemo(
    () => ({ nodes: nodes.map((n) => ({ ...n })), links: links.map((l) => ({ ...l })) }),
    [nodes, links],
  );

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

  // spread lobes, then let it settle and stop (calm — no perpetual drift)
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-120);
    const lf = fg.d3Force('link');
    lf?.distance((l: any) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      return s === 'cole' ? 70 : 42;
    });
  }, [size.w]);

  const isActive = useCallback(
    (id: string) => !hover || hover === id || adj.get(hover)?.has(id),
    [hover, adj],
  );

  const onClick = useCallback(
    (node: GraphNode) => {
      if (node.id === 'cole') return;
      document
        .getElementById(`node-${node.id}`)
        ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    },
    [reduced],
  );

  if (size.w === 0) return <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }} />;

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <ForceGraph2D
        ref={fgRef as any}
        width={size.w}
        height={size.h}
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        cooldownTicks={reduced ? 0 : 90}
        warmupTicks={reduced ? 120 : 0}
        d3AlphaDecay={0.05}
        enableNodeDrag={true}
        onEngineStop={() => fgRef.current?.zoomToFit(reduced ? 0 : 400, 56)}
        onNodeHover={(n: any) => setHover(n ? n.id : null)}
        onNodeClick={onClick as any}
        nodeRelSize={1}
        linkColor={(l: any) => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          const active = !hover || hover === src || hover === tgt;
          return active ? 'rgba(120,128,142,0.45)' : 'rgba(120,128,142,0.12)';
        }}
        linkWidth={(l: any) => (l.spine ? 1.3 : 0.8)}
        nodeCanvasObject={(node: any, ctx, scale) => {
          const color = LOBE_COLOR[node.lobe] ?? '#888';
          const r = NODE_R(node.lobe);
          const active = isActive(node.id);
          ctx.globalAlpha = active ? 1 : 0.28;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          // thin ring for crispness on light bg
          ctx.lineWidth = 1 / scale;
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.stroke();

          // calm default: only the center is labelled; hovering reveals a node + its neighbours
          const showLabel = node.lobe === 'center' || (hover && active);
          if (showLabel) {
            ctx.font = `500 ${11 / scale}px 'General Sans', sans-serif`;
            ctx.fillStyle = '#14161b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(node.title as string, node.x, node.y + r + 3 / scale);
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
