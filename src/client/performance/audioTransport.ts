export interface PulseHandle { stop(): void }
export async function startPulse(tempo:number):Promise<PulseHandle|null>{
  const Ctx=window.AudioContext
  if(!Ctx)return null
  try{const ctx=new Ctx();await ctx.resume();const interval=60000/tempo;let timer=0
    const pulse=()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=60;g.gain.setValueAtTime(.035,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.06);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.07)}
    pulse();timer=window.setInterval(pulse,interval);return{stop(){clearInterval(timer);void ctx.close()}}
  }catch{return null}
}
