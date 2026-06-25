// kissopen dashboard-demo icons — thin 2px line set (Lucide-style),
// ported from the design kit's Icons.jsx. Each is a Vue functional
// component rendering an inline SVG that inherits currentColor.
import { h, type FunctionalComponent, type VNode } from 'vue'

interface IconProps {
  size?: number | string
}

function icon(make: () => VNode | VNode[]): FunctionalComponent<IconProps> {
  const comp: FunctionalComponent<IconProps> = (props) =>
    h(
      'svg',
      {
        viewBox: '0 0 24 24',
        width: props.size ?? 20,
        height: props.size ?? 20,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      make()
    )
  return comp
}

const p = (d: string) => h('path', { d })
const rect = (x: number, y: number, w: number, ht: number, rx = 1.5) =>
  h('rect', { x, y, width: w, height: ht, rx })
const circle = (cx: number, cy: number, r: number) => h('circle', { cx, cy, r })

export const kitIcons = {
  Home: icon(() => [p('M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z')]),
  Grid: icon(() => [rect(3, 3, 7, 7), rect(14, 3, 7, 7), rect(3, 14, 7, 7), rect(14, 14, 7, 7)]),
  Bolt: icon(() => p('M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z')),
  Key: icon(() => [circle(7.5, 15.5, 4), p('M10.5 12.5L21 2M16 7l3 3M14 9l2 2')]),
  Chart: icon(() => [p('M3 3v18h18'), p('M7 14l3-4 4 3 5-7')]),
  Chat: icon(() => p('M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z')),
  Settings: icon(() => [
    circle(12, 12, 3),
    p('M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'),
  ]),
  Search: icon(() => [circle(11, 11, 7), p('M21 21l-4-4')]),
  Plus: icon(() => p('M12 5v14M5 12h14')),
  Copy: icon(() => [rect(9, 9, 11, 11, 2), p('M5 15V5a2 2 0 0 1 2-2h10')]),
  Arrow: icon(() => p('M5 12h14M13 6l6 6-6 6')),
  Send: icon(() => p('M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z')),
  Bell: icon(() => [p('M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'), p('M13.7 21a2 2 0 0 1-3.4 0')]),
  Check: icon(() => p('M20 6L9 17l-5-5')),
  Sparkle: icon(() => p('M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z')),
  Filter: icon(() => p('M3 4h18l-7 8v6l-4 2v-8L3 4z')),
  Wallet: icon(() => [rect(3, 6, 18, 14, 2.5), p('M3 10h18M16 14h2')]),
}

export type KitIconName = keyof typeof kitIcons
