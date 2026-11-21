import { z } from 'zod';

export const DAYS = ['today','tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
export const MAX_PRESETS = 8;
export const MAX_MINUTES = 43200;
export const presetSchema = z.discriminatedUnion('kind', [
  z.strictObject({kind:z.literal('after'),minutes:z.number().int().min(1).max(MAX_MINUTES)}),
  z.strictObject({kind:z.literal('at'),day:z.enum(DAYS),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)}),
]);
export const presetsSchema = z.array(presetSchema).max(MAX_PRESETS);
export const DEFAULT_PRESETS = Object.freeze([
  {kind:'after',minutes:60},{kind:'after',minutes:180},
  {kind:'at',day:'today',time:'18:00'},{kind:'at',day:'tomorrow',time:'09:00'},
  {kind:'at',day:'monday',time:'09:00'},
].map(Object.freeze));
export const presetId = (p) => p.kind === 'after' ? `after:${p.minutes}` : `at:${p.day}:${p.time}`;
const weekdays = {sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};

const pluralRulesCache = new Map();

function normalizeSnoozeLocale(locale) {
  const primary = String(locale ?? '').toLowerCase().split(/[-_]/)[0];
  return Object.hasOwn(SNOOZE_LOCALE_TEXT, primary) ? primary : 'en';
}

function pluralForm(lang, count) {
  try {
    let rules = pluralRulesCache.get(lang);
    if (!rules) {
      rules = new Intl.PluralRules(lang);
      pluralRulesCache.set(lang, rules);
    }
    return rules.select(count);
  } catch {
    return count === 1 ? 'one' : 'other';
  }
}

