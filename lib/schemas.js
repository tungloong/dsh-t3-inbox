import { z } from 'zod';
import { presetsSchema } from './snooze-presets.js';

export const snoozeSettings = z.strictObject({revision:z.number().int().nonnegative(),presets:presetsSchema,error:z.string().nullable()});
export const saveSnoozeSettingsRequest = z.strictObject({revision:z.number().int().nonnegative(),presets:presetsSchema});
export const saveSnoozeSettingsResult = z.strictObject({status:z.enum(['committed','stale']),settings:snoozeSettings});

export const point = z.strictObject({
  seq: z.number().int().nonnegative(),
  time: z.number().finite(),
  sessionId: z.string(),
  kind: z.string(),
  turn: z.number().optional(),
  reason: z.unknown().optional(),
  messageId: z.string().optional(),
});
export const optionalPoint = point.nullable();
export const progress = z.strictObject({
  sessionId: z.string(),
  inheritedEventCount: z.number().int().nonnegative(),
  latestWork: optionalPoint,
  latestResult: optionalPoint,
  latestFailure: optionalPoint,
  latestHumanInput: optionalPoint,
  turn: z.strictObject({ start: optionalPoint, end: optionalPoint }).nullable(),
  route: z.strictObject({
    provider: z.string().nullable(),
    model: z.string().nullable(),
    seq: z.number().int().nonnegative(),
    time: z.number().int().nonnegative(),
  }).nullable().optional(),
  providerHistory: z.array(z.strictObject({ provider:z.string().min(1), model:z.string().nullable() })).optional(),
});
export const questionIdentity = z.strictObject({
  sessionId: z.string().min(1),
  generation: z.string().min(1),
  continuityKey: z.string().min(1),
  contentVersion: z.string().min(1),
});
export const wokeAcknowledgement = z.strictObject({ instanceId: z.string(), at: z.number() });
export const snooze = z.strictObject({
  instanceId: z.string().min(1),
  startedAt: z.number(),
  until: z.string().datetime(),
  failureBaseline: z.record(z.string(), point),
  inputBaseline: z.record(z.string(), point),
  deferredQuestions: z.array(questionIdentity),
  wokeAcknowledged: wokeAcknowledgement.nullable(),
});
export const beforeMutation = z.strictObject({
  settledThrough: z.record(z.string(), point),
  settledAt: z.number().nullable(),
  settledOverride: z.enum(['settled', 'active']).nullable().optional(),
  unsettledAt: z.number().nullable().optional(),
  snooze: snooze.nullable(),
  unreadAt: z.number().nullable().optional(),
});
export const cachedMember = z.strictObject({
  progress,
  label: z.string(),
  title: z.string().optional(),
  runtime: z.strictObject({
    running: z.boolean(), queue: z.array(z.json()).nullable(),
    startedAt: z.number().nullable(), completeness: z.enum(['complete', 'unavailable']),
  }),
  pending: z.array(z.strictObject({ sessionId: z.string(), kind: z.enum(['approval', 'question', 'other']), identity: questionIdentity.nullable() })),
  lastSeenGeneration: z.string(),
});
export const operation = z.strictObject({
  id: z.string().min(1),
  kind: z.enum(['settle', 'restore', 'snooze', 'wake', 'ack-woke', 'undo', 'mark-unread', 'clear-unread']),
  requestHash: z.string(),
  committedAt: z.number(),
  revision: z.number().int().nonnegative(),
  result: z.literal('committed'),
  receipt: z.strictObject({
    operationId: z.string(),
    committedAt: z.number(),
    expiresAt: z.number(),
    revision: z.number().int().nonnegative(),
    before: beforeMutation,
  }),
});
export const record = z.strictObject({
  revision: z.number().int().nonnegative(),
  settledThrough: z.record(z.string(), point),
  settledAt: z.number().nullable(),
  settledOverride: z.enum(['settled', 'active']).nullable().optional(),
  unsettledAt: z.number().nullable().optional(),
  enrollment: z.strictObject({ at: z.number(), baseline: z.record(z.string(), point), version: z.literal(1) }),
  knownMembers: z.record(z.string(), cachedMember).default({}),
  snooze: snooze.nullable(),
  unreadAt: z.number().nullable().optional(),
  operations: z.array(operation),
});
export const actionRequest = z.strictObject({
  sessionId: z.string().min(1).max(256),
  operationId: z.string().min(8).max(128),
  revision: z.number().int().nonnegative(),
  context: z.string().min(1).max(100_000),
  kind: z.enum(['settle', 'restore', 'snooze', 'wake', 'ack-woke', 'undo', 'mark-unread', 'clear-unread']),
  until: z.string().datetime().optional(),
  targetOperationId: z.string().min(8).max(128).optional(),
  at: z.number().int().positive().max(8_640_000_000_000_000).optional(),
});
export const pinRequest = z.strictObject({ sessionId: z.string().min(1).max(256), pinned: z.boolean() });
export const prepareRequest = z.strictObject({ sessionId: z.string().min(1).max(256) });
export const prepareResult = z.strictObject({
  status: z.enum(['ready', 'unavailable', 'not-found']),
  message: z.string().optional(),
});
export const emptyRequest = z.strictObject({});
export const snapshot = z.strictObject({
  schemaVersion: z.literal(1),
  generation: z.string(),
  revision: z.number().int().nonnegative(),
  phase: z.enum(['building', 'ready', 'unavailable']),
  error: z.string().nullable(),
  cards: z.array(z.json()),
  receipts: z.array(z.json()),
  snoozeSettings: snoozeSettings.optional(),
  capabilities: z.strictObject({ pendingIdentity: z.boolean(), durableTree: z.boolean(), awaitedWork: z.boolean() }),
});
export const actionResult = z.strictObject({
  status: z.enum(['committed', 'stale', 'not-eligible', 'unavailable', 'not-found']),
  operationId: z.string(),
  revision: z.number().int().nonnegative(),
  effect: z.enum(['effective', 'superseded', 'temporarily-revealed', 'unchanged']).nullable(),
  message: z.string().optional(),
  receipt: z.json().optional(),
});
