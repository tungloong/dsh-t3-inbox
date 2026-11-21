import assert from 'node:assert/strict';
import test from 'node:test';
import T3InboxService from '../index.js';
import { DEFAULT_PRESETS, presetsSchema, resolvePreset, resolvePresets, pickPreset } from '../lib/snooze-presets.js';

test('snooze preset limits, calendar days, deduplication, and pick time', () => {
  const oldTZ = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    assert.equal(presetsSchema.safeParse([]).success, true);
    assert.equal(presetsSchema.safeParse(Array(9).fill({kind:'after',minutes:1})).success, false);
    assert.equal(presetsSchema.safeParse([{kind:'after',minutes:43201}]).success, false);
    assert.equal(presetsSchema.safeParse([{kind:'at',day:'today',time:'24:00'}]).success, false);
    const saturday = new Date(2026,2,7,23,30);
    const tomorrow = resolvePreset({kind:'at',day:'tomorrow',time:'09:00'},saturday,'en-US');
    assert.equal(new Date(tomorrow.at).getDate(),8);
    assert.equal((tomorrow.at-saturday.getTime()) / 3600000,8.5, 'next calendar day crosses DST');
    const sunday = new Date(2026,10,15,7,1);
    const choices = resolvePresets(DEFAULT_PRESETS,sunday,'en-US');
    assert.equal(choices.filter((p) => p.label === 'Tomorrow').length,1, 'equal Monday wakes deduplicate');
    assert.equal(resolvePreset({kind:'at',day:'monday',time:'09:00'},new Date(2026,10,16,10)).at,new Date(2026,10,23,9).getTime());
    assert.equal(resolvePreset({kind:'at',day:'today',time:'09:00'},new Date(2026,10,16,10)),null);
    const duration = resolvePreset({kind:'after',minutes:30},saturday,'en-US');
    assert.equal(pickPreset(duration,saturday.getTime()+5000),saturday.getTime()+5000+30*60000);
    assert.equal(pickPreset(tomorrow,tomorrow.at),null);

    const friday = new Date(2026, 10, 13, 10, 0); // Friday 10:00
    assert.equal(resolvePreset({ kind: 'after', minutes: 45 }, friday, 'zh-CN').label, '45 分钟后');
    assert.equal(resolvePreset({ kind: 'after', minutes: 2 * 1440 }, friday, 'zh-CN').label, '2 天后');
    assert.equal(resolvePreset({ kind: 'at', day: 'today', time: '11:30' }, friday, 'zh-CN').label, '今天上午');
    assert.equal(resolvePreset({ kind: 'at', day: 'today', time: '14:00' }, friday, 'zh-CN').label, '今天下午');
    assert.equal(resolvePreset({ kind: 'at', day: 'today', time: '18:00' }, friday, 'zh-CN').label, '今天晚上');
    assert.equal(resolvePreset({ kind: 'at', day: 'tomorrow', time: '09:00' }, friday, 'zh-CN').label, '明天');
    assert.equal(resolvePreset({ kind: 'at', day: 'tuesday', time: '09:00' }, friday, 'zh-CN').label, '周二');
    const tuesday = new Date(2026, 10, 17, 10, 0);
    assert.equal(resolvePreset({ kind: 'at', day: 'tuesday', time: '09:00' }, tuesday, 'zh-CN').label, '下周二');
    const nextWeek = resolvePreset({ kind: 'at', day: 'monday', time: '09:00' }, friday, 'zh-CN');
    assert.equal(nextWeek.label, '下周');
    assert.match(nextWeek.whenLabel, /周一/);
    const zhDefaults = resolvePresets(DEFAULT_PRESETS, friday, 'zh-CN');
    assert.deepEqual(zhDefaults.map((p) => p.label), ['1 小时后', '3 小时后', '今天晚上', '明天', '下周']);

    // Multi-language presets across remaining 6 official DSH languages + plural rules.
    const multiCases = [
      ['ja', ['1 時間後', '3 時間後', '今晩', '明日', '来週'], '1 分後', '今朝', '今日の午後', '火曜日', '次の火曜日'],
      ['es', ['En 1 hora', 'En 3 horas', 'Esta noche', 'Mañana', 'La próxima semana'], 'En 1 minuto', 'Esta mañana', 'Esta tarde', 'Martes', 'El próximo martes'],
      ['fr', ['Dans 1 heure', 'Dans 3 heures', 'Ce soir', 'Demain', 'La semaine prochaine'], 'Dans 1 minute', 'Ce matin', 'Cet après-midi', 'Mardi', 'Mardi prochain'],
      ['de', ['In 1 Stunde', 'In 3 Stunden', 'Heute Abend', 'Morgen', 'Nächste Woche'], 'In 1 Minute', 'Heute Vormittag', 'Heute Nachmittag', 'Dienstag', 'Nächsten Dienstag'],
      ['ru', ['Через 1 час', 'Через 3 часа', 'Сегодня вечером', 'Завтра', 'На следующей неделе'], 'Через 1 минуту', 'Сегодня утром', 'Сегодня днём', 'Вторник', 'В следующий вторник'],
      ['pt-BR', ['Em 1 hora', 'Em 3 horas', 'Hoje à noite', 'Amanhã', 'Na próxima semana'], 'Em 1 minuto', 'Hoje de manhã', 'Hoje à tarde', 'Terça-feira', 'Na próxima terça'],
    ];
    for (const [loc, expectedDefaults, min1, morning, afternoon, tue, nextTue] of multiCases) {
      assert.deepEqual(resolvePresets(DEFAULT_PRESETS, friday, loc).map((p) => p.label), expectedDefaults, `defaults for ${loc}`);
      assert.equal(resolvePreset({ kind: 'after', minutes: 1 }, friday, loc).label, min1);
      assert.equal(resolvePreset({ kind: 'at', day: 'today', time: '11:30' }, friday, loc).label, morning);
      assert.equal(resolvePreset({ kind: 'at', day: 'today', time: '14:00' }, friday, loc).label, afternoon);
      assert.equal(resolvePreset({ kind: 'at', day: 'tuesday', time: '09:00' }, friday, loc).label, tue);
      assert.equal(resolvePreset({ kind: 'at', day: 'tuesday', time: '09:00' }, tuesday, loc).label, nextTue);
      const nw = resolvePreset({ kind: 'at', day: 'monday', time: '09:00' }, friday, loc);
      const expectedShortMon = new Date(2026, 10, 16, 9, 0).toLocaleDateString(loc, { weekday: 'short' });
      assert.ok(nw.whenLabel.startsWith(`${expectedShortMon} `), `expected Next week dayPrefix "${expectedShortMon}" for ${loc}, got "${nw.whenLabel}"`);
    }

    // Russian 3-way plural forms (one / few / many) for minutes, hours, days.
    assert.equal(resolvePreset({ kind: 'after', minutes: 2 }, friday, 'ru').label, 'Через 2 минуты');
    assert.equal(resolvePreset({ kind: 'after', minutes: 5 }, friday, 'ru').label, 'Через 5 минут');
    assert.equal(resolvePreset({ kind: 'after', minutes: 21 }, friday, 'ru').label, 'Через 21 минуту');
    assert.equal(resolvePreset({ kind: 'after', minutes: 5 * 60 }, friday, 'ru').label, 'Через 5 часов');
    assert.equal(resolvePreset({ kind: 'after', minutes: 21 * 60 }, friday, 'ru').label, 'Через 21 час');
    assert.equal(resolvePreset({ kind: 'after', minutes: 22 * 60 }, friday, 'ru').label, 'Через 22 часа');
    assert.equal(resolvePreset({ kind: 'after', minutes: 1 * 1440 }, friday, 'ru').label, 'Через 1 день');
    assert.equal(resolvePreset({ kind: 'after', minutes: 2 * 1440 }, friday, 'ru').label, 'Через 2 дня');
    assert.equal(resolvePreset({ kind: 'after', minutes: 5 * 1440 }, friday, 'ru').label, 'Через 5 дней');
    assert.equal(resolvePreset({ kind: 'after', minutes: 2 * 1440 }, friday, 'de').label, 'In 2 Tagen');
  } finally { if (oldTZ === undefined) delete process.env.TZ; else process.env.TZ = oldTZ; }
});