const SNOOZE_LOCALE_TEXT = Object.freeze({
  en: {
    after: {
      minute: { one: (n) => `In ${n} minute`, other: (n) => `In ${n} minutes` },
      hour: { one: (n) => `In ${n} hour`, other: (n) => `In ${n} hours` },
      day: { one: (n) => `In ${n} day`, other: (n) => `In ${n} days` },
    },
    morning: 'This morning', afternoon: 'This afternoon', evening: 'This evening',
    tomorrow: 'Tomorrow', nextWeek: 'Next week',
    weekdays: { sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' },
    nextWeekdays: { sunday: 'Next Sunday', monday: 'Next Monday', tuesday: 'Next Tuesday', wednesday: 'Next Wednesday', thursday: 'Next Thursday', friday: 'Next Friday', saturday: 'Next Saturday' },
  },
  zh: {
    after: { minute: { other: (n) => `${n} 分钟后` }, hour: { other: (n) => `${n} 小时后` }, day: { other: (n) => `${n} 天后` } },
    morning: '今天上午', afternoon: '今天下午', evening: '今天晚上',
    tomorrow: '明天', nextWeek: '下周',
    weekdays: { sunday: '周日', monday: '周一', tuesday: '周二', wednesday: '周三', thursday: '周四', friday: '周五', saturday: '周六' },
    nextWeekdays: { sunday: '下周日', monday: '下周一', tuesday: '下周二', wednesday: '下周三', thursday: '下周四', friday: '下周五', saturday: '下周六' },
  },
  ja: {
    after: { minute: { other: (n) => `${n} 分後` }, hour: { other: (n) => `${n} 時間後` }, day: { other: (n) => `${n} 日後` } },
    morning: '今朝', afternoon: '今日の午後', evening: '今晩',
    tomorrow: '明日', nextWeek: '来週',
    weekdays: { sunday: '日曜日', monday: '月曜日', tuesday: '火曜日', wednesday: '水曜日', thursday: '木曜日', friday: '金曜日', saturday: '土曜日' },
    nextWeekdays: { sunday: '次の日曜日', monday: '次の月曜日', tuesday: '次の火曜日', wednesday: '次の水曜日', thursday: '次の木曜日', friday: '次の金曜日', saturday: '次の土曜日' },
  },
  es: {
    after: {
      minute: { one: (n) => `En ${n} minuto`, other: (n) => `En ${n} minutos` },
      hour: { one: (n) => `En ${n} hora`, other: (n) => `En ${n} horas` },
      day: { one: (n) => `En ${n} día`, other: (n) => `En ${n} días` },
    },
    morning: 'Esta mañana', afternoon: 'Esta tarde', evening: 'Esta noche',
    tomorrow: 'Mañana', nextWeek: 'La próxima semana',
    weekdays: { sunday: 'Domingo', monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado' },
    nextWeekdays: { sunday: 'El próximo domingo', monday: 'El próximo lunes', tuesday: 'El próximo martes', wednesday: 'El próximo miércoles', thursday: 'El próximo jueves', friday: 'El próximo viernes', saturday: 'El próximo sábado' },
  },
  fr: {
    after: {
      minute: { one: (n) => `Dans ${n} minute`, other: (n) => `Dans ${n} minutes` },
      hour: { one: (n) => `Dans ${n} heure`, other: (n) => `Dans ${n} heures` },
      day: { one: (n) => `Dans ${n} jour`, other: (n) => `Dans ${n} jours` },
    },
    morning: 'Ce matin', afternoon: 'Cet après-midi', evening: 'Ce soir',
    tomorrow: 'Demain', nextWeek: 'La semaine prochaine',
    weekdays: { sunday: 'Dimanche', monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi' },
    nextWeekdays: { sunday: 'Dimanche prochain', monday: 'Lundi prochain', tuesday: 'Mardi prochain', wednesday: 'Mercredi prochain', thursday: 'Jeudi prochain', friday: 'Vendredi prochain', saturday: 'Samedi prochain' },
  },
  de: {
    after: {
      minute: { one: (n) => `In ${n} Minute`, other: (n) => `In ${n} Minuten` },
      hour: { one: (n) => `In ${n} Stunde`, other: (n) => `In ${n} Stunden` },
      day: { one: (n) => `In ${n} Tag`, other: (n) => `In ${n} Tagen` },
    },
    morning: 'Heute Vormittag', afternoon: 'Heute Nachmittag', evening: 'Heute Abend',
    tomorrow: 'Morgen', nextWeek: 'Nächste Woche',
    weekdays: { sunday: 'Sonntag', monday: 'Montag', tuesday: 'Dienstag', wednesday: 'Mittwoch', thursday: 'Donnerstag', friday: 'Freitag', saturday: 'Samstag' },
    nextWeekdays: { sunday: 'Nächsten Sonntag', monday: 'Nächsten Montag', tuesday: 'Nächsten Dienstag', wednesday: 'Nächsten Mittwoch', thursday: 'Nächsten Donnerstag', friday: 'Nächsten Freitag', saturday: 'Nächsten Samstag' },
  },
  ru: {
    after: {
      minute: { one: (n) => `Через ${n} минуту`, few: (n) => `Через ${n} минуты`, other: (n) => `Через ${n} минут` },
      hour: { one: (n) => `Через ${n} час`, few: (n) => `Через ${n} часа`, other: (n) => `Через ${n} часов` },
      day: { one: (n) => `Через ${n} день`, few: (n) => `Через ${n} дня`, other: (n) => `Через ${n} дней` },
    },
    morning: 'Сегодня утром', afternoon: 'Сегодня днём', evening: 'Сегодня вечером',
    tomorrow: 'Завтра', nextWeek: 'На следующей неделе',
    weekdays: { sunday: 'Воскресенье', monday: 'Понедельник', tuesday: 'Вторник', wednesday: 'Среда', thursday: 'Четверг', friday: 'Пятница', saturday: 'Суббота' },
    nextWeekdays: { sunday: 'В следующее воскресенье', monday: 'В следующий понедельник', tuesday: 'В следующий вторник', wednesday: 'В следующую среду', thursday: 'В следующий четверг', friday: 'В следующую пятницу', saturday: 'В следующую субботу' },
  },
  pt: {
    after: {
      minute: { one: (n) => `Em ${n} minuto`, other: (n) => `Em ${n} minutos` },
      hour: { one: (n) => `Em ${n} hora`, other: (n) => `Em ${n} horas` },
      day: { one: (n) => `Em ${n} dia`, other: (n) => `Em ${n} dias` },
    },
    morning: 'Hoje de manhã', afternoon: 'Hoje à tarde', evening: 'Hoje à noite',
    tomorrow: 'Amanhã', nextWeek: 'Na próxima semana',
    weekdays: { sunday: 'Domingo', monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira', thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado' },
    nextWeekdays: { sunday: 'No próximo domingo', monday: 'Na próxima segunda', tuesday: 'Na próxima terça', wednesday: 'Na próxima quarta', thursday: 'Na próxima quinta', friday: 'Na próxima sexta', saturday: 'No próximo sábado' },
  },
});

export function resolvePreset(preset, now = new Date(), locale) {
  const atNow = now.getTime();
  const lang = normalizeSnoozeLocale(locale);
  const copy = SNOOZE_LOCALE_TEXT[lang];
  let at, days = 0;
  if (preset.kind === 'after') at = atNow + preset.minutes * 60000;
  else {
    days = preset.day === 'today' ? 0 : preset.day === 'tomorrow' ? 1 : (weekdays[preset.day] - now.getDay() + 7) % 7 || 7;
    const wake = new Date(atNow);
    wake.setDate(wake.getDate() + days);
    wake.setHours(Number(preset.time.slice(0,2)), Number(preset.time.slice(3)), 0, 0);
    at = wake.getTime();
    if (at <= atNow) return null;
  }
  let label;
  if (preset.kind === 'after') {
    const [n, unit] = preset.minutes % 1440 === 0 ? [preset.minutes / 1440, 'day'] : preset.minutes % 60 === 0 ? [preset.minutes / 60, 'hour'] : [preset.minutes, 'minute'];
    const table = copy.after[unit];
    const form = pluralForm(lang, n);
    label = (table[form] ?? table.other)(n);
  } else if (!days) {
    const hour = Number(preset.time.slice(0,2));
    label = hour < 12 ? copy.morning : hour < 17 ? copy.afternoon : copy.evening;
  } else if (days === 1) label = copy.tomorrow;
  else if (days > 1 && preset.day === 'monday') label = copy.nextWeek;
  else label = days === 7 ? copy.nextWeekdays[preset.day] : copy.weekdays[preset.day];
  const wake = new Date(at);
  const labelNamesDay = preset.kind === 'at' && !(days > 1 && preset.day === 'monday');
  const dayPrefix = !labelNamesDay && wake.toDateString() !== now.toDateString()
    ? `${wake.toLocaleDateString(locale,{weekday:'short'})} ` : '';
  return {id:presetId(preset),label,whenLabel:dayPrefix + wake.toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit'}),at,...(preset.kind === 'after' ? {minutes:preset.minutes} : {})};
}

export function resolvePresets(presets, now = new Date(), locale) {
  const seen = new Set();
  return presets.flatMap((p) => resolvePreset(p,now,locale) ?? [])
    .sort((a,b) => Math.floor(a.at / 60000) - Math.floor(b.at / 60000))
    .filter((p) => { const key = Math.floor(p.at / 60000); if (seen.has(key)) return false; seen.add(key); return true; });
}

export function pickPreset(shown, now = Date.now()) {
  return shown.minutes ? now + shown.minutes * 60000 : shown.at > now ? shown.at : null;
}

const CUSTOM_UNIT_MS = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 };

export function localSnoozeDate(date) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function localSnoozeTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function resolveCustomSnoozeInput(input, now = new Date()) {
  let wake;
  if (input?.mode === 'duration') {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    const unitMs = CUSTOM_UNIT_MS[input.unit];
    if (!unitMs) return null;
    wake = new Date(now.getTime() + amount * unitMs);
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input?.date ?? '') || !/^\d{2}:\d{2}$/.test(input?.time ?? '')) return null;
    wake = new Date(`${input.date}T${input.time}:00`);
    // Reject rolled-over dates and nonexistent local times during DST transitions.
    if (localSnoozeDate(wake) !== input.date || localSnoozeTime(wake) !== input.time) return null;
  }
  return Number.isFinite(wake.getTime()) && wake.getTime() > now.getTime() ? wake.toISOString() : null;
}
