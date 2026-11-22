// 从睡典钟楼公开前端重构；角色与素材归属保留。
const timerAudioState = {
  context: null,
  generation: 0,
};
const activeAudioNodes = new Set();
function unlockTimerAudio() {
  const e = (function () {
    if ("undefined" == typeof window) return null;
    if (timerAudioState.context && "closed" !== timerAudioState.context.state)
      return timerAudioState.context;
    const e = window.AudioContext || window.webkitAudioContext;
    if (!e) return null;
    try {
      return ((timerAudioState.context = new e()), timerAudioState.context);
    } catch {
      return null;
    }
  })();
  if (!e) return Promise.resolve(false);
  try {
    const t = "running" === e.state ? Promise.resolve() : e.resume(),
      i = e.createBufferSource();
    return (
      (i.buffer = e.createBuffer(1, 1, e.sampleRate)),
      i.connect(e.destination),
      (i.onended = () => i.disconnect()),
      i.start(),
      Promise.resolve(t).then(
        () => timerAudioState.context === e && "running" === e.state,
        () => false,
      )
    );
  } catch {
    return Promise.resolve(false);
  }
}
function playTimerChimes(e) {
  try {
    for (let t = 0; t < 3; t++) {
      const i = e.currentTime + 0.025 + 1.2 * t;
      for (const [t, a, l] of [
        [1, 0.17, 0.9],
        [2.7, 0.065, 0.7],
        [5.4, 0.025, 0.45],
      ]) {
        const n = e.createOscillator(),
          r = e.createGain(),
          o = {
            oscillator: n,
            gain: r,
          };
        activeAudioNodes.add(o);
        n.type = "sine";
        n.frequency.setValueAtTime(784 * t, i);
        r.gain.setValueAtTime(1e-4, i);
        r.gain.exponentialRampToValueAtTime(a, i + 0.008);
        r.gain.exponentialRampToValueAtTime(1e-4, i + l);
        n.connect(r);
        r.connect(e.destination);
        n.onended = () => {
          activeAudioNodes.delete(o);
          n.disconnect();
          r.disconnect();
        };
        n.start(i);
        n.stop(i + l + 0.025);
      }
    }
    return true;
  } catch {
    return (stopTimerChimes(), false);
  }
}
function stopTimerChimes() {
  timerAudioState.generation++;
  for (const { oscillator: e, gain: t } of activeAudioNodes) {
    e.onended = null;
    try {
      e.stop();
    } catch {}
    e.disconnect();
    t.disconnect();
  }
  activeAudioNodes.clear();
}
export { timerAudioState, activeAudioNodes, unlockTimerAudio, playTimerChimes, stopTimerChimes };
