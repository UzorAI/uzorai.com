import { UZOR_LOOP_MODEL_VERSION, UZOR_LOOP_STAGES } from '../workflow/uzorLoopModel'

export const PERFORMANCE_VERSION = '1.0.0'
export const SUPPORTED_TEMPOS = [90, 120, 140] as const
export const BEATS_PER_BAR = 4
export const TOTAL_BARS = 32
export const DRIFT_TOLERANCE_BEATS = 0.125
export type PerformancePhase = 'orientation'|'construction'|'detail'|'resolution'
export interface PerformanceEvent { id:string; bar:number; phase:PerformancePhase; stageId?:string; phraseSlot:number }
export const PERFORMANCE_EVENTS: readonly PerformanceEvent[] = Object.freeze([
  ...Array.from({length:8},(_,i)=>({id:`orient-${i+1}`,bar:i+1,phase:'orientation' as const,phraseSlot:i+1})),
  ...Array.from({length:8},(_,i)=>({id:`construct-${i+1}`,bar:i+9,phase:'construction' as const,stageId:UZOR_LOOP_STAGES[i%UZOR_LOOP_STAGES.length].id,phraseSlot:i+1})),
  ...Array.from({length:15},(_,i)=>({id:`detail-${i+1}`,bar:i+17,phase:'detail' as const,stageId:UZOR_LOOP_STAGES[Math.floor(i/3)].id,phraseSlot:i+1})),
  {id:'resolution',bar:32,phase:'resolution',phraseSlot:1},
])
export const REPRESENTATIVE_ARTIFACT = Object.freeze({label:'Representative demo artifact',representative:true,type:'UZOR workflow plan',provenance:'Checked-in deterministic demonstration for #100',workflowVersion:UZOR_LOOP_MODEL_VERSION,fallback:'A validated workflow plan was constructed.'})
export function validatePerformanceManifest(events=PERFORMANCE_EVENTS, artifact=REPRESENTATIVE_ARTIFACT): string[] {
  const errors:string[]=[]; const bars=new Set(events.map(e=>e.bar)); const ids=new Set<string>()
  if(events.some(e=>e.bar<1||e.bar>TOTAL_BARS)) errors.push('overflow')
  for(let b=1;b<=TOTAL_BARS;b++) if(!bars.has(b)) errors.push(`missing-bar-${b}`)
  if(events.some(e=>!Number.isInteger(e.phraseSlot)||e.phraseSlot<1)) errors.push('missing-phrase-slot')
  if(events.some(e=>{if(ids.has(e.id))return true;ids.add(e.id);return false})) errors.push('duplicate-event')
  if(events.filter(e=>e.phase==='resolution').length!==1) errors.push('duplicate-payoff')
  if(!artifact.label||artifact.representative!==true||!artifact.provenance||!artifact.fallback) errors.push('unlabeled-representative-artifact')
  if(artifact.workflowVersion!==UZOR_LOOP_MODEL_VERSION) errors.push('incompatible-workflow-version')
  return errors
}