test('profile snooze settings persist independently, serialize CAS, and report damaged data', async () => {
  let raw;
  let queue = Promise.resolve();
  let puts = 0;
  const enqueue = (fn) => { const next = queue.then(fn); queue = next.catch(() => {}); return next; };
  const table = {
    get:() => raw,
    put(_id,value) { puts++; return enqueue(() => { raw = structuredClone(value); }); },
    update(_id,fn) { return enqueue(() => { if (raw === undefined) throw new Error('missing-key'); raw = structuredClone(fn(raw)); }); },
  };
  const host = Object.create(T3InboxService.prototype);
  host.ctx = {invocation:{peer:{principal:{kind:'owner'}}}};
  host.settingsDomain = {table:() => table};
  host.refresh = async () => {};
  const first = host.readSnoozeSettings();
  assert.deepEqual(first.presets,DEFAULT_PRESETS);
  await assert.rejects(table.update('snooze-presets',() => ({})),/missing-key/, 'storage update cannot create a record');
  const signal = new AbortController().signal;
  const [a,b] = await Promise.all([
    host.saveSnoozeSettings({revision:0,presets:[]},signal),
    host.saveSnoozeSettings({revision:0,presets:[{kind:'after',minutes:30}]},signal),
  ]);
  assert.equal(a.status,'committed'); assert.equal(b.status,'stale');
  assert.equal(puts,1,'concurrent first saves share one durable initialization');
  assert.deepEqual(host.readSnoozeSettings().presets,[]);
  assert.equal(host.readSnoozeSettings().revision,1);
  raw = {revision:'damaged',presets:[]};
  assert.match(host.readSnoozeSettings().error,/could not be read/);
  assert.deepEqual(host.readSnoozeSettings().presets,DEFAULT_PRESETS);
  const repaired = await host.saveSnoozeSettings({revision:0,presets:DEFAULT_PRESETS},signal);
  assert.equal(repaired.status,'committed'); assert.equal(repaired.settings.error,null);
  host.ctx.invocation.peer.principal.kind = 'guest';
  await assert.rejects(host.saveSnoozeSettings({revision:1,presets:[]},signal),/owner/i);
});

