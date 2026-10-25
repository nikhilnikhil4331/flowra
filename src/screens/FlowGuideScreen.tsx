import { ArrowLeft, ChevronRight, CircleAlert, Droplet } from 'lucide-react'
import { useState } from 'react'
import type { CSSProperties } from 'react'

const colourRows = [
  { id: 'bright_red', label: 'Bright Red', note: 'Usually fresh menstrual blood.', shade: '#ef4167', detail: 'Bright red flow can be common during an active period. Colour alone cannot tell you whether anything is wrong.' },
  { id: 'dark_red', label: 'Dark Red', note: 'May be older blood.', shade: '#bd263d', detail: 'Dark red flow may occur when blood has taken longer to leave the body.' },
  { id: 'brown', label: 'Brown', note: 'Often old blood at end of period.', shade: '#8d4f3e', detail: 'Brown blood can occur at the beginning or end of a period. Note any changes that feel unusual for you.' },
  { id: 'pink', label: 'Pink', note: 'May be light flow or mixed with fluids.', shade: '#ffa4b7', detail: 'Pink flow can happen when a small amount of blood mixes with other fluids.' },
  { id: 'orange', label: 'Orange', note: 'Could be due to infection or other discharge.', shade: '#f39260', detail: 'Orange or unusual discharge needs context. Odour, itching, fever, or pelvic pain are important to note.' },
  { id: 'clots', label: 'Clots', note: 'Can be normal, but large clots should be checked.', shade: '#70404a', detail: 'Small clots can happen during menstruation. Record size and frequency; seek care if heavy bleeding or other symptoms concern you.' },
  { id: 'other', label: 'Other / Unusual', note: 'Monitor with other symptoms.', shade: '#9174cc', detail: 'It is okay to mark a change as unsure. Patterns and associated symptoms are more useful than perfect labels.' },
]

export function FlowGuideScreen({ onBack, onLogFlow }: { onBack: () => void; onLogFlow: () => void }) {
  const [tab, setTab] = useState<'colour' | 'discharge'>('colour')
  const [selected, setSelected] = useState<string | undefined>()
  const rows = tab === 'colour' ? colourRows : [
    { id: 'usual', label: 'Usual discharge', note: 'Can vary over your cycle.', shade: '#ece8e2', detail: 'Normal discharge can change in amount and texture over a cycle.' },
    { id: 'unusual', label: 'New or unusual discharge', note: 'Notice odour, itching, fever or pain.', shade: '#e2c26d', detail: 'A persistent new pattern or discharge with odour, itching, fever, or pelvic pain is worth discussing with a clinician.' },
  ]
  const current = rows.find((row) => row.id === selected)
  return <div className="screen reference-screen reference-flow-guide">
    <header className="reference-page-header"><button className="reference-back" onClick={onBack} aria-label="Go back"><ArrowLeft size={16} /></button><h1>Flow Guide</h1><span className="reference-header-space" /></header>
    <div className="reference-flow-tabs" role="tablist"><button className={tab === 'colour' ? 'is-selected' : ''} onClick={() => { setTab('colour'); setSelected(undefined) }}>Color Guide</button><button className={tab === 'discharge' ? 'is-selected' : ''} onClick={() => { setTab('discharge'); setSelected(undefined) }}>Discharge Info</button></div>
    <div className="reference-flow-guide-list">{rows.map((row) => <button key={row.id} className="reference-flow-guide-row" onClick={() => setSelected((value) => value === row.id ? undefined : row.id)}><i style={{ '--swatch': row.shade } as CSSProperties} /><span><strong>{row.label}</strong><small>{row.note}</small></span><ChevronRight size={14} /></button>)}</div>
    {current && <section className="reference-flow-guide-detail"><span><Droplet size={20} fill="currentColor" /></span><div><strong>{current.label}</strong><p>{current.detail}</p></div></section>}
    <div className="reference-mini-notice reference-mini-notice--peach"><CircleAlert size={14} /><span>Flow colour alone does not diagnose a condition. Get urgent assessment for severe or sudden pain, fainting, difficulty breathing, or possible pregnancy with pain or bleeding.</span></div>
    <button className="flow-color-guide-button" onClick={onLogFlow}>Log today’s flow</button>
  </div>
}
