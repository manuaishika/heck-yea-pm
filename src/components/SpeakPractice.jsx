import { useEffect, useRef, useState } from 'react'

const LIMIT = 120 // seconds: about what an interviewer gives a first answer

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/**
 * Answer out loud: a two-minute timer that also records you, so you can hear
 * your answer back next to the model one. The recording stays in this tab —
 * it is never uploaded or saved. With no microphone (or permission refused)
 * it is a plain timer.
 */
export default function SpeakPractice() {
  const [state, setState] = useState('idle') // idle | running | done
  const [left, setLeft] = useState(LIMIT)
  const [audio, setAudio] = useState(null) // object URL of the last recording
  const [micOff, setMicOff] = useState(false)
  const recorder = useRef(null)
  const stream = useRef(null)

  function release() {
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
  }

  // count down while running; stop at zero
  useEffect(() => {
    if (state !== 'running') return undefined
    if (left <= 0) {
      stop()
      return undefined
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [state, left]) // eslint-disable-line react-hooks/exhaustive-deps

  // free the microphone and the recording when the card goes away
  useEffect(
    () => () => {
      if (recorder.current?.state === 'recording') recorder.current.stop()
      release()
    },
    []
  )
  useEffect(() => () => audio && URL.revokeObjectURL(audio), [audio])

  async function start() {
    setLeft(LIMIT)
    setAudio(null)
    setMicOff(false)
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') throw new Error('no recorder')
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      const rec = new MediaRecorder(stream.current)
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      rec.onstop = () => {
        release()
        if (chunks.length) setAudio(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })))
      }
      rec.start()
      recorder.current = rec
    } catch {
      release()
      recorder.current = null
      setMicOff(true)
    }
    setState('running')
  }

  function stop() {
    if (recorder.current?.state === 'recording') recorder.current.stop()
    recorder.current = null
    setState('done')
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {state === 'running' ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-section font-semibold tabular-nums text-text" aria-label={`${clock(left)} left`}>
            {clock(left)}
          </span>
          <span className="label" role="status">
            {micOff ? 'Timer only — microphone off' : 'Recording'}
          </span>
          <button type="button" onClick={stop} className="btn ml-auto">
            Stop
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={start} className="btn">
            {state === 'done' ? 'Answer again' : 'Answer out loud · 2:00'}
          </button>
          {state === 'done' && (
            <span className="label" role="status">
              {LIMIT - left < 60 ? `${LIMIT - left}s — short. Aim for 1–2 minutes.` : `${clock(LIMIT - left)} spoken`}
            </span>
          )}
        </div>
      )}
      {audio && state === 'done' && (
        <div className="mt-3">
          <p className="label">Your answer</p>
          <audio controls src={audio} className="mt-1 w-full" />
        </div>
      )}
      <p className="mt-2 text-label text-text-muted">Recorded in this tab only. Nothing is uploaded or saved.</p>
    </div>
  )
}
