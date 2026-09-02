import test from 'node:test';import assert from 'node:assert/strict'
import {PERFORMANCE_EVENTS,REPRESENTATIVE_ARTIFACT,validatePerformanceManifest} from '../src/client/performance/uzorPerformanceManifest.ts'
import {beatMs,positionAt,resync} from '../src/client/performance/uzorTransport.ts'
test('manifest covers 8/16/32 boundaries and resolves once',()=>{assert.deepEqual(validatePerformanceManifest(),[]);assert.equal(PERFORMANCE_EVENTS.filter(e=>e.bar===32).length,1);assert.notDeepEqual(PERFORMANCE_EVENTS.filter(e=>e.bar<=8).map(e=>e.phase),PERFORMANCE_EVENTS.filter(e=>e.bar>=9&&e.bar<=16).map(e=>e.phase));assert.match(REPRESENTATIVE_ARTIFACT.label,/Representative/)})
for(const tempo of [90,120,140])test(`clock boundaries at ${tempo}`,()=>{assert.equal(positionAt(8*4*beatMs(tempo),tempo).bar,9);assert.equal(positionAt(16*4*beatMs(tempo),tempo).bar,17);assert.equal(positionAt(32*4*beatMs(tempo),tempo).complete,true)})
test('drift resync is bounded',()=>assert.equal(resync(1000,1200,120).diagnostic,'drift-resynchronized'))
