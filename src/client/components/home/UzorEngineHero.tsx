import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import markUrl from '../../brand/uzor-mark.svg'
import { useLocale } from '../../i18n/LocaleProvider'
import { dirFor } from '../../config/languages'
import { getPresentationSequence } from '../../workflow/uzorLoopModel'
import {
  UZOR_GO_MANIFEST,
  DEFAULT_SOUND_PREF,
  readSoundPref,
  toggleSoundPref,
  writeSoundPref,
} from '../../content/uzorEngineDemo'
import './UzorEngineHero.css'
import { useUzorPerformance } from '../../performance/useUzorPerformance'
import { PERFORMANCE_EVENTS, REPRESENTATIVE_ARTIFACT } from '../../performance/uzorPerformanceManifest'

// Staging-only hero (FEAT #98, Phase 2 of EPIC #69/#70). Only mounted when
// src/client/config/heroMode.ts resolves 'engine' — Home.tsx owns that gate,
// so this component can assume it is on an approved staging host and a
// valid canonical model. It still fails closed internally: a missing
// manifest entry renders no detail copy rather than throwing, and the
// cycle's own state machine (src/client/content/uzorEngineDemo.ts) rejects
// overlapping starts and never grows past the manifest length.
export default function UzorEngineHero() {
  const { t, locale } = useLocale()
  const dir = dirFor(locale)

  // Derived from the canonical model, never an independently authored
  // sequence (AC1). RTL changes `dir` metadata only — the id order below is
  // identical to LTR (uzorLoopModel.ts / test/uzor-loop-model.test.mjs).
  const stages = useMemo(() => getPresentationSequence(dir), [dir])

  const [soundPref, setSoundPref] = useState(DEFAULT_SOUND_PREF)
  const performanceRun = useUzorPerformance(120, soundPref === 'unmuted')

  useEffect(() => {
    setSoundPref(readSoundPref())
  }, [])

  const handleStart = useCallback(() => {
    performanceRun.start()
  }, [performanceRun])

  const handleToggleSound = useCallback(() => {
    setSoundPref((prev) => {
      const next = toggleSoundPref(prev)
      writeSoundPref(next)
      return next
    })
  }, [])

  const revealedCount = !performanceRun.started ? 0 : performanceRun.position.bar <= 8 ? 0 : Math.min(stages.length, Math.ceil((performanceRun.position.bar - 8) * stages.length / 8))
  const activeEvent = PERFORMANCE_EVENTS.filter((event)=>event.bar<=performanceRun.position.bar && event.stageId).at(-1)
  const activeStage = UZOR_GO_MANIFEST.find((stage)=>stage.id===activeEvent?.stageId) ?? null
  const activeCanonicalLabel =
    activeStage != null
      ? stages.find((stage) => stage.id === activeStage.id)?.label ?? ''
      : ''

  // A single announcement channel — this element is both the visible status
  // text and the only aria-live region, so nothing here is announced twice.
  const liveText =
    !performanceRun.started
      ? t('home.engine.status.idle')
      : performanceRun.position.complete
        ? t('home.engine.status.complete')
        : `${t('home.engine.status.buildingPrefix')} ${activeCanonicalLabel}`

  return (
    <section className="uzor-engine-hero" aria-labelledby="uzor-engine-heading">
      <div className="uzor-engine-token-wrap">
        <img src={markUrl} alt="" aria-hidden="true" className="uzor-engine-token" />
      </div>
      <div className="uzor-engine-content">
        <p className="mono uzor-engine-eyebrow">{t('home.eyebrow')}</p>
        <h2 id="uzor-engine-heading" className="uzor-engine-heading">
          {t('home.engine.heading')}
        </h2>
        <p className="uzor-engine-subhead">{t('home.engine.subhead')}</p>

        <div className="uzor-engine-controls">
          <button type="button" className="uzor-engine-btn uzor-engine-btn-primary" onClick={handleStart}>
            {performanceRun.running ? t('home.engine.go.running') : t('home.engine.go.start')}
          </button>
          <button
            type="button"
            className="uzor-engine-btn"
            onClick={handleToggleSound}
            aria-pressed={soundPref === 'unmuted'}
            aria-label={
              soundPref === 'muted' ? t('home.engine.sound.toggleToUnmute') : t('home.engine.sound.toggleToMute')
            }
          >
            {soundPref === 'muted' ? t('home.engine.sound.stateMuted') : t('home.engine.sound.stateUnmuted')}
          </button>
        </div>

        <h3 className="uzor-engine-bricks-heading">{t('home.engine.bricks.heading')}</h3>
        <ol className="uzor-engine-bricks">
          {stages.map((stage, index) => (
            <li
              key={stage.id}
              className="uzor-engine-brick"
              data-revealed={index < revealedCount}
              style={{ '--brick-index': index } as CSSProperties}
            >
              {stage.label}
            </li>
          ))}
        </ol>

        <p className="uzor-engine-status" role="status" aria-live="polite">
          {liveText}
        </p>
        <p className="uzor-engine-detail">Bar {performanceRun.position.bar} · Beat {performanceRun.position.beatInBar} · {PERFORMANCE_EVENTS.find((event) => event.bar === performanceRun.position.bar)?.phase ?? 'orientation'}</p>
        {activeStage != null && <p className="uzor-engine-detail">{t(activeStage.detailKey)}</p>}

        {performanceRun.position.complete && (
          <div className="uzor-engine-payoff">
            <strong>{REPRESENTATIVE_ARTIFACT.label}</strong>
            <span>{REPRESENTATIVE_ARTIFACT.type} · model {REPRESENTATIVE_ARTIFACT.workflowVersion}</span>
            <p>{t('home.engine.payoff.1')}</p>
            <p>{t('home.engine.payoff.2')}</p>
            <p>{t('home.engine.payoff.3')}</p>
          </div>
        )}
      </div>
    </section>
  )
}
