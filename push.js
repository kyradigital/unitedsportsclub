/* USC push notifications (shared by dashboard, padel and restaurant).
   Needs a signed-in Supabase client. On iPhone it only works when the site is saved to the home screen. */
(function () {
  const VAPID = 'BAEhv5TMgMt9-6fxauEOleFZf4D-hoQdOngfwZ0vVExSB9KOCCm9CLo1QP3jY-zdEIk0-BctSCdOrZZ0qe9gK7o';
  const root = new URL('.', document.currentScript.src).href;
  const keyBytes = b64 => { const s = atob((b64 + '='.repeat((4 - b64.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, c => c.charCodeAt(0)); };
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  async function reg() { return (await navigator.serviceWorker.getRegistration(root)) || navigator.serviceWorker.register(root + 'sw.js', { scope: root }); }
  window.USCPush = {
    supported,
    /* 'on' | 'off' | 'blocked' | 'unsupported' */
    async state() {
      if (!supported()) return 'unsupported';
      if (Notification.permission === 'denied') return 'blocked';
      const r = await reg(); const s = r && await r.pushManager.getSubscription();
      return s && Notification.permission === 'granted' ? 'on' : 'off';
    },
    async enable(sb) {
      if (!supported()) throw new Error('unsupported');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') throw new Error(perm === 'denied' ? 'blocked' : 'dismissed');
      const r = await reg(); await navigator.serviceWorker.ready;
      const sub = (await r.pushManager.getSubscription()) || await r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID) });
      const { data: { session } } = await sb.auth.getSession();
      if (!session) throw new Error('signed-out');
      const { error } = await sb.from('push_subscriptions').upsert({
        endpoint: sub.endpoint, user_id: session.user.id, p256dh: toB64(sub.getKey('p256dh')), auth: toB64(sub.getKey('auth')),
      });
      if (error) throw error;
      return 'on';
    },
    async disable(sb) {
      const r = await reg(); const s = r && await r.pushManager.getSubscription();
      if (s) { await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint); await s.unsubscribe(); }
      return 'off';
    },
  };
})();
