import {useCallback,useEffect,useRef,useState} from 'react'
import {positionAt,type Position} from './uzorTransport'
import {startPulse,type PulseHandle} from './audioTransport'
export function useUzorPerformance(tempo=120,audible=false){const [started,setStarted]=useState(false);const [running,setRunning]=useState(false);const [position,setPosition]=useState<Position>(positionAt(0,tempo));const origin=useRef(0);const pulse=useRef<PulseHandle|null>(null)
 useEffect(()=>{if(!running)return; const tick=()=>{const p=positionAt(performance.now()-origin.current,tempo);setPosition(p);if(p.complete)setRunning(false)};tick();const id=setInterval(tick,50);return()=>clearInterval(id)},[running,tempo])
 useEffect(()=>{if(!running||!audible)return;let cancelled=false;const begin=()=>void startPulse(tempo).then(h=>{if(cancelled)h?.stop();else pulse.current=h});const visibility=()=>{pulse.current?.stop();pulse.current=null;if(document.visibilityState==='visible')begin()};begin();document.addEventListener('visibilitychange',visibility);return()=>{cancelled=true;document.removeEventListener('visibilitychange',visibility);pulse.current?.stop();pulse.current=null}},[running,audible,tempo])
 const start=useCallback(()=>{if(running)return;origin.current=performance.now();setStarted(true);setPosition(positionAt(0,tempo));setRunning(true)},[running,tempo]);return {started,running,position,start}}
