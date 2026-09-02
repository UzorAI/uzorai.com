import { BEATS_PER_BAR, DRIFT_TOLERANCE_BEATS, PERFORMANCE_EVENTS, TOTAL_BARS } from './uzorPerformanceManifest'
export interface Position {beat:number;bar:number;beatInBar:number;complete:boolean}
export const beatMs=(tempo:number)=>60000/tempo
export const positionAt=(elapsedMs:number,tempo:number):Position=>{const beat=Math.max(0,Math.floor(elapsedMs/beatMs(tempo)));return {beat,bar:Math.min(TOTAL_BARS,Math.floor(beat/BEATS_PER_BAR)+1),beatInBar:beat%BEATS_PER_BAR+1,complete:beat>=TOTAL_BARS*BEATS_PER_BAR}}
export const eventsThrough=(position:Position)=>PERFORMANCE_EVENTS.filter(e=>e.bar<=position.bar)
export const resync=(expectedMs:number,actualMs:number,tempo:number)=>({position:positionAt(actualMs,tempo),diagnostic:Math.abs(actualMs-expectedMs)>beatMs(tempo)*DRIFT_TOLERANCE_BEATS?'drift-resynchronized':null})
export const positionAfterInterruption=(originMs:number,resumeMs:number,tempo:number)=>positionAt(resumeMs-originMs,tempo)