test('resolveCustomSnoozeInput validates past, rolled-over, DST gap, and fractional durations', async () => {
  const { localSnoozeDate, localSnoozeTime, resolveCustomSnoozeInput } = await import('../lib/snooze-presets.js');
  assert.equal(localSnoozeDate(new Date(2026, 2, 8, 9, 5)), '2026-03-08');
  assert.equal(localSnoozeTime(new Date(2026, 2, 8, 9, 5)), '09:05');

  const now = new Date(2026, 5, 10, 12, 0, 0, 0);
  assert.equal(resolveCustomSnoozeInput({ mode: 'date', date: '2026-06-10', time: '12:00' }, now), null);
  assert.equal(resolveCustomSnoozeInput({ mode: 'date', date: '2026-06-10', time: '11:59' }, now), null);
  assert.equal(resolveCustomSnoozeInput({ mode: 'date', date: '2026-02-30', time: '10:00' }, now), null);
  const validDateIso = resolveCustomSnoozeInput({ mode: 'date', date: '2026-06-10', time: '13:30' }, now);
  assert.equal(Date.parse(validDateIso), new Date(2026, 5, 10, 13, 30, 0, 0).getTime());

  assert.equal(resolveCustomSnoozeInput({ mode: 'duration', amount: 0, unit: 'hours' }, now), null);
  assert.equal(resolveCustomSnoozeInput({ mode: 'duration', amount: -2, unit: 'minutes' }, now), null);
  assert.equal(resolveCustomSnoozeInput({ mode: 'duration', amount: 1.5, unit: 'years' }, now), null);
  const validDurationIso = resolveCustomSnoozeInput({ mode: 'duration', amount: 1.5, unit: 'hours' }, now);
  assert.equal(Date.parse(validDurationIso), now.getTime() + 90 * 60_000);

  const prevTz = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    const beforeSpringForward = new Date('2026-03-08T06:00:00.000Z'); // 01:00 EST
    assert.equal(resolveCustomSnoozeInput({ mode: 'date', date: '2026-03-08', time: '02:30' }, beforeSpringForward), null);
    assert.ok(resolveCustomSnoozeInput({ mode: 'date', date: '2026-03-08', time: '03:30' }, beforeSpringForward));
  } finally {
    if (prevTz === undefined) delete process.env.TZ;
    else process.env.TZ = prevTz;
  }
});
