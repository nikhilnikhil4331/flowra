import { AlertTriangle, ArrowLeft, ChevronRight, CircleAlert, Droplet, HeartHandshake, Info, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import type { FlowColor } from '../domain/types'
import { Button, Card, Notice, Pill } from '../components/ui'

const guides: Record<FlowColor, { label: string; className: string; common: string; reasons: string[]; context: string; advice: string; urgent: string }> = {
  bright_red: {
    label: 'Bright red', className: 'bright_red', common: 'Bright red blood is often associated with relatively fresh menstrual blood.', reasons: ['It can appear during active flow.', 'Flow can look different at different points in a period.'], context: 'Consider whether the amount of bleeding, pain, dizziness, or change from your usual pattern is concerning.', advice: 'Consider medical advice if bleeding is much heavier than usual, pain is new or severe, or you are worried.', urgent: 'Seek urgent care for fainting, difficulty breathing, rapidly soaked products, or possible pregnancy with pain or bleeding.',
  },
  dark_red: {
    label: 'Dark red', className: 'dark_red', common: 'Dark red menstrual blood can be common, especially when blood has taken longer to leave the uterus.', reasons: ['It may be seen at the beginning or end of a period.', 'Flow speed can change the appearance.'], context: 'Colour alone cannot tell you whether anything is wrong. Look at pain, flow amount, odour, fever, and changes from your usual pattern.', advice: 'Seek clinical advice if this comes with concerning symptoms or feels very different for you.', urgent: 'Seek urgent care for severe pain, fainting, trouble breathing, or possible pregnancy with pain or bleeding.',
  },
  brown: {
    label: 'Brown', className: 'brown', common: 'Brown blood can occur when older blood leaves the body more slowly.', reasons: ['It can occur at the start or end of a period.', 'Spotting may look brown as a small amount of blood mixes with vaginal fluid.'], context: 'Brown colour on its own does not diagnose low iron, an infection, pregnancy, or a hormonal condition.', advice: 'Discuss persistent unexpected bleeding or any symptoms that concern you with a clinician.', urgent: 'Seek urgent care if there is severe pain, fainting, heavy bleeding, or possible pregnancy with pain or bleeding.',
  },
  pink: {
    label: 'Pink', className: 'pink', common: 'Pink flow may happen when a small amount of blood mixes with other vaginal fluids.', reasons: ['It may occur as light spotting.', 'Appearance can vary over a cycle.'], context: 'Consider where you are in your cycle, whether pregnancy is possible, and whether there is pain, odour, itching, fever, or a major change for you.', advice: 'If unexpected spotting keeps happening or you are concerned, a clinician can help assess it in context.', urgent: 'If pregnancy is possible and you have pain or bleeding, seek prompt medical assessment.',
  },
  orange_unusual: {
    label: 'Orange or unusual discharge', className: 'orange_unusual', common: 'Orange or unusual-looking discharge should be interpreted in context rather than by colour alone.', reasons: ['Blood and other vaginal fluids can mix.', 'Lighting, products, or a small amount of blood can change appearance.'], context: 'Unpleasant odour, itching, fever, pelvic pain, or a new discharge pattern are important symptoms to note.', advice: 'Arrange clinical advice if it is persistent or occurs with odour, itching, fever, or pelvic pain.', urgent: 'Seek urgent care for severe pelvic pain, fever with worsening symptoms, fainting, or possible pregnancy with pain or bleeding.',
  },
  other_unsure: {
    label: 'Other or unsure', className: 'other_unsure', common: 'It is okay not to know how to describe flow colour. A log can simply say “unsure.”', reasons: ['Lighting and product materials can change how flow looks.', 'Patterns matter more than trying to label a single observation perfectly.'], context: 'Focus on what is changing, how you feel, and any associated symptoms.', advice: 'Record a short note and seek advice if a change persists or worries you.', urgent: 'Seek urgent care for severe pain, fainting, difficulty breathing, very heavy bleeding, or possible pregnancy with pain or bleeding.',
  },
}

const colors = Object.keys(guides) as FlowColor[]

export function FlowGuideScreen({ onBack, onLogFlow }: { onBack: () => void; onLogFlow: () => void }) {
  const [selected, setSelected] = useState<FlowColor>('bright_red')
  const guide = guides[selected]
  return <div className="screen screen--flow-guide">
    <header className="screen-header flow-guide-header"><Button variant="ghost" onClick={onBack}><ArrowLeft size={18} /> Back</Button><div><p className="eyebrow">Educational information</p><h1>Flow Guide</h1><p className="subtitle">A calm, contextual way to understand flow observations.</p></div></header>
    <Notice tone="info"><Info size={19} /><span><strong>Not a diagnosis.</strong> Flow colour alone cannot confirm an infection, iron deficiency, pregnancy, hormonal imbalance, or any other condition.</span></Notice>
    <Card className="flow-guide-picker"><div><p className="eyebrow">What did you notice?</p><h2>Choose a colour to explore</h2></div><div className="flow-guide-options" role="tablist" aria-label="Flow color"><div>{colors.slice(0, 3).map((color) => <button key={color} role="tab" aria-selected={selected === color} onClick={() => setSelected(color)} className={selected === color ? 'is-selected' : ''}><i className={`flow-guide-swatch flow-guide-swatch--${guides[color].className}`} />{guides[color].label}</button>)}</div><div>{colors.slice(3).map((color) => <button key={color} role="tab" aria-selected={selected === color} onClick={() => setSelected(color)} className={selected === color ? 'is-selected' : ''}><i className={`flow-guide-swatch flow-guide-swatch--${guides[color].className}`} />{guides[color].label}</button>)}</div></div></Card>
    <div className="flow-guide-layout">
      <Card className="flow-explanation-card">
        <div className="flow-explanation-card__top"><span className={`flow-guide-large flow-guide-large--${guide.className}`}><Droplet size={34} fill="currentColor" /></span><div><p className="eyebrow">{guide.label}</p><h2>What it can commonly mean</h2></div></div>
        <p className="flow-main-copy">{guide.common}</p>
        <div className="guide-section"><h3>Common reasons</h3><ul>{guide.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
        <div className="guide-section guide-section--context"><CircleAlert size={19} /><div><h3>What other symptoms matter</h3><p>{guide.context}</p></div></div>
        <div className="guide-section guide-section--advice"><HeartHandshake size={19} /><div><h3>When medical advice may be appropriate</h3><p>{guide.advice}</p></div></div>
        <div className="guide-section guide-section--urgent"><ShieldAlert size={19} /><div><h3>When urgent evaluation is needed</h3><p>{guide.urgent}</p></div></div>
        <Button onClick={onLogFlow}>Record this in today’s scorecard <ChevronRight size={17} /></Button>
      </Card>
      <aside className="flow-guide-aside"><Card><p className="eyebrow">A more useful log</p><h3>Colour is one piece of context.</h3><ol><li>Record the flow level.</li><li>Note pain, odour, itching, fever, or change from your usual pattern.</li><li>Use the safety check if bleeding feels heavy or pain is severe.</li></ol></Card><Card className="emergency-card"><AlertTriangle size={24} /><h3>Do not wait on the app if you feel seriously unwell.</h3><p>Fainting, trouble breathing, severe or rapidly worsening pain, very heavy bleeding, or possible pregnancy with pain or bleeding need prompt medical assessment.</p><Pill tone="warning">Safety comes before insights</Pill></Card></aside>
    </div>
  </div>
}
