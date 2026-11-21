window.__ModuleLoader__.load({
  id: 'dsh-t3-inbox',
  factory(require) {
    const React = require('react');
    const { z } = require('zod');
    const hostUI = (() => {
      try { return require('@deepseek-ai/dsh-client-ui-primitives'); }
      catch { return {}; }
    })();
    const h = React.createElement;
    const INBOX_SETTINGS_ID = 't3-inbox-threads';
    const INBOX_PANEL_ID = 't3-inbox';
    const SIDEBAR_APPEARANCE_KEY = 'dsh-t3-inbox:sidebar-appearance';
    const GLOBAL_PANELS_KEY = 'dsh-t3-inbox:global-panels';
    const MAX_FOOTER_PANELS = 3;
    const DEFAULT_SIDEBAR_APPEARANCE = { mode:'host', light:'#fafafa', dark:'#000000' };
    const NS = 'dsh-t3-inbox';

    const en = {
      inbox: 'Inbox',
      inboxView: 'Inbox View',
      workspacesView: 'Workspaces View',
      expandInbox: 'Expand Inbox',
      search: 'Search',
      searchThreads: 'Search threads',
      searchResults: 'Thread search results',
      newSession: 'New thread',
      needsYou: 'Input',
      working: 'Working',
      snoozed: 'Snoozed',
      settled: 'Settled',
      pinned: 'Pinned',
      active: 'Active',
      all: 'All projects',
      filterWorkspace: 'Filter threads by project',
      filterWorkspaceSelected: 'Filter threads by project: {projects}',
      searchProjects: 'Search projects…',
      addProject: 'Add project',
      noProjects: 'No matching projects.',
      addProjectUnavailable: 'Add project is unavailable in this mode.',
      empty: 'No threads yet',
      emptySearch: 'No threads found',
      clearSearch: 'Clear thread search',
      noProjectsYet: 'No projects yet',
      noThreadsYet: 'No threads yet',
      noThreadsInProjects: 'No threads in these projects yet',
      noThreadsInProject: 'No threads in {name} yet',
      running: 'Working',
      idle: 'Idle',
      showMore: 'Show {count} more',
      hideMore: 'Hide settled',
      sessionActions: 'Thread actions',
      settle: 'Settle',
      restore: 'Un-settle thread',
      wake: 'Wake',
      wakeNow: 'Wake thread now',
      pin: 'Pin',
      unpin: 'Unpin',
      unpinThread: 'Unpin thread',
      dropPin: 'Pin',
      dropUnpin: 'Unpin',
      dropSettle: 'Settle',
      dropUnsettle: 'Un-settle',
      dropWake: 'Wake',
      undo: 'Undo',
      undoButtonPlain: 'Undo',
      settledNotice: 'Thread settled',
      snoozedNotice: 'Thread snoozed',
      restoredNotice: 'Thread un-settled',
      wakeNotice: 'Thread woken',
      oneHour: 'In 1 hour',
      threeHours: 'In 3 hours',
      thisMorning: 'This morning',
      thisAfternoon: 'This afternoon',
      thisEvening: 'This evening',
      tomorrow: 'Tomorrow',
      nextWeek: 'Next week',
      snoozeInMinute: 'In {count} minute',
      snoozeInMinutes: 'In {count} minutes',
      snoozeInHour: 'In {count} hour',
      snoozeInHours: 'In {count} hours',
      snoozeInDay: 'In {count} day',
      snoozeInDays: 'In {count} days',
      snoozeTimePassed: 'That snooze time has passed. Choose another time.',
      woke: 'Woke',
      deferred: 'Deferred',
      childResult: 'Subagent result',
      actionFailed: 'Inbox action failed',
      noCandidate: 'No more active threads',
      dismiss: 'Dismiss',
      errorOccurred: 'Error occurred',
      errSettleTitle: 'Failed to settle thread',
      errUnsettleTitle: 'Failed to un-settle thread',
      errSnoozeTitle: 'Failed to snooze thread',
      errWakeTitle: 'Failed to wake thread',
      errUnreadTitle: 'Failed to update unread state',
      errPinTitle: 'Failed to pin thread',
      errUnpinTitle: 'Failed to unpin thread',
      errUndoTitle: 'Failed to undo action',
      errAddProjectTitle: 'Failed to add project',
      errRenameTitle: 'Failed to rename thread',
      errArchiveTitle: 'Failed to archive thread',
      errRefreshTitle: 'Unable to refresh threads',
      errActionGeneric: 'Something went wrong. Please try again.',
      errStaleContext: 'This thread changed before the action could complete. Please try again.',
      errRefreshDesc: 'Try again in a moment.',
      errSessionMissing: 'That thread is no longer available.',
      settleSession: 'Settle thread',
      unsettleSession: 'Un-settle thread',
      snoozeAction: 'Snooze',
      snoozeSession: 'Snooze thread',
      wakeSession: 'Wake thread',
      markUnread: 'Mark unread',
      filterBy: 'Filter by {name}',
      showAllProjects: 'Show all projects',
      settingsUnavailable: 'Settings is reachable after switching to Sessions mode.',
      approval: 'Approval',
      failed: 'Failed',
      limited: 'Limited',
      waiting: 'Waiting',
      request: 'Request',
      done: 'Done',
      dismissWoke: 'Dismiss Woke notification',
      usageLimitReached: 'Usage limit reached',
      customSnooze: 'Custom…',
      customSnoozeTitle: 'Schedule type',
      customSnoozeConfirm: 'Snooze',
      customSnoozeCancel: 'Cancel',
      customSnoozeDialog: 'Custom snooze',
      customSnoozeHelp: 'Choose when snoozed threads return to your inbox.',
      chooseSnoozeDate: 'Choose snooze date',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      snoozeDateLabel: 'Date',
      snoozeTimeLabel: 'Time',
      snoozeModeDate: 'Date and time',
      snoozeModeDuration: 'Duration',
      snoozeAmount: 'Snooze for',
      snoozeUnit: 'Unit',
      decreaseDuration: 'Decrease duration',
      increaseDuration: 'Increase duration',
      editSnoozeOptions: 'Edit snooze options',
      close: 'Close',
      unitMinutes: 'Minutes',
      unitHours: 'Hours',
      unitDays: 'Days',
      durationInvalid: 'Enter a positive duration.',
      snoozeInvalid: 'Choose a valid date and time in the future.',
      workingFor: 'for {time}',
      timeNow: 'now',
      timeMinutes: '{count}m',
      timeHours: '{count}h',
      timeDays: '{count}d',
      elapsedSeconds: '{count}s',
      elapsedMinutes: '{count}m',
      elapsedHoursMinutes: '{hours}h {minutes}m',
      wakeNowLabel: 'now',
      wakeMinutes: '{count}m',
      wakeHours: '{count}h',
      wakeDays: '{count}d',
      actionBusy: 'An inbox action is already in progress',
      settleBusy: 'Settle is unavailable while the thread is working',
      settleNeedsYou: 'Settle is unavailable while input is pending',
      settleNotReady: 'Nothing new to settle yet',
      snoozeNotReady: 'Snooze needs a complete idle thread with no queued work',
      cmdPreviousThread: 'Previous thread',
      cmdNextThread: 'Next thread',
      cmdSettleThread: 'Toggle settle thread',
      cmdPinThread: 'Toggle pin thread',
      cmdJumpThread: 'Jump to thread {index}',
      undoSettled: 'Settled',
      undoSnoozed: 'Snoozed',
      undoUnpinned: 'Unpinned',
      undoSettledOne: 'Settled,',
      undoSettledMany: 'Settled {count},',
      undoSnoozedOne: 'Snoozed,',
      undoSnoozedMany: 'Snoozed {count},',
      undoUnpinnedOne: 'Unpinned,',
      undoUnpinnedMany: 'Unpinned {count},',
      undoToUndo: '{shortcut} to undo',
      undoScreenSummary: '{action} {count} thread{plural}',
      unpinBatch: 'Unpin ({count})',
      settleBatch: 'Settle ({count})',
      unsettleBatch: 'Un-settle ({count})',
      wakeBatch: 'Wake ({count})',
      snoozeBatch: 'Snooze ({count})',
      markUnreadBatch: 'Mark unread ({count})',
      archiveBatch: 'Archive ({count})',
      sweepSettle: 'Settle',
      sweepUnsettle: 'Un-settle',
      sweepWake: 'Wake',
      batchActions: 'Batch thread actions',
      customSnoozeBatchHelp: 'Choose when {count} snoozed threads return to the inbox.',
      threadTitle: 'Thread title',
      newThreadInTitle: 'New thread in…',
      newThreadInHint: 'New thread in current project: Shift+click',
      worktreeLabel: 'Worktree: {branch}',
      inboxSettings: 'T3 Inbox settings',
      settings: 'Settings',
      sidebarView: 'Sidebar view',
      sidebarBackground: 'Background',
      sidebarBackgroundDesc: 'Follow the current DSH theme or choose colors for this sidebar.',
      sidebarBackgroundT3: 'T3 colors',
      sidebarBackgroundHost: 'DSH theme (default)',
      sidebarBackgroundCustom: 'Custom colors',
      sidebarLightColor: 'Light mode color',
      sidebarDarkColor: 'Dark mode color',
      settingsAppearanceSection: 'Appearance & layout',
      settingsBehaviorSection: 'Inbox behavior',
      globalPanelsLabel: 'Global panels',
      globalPanelsDesc: 'Choose where Plugins, Automation tasks, and other global panels appear.',
      globalPanelsFooter: 'Footer (Default)',
      globalPanelsTop: 'Top',
      globalPanelsHidden: 'Hidden',
      moreGlobalPanels: 'More panels',
      workingShelfLabel: 'Working section',
      workingShelfDesc: 'Fold working and waiting threads into a Working section. Unread completions return to Inbox.',
      timeFormatLabel: 'Time format',
      timeFormatDesc: 'Applies to wake times shown in the Snooze menu. System default follows your OS clock.',
      timeFormatLocale: 'System default',
      timeFormat12: '12-hour',
      timeFormat24: '24-hour',
      snoozeOptionsTitle: 'Snooze shortcuts',
      snoozeOptionsHelp: 'Choose the times shown in the Snooze menu.',
      editShortcuts: 'Edit shortcuts',
      hideShortcuts: 'Hide shortcuts',
      editOption: 'Edit',
      doneEditingOption: 'Done',
      removeOption: 'Remove',
      resetLabel: 'Reset',
      addOption: '+ Add option',
      maxOptionsHint: 'Up to 8 options',
      snoozeLoading: 'Snooze options are still loading.',
      snoozeSaveConflict: 'Snooze options changed elsewhere. Review and try again.',
      snoozeSaveFailed: 'Could not save Snooze options. Please try again.',
      snoozeOpenSettingsFailed: 'Unable to open Snooze options in Settings.',
      whenLabel: 'When',
      whenAfter: 'In',
      atWord: 'at',
      timeFieldLabel: 'Time',
      passedToday: 'Passed for today',
      duplicateOption: 'Duplicate of an option above',
      sameTimeOption: 'Same time as an option above',
      removeSnoozeOption: 'Remove snooze option {index}',
      snoozeOptionItem: 'Snooze option {index}',
      amountLabel: 'Amount',
      decrease: 'Decrease',
      increase: 'Increase',
      unitLabel: 'Unit',
      dayToday: 'Today',
      dayTomorrow: 'Tomorrow',
      dayMonday: 'Monday',
      dayTuesday: 'Tuesday',
      dayWednesday: 'Wednesday',
      dayThursday: 'Thursday',
      dayFriday: 'Friday',
      daySaturday: 'Saturday',
      daySunday: 'Sunday',
      nextSunday: 'Next Sunday',
      nextMonday: 'Next Monday',
      nextTuesday: 'Next Tuesday',
      nextWednesday: 'Next Wednesday',
      nextThursday: 'Next Thursday',
      nextFriday: 'Next Friday',
      nextSaturday: 'Next Saturday',
      workingSection: 'Working',
      showMoreOne: 'Show {count} more',
      snoozeInMinuteFew: 'In {count} minutes',
      snoozeInHourFew: 'In {count} hours',
      snoozeInDayFew: 'In {count} days',
    };
    const zh = {
      inbox: '收件箱',
      inboxView: '收件箱视图',
      workspacesView: '工作区视图',
      expandInbox: '展开收件箱',
      search: '搜索',
      searchThreads: '搜索会话',
      searchResults: '会话搜索结果',
      newSession: '新建会话',
      needsYou: '待输入',
      working: '运行中',
      snoozed: '已暂缓',
      settled: '已收尾',
      pinned: '已置顶',
      active: '活跃',
      all: '所有项目',
      filterWorkspace: '按项目筛选会话',
      filterWorkspaceSelected: '按项目筛选会话：{projects}',
      searchProjects: '搜索项目…',
      addProject: '添加项目',
      noProjects: '没有匹配的项目。',
      addProjectUnavailable: '当前模式下无法添加项目。',
      empty: '暂无会话',
      emptySearch: '未找到会话',
      clearSearch: '清除会话搜索',
      noProjectsYet: '暂无项目',
      noThreadsYet: '暂无会话',
      noThreadsInProjects: '这些项目中暂无会话',
      noThreadsInProject: '{name} 中暂无会话',
      running: '运行中',
      idle: '闲置',
      showMore: '再显示 {count} 个',
      hideMore: '隐藏已收尾',
      sessionActions: '会话操作',
      settle: '收尾',
      restore: '取消会话收尾',
      wake: '唤醒',
      wakeNow: '立即唤醒会话',
      pin: '置顶',
      unpin: '取消置顶',
      unpinThread: '取消置顶会话',
      dropPin: '置顶',
      dropUnpin: '取消置顶',
      dropSettle: '收尾',
      dropUnsettle: '取消收尾',
      dropWake: '唤醒',
      undo: '撤销',
      undoButtonPlain: '撤销',
      settledNotice: '会话已收尾',
      snoozedNotice: '会话已暂缓',
      restoredNotice: '已取消会话收尾',
      wakeNotice: '会话已唤醒',
      oneHour: '1 小时后',
      threeHours: '3 小时后',
      thisMorning: '今天上午',
      thisAfternoon: '今天下午',
      thisEvening: '今天晚上',
      tomorrow: '明天',
      nextWeek: '下周',
      snoozeInMinute: '{count} 分钟后',
      snoozeInMinutes: '{count} 分钟后',
      snoozeInHour: '{count} 小时后',
      snoozeInHours: '{count} 小时后',
      snoozeInDay: '{count} 天后',
      snoozeInDays: '{count} 天后',
      snoozeTimePassed: '该暂缓时间已过，请选择其他时间。',
      woke: '已唤醒',
      deferred: '已暂缓',
      childResult: '子任务结果',
      actionFailed: '收件箱操作失败',
      noCandidate: '没有其他活跃会话',
      dismiss: '忽略',
      errorOccurred: '发生错误',
      errSettleTitle: '收尾会话失败',
      errUnsettleTitle: '取消会话收尾失败',
      errSnoozeTitle: '暂缓会话失败',
      errWakeTitle: '唤醒会话失败',
      errUnreadTitle: '无法更新未读状态',
      errPinTitle: '置顶会话失败',
      errUnpinTitle: '取消置顶会话失败',
      errUndoTitle: '无法撤销操作',
      errAddProjectTitle: '添加项目失败',
      errRenameTitle: '重命名会话失败',
      errArchiveTitle: '归档会话失败',
      errRefreshTitle: '暂时无法刷新会话',
      errActionGeneric: '操作未能完成，请重试。',
      errStaleContext: '会话状态已更新，请重试。',
      errRefreshDesc: '请稍后重试。',
      errSessionMissing: '该会话已不再可用。',
      settleSession: '收尾会话',
      unsettleSession: '取消会话收尾',
      snoozeAction: '暂缓',
      snoozeSession: '暂缓会话',
      wakeSession: '唤醒会话',
      markUnread: '标为未读',
      filterBy: '按 {name} 筛选',
      showAllProjects: '显示所有项目',
      settingsUnavailable: '设置入口在切回“会话”模式后可用。',
      approval: '待批准',
      failed: '失败',
      limited: '受限',
      waiting: '等待中',
      request: '待响应',
      done: '完成',
      dismissWoke: '忽略已唤醒通知',
      usageLimitReached: '已达到用量上限',
      customSnooze: '自定义…',
      customSnoozeTitle: '定时方式',
      customSnoozeConfirm: '暂缓',
      customSnoozeCancel: '取消',
      customSnoozeDialog: '自定义暂缓',
      customSnoozeHelp: '选择暂缓的会话何时回到收件箱。',
      chooseSnoozeDate: '选择暂缓日期',
      prevMonth: '上个月',
      nextMonth: '下个月',
      snoozeDateLabel: '日期',
      snoozeTimeLabel: '时间',
      snoozeModeDate: '日期和时间',
      snoozeModeDuration: '时长',
      snoozeAmount: '暂缓时长',
      snoozeUnit: '单位',
      decreaseDuration: '减少时长',
      increaseDuration: '增加时长',
      editSnoozeOptions: '编辑暂缓选项',
      close: '关闭',
      unitMinutes: '分钟',
      unitHours: '小时',
      unitDays: '天',
      durationInvalid: '请输入大于零的时长。',
      snoozeInvalid: '请选择将来的有效日期和时间。',
      workingFor: '持续 {time}',
      timeNow: '刚刚',
      timeMinutes: '{count} 分钟',
      timeHours: '{count} 小时',
      timeDays: '{count} 天',
      elapsedSeconds: '{count} 秒',
      elapsedMinutes: '{count} 分钟',
      elapsedHoursMinutes: '{hours} 小时 {minutes} 分钟',
      wakeNowLabel: '现在',
      wakeMinutes: '{count} 分钟',
      wakeHours: '{count} 小时',
      wakeDays: '{count} 天',
      actionBusy: '已有收件箱操作正在进行中',
      settleBusy: '会话运行中时无法收尾',
      settleNeedsYou: '有待处理输入时无法收尾',
      settleNotReady: '当前没有可收尾的新结果',
      snoozeNotReady: '暂缓需要完整且闲置、且没有排队工作的会话',
      cmdPreviousThread: '上一个会话',
      cmdNextThread: '下一个会话',
      cmdSettleThread: '收尾或取消收尾会话',
      cmdPinThread: '置顶或取消置顶会话',
      cmdJumpThread: '跳转到第 {index} 个会话',
      undoSettled: '已收尾',
      undoSnoozed: '已暂缓',
      undoUnpinned: '已取消置顶',
      undoSettledOne: '已收尾，',
      undoSettledMany: '已收尾 {count} 个，',
      undoSnoozedOne: '已暂缓，',
      undoSnoozedMany: '已暂缓 {count} 个，',
      undoUnpinnedOne: '已取消置顶，',
      undoUnpinnedMany: '已取消置顶 {count} 个，',
      undoToUndo: '按 {shortcut} 撤销',
      undoScreenSummary: '{action} {count} 个会话',
      unpinBatch: '取消置顶（{count}）',
      settleBatch: '收尾（{count}）',
      unsettleBatch: '取消收尾（{count}）',
      wakeBatch: '唤醒（{count}）',
      snoozeBatch: '暂缓（{count}）',
      markUnreadBatch: '标为未读（{count}）',
      archiveBatch: '归档（{count}）',
      sweepSettle: '收尾',
      sweepUnsettle: '取消收尾',
      sweepWake: '唤醒',
      batchActions: '批量会话操作',
      customSnoozeBatchHelp: '选择这 {count} 个暂缓的会话何时回到收件箱。',
      threadTitle: '会话标题',
      newThreadInTitle: '在以下位置新建会话…',
      newThreadInHint: '在当前项目中新建会话：Shift+单击',
      worktreeLabel: '工作树：{branch}',
      inboxSettings: 'T3 Inbox 设置',
      settings: '设置',
      sidebarView: '侧栏视图',
      sidebarBackground: '背景',
      sidebarBackgroundDesc: '沿用当前 DSH 主题，或为这个侧边栏单独选色。',
      sidebarBackgroundT3: 'T3 配色',
      sidebarBackgroundHost: '跟随 DSH 主题（默认）',
      sidebarBackgroundCustom: '自定义颜色',
      sidebarLightColor: '浅色模式颜色',
      sidebarDarkColor: '深色模式颜色',
      settingsAppearanceSection: '外观与布局',
      settingsBehaviorSection: '收件箱行为',
      globalPanelsLabel: '全局面板',
      globalPanelsDesc: '选择插件、自动化任务等全局面板的显示位置。',
      globalPanelsFooter: '底栏（默认）',
      globalPanelsTop: '顶部',
      globalPanelsHidden: '隐藏',
      moreGlobalPanels: '更多面板',
      workingShelfLabel: '运行中分组',
      workingShelfDesc: '将运行中或等待中的会话收起到“运行中”分组。产生未读结果后回到收件箱。',
      timeFormatLabel: '时间格式',
      timeFormatDesc: '用于暂缓菜单中显示的唤醒时刻。系统默认跟随操作系统时钟。',
      timeFormatLocale: '系统默认',
      timeFormat12: '12 小时制',
      timeFormat24: '24 小时制',
      snoozeOptionsTitle: '暂缓快捷选项',
      snoozeOptionsHelp: '调整会话暂缓菜单里的常用时间。',
      editShortcuts: '编辑快捷选项',
      hideShortcuts: '收起快捷选项',
      editOption: '编辑',
      doneEditingOption: '完成',
      removeOption: '移除',
      resetLabel: '重置',
      addOption: '+ 添加选项',
      maxOptionsHint: '最多 8 个选项',
      snoozeLoading: '暂缓选项仍在加载中。',
      snoozeSaveConflict: '暂缓选项已在别处更改，请检查后重试。',
      snoozeSaveFailed: '无法保存暂缓选项，请重试。',
      snoozeOpenSettingsFailed: '无法在设置中打开暂缓选项。',
      whenLabel: '暂缓到',
      whenAfter: '在此时长后',
      atWord: '时间',
      timeFieldLabel: '时间',
      passedToday: '今天已过此时间',
      duplicateOption: '与上方选项重复',
      sameTimeOption: '与上方选项时间相同',
      removeSnoozeOption: '移除暂缓选项 {index}',
      snoozeOptionItem: '暂缓选项 {index}',
      amountLabel: '数量',
      decrease: '减少',
      increase: '增加',
      unitLabel: '单位',
      dayToday: '今天',
      dayTomorrow: '明天',
      dayMonday: '周一',
      dayTuesday: '周二',
      dayWednesday: '周三',
      dayThursday: '周四',
      dayFriday: '周五',
      daySaturday: '周六',
      daySunday: '周日',
      nextSunday: '下周日',
      nextMonday: '下周一',
      nextTuesday: '下周二',
      nextWednesday: '下周三',
      nextThursday: '下周四',
      nextFriday: '下周五',
      nextSaturday: '下周六',
      workingSection: '运行中',
      showMoreOne: '再显示 {count} 个',
      snoozeInMinuteFew: '{count} 分钟后',
      snoozeInHourFew: '{count} 小时后',
      snoozeInDayFew: '{count} 天后',
    };
    const ja = {
      inbox: '受信トレイ',
      inboxView: '受信トレイ表示',
      workspacesView: 'ワークスペース表示',
      expandInbox: '受信トレイを展開',
      search: '検索',
      searchThreads: 'スレッドを検索',
      searchResults: 'スレッドの検索結果',
      newSession: '新しいスレッド',
      needsYou: '入力待ち',
      working: '作業中',
      snoozed: 'スヌーズ中',
      settled: '対応済み',
      pinned: 'ピン留め済み',
      active: 'アクティブ',
      all: 'すべてのプロジェクト',
      filterWorkspace: 'プロジェクトでスレッドを絞り込み',
      filterWorkspaceSelected: 'プロジェクトでスレッドを絞り込み: {projects}',
      searchProjects: 'プロジェクトを検索...',
      addProject: 'プロジェクトを追加',
      noProjects: '一致するプロジェクトはありません。',
      addProjectUnavailable: 'このモードではプロジェクトを追加できません。',
      empty: 'スレッドはまだありません',
      emptySearch: 'スレッドが見つかりません',
      clearSearch: 'スレッドの検索をクリア',
      noProjectsYet: 'プロジェクトはまだありません',
      noThreadsYet: 'スレッドはまだありません',
      noThreadsInProjects: 'これらのプロジェクトにはまだスレッドがありません',
      noThreadsInProject: '{name} にはまだスレッドがありません',
      running: '作業中',
      idle: 'アイドル',
      showMore: 'さらに {count} 件表示',
      hideMore: '対応済みを非表示',
      sessionActions: 'スレッド操作',
      settle: '対応済みにする',
      restore: 'スレッドの対応済みを解除',
      wake: '再開',
      wakeNow: 'スレッドを今すぐ再開',
      pin: 'ピン留め',
      unpin: 'ピン留めを解除',
      unpinThread: 'スレッドのピン留めを解除',
      dropPin: 'ピン留め',
      dropUnpin: 'ピン留めを解除',
      dropSettle: '対応済みにする',
      dropUnsettle: '対応済みを解除',
      dropWake: '再開',
      undo: '元に戻す',
      undoButtonPlain: '元に戻す',
      settledNotice: 'スレッドを対応済みにしました',
      snoozedNotice: 'スレッドをスヌーズしました',
      restoredNotice: 'スレッドの対応済みを解除しました',
      wakeNotice: 'スレッドのスヌーズを解除しました',
      oneHour: '1 時間後',
      threeHours: '3 時間後',
      thisMorning: '今朝',
      thisAfternoon: '今日の午後',
      thisEvening: '今晩',
      tomorrow: '明日',
      nextWeek: '来週',
      snoozeInMinute: '{count} 分後',
      snoozeInMinutes: '{count} 分後',
      snoozeInHour: '{count} 時間後',
      snoozeInHours: '{count} 時間後',
      snoozeInDay: '{count} 日後',
      snoozeInDays: '{count} 日後',
      snoozeTimePassed: 'そのスヌーズ時刻は過ぎています。別の時刻を選択してください。',
      woke: '再開',
      deferred: 'スヌーズ中',
      childResult: 'サブエージェントの結果',
      actionFailed: '受信トレイの操作に失敗しました',
      noCandidate: '他にアクティブなスレッドはありません',
      dismiss: '閉じる',
      errorOccurred: 'エラーが発生しました',
      errSettleTitle: 'スレッドを対応済みにできませんでした',
      errUnsettleTitle: 'スレッドの対応済みを解除できませんでした',
      errSnoozeTitle: 'スレッドをスヌーズできませんでした',
      errWakeTitle: 'スレッドのスヌーズを解除できませんでした',
      errUnreadTitle: '未読状態を更新できませんでした',
      errPinTitle: 'スレッドをピン留めできませんでした',
      errUnpinTitle: 'スレッドのピン留めを解除できませんでした',
      errUndoTitle: '操作を元に戻せませんでした',
      errAddProjectTitle: 'プロジェクトを追加できませんでした',
      errRenameTitle: 'スレッドの名前を変更できませんでした',
      errArchiveTitle: 'スレッドをアーカイブできませんでした',
      errRefreshTitle: 'スレッドを更新できません',
      errActionGeneric: '問題が発生しました。もう一度お試しください。',
      errStaleContext: '完了前にこのスレッドが変更されました。もう一度お試しください。',
      errRefreshDesc: 'しばらくしてからもう一度お試しください。',
      errSessionMissing: 'そのスレッドはもう利用できません。',
      settleSession: 'スレッドを対応済みにする',
      unsettleSession: 'スレッドの対応済みを解除',
      snoozeAction: 'スヌーズ',
      snoozeSession: 'スレッドをスヌーズ',
      wakeSession: 'スヌーズを解除',
      markUnread: '未読にする',
      filterBy: '{name} で絞り込み',
      showAllProjects: 'すべてのプロジェクトを表示',
      settingsUnavailable: '設定は「セッション」モードに切り替えると利用できます。',
      approval: '承認待ち',
      failed: '失敗',
      limited: '上限',
      waiting: '待機中',
      request: 'リクエスト',
      done: '完了',
      dismissWoke: '再開の通知を閉じる',
      usageLimitReached: '使用量の上限に達しました',
      customSnooze: 'カスタム…',
      customSnoozeTitle: 'スケジュールの種類',
      customSnoozeConfirm: 'スヌーズ',
      customSnoozeCancel: 'キャンセル',
      customSnoozeDialog: 'カスタムスヌーズ',
      customSnoozeHelp: 'スヌーズしたスレッドが受信トレイに戻るタイミングを選択します。',
      chooseSnoozeDate: 'スヌーズの日付を選択',
      prevMonth: '先月',
      nextMonth: '翌月',
      snoozeDateLabel: '日付',
      snoozeTimeLabel: '時刻',
      snoozeModeDate: '日時',
      snoozeModeDuration: '所要時間',
      snoozeAmount: 'スヌーズする期間',
      snoozeUnit: '単位',
      decreaseDuration: '期間を短くする',
      increaseDuration: '期間を長くする',
      editSnoozeOptions: 'スヌーズのオプションを編集',
      close: '閉じる',
      unitMinutes: '分',
      unitHours: '時間',
      unitDays: '日',
      durationInvalid: '正の期間を入力してください。',
      snoozeInvalid: '未来の有効な日時を選択してください。',
      workingFor: '{time} 経過',
      timeNow: 'たった今',
      timeMinutes: '{count}分',
      timeHours: '{count}時間',
      timeDays: '{count}日',
      elapsedSeconds: '{count}秒',
      elapsedMinutes: '{count}分',
      elapsedHoursMinutes: '{hours} 時間 {minutes} 分',
      wakeNowLabel: '今すぐ',
      wakeMinutes: '{count}分',
      wakeHours: '{count}時間',
      wakeDays: '{count}日',
      actionBusy: '別の受信トレイ操作がすでに進行中です',
      settleBusy: 'スレッドの作業中は対応済みにできません',
      settleNeedsYou: '入力待ちのあいだは対応済みにできません',
      settleNotReady: '対応済みにできる新しい結果がまだありません',
      snoozeNotReady: 'スヌーズするには、保留中の処理がない待機中の完了済みスレッドが必要です',
      cmdPreviousThread: '前のスレッド',
      cmdNextThread: '次のスレッド',
      cmdSettleThread: 'スレッドの対応済み状態を切り替え',
      cmdPinThread: 'スレッドのピン留めを切り替え',
      cmdJumpThread: '{index} 番目のスレッドへ移動',
      undoSettled: '対応済み',
      undoSnoozed: 'スヌーズ中',
      undoUnpinned: 'ピン留めを解除しました',
      undoSettledOne: '対応済み、',
      undoSettledMany: '対応済み {count} 件、',
      undoSnoozedOne: 'スヌーズ中、',
      undoSnoozedMany: 'スヌーズ中 {count} 件、',
      undoUnpinnedOne: 'ピン留めを解除、',
      undoUnpinnedMany: 'ピン留めを解除 {count} 件、',
      undoToUndo: '{shortcut} で元に戻す',
      undoScreenSummary: '{count} 件のスレッド: {action}',
      unpinBatch: 'ピン留めを解除 ({count})',
      settleBatch: '対応済みにする ({count})',
      unsettleBatch: '対応済みを解除 ({count})',
      wakeBatch: '再開 ({count})',
      snoozeBatch: 'スヌーズ ({count})',
      markUnreadBatch: '未読にする ({count})',
      archiveBatch: 'アーカイブ ({count})',
      sweepSettle: '対応済みにする',
      sweepUnsettle: '対応済みを解除',
      sweepWake: '再開',
      batchActions: '一括スレッド操作',
      customSnoozeBatchHelp: 'スヌーズした {count} 件のスレッドが受信トレイに戻るタイミングを選択します。',
      threadTitle: 'スレッドのタイトル',
      newThreadInTitle: '新しいスレッドの作成先...',
      newThreadInHint: '現在のプロジェクトで新しいスレッド: Shift+クリック',
      worktreeLabel: 'ワークツリー: {branch}',
      inboxSettings: 'T3 Inbox 設定',
      settings: '設定',
      sidebarView: 'サイドバー表示',
      sidebarBackground: '背景',
      sidebarBackgroundDesc: '現在の DSH テーマに従うか、このサイドバー用の色を選択します。',
      sidebarBackgroundT3: 'T3 カラー',
      sidebarBackgroundHost: 'DSH テーマ（デフォルト）',
      sidebarBackgroundCustom: 'カスタムカラー',
      sidebarLightColor: 'ライトモードの色',
      sidebarDarkColor: 'ダークモードの色',
      settingsAppearanceSection: '外観とレイアウト',
      settingsBehaviorSection: '受信トレイの動作',
      globalPanelsLabel: 'グローバルパネル',
      globalPanelsDesc: 'プラグインや自動化タスクなどのグローバルパネルの表示位置を選びます。',
      globalPanelsFooter: 'フッター（デフォルト）',
      globalPanelsTop: '上部',
      globalPanelsHidden: '非表示',
      moreGlobalPanels: 'その他のパネル',
      workingShelfLabel: '「作業中」セクション',
      workingShelfDesc: '作業中や待機中のスレッドを「作業中」セクションにまとめます。未読の結果があると受信トレイに戻ります。',
      timeFormatLabel: '時刻の形式',
      timeFormatDesc: 'スヌーズメニューの再開時刻に適用されます。「システムのデフォルト」は OS の時計に従います。',
      timeFormatLocale: 'システムのデフォルト',
      timeFormat12: '12 時間制',
      timeFormat24: '24 時間制',
      snoozeOptionsTitle: 'スヌーズショートカット',
      snoozeOptionsHelp: 'スヌーズメニューに表示する時刻を選択します。',
      editShortcuts: 'ショートカットを編集',
      hideShortcuts: 'ショートカットを隠す',
      editOption: '編集',
      doneEditingOption: '完了',
      removeOption: '削除',
      resetLabel: 'リセット',
      addOption: '+ オプションを追加',
      maxOptionsHint: '最大 8 件まで',
      snoozeLoading: 'スヌーズのオプションを読み込み中です。',
      snoozeSaveConflict: 'スヌーズのオプションが別の場所で変更されました。確認してもう一度お試しください。',
      snoozeSaveFailed: 'スヌーズのオプションを保存できませんでした。もう一度お試しください。',
      snoozeOpenSettingsFailed: '設定でスヌーズのオプションを開けません。',
      whenLabel: 'タイミング',
      whenAfter: '期間指定',
      atWord: 'の',
      timeFieldLabel: '時刻',
      passedToday: '今日はすでに過ぎています',
      duplicateOption: '上のオプションと重複しています',
      sameTimeOption: '上のオプションと同じ時刻です',
      removeSnoozeOption: 'スヌーズのオプション {index} を削除',
      snoozeOptionItem: 'スヌーズのオプション {index}',
      amountLabel: '量',
      decrease: '減らす',
      increase: '増やす',
      unitLabel: '単位',
      dayToday: '今日',
      dayTomorrow: '明日',
      dayMonday: '月曜日',
      dayTuesday: '火曜日',
      dayWednesday: '水曜日',
      dayThursday: '木曜日',
      dayFriday: '金曜日',
      daySaturday: '土曜日',
      daySunday: '日曜日',
      nextSunday: '次の日曜日',
      nextMonday: '次の月曜日',
      nextTuesday: '次の火曜日',
      nextWednesday: '次の水曜日',
      nextThursday: '次の木曜日',
      nextFriday: '次の金曜日',
      nextSaturday: '次の土曜日',
      workingSection: '作業中',
      showMoreOne: 'さらに {count} 件表示',
      snoozeInMinuteFew: '{count} 分後',
      snoozeInHourFew: '{count} 時間後',
      snoozeInDayFew: '{count} 日後',
    };
    const es = {
      inbox: 'Bandeja de entrada',
      inboxView: 'Vista de bandeja de entrada',
      workspacesView: 'Vista de espacios de trabajo',
      expandInbox: 'Expandir bandeja de entrada',
      search: 'Buscar',
      searchThreads: 'Buscar hilos',
      searchResults: 'Resultados de búsqueda de hilos',
      newSession: 'Nuevo hilo',
      needsYou: 'Respuesta',
      working: 'Trabajando',
      snoozed: 'Pospuestos',
      settled: 'Resueltos',
      pinned: 'Fijados',
      active: 'Activos',
      all: 'Todos los proyectos',
      filterWorkspace: 'Filtrar hilos por proyecto',
      filterWorkspaceSelected: 'Filtrar hilos por proyecto: {projects}',
      searchProjects: 'Buscar proyectos...',
      addProject: 'Añadir proyecto',
      noProjects: 'No hay proyectos que coincidan.',
      addProjectUnavailable: 'Añadir proyecto no está disponible en este modo.',
      empty: 'Aún no hay hilos',
      emptySearch: 'No se encontraron hilos',
      clearSearch: 'Borrar búsqueda de hilos',
      noProjectsYet: 'Aún no hay proyectos',
      noThreadsYet: 'Aún no hay hilos',
      noThreadsInProjects: 'Aún no hay hilos en estos proyectos',
      noThreadsInProject: 'Aún no hay hilos en {name}',
      running: 'Trabajando',
      idle: 'Inactivo',
      showMore: 'Mostrar {count} más',
      hideMore: 'Ocultar resueltos',
      sessionActions: 'Acciones del hilo',
      settle: 'Resolver',
      restore: 'Quitar hilo de resueltos',
      wake: 'Reactivar',
      wakeNow: 'Reactivar hilo ahora',
      pin: 'Fijar',
      unpin: 'Desfijar',
      unpinThread: 'Desfijar hilo',
      dropPin: 'Fijar',
      dropUnpin: 'Desfijar',
      dropSettle: 'Resolver',
      dropUnsettle: 'Quitar de resueltos',
      dropWake: 'Reactivar',
      undo: 'Deshacer',
      undoButtonPlain: 'Deshacer',
      settledNotice: 'Hilo resuelto',
      snoozedNotice: 'Hilo pospuesto',
      restoredNotice: 'Hilo quitado de resueltos',
      wakeNotice: 'Hilo reactivado',
      oneHour: 'En 1 hora',
      threeHours: 'En 3 horas',
      thisMorning: 'Esta mañana',
      thisAfternoon: 'Esta tarde',
      thisEvening: 'Esta noche',
      tomorrow: 'Mañana',
      nextWeek: 'La próxima semana',
      snoozeInMinute: 'En {count} minuto',
      snoozeInMinutes: 'En {count} minutos',
      snoozeInHour: 'En {count} hora',
      snoozeInHours: 'En {count} horas',
      snoozeInDay: 'En {count} día',
      snoozeInDays: 'En {count} días',
      snoozeTimePassed: 'Esa hora para posponer ya pasó. Elige otra.',
      woke: 'Reactivado',
      deferred: 'Pospuesto',
      childResult: 'Resultado del subagente',
      actionFailed: 'Falló la acción de la bandeja de entrada',
      noCandidate: 'No quedan más hilos activos',
      dismiss: 'Descartar',
      errorOccurred: 'Se produjo un error',
      errSettleTitle: 'No se pudo resolver el hilo',
      errUnsettleTitle: 'No se pudo quitar el hilo de resueltos',
      errSnoozeTitle: 'No se pudo posponer el hilo',
      errWakeTitle: 'No se pudo reactivar el hilo',
      errUnreadTitle: 'No se pudo actualizar el estado de no leído',
      errPinTitle: 'No se pudo fijar el hilo',
      errUnpinTitle: 'No se pudo desfijar el hilo',
      errUndoTitle: 'No se pudo deshacer la acción',
      errAddProjectTitle: 'No se pudo añadir el proyecto',
      errRenameTitle: 'No se pudo cambiar el nombre del hilo',
      errArchiveTitle: 'No se pudo archivar el hilo',
      errRefreshTitle: 'No se pueden actualizar los hilos',
      errActionGeneric: 'Algo salió mal. Vuelve a intentarlo.',
      errStaleContext: 'Este hilo cambió antes de que se completara la acción. Vuelve a intentarlo.',
      errRefreshDesc: 'Vuelve a intentarlo en un momento.',
      errSessionMissing: 'Ese hilo ya no está disponible.',
      settleSession: 'Resolver hilo',
      unsettleSession: 'Quitar hilo de resueltos',
      snoozeAction: 'Posponer',
      snoozeSession: 'Posponer hilo',
      wakeSession: 'Reactivar hilo',
      markUnread: 'Marcar como no leído',
      filterBy: 'Filtrar por {name}',
      showAllProjects: 'Mostrar todos los proyectos',
      settingsUnavailable: 'Los ajustes están disponibles al cambiar al modo Sesiones.',
      approval: 'Aprobación',
      failed: 'Falló',
      limited: 'Limitado',
      waiting: 'Esperando',
      request: 'Solicitud',
      done: 'Hecho',
      dismissWoke: 'Descartar notificación de reactivación',
      usageLimitReached: 'Límite de uso alcanzado',
      customSnooze: 'Personalizado…',
      customSnoozeTitle: 'Tipo de programación',
      customSnoozeConfirm: 'Posponer',
      customSnoozeCancel: 'Cancelar',
      customSnoozeDialog: 'Posponer personalizado',
      customSnoozeHelp: 'Elige cuándo vuelven los hilos pospuestos a tu bandeja de entrada.',
      chooseSnoozeDate: 'Elegir fecha para posponer',
      prevMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      snoozeDateLabel: 'Fecha',
      snoozeTimeLabel: 'Hora',
      snoozeModeDate: 'Fecha y hora',
      snoozeModeDuration: 'Duración',
      snoozeAmount: 'Posponer durante',
      snoozeUnit: 'Unidad',
      decreaseDuration: 'Reducir duración',
      increaseDuration: 'Aumentar duración',
      editSnoozeOptions: 'Editar opciones de posponer',
      close: 'Cerrar',
      unitMinutes: 'Minutos',
      unitHours: 'Horas',
      unitDays: 'Días',
      durationInvalid: 'Introduce una duración positiva.',
      snoozeInvalid: 'Elige una fecha y hora válidas en el futuro.',
      workingFor: 'durante {time}',
      timeNow: 'ahora',
      timeMinutes: '{count} min',
      timeHours: '{count} h',
      timeDays: '{count} d',
      elapsedSeconds: '{count} s',
      elapsedMinutes: '{count} min',
      elapsedHoursMinutes: '{hours} h {minutes} min',
      wakeNowLabel: 'ahora',
      wakeMinutes: '{count} min',
      wakeHours: '{count} h',
      wakeDays: '{count} d',
      actionBusy: 'Ya hay una acción de bandeja de entrada en curso',
      settleBusy: 'No se puede resolver mientras el hilo está trabajando',
      settleNeedsYou: 'No se puede resolver mientras haya una respuesta pendiente',
      settleNotReady: 'Aún no hay nada nuevo por resolver',
      snoozeNotReady: 'Posponer requiere un hilo completo e inactivo sin tareas en cola',
      cmdPreviousThread: 'Hilo anterior',
      cmdNextThread: 'Siguiente hilo',
      cmdSettleThread: 'Alternar estado resuelto del hilo',
      cmdPinThread: 'Alternar fijado del hilo',
      cmdJumpThread: 'Ir al hilo {index}',
      undoSettled: 'Resueltos',
      undoSnoozed: 'Pospuestos',
      undoUnpinned: 'Desfijados',
      undoSettledOne: 'Resuelto,',
      undoSettledMany: 'Resueltos {count},',
      undoSnoozedOne: 'Pospuesto,',
      undoSnoozedMany: 'Pospuestos {count},',
      undoUnpinnedOne: 'Desfijado,',
      undoUnpinnedMany: 'Desfijados {count},',
      undoToUndo: '{shortcut} para deshacer',
      undoScreenSummary: '{action} {count} hilos',
      unpinBatch: 'Desfijar ({count})',
      settleBatch: 'Resolver ({count})',
      unsettleBatch: 'Quitar de resueltos ({count})',
      wakeBatch: 'Reactivar ({count})',
      snoozeBatch: 'Posponer ({count})',
      markUnreadBatch: 'Marcar como no leídos ({count})',
      archiveBatch: 'Archivar ({count})',
      sweepSettle: 'Resolver',
      sweepUnsettle: 'Quitar de resueltos',
      sweepWake: 'Reactivar',
      batchActions: 'Acciones en lote sobre hilos',
      customSnoozeBatchHelp: 'Elige cuándo vuelven {count} hilos pospuestos a la bandeja de entrada.',
      threadTitle: 'Título del hilo',
      newThreadInTitle: 'Nuevo hilo en...',
      newThreadInHint: 'Nuevo hilo en el proyecto actual: Shift+clic',
      worktreeLabel: 'Worktree: {branch}',
      inboxSettings: 'Ajustes de T3 Inbox',
      settings: 'Ajustes',
      sidebarView: 'Vista de barra lateral',
      sidebarBackground: 'Fondo',
      sidebarBackgroundDesc: 'Sigue el tema actual de DSH o elige colores para esta barra lateral.',
      sidebarBackgroundT3: 'Colores de T3',
      sidebarBackgroundHost: 'Tema de DSH (predeterminado)',
      sidebarBackgroundCustom: 'Colores personalizados',
      sidebarLightColor: 'Color en modo claro',
      sidebarDarkColor: 'Color en modo oscuro',
      settingsAppearanceSection: 'Apariencia y diseño',
      settingsBehaviorSection: 'Comportamiento',
      globalPanelsLabel: 'Paneles globales',
      globalPanelsDesc: 'Elige dónde aparecen los complementos, tareas de automatización y otros paneles globales.',
      globalPanelsFooter: 'Pie (predeterminado)',
      globalPanelsTop: 'Arriba',
      globalPanelsHidden: 'Oculto',
      moreGlobalPanels: 'Más paneles',
      workingShelfLabel: 'Sección En curso',
      workingShelfDesc: 'Agrupa los hilos en curso y en espera en la sección En curso. Los resultados sin leer vuelven a la bandeja de entrada.',
      timeFormatLabel: 'Formato de hora',
      timeFormatDesc: 'Se aplica a las horas de reactivación del menú Posponer. «Del sistema» sigue el reloj del SO.',
      timeFormatLocale: 'Del sistema',
      timeFormat12: '12 horas',
      timeFormat24: '24 horas',
      snoozeOptionsTitle: 'Atajos para posponer',
      snoozeOptionsHelp: 'Elige las horas mostradas en el menú Posponer.',
      editShortcuts: 'Editar atajos',
      hideShortcuts: 'Ocultar atajos',
      editOption: 'Editar',
      doneEditingOption: 'Listo',
      removeOption: 'Quitar',
      resetLabel: 'Restablecer',
      addOption: '+ Añadir opción',
      maxOptionsHint: 'Hasta 8 opciones',
      snoozeLoading: 'Las opciones para posponer aún se están cargando.',
      snoozeSaveConflict: 'Las opciones para posponer cambiaron en otro lugar. Revísalas e inténtalo de nuevo.',
      snoozeSaveFailed: 'No se pudieron guardar las opciones para posponer. Inténtalo de nuevo.',
      snoozeOpenSettingsFailed: 'No se pudieron abrir las opciones para posponer en Ajustes.',
      whenLabel: 'Cuándo',
      whenAfter: 'En',
      atWord: 'a las',
      timeFieldLabel: 'Hora',
      passedToday: 'Ya pasó por hoy',
      duplicateOption: 'Duplicado de una opción de arriba',
      sameTimeOption: 'Misma hora que una opción de arriba',
      removeSnoozeOption: 'Quitar la opción de posponer {index}',
      snoozeOptionItem: 'Opción de posponer {index}',
      amountLabel: 'Cantidad',
      decrease: 'Reducir',
      increase: 'Aumentar',
      unitLabel: 'Unidad',
      dayToday: 'Hoy',
      dayTomorrow: 'Mañana',
      dayMonday: 'Lunes',
      dayTuesday: 'Martes',
      dayWednesday: 'Miércoles',
      dayThursday: 'Jueves',
      dayFriday: 'Viernes',
      daySaturday: 'Sábado',
      daySunday: 'Domingo',
      nextSunday: 'El próximo domingo',
      nextMonday: 'El próximo lunes',
      nextTuesday: 'El próximo martes',
      nextWednesday: 'El próximo miércoles',
      nextThursday: 'El próximo jueves',
      nextFriday: 'El próximo viernes',
      nextSaturday: 'El próximo sábado',
      workingSection: 'En curso',
      showMoreOne: 'Mostrar {count} más',
      snoozeInMinuteFew: 'En {count} minutos',
      snoozeInHourFew: 'En {count} horas',
      snoozeInDayFew: 'En {count} días',
    };
    const fr = {
      inbox: 'Boîte de réception',
      inboxView: 'Vue boîte de réception',
      workspacesView: 'Vue espaces de travail',
      expandInbox: 'Déplier la boîte de réception',
      search: 'Rechercher',
      searchThreads: 'Rechercher des fils',
      searchResults: 'Résultats de la recherche de fils',
      newSession: 'Nouveau fil',
      needsYou: 'Réponse',
      working: 'En cours',
      snoozed: 'Reportés',
      settled: 'Clos',
      pinned: 'Épinglés',
      active: 'Actifs',
      all: 'Tous les projets',
      filterWorkspace: 'Filtrer les fils par projet',
      filterWorkspaceSelected: 'Filtrer les fils par projet : {projects}',
      searchProjects: 'Rechercher des projets...',
      addProject: 'Ajouter un projet',
      noProjects: 'Aucun projet correspondant.',
      addProjectUnavailable: 'L’ajout de projet n’est pas disponible dans ce mode.',
      empty: 'Aucun fil pour l’instant',
      emptySearch: 'Aucun fil trouvé',
      clearSearch: 'Effacer la recherche de fils',
      noProjectsYet: 'Pas encore de projet',
      noThreadsYet: 'Aucun fil pour l’instant',
      noThreadsInProjects: 'Pas encore de fil dans ces projets',
      noThreadsInProject: 'Pas encore de fil dans {name}',
      running: 'En cours',
      idle: 'Inactif',
      showMore: 'Afficher {count} de plus',
      hideMore: 'Masquer les fils clos',
      sessionActions: 'Actions sur le fil',
      settle: 'Clore',
      restore: 'Rouvrir le fil',
      wake: 'Réveiller',
      wakeNow: 'Réveiller le fil maintenant',
      pin: 'Épingler',
      unpin: 'Désépingler',
      unpinThread: 'Désépingler le fil',
      dropPin: 'Épingler',
      dropUnpin: 'Désépingler',
      dropSettle: 'Clore',
      dropUnsettle: 'Rouvrir',
      dropWake: 'Réveiller',
      undo: 'Annuler',
      undoButtonPlain: 'Annuler',
      settledNotice: 'Fil clos',
      snoozedNotice: 'Fil reporté',
      restoredNotice: 'Fil rouvert',
      wakeNotice: 'Fil réveillé',
      oneHour: 'Dans 1 heure',
      threeHours: 'Dans 3 heures',
      thisMorning: 'Ce matin',
      thisAfternoon: 'Cet après-midi',
      thisEvening: 'Ce soir',
      tomorrow: 'Demain',
      nextWeek: 'La semaine prochaine',
      snoozeInMinute: 'Dans {count} minute',
      snoozeInMinutes: 'Dans {count} minutes',
      snoozeInHour: 'Dans {count} heure',
      snoozeInHours: 'Dans {count} heures',
      snoozeInDay: 'Dans {count} jour',
      snoozeInDays: 'Dans {count} jours',
      snoozeTimePassed: 'Cette heure de report est passée. Choisissez-en une autre.',
      woke: 'Réveillé',
      deferred: 'Reporté',
      childResult: 'Résultat du sous-agent',
      actionFailed: 'Échec de l’action de la boîte de réception',
      noCandidate: 'Plus aucun fil actif',
      dismiss: 'Ignorer',
      errorOccurred: 'Une erreur s’est produite',
      errSettleTitle: 'Échec de la clôture du fil',
      errUnsettleTitle: 'Échec de la réouverture du fil',
      errSnoozeTitle: 'Échec du report du fil',
      errWakeTitle: 'Échec du réveil du fil',
      errUnreadTitle: 'Échec de la mise à jour de l’état non lu',
      errPinTitle: 'Échec de l’épinglage du fil',
      errUnpinTitle: 'Échec du désépinglage du fil',
      errUndoTitle: 'Impossible d’annuler l’action',
      errAddProjectTitle: 'Échec de l’ajout du projet',
      errRenameTitle: 'Échec du renommage du fil',
      errArchiveTitle: 'Échec de l’archivage du fil',
      errRefreshTitle: 'Impossible d’actualiser les fils',
      errActionGeneric: 'Une erreur s’est produite. Réessayez.',
      errStaleContext: 'Ce fil a changé avant la fin de l’action. Réessayez.',
      errRefreshDesc: 'Réessayez dans un instant.',
      errSessionMissing: 'Ce fil n’est plus disponible.',
      settleSession: 'Clore le fil',
      unsettleSession: 'Rouvrir le fil',
      snoozeAction: 'Reporter',
      snoozeSession: 'Reporter le fil',
      wakeSession: 'Réveiller le fil',
      markUnread: 'Marquer comme non lu',
      filterBy: 'Filtrer par {name}',
      showAllProjects: 'Afficher tous les projets',
      settingsUnavailable: 'Les paramètres sont accessibles après avoir basculé en mode Sessions.',
      approval: 'Approbation',
      failed: 'Échec',
      limited: 'Limité',
      waiting: 'En attente',
      request: 'Demande',
      done: 'Terminé',
      dismissWoke: 'Ignorer la notification Réveillé',
      usageLimitReached: 'Limite d’utilisation atteinte',
      customSnooze: 'Personnalisé…',
      customSnoozeTitle: 'Type de planification',
      customSnoozeConfirm: 'Reporter',
      customSnoozeCancel: 'Annuler',
      customSnoozeDialog: 'Report personnalisé',
      customSnoozeHelp: 'Choisissez quand les fils reportés reviennent dans votre boîte de réception.',
      chooseSnoozeDate: 'Choisir la date de report',
      prevMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      snoozeDateLabel: 'Date',
      snoozeTimeLabel: 'Heure',
      snoozeModeDate: 'Date et heure',
      snoozeModeDuration: 'Durée',
      snoozeAmount: 'Reporter de',
      snoozeUnit: 'Unité',
      decreaseDuration: 'Diminuer la durée',
      increaseDuration: 'Augmenter la durée',
      editSnoozeOptions: 'Modifier les options de report',
      close: 'Fermer',
      unitMinutes: 'Minutes',
      unitHours: 'Heures',
      unitDays: 'Jours',
      durationInvalid: 'Saisissez une durée positive.',
      snoozeInvalid: 'Choisissez une date et une heure valides dans le futur.',
      workingFor: 'depuis {time}',
      timeNow: 'maintenant',
      timeMinutes: '{count} min',
      timeHours: '{count} h',
      timeDays: '{count} j',
      elapsedSeconds: '{count} s',
      elapsedMinutes: '{count} min',
      elapsedHoursMinutes: '{hours} h {minutes} min',
      wakeNowLabel: 'maintenant',
      wakeMinutes: '{count} min',
      wakeHours: '{count} h',
      wakeDays: '{count} j',
      actionBusy: 'Une action de boîte de réception est déjà en cours',
      settleBusy: 'Impossible de clore tant que le fil est en cours',
      settleNeedsYou: 'Impossible de clore lorsqu’une saisie est attendue',
      settleNotReady: 'Rien de nouveau à clore pour le moment',
      snoozeNotReady: 'Le report nécessite un fil complet et inactif sans tâche en attente',
      cmdPreviousThread: 'Fil précédent',
      cmdNextThread: 'Fil suivant',
      cmdSettleThread: 'Basculer l’état clos du fil',
      cmdPinThread: 'Épingler ou désépingler le fil',
      cmdJumpThread: 'Aller au fil {index}',
      undoSettled: 'Clos',
      undoSnoozed: 'Reportés',
      undoUnpinned: 'Désépinglés',
      undoSettledOne: 'Clos,',
      undoSettledMany: '{count} clos,',
      undoSnoozedOne: 'Reporté,',
      undoSnoozedMany: '{count} reportés,',
      undoUnpinnedOne: 'Désépinglé,',
      undoUnpinnedMany: '{count} désépinglés,',
      undoToUndo: '{shortcut} pour annuler',
      undoScreenSummary: '{action} {count} fils',
      unpinBatch: 'Désépingler ({count})',
      settleBatch: 'Clore ({count})',
      unsettleBatch: 'Rouvrir ({count})',
      wakeBatch: 'Réveiller ({count})',
      snoozeBatch: 'Reporter ({count})',
      markUnreadBatch: 'Marquer comme non lu ({count})',
      archiveBatch: 'Archiver ({count})',
      sweepSettle: 'Clore',
      sweepUnsettle: 'Rouvrir',
      sweepWake: 'Réveiller',
      batchActions: 'Actions groupées sur les fils',
      customSnoozeBatchHelp: 'Choisissez quand {count} fils reportés reviennent dans la boîte de réception.',
      threadTitle: 'Titre du fil',
      newThreadInTitle: 'Nouveau fil dans...',
      newThreadInHint: 'Nouveau fil dans le projet actuel : Shift+clic',
      worktreeLabel: 'Worktree : {branch}',
      inboxSettings: 'Paramètres T3 Inbox',
      settings: 'Paramètres',
      sidebarView: 'Vue barre latérale',
      sidebarBackground: 'Arrière-plan',
      sidebarBackgroundDesc: 'Suivez le thème DSH actuel ou choisissez des couleurs pour cette barre latérale.',
      sidebarBackgroundT3: 'Couleurs T3',
      sidebarBackgroundHost: 'Thème DSH (par défaut)',
      sidebarBackgroundCustom: 'Couleurs personnalisées',
      sidebarLightColor: 'Couleur en mode clair',
      sidebarDarkColor: 'Couleur en mode sombre',
      settingsAppearanceSection: 'Apparence et disposition',
      settingsBehaviorSection: 'Comportement',
      globalPanelsLabel: 'Panneaux globaux',
      globalPanelsDesc: 'Choisissez où afficher les plugins, les tâches d’automatisation et les autres panneaux globaux.',
      globalPanelsFooter: 'Pied de page (par défaut)',
      globalPanelsTop: 'En haut',
      globalPanelsHidden: 'Masqué',
      moreGlobalPanels: 'Plus de panneaux',
      workingShelfLabel: 'Section En cours',
      workingShelfDesc: 'Regroupe les fils en cours et en attente dans une section En cours. Les résultats non lus reviennent dans la boîte de réception.',
      timeFormatLabel: 'Format de l’heure',
      timeFormatDesc: 'S’applique aux heures de réveil du menu Reporter. L’option Système suit l’horloge de l’OS.',
      timeFormatLocale: 'Par défaut du système',
      timeFormat12: '12 heures',
      timeFormat24: '24 heures',
      snoozeOptionsTitle: 'Raccourcis de report',
      snoozeOptionsHelp: 'Choisissez les horaires affichés dans le menu Reporter.',
      editShortcuts: 'Modifier les raccourcis',
      hideShortcuts: 'Masquer les raccourcis',
      editOption: 'Modifier',
      doneEditingOption: 'Terminé',
      removeOption: 'Supprimer',
      resetLabel: 'Réinitialiser',
      addOption: '+ Ajouter une option',
      maxOptionsHint: 'Jusqu’à 8 options',
      snoozeLoading: 'Les options de report sont encore en cours de chargement.',
      snoozeSaveConflict: 'Les options de report ont changé ailleurs. Vérifiez et réessayez.',
      snoozeSaveFailed: 'Impossible d’enregistrer les options de report. Réessayez.',
      snoozeOpenSettingsFailed: 'Impossible d’ouvrir les options de report dans les Paramètres.',
      whenLabel: 'Quand',
      whenAfter: 'Dans',
      atWord: 'à',
      timeFieldLabel: 'Heure',
      passedToday: 'Déjà passé aujourd’hui',
      duplicateOption: 'Doublon d’une option ci-dessus',
      sameTimeOption: 'Même heure qu’une option ci-dessus',
      removeSnoozeOption: 'Supprimer l’option de report {index}',
      snoozeOptionItem: 'Option de report {index}',
      amountLabel: 'Quantité',
      decrease: 'Diminuer',
      increase: 'Augmenter',
      unitLabel: 'Unité',
      dayToday: 'Aujourd’hui',
      dayTomorrow: 'Demain',
      dayMonday: 'Lundi',
      dayTuesday: 'Mardi',
      dayWednesday: 'Mercredi',
      dayThursday: 'Jeudi',
      dayFriday: 'Vendredi',
      daySaturday: 'Samedi',
      daySunday: 'Dimanche',
      nextSunday: 'Dimanche prochain',
      nextMonday: 'Lundi prochain',
      nextTuesday: 'Mardi prochain',
      nextWednesday: 'Mercredi prochain',
      nextThursday: 'Jeudi prochain',
      nextFriday: 'Vendredi prochain',
      nextSaturday: 'Samedi prochain',
      workingSection: 'En cours',
      showMoreOne: 'Afficher {count} de plus',
      snoozeInMinuteFew: 'Dans {count} minutes',
      snoozeInHourFew: 'Dans {count} heures',
      snoozeInDayFew: 'Dans {count} jours',
    };
    const de = {
      inbox: 'Posteingang',
      inboxView: 'Posteingang-Ansicht',
      workspacesView: 'Arbeitsbereich-Ansicht',
      expandInbox: 'Posteingang erweitern',
      search: 'Suchen',
      searchThreads: 'Threads durchsuchen',
      searchResults: 'Suchergebnisse für Threads',
      newSession: 'Neuer Thread',
      needsYou: 'Eingabe',
      working: 'Arbeitet',
      snoozed: 'Zurückgestellt',
      settled: 'Erledigt',
      pinned: 'Angeheftet',
      active: 'Aktiv',
      all: 'Alle Projekte',
      filterWorkspace: 'Threads nach Projekt filtern',
      filterWorkspaceSelected: 'Threads nach Projekt filtern: {projects}',
      searchProjects: 'Projekte durchsuchen...',
      addProject: 'Projekt hinzufügen',
      noProjects: 'Keine passenden Projekte.',
      addProjectUnavailable: 'Projekt hinzufügen ist in diesem Modus nicht verfügbar.',
      empty: 'Noch keine Threads',
      emptySearch: 'Keine Threads gefunden',
      clearSearch: 'Thread-Suche leeren',
      noProjectsYet: 'Noch keine Projekte',
      noThreadsYet: 'Noch keine Threads',
      noThreadsInProjects: 'Noch keine Threads in diesen Projekten',
      noThreadsInProject: 'Noch keine Threads in {name}',
      running: 'Arbeitet',
      idle: 'Inaktiv',
      showMore: '{count} weitere anzeigen',
      hideMore: 'Erledigte ausblenden',
      sessionActions: 'Thread-Aktionen',
      settle: 'Erledigen',
      restore: 'Erledigt aufheben',
      wake: 'Aufwecken',
      wakeNow: 'Thread jetzt aufwecken',
      pin: 'Anheften',
      unpin: 'Loslösen',
      unpinThread: 'Thread loslösen',
      dropPin: 'Anheften',
      dropUnpin: 'Loslösen',
      dropSettle: 'Erledigen',
      dropUnsettle: 'Erledigt aufheben',
      dropWake: 'Aufwecken',
      undo: 'Rückgängig',
      undoButtonPlain: 'Rückgängig',
      settledNotice: 'Thread erledigt',
      snoozedNotice: 'Thread zurückgestellt',
      restoredNotice: 'Erledigt-Status aufgehoben',
      wakeNotice: 'Thread aufgeweckt',
      oneHour: 'In 1 Stunde',
      threeHours: 'In 3 Stunden',
      thisMorning: 'Heute Vormittag',
      thisAfternoon: 'Heute Nachmittag',
      thisEvening: 'Heute Abend',
      tomorrow: 'Morgen',
      nextWeek: 'Nächste Woche',
      snoozeInMinute: 'In {count} Minute',
      snoozeInMinutes: 'In {count} Minuten',
      snoozeInHour: 'In {count} Stunde',
      snoozeInHours: 'In {count} Stunden',
      snoozeInDay: 'In {count} Tag',
      snoozeInDays: 'In {count} Tagen',
      snoozeTimePassed: 'Dieser Zeitpunkt ist bereits vorbei. Wähle einen anderen.',
      woke: 'Aufgeweckt',
      deferred: 'Zurückgestellt',
      childResult: 'Subagent-Ergebnis',
      actionFailed: 'Posteingang-Aktion fehlgeschlagen',
      noCandidate: 'Keine weiteren aktiven Threads',
      dismiss: 'Verwerfen',
      errorOccurred: 'Fehler aufgetreten',
      errSettleTitle: 'Thread konnte nicht erledigt werden',
      errUnsettleTitle: 'Erledigt-Status konnte nicht aufgehoben werden',
      errSnoozeTitle: 'Thread konnte nicht zurückgestellt werden',
      errWakeTitle: 'Thread konnte nicht geweckt werden',
      errUnreadTitle: 'Ungelesen-Status konnte nicht aktualisiert werden',
      errPinTitle: 'Thread konnte nicht angeheftet werden',
      errUnpinTitle: 'Thread konnte nicht losgelöst werden',
      errUndoTitle: 'Aktion konnte nicht rückgängig gemacht werden',
      errAddProjectTitle: 'Projekt konnte nicht hinzugefügt werden',
      errRenameTitle: 'Thread konnte nicht umbenannt werden',
      errArchiveTitle: 'Thread konnte nicht archiviert werden',
      errRefreshTitle: 'Threads können nicht aktualisiert werden',
      errActionGeneric: 'Etwas ist schiefgelaufen. Versuche es erneut.',
      errStaleContext: 'Dieser Thread hat sich geändert, bevor die Aktion abgeschlossen wurde. Bitte erneut versuchen.',
      errRefreshDesc: 'Versuche es gleich noch einmal.',
      errSessionMissing: 'Dieser Thread ist nicht mehr verfügbar.',
      settleSession: 'Thread erledigen',
      unsettleSession: 'Erledigt aufheben',
      snoozeAction: 'Zurückstellen',
      snoozeSession: 'Thread zurückstellen',
      wakeSession: 'Thread wecken',
      markUnread: 'Als ungelesen markieren',
      filterBy: 'Nach {name} filtern',
      showAllProjects: 'Alle Projekte anzeigen',
      settingsUnavailable: 'Einstellungen sind nach dem Wechsel in den Sitzungen-Modus erreichbar.',
      approval: 'Genehmigung',
      failed: 'Fehlgeschlagen',
      limited: 'Limitiert',
      waiting: 'Wartet',
      request: 'Anfrage',
      done: 'Fertig',
      dismissWoke: 'Aufgeweckt-Hinweis schließen',
      usageLimitReached: 'Nutzungslimit erreicht',
      customSnooze: 'Benutzerdefiniert…',
      customSnoozeTitle: 'Zeitplantyp',
      customSnoozeConfirm: 'Zurückstellen',
      customSnoozeCancel: 'Abbrechen',
      customSnoozeDialog: 'Benutzerdefiniert zurückstellen',
      customSnoozeHelp: 'Wähle, wann zurückgestellte Threads in deinen Posteingang zurückkehren.',
      chooseSnoozeDate: 'Datum zum Zurückstellen wählen',
      prevMonth: 'Vorheriger Monat',
      nextMonth: 'Nächster Monat',
      snoozeDateLabel: 'Datum',
      snoozeTimeLabel: 'Uhrzeit',
      snoozeModeDate: 'Datum und Uhrzeit',
      snoozeModeDuration: 'Dauer',
      snoozeAmount: 'Zurückstellen für',
      snoozeUnit: 'Einheit',
      decreaseDuration: 'Dauer verringern',
      increaseDuration: 'Dauer erhöhen',
      editSnoozeOptions: 'Optionen zum Zurückstellen bearbeiten',
      close: 'Schließen',
      unitMinutes: 'Minuten',
      unitHours: 'Stunden',
      unitDays: 'Tage',
      durationInvalid: 'Gib eine positive Dauer ein.',
      snoozeInvalid: 'Wähle ein gültiges Datum und eine Uhrzeit in der Zukunft.',
      workingFor: 'seit {time}',
      timeNow: 'jetzt',
      timeMinutes: '{count} Min.',
      timeHours: '{count} Std.',
      timeDays: '{count} T.',
      elapsedSeconds: '{count} s',
      elapsedMinutes: '{count} Min.',
      elapsedHoursMinutes: '{hours} Std. {minutes} Min.',
      wakeNowLabel: 'jetzt',
      wakeMinutes: '{count} Min.',
      wakeHours: '{count} Std.',
      wakeDays: '{count} T.',
      actionBusy: 'Eine Posteingang-Aktion läuft bereits',
      settleBusy: 'Erledigen ist nicht verfügbar, während der Thread arbeitet',
      settleNeedsYou: 'Erledigen ist nicht verfügbar, solange eine Eingabe aussteht',
      settleNotReady: 'Noch nichts Neues zum Erledigen',
      snoozeNotReady: 'Zum Zurückstellen wird ein vollständiger, inaktiver Thread ohne Warteschlange benötigt',
      cmdPreviousThread: 'Vorheriger Thread',
      cmdNextThread: 'Nächster Thread',
      cmdSettleThread: 'Thread als erledigt umschalten',
      cmdPinThread: 'Thread anheften/loslösen',
      cmdJumpThread: 'Zu Thread {index} springen',
      undoSettled: 'Erledigt',
      undoSnoozed: 'Zurückgestellt',
      undoUnpinned: 'Losgelöst',
      undoSettledOne: 'Erledigt,',
      undoSettledMany: '{count} erledigt,',
      undoSnoozedOne: 'Zurückgestellt,',
      undoSnoozedMany: '{count} zurückgestellt,',
      undoUnpinnedOne: 'Losgelöst,',
      undoUnpinnedMany: '{count} losgelöst,',
      undoToUndo: '{shortcut} zum Rückgängigmachen',
      undoScreenSummary: '{action} ({count} Threads)',
      unpinBatch: 'Loslösen ({count})',
      settleBatch: 'Erledigen ({count})',
      unsettleBatch: 'Erledigt aufheben ({count})',
      wakeBatch: 'Aufwecken ({count})',
      snoozeBatch: 'Zurückstellen ({count})',
      markUnreadBatch: 'Als ungelesen markieren ({count})',
      archiveBatch: 'Archivieren ({count})',
      sweepSettle: 'Erledigen',
      sweepUnsettle: 'Erledigt aufheben',
      sweepWake: 'Aufwecken',
      batchActions: 'Stapelaktionen für Threads',
      customSnoozeBatchHelp: 'Wähle, wann {count} zurückgestellte Threads in den Posteingang zurückkehren.',
      threadTitle: 'Thread-Titel',
      newThreadInTitle: 'Neuer Thread in...',
      newThreadInHint: 'Neuer Thread im aktuellen Projekt: Shift+Klick',
      worktreeLabel: 'Worktree: {branch}',
      inboxSettings: 'T3 Inbox-Einstellungen',
      settings: 'Einstellungen',
      sidebarView: 'Seitenleisten-Ansicht',
      sidebarBackground: 'Hintergrund',
      sidebarBackgroundDesc: 'Aktuellem DSH-Theme folgen oder eigene Farben für diese Seitenleiste wählen.',
      sidebarBackgroundT3: 'T3-Farben',
      sidebarBackgroundHost: 'DSH-Theme (Standard)',
      sidebarBackgroundCustom: 'Benutzerdefinierte Farben',
      sidebarLightColor: 'Farbe (Heller Modus)',
      sidebarDarkColor: 'Farbe (Dunkler Modus)',
      settingsAppearanceSection: 'Darstellung & Layout',
      settingsBehaviorSection: 'Posteingang-Verhalten',
      globalPanelsLabel: 'Globale Bereiche',
      globalPanelsDesc: 'Wähle aus, wo Plugins, Automatisierungsaufgaben und andere globale Bereiche erscheinen.',
      globalPanelsFooter: 'Fußzeile (Standard)',
      globalPanelsTop: 'Oben',
      globalPanelsHidden: 'Ausgeblendet',
      moreGlobalPanels: 'Weitere Bereiche',
      workingShelfLabel: 'Bereich „In Arbeit“',
      workingShelfDesc: 'Arbeitende und wartende Threads im Bereich „In Arbeit“ bündeln. Ungelesene Ergebnisse kehren in den Posteingang zurück.',
      timeFormatLabel: 'Uhrzeitformat',
      timeFormatDesc: 'Gilt für Weckzeiten im Zurückstellen-Menü. Systemstandard folgt der Betriebssystemuhr.',
      timeFormatLocale: 'Systemstandard',
      timeFormat12: '12-Stunden-Format',
      timeFormat24: '24-Stunden-Format',
      snoozeOptionsTitle: 'Zurückstellen-Kurzbefehle',
      snoozeOptionsHelp: 'Wähle die Zeiten, die im Menü „Zurückstellen“ angezeigt werden.',
      editShortcuts: 'Kurzbefehle bearbeiten',
      hideShortcuts: 'Kurzbefehle ausblenden',
      editOption: 'Bearbeiten',
      doneEditingOption: 'Fertig',
      removeOption: 'Entfernen',
      resetLabel: 'Zurücksetzen',
      addOption: '+ Option hinzufügen',
      maxOptionsHint: 'Bis zu 8 Optionen',
      snoozeLoading: 'Optionen zum Zurückstellen werden noch geladen.',
      snoozeSaveConflict: 'Optionen zum Zurückstellen wurden anderswo geändert. Prüfe sie und versuche es erneut.',
      snoozeSaveFailed: 'Optionen zum Zurückstellen konnten nicht gespeichert werden. Bitte erneut versuchen.',
      snoozeOpenSettingsFailed: 'Optionen zum Zurückstellen konnten in den Einstellungen nicht geöffnet werden.',
      whenLabel: 'Wann',
      whenAfter: 'In',
      atWord: 'um',
      timeFieldLabel: 'Uhrzeit',
      passedToday: 'Für heute vorbei',
      duplicateOption: 'Duplikat einer Option oben',
      sameTimeOption: 'Gleiche Zeit wie eine Option oben',
      removeSnoozeOption: 'Zurückstellen-Option {index} entfernen',
      snoozeOptionItem: 'Zurückstellen-Option {index}',
      amountLabel: 'Menge',
      decrease: 'Verringern',
      increase: 'Erhöhen',
      unitLabel: 'Einheit',
      dayToday: 'Heute',
      dayTomorrow: 'Morgen',
      dayMonday: 'Montag',
      dayTuesday: 'Dienstag',
      dayWednesday: 'Mittwoch',
      dayThursday: 'Donnerstag',
      dayFriday: 'Freitag',
      daySaturday: 'Samstag',
      daySunday: 'Sonntag',
      nextSunday: 'Nächsten Sonntag',
      nextMonday: 'Nächsten Montag',
      nextTuesday: 'Nächsten Dienstag',
      nextWednesday: 'Nächsten Mittwoch',
      nextThursday: 'Nächsten Donnerstag',
      nextFriday: 'Nächsten Freitag',
      nextSaturday: 'Nächsten Samstag',
      workingSection: 'In Arbeit',
      showMoreOne: '{count} weiteren anzeigen',
      snoozeInMinuteFew: 'In {count} Minuten',
      snoozeInHourFew: 'In {count} Stunden',
      snoozeInDayFew: 'In {count} Tagen',
    };
    const ru = {
      inbox: 'Входящие',
      inboxView: 'Режим входящих',
      workspacesView: 'Режим рабочих областей',
      expandInbox: 'Развернуть входящие',
      search: 'Поиск',
      searchThreads: 'Поиск тредов',
      searchResults: 'Результаты поиска тредов',
      newSession: 'Новый тред',
      needsYou: 'Ввод',
      working: 'Работает',
      snoozed: 'Отложенные',
      settled: 'Разобранные',
      pinned: 'Закреплённые',
      active: 'Активные',
      all: 'Все проекты',
      filterWorkspace: 'Фильтр тредов по проекту',
      filterWorkspaceSelected: 'Фильтр тредов по проекту: {projects}',
      searchProjects: 'Поиск проектов...',
      addProject: 'Добавить проект',
      noProjects: 'Нет подходящих проектов.',
      addProjectUnavailable: 'Добавление проекта недоступно в этом режиме.',
      empty: 'Тредов пока нет',
      emptySearch: 'Треды не найдены',
      clearSearch: 'Очистить поиск тредов',
      noProjectsYet: 'Проектов пока нет',
      noThreadsYet: 'Тредов пока нет',
      noThreadsInProjects: 'В этих проектах пока нет тредов',
      noThreadsInProject: 'В {name} пока нет тредов',
      running: 'Работает',
      idle: 'Простаивает',
      showMore: 'Показать ещё {count}',
      hideMore: 'Скрыть разобранные',
      sessionActions: 'Действия с тредом',
      settle: 'Разобрать',
      restore: 'Вернуть тред из разобранных',
      wake: 'Разбудить',
      wakeNow: 'Разбудить тред сейчас',
      pin: 'Закрепить',
      unpin: 'Открепить',
      unpinThread: 'Открепить тред',
      dropPin: 'Закрепить',
      dropUnpin: 'Открепить',
      dropSettle: 'Разобрать',
      dropUnsettle: 'Вернуть из разобранных',
      dropWake: 'Разбудить',
      undo: 'Отменить',
      undoButtonPlain: 'Отменить',
      settledNotice: 'Тред разобран',
      snoozedNotice: 'Тред отложен',
      restoredNotice: 'Тред возвращён из разобранных',
      wakeNotice: 'Тред разбужен',
      oneHour: 'Через 1 час',
      threeHours: 'Через 3 часа',
      thisMorning: 'Сегодня утром',
      thisAfternoon: 'Сегодня днём',
      thisEvening: 'Сегодня вечером',
      tomorrow: 'Завтра',
      nextWeek: 'На следующей неделе',
      snoozeInMinute: 'Через {count} минуту',
      snoozeInMinutes: 'Через {count} минут',
      snoozeInHour: 'Через {count} час',
      snoozeInHours: 'Через {count} часов',
      snoozeInDay: 'Через {count} день',
      snoozeInDays: 'Через {count} дней',
      snoozeTimePassed: 'Это время уже прошло. Выберите другое.',
      woke: 'Проснулся',
      deferred: 'Отложен',
      childResult: 'Результат субагента',
      actionFailed: 'Сбой действия во входящих',
      noCandidate: 'Больше нет активных тредов',
      dismiss: 'Закрыть',
      errorOccurred: 'Произошла ошибка',
      errSettleTitle: 'Не удалось отметить тред разобранным',
      errUnsettleTitle: 'Не удалось вернуть тред из разобранных',
      errSnoozeTitle: 'Не удалось отложить тред',
      errWakeTitle: 'Не удалось разбудить тред',
      errUnreadTitle: 'Не удалось обновить статус непрочитанного',
      errPinTitle: 'Не удалось закрепить тред',
      errUnpinTitle: 'Не удалось открепить тред',
      errUndoTitle: 'Не удалось отменить действие',
      errAddProjectTitle: 'Не удалось добавить проект',
      errRenameTitle: 'Не удалось переименовать тред',
      errArchiveTitle: 'Не удалось архивировать тред',
      errRefreshTitle: 'Не удалось обновить треды',
      errActionGeneric: 'Что-то пошло не так. Повторите попытку.',
      errStaleContext: 'Тред изменился до завершения действия. Повторите попытку.',
      errRefreshDesc: 'Повторите через мгновение.',
      errSessionMissing: 'Этот тред больше недоступен.',
      settleSession: 'Разобрать тред',
      unsettleSession: 'Вернуть тред из разобранных',
      snoozeAction: 'Отложить',
      snoozeSession: 'Отложить тред',
      wakeSession: 'Разбудить тред',
      markUnread: 'Отметить непрочитанным',
      filterBy: 'Фильтр: {name}',
      showAllProjects: 'Показать все проекты',
      settingsUnavailable: 'Настройки доступны после переключения в режим «Сессии».',
      approval: 'Подтверждение',
      failed: 'Ошибка',
      limited: 'Лимит',
      waiting: 'Ожидает',
      request: 'Запрос',
      done: 'Готово',
      dismissWoke: 'Скрыть уведомление о пробуждении',
      usageLimitReached: 'Достигнут лимит использования',
      customSnooze: 'Другое…',
      customSnoozeTitle: 'Тип расписания',
      customSnoozeConfirm: 'Отложить',
      customSnoozeCancel: 'Отмена',
      customSnoozeDialog: 'Отложить до…',
      customSnoozeHelp: 'Выберите, когда отложенные треды вернутся во входящие.',
      chooseSnoozeDate: 'Выберите дату, до которой отложить',
      prevMonth: 'Предыдущий месяц',
      nextMonth: 'Следующий месяц',
      snoozeDateLabel: 'Дата',
      snoozeTimeLabel: 'Время',
      snoozeModeDate: 'Дата и время',
      snoozeModeDuration: 'Длительность',
      snoozeAmount: 'Отложить на',
      snoozeUnit: 'Единица',
      decreaseDuration: 'Уменьшить длительность',
      increaseDuration: 'Увеличить длительность',
      editSnoozeOptions: 'Изменить варианты откладывания',
      close: 'Закрыть',
      unitMinutes: 'Минуты',
      unitHours: 'Часы',
      unitDays: 'Дни',
      durationInvalid: 'Введите положительную длительность.',
      snoozeInvalid: 'Выберите корректные дату и время в будущем.',
      workingFor: 'уже {time}',
      timeNow: 'сейчас',
      timeMinutes: '{count} мин',
      timeHours: '{count} ч',
      timeDays: '{count} д',
      elapsedSeconds: '{count} с',
      elapsedMinutes: '{count} мин',
      elapsedHoursMinutes: '{hours} ч {minutes} мин',
      wakeNowLabel: 'сейчас',
      wakeMinutes: '{count} мин',
      wakeHours: '{count} ч',
      wakeDays: '{count} д',
      actionBusy: 'Действие во входящих уже выполняется',
      settleBusy: 'Нельзя отметить разобранным, пока тред работает',
      settleNeedsYou: 'Нельзя отметить разобранным, пока ожидается ввод',
      settleNotReady: 'Пока нет новых результатов для разбора',
      snoozeNotReady: 'Для откладывания нужен завершённый простаивающий тред без очереди задач',
      cmdPreviousThread: 'Предыдущий тред',
      cmdNextThread: 'Следующий тред',
      cmdSettleThread: 'Отметить / вернуть из разобранных',
      cmdPinThread: 'Закрепить / открепить тред',
      cmdJumpThread: 'Перейти к треду {index}',
      undoSettled: 'Разобранные',
      undoSnoozed: 'Отложенные',
      undoUnpinned: 'Откреплено',
      undoSettledOne: 'Разобран,',
      undoSettledMany: 'Разобрано: {count},',
      undoSnoozedOne: 'Отложен,',
      undoSnoozedMany: 'Отложено: {count},',
      undoUnpinnedOne: 'Откреплён,',
      undoUnpinnedMany: 'Откреплено: {count},',
      undoToUndo: '{shortcut} — отменить',
      undoScreenSummary: '{action}: {count}',
      unpinBatch: 'Открепить ({count})',
      settleBatch: 'Разобрать ({count})',
      unsettleBatch: 'Вернуть из разобранных ({count})',
      wakeBatch: 'Разбудить ({count})',
      snoozeBatch: 'Отложить ({count})',
      markUnreadBatch: 'Отметить непрочитанными ({count})',
      archiveBatch: 'Архивировать ({count})',
      sweepSettle: 'Разобрать',
      sweepUnsettle: 'Вернуть из разобранных',
      sweepWake: 'Разбудить',
      batchActions: 'Пакетные действия с тредами',
      customSnoozeBatchHelp: 'Выберите, когда отложенные треды ({count}) вернутся во входящие.',
      threadTitle: 'Название треда',
      newThreadInTitle: 'Новый тред в...',
      newThreadInHint: 'Новый тред в текущем проекте: Shift+клик',
      worktreeLabel: 'Рабочее дерево: {branch}',
      inboxSettings: 'Настройки T3 Inbox',
      settings: 'Настройки',
      sidebarView: 'Вид боковой панели',
      sidebarBackground: 'Фон',
      sidebarBackgroundDesc: 'Следовать текущей теме DSH или выбрать цвета для этой боковой панели.',
      sidebarBackgroundT3: 'Цвета T3',
      sidebarBackgroundHost: 'Тема DSH (по умолчанию)',
      sidebarBackgroundCustom: 'Свои цвета',
      sidebarLightColor: 'Цвет в светлой теме',
      sidebarDarkColor: 'Цвет в тёмной теме',
      settingsAppearanceSection: 'Внешний вид и макет',
      settingsBehaviorSection: 'Поведение входящих',
      globalPanelsLabel: 'Глобальные панели',
      globalPanelsDesc: 'Выберите, где отображать плагины, задачи автоматизации и другие глобальные панели.',
      globalPanelsFooter: 'Внизу (по умолчанию)',
      globalPanelsTop: 'Сверху',
      globalPanelsHidden: 'Скрыто',
      moreGlobalPanels: 'Ещё панели',
      workingShelfLabel: 'Раздел «В работе»',
      workingShelfDesc: 'Сворачивать работающие и ожидающие треды в раздел «В работе». Непрочитанные результаты возвращаются во входящие.',
      timeFormatLabel: 'Формат времени',
      timeFormatDesc: 'Применяется ко времени пробуждения в меню откладывания. «Как в системе» следует часам ОС.',
      timeFormatLocale: 'Как в системе',
      timeFormat12: '12-часовой',
      timeFormat24: '24-часовой',
      snoozeOptionsTitle: 'Быстрые варианты откладывания',
      snoozeOptionsHelp: 'Выберите время, отображаемое в меню «Отложить».',
      editShortcuts: 'Изменить варианты',
      hideShortcuts: 'Скрыть варианты',
      editOption: 'Изменить',
      doneEditingOption: 'Готово',
      removeOption: 'Удалить',
      resetLabel: 'Сбросить',
      addOption: '+ Добавить вариант',
      maxOptionsHint: 'Не более 8 вариантов',
      snoozeLoading: 'Варианты откладывания ещё загружаются.',
      snoozeSaveConflict: 'Варианты откладывания изменились в другом месте. Проверьте и повторите попытку.',
      snoozeSaveFailed: 'Не удалось сохранить варианты откладывания. Повторите попытку.',
      snoozeOpenSettingsFailed: 'Не удалось открыть варианты откладывания в Настройках.',
      whenLabel: 'Когда',
      whenAfter: 'Через',
      atWord: 'в',
      timeFieldLabel: 'Время',
      passedToday: 'На сегодня уже прошло',
      duplicateOption: 'Повторяет вариант выше',
      sameTimeOption: 'То же время, что у варианта выше',
      removeSnoozeOption: 'Удалить вариант откладывания {index}',
      snoozeOptionItem: 'Вариант откладывания {index}',
      amountLabel: 'Количество',
      decrease: 'Уменьшить',
      increase: 'Увеличить',
      unitLabel: 'Единица',
      dayToday: 'Сегодня',
      dayTomorrow: 'Завтра',
      dayMonday: 'Понедельник',
      dayTuesday: 'Вторник',
      dayWednesday: 'Среда',
      dayThursday: 'Четверг',
      dayFriday: 'Пятница',
      daySaturday: 'Суббота',
      daySunday: 'Воскресенье',
      nextSunday: 'В следующее воскресенье',
      nextMonday: 'В следующий понедельник',
      nextTuesday: 'В следующий вторник',
      nextWednesday: 'В следующую среду',
      nextThursday: 'В следующий четверг',
      nextFriday: 'В следующую пятницу',
      nextSaturday: 'В следующую субботу',
      workingSection: 'В работе',
      showMoreOne: 'Показать ещё {count}',
      snoozeInMinuteFew: 'Через {count} минуты',
      snoozeInHourFew: 'Через {count} часа',
      snoozeInDayFew: 'Через {count} дня',
    };
    const pt = {
      inbox: 'Caixa de entrada',
      inboxView: 'Visualização da caixa de entrada',
      workspacesView: 'Visualização de workspaces',
      expandInbox: 'Expandir caixa de entrada',
      search: 'Pesquisar',
      searchThreads: 'Pesquisar threads',
      searchResults: 'Resultados da pesquisa de threads',
      newSession: 'Nova thread',
      needsYou: 'Resposta',
      working: 'Trabalhando',
      snoozed: 'Adiadas',
      settled: 'Concluídas',
      pinned: 'Fixadas',
      active: 'Ativas',
      all: 'Todos os projetos',
      filterWorkspace: 'Filtrar threads por projeto',
      filterWorkspaceSelected: 'Filtrar threads por projeto: {projects}',
      searchProjects: 'Pesquisar projetos...',
      addProject: 'Adicionar projeto',
      noProjects: 'Nenhum projeto correspondente.',
      addProjectUnavailable: 'Adicionar projeto não está disponível neste modo.',
      empty: 'Nenhuma thread ainda',
      emptySearch: 'Nenhuma thread encontrada',
      clearSearch: 'Limpar pesquisa de threads',
      noProjectsYet: 'Nenhum projeto ainda',
      noThreadsYet: 'Nenhuma thread ainda',
      noThreadsInProjects: 'Ainda não há threads nestes projetos',
      noThreadsInProject: 'Ainda não há threads em {name}',
      running: 'Trabalhando',
      idle: 'Ocioso',
      showMore: 'Mostrar mais {count}',
      hideMore: 'Ocultar concluídas',
      sessionActions: 'Ações da thread',
      settle: 'Concluir',
      restore: 'Reabrir thread',
      wake: 'Despertar',
      wakeNow: 'Despertar thread agora',
      pin: 'Fixar',
      unpin: 'Desafixar',
      unpinThread: 'Desafixar thread',
      dropPin: 'Fixar',
      dropUnpin: 'Desafixar',
      dropSettle: 'Concluir',
      dropUnsettle: 'Reabrir',
      dropWake: 'Despertar',
      undo: 'Desfazer',
      undoButtonPlain: 'Desfazer',
      settledNotice: 'Thread concluída',
      snoozedNotice: 'Thread adiada',
      restoredNotice: 'Thread reaberta',
      wakeNotice: 'Thread despertada',
      oneHour: 'Em 1 hora',
      threeHours: 'Em 3 horas',
      thisMorning: 'Hoje de manhã',
      thisAfternoon: 'Hoje à tarde',
      thisEvening: 'Hoje à noite',
      tomorrow: 'Amanhã',
      nextWeek: 'Na próxima semana',
      snoozeInMinute: 'Em {count} minuto',
      snoozeInMinutes: 'Em {count} minutos',
      snoozeInHour: 'Em {count} hora',
      snoozeInHours: 'Em {count} horas',
      snoozeInDay: 'Em {count} dia',
      snoozeInDays: 'Em {count} dias',
      snoozeTimePassed: 'Esse horário já passou. Escolha outro horário.',
      woke: 'Despertou',
      deferred: 'Adiada',
      childResult: 'Resultado do subagente',
      actionFailed: 'Falha na ação da caixa de entrada',
      noCandidate: 'Não há mais threads ativas',
      dismiss: 'Dispensar',
      errorOccurred: 'Ocorreu um erro',
      errSettleTitle: 'Falha ao concluir a thread',
      errUnsettleTitle: 'Falha ao reabrir a thread',
      errSnoozeTitle: 'Falha ao adiar a thread',
      errWakeTitle: 'Falha ao despertar a thread',
      errUnreadTitle: 'Falha ao atualizar o estado de não lida',
      errPinTitle: 'Falha ao fixar a thread',
      errUnpinTitle: 'Falha ao desafixar a thread',
      errUndoTitle: 'Falha ao desfazer a ação',
      errAddProjectTitle: 'Falha ao adicionar o projeto',
      errRenameTitle: 'Falha ao renomear a thread',
      errArchiveTitle: 'Falha ao arquivar a thread',
      errRefreshTitle: 'Não foi possível atualizar as threads',
      errActionGeneric: 'Algo deu errado. Tente novamente.',
      errStaleContext: 'Esta thread mudou antes de a ação ser concluída. Tente novamente.',
      errRefreshDesc: 'Tente novamente em instantes.',
      errSessionMissing: 'Essa thread não está mais disponível.',
      settleSession: 'Concluir thread',
      unsettleSession: 'Reabrir thread',
      snoozeAction: 'Adiar',
      snoozeSession: 'Adiar thread',
      wakeSession: 'Despertar thread',
      markUnread: 'Marcar como não lida',
      filterBy: 'Filtrar por {name}',
      showAllProjects: 'Mostrar todos os projetos',
      settingsUnavailable: 'As configurações ficam disponíveis após alternar para o modo Sessões.',
      approval: 'Aprovação',
      failed: 'Falhou',
      limited: 'Limitada',
      waiting: 'Aguardando',
      request: 'Pedido',
      done: 'Pronta',
      dismissWoke: 'Dispensar notificação de despertar',
      usageLimitReached: 'Limite de uso atingido',
      customSnooze: 'Personalizado…',
      customSnoozeTitle: 'Tipo de agendamento',
      customSnoozeConfirm: 'Adiar',
      customSnoozeCancel: 'Cancelar',
      customSnoozeDialog: 'Adiamento personalizado',
      customSnoozeHelp: 'Escolha quando as threads adiadas voltam para a caixa de entrada.',
      chooseSnoozeDate: 'Escolher data para adiar',
      prevMonth: 'Mês anterior',
      nextMonth: 'Próximo mês',
      snoozeDateLabel: 'Data',
      snoozeTimeLabel: 'Hora',
      snoozeModeDate: 'Data e hora',
      snoozeModeDuration: 'Duração',
      snoozeAmount: 'Adiar por',
      snoozeUnit: 'Unidade',
      decreaseDuration: 'Diminuir duração',
      increaseDuration: 'Aumentar duração',
      editSnoozeOptions: 'Editar opções de adiamento',
      close: 'Fechar',
      unitMinutes: 'Minutos',
      unitHours: 'Horas',
      unitDays: 'Dias',
      durationInvalid: 'Informe uma duração positiva.',
      snoozeInvalid: 'Escolha uma data e hora válidas no futuro.',
      workingFor: 'há {time}',
      timeNow: 'agora',
      timeMinutes: '{count}min',
      timeHours: '{count}h',
      timeDays: '{count}d',
      elapsedSeconds: '{count}s',
      elapsedMinutes: '{count}min',
      elapsedHoursMinutes: '{hours} h {minutes} min',
      wakeNowLabel: 'agora',
      wakeMinutes: '{count}min',
      wakeHours: '{count}h',
      wakeDays: '{count}d',
      actionBusy: 'Uma ação da caixa de entrada já está em andamento',
      settleBusy: 'Não é possível concluir enquanto a thread está trabalhando',
      settleNeedsYou: 'Não é possível concluir enquanto uma entrada estiver pendente',
      settleNotReady: 'Ainda não há novidades para concluir',
      snoozeNotReady: 'Adiar exige uma thread completa e ociosa sem trabalho na fila',
      cmdPreviousThread: 'Thread anterior',
      cmdNextThread: 'Próxima thread',
      cmdSettleThread: 'Alternar conclusão da thread',
      cmdPinThread: 'Fixar ou desafixar thread',
      cmdJumpThread: 'Ir para a thread {index}',
      undoSettled: 'Concluídas',
      undoSnoozed: 'Adiadas',
      undoUnpinned: 'Desafixadas',
      undoSettledOne: 'Concluída,',
      undoSettledMany: '{count} concluídas,',
      undoSnoozedOne: 'Adiada,',
      undoSnoozedMany: '{count} adiadas,',
      undoUnpinnedOne: 'Desafixada,',
      undoUnpinnedMany: '{count} desafixadas,',
      undoToUndo: '{shortcut} para desfazer',
      undoScreenSummary: '{action} ({count} threads)',
      unpinBatch: 'Desafixar ({count})',
      settleBatch: 'Concluir ({count})',
      unsettleBatch: 'Reabrir ({count})',
      wakeBatch: 'Despertar ({count})',
      snoozeBatch: 'Adiar ({count})',
      markUnreadBatch: 'Marcar como não lida ({count})',
      archiveBatch: 'Arquivar ({count})',
      sweepSettle: 'Concluir',
      sweepUnsettle: 'Reabrir',
      sweepWake: 'Despertar',
      batchActions: 'Ações em lote nas threads',
      customSnoozeBatchHelp: 'Escolha quando {count} threads adiadas voltam para a caixa de entrada.',
      threadTitle: 'Título da thread',
      newThreadInTitle: 'Nova thread em...',
      newThreadInHint: 'Nova thread no projeto atual: Shift+clique',
      worktreeLabel: 'Worktree: {branch}',
      inboxSettings: 'Configurações do T3 Inbox',
      settings: 'Configurações',
      sidebarView: 'Visualização da barra lateral',
      sidebarBackground: 'Fundo',
      sidebarBackgroundDesc: 'Seguir o tema atual do DSH ou escolher cores para esta barra lateral.',
      sidebarBackgroundT3: 'Cores do T3',
      sidebarBackgroundHost: 'Tema do DSH (padrão)',
      sidebarBackgroundCustom: 'Cores personalizadas',
      sidebarLightColor: 'Cor no modo claro',
      sidebarDarkColor: 'Cor no modo escuro',
      settingsAppearanceSection: 'Aparência e layout',
      settingsBehaviorSection: 'Comportamento',
      globalPanelsLabel: 'Painéis globais',
      globalPanelsDesc: 'Escolha onde plugins, tarefas de automação e outros painéis globais aparecem.',
      globalPanelsFooter: 'Rodapé (padrão)',
      globalPanelsTop: 'Topo',
      globalPanelsHidden: 'Oculto',
      moreGlobalPanels: 'Mais painéis',
      workingShelfLabel: 'Seção Trabalhando',
      workingShelfDesc: 'Agrupa as threads em execução e aguardando na seção Trabalhando. Resultados não lidos voltam à caixa de entrada.',
      timeFormatLabel: 'Formato de horário',
      timeFormatDesc: 'Aplica-se aos horários de retorno no menu Adiar. "Padrão do sistema" segue o relógio do SO.',
      timeFormatLocale: 'Padrão do sistema',
      timeFormat12: '12 horas',
      timeFormat24: '24 horas',
      snoozeOptionsTitle: 'Atalhos de adiamento',
      snoozeOptionsHelp: 'Escolha os horários exibidos no menu Adiar.',
      editShortcuts: 'Editar atalhos',
      hideShortcuts: 'Ocultar atalhos',
      editOption: 'Editar',
      doneEditingOption: 'Concluído',
      removeOption: 'Remover',
      resetLabel: 'Redefinir',
      addOption: '+ Adicionar opção',
      maxOptionsHint: 'Até 8 opções',
      snoozeLoading: 'As opções de adiamento ainda estão carregando.',
      snoozeSaveConflict: 'As opções de adiamento mudaram em outro lugar. Revise e tente novamente.',
      snoozeSaveFailed: 'Não foi possível salvar as opções de adiamento. Tente novamente.',
      snoozeOpenSettingsFailed: 'Não foi possível abrir as opções de adiamento nas Configurações.',
      whenLabel: 'Quando',
      whenAfter: 'Em',
      atWord: 'às',
      timeFieldLabel: 'Hora',
      passedToday: 'Já passou hoje',
      duplicateOption: 'Duplicata de uma opção acima',
      sameTimeOption: 'Mesmo horário de uma opção acima',
      removeSnoozeOption: 'Remover opção de adiamento {index}',
      snoozeOptionItem: 'Opção de adiamento {index}',
      amountLabel: 'Quantidade',
      decrease: 'Diminuir',
      increase: 'Aumentar',
      unitLabel: 'Unidade',
      dayToday: 'Hoje',
      dayTomorrow: 'Amanhã',
      dayMonday: 'Segunda-feira',
      dayTuesday: 'Terça-feira',
      dayWednesday: 'Quarta-feira',
      dayThursday: 'Quinta-feira',
      dayFriday: 'Sexta-feira',
      daySaturday: 'Sábado',
      daySunday: 'Domingo',
      nextSunday: 'No próximo domingo',
      nextMonday: 'Na próxima segunda',
      nextTuesday: 'Na próxima terça',
      nextWednesday: 'Na próxima quarta',
      nextThursday: 'Na próxima quinta',
      nextFriday: 'Na próxima sexta',
      nextSaturday: 'No próximo sábado',
      workingSection: 'Trabalhando',
      showMoreOne: 'Mostrar mais {count}',
      snoozeInMinuteFew: 'Em {count} minutos',
      snoozeInHourFew: 'Em {count} horas',
      snoozeInDayFew: 'Em {count} dias',
    };
    const LOCALES = Object.freeze({ en, zh, ja, es, fr, de, ru, pt });

    const styles = `
      .t3i-root { --t3i-accent:#1b4ed8; --t3i-row-hover:var(--dsw-alias-interactive-bg-hover, rgb(38 49 72 / .06)); --t3i-row-active:color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 86%, transparent); --t3i-row-selected:color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 72%, transparent); --t3i-row-active-shadow:inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 7%, transparent), 0 1px 2px color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 5%, transparent); --t3i-row-selected-shadow:inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 7%, transparent); --t3i-control-hover:var(--dsw-alias-interactive-bg-hover, rgb(38 49 72 / .06)); --t3i-control-active:var(--dsw-alias-interactive-bg-active, rgb(38 49 72 / .10)); --t3i-search-focus:color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 86%, transparent); --t3i-dragging-bg:color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 96%, transparent); --t3i-dragging-shadow:0 10px 24px rgb(0 0 0 / .24); --t3i-scope-cutout:color-mix(in srgb, var(--dsw-specific-sidebar-fill, #f9fafb) 90%, var(--dsw-alias-label-primary, #0f1115) 10%); --t3i-secondary-label:var(--dsw-alias-label-secondary); --t3i-recede-title:color-mix(in srgb, var(--dsw-alias-label-primary) 76%, transparent); --t3i-settled-title:var(--t3i-secondary-label); box-sizing:border-box; display:flex; flex:1; min-width:0; min-height:0; flex-direction:column; overflow-x:clip; color:var(--dsw-alias-label-primary); font:inherit; user-select:none; -webkit-user-select:none; }
      html[data-t3-inbox-background="t3"] .t3i-root { --t3i-row-hover:oklch(99.2% 0 0); --t3i-row-active:#fff; --t3i-row-selected:#fff; --t3i-row-active-shadow:inset 0 0 0 1px color-mix(in oklab, oklch(92% .004 286.32) 70%, transparent); --t3i-row-selected-shadow:inset 0 0 0 1px color-mix(in oklab, oklch(92% .004 286.32) 70%, transparent); --t3i-control-hover:oklch(99.2% 0 0); --t3i-control-active:color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 6%, transparent); --t3i-search-focus:#fff; --t3i-dragging-bg:#fff; --t3i-scope-cutout:var(--t3i-sidebar-background); }
      html[data-t3-inbox-background="custom"] .t3i-root { --t3i-scope-cutout:var(--t3i-sidebar-background); }
      html body[data-ds-dark-theme] .t3i-root { --t3i-accent:#346bf1; --t3i-row-hover:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); --t3i-row-active:color-mix(in srgb, var(--dsw-alias-label-primary) 11%, transparent); --t3i-row-selected:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); --t3i-row-active-shadow:none; --t3i-row-selected-shadow:none; --t3i-control-hover:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); --t3i-control-active:color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent); --t3i-search-focus:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); --t3i-dragging-bg:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 92%, var(--dsw-alias-label-primary) 8%); --t3i-dragging-shadow:0 10px 24px rgb(0 0 0 / .48); --t3i-scope-cutout:var(--t3i-sidebar-background, var(--dsw-specific-sidebar-fill, #1b1b1c)); --t3i-secondary-label:color-mix(in srgb, var(--dsw-alias-label-primary) 58%, transparent); --t3i-recede-title:color-mix(in srgb, var(--dsw-alias-label-primary) 75%, transparent); }
      .t3i-filter-popover, .t3i-modal, .t3i-new-menu { --t3i-accent:#1b4ed8; }
      body[data-ds-dark-theme] .t3i-filter-popover, body[data-ds-dark-theme] .t3i-modal, body[data-ds-dark-theme] .t3i-new-menu { --t3i-accent:#346bf1; }
      .t3i-root *, .t3i-home * { box-sizing:border-box; }
      .t3i-settings { display:flex; flex-direction:column; color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; }
      .t3i-settings [role="alert"] { color:var(--dsw-alias-state-error-primary, #c10007); margin:4px 0 8px; font-size:12px; }
      body[data-ds-dark-theme] .t3i-settings [role="alert"] { color:#f87171; }
      .t3i-settings-row { display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin:5px 0; }
      .t3i-settings-group { display:flex; flex-direction:column; padding-top:18px; }
      .t3i-settings-group + .t3i-settings-group { margin-top:2px; border-top:.5px solid var(--dsw-alias-border-l2); }
      .t3i-settings-group-title { margin:0 0 2px; font-size:12px; font-weight:500; line-height:18px; color:var(--dsw-alias-label-secondary); }
      .t3i-settings-pref { display:flex; align-items:center; gap:8px; padding:14px 0; border-bottom:.5px solid var(--dsw-alias-border-l2); }
      .t3i-settings-group > .t3i-settings-pref:last-child, .t3i-settings-pref:last-child, .t3i-settings-pref[data-expanded="true"] { border-bottom:0; }
      .t3i-settings-pref[data-expanded="true"] { padding-bottom:10px; }
      .t3i-settings-pref-text { display:flex; flex-direction:column; gap:4px; min-width:0; flex:1; padding-inline-end:16px; }
      .t3i-settings-pref-title { font-size:14px; font-weight:400; line-height:22px; color:var(--dsw-alias-label-primary); }
      .t3i-settings-pref-desc { font-size:12px; color:var(--dsw-alias-label-secondary); line-height:18px; }
      .t3i-settings-view { display:flex; flex-direction:column; gap:8px; padding:0 0 18px; border-bottom:.5px solid var(--dsw-alias-border-l2); }
      .t3i-settings-view:last-child { border-bottom:0; padding-bottom:0; }
      .t3i-settings-view-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
      .t3i-settings-view-option { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; box-sizing:border-box; min-height:76px; padding:12px 10px; border:1px solid var(--dsw-alias-border-l2); border-radius:var(--dsw-radius-lg,14px); color:var(--dsw-alias-label-secondary); background:transparent; font:inherit; line-height:22px; cursor:pointer; transition:background-color 120ms ease, border-color 120ms ease, color 120ms ease; }
      .t3i-settings-view-option:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-interactive-bg-hover); }
      .t3i-settings-view-option[aria-pressed="true"] { color:var(--dsw-alias-label-primary); font-weight:500; border-color:var(--dsw-alias-border-selected, var(--dsw-alias-border-l4)); background:var(--dsw-alias-bg-module-platform); }
      .t3i-settings-toggle { width:16px; height:16px; accent-color:var(--t3i-accent, #1b4ed8); cursor:pointer; }
      .t3i-settings-subpanel { margin:0 0 14px; padding:6px 14px 12px; border:1px solid var(--dsw-alias-border-l2); border-radius:12px; background:color-mix(in srgb, var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-1)) 58%, transparent); }
      .t3i-settings-subpanel[hidden] { display:none; }
      .t3i-settings-subpanel:not([hidden]) + .t3i-settings-pref { border-top:.5px solid var(--dsw-alias-border-l2); }
      .t3i-settings-colors { padding:4px 14px; }
      .t3i-settings-colors .t3i-settings-pref { padding:10px 0; }
      .t3i-settings-colors .t3i-settings-pref:last-child { border-bottom:0; }
      .t3i-settings-color-control { display:inline-flex; align-items:center; gap:8px; flex:none; }
      .t3i-settings-color-hex { font-size:12px; color:var(--dsw-alias-label-secondary); font-variant-numeric:tabular-nums; }
      .t3i-settings-editor select, .t3i-settings input[type=color], .t3i-settings-editor input, .t3i-settings-stepper { box-sizing:border-box; height:28px; border:1px solid var(--dsw-alias-border-l1); border-radius:var(--dsw-radius-sm,6px); color:inherit; background:var(--dsw-alias-bg-layer-1); font:inherit; font-size:13px; }
      .t3i-settings-editor select { width:112px; padding:0 7px; }
      .t3i-settings input[type=color] { width:38px; padding:2px 4px; cursor:pointer; }
      .t3i-settings input[type=time] { width:104px; padding:0 7px; }
      .t3i-settings-stepper { display:inline-flex; align-items:center; width:100px; overflow:hidden; }
      .t3i-settings-stepper input { border:0; border-radius:0; width:44px; min-width:0; height:26px; padding:0; text-align:center; appearance:textfield; -moz-appearance:textfield; }
      .t3i-settings-stepper input::-webkit-inner-spin-button, .t3i-settings-stepper input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      .t3i-settings-editor button:not(.t3i-setting-control):not(.t3i-setting-subcontrol) { font:inherit; color:inherit; background:transparent; border:0; border-radius:var(--dsw-radius-sm,6px); cursor:pointer; }
      .t3i-settings-editor button:not(.t3i-setting-control):not(.t3i-setting-subcontrol):hover { background:var(--dsw-alias-interactive-bg-hover); }
      .t3i-settings-editor button:disabled { opacity:.4; cursor:default; }
      .t3i-settings-stepper button { width:27px; height:26px; font-size:17px; padding:0; }
      .t3i-settings-editor small { color:var(--dsw-alias-label-secondary); font-size:12px; }
      .t3i-settings .t3i-setting-control { display:inline-flex; align-items:center; justify-content:center; gap:12px; flex:none; box-sizing:border-box; min-height:36px; max-width:55%; white-space:nowrap; padding:0 14px; border:0; border-radius:var(--dsw-radius-md,10px); background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-1)); color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; line-height:22px; cursor:pointer; }
      .t3i-setting-choice { flex:none; min-width:0; max-width:55%; }
      .t3i-settings .t3i-setting-choice .t3i-setting-control { max-width:100%; }
      .t3i-setting-choice-label { min-width:0; overflow:hidden; text-overflow:ellipsis; }
      .t3i-setting-control > svg { flex:none; }
      .t3i-settings .t3i-setting-control:hover { background:var(--dsw-alias-interactive-bg-hover); }
      .t3i-setting-control:focus-visible, .t3i-setting-subcontrol:focus-visible, .t3i-settings-view-option:focus-visible { outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary)); outline-offset:2px; }
      .t3i-setting-subcontrol { display:inline-flex; align-items:center; justify-content:center; flex:none; min-height:28px; padding:0 10px; border:1px solid var(--dsw-alias-border-l2); border-radius:7px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:12.5px; line-height:18px; white-space:nowrap; cursor:pointer; }
      .t3i-setting-subcontrol:hover:not(:disabled) { background:var(--dsw-alias-interactive-bg-hover); }
      .t3i-setting-subcontrol:disabled { opacity:.4; cursor:default; }
      .t3i-setting-subcontrol.t3i-setting-danger { margin-left:auto; color:var(--dsw-alias-label-secondary); }
      .t3i-setting-subcontrol.t3i-setting-danger:hover:not(:disabled) { color:var(--dsw-alias-state-error-primary, #c10007); border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary, #c10007) 35%, transparent); }
      body[data-ds-dark-theme] .t3i-setting-subcontrol.t3i-setting-danger:hover:not(:disabled) { color:#f87171; border-color:color-mix(in srgb, #f87171 35%, transparent); }
      .t3i-settings-option { border-bottom:.5px solid var(--dsw-alias-border-l2); }
      .t3i-settings-option:last-of-type { border-bottom:0; }
      .t3i-settings-option .t3i-settings-pref { padding:9px 0; border:0; gap:10px; }
      .t3i-settings-option .t3i-settings-pref-title { font-size:13.5px; line-height:20px; }
      .t3i-settings-option .t3i-settings-pref-desc { color:#bb4d00; }
      body[data-ds-dark-theme] .t3i-settings-option .t3i-settings-pref-desc { color:#fbbf24; }
      .t3i-settings-option-meta { display:inline-flex; align-items:center; gap:10px; flex:none; }
      .t3i-settings-option-when { font-size:12px; color:var(--dsw-alias-label-secondary); font-variant-numeric:tabular-nums; white-space:nowrap; }
      .t3i-settings-option-fields { margin:0 0 10px; padding:10px 12px; border-radius:8px; border-left:2px solid var(--t3i-accent, #1b4ed8); background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent); }
      .t3i-settings-option-fields[hidden] { display:none; }
      .t3i-settings-option-fields .t3i-settings-row { margin:0; gap:8px; }
      .t3i-settings-actions { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:8px; padding-top:10px; border-top:.5px solid var(--dsw-alias-border-l2); }
      .t3i-head { position:relative; padding:8px; -webkit-app-region:no-drag; app-region:no-drag; overflow:visible; }
      .t3i-head input, .t3i-head button, .t3i-head select, .t3i-head .t3i-search-wrap { -webkit-app-region:no-drag; app-region:no-drag; }
      .t3i-title-row { display:flex; align-items:center; gap:4px; min-height:32px; }
      .t3i-head-actions { display:flex; flex:none; align-items:center; gap:0; }
      .t3i-title { display:none; }
      .t3i-search-wrap { position:relative; display:flex; flex:1; align-items:center; gap:8px; min-width:0; height:32px; padding:0 8px; border-radius:6px; color:var(--t3i-secondary-label); }
      .t3i-search-wrap:hover:not(:focus-within) { background:var(--t3i-row-hover); color:var(--dsw-alias-label-primary); }
      .t3i-search-wrap:focus-within { background:var(--t3i-search-focus); color:var(--dsw-alias-label-primary); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--t3i-accent, #1b4ed8) 70%, transparent); }
      .t3i-search::-webkit-search-cancel-button, .t3i-search::-webkit-search-decoration { display:none; }
      .t3i-search-clear { display:inline-flex; flex:none; align-items:center; justify-content:center; width:20px; height:20px; padding:0; border:0; border-radius:4px; color:var(--t3i-secondary-label); background:transparent; cursor:pointer; }
      .t3i-search-clear:hover { color:var(--dsw-alias-label-primary); background:var(--t3i-control-hover); }
      .t3i-search-icon { flex:none; opacity:.85; pointer-events:none; }
      .t3i-search { flex:1; width:100%; min-width:0; height:32px; padding:0; border:0; border-radius:6px; outline:0; color:var(--dsw-alias-label-primary); background:transparent; font:inherit; font-size:14px; font-weight:500; }
      .t3i-search::placeholder { color:var(--t3i-secondary-label); font-weight:500; opacity:1; }
      .t3i-count { display:inline-flex; align-items:center; justify-content:center; min-width:17px; height:17px; padding:0 5px; border-radius:999px; background:color-mix(in srgb, #3b82f6 20%, transparent); color:#60a5fa; font-size:10.5px; font-weight:600; font-variant-numeric:tabular-nums; }
      .t3i-icon-button { position:relative; display:inline-flex; flex:none; align-items:center; justify-content:center; width:28px; height:28px; padding:0; border:0; border-radius:6px; color:var(--t3i-secondary-label); background:transparent; cursor:pointer; }
      .t3i-icon-button:hover { color:var(--dsw-alias-label-primary); background:var(--t3i-control-hover); }
      .t3i-icon-button[aria-expanded="true"], .t3i-icon-button[data-active="true"] { color:var(--dsw-alias-label-primary); background:var(--t3i-control-active); }
      .t3i-icon-button[data-active="true"]::after { content:''; position:absolute; right:4px; top:4px; width:5px; height:5px; border-radius:50%; background:var(--t3i-accent, #1b4ed8); }
      .t3i-project-filter[data-active="true"]::after { display:none; }
      .t3i-project-filter[data-active="true"]:not(:hover):not([aria-expanded="true"]) { background:transparent; }
      .t3i-icon-button:disabled { opacity:.35; cursor:not-allowed; }
      .t3i-icon-button:focus-visible, .t3i-snooze-action:focus-visible, .t3i-row:focus-visible, .t3i-action:focus-visible, .t3i-select:focus-visible, .t3i-preset:focus-visible, .t3i-primary-action:focus-visible, .t3i-slim-action:focus-visible, .t3i-context-item:focus-visible, .t3i-section-title:focus-visible, .t3i-toast-close:focus-visible { outline:2px solid var(--t3i-accent, #1b4ed8); outline-offset:-2px; }
      /* T3 selected row already has inset border ring — suppress brand focus outline on current. */
      .t3i-row[aria-current="page"]:focus-visible { outline:none; }
      .t3i-filter-anchor { position:relative; flex:none; }
      /* Fixed placement: absolute popovers expand host overflow and focus() scrolls the sidebar sideways. */
      .t3i-filter-popover { position:fixed; z-index:900; display:flex; flex-direction:column; max-height:min(20rem, 70vh); overflow:hidden; padding:4px 0 6px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 14px 36px -16px rgb(0 0 0 / .45); transform-origin:top center; animation:t3i-pop-in 150ms ease-out; }
      .t3i-new-menu { position:fixed; z-index:900; display:flex; flex-direction:column; min-width:196px; max-width:min(272px, calc(100vw - 16px)); max-height:min(20rem, 70vh); overflow:hidden; padding:4px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 14px 36px -16px rgb(0 0 0 / .45); transform-origin:top right; animation:t3i-pop-in 150ms ease-out; }
      .t3i-new-menu-label { padding:4px 8px 6px; font-size:11px; font-weight:500; color:var(--dsw-alias-label-secondary); }
      .t3i-new-menu-list { display:flex; flex-direction:column; gap:1px; overflow:auto; scrollbar-width:none; }
      .t3i-project-query { display:flex; flex:none; align-items:center; gap:6px; min-height:30px; margin:0 8px 2px; padding:4px 2px 8px; border:0; border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 70%, transparent); border-radius:0; color:var(--dsw-alias-label-secondary); background:transparent; }
      .t3i-project-query:focus-within { border-bottom-color:var(--t3i-accent, #1b4ed8); color:var(--dsw-alias-label-primary); }
      .t3i-project-query-input { flex:1; min-width:0; height:22px; padding:0; border:0; outline:0; color:var(--dsw-alias-label-primary); background:transparent; font:inherit; font-size:13px; }
      .t3i-project-options { flex:1; min-height:0; overflow:auto; padding:2px 4px 0; scrollbar-width:thin; }
      .t3i-project-option { display:flex; align-items:center; gap:8px; width:100%; min-height:28px; padding:4px 8px; border:0; border-radius:6px; color:var(--dsw-alias-label-primary); background:transparent; font:inherit; font-size:13px; text-align:left; cursor:pointer; }
      .t3i-project-option-label { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .t3i-project-option[data-highlighted="true"], .t3i-project-option:hover, .t3i-project-option:focus-visible { background:color-mix(in srgb, var(--dsw-alias-label-primary) 9%, transparent); outline:none; }
      .t3i-project-icon-wrap { position:relative; display:inline-flex; flex:none; align-items:center; justify-content:center; width:16px; height:16px; }
      .t3i-project-badge { position:absolute; right:-4px; bottom:-4px; display:grid; place-items:center; width:12px; height:12px; border-radius:999px; background:var(--t3i-accent, #1b4ed8); color:#fff; box-shadow:0 0 0 2px var(--dsw-alias-bg-layer-1); pointer-events:none; }
      .t3i-project-check { flex:none; width:14px; height:14px; color:var(--t3i-accent, #1b4ed8); }
      .t3i-filter-empty { padding:14px 8px; color:var(--dsw-alias-label-secondary); font-size:12px; text-align:center; }
      .t3i-scope-stack { display:inline-flex; align-items:center; }
      .t3i-scope-stack .t3i-mono, .t3i-scope-stack .t3i-mono svg { width:14px; height:14px; }
      .t3i-scope-stack .t3i-mono + .t3i-mono { margin-left:-4px; border-radius:25%; background:linear-gradient(color-mix(in srgb, currentColor 14%, transparent), color-mix(in srgb, currentColor 14%, transparent)), var(--t3i-scope-cutout); box-shadow:0 0 0 2px var(--t3i-scope-cutout); }
      .t3i-select-sr { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
      .t3i-toast-viewport { position:fixed; right:16px; bottom:16px; z-index:1200; max-width:min(360px, calc(100vw - 32px)); pointer-events:none; }
      .t3i-toast { pointer-events:auto; display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border:1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1)); border-radius:10px; background:var(--dsw-alias-bg-layer-2, #fff); color:var(--dsw-alias-label-primary); box-shadow:0 10px 28px rgba(0,0,0,.16), 0 2px 6px rgba(0,0,0,.08); font-size:12px; line-height:1.4; animation:t3i-toast-in 500ms cubic-bezier(.22,1,.36,1); }
      body[data-ds-dark-theme] .t3i-toast { background:var(--dsw-alias-bg-layer-2, #18181b); border-color:var(--dsw-alias-border-l2, rgba(255,255,255,.12)); box-shadow:0 12px 32px rgba(0,0,0,.5); }
      .t3i-toast-icon { flex:none; margin-top:1px; color:var(--dsw-alias-state-error-primary, #c10007); }
      body[data-ds-dark-theme] .t3i-toast-icon { color:#f87171; }
      .t3i-toast-body { flex:1; min-width:0; }
      .t3i-toast-title { font-weight:600; color:var(--dsw-alias-label-primary); }
      .t3i-toast-desc { margin-top:2px; color:var(--dsw-alias-label-secondary); overflow-wrap:anywhere; }
      .t3i-toast-close { display:grid; place-items:center; flex:none; width:22px; height:22px; margin:-2px -4px 0 0; padding:0; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
      .t3i-toast-close:hover { background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); }
      .t3i-undo { display:flex; align-items:center; gap:8px; margin:6px 8px 4px; padding:7px 10px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-secondary); font-size:11px; }
      .t3i-undo span { flex:1; }
      .t3i-scroll { --t3i-fade-top:0px; --t3i-fade-bottom:0px; display:flex; flex-direction:column; gap:1px; flex:1; min-height:0; overflow:auto; padding:0 8px 8px; scrollbar-width:none; -ms-overflow-style:none; -webkit-mask-image:linear-gradient(to bottom, transparent 0, black var(--t3i-fade-top), black calc(100% - var(--t3i-fade-bottom)), transparent 100%); mask-image:linear-gradient(to bottom, transparent 0, black var(--t3i-fade-top), black calc(100% - var(--t3i-fade-bottom)), transparent 100%); }
      .t3i-scroll:has(:focus-visible) { -webkit-mask-image:none; mask-image:none; }
      .t3i-scroll::-webkit-scrollbar { display:none; }
      .t3i-list { position:relative; display:flex; flex-direction:column; gap:1px; flex:1 0 auto; min-height:100%; margin:0; padding:0; list-style:none; }
      .t3i-section-header { list-style:none; flex:none; margin:0; padding:0; }
      /* T3: first bottom shelf header gets mt-auto (Working > Snoozed > Settled). */
      .t3i-section-header[data-bottom-anchor="true"] { margin-top:auto; }
      .t3i-list-more { list-style:none; flex:none; margin:0; padding:0; }
      .t3i-section-title { display:flex; align-items:center; gap:8px; width:calc(100% - 4px); height:32px; min-height:32px; margin:0 2px; padding:0 8px; border:0; color:var(--t3i-secondary-label); background:transparent; font:inherit; font-size:12px; font-weight:500; text-align:left; cursor:pointer; }
      .t3i-section-title:hover { color:var(--dsw-alias-label-primary); }
      .t3i-section-label { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .t3i-section-right { display:inline-flex; align-items:center; gap:8px; margin-left:auto; font-size:12px; font-variant-numeric:tabular-nums; color:inherit; }
      .t3i-section-count { font-weight:400; }
      .t3i-section-chevron { transition:transform 150ms ease; }
      .t3i-section-title[aria-expanded="false"] .t3i-section-chevron { transform:rotate(-90deg); }
      .t3i-show-more { display:flex; align-items:center; gap:10px; width:100%; height:36px; min-height:36px; padding:0 10px; border:0; border-radius:6px; color:var(--t3i-secondary-label); background:transparent; font:inherit; font-size:14px; line-height:20px; text-align:left; cursor:pointer; }
      .t3i-show-more:hover { color:var(--dsw-alias-label-primary); background:var(--t3i-row-hover); }

      .t3i-item { position:relative; display:flex; min-width:0; margin:0; padding:0; list-style:none; border-radius:6px; }
      .t3i-item[data-drag-peer="true"] { transition:transform 150ms ease-out; }
      .t3i-drag-peer { transition:transform 150ms ease-out; }
      .t3i-item[data-dragging="true"] { z-index:20; opacity:1; cursor:grabbing; }
      .t3i-drag-boundary { position:relative; height:0; margin:0 2px -1px; padding:0; list-style:none; pointer-events:none; z-index:10; }
      .t3i-drag-boundary-label { position:absolute; left:8px; right:8px; top:4px; display:flex; align-items:center; gap:8px; height:16px; }
      .t3i-drag-boundary-text { flex:none; font-size:12px; font-weight:500; color:color-mix(in srgb, var(--dsw-alias-label-primary) 80%, transparent); }
      .t3i-drag-boundary[data-target="true"] .t3i-drag-boundary-text { color:var(--t3i-accent, #1b4ed8); }
      .t3i-drag-boundary-line { flex:1; height:1px; background:color-mix(in srgb, var(--dsw-alias-label-primary) 25%, transparent); }
      .t3i-drag-boundary[data-target="true"] .t3i-drag-boundary-line { background:color-mix(in srgb, var(--t3i-accent, #1b4ed8) 50%, transparent); }
      .t3i-section-title[data-drop-dragging="true"] { color:var(--dsw-alias-label-primary); }
      .t3i-section-title[data-drop-target="true"] { color:var(--t3i-accent, #1b4ed8); }
      .t3i-drop-placeholder { position:relative; height:0; margin:0 2px -1px; padding:0; list-style:none; pointer-events:none; transition:none; }
      .t3i-drop-placeholder-box { position:absolute; left:0; right:0; top:0; display:flex; align-items:center; justify-content:center; height:36px; border:1px dashed color-mix(in srgb, var(--dsw-alias-label-primary) 25%, transparent); border-radius:6px; font-size:12px; color:color-mix(in srgb, var(--dsw-alias-label-primary) 80%, transparent); }
      .t3i-drop-placeholder[data-target="true"] .t3i-drop-placeholder-box { border-color:color-mix(in srgb, var(--t3i-accent, #1b4ed8) 40%, transparent); background:color-mix(in srgb, var(--t3i-accent, #1b4ed8) 5%, transparent); color:var(--t3i-accent, #1b4ed8); }
      .t3i-inline-drop-verb { margin-left:auto; display:inline-flex; flex:none; align-items:center; gap:4px; height:20px; padding:0 6px; border:1px solid color-mix(in srgb, var(--t3i-accent, #1b4ed8) 40%, transparent); border-radius:4px; background:color-mix(in srgb, var(--t3i-accent, #1b4ed8) 10%, transparent); color:var(--t3i-accent, #1b4ed8); font-size:11px; font-weight:500; white-space:nowrap; pointer-events:none; }
      .t3i-item[data-drag-enabled="true"] { cursor:grab; }
      /* T3 Nightly: li.py-0.5 (=2px) wraps card; card ~60px → pitch 64; metaLine card 78 → li 82. */
      .t3i-item[data-variant="card"] { margin:0; padding:2px 0; border-radius:0; background:transparent; box-shadow:none; }
      /* Row surface hierarchy adapts to host vibrancy gray, T3 #fafafa, and dark mode via --t3i-row-* tokens. */
      .t3i-item[data-variant="card"] .t3i-row:hover:not([aria-current="page"]),
      .t3i-item[data-variant="compact"] .t3i-row:hover:not([aria-current="page"]) { background:var(--t3i-row-hover); }
      .t3i-item[data-variant="card"][data-selected="true"] .t3i-row:not([aria-current="page"]),
      .t3i-item[data-variant="card"][data-sweep] .t3i-row:not([aria-current="page"]),
      .t3i-item[data-variant="compact"][data-selected="true"] .t3i-row:not([aria-current="page"]),
      .t3i-item[data-variant="compact"][data-sweep] .t3i-row:not([aria-current="page"]) { background:var(--t3i-row-selected); box-shadow:var(--t3i-row-selected-shadow); }
      .t3i-item[data-variant="card"] .t3i-row[aria-current="page"],
      .t3i-item[data-variant="compact"] .t3i-row[aria-current="page"] { background:var(--t3i-row-active); box-shadow:var(--t3i-row-active-shadow); }
      .t3i-root .t3i-item[data-variant][data-dragging="true"] .t3i-row { background:var(--t3i-dragging-bg); box-shadow:var(--t3i-dragging-shadow); }
      /* T3 shouldRecede: metadata stays secondary-label; title dims to --t3i-recede-title (400); working dims to 0.7 */
      .t3i-item[data-recede="true"] .t3i-row { color:var(--t3i-secondary-label); }
      .t3i-item[data-recede="true"] .t3i-row-title { color:var(--t3i-recede-title); font-weight:400; }
      .t3i-item[data-recede="true"][data-working="true"] .t3i-row { opacity:.7; transition:opacity 150ms ease,background-color 120ms ease,color 120ms ease; }
      .t3i-item[data-recede="true"][data-working="true"]:hover .t3i-row,
      .t3i-item[data-recede="true"][data-working="true"]:focus-within .t3i-row { opacity:1; }
      .t3i-item[data-recede="true"]:hover .t3i-row, .t3i-item[data-recede="true"]:focus-within .t3i-row { color:var(--dsw-alias-label-primary); }
      .t3i-item[data-recede="true"]:hover .t3i-row-title, .t3i-item[data-recede="true"]:focus-within .t3i-row-title { color:var(--dsw-alias-label-primary); }
      /* T3: failed && !unread && !woke stays font-medium but text-foreground/95. */
      .t3i-item[data-failed-read="true"] .t3i-row-title { color:color-mix(in srgb, var(--dsw-alias-label-primary) 95%, transparent); }
      .t3i-row { display:flex; flex:1; width:100%; min-width:0; border:0; border-radius:6px; color:var(--dsw-alias-label-primary); background:transparent; font:inherit; text-align:left; cursor:pointer; }
      /* Selected/hover painted above on card/compact variants — do not zero them here. */

      /* Rich Two-Line Card (Active / Pinned / Working / Snoozed) */
      /* T3 Nightly: h-auto + px-(--sidebar-row-content-inset=.625rem) + py-(--sidebar-content-inset=.5rem); title mt-1 → ~60px */
      .t3i-item[data-variant="card"] .t3i-row { flex-direction:column; align-items:stretch; justify-content:flex-start; gap:0; height:auto; padding:0.5rem 0.625rem; border-radius:6px; box-sizing:border-box; }
      .t3i-card-top { display:flex; align-items:center; justify-content:space-between; gap:6px; min-width:0; height:20px; }
      .t3i-ws { display:inline-flex; align-items:center; gap:6px; min-width:0; flex:1; }
      /* T3 pin: PinIcon default → PinOffIcon on hover/focus; no pill fill */
      .t3i-pin { display:inline-flex; flex:none; align-items:center; justify-content:center; width:16px; height:16px; padding:0; border:0; background:transparent; border-radius:2px; color:color-mix(in srgb, var(--t3i-secondary-label) 80%, transparent); opacity:1; cursor:pointer; }
      .t3i-pin:hover, .t3i-pin:focus-visible { color:var(--dsw-alias-label-primary); background:transparent; outline:none; }
      .t3i-pin .t3i-pin-off { display:none; }
      .t3i-pin:hover .t3i-pin-on, .t3i-pin:focus-visible .t3i-pin-on { display:none; }
      .t3i-pin:hover .t3i-pin-off, .t3i-pin:focus-visible .t3i-pin-off { display:block; }
      /* T3 Code-style SVG monogram tile: 16px, 25% radius, 18-color hash palette */
      .t3i-mono { display:inline-flex; flex:none; align-items:center; justify-content:center; width:16px; height:16px; border-radius:4px; background:color-mix(in srgb, currentColor 14%, transparent); }
      .t3i-mono svg { display:block; width:16px; height:16px; overflow:visible; }
      .t3i-mono text { font-family:ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace; }
      .t3i-mono[data-color="gray"] { color:#52525b; }
      .t3i-mono[data-color="red"] { color:#dc2626; }
      .t3i-mono[data-color="orange"] { color:#ea580c; }
      .t3i-mono[data-color="amber"] { color:#d97706; }
      .t3i-mono[data-color="yellow"] { color:#ca8a04; }
      .t3i-mono[data-color="lime"] { color:#65a30d; }
      .t3i-mono[data-color="green"] { color:#16a34a; }
      .t3i-mono[data-color="emerald"] { color:#059669; }
      .t3i-mono[data-color="teal"] { color:#0d9488; }
      .t3i-mono[data-color="cyan"] { color:#0891b2; }
      .t3i-mono[data-color="sky"] { color:#0284c7; }
      .t3i-mono[data-color="blue"] { color:#2563eb; }
      .t3i-mono[data-color="indigo"] { color:#4f46e5; }
      .t3i-mono[data-color="violet"] { color:#7c3aed; }
      .t3i-mono[data-color="purple"] { color:#9333ea; }
      .t3i-mono[data-color="fuchsia"] { color:#c026d3; }
      .t3i-mono[data-color="pink"] { color:#db2777; }
      .t3i-mono[data-color="rose"] { color:#e11d48; }
      body[data-ds-dark-theme] .t3i-mono[data-color="gray"] { color:#a1a1aa; }
      body[data-ds-dark-theme] .t3i-mono[data-color="red"] { color:#f87171; }
      body[data-ds-dark-theme] .t3i-mono[data-color="orange"] { color:#fb923c; }
      body[data-ds-dark-theme] .t3i-mono[data-color="amber"] { color:#fbbf24; }
      body[data-ds-dark-theme] .t3i-mono[data-color="yellow"] { color:#facc15; }
      body[data-ds-dark-theme] .t3i-mono[data-color="lime"] { color:#a3e635; }
      body[data-ds-dark-theme] .t3i-mono[data-color="green"] { color:#4ade80; }
      body[data-ds-dark-theme] .t3i-mono[data-color="emerald"] { color:#34d399; }
      body[data-ds-dark-theme] .t3i-mono[data-color="teal"] { color:#2dd4bf; }
      body[data-ds-dark-theme] .t3i-mono[data-color="cyan"] { color:#22d3ee; }
      body[data-ds-dark-theme] .t3i-mono[data-color="sky"] { color:#38bdf8; }
      body[data-ds-dark-theme] .t3i-mono[data-color="blue"] { color:#60a5fa; }
      body[data-ds-dark-theme] .t3i-mono[data-color="indigo"] { color:#818cf8; }
      body[data-ds-dark-theme] .t3i-mono[data-color="violet"] { color:#a78bfa; }
      body[data-ds-dark-theme] .t3i-mono[data-color="purple"] { color:#c084fc; }
      body[data-ds-dark-theme] .t3i-mono[data-color="fuchsia"] { color:#e879f9; }
      body[data-ds-dark-theme] .t3i-mono[data-color="pink"] { color:#f472b6; }
      body[data-ds-dark-theme] .t3i-mono[data-color="rose"] { color:#fb7185; }
      /* T3 slim rows: inactive Snoozed and all Settled dim monogram; active Snoozed keeps full color. */
      .t3i-item[data-variant="compact"] .t3i-mono { opacity:.40; filter:grayscale(1); transition:opacity 150ms ease,filter 150ms ease; }
      .t3i-item[data-variant="compact"]:hover .t3i-mono,
      .t3i-item[data-variant="compact"]:focus-within .t3i-mono,
      .t3i-item[data-variant="compact"][data-selected="true"] .t3i-mono,
      .t3i-item[data-variant="compact"][data-sweep] .t3i-mono,
      .t3i-item[data-variant="compact"][data-section="snoozed"] .t3i-row[aria-current="page"] .t3i-mono { opacity:1; filter:none; }
      .t3i-ws-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--t3i-secondary-label); font-size:12px; font-weight:400; }
      .t3i-card-meta { display:inline-flex; align-items:center; gap:5px; flex:none; margin-left:auto; }
      /* Mouse hover and keyboard focus reveal actions; mouse selection stays quiet. */
      .t3i-status-slot { position:relative; display:inline-flex; align-items:stretch; justify-content:flex-end; min-width:2rem; height:20px; flex:none; }
      .t3i-status-slot-label { display:inline-flex; align-items:center; align-self:center; pointer-events:none; }
      .t3i-status-slot-label[data-interactive="true"] { pointer-events:auto; }
      .t3i-status-slot-actions { position:absolute; inset:0 0 0 auto; height:20px; display:inline-flex; align-items:stretch; pointer-events:none; opacity:0; }
      .t3i-item[data-variant="card"]:hover .t3i-status-slot-label:not([data-interactive="true"]),
      .t3i-item[data-variant="card"]:has(:focus-visible) .t3i-status-slot-label:not([data-interactive="true"]),
      .t3i-item[data-variant="card"] .t3i-status-slot[data-open="true"] .t3i-status-slot-label:not([data-interactive="true"]) {
        position:absolute; right:0; opacity:0; pointer-events:none;
      }
      .t3i-item[data-variant="card"]:hover .t3i-status-slot-actions,
      .t3i-item[data-variant="card"]:has(:focus-visible) .t3i-status-slot-actions,
      .t3i-item[data-variant="card"] .t3i-status-slot[data-open="true"] .t3i-status-slot-actions {
        position:static; pointer-events:auto; opacity:1;
      }
      /* T3 top-status slot: icon + label + live working duration, or relative time */
      /* T3 topStatus: text-xs + font-medium + size-4 icon */
      .t3i-status { display:inline-flex; align-items:center; gap:4px; height:20px; font-size:12px; font-weight:500; white-space:nowrap; color:var(--t3i-secondary-label); }
      /* T3 Nightly tokens: --info-foreground / indigo-600 / --success-foreground */
      .t3i-status[data-tone="working"] { color:#1447e6; }
      .t3i-status[data-tone="input"] { color:#4f39f6; }
      .t3i-status[data-tone="request"] { color:#0d9488; }
      .t3i-status[data-tone="approval"] { color:#bb4d00; }
      .t3i-status[data-tone="failed"] { color:#c10007; }
      /* T3 Limited = warning-foreground (same family as Approval/Woke) */
      .t3i-status[data-tone="limited"] { color:#bb4d00; }
      .t3i-status[data-tone="done"] { color:#007a55; }
      .t3i-status[data-tone="woke"] { color:#bb4d00; }
      button.t3i-status[data-tone="woke"] { margin:0; padding:0; border:0; background:transparent; font:inherit; cursor:pointer; }
      button.t3i-status[data-tone="woke"]:hover { text-decoration:underline; }
      button.t3i-status[data-tone="woke"]:focus-visible { outline:2px solid var(--t3i-accent, #1b4ed8); outline-offset:1px; }
      body[data-ds-dark-theme] .t3i-status[data-tone="working"] { color:#60a5fa; }
      body[data-ds-dark-theme] .t3i-status[data-tone="input"] { color:#a5b4fc; }
      body[data-ds-dark-theme] .t3i-status[data-tone="request"] { color:#2dd4bf; }
      body[data-ds-dark-theme] .t3i-status[data-tone="approval"] { color:#fbbf24; }
      body[data-ds-dark-theme] .t3i-status[data-tone="done"] { color:#34d399; }
      body[data-ds-dark-theme] .t3i-status[data-tone="failed"] { color:#f87171; }
      body[data-ds-dark-theme] .t3i-status[data-tone="limited"] { color:#fbbf24; }
      body[data-ds-dark-theme] .t3i-status[data-tone="woke"] { color:#fbbf24; }
      .t3i-status-time { font-variant-numeric:tabular-nums; font-weight:400; opacity:.85; }
      .t3i-card-bottom { display:flex; align-items:center; justify-content:space-between; gap:6px; min-width:0; min-height:20px; margin-top:0.25rem; /* T3 mt-1 */ }
      /* T3 metaLine: mt-0.5 + text-xs secondary; with branch → card h-[4.875rem]=78px */
      .t3i-card-meta-line { display:flex; align-items:center; gap:6px; min-width:0; margin-top:0.125rem; height:16px; color:var(--t3i-secondary-label); font-size:12px; line-height:16px; }
      .t3i-card-meta-branch { display:flex; flex:1; min-width:0; align-items:center; gap:6px; }
      .t3i-card-meta-worktree-icon { flex:none; }
      .t3i-card-meta-branch-text { display:flex; flex:1; min-width:0; }
      /* T3 MiddleTruncate: head clips; tail keeps ellipsis flush */
      .t3i-midtrunc { display:inline-flex; min-width:0; max-width:100%; overflow:hidden; white-space:nowrap; }
      .t3i-midtrunc-head { min-width:0; overflow:hidden; }
      .t3i-midtrunc-tail { flex:none; }
      .t3i-midtrunc-head[data-overflow] + .t3i-midtrunc-tail::before { content:'…'; }
      .t3i-item[data-variant="card"][data-has-meta="true"] .t3i-row { height:4.875rem; }
      .t3i-row-main { display:flex; flex:1; align-items:center; gap:6px; min-width:0; }
      /* T3 card title: text-sm + font-medium unless receding */
      .t3i-row-title { display:block; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; font-weight:500; line-height:20px; color:var(--dsw-alias-label-primary); }
      .t3i-rename-input { flex:1; min-width:0; height:22px; padding:0 4px; border:1px solid var(--dsw-alias-border-l1); border-radius:4px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:14px; font-weight:500; line-height:20px; outline:none; }
      .t3i-rename-input:focus { border-color:var(--t3i-accent, #1b4ed8); }
      .t3i-row-state { flex:none; max-width:96px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-state-warn-primary); font-size:10.5px; }
      .t3i-row-state[data-error="true"] { color:var(--dsw-alias-state-error-primary); }
      .t3i-row-time { flex:none; color:var(--t3i-secondary-label); font-size:12px; font-variant-numeric:tabular-nums; }
      /* T3 ThreadHoverCard: max-w-80, glass, side=right sideOffset=4 */
      .t3i-preview { position:fixed; z-index:950; display:flex; flex-direction:column; gap:8px; width:max-content; max-width:20rem; padding:8px 10px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 94%, transparent); backdrop-filter:blur(14px); box-shadow:0 10px 28px rgb(0 0 0 / .28); pointer-events:none; transform-origin:left center; animation:t3i-pop-in 150ms ease-out; }
      .t3i-preview[data-side="left"] { transform-origin:right center; }
      .t3i-preview[data-instant="true"] { animation:none; }
      .t3i-preview-title { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--dsw-alias-label-primary); font-size:12px; font-weight:500; line-height:1.25; }
      .t3i-preview-row { display:flex; align-items:center; gap:8px; min-width:0; color:var(--dsw-alias-label-secondary); font-size:12px; line-height:1.25; }
      .t3i-preview-row > svg { flex:none; }
      .t3i-preview-text { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:color-mix(in srgb, var(--dsw-alias-label-primary) 75%, transparent); }
      .t3i-preview-error { color:var(--dsw-alias-state-error-primary, #c10007); }
      .t3i-preview-error .t3i-preview-text { color:inherit; }
      /* After .t3i-preview-row so warning/error tones win over secondary row color */
      .t3i-preview-row.t3i-preview-warning { color:#bb4d00; }
      body[data-ds-dark-theme] .t3i-preview-row.t3i-preview-warning { color:#fbbf24; }
      .t3i-preview-warning .t3i-preview-text { color:inherit; }
      .t3i-preview .t3i-mono, .t3i-preview .t3i-mono svg { width:12px; height:12px; }
      /* T3 TooltipPopup (variant="default"): side=top sideOffset=4 rounded-md px-2 py-1 text-xs */
      .t3i-tooltip { position:fixed; z-index:960; display:inline-flex; flex-direction:column; gap:2px; width:max-content; max-width:20rem; padding:4px 8px; border:1px solid var(--dsw-alias-border-l1); border-radius:6px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font-size:12px; font-weight:400; line-height:1.375; white-space:normal; overflow-wrap:anywhere; box-shadow:0 4px 6px -1px rgb(0 0 0 / .08), 0 2px 4px -2px rgb(0 0 0 / .06), inset 0 1px 0 rgb(0 0 0 / .04); pointer-events:none; transform-origin:bottom center; animation:t3i-pop-in 120ms ease-out; }
      body[data-ds-dark-theme] .t3i-tooltip { box-shadow:0 6px 14px -2px rgb(0 0 0 / .36), inset 0 -1px 0 rgb(255 255 255 / .06); }
      .t3i-tooltip[data-side="bottom"] { transform-origin:top center; }
      .t3i-tooltip[data-instant="true"] { animation:none; }
      .t3i-tooltip-sub { color:var(--t3i-secondary-label); }
      .t3i-tip-host { display:inline-flex; align-items:stretch; flex:none; }
      .t3i-tip-host[data-disabled="true"] { cursor:not-allowed; }
      .t3i-tip-host[data-disabled="true"] > button:disabled { pointer-events:none; }

      /* Compact Single-Line Row (Snoozed / Settled) */
      .t3i-item[data-variant="compact"] .t3i-row { flex-direction:row; align-items:center; gap:10px; height:36px; min-height:36px; padding:0 10px; border-radius:6px; }
      .t3i-item[data-variant="compact"] .t3i-row-title { font-size:14px; font-weight:400; line-height:20px; color:var(--t3i-secondary-label); }
      .t3i-item[data-variant="compact"][data-section="settled"]:not([data-unread="true"]):not([data-selected="true"]):not([data-sweep]):not(:hover):not(:focus-within) .t3i-row:not([aria-current="page"]) .t3i-row-title { color:var(--t3i-settled-title); }
      .t3i-item[data-variant="compact"][data-section="settled"][data-unread="true"] .t3i-row-title { font-weight:500; color:var(--dsw-alias-label-primary); }
      .t3i-item[data-variant="compact"][data-section="snoozed"]:not([data-recede="true"]) .t3i-row-title { font-weight:500; color:var(--dsw-alias-label-primary); }
      .t3i-item[data-variant="compact"][data-section="snoozed"][data-recede="true"]:not([data-selected="true"]):not([data-sweep]):not(:hover):not(:focus-within) .t3i-row:not([aria-current="page"]) .t3i-row-title { font-weight:400; color:var(--t3i-secondary-label); }
      .t3i-item[data-variant="compact"]:hover .t3i-row-title, .t3i-item[data-variant="compact"]:focus-within .t3i-row-title, .t3i-item[data-variant="compact"] .t3i-row[aria-current="page"] .t3i-row-title { color:var(--dsw-alias-label-primary); }
      .t3i-item[data-variant="compact"][data-selected="true"] .t3i-row-title, .t3i-item[data-variant="compact"][data-sweep] .t3i-row-title { color:var(--dsw-alias-label-primary); }
      .t3i-jump-hint { display:inline-flex; flex:none; align-items:center; justify-content:center; height:20px; min-width:20px; padding:0 4px; border-radius:4px; font-family:inherit; font-size:12px; font-weight:500; line-height:1; font-variant-numeric:tabular-nums; color:var(--t3i-secondary-label); background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent); user-select:none; }
      .t3i-sweep-badge { display:inline-flex; flex:none; align-items:center; gap:4px; height:20px; padding:0 6px; border:1px solid color-mix(in srgb, var(--t3i-accent, #1b4ed8) 40%, transparent); border-radius:4px; background:color-mix(in srgb, var(--t3i-accent, #1b4ed8) 10%, transparent); color:var(--t3i-accent, #1b4ed8); font-size:11px; font-weight:500; line-height:1; white-space:nowrap; }
      .t3i-status-slot[data-jump="true"] > :not(.t3i-jump-hint),
      .t3i-slim-slot[data-jump="true"] > :not(.t3i-jump-hint),
      .t3i-item[data-sweep] .t3i-status-slot > :not(.t3i-sweep-badge),
      .t3i-item[data-sweep] .t3i-slim-slot > :not(.t3i-sweep-badge) { visibility:hidden; position:absolute; pointer-events:none; }
      .t3i-item[data-variant="compact"] .t3i-row-time { font-size:12px; color:var(--t3i-secondary-label); transition:opacity 150ms ease; }
      .t3i-slim-wake { display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:400; font-variant-numeric:tabular-nums; color:#1447e6; transition:opacity 150ms ease; }
      body[data-ds-dark-theme] .t3i-slim-wake { color:#60a5fa; }
      .t3i-slim-slot { position:relative; margin-left:auto; display:inline-flex; flex:none; align-items:center; justify-content:flex-end; min-width:2rem; height:24px; }
      .t3i-item[data-variant="compact"]:hover .t3i-row-time,
      .t3i-item[data-variant="compact"]:has(:focus-visible) .t3i-row-time,
      .t3i-item[data-variant="compact"]:hover .t3i-slim-wake,
      .t3i-item[data-variant="compact"]:has(:focus-visible) .t3i-slim-wake { opacity:0; pointer-events:none; }
      .t3i-slim-action { position:absolute; inset:0 -4px 0 auto; display:inline-flex; align-items:center; justify-content:center; padding:0 6px; border:0; border-radius:6px; background:transparent; color:var(--t3i-secondary-label); pointer-events:none; opacity:0; cursor:pointer; transition:opacity 150ms ease, color 150ms ease; }
      .t3i-slim-action svg { margin-bottom:1px; }
      .t3i-item[data-variant="compact"]:hover .t3i-slim-action, .t3i-item[data-variant="compact"]:has(:focus-visible) .t3i-slim-action, .t3i-slim-action:focus-visible { pointer-events:auto; opacity:1; }
      .t3i-slim-action:hover:not(:disabled) { color:var(--dsw-alias-label-primary); }
      .t3i-slim-action:disabled { opacity:.35; cursor:not-allowed; }

      .t3i-dot { display:none; }
      /* Card actions live in .t3i-status-slot (T3 SnoozeMenuButton + Settle) */
      .t3i-snooze-action { display:inline-flex; align-items:center; justify-content:center; gap:2px; height:20px; padding:0 6px; border:0; border-radius:6px; background:transparent; color:var(--t3i-secondary-label); font:inherit; font-size:12px; font-weight:400; cursor:pointer; }
      .t3i-snooze-action:hover:not(:disabled), .t3i-snooze-action[aria-expanded="true"] { color:var(--dsw-alias-label-primary); background:transparent; }
      .t3i-snooze-action:disabled { opacity:.35; cursor:not-allowed; }
      /* T3 Settle: text-xs + gap-1 + px-1.5, muted → foreground on hover */
      .t3i-primary-action { display:inline-flex; align-items:center; gap:4px; height:20px; margin-right:-4px; padding:0 6px; border:0; border-radius:6px; color:var(--t3i-secondary-label); background:transparent; font:inherit; font-size:12px; font-weight:400; cursor:pointer; }
      .t3i-primary-action:hover:not(:disabled) { color:var(--dsw-alias-label-primary); background:transparent; }
      .t3i-primary-action:disabled { opacity:.35; cursor:not-allowed; }
      .t3i-snooze-menu { position:fixed; z-index:1000; display:flex; flex-direction:column; width:max-content; min-width:min(160px,calc(100vw - 32px)); max-width:calc(100vw - 32px); max-height:calc(100vh - 32px); overflow:auto; padding:4px; border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent); border-radius:8px; outline:none; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 83.6%, transparent); -webkit-backdrop-filter:blur(12px) saturate(1.14); backdrop-filter:blur(12px) saturate(1.14); box-shadow:0 16px 40px -18px rgb(0 0 0 / .55); -webkit-app-region:no-drag; app-region:no-drag; }
      .t3i-snooze-menu, .t3i-snooze-menu * { box-sizing:border-box; }
      body[data-ds-dark-theme] .t3i-snooze-menu { -webkit-backdrop-filter:blur(16px) saturate(1.08); backdrop-filter:blur(16px) saturate(1.08); box-shadow:0 18px 44px -18px rgb(0 0 0 / .8); }
      @supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))) { .t3i-snooze-menu { background:var(--dsw-alias-bg-layer-1); } }
      .t3i-preset { display:flex; flex:1; align-items:center; gap:12px; min-width:0; padding:4px 9px; border:0; border-radius:6px; color:var(--dsw-alias-label-secondary); background:transparent; font:inherit; font-size:13px; text-align:left; white-space:nowrap; cursor:pointer; }
      .t3i-preset-when { margin-left:auto; color:var(--dsw-alias-label-secondary); font-size:11.5px; font-variant-numeric:tabular-nums; opacity:.75; }
      .t3i-preset:hover, .t3i-preset[data-selected="true"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-interactive-bg-hover, rgb(38 49 72 / .06)); }
      .t3i-preset:hover .t3i-preset-when, .t3i-preset[data-selected="true"] .t3i-preset-when { color:var(--dsw-alias-label-primary); opacity:.9; }
      .t3i-preset[data-custom="true"] { color:var(--dsw-alias-label-secondary); }
      .t3i-preset[data-primary="true"] { color:var(--dsw-alias-label-primary); font-weight:600; background:var(--dsw-alias-interactive-bg-hover, rgb(38 49 72 / .06)); }
      .t3i-menu-separator { height:1px; margin:3px 4px; background:var(--dsw-alias-border-l1); }
      .t3i-snooze-menu .t3i-preset { flex:none; width:100%; min-height:28px; gap:8px; padding:4px 8px; border-radius:4px; color:var(--dsw-alias-label-primary); font-size:14px; line-height:20px; }
      .t3i-snooze-menu .t3i-preset:focus, .t3i-snooze-menu .t3i-preset:focus-visible { outline:none; background:var(--dsw-alias-interactive-bg-hover, rgb(38 49 72 / .06)); }
      .t3i-snooze-menu .t3i-preset > span:first-child { min-width:0; overflow:hidden; text-overflow:ellipsis; }
      .t3i-snooze-menu .t3i-preset-when { flex:none; margin-left:auto; padding-left:16px; font-size:inherit; opacity:1; }
      .t3i-snooze-menu .t3i-preset[data-custom="true"] { color:var(--dsw-alias-label-primary); }
      .t3i-snooze-menu .t3i-menu-separator { flex:none; margin:4px 8px; }
      @media (pointer:coarse) { .t3i-snooze-menu .t3i-preset { min-height:32px; font-size:16px; } }
      .t3i-custom-snooze { display:flex; flex-direction:column; gap:16px; }
      .t3i-custom-snooze-title { color:var(--dsw-alias-label-primary); font-size:13px; font-weight:500; }
      .t3i-custom-snooze-input { width:100%; height:32px; padding:0 10px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-1); font:inherit; font-size:13.5px; color-scheme:light dark; }
      .t3i-custom-snooze-input:focus { outline:none; border-color:var(--t3i-accent, #1b4ed8); box-shadow:0 0 0 2px color-mix(in srgb, var(--t3i-accent, #1b4ed8) 24%, transparent); }
      .t3i-custom-snooze-error { margin:0; color:var(--dsw-alias-state-error-primary); font-size:12.5px; line-height:1.4; }
      .t3i-custom-modes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:4px; padding:3px; border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); border-radius:9px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent); }
      .t3i-mode-chip { min-height:28px; padding:4px 8px; border:0; border-radius:6px; color:var(--dsw-alias-label-secondary); background:transparent; font:inherit; font-size:13px; font-weight:500; cursor:pointer; transition:background-color 120ms ease, color 120ms ease; }
      .t3i-mode-chip[data-active="true"] { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-1); box-shadow:0 1px 2px rgb(0 0 0 / .14); }
      .t3i-custom-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
      @media (max-width: 420px) { .t3i-custom-grid { grid-template-columns:1fr; } }
      .t3i-custom-field { position:relative; display:flex; flex-direction:column; gap:6px; min-width:0; }
      .t3i-date-trigger { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; height:32px; padding:0 10px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:13.5px; text-align:left; cursor:pointer; }
      .t3i-date-trigger:hover { background:var(--dsw-alias-bg-layer-2); }
      .t3i-date-trigger svg { flex:none; color:var(--dsw-alias-label-secondary); }
      .t3i-calendar-popover { position:absolute; left:0; top:calc(100% + 6px); z-index:1250; width:max-content; max-width:calc(100vw - 32px); padding:10px; border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent); border-radius:12px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 96%, transparent); -webkit-backdrop-filter:blur(16px) saturate(1.16); backdrop-filter:blur(16px) saturate(1.16); box-shadow:0 16px 40px -12px rgb(0 0 0 / .45); color:var(--dsw-alias-label-primary); transform-origin:top left; animation:t3i-pop-in 150ms ease-out; }
      .t3i-cal-head { display:flex; align-items:center; justify-content:space-between; height:36px; margin-bottom:4px; }
      .t3i-cal-caption { font-size:13.5px; font-weight:500; }
      .t3i-cal-nav { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border:0; border-radius:8px; background:transparent; color:var(--dsw-alias-label-primary); cursor:pointer; }
      .t3i-cal-nav:hover { background:var(--dsw-alias-bg-layer-2); }
      .t3i-cal-grid { display:grid; grid-template-columns:repeat(7,36px); row-gap:1px; }
      .t3i-cal-weekday { display:flex; align-items:center; justify-content:center; width:36px; height:36px; font-size:12px; font-weight:500; color:color-mix(in srgb, var(--dsw-alias-label-secondary) 72%, transparent); }
      .t3i-cal-day { position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border:0; border-radius:8px; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:13.5px; font-variant-numeric:tabular-nums; cursor:pointer; }
      .t3i-cal-day:hover:not(:disabled):not([data-selected="true"]) { background:var(--dsw-alias-bg-layer-2); }
      .t3i-cal-day[data-outside="true"] { color:color-mix(in srgb, var(--dsw-alias-label-secondary) 65%, transparent); }
      .t3i-cal-day:disabled { pointer-events:none; opacity:.45; text-decoration:line-through; color:var(--dsw-alias-label-secondary); }
      .t3i-cal-day[data-selected="true"] { background:var(--t3i-accent, #1b4ed8); color:#fff; font-weight:500; }
      .t3i-cal-day[data-today="true"]::after { content:''; position:absolute; bottom:4px; left:50%; width:3px; height:3px; border-radius:999px; transform:translateX(-50%); background:var(--t3i-accent, #1b4ed8); }
      .t3i-cal-day[data-today="true"][data-selected="true"]::after { background:#fff; }
      .t3i-cal-day[data-today="true"]:disabled::after { background:color-mix(in srgb, var(--dsw-alias-label-primary) 30%, transparent); }
      .t3i-number-field { display:flex; align-items:stretch; height:32px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; overflow:hidden; background:var(--dsw-alias-bg-layer-1); }
      .t3i-number-field:focus-within { border-color:var(--t3i-accent, #1b4ed8); box-shadow:0 0 0 2px color-mix(in srgb, var(--t3i-accent, #1b4ed8) 24%, transparent); }
      .t3i-number-step { display:inline-flex; flex:none; align-items:center; justify-content:center; width:30px; border:0; background:transparent; color:var(--dsw-alias-label-secondary); font:inherit; font-size:14px; cursor:pointer; }
      .t3i-number-step:hover:not(:disabled) { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
      .t3i-number-step:disabled { opacity:.35; cursor:not-allowed; }
      .t3i-number-input { flex:1; min-width:0; border:0; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:13.5px; text-align:center; font-variant-numeric:tabular-nums; outline:none; -moz-appearance:textfield; }
      .t3i-number-input::-webkit-inner-spin-button, .t3i-number-input::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
      .t3i-custom-snooze select.t3i-custom-snooze-input { padding:0 8px; appearance:auto; }
      .t3i-modal-backdrop { position:fixed; inset:0; z-index:1200; display:flex; align-items:center; justify-content:center; padding:16px; background:rgb(0 0 0 / .28); -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px); animation:t3i-fade-in 200ms ease-out; }
      .t3i-modal { position:relative; display:flex; flex-direction:column; width:min(384px,calc(100vw - 32px)); max-height:calc(100vh - 32px); overflow:visible; border:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent); border-radius:16px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 90%, transparent); -webkit-backdrop-filter:blur(18px) saturate(1.16); backdrop-filter:blur(18px) saturate(1.16); box-shadow:0 24px 60px -16px rgb(0 0 0 / .44); -webkit-app-region:no-drag; app-region:no-drag; animation:t3i-dialog-in 200ms ease-in-out; }
      body[data-ds-dark-theme] .t3i-modal { background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, transparent); box-shadow:0 24px 64px -16px rgb(0 0 0 / .8); }
      @supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))) { .t3i-modal { background:var(--dsw-alias-bg-layer-1); } }
      .t3i-modal-header { position:relative; display:flex; flex-direction:column; gap:6px; padding:24px 24px 12px; }
      .t3i-modal-close { position:absolute; top:10px; right:10px; display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border:0; border-radius:7px; background:transparent; color:var(--dsw-alias-label-secondary); cursor:pointer; }
      .t3i-modal-close:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
      .t3i-modal-title { margin:0; padding-right:24px; color:var(--dsw-alias-label-primary); font-size:20px; font-weight:600; line-height:1.3; }
      .t3i-modal-help { margin:0; color:var(--dsw-alias-label-secondary); font-size:14px; line-height:1.45; }
      .t3i-modal-panel { display:flex; flex-direction:column; gap:14px; padding:4px 24px 20px; }
      .t3i-modal-footer { display:flex; align-items:center; gap:8px; padding:16px 24px; border-top:1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent); border-bottom-left-radius:15px; border-bottom-right-radius:15px; background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 72%, transparent); }
      .t3i-modal-edit-options { display:inline-flex; align-items:center; gap:6px; height:32px; margin-right:auto; padding:0 8px; border:0; border-radius:8px; background:transparent; color:var(--dsw-alias-label-secondary); font:inherit; font-size:12.5px; cursor:pointer; }
      .t3i-modal-edit-options:hover { background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); }
      .t3i-modal-btn { display:inline-flex; align-items:center; justify-content:center; height:32px; padding:0 12px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; background:var(--dsw-alias-bg-layer-1); color:var(--dsw-alias-label-primary); font:inherit; font-size:13px; font-weight:500; cursor:pointer; }
      .t3i-modal-btn:hover { background:var(--dsw-alias-bg-layer-2); }
      .t3i-modal-btn[data-primary="true"] { border-color:var(--t3i-accent, #1b4ed8); background:var(--t3i-accent, #1b4ed8); color:#fff; }
      .t3i-modal-btn[data-primary="true"]:hover { opacity:.92; }
      .t3i-preview-hint { color:var(--dsw-alias-state-error-primary); font-size:11px; line-height:1.4; white-space:normal; }
      .t3i-preview-hint[data-cold="true"] { color:var(--dsw-alias-label-secondary); }
      .t3i-context-menu { position:fixed; z-index:1000; min-width:184px; padding:5px; border:1px solid var(--dsw-alias-border-l1); border-radius:11px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 12px 32px rgb(0 0 0 / .32); }
      .t3i-context-item { display:flex; align-items:center; gap:7px; width:100%; min-height:27px; padding:4px 9px; border:0; border-radius:7px; color:var(--dsw-alias-label-primary); background:transparent; font:inherit; font-size:13.5px; text-align:left; cursor:pointer; }
      .t3i-context-item:hover { background:var(--dsw-alias-interactive-bg-hover, rgb(38 49 72 / .06)); }
      .t3i-context-item:disabled { opacity:.35; cursor:not-allowed; }
      .t3i-context-item .t3i-menu-chevron { margin-left:auto; transform:rotate(-90deg); }
      .t3i-context-submenu { position:absolute; left:100%; top:52px; min-width:172px; padding:5px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 12px 32px rgb(0 0 0 / .32); }
      .t3i-context-submenu .t3i-preset { display:flex; width:100%; }
      .t3i-context-submenu .t3i-custom-snooze { min-width:200px; }
      .t3i-context-menu[data-side="left"] .t3i-context-submenu { right:100%; left:auto; }
      .t3i-empty { flex:none; padding:24px 14px; color:var(--t3i-secondary-label); font-size:12.5px; line-height:1.6; text-align:center; }
      .t3i-empty-contextual { flex:none; display:flex; flex-direction:column; align-items:center; gap:8px; padding:24px 8px; color:color-mix(in srgb, var(--t3i-secondary-label) 85%, transparent); font-size:12px; line-height:1.5; text-align:center; }
      .t3i-empty-add { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border:1px solid var(--dsw-alias-border-l2, var(--dsw-alias-border-l1)); border-radius:6px; background:transparent; color:var(--t3i-secondary-label); font:inherit; font-size:11px; font-weight:500; cursor:pointer; transition:background-color 120ms ease, color 120ms ease; }
      .t3i-empty-add:hover { background:var(--t3i-row-hover); color:var(--dsw-alias-label-primary); }
      .t3i-search-list { display:flex; flex-direction:column; gap:1px; }
      .t3i-search-row { display:flex; align-items:center; gap:10px; width:100%; min-height:36px; padding:4px 10px; border:0; border-radius:6px; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; text-align:left; cursor:pointer; }
      .t3i-search-row:hover:not([data-active="true"]):not([aria-current="page"]) { background:var(--t3i-row-hover); }
      .t3i-search-row[data-active="true"], .t3i-search-row[aria-current="page"] { background:var(--t3i-row-active); box-shadow:var(--t3i-row-active-shadow); }
      .t3i-search-row .t3i-mono { transition:opacity 150ms ease, filter 150ms ease; }
      .t3i-search-row[data-settled="true"]:not([data-active="true"]):not([aria-current="page"]):not(:hover) .t3i-mono { opacity:.4; filter:grayscale(1); }
      .t3i-search-row-text { display:flex; flex-direction:column; flex:1; min-width:0; gap:1px; }
      .t3i-search-row-head { display:flex; align-items:center; gap:10px; min-width:0; }
      .t3i-search-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:14px; font-weight:500; line-height:20px; }
      .t3i-search-excerpt { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; line-height:16px; color:var(--t3i-secondary-label); }
      .t3i-search-row[data-settled="true"] .t3i-search-title { font-weight:400; color:var(--t3i-settled-title); }
      .t3i-search-row[data-settled="true"]:hover .t3i-search-title,
      .t3i-search-row[data-settled="true"][data-active="true"] .t3i-search-title,
      .t3i-search-row[data-settled="true"][aria-current="page"] .t3i-search-title { color:var(--dsw-alias-label-primary); }
      .t3i-search-time { flex:none; color:color-mix(in srgb, var(--t3i-secondary-label) 85%, transparent); font-size:12px; font-variant-numeric:tabular-nums; }
      .t3i-hit { background:#ffde8b; color:#21180a; border-radius:2px; padding:0 1px; }
      body[data-ds-dark-theme] .t3i-hit { background:#8c6c1f; color:#f5f5f5; }
      .t3i-home { display:flex; flex:1; min-height:0; align-items:flex-start; justify-content:center; padding:40px 32px; overflow:auto; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); }
      .t3i-home-inner { width:min(640px,100%); }
      .t3i-home-list { display:grid; gap:6px; margin-top:20px; padding-top:12px; border-top:1px solid var(--dsw-alias-border-l1); }
      .t3i-home-list .t3i-item { border:1px solid var(--dsw-alias-border-l1); background:var(--dsw-alias-bg-layer-1); }
      .t3i-home-actions { display:flex; flex-wrap:wrap; gap:8px; }
      .t3i-home h1 { margin:18px 0 8px; font-size:28px; font-weight:500; letter-spacing:-.04em; }
      .t3i-home p { max-width:52ch; margin:0 0 22px; color:var(--dsw-alias-label-secondary); font-size:14px; line-height:1.6; }
      .t3i-action { display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:32px; padding:0 12px; border:1px solid var(--dsw-alias-border-l1); border-radius:8px; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-layer-1); font:inherit; font-size:12px; cursor:pointer; }
      .t3i-action:hover { background:var(--dsw-alias-bg-layer-2); }
      @keyframes t3i-pop-in { from { opacity:0; transform:scale(.98); } to { opacity:1; transform:scale(1); } }
      @keyframes t3i-fade-in { from { opacity:0; } to { opacity:1; } }
      @keyframes t3i-dialog-in { from { opacity:0; transform:scale(.98); } to { opacity:1; transform:scale(1); } }
      @keyframes t3i-toast-in { from { opacity:0; transform:translateY(calc(100% + 16px)); } to { opacity:1; transform:translateY(0); } }
      @media (hover:none) {
        .t3i-item[data-variant="compact"] .t3i-row-time,
        .t3i-item[data-variant="compact"] .t3i-slim-wake { opacity:0; position:absolute; pointer-events:none; }
        .t3i-item[data-variant="compact"] .t3i-slim-action { position:static; pointer-events:auto; opacity:1; padding:0 4px; }
        .t3i-item[data-variant="card"] .t3i-status-slot-label:not([data-interactive="true"]) { position:absolute; right:0; opacity:0; pointer-events:none; }
        .t3i-item[data-variant="card"] .t3i-status-slot-actions { position:static; pointer-events:auto; opacity:1; }
      }
      @media (prefers-reduced-motion: no-preference) { .t3i-row, .t3i-icon-button { transition:background-color 120ms ease,color 120ms ease; } }

      /* Own T3-style single-row footer bar inside the Inbox column */
      .t3i-foot { position:relative; display:flex; flex:none; align-items:center; gap:4px; padding:4px 8px 8px; border-top:0; }
      .t3i-foot .t3i-icon-button { width:32px; height:32px; }
      .t3i-foot-panel-glyph { display:inline-flex; flex:none; align-items:center; justify-content:center; width:16px; height:16px; line-height:0; }
      .t3i-foot-panel-glyph > svg { display:block; flex:none; }
      .t3i-foot-panel[data-active="true"]::after, .t3i-foot-panels-more[aria-expanded="true"]::after { display:none; }
      .t3i-foot-panels-menu { position:fixed; z-index:900; display:flex; flex-direction:column; gap:1px; min-width:184px; max-width:min(240px, calc(100vw - 16px)); max-height:min(16rem, 60vh); overflow:auto; scrollbar-width:none; padding:4px; border:1px solid var(--dsw-alias-border-l1); border-radius:10px; background:var(--dsw-alias-bg-layer-1); box-shadow:0 14px 36px -16px rgb(0 0 0 / .45); transform-origin:bottom left; animation:t3i-pop-in 150ms ease-out; }
      .t3i-foot-panel-option[data-active="true"] { color:var(--dsw-alias-label-primary); background:var(--t3i-control-active); }
      .t3i-foot-panel-check { flex:none; margin-left:auto; color:var(--t3i-accent, #1b4ed8); }
      .t3i-foot-undo { display:flex; flex:1; min-width:0; height:24px; flex-direction:row-reverse; flex-wrap:wrap; justify-content:flex-start; align-items:center; gap:0 4px; overflow:hidden; margin:0 2px; font-size:11px; line-height:24px; white-space:nowrap; color:var(--t3i-secondary-label); opacity:0; transition:opacity 200ms ease-out; }
      .t3i-foot-undo[data-live="true"] { opacity:1; }
      .t3i-foot-undo .t3i-foot-undo-text { flex:none; }
      .t3i-foot-undo button { display:inline-flex; flex:none; align-items:center; gap:3px; border:0; background:transparent; color:var(--dsw-alias-label-primary); font:inherit; font-size:11px; cursor:pointer; padding:2px 4px; border-radius:4px; }
      .t3i-foot-undo button:hover { background:var(--t3i-control-hover); }
      .t3i-foot-undo button:disabled { opacity:.45; cursor:not-allowed; }
      @media (prefers-reduced-motion: reduce) {
        .t3i-section-chevron,
        .t3i-item[data-drag-peer="true"],
        .t3i-drag-peer,
        .t3i-item[data-recede="true"][data-working="true"] .t3i-row,
        .t3i-item[data-variant="compact"] .t3i-mono,
        .t3i-item[data-variant="compact"] .t3i-row-time,
        .t3i-slim-wake,
        .t3i-slim-action,
        .t3i-settings-view-option,
        .t3i-mode-chip,
        .t3i-empty-add,
        .t3i-search-row .t3i-mono,
        .t3i-foot-undo,
        .t3i-foot-panels-menu,
        .t3i-preview,
        .t3i-tooltip,
        .t3i-filter-popover,
        .t3i-new-menu,
        .t3i-calendar-popover,
        .t3i-modal-backdrop,
        .t3i-modal,
        .t3i-toast {
          transition:none;
          animation:none;
        }
      }

      /* Collapsed 56px rail (36x36 control track in DSH >=0.2.2-rc.3) */
      .t3i-root:not([data-wide="true"]) { flex:none; align-items:center; }
      .t3i-root:not([data-wide="true"]) .t3i-head { padding:0; display:flex; flex-direction:column; align-items:center; }
      .t3i-root:not([data-wide="true"]) .t3i-icon-button { width:36px; height:36px; border-radius:var(--dsw-radius-md, 12px); color:var(--dsw-alias-label-primary); }

      /* Host shell adaptation — applies only while the Inbox owns a wide sidebar (DSH 0.2.2-rc.1 & 0.2.2-rc.3+). */
      html[data-t3-inbox="wide"] .kB3qhq_newSessionRow,
      html[data-t3-inbox="wide"] .kB3qhq_newSession,
      html[data-t3-inbox="wide"] .kB3qhq_footArea,
      html[data-t3-inbox="wide"] .kB3qhq_scrollFade { display:none !important; }
      html[data-t3-inbox-background="t3"] body { --t3i-sidebar-background:${DEFAULT_SIDEBAR_APPEARANCE.light}; }
      html[data-t3-inbox-background="t3"] body[data-ds-dark-theme] { --t3i-sidebar-background:${DEFAULT_SIDEBAR_APPEARANCE.dark}; }
      html[data-t3-inbox-background="custom"] body { --t3i-sidebar-background:var(--t3i-sidebar-light); }
      html[data-t3-inbox-background="custom"] body[data-ds-dark-theme] { --t3i-sidebar-background:var(--t3i-sidebar-dark); }
      html[data-t3-inbox="wide"]:is([data-t3-inbox-background="t3"],[data-t3-inbox-background="custom"])
        :is(.t3i-root[data-wide="true"],.kB3qhq_root,.kB3qhq_topStrip,.kB3qhq_panelList) { background-color:var(--t3i-sidebar-background); }
      html[data-t3-inbox="wide"] .kB3qhq_topStrip { height:44px; padding:6px 12px 0; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow { height:40px; padding:4px 4px 4px 8px; margin:0; gap:6px; background:transparent; }
      html[data-t3-inbox="wide"] .kB3qhq_topStrip + .kB3qhq_logoRow { position:relative; z-index:1; height:44px; margin:-44px calc(44px - var(--dsh-sidebar-inline-padding, 8px)) 0 calc(88px - var(--dsh-sidebar-inline-padding, 8px)); padding:6px 0 0; }
      html[data-t3-inbox="wide"][data-fullscreen] .kB3qhq_topStrip + .kB3qhq_logoRow { margin:-44px calc(12px - var(--dsh-sidebar-inline-padding, 8px)) 0 calc(48px - var(--dsh-sidebar-inline-padding, 8px)); }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brand { display:flex; align-items:center; flex:1; min-width:0; container-type:inline-size; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandIdentity { height:18px; gap:4px; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandMark { display:none; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandMark svg { display:block; width:16px; height:16px; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName { height:18px; font-size:13px; line-height:18px; letter-spacing:0.02em; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg { display:block; height:18px; width:auto; overflow:visible; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg > rect { display:none; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg > g[clip-path*="badge"] { clip-path:none; transform-box:fill-box; transform-origin:left bottom; transform:translate(-5.5px, 2.3px) scale(1.24); }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName svg > g[clip-path*="badge"] path { fill:var(--dsw-alias-label-secondary); }
      html[data-t3-inbox="wide"] body[data-ds-dark-theme] .kB3qhq_logoRow .kB3qhq_brandName svg > g[clip-path*="badge"] path { fill:color-mix(in srgb, var(--dsw-alias-label-primary) 58%, transparent); }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_fallbackBrandName { font-size:13px; line-height:18px; }
      html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_localBuildBrand { height:18px; }
      @container (max-width: 120px) { html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandMark { display:inline-flex; } html[data-t3-inbox="wide"] .kB3qhq_logoRow .kB3qhq_brandName { display:none; } }
      html[data-t3-inbox="wide"] .kB3qhq_regionArea { flex:1; min-height:0; margin:0 calc(-1 * var(--dsh-sidebar-inline-padding, 8px)) -6px; padding:0; }
      html[data-t3-inbox="wide"] .kB3qhq_scrollRegion { margin:0 calc(-1 * var(--dsh-sidebar-inline-padding, 8px)) -6px; container-type:normal; }
      html[data-t3-inbox="wide"] .kB3qhq_scrollArea { display:flex; flex-direction:column; flex:1; min-height:0; margin:0; padding:0; overflow:hidden; }
      html[data-t3-inbox="wide"] .kB3qhq_scrollArea::before,
      html[data-t3-inbox="wide"] .kB3qhq_scrollArea::after { display:none !important; }
      html[data-t3-inbox="wide"] .kB3qhq_scrollRegion .kB3qhq_regionArea { flex:1; min-height:0; margin:0; padding:0; }
      html[data-t3-inbox="wide"][data-t3-inbox-nav="off"] .kB3qhq_panelList { display:none !important; }
      html[data-t3-inbox="wide"][data-t3-inbox-nav="on"] .kB3qhq_panelList { margin:0; padding:6px var(--dsh-sidebar-inline-padding, 8px) 4px; }
      .t3i-sidebar-switch-icon { display:block; }
    `;

    function Icon({ name, size = 15, className }) {
      const icons = {
        inbox: [['polyline',{points:'22 12 16 12 14 15 10 15 8 12 2 12'}],['path',{d:'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'}]],
        sessions: [['path',{d:'M5 5h14'}],['path',{d:'M5 11h14'}],['path',{d:'M5 17h9'}]],
        plus: [['path',{d:'M5 12h14'}],['path',{d:'M12 5v14'}]],
        compose: [['path',{d:'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}],['path',{d:'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z'}]],
        search: [['circle',{cx:11,cy:11,r:8}],['path',{d:'m21 21-4.3-4.3'}]],
        filter: [['path',{d:'M3 6h18'}],['path',{d:'M7 12h10'}],['path',{d:'M10 18h4'}]],
        chevron: [['path',{d:'m6 9 6 6 6-6'}]],
        check: [['path',{d:'M20 6 9 17l-5-5'}]],
        clock: [['circle',{cx:12,cy:12,r:10}],['polyline',{points:'12 6 12 12 16 14'}]],
        pin: [['path',{d:'M12 17v5'}],['path',{d:'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z'}]],
        pinOff: [['path',{d:'M12 17v5'}],['path',{d:'M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89'}],['path',{d:'m2 2 20 20'}],['path',{d:'M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11'}]],
        restore: [['path',{d:'M9 14 4 9l5-5'}],['path',{d:'M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11'}]],
        gear: [['path',{d:'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'}],['circle',{cx:12,cy:12,r:3}]],
        question: [['circle',{cx:12,cy:12,r:10}],['path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'}],['path',{d:'M12 17h.01'}]],
        spark: [['path',{d:'M12 3v18'}],['path',{d:'M3 12h18'}],['path',{d:'M5.6 5.6l12.8 12.8'}],['path',{d:'M18.4 5.6 5.6 18.4'}]],
        bars: [['path',{d:'M6 5v14'}],['path',{d:'M11 5v9'}],['path',{d:'M16 10v9'}]],
        agent: [['path',{d:'M12 4 5 19l7-3.5L19 19 12 4z'}]],
        orbit: [['circle',{cx:12,cy:12,r:9}],['path',{d:'M8.5 8.5c2-2 5-2 7 0s2 5 0 7-5 2-7 0-2-5 0-7z'}]],
        alarm: [['circle',{cx:12,cy:13,r:8}],['path',{d:'M12 9v4l2 2'}],['path',{d:'M5 3 2 6'}],['path',{d:'m22 6-3-3'}],['path',{d:'M6.38 18.7 4 21'}],['path',{d:'M17.64 18.67 20 21'}]],
        alarmOff: [['path',{d:'M6.87 6.87a8 8 0 1 0 11.26 11.26'}],['path',{d:'M19.9 14.25a8 8 0 0 0-9.15-9.15'}],['path',{d:'m22 6-3-3'}],['path',{d:'M6.26 18.67 4 21'}],['path',{d:'m2 2 20 20'}],['path',{d:'M4 4 2 6'}]],
        alert: [['circle',{cx:12,cy:12,r:10}],['line',{x1:12,x2:12,y1:8,y2:12}],['line',{x1:12,x2:12.01,y1:16,y2:16}]],
        message: [['path',{d:'M7.9 20A9 9 0 1 0 4 16.1L2 22Z'}],['path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'}],['path',{d:'M12 17h.01'}]],
        shield: [['path',{d:'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'}],['path',{d:'M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3'}],['path',{d:'M12 17h.01'}]],
        checkcircle: [['circle',{cx:12,cy:12,r:10}],['path',{d:'m9 12 2 2 4-4'}]],
        dashed: [['path',{d:'M10.1 2.182a10 10 0 0 1 3.8 0'}],['path',{d:'M13.9 21.818a10 10 0 0 1-3.8 0'}],['path',{d:'M17.609 3.721a10 10 0 0 1 2.69 2.7'}],['path',{d:'M2.182 13.9a10 10 0 0 1 0-3.8'}],['path',{d:'M20.279 17.609a10 10 0 0 1-2.7 2.69'}],['path',{d:'M21.818 10.1a10 10 0 0 1 0 3.8'}],['path',{d:'M3.721 6.391a10 10 0 0 1 2.7-2.69'}],['path',{d:'M6.391 20.279a10 10 0 0 1-2.69-2.7'}]],
        dotdashed: [['path',{d:'M10.1 2.18a9.93 9.93 0 0 1 3.8 0'}],['path',{d:'M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7'}],['path',{d:'M21.82 10.1a9.93 9.93 0 0 1 0 3.8'}],['path',{d:'M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69'}],['path',{d:'M13.9 21.82a9.94 9.94 0 0 1-3.8 0'}],['path',{d:'M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7'}],['path',{d:'M2.18 13.9a9.93 9.93 0 0 1 0-3.8'}],['path',{d:'M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69'}],['circle',{cx:12,cy:12,r:1}]],
        close: [['path',{d:'M18 6 6 18'}],['path',{d:'m6 6 12 12'}]],
        folder: [['path',{d:'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'}]],
        folderPlus: [['path',{d:'M12 10v6'}],['path',{d:'M9 13h6'}],['path',{d:'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'}]],
        branch: [['line',{x1:6,x2:6,y1:3,y2:15}],['circle',{cx:18,cy:6,r:3}],['circle',{cx:6,cy:18,r:3}],['path',{d:'M18 9a9 9 0 0 1-9 9'}]],
        folderGit2: [['path',{d:'M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v5'}],['circle',{cx:13,cy:12,r:2}],['path',{d:'M18 19c-2.8 0-5-2.2-5-5v8'}],['circle',{cx:20,cy:19,r:2}]],
        archive: [['rect',{width:'20',height:'5',x:'2',y:'3',rx:'1'}],['path',{d:'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8'}],['path',{d:'M10 12h4'}]],
        calendar: [['path',{d:'M8 2v4'}],['path',{d:'M16 2v4'}],['rect',{width:18,height:18,x:3,y:4,rx:2}],['path',{d:'M3 10h18'}]],
        chevronLeft: [['path',{d:'m15 18-6-6 6-6'}]],
        chevronRight: [['path',{d:'m9 18 6-6-6-6'}]],
        sliders: [['path',{d:'M20 7h-9'}],['path',{d:'M14 17H5'}],['circle',{cx:17,cy:17,r:3}],['circle',{cx:7,cy:7,r:3}]],
        moreHorizontal: [['circle',{cx:12,cy:12,r:1}],['circle',{cx:19,cy:12,r:1}],['circle',{cx:5,cy:12,r:1}]],
        panels: [['rect',{width:7,height:7,x:3,y:3,rx:1}],['rect',{width:7,height:7,x:14,y:3,rx:1}],['rect',{width:7,height:7,x:14,y:14,rx:1}],['rect',{width:7,height:7,x:3,y:14,rx:1}]],
      };
      const attrs = { width:size, height:size, className, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', 'aria-hidden':true };
      const nodes = icons[name] ?? icons.inbox;
      return h('svg', attrs, ...nodes.map(([tag, props], index) => h(tag, { key: index, ...props })));
    }

    /** T3 `splitForMiddleTruncate` — keep a readable tail (path segment / word). */
    function splitForMiddleTruncate(value, tail) {
      const chars = Array.from(String(value ?? ''));
      const DEFAULT_TAIL = 10, MAX_SEGMENT_TAIL = 16, MIN_WORD_TAIL = 4;
      const WORD_BREAK = /[-_./]/;
      let keep = tail ?? DEFAULT_TAIL;
      if (tail === undefined) {
        const slash = chars.lastIndexOf('/');
        if (slash > 0 && slash < chars.length - 1) {
          const segment = chars.length - slash - 1;
          keep = segment <= MAX_SEGMENT_TAIL ? segment : DEFAULT_TAIL;
        }
      }
      if (keep <= 0 || chars.length <= keep + 4) return null;
      let cut = chars.length - keep;
      if (tail === undefined && !WORD_BREAK.test(chars[cut - 1] ?? '')) {
        const startsWord = (index) => WORD_BREAK.test(chars[index - 1] ?? '');
        let snapped = -1;
        for (let index = cut + 1; index <= chars.length - MIN_WORD_TAIL; index++) {
          if (startsWord(index)) { snapped = index; break; }
        }
        for (let index = cut - 1; snapped < 0 && index >= chars.length - MAX_SEGMENT_TAIL && index > 4; index--) {
          if (startsWord(index)) snapped = index;
        }
        if (snapped > 0) cut = snapped;
      }
      return { head: chars.slice(0, cut).join(''), tail: chars.slice(cut).join('') };
    }

    function fitMiddleTruncateHead(head) {
      const text = head.firstChild;
      const overflowing = head.scrollWidth > head.clientWidth && text && text.nodeType === 3;
      head.toggleAttribute('data-overflow', overflowing);
      let slack = 0;
      if (overflowing) {
        const range = document.createRange();
        const left = head.getBoundingClientRect().left;
        const widthTo = (end) => { range.setStart(text, 0); range.setEnd(text, end); return range.getBoundingClientRect().right - left; };
        let fits = 0, over = text.length;
        while (over - fits > 1) {
          const mid = (fits + over) >> 1;
          if (widthTo(mid) <= head.clientWidth) fits = mid; else over = mid;
        }
        if (/[\uD800-\uDBFF]/.test(text.data[fits - 1] ?? '')) fits -= 1;
        slack = Math.max(0, head.clientWidth - widthTo(fits));
      }
      head.style.clipPath = slack > 0 ? `inset(-0.25em ${slack}px -0.25em 0)` : '';
      const tail = head.nextElementSibling;
      if (tail && tail.style) tail.style.translate = slack > 0 ? `-${slack}px 0` : '';
    }

    function MiddleTruncate({ value, title }) {
      const split = splitForMiddleTruncate(value);
      const headRef = React.useRef(null);
      React.useLayoutEffect(() => {
        const el = headRef.current;
        if (!el || !split) return undefined;
        fitMiddleTruncateHead(el);
        if (typeof ResizeObserver !== 'function') return undefined;
        const ro = new ResizeObserver(() => fitMiddleTruncateHead(el));
        ro.observe(el);
        return () => ro.disconnect();
      }, [split?.head, value]);
      if (!split) {
        return h('span', { className:'t3i-midtrunc', title: title === false ? undefined : value },
          h('span', { className:'t3i-midtrunc-head', style:{ overflow:'hidden', textOverflow:'ellipsis' } }, value));
      }
      return h('span', { className:'t3i-midtrunc', title: title === false ? undefined : value },
        h('span', { ref:headRef, className:'t3i-midtrunc-head' }, split.head),
        h('span', { className:'t3i-midtrunc-tail' }, split.tail));
    }

    const MONOGRAM_COLORS = ['gray','red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose'];
    function workspaceName(card) {
      return (card.workspaceTitle || '').trim() || (card.cwd ? card.cwd.split(/[\\/]/).filter(Boolean).pop() : '') || 'DSH';
    }
    /** T3 Code `deriveProjectIdentity`: monogram from the name, colour from a stable hash. */
    function projectIdentity(name) {
      const normalized = String(name ?? '').normalize('NFKC').trim();
      const words = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
      const firstWord = words[0];
      let monogram = 'PR';
      if (firstWord) {
        const glyphs = Array.from(firstWord);
        const first = glyphs[0] ?? 'P';
        const second = glyphs.slice(1).find((glyph) => /\p{N}/u.test(glyph)) ?? (words.length > 1 ? Array.from(words[words.length-1] ?? '')[0] : glyphs[glyphs.length-1]) ?? first;
        monogram = Array.from(`${first}${second}`.toUpperCase()).slice(0,2).join('');
      }
      const seed = normalized.toLocaleLowerCase('en-US') || 'project';
      let index = 0;
      for (const glyph of seed) index = (index * 31 + (glyph.codePointAt(0) ?? 0)) % MONOGRAM_COLORS.length;
      return { monogram, color: MONOGRAM_COLORS[index] };
    }
    function workspaceInfo(card) {
      const name = workspaceName(card);
      return { name, ...projectIdentity(name) };
    }
    /** T3 Code `ProjectMonogram`: 16×16 tile, 25% radius, monospace 2-glyph text. */
    function Monogram({ card }) {
      const identity = projectIdentity(workspaceName(card));
      const glyphCount = Array.from(identity.monogram).length;
      return h('span',{className:'t3i-mono','data-color':identity.color,'aria-hidden':true},
        h('svg',{viewBox:'0 0 16 16','aria-hidden':true},
          h('text',{x:8,y:10.8,textAnchor:'middle',fill:'currentColor',fontSize:8.25,fontWeight:700,textLength:glyphCount === 1 ? 6 : 12,lengthAdjust:'spacingAndGlyphs',textRendering:'geometricPrecision'},identity.monogram)));
    }

    function inboxRemote(ctx) {
      const service = ctx.get('remote.t3Inbox');
      if (!service) throw new Error('Inbox Remote namespace is not mounted');
      return service;
    }
    function codec(name, schema) { return { mode:'strict', typeSymbol:`dsh-t3-inbox#${name}`, create:() => schema }; }
    function parameter(name, schema) { return { name, wire:name, source:'json', codec:codec(name,schema), strictCodec:codec(`${name}:strict`,schema) }; }
    function descriptor(method, request, result, mode) {
      return {
        id:`dsh-t3-inbox#t3Inbox/${method}`, service:'t3Inbox', namespace:'t3Inbox', method,
        invocation:{kind:'direct'}, parameters:[parameter('request',request)], cancellation:{parameter:'signal'},
        result:codec(`${method}:result`,result), ...(mode ? {mode} : {}),
      };
    }
    async function mountRemote(ctx) {
      const action = z.strictObject({
        sessionId:z.string().min(1).max(256), operationId:z.string().min(8).max(128),
        revision:z.number().int().nonnegative(), context:z.string().min(1).max(100000),
        kind:z.enum(['settle','restore','snooze','wake','ack-woke','undo','mark-unread','clear-unread']),
        until:z.string().datetime().optional(), targetOperationId:z.string().min(8).max(128).optional(),
      });
      await ctx.remote.$mount({ package:'dsh-t3-inbox', descriptors:[
        descriptor('snapshot',z.strictObject({}),z.json()),
        descriptor('follow',z.strictObject({}),z.json(),'stream'),
        descriptor('act',action,z.json()),
        descriptor('pin',z.strictObject({sessionId:z.string().min(1).max(256),pinned:z.boolean()}),z.json()),
        descriptor('prepare',z.strictObject({sessionId:z.string().min(1).max(256)}),z.strictObject({status:z.enum(['ready','unavailable','not-found']),message:z.string().optional()})),
        descriptor('saveSnoozeSettings',z.strictObject({revision:z.number().int().nonnegative(),presets:z.array(z.discriminatedUnion('kind',[
          z.strictObject({kind:z.literal('after'),minutes:z.number().int().min(1).max(43200)}),
          z.strictObject({kind:z.literal('at'),day:z.enum(['today','tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday']),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)}),
        ])).max(8)}),z.json()),
      ] });
    }

    function readMode() {
      try { return localStorage.getItem('dsh-t3-inbox:mode') === 'native' ? 'native' : 'inbox'; }
      catch { return 'inbox'; }
    }
    function normalizePanelsPosition(value) {
      if (value === 'top' || value === true) return 'top';
      if (value === 'hidden' || value === false) return 'hidden';
      return 'footer';
    }
    function readPanelsPosition() {
      try {
        const saved = localStorage.getItem(GLOBAL_PANELS_KEY);
        if (saved === 'footer' || saved === 'top' || saved === 'hidden') return saved;
        return localStorage.getItem('dsh-t3-inbox:panels') === 'on' ? 'top' : 'footer';
      } catch {
        return 'footer';
      }
    }
    function normalizeSidebarAppearance(value) {
      const defaults = DEFAULT_SIDEBAR_APPEARANCE;
      const mode = value?.mode;
      const color = (candidate, fallback) => typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate) ? candidate.toLowerCase() : fallback;
      return {
        mode:mode === 't3' || mode === 'custom' ? mode : defaults.mode,
        light:color(value?.light, defaults.light),
        dark:color(value?.dark, defaults.dark),
      };
    }
    function readSidebarAppearance() {
      try { return normalizeSidebarAppearance(JSON.parse(localStorage.getItem(SIDEBAR_APPEARANCE_KEY))); }
      catch { return DEFAULT_SIDEBAR_APPEARANCE; }
    }
    function readWorkingShelfEnabled() {
      try {
        const raw = localStorage.getItem('dsh-t3-inbox:working-shelf');
        return raw !== 'off' && raw !== 'false';
      } catch { return true; }
    }
    function readTimeFormat() {
      try {
        const raw = localStorage.getItem('dsh-t3-inbox:time-format');
        return raw === '12-hour' || raw === '24-hour' ? raw : 'locale';
      } catch { return 'locale'; }
    }
    const SETTLED_INITIAL_COUNT = 10;
    const SETTLED_PAGE_COUNT = 25;
    const SHELF_EXPANDED_KEYS = {
      working:'dsh-t3-inbox:working-expanded',
      snoozed:'dsh-t3-inbox:snoozed-expanded',
      settled:'dsh-t3-inbox:settled-expanded',
    };
    function readShelfExpanded(key) {
      try { return JSON.parse(localStorage.getItem(key)) === true; }
      catch { return false; }
    }
    function writeShelfExpanded(key, open) {
      try { localStorage.setItem(key, JSON.stringify(Boolean(open))); } catch {}
    }
    function readVisited() {
      try {
        const parsed = JSON.parse(localStorage.getItem('dsh-t3-inbox:visited') || '{}');
        return Object.fromEntries(Object.entries(parsed).filter(([id,time]) => typeof id === 'string' && Number.isFinite(time) && time >= 0));
      } catch { return {}; }
    }
    function advanceVisits(visited, sessionIds, at) {
      if (!Number.isFinite(at)) return {};
      const changed = sessionIds.filter((id) => id && at > (visited[id] ?? 0));
      if (!changed.length) return {};
      const next = {...visited};
      for (const id of changed) next[id] = at;
      try { localStorage.setItem('dsh-t3-inbox:visited',JSON.stringify(next)); } catch {}
      return {visited:next};
    }
    function createViewStore() {
      let snapshot = {
        instanceId:crypto.randomUUID(),
        mode:readMode(), wide:null, search:'', workspaceId:'', workspaceIds:[], visited:readVisited(),
        settledOpen:readShelfExpanded(SHELF_EXPANDED_KEYS.settled),
        snoozedOpen:readShelfExpanded(SHELF_EXPANDED_KEYS.snoozed),
        workingOpen:readShelfExpanded(SHELF_EXPANDED_KEYS.working),
        workingShelfEnabled:readWorkingShelfEnabled(),
        timeFormat:readTimeFormat(),
        settledLimit:SETTLED_INITIAL_COUNT, selectedIds:[], anchorId:null, filterOpen:false,
        panelsPosition:readPanelsPosition(), globalPanels:[],
        sidebarAppearance:readSidebarAppearance(),
        remote:null, error:null, actionError:null, errorToast:null, lastAction:null, slotError:null, pendingActions:{}, optimisticCards:{}, undo:null, navigationCapable:false,
        navigationEpoch:0, viewRevision:0, panelKey:'conversation', currentSessionId:null,
        navigationOwner:null, pendingNavigation:null, customSnoozeSessionId:null, customSnoozeSessionIds:null, editSnoozeShortcuts:false,
      };
      const listeners = new Set();
      return {
        getSnapshot:() => snapshot,
        subscribe:(fn) => { listeners.add(fn); return () => listeners.delete(fn); },
        set:(patch) => { snapshot = {...snapshot,...patch}; for (const fn of listeners) fn(); },
      };
    }
    function useView(runtime) { return React.useSyncExternalStore(runtime.store.subscribe,runtime.store.getSnapshot); }
    const PLURAL_RULES_CACHE = new Map();
    function normalizeLocale(localeId) {
      const primary = String(localeId ?? '').toLowerCase().split(/[-_]/)[0];
      return Object.hasOwn(LOCALES, primary) ? primary : 'en';
    }
    function isZhLocale(localeId) {
      return normalizeLocale(localeId) === 'zh';
    }
    function pluralCategory(localeId, count) {
      const lang = normalizeLocale(localeId);
      try {
        let rules = PLURAL_RULES_CACHE.get(lang);
        if (!rules) {
          rules = new Intl.PluralRules(lang);
          PLURAL_RULES_CACHE.set(lang, rules);
        }
        return rules.select(count);
      } catch {
        return count === 1 ? 'one' : 'other';
      }
    }
    function selectPluralKey(localeId, count, forms) {
      const cat = pluralCategory(localeId, count);
      if (cat === 'one' && forms.one) return forms.one;
      if (cat === 'few' && forms.few) return forms.few;
      return forms.other;
    }
    function applyLocaleParams(text, params) {
      let result = String(text ?? '');
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          result = result.replaceAll(`{${name}}`, String(value));
        }
      }
      return result;
    }
    function translate(localeId, key, params) {
      const dict = LOCALES[normalizeLocale(localeId)];
      return applyLocaleParams(dict[key] ?? en[key] ?? key, params);
    }
    function resolveLocalized(t, localeId, key, params) {
      if (typeof t === 'function') {
        const translated = t(key, params);
        if (typeof translated === 'string' && translated !== key) {
          return applyLocaleParams(translated, params);
        }
      }
      return translate(localeId, key, params);
    }
    function inspectionView(store) {
      const view = store.getSnapshot();
      const rendered = typeof document === 'undefined' ? null : {
        roots:[...document.querySelectorAll('.t3i-root')].map((element) => ({
          visible:element.getClientRects().length > 0,
          rows:[...element.querySelectorAll('.t3i-row')].filter((item) => !item.closest('[data-t3i-motion-ghost="true"]')).length,
          rowTitles:[...element.querySelectorAll('.t3i-row-title')].filter((item) => !item.closest('[data-t3i-motion-ghost="true"]')).map((item) => item.textContent),
          controls:[...element.querySelectorAll('.t3i-item')].filter((item) => !item.closest('[data-t3i-motion-ghost="true"]')).map((item) => {
            const rect=item.getBoundingClientRect();
            const actions=item.querySelector('.t3i-row-actions,.t3i-slim-action');
            return {
              title:item.querySelector('.t3i-row-title')?.textContent,
              variant:item.getAttribute('data-variant'),
              pin:(() => { const pin=item.querySelector('.t3i-pin'); if (!pin) return null; const r=pin.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })(),
              mono:item.querySelector('.t3i-mono')?.getAttribute('data-color') ?? null,
              status:item.querySelector('.t3i-status, .t3i-slim-wake')?.textContent ?? null,
              rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
              hovered:item.matches(':hover'),
              actionsDisplay:actions ? getComputedStyle(actions).display : null,
              buttons:[...item.querySelectorAll('.t3i-row-actions button,.t3i-slim-action')].map((button) => {
                const r = button.getBoundingClientRect();
                return {label:button.getAttribute('aria-label'),disabled:button.disabled,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
              }),
            };
          }),
          sections:[...element.querySelectorAll('.t3i-section-title')].filter((item) => !item.closest('[data-t3i-motion-ghost="true"]')).map((item) => item.textContent),
          sectionDetails:[...element.querySelectorAll('.t3i-section-title')].filter((item) => !item.closest('[data-t3i-motion-ghost="true"]')).map((item) => {
            const rect=item.getBoundingClientRect();
            return {text:item.textContent,expanded:item.getAttribute('aria-expanded'),rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};
          }),
          focus:(() => { const item=document.activeElement?.closest('.t3i-root,.t3i-home,.t3i-context-menu'); return item ? {tag:document.activeElement.tagName,className:document.activeElement.className,label:document.activeElement.getAttribute('aria-label'),text:document.activeElement.textContent} : null; })(),
          undoControl:(() => { const button=document.querySelector('.t3i-undo button'); if (!button) return null; const rect=button.getBoundingClientRect(); return {disabled:button.disabled,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}}; })(),
          notices:[...document.querySelectorAll('.t3i-toast .t3i-toast-body')].map((item) => item.textContent),
          headButtons:[...element.querySelectorAll('.t3i-title-row button')].map((button) => { const r = button.getBoundingClientRect(); return {label:button.getAttribute('aria-label'),active:button.getAttribute('data-active') === 'true',rect:{x:r.x,y:r.y,width:r.width,height:r.height}}; }),
          nativeMenuControls:[...document.querySelectorAll('[role="menu"] button,[role="menuitem"],[role="menuitemcheckbox"]')].filter((control) => control.getClientRects().length > 0).map((control) => { const r = control.getBoundingClientRect(); return {tag:control.tagName,role:control.getAttribute('role'),text:(control.getAttribute('aria-label') || control.textContent || '').trim().slice(0,60),rect:{x:r.x,y:r.y,width:r.width,height:r.height}}; }),
          hitTests:[{x:60,y:48},{x:150,y:48},{x:216,y:48},{x:150,y:120},{x:100,y:345}].map((point) => {
            const hit = document.elementFromPoint(point.x, point.y);
            if (!hit) return {point, hit:null};
            const chain = [];
            for (let node = hit; node && chain.length < 5; node = node.parentElement) chain.push(`${node.tagName.toLowerCase()}.${String(node.className || '').split(' ').filter(Boolean).slice(0,2).join('.')}`);
            return {point, hit:chain};
          }),
          menuControls:[...document.querySelectorAll('.t3i-snooze-menu button,.t3i-snooze-menu input,.t3i-snooze-menu select,.t3i-modal button,.t3i-modal input,.t3i-modal select,.t3i-calendar-popover button'),...element.querySelectorAll('.t3i-context-menu button,.t3i-context-submenu button,.t3i-context-submenu input,.t3i-context-submenu select,.t3i-filter-popover button,.t3i-filter-popover input')].map((control) => {
            const rect = control.getBoundingClientRect();
            return {tag:control.tagName,text:(control.getAttribute('aria-label') || control.textContent || '').slice(0,40),value:control.value ?? null,active:control.getAttribute('data-active') ?? null,rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};
          }),
          previewVisible:Boolean(document.querySelector('.t3i-preview')),
          tooltipVisible:Boolean(document.querySelector('.t3i-tooltip')),
          tooltipText:document.querySelector('.t3i-tooltip')?.textContent ?? null,
          customSnoozeOpen:Boolean(document.querySelector('.t3i-modal')),
          filterOpen:Boolean(element.querySelector('.t3i-filter-popover')),
          filterPlace:(() => {
            const pop = element.querySelector('.t3i-filter-popover');
            if (!pop) return null;
            const rect = pop.getBoundingClientRect();
            const root = element.getBoundingClientRect();
            let scrollLeft = 0;
            for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
              if (node.scrollLeft) scrollLeft = Math.max(scrollLeft, node.scrollLeft);
            }
            return {
              rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},
              root:{x:root.x,y:root.y,width:root.width,height:root.height},
              clippedRight:rect.right > root.right + 1,
              clippedLeft:rect.left < root.left - 1,
              scrollLeft,
            };
          })(),
          footer:[...element.querySelectorAll('.t3i-foot button')].map((button) => {
            const rect = button.getBoundingClientRect();
            return {label:button.getAttribute('aria-label'),active:button.getAttribute('data-active') === 'true',pressed:button.getAttribute('aria-pressed') === 'true',rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};
          }),
          shell:{chrome:document.documentElement?.getAttribute?.('data-t3-inbox') ?? null,nav:document.documentElement?.getAttribute?.('data-t3-inbox-nav') ?? null,panelsPosition:view.panelsPosition},
        })),
        home:Boolean(document.querySelector('.t3i-home')),
        styleInstalled:Boolean(document.querySelector('style[data-t3-inbox]')),
        modeButtons:[...document.querySelectorAll('.kB3qhq_panelRow:has(.t3i-sidebar-switch-icon)')].map((element) => ({visible:element.getClientRects().length>0,label:element.getAttribute('aria-label')})),
        wide:view.wide,
        viewport:typeof window === 'undefined' ? null : {width:window.innerWidth,height:window.innerHeight,screenX:window.screenX,screenY:window.screenY,outerHeight:window.outerHeight},
        visibility:document.visibilityState,
      };
      return {
        clientInstanceId:view.instanceId,
        mode:view.mode,search:view.search,workspaceId:view.workspaceId,error:view.error,actionError:view.actionError,lastAction:view.lastAction,slotError:view.slotError,
        localOrder:readPinnedOrder(),
        navigationCapable:view.navigationCapable,navigationEpoch:view.navigationEpoch,viewRevision:view.viewRevision,
        panelKey:view.panelKey,currentSessionId:view.currentSessionId,pendingActions:Object.keys(view.pendingActions),
        undo:view.undo ? {operationId:view.undo.operationId,sessionId:view.undo.sessionId,kind:view.undo.kind,expiresAt:view.undo.expiresAt} : null,
        remote:view.remote ? {
          phase:view.remote.phase,generation:view.remote.generation,revision:view.remote.revision,error:view.remote.error,
          capabilities:view.remote.capabilities,
          cards:view.remote.cards.map((card) => ({
            sessionId:card.sessionId,title:card.title,section:card.section,running:card.running,
            needsYou:card.needsYou,pendingCount:card.pendingCount,canSettle:card.canSettle,canSnooze:card.canSnooze,
            revision:card.revision,members:card.members.length,hasContext:Boolean(card.context),treeError:card.treeError,
          })),
        } : null,
        rendered,
      };
    }
    /* Shared wall-clock minute tick (T3 useNowMinute / minuteTick) — one timer for all rows. */
    const minuteListeners = new Set();
    let minuteSnapshot = Math.floor(Date.now() / 60000);
    let minuteTimer = 0;
    function stopMinuteTick() {
      if (!minuteTimer) return;
      clearTimeout(minuteTimer);
      minuteTimer = 0;
    }
    function ensureMinuteTick() {
      if (minuteTimer || typeof setTimeout !== 'function' || minuteListeners.size === 0) return;
      const schedule = () => {
        if (minuteListeners.size === 0) { minuteTimer = 0; return; }
        const now = Date.now();
        const delay = Math.max(250, (Math.floor(now / 60000) + 1) * 60000 - now + 5);
        minuteTimer = setTimeout(() => {
          minuteSnapshot = Math.floor(Date.now() / 60000);
          for (const listener of [...minuteListeners]) listener();
          schedule();
        }, delay);
      };
      schedule();
    }
    function useNowMinute() {
      return React.useSyncExternalStore(
        (onStoreChange) => {
          minuteListeners.add(onStoreChange);
          ensureMinuteTick();
          return () => {
            minuteListeners.delete(onStoreChange);
            if (minuteListeners.size === 0) stopMinuteTick();
          };
        },
        () => minuteSnapshot,
        () => minuteSnapshot,
      );
    }
    const sharedModel = (() => {
      try { return require('dsh-t3-inbox/model'); } catch { return null; }
    })();
    const sharedFormatSidebarRelativeTime = sharedModel?.formatSidebarRelativeTime ?? null;
    const sharedActivityTimestamp = sharedModel?.activityTimestamp ?? null;
    const sharedSettledTimestamp = sharedModel?.settledTimestamp ?? null;
    function localToSortableMs(value) {
      if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : null;
      if (typeof value === 'string' && value) {
        const ms = Date.parse(value);
        return Number.isFinite(ms) && ms > 0 ? ms : null;
      }
      return null;
    }
    function localCollectProgresses(card) {
      const list = [];
      if (card?.progress) list.push(card.progress);
      for (const member of card?.members ?? []) {
        if (member?.progress && member.progress !== card?.progress) list.push(member.progress);
      }
      return list;
    }
    function localInboxSortTimestamp(card) {
      if (!card || typeof card !== 'object') return 0;
      let best = Math.max(
        0,
        localToSortableMs(card.createdAt) ?? localToSortableMs(card.members?.[0]?.header?.createdAt) ?? 0,
        localToSortableMs(card.unsettledAt) ?? 0,
        localToSortableMs(card.observedReturnAt) ?? 0,
        localToSortableMs(card.result?.time) ?? 0,
      );
      for (const progress of localCollectProgresses(card)) {
        best = Math.max(
          best,
          localToSortableMs(progress.latestHumanInput?.time) ?? 0,
          localToSortableMs(progress.turn?.start?.time) ?? 0,
          localToSortableMs(progress.turn?.end?.time) ?? 0,
          localToSortableMs(progress.latestResult?.time) ?? 0,
          localToSortableMs(progress.latestWork?.time) ?? 0,
        );
      }
      return best > 0 ? best : (localToSortableMs(card.sortAt) ?? 0);
    }
    function localWorkingSortTimestamp(card) {
      if (!card || typeof card !== 'object') return 0;
      const createdAt = localToSortableMs(card.createdAt) ?? localToSortableMs(card.members?.[0]?.header?.createdAt);
      let latestHumanInput = null;
      let turnStart = null;
      for (const progress of localCollectProgresses(card)) {
        const inputMs = localToSortableMs(progress.latestHumanInput?.time);
        if (inputMs != null && (latestHumanInput == null || inputMs > latestHumanInput)) latestHumanInput = inputMs;
        const startMs = localToSortableMs(progress.turn?.start?.time);
        if (startMs != null && (turnStart == null || startMs > turnStart)) turnStart = startMs;
      }
      const sendAt = latestHumanInput ?? turnStart;
      if (createdAt != null || sendAt != null) return Math.max(createdAt ?? 0, sendAt ?? 0);
      return localToSortableMs(card.sortAt) ?? 0;
    }
    function localPinnedFallbackTimestamp(card) {
      if (!card || typeof card !== 'object') return 0;
      return localToSortableMs(card.createdAt) ?? localToSortableMs(card.members?.[0]?.header?.createdAt) ?? localToSortableMs(card.sortAt) ?? 0;
    }
    function sortPinnedCards(cards, pinnedOrderIds = null) {
      if (typeof sharedModel?.sortPinnedCards === 'function') return sharedModel.sortPinnedCards(cards, pinnedOrderIds);
      const list = [...(cards ?? [])];
      if (list.length < 2) return list;
      const rank = new Map();
      for (const id of pinnedOrderIds ?? []) {
        if (typeof id === 'string' && !rank.has(id)) rank.set(id, rank.size);
      }
      const keyed = [], keyless = [];
      for (const card of list) (rank.has(card.sessionId) ? keyed : keyless).push(card);
      keyed.sort((a, b) => rank.get(a.sessionId) - rank.get(b.sessionId) || a.sessionId.localeCompare(b.sessionId));
      keyless.sort((a, b) => localPinnedFallbackTimestamp(b) - localPinnedFallbackTimestamp(a) || a.sessionId.localeCompare(b.sessionId));
      return [...keyed, ...keyless];
    }
    function sortInboxCardsByReturn(cards) {
      if (typeof sharedModel?.sortInboxCardsByReturn === 'function') return sharedModel.sortInboxCardsByReturn(cards);
      return [...(cards ?? [])].sort((a, b) => localInboxSortTimestamp(b) - localInboxSortTimestamp(a) || a.sessionId.localeCompare(b.sessionId));
    }
    function sortWorkingCardsBySend(cards) {
      if (typeof sharedModel?.sortWorkingCardsBySend === 'function') return sharedModel.sortWorkingCardsBySend(cards);
      return [...(cards ?? [])].sort((a, b) => localWorkingSortTimestamp(b) - localWorkingSortTimestamp(a) || a.sessionId.localeCompare(b.sessionId));
    }
    function sortSnoozedCards(cards) {
      if (typeof sharedModel?.sortSnoozedCards === 'function') return sharedModel.sortSnoozedCards(cards);
      return [...(cards ?? [])].sort((a, b) => (localToSortableMs(a.snooze?.until ?? a.snoozeUntil) ?? 0) - (localToSortableMs(b.snooze?.until ?? b.snoozeUntil) ?? 0) || a.sessionId.localeCompare(b.sessionId));
    }
    function sortSettledCards(cards) {
      if (typeof sharedModel?.sortSettledCards === 'function') return sharedModel.sortSettledCards(cards);
      return [...(cards ?? [])].sort((a, b) => (cardSettledAt(b) ?? 0) - (cardSettledAt(a) ?? 0) || a.sessionId.localeCompare(b.sessionId));
    }
    const LOCAL_SEARCH_FIELD_CACHE = new Map();
    function localFoldSearchChar(ch) {
      return ch.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace('ς', 'σ').replace(/[\u2018\u2019]/g, "'");
    }
    function localFoldInPlace(text) {
      return text.replace(/[\u0080-\uffff]/g, (ch) => { const f = localFoldSearchChar(ch); return f.length === 1 ? f : ch; }).toLowerCase();
    }
    function localIsSearchCjk(ch) {
      if (!ch) return false;
      const code = ch.codePointAt(0);
      return (code >= 0x3040 && code <= 0x30ff) || (code >= 0x3400 && code <= 0x4dbf) || (code >= 0x4e00 && code <= 0x9fff) || (code >= 0xf900 && code <= 0xfaff);
    }
    function localFoldQuery(query) {
      return localFoldInPlace(String(query ?? '').replace(/^\s*["'`\u201c\u201d\u2018\u2019]+|["'`\u201c\u201d\u2018\u2019]+\s*$/g, '').normalize('NFC'))
        .split(/\s+/).filter(Boolean).join(' ');
    }
    function localPrepareSearchField(source) {
      const cached = LOCAL_SEARCH_FIELD_CACHE.get(source);
      if (cached) return cached;
      if (LOCAL_SEARCH_FIELD_CACHE.size >= 4096) LOCAL_SEARCH_FIELD_CACHE.delete(LOCAL_SEARCH_FIELD_CACHE.keys().next().value);
      const wordStarts = new Uint8Array(source.length);
      const chars = Array.from(source);
      const AN = /[\p{L}\p{N}]/u, LL = /\p{Ll}/u, LU = /\p{Lu}/u, DG = /\p{N}/u, SY = /\p{So}/u, AP = /['\u2019]/;
      let index = 0;
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i], prev = chars[i - 1] ?? '', bp = chars[i - 2] ?? '', next = chars[i + 1] ?? '';
        const afterAp = AP.test(prev) && AN.test(bp);
        if ((AN.test(ch) || SY.test(ch)) && !afterAp && (prev === '' || !AN.test(prev) || (LL.test(prev) && LU.test(ch)) || (LU.test(prev) && LU.test(ch) && LL.test(next)) || DG.test(prev) !== DG.test(ch) || localIsSearchCjk(ch))) {
          wordStarts[index] = 1;
        }
        index += ch.length;
      }
      const field = { text: localFoldInPlace(source), wordStarts };
      LOCAL_SEARCH_FIELD_CACHE.set(source, field);
      return field;
    }
    function localSearchSidebarCards(cards, query, nowMs = Date.now()) {
      const nq = localFoldQuery(query);
      if (!nq || !Array.isArray(cards) || !cards.length) return [];
      const AN = /[\p{L}\p{N}]/u, DG = /\p{N}/u, LT = /\p{L}/u, SY = /\p{So}/u;
      const FILLER = new Set(['a','an','and','for','in','of','on','the','to','with']);
      const WT_RE = /^(?:t3|t3code)\/(?=\S)/;
      const wordEnd = (f, idx) => { let e = idx + 1; while (e < f.text.length && !f.wordStarts[e] && AN.test(f.text[e])) e++; return e; };
      const within1 = (l, r, swapOnly) => {
        if (Math.abs(l.length - r.length) > (swapOnly ? 0 : 1)) return false;
        let i = 0; while (i < l.length && i < r.length && l[i] === r[i]) i++;
        const rl = l.slice(i), rr = r.slice(i);
        const sw = rl.length > 1 && rl[0] === rr[1] && rl[1] === rr[0] && rl.slice(2) === rr.slice(2);
        return swapOnly ? sw : (sw || rl === rr || rl.slice(1) === rr.slice(1) || rl.slice(1) === rr || rl === rr.slice(1));
      };
      const joinedMatch = (f, tok) => {
        for (let st = f.text.indexOf(tok[0]); st !== -1; st = f.text.indexOf(tok[0], st + 1)) {
          if (!f.wordStarts[st]) continue;
          const runs = []; let at = st, rest = tok;
          while (rest.length > 0 && at < f.text.length) {
            const e = wordEnd(f, at);
            if (rest.length <= e - at && f.text.startsWith(rest, at)) { runs.push({ start: at, end: at + rest.length }); rest = ''; }
            else if (rest.startsWith(f.text.slice(at, e))) { runs.push({ start: at, end: e }); rest = rest.slice(e - at); at = e; while (at < f.text.length && !f.wordStarts[at]) at++; }
            else break;
          }
          const last = runs.at(-1);
          if (!rest.length && last && runs.length >= 2 && (last.end === wordEnd(f, last.start) || last.end - last.start >= 3 || st === f.wordStarts.indexOf(1) || runs.slice(0, -1).every((r) => r.end - r.start >= 3))) {
            return { score: 0.6, start: st, end: last.end, letters: runs };
          }
        }
        return null;
      };
      const tokMatch = (f, tok, typos, isPri, midW) => {
        if (!tok.length) return null;
        let best = null, ownB;
        for (let idx = f.text.indexOf(tok); idx !== -1; idx = f.text.indexOf(tok, idx + 1)) {
          if (f.wordStarts[idx] || (ownB ??= !AN.test(tok[0]) && !SY.test(tok[0]))) {
            const end = idx + tok.length;
            const whole = end >= f.text.length || f.wordStarts[end] === 1 || !AN.test(f.text[end]);
            let runEnd = end; while (runEnd < f.text.length && AN.test(f.text[runEnd])) runEnd++;
            const sc = whole ? 1 : 0.7 + (0.2 * tok.length) / (runEnd - idx);
            if (!best || sc > best.score) best = { score: sc, start: idx, end };
            if (sc === 1) return best;
          } else if (midW && tok.length >= 4 && !best) best = { score: 0.3, start: idx, end: idx + tok.length };
        }
        if ((!best || best.score <= 0.3) && isPri) { const j = joinedMatch(f, tok); if (j) return j; }
        if ((best && best.score > 0.3) || !typos || tok.length < 3 || !LT.test(tok)) return best;
        for (let idx = 0; idx < f.text.length; idx++) {
          if (!f.wordStarts[idx]) continue;
          const first = f.text[idx];
          if (!(first === tok[0] || (tok.length > 3 && first === tok[1] && f.text[idx + 1] === tok[0]))) continue;
          let runEnd = idx + 1; while (runEnd < f.text.length && AN.test(f.text[runEnd])) runEnd++;
          const w = f.text.slice(idx, runEnd), sh = tok.length <= 4;
          for (const len of (sh ? [tok.length, tok.length + 1] : [tok.length, tok.length - 1, tok.length + 1])) {
            if (len <= w.length && within1(tok, w.slice(0, len), sh && len === tok.length)) return { score: 0.45, start: idx, end: idx + len };
          }
        }
        return best;
      };
      const matchFields = (fq, fields, typos) => {
        if (!fq.length) return null;
        const pri = fields[0]?.value ? localPrepareSearchField(fields[0].value) : undefined;
        const toks = fq.split(' ').filter(Boolean);
        if (!toks.length) return null;
        const fOpt = toks.some((t) => !FILLER.has(t));
        const pRanges = []; let tot = 0, cnt = 0, notW = false, strong = true;
        for (const t of toks) {
          let best = 0, bp = null, aws = false;
          for (const w of fields) {
            if (!w.value.length) continue;
            const f = localPrepareSearchField(w.value);
            if (best >= w.weight && f !== pri && aws) continue;
            const m = tokMatch(f, t, typos, f === pri, w.midWord ?? false);
            if (!m) continue;
            if (f === pri) bp = m;
            if (m.score >= 0.7 && !w.context) aws = true;
            if (m.score * w.weight > best) best = m.score * w.weight;
          }
          if (best === 0) { if (fOpt && FILLER.has(t)) continue; return null; }
          strong &&= aws;
          if (bp) pRanges.push(...(bp.letters ?? [bp]));
          tot += best; cnt += 1;
          if (FILLER.has(t)) notW ||= !fOpt; else notW ||= t.length < 3 || best < 1;
        }
        let q = tot / cnt;
        if (pri) {
          if (pri.text === fq) q += 0.5;
          else if (toks.length > 1 && pri.text.includes(fq)) q += 0.25;
        }
        const merged = [];
        for (const r of pRanges.sort((a, b) => a.start - b.start)) {
          const last = merged.at(-1);
          if (last && r.start <= last.end) merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, r.end) };
          else merged.push({ start: r.start, end: r.end });
        }
        return { quality: q, wholeWords: !notW, strong, primaryRanges: merged };
      };
      const scoreCard = (card, typos) => {
        const br = typeof card.branch === 'string' && card.branch ? card.branch.replace(WT_RE, '') : null;
        const cwdName = typeof card.workspaceTitle === 'string' && card.workspaceTitle.trim()
          ? card.workspaceTitle.trim()
          : (typeof card.cwd === 'string' && card.cwd.trim() ? (card.cwd.trim().split(/[/\\]+/).filter(Boolean).at(-1) ?? null) : null);
        const fields = [{ value: String(card.title ?? ''), weight: 1, midWord: true }];
        if (br) fields.push({ value: br, weight: 0.6 });
        if (cwdName) fields.push({ value: cwdName, weight: 0.25, context: true });
        const fq = nq.replace(/^(?:pr|pull request|pull)\s*(?=#?\d)/, '').replace(/^#\s*/, '').replace(WT_RE, '');
        const fm = matchFields(fq, fields, typos);
        let rm = null;
        if (!fm && nq.length >= 8 && card.sessionId) {
          const folded = String(card.sessionId).toLowerCase(), any = DG.test(nq);
          const at = folded.indexOf(nq), nc = (tx, e) => !DG.test(tx[e] ?? '');
          if (any ? ((at !== -1 && nc(folded, at + nq.length)) || (nq.startsWith(folded) && nc(nq, folded.length))) : at === 0) {
            rm = { quality: 0.6, wholeWords: false, strong: true, primaryRanges: [] };
          }
        }
        const m = fm ?? rm;
        if (!m) return null;
        if (!m.primaryRanges.length && !rm && fq.includes(' ')) {
          const holds = (tx, q) => matchFields(q, [{ value: tx, weight: 1 }], typos)?.primaryRanges;
          const ok = (br && holds(br, fq)) || (cwdName && holds(cwdName, fq)) || (cwdName && br && (() => {
            const rest = fq.split(' ').filter((tok) => !holds(cwdName, tok)).join(' ');
            return Boolean(rest && rest !== fq && holds(br, rest));
          })());
          if (!ok) return null;
        }
        const actAt = cardActivityAt(card);
        const recency = actAt == null ? 0 : 2 ** (-Math.max(0, nowMs - actAt) / (14 * 86_400_000));
        return { score: m.quality * Math.min(2.5, 1 + recency), quality: m.quality, wholeWords: m.wholeWords, strong: m.strong, ranges: m.primaryRanges };
      };
      const collect = (typos) => {
        const out = [];
        for (let order = 0; order < cards.length; order++) {
          const match = scoreCard(cards[order], typos);
          if (match) out.push({ card: cards[order], match, order });
        }
        return out;
      };
      let items = collect(false);
      if (!items.some((e) => e.match.strong)) items = collect(true);
      const cls = (q) => q >= 1.5 ? 3 : q >= 0.7 ? 2 : q >= 0.4 ? 1 : 0;
      const wm = (m) => Math.min(cls(m.quality), 2);
      items.sort((a, b) => wm(b.match) - wm(a.match) || cls(b.match.quality) - cls(a.match.quality) || Number(b.match.wholeWords) - Number(a.match.wholeWords) || b.match.score - a.match.score || a.order - b.order);
      return items.map(({ card, match }) => ({ card, ranges: match.ranges, score: match.score, quality: match.quality }));
    }
    function searchSidebarCards(cards, query, nowMs = Date.now()) {
      if (typeof sharedModel?.searchSidebarCards === 'function') return sharedModel.searchSidebarCards(cards, query, nowMs);
      return localSearchSidebarCards(cards, query, nowMs);
    }
    function finiteActivityTime(value) {
      return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
    }
    /** Mirrors lib/model.js activityTimestamp (Desktop may not resolve the shared export). */
    function localActivityTimestamp(card) {
      if (!card || typeof card !== 'object') return null;
      let latest = null;
      const consider = (time) => {
        const value = finiteActivityTime(time);
        if (value != null && (latest == null || value > latest)) latest = value;
      };
      const progresses = [];
      if (card.progress) progresses.push(card.progress);
      for (const member of card.members ?? []) {
        if (member?.progress) progresses.push(member.progress);
      }
      for (const progress of progresses) {
        consider(progress.latestHumanInput?.time);
        consider(progress.latestResult?.time);
        consider(progress.latestWork?.time);
        consider(progress.turn?.start?.time);
        consider(progress.turn?.end?.time);
      }
      if (latest != null) return latest;
      return finiteActivityTime(card.runtime?.startedAt) ?? finiteActivityTime(card.sortAt);
    }
    function localSettledTimestamp(card) {
      if (!card || typeof card !== 'object') return null;
      const settled = typeof card.settledAt === 'number'
        ? finiteActivityTime(card.settledAt)
        : typeof card.settledAt === 'string' && card.settledAt
          ? finiteActivityTime(Date.parse(card.settledAt))
          : null;
      return settled ?? localActivityTimestamp(card);
    }
    function searchHighlightRange(text, query) {
      const source = String(text ?? '');
      const needle = String(query ?? '').trim().toLocaleLowerCase();
      if (!needle) return null;
      const start = source.toLocaleLowerCase().indexOf(needle);
      if (start < 0) return null;
      return { start, end: start + needle.length };
    }
    function highlightText(text, query, ranges = null) {
      const source = String(text ?? '');
      const spans = Array.isArray(ranges) && ranges.length > 0
        ? ranges
        : (() => { const r = searchHighlightRange(source, query); return r ? [r] : []; })();
      if (!spans.length) return source;
      const parts = [];
      let cursor = 0;
      for (const range of spans) {
        if (range.start > cursor) parts.push(source.slice(cursor, range.start));
        parts.push(h('mark',{key:`${range.start}:${range.end}`,className:'t3i-hit'}, source.slice(range.start, range.end)));
        cursor = range.end;
      }
      if (cursor < source.length) parts.push(source.slice(cursor));
      return h(React.Fragment, null, ...parts);
    }
    const SIDEBAR_MOTION_TIMING = { duration: 150, easing: 'ease-out' };
    const SIDEBAR_MOTION_MAX_FADED_ROWS = 40;
    function sidebarMotionRowTravel(height) { return Math.min(height, 40); }
    function sidebarMotionProgress(animation) {
      if (!animation) return 1;
      if (animation.playState === 'finished') return 1;
      const progress = animation.effect?.getComputedTiming?.()?.progress;
      return typeof progress === 'number' && Number.isFinite(progress) ? progress : 0;
    }
    /** T3 Sidebar.motion.ts FLIP + fade controller over direct children of the flat sidebar <ul>. */
    function createSidebarListMotion(parent) {
      let positions = null;
      let disposed = false;
      const reducedMotion = parent?.ownerDocument?.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
      const running = new Map();
      const entering = new Map();
      const exiting = new Map();
      let released = null;

      const isElement = (node) => Boolean(node && node.nodeType === 1);
      const remainingOffset = (node) => {
        const current = running.get(node);
        const run = current ? current.offset * (1 - sidebarMotionProgress(current.animation)) : 0;
        const entry = entering.get(node);
        const enter = entry ? entry.travel * (1 - sidebarMotionProgress(entry.animation)) : 0;
        return run + enter;
      };
      const clearFades = () => {
        for (const entry of entering.values()) entry.animation?.cancel?.();
        for (const animation of exiting.values()) animation?.cancel?.();
        for (const node of exiting.keys()) node.remove();
        entering.clear();
        exiting.clear();
      };
      const fadeOut = (node, position, travel) => {
        if (!(position.height > 0)) return;
        const clone = node.cloneNode(true);
        if (typeof clone?.animate !== 'function') return;
        for (const element of [clone, ...clone.querySelectorAll('*')]) {
          for (const attribute of Array.from(element.attributes)) {
            if (
              (attribute.name === 'id' && element.namespaceURI !== 'http://www.w3.org/2000/svg') ||
              attribute.name === 'data-session-id' ||
              attribute.name === 'data-drag-item-id' ||
              attribute.name === 'data-sidebar-row' ||
              attribute.name === 'data-sidebar-parent' ||
              attribute.name === 'data-testid' ||
              attribute.name === 'data-section-header' ||
              attribute.name === 'data-section-more'
            ) {
              element.removeAttribute(attribute.name);
            }
          }
        }
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-t3i-motion-ghost', 'true');
        clone.inert = true;
        Object.assign(clone.style, {
          position: 'absolute',
          top: `${position.top + remainingOffset(node)}px`,
          left: `${position.left}px`,
          width: `${position.width}px`,
          height: `${position.height}px`,
          margin: '0',
          boxSizing: 'border-box',
          contentVisibility: 'visible',
          transform: 'none',
          transition: 'none',
          pointerEvents: 'none',
        });
        parent.append(clone);
        const entry = entering.get(node);
        const entryProgress = entry ? sidebarMotionProgress(entry.animation) : 1;
        const animation = clone.animate(
          [
            { opacity: entryProgress, transform: 'translateY(0px)' },
            { opacity: 0, transform: `translateY(${travel}px)` },
          ],
          SIDEBAR_MOTION_TIMING,
        );
        if (!animation) {
          clone.remove();
          return;
        }
        exiting.set(clone, animation);
        animation.addEventListener?.(
          'finish',
          () => {
            clone.remove();
            exiting.delete(clone);
          },
          { once: true },
        );
      };
      const cancel = (node) => {
        running.get(node)?.animation?.cancel?.();
        running.delete(node);
      };
      const suspend = () => {
        for (const node of [...running.keys()]) cancel(node);
        clearFades();
        positions = null;
        released = null;
      };
      const move = (node, offset) => {
        cancel(node);
        const entry = entering.get(node);
        if (entry) entry.travel = 0;
        if (offset === 0 && !entry) return;
        if (typeof node?.animate !== 'function') return;
        const animation = node.animate(
          [{ transform: `translateY(${offset}px)` }, { transform: 'translateY(0px)' }],
          SIDEBAR_MOTION_TIMING,
        );
        if (!animation) return;
        running.set(node, { animation, offset });
        animation.addEventListener?.(
          'finish',
          () => {
            if (running.get(node)?.animation === animation) running.delete(node);
          },
          { once: true },
        );
      };

      return {
        update(animate) {
          if (disposed || !parent) return;
          const next = new Map(
            Array.from(parent.children)
              .filter((node) => isElement(node) && !exiting.has(node))
              .map((node) => [
                node,
                {
                  top: node.offsetTop,
                  left: node.offsetLeft,
                  width: node.offsetWidth,
                  height: node.offsetHeight,
                },
              ]),
          );
          let fadeCount = 0;
          if (positions !== null) {
            for (const [node, position] of positions) {
              if (!next.has(node) && position.height > 0) fadeCount++;
            }
            for (const [node, position] of next) {
              if (!positions.has(node) && position.height > 0) fadeCount++;
            }
          }
          const shouldAnimate =
            Boolean(animate) &&
            positions !== null &&
            !reducedMotion?.matches &&
            fadeCount <= SIDEBAR_MOTION_MAX_FADED_ROWS;
          const movedDelta = new Map();
          const nextOrder = [...next.keys()];
          const oldOrder = positions === null ? [] : [...positions.keys()];
          const ridingDelta = (order, index, retained) => {
            for (let cursor = index - 1; cursor >= 0; cursor--) {
              const node = order[cursor];
              const delta = movedDelta.get(node);
              if (delta !== undefined) return delta;
              if (retained(node)) return remainingOffset(node);
            }
            return undefined;
          };
          if (!shouldAnimate) clearFades();
          else {
            for (const [node, position] of next) {
              const previousTop = positions.get(node)?.top;
              if (previousTop === undefined || previousTop === position.top) continue;
              movedDelta.set(node, previousTop + remainingOffset(node) - position.top);
            }
            for (const [node, position] of positions) {
              if (next.has(node)) continue;
              const delta = ridingDelta(oldOrder, oldOrder.indexOf(node), (n) => next.has(n));
              fadeOut(node, position, delta === undefined ? sidebarMotionRowTravel(position.height) : -delta);
            }
          }
          for (const [node, entry] of [...entering.entries()]) {
            if (!next.has(node)) {
              entry.animation?.cancel?.();
              entering.delete(node);
            }
          }
          for (const node of [...running.keys()]) {
            if (!shouldAnimate || !next.has(node)) cancel(node);
          }
          if (shouldAnimate) {
            for (const [index, node] of nextOrder.entries()) {
              const position = next.get(node);
              const previousTop = positions.get(node)?.top;
              if (previousTop === undefined) {
                if (position.height > 0 && typeof node.animate === 'function') {
                  const delta = ridingDelta(nextOrder, index, (n) => positions.has(n));
                  const travel = delta === undefined ? -sidebarMotionRowTravel(position.height) : delta;
                  const animation = node.animate(
                    [
                      { opacity: 0, transform: `translateY(${travel}px)` },
                      { opacity: 1, transform: 'translateY(0px)' },
                    ],
                    SIDEBAR_MOTION_TIMING,
                  );
                  if (animation) {
                    entering.set(node, { animation, travel });
                    animation.addEventListener?.(
                      'finish',
                      () => {
                        if (entering.get(node)?.animation === animation) entering.delete(node);
                      },
                      { once: true },
                    );
                  }
                }
                continue;
              }
              const delta = movedDelta.get(node);
              if (delta !== undefined) move(node, delta);
            }
          }
          if (released !== null) {
            if (!reducedMotion?.matches) {
              for (const [node, position] of next) {
                const top = released.get(node);
                if (top !== undefined) {
                  const delta = top - position.top;
                  if (Math.abs(delta) >= 0.5) move(node, delta);
                }
              }
            }
            released = null;
          }
          positions = next;
        },
        release() {
          suspend();
          if (!parent) return;
          const origin = parent.getBoundingClientRect?.().top ?? 0;
          released = new Map(
            Array.from(parent.children)
              .filter((node) => isElement(node) && !exiting.has(node))
              .map((node) => [node, (node.getBoundingClientRect?.().top ?? origin) - origin]),
          );
        },
        suspend,
        dispose() {
          suspend();
          disposed = true;
        },
      };
    }

    const TOOLTIP_OPEN_DELAY_MS = 150;
    const TOOLTIP_WARM_WINDOW_MS = 400;
    const TOOLTIP_COLLISION_PADDING = 5;
    const TOOLTIP_SIDE_OFFSET = 4;
    let sharedTooltipLastClosedAt = 0;
    let activeTooltipEntry = null;
    let nextTooltipEntryId = 1;
    function isTooltipWarm(now = Date.now()) {
      return sharedTooltipLastClosedAt > 0 && (now - sharedTooltipLastClosedAt) < TOOLTIP_WARM_WINDOW_MS;
    }
    function claimTooltip(entry) {
      const prev = activeTooltipEntry;
      let preemptedOpen = false;
      if (prev && prev.id !== entry.id) {
        preemptedOpen = Boolean(prev.isOpen?.());
        if (preemptedOpen) sharedTooltipLastClosedAt = Date.now();
        prev.dismiss?.({ preempted: true });
      }
      activeTooltipEntry = entry;
      return { preemptedOpen };
    }
    function releaseTooltip(id, { wasOpen = false, recordWarm = true, force = false } = {}) {
      if (force) sharedTooltipLastClosedAt = 0;
      else if (wasOpen && recordWarm) sharedTooltipLastClosedAt = Date.now();
      if (activeTooltipEntry?.id === id) activeTooltipEntry = null;
    }
    function dismissActiveTooltip(opts = {}) {
      const entry = activeTooltipEntry;
      if (!entry) {
        if (opts.force) sharedTooltipLastClosedAt = 0;
        return;
      }
      if (opts.fromScroll && entry.isKeyboardFocused?.()) return;
      if (opts.force) sharedTooltipLastClosedAt = 0;
      entry.dismiss?.(opts);
    }
    function resetTooltipCoordinator() {
      sharedTooltipLastClosedAt = 0;
      const entry = activeTooltipEntry;
      activeTooltipEntry = null;
      entry?.dismiss?.({ force: true });
    }
    function closestTooltipTrigger(node) {
      const el = node?.nodeType === 1 ? node : node?.parentElement;
      return el?.closest?.('[data-t3i-tooltip-trigger="true"]') ?? null;
    }
    function internalSetRef(ref, value) {
      if (!ref) return;
      if (typeof ref === 'function') ref(value);
      else if (typeof ref === 'object') ref.current = value;
    }
    function mergeHandlers(first, second) {
      if (!first) return second;
      if (!second) return first;
      return (event) => { first(event); second(event); };
    }
    function computeTooltipPosition(anchorRect, tipRect, preferredSide = 'top', sideOffset = TOOLTIP_SIDE_OFFSET, pad = TOOLTIP_COLLISION_PADDING) {
      const vw = typeof window !== 'undefined' && Number.isFinite(window.innerWidth) && window.innerWidth > 0 ? window.innerWidth : 1280;
      const vh = typeof window !== 'undefined' && Number.isFinite(window.innerHeight) && window.innerHeight > 0 ? window.innerHeight : 820;
      const width = tipRect?.width ?? 0;
      const height = tipRect?.height ?? 0;
      const center = (anchorRect?.left ?? 0) + ((anchorRect?.width ?? 0) / 2);
      const maxLeft = Math.max(pad, vw - pad - width);
      const left = Math.round(Math.max(pad, Math.min(center - (width / 2), maxLeft)));
      const spaceAbove = (anchorRect?.top ?? 0) - sideOffset - pad;
      const spaceBelow = vh - (anchorRect?.bottom ?? 0) - sideOffset - pad;
      let side = preferredSide === 'bottom' ? 'bottom' : 'top';
      if (side === 'top' && height > spaceAbove && spaceBelow > spaceAbove) side = 'bottom';
      else if (side === 'bottom' && height > spaceBelow && spaceAbove > spaceBelow) side = 'top';
      const rawTop = side === 'top' ? ((anchorRect?.top ?? 0) - sideOffset - height) : ((anchorRect?.bottom ?? 0) + sideOffset);
      const maxTop = Math.max(pad, vh - pad - height);
      const top = Math.round(Math.max(pad, Math.min(rawTop, maxTop)));
      return { left, top, side };
    }
    function useThreadPreview(rowRef, sessionId) {
      const [preview,setPreview] = React.useState(null);
      const previewRef = React.useRef(null);
      const previewTimer = React.useRef(0);
      const previewForced = React.useRef(false);
      const previewOpenRef = React.useRef(false);
      const entryIdRef = React.useRef(null);
      if (entryIdRef.current === null) entryIdRef.current = nextTooltipEntryId++;
      previewOpenRef.current = Boolean(preview);
      const hidePreview = React.useCallback((opts = {}) => {
        if (previewForced.current && !opts.force && !opts.fromPointer) return;
        const wasOpen = previewOpenRef.current;
        if (!opts.preempted) {
          releaseTooltip(entryIdRef.current, {
            wasOpen,
            recordWarm: Boolean(opts.fromPointer),
            force: Boolean(opts.force),
          });
        }
        previewOpenRef.current = false;
        previewForced.current = false;
        clearTimeout(previewTimer.current);
        previewTimer.current = 0;
        setPreview(null);
      },[]);
      React.useEffect(() => () => {
        clearTimeout(previewTimer.current);
        releaseTooltip(entryIdRef.current, { wasOpen: previewOpenRef.current, recordWarm: false });
      },[]);
      const placePreview = React.useCallback((immediate = false) => {
        clearTimeout(previewTimer.current);
        const run = () => {
          if (!immediate && (document.body.hasAttribute('data-t3i-dragging') || document.body.hasAttribute('data-t3i-sweeping'))) return;
          const rect = rowRef.current?.getBoundingClientRect();
          if (!rect) return;
          const width = 320;
          let left = rect.right + 4;
          let side = 'right';
          if (left + width > window.innerWidth - 8) {
            left = Math.max(8, rect.left - width - 4);
            side = 'left';
          }
          const top = Math.max(8, Math.min(rect.top, window.innerHeight - 160));
          previewOpenRef.current = true;
          setPreview({ left, top, side, instant: immediate });
        };
        if (immediate) run();
        else previewTimer.current = setTimeout(run, TOOLTIP_OPEN_DELAY_MS);
      },[rowRef]);
      React.useLayoutEffect(() => {
        if (!preview || !previewRef.current) return;
        const rowRect = rowRef.current?.getBoundingClientRect();
        const tipRect = previewRef.current.getBoundingClientRect();
        if (!rowRect || !tipRect?.height) return;
        const top = Math.max(8, Math.min(rowRect.top, window.innerHeight - tipRect.height - 8));
        if (Math.abs(top - preview.top) >= 1) setPreview((prev) => (prev ? { ...prev, top } : prev));
      },[preview, rowRef]);
      const showPreview = React.useCallback(() => {
        if (previewOpenRef.current) return;
        if (document.body.hasAttribute('data-t3i-dragging') || document.body.hasAttribute('data-t3i-sweeping')) return;
        const { preemptedOpen } = claimTooltip({
          id: entryIdRef.current,
          isOpen: () => previewOpenRef.current,
          isKeyboardFocused: () => false,
          dismiss: (opts) => hidePreview(opts),
        });
        const warm = preemptedOpen || isTooltipWarm();
        placePreview(warm);
      },[placePreview, hidePreview]);
      React.useEffect(() => {
        const onForce = (event) => {
          const detail = event.detail || {};
          if (detail.clear) {
            if (detail.fromScroll && previewForced.current) return;
            hidePreview({ force:true });
            return;
          }
          if (detail.sessionId && detail.sessionId !== sessionId) return;
          claimTooltip({
            id: entryIdRef.current,
            isOpen: () => previewOpenRef.current,
            isKeyboardFocused: () => false,
            dismiss: (opts) => hidePreview(opts),
          });
          previewForced.current = true;
          placePreview(true);
        };
        window.addEventListener('t3i-force-preview', onForce);
        return () => window.removeEventListener('t3i-force-preview', onForce);
      },[sessionId, placePreview, hidePreview]);
      return { preview, previewRef, showPreview, hidePreview };
    }
    function ThreadHoverPreview({ card, preview, previewRef = null, ws, t }) {
      if (!preview) return null;
      const isSnoozed = isCardSnoozed(card);
      const isWorking = !card.needsYou && !isSnoozed && isCardActivelyWorking(card);
      const reason = card.result?.reason?.kind;
      const limited = !isWorking && reason === 'max-tokens';
      const failed = !isWorking && (reason === 'error' || reason === 'blocked');
      const activeTreeError = isWorking ? null : card.treeError;
      const model = card.modelId?.split('/').filter(Boolean).pop();
      const node = h('div',{ref:previewRef,className:'t3i-preview','data-side':preview.side ?? 'right','data-instant':preview.instant ? 'true' : undefined,style:{left:preview.left,top:preview.top},role:'tooltip'},
        h('div',{className:'t3i-preview-title'},card.title),
        h('div',{className:'t3i-preview-row'},h(Monogram,{card}),h('span',{className:'t3i-preview-text'},ws.name)),
        card.branch ? h('div',{className:'t3i-preview-row'},h(Icon,{name:card.worktree ? 'folderGit2' : 'branch',size:12}),h('span',{className:'t3i-preview-text'},h(MiddleTruncate,{value:card.branch,title:false}))) : null,
        model ? h('div',{className:'t3i-preview-row'},h('span',{className:'t3i-preview-text'},model)) : null,
        limited ? h('div',{className:'t3i-preview-row t3i-preview-warning'},h(Icon,{name:'alert',size:12}),h('span',{className:'t3i-preview-text'},t('usageLimitReached'))) :
        (failed || activeTreeError) ? h('div',{className:'t3i-preview-row t3i-preview-error'},h(Icon,{name:'alert',size:12}),h('span',{className:'t3i-preview-text'},activeTreeError || t('errorOccurred'))) : null);
      if (typeof document !== 'undefined' && document.body) {
        return require('react-dom').createPortal(node, document.body);
      }
      return node;
    }
    function useActionTooltip({ content, subcontent = null, side = 'top', suppressed = false, anchorRef = null }) {
      const hasContent = Boolean(content || subcontent);
      const [tip,setTip] = React.useState(null);
      const internalRef = React.useRef(null);
      const tipRef = React.useRef(null);
      const timerRef = React.useRef(0);
      const entryIdRef = React.useRef(null);
      if (entryIdRef.current === null) entryIdRef.current = nextTooltipEntryId++;
      const tipOpenRef = React.useRef(false);
      const focusOpenRef = React.useRef(false);
      const lastPointerDownRef = React.useRef(0);
      tipOpenRef.current = Boolean(tip);
      const setTriggerRef = React.useCallback((node) => {
        internalSetRef(internalRef, node);
        internalSetRef(anchorRef, node);
      },[anchorRef]);
      const isKeyboardFocused = React.useCallback(() => {
        if (!focusOpenRef.current) return false;
        const el = internalRef.current;
        const active = typeof document !== 'undefined' ? document.activeElement : null;
        if (!el || !active || (active !== el && !el.contains(active))) return false;
        try { return active.matches(':focus-visible'); } catch { return true; }
      },[]);
      const closeTip = React.useCallback((opts = {}) => {
        clearTimeout(timerRef.current);
        timerRef.current = 0;
        const wasOpen = tipOpenRef.current;
        tipOpenRef.current = false;
        focusOpenRef.current = false;
        setTip(null);
        if (!opts.preempted) {
          releaseTooltip(entryIdRef.current, {
            wasOpen,
            recordWarm: Boolean(opts.fromPointer),
            force: Boolean(opts.force),
          });
        }
      },[]);
      const openTip = React.useCallback(({ viaFocus = false } = {}) => {
        if (!hasContent || suppressed) return;
        if (!viaFocus && typeof document !== 'undefined' && (document.body?.hasAttribute('data-t3i-dragging') || document.body?.hasAttribute('data-t3i-sweeping'))) return;
        const { preemptedOpen } = claimTooltip({
          id: entryIdRef.current,
          isOpen: () => tipOpenRef.current,
          isKeyboardFocused,
          dismiss: (opts) => closeTip(opts),
        });
        clearTimeout(timerRef.current);
        const warm = !viaFocus && (preemptedOpen || isTooltipWarm());
        const instant = Boolean(viaFocus || warm);
        focusOpenRef.current = Boolean(viaFocus);
        const place = () => {
          if (suppressed || !internalRef.current) return;
          if (!viaFocus && typeof document !== 'undefined' && (document.body?.hasAttribute('data-t3i-dragging') || document.body?.hasAttribute('data-t3i-sweeping'))) return;
          const anchorRect = internalRef.current.getBoundingClientRect?.() ?? { left:0, right:0, top:0, bottom:0, width:0, height:0 };
          const pos = computeTooltipPosition(anchorRect, { width:0, height:24 }, side);
          tipOpenRef.current = true;
          setTip({ ...pos, instant, measured:false });
        };
        if (instant) place();
        else timerRef.current = setTimeout(place, TOOLTIP_OPEN_DELAY_MS);
      },[hasContent, suppressed, side, isKeyboardFocused, closeTip]);
      React.useEffect(() => {
        if ((suppressed || !hasContent) && (tipOpenRef.current || timerRef.current)) closeTip({ force: true });
      },[suppressed, hasContent, closeTip]);
      React.useEffect(() => () => {
        clearTimeout(timerRef.current);
        releaseTooltip(entryIdRef.current, { wasOpen: tipOpenRef.current, recordWarm: false });
      },[]);
      React.useEffect(() => {
        if (!tip) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') closeTip({ force: true });
        };
        window.addEventListener('keydown', onKeyDown, true);
        return () => window.removeEventListener('keydown', onKeyDown, true);
      },[Boolean(tip), closeTip]);
      React.useLayoutEffect(() => {
        if (!tip || !tipRef.current || !internalRef.current) return;
        const tipRect = tipRef.current.getBoundingClientRect?.();
        if (!tipRect || (tipRect.width === 0 && tipRect.height === 0)) return;
        const anchorRect = internalRef.current.getBoundingClientRect?.();
        if (!anchorRect) return;
        const pos = computeTooltipPosition(anchorRect, tipRect, side);
        if (!tip.measured || Math.abs(pos.left - tip.left) >= 1 || Math.abs(pos.top - tip.top) >= 1 || pos.side !== tip.side) {
          setTip((prev) => (prev ? { ...prev, ...pos, measured:true } : prev));
        }
      },[tip, side, content, subcontent]);
      const triggerProps = {
        'data-t3i-tooltip-trigger': hasContent ? 'true' : undefined,
        onMouseEnter: hasContent && !suppressed ? () => openTip({ viaFocus:false }) : undefined,
        onMouseLeave: hasContent ? () => closeTip({ fromPointer:true }) : undefined,
        onFocus: hasContent && !suppressed ? (event) => {
          if ((Date.now() - lastPointerDownRef.current) < 250) return;
          const target = event?.target;
          try { if (!target?.matches?.(':focus-visible')) return; } catch {}
          openTip({ viaFocus:true });
        } : undefined,
        onBlur: hasContent ? () => closeTip({ force:false }) : undefined,
        onPointerDown: hasContent ? () => {
          lastPointerDownRef.current = Date.now();
          closeTip({ force:true });
        } : undefined,
        onClick: hasContent ? () => closeTip({ force:true }) : undefined,
      };
      return { tip, tipRef, setTriggerRef, triggerProps };
    }
    function ActionTooltipPopup({ tip, tipRef, content, subcontent = null }) {
      if (!tip || (!content && !subcontent)) return null;
      const node = h('div',{
        ref:tipRef,
        className:'t3i-tooltip',
        role:'tooltip',
        'data-side':tip.side ?? 'top',
        'data-instant':tip.instant ? 'true' : undefined,
        style:{ left:tip.left, top:tip.top },
      },
        content ? h('span',null,content) : null,
        subcontent ? h('span',{className:'t3i-tooltip-sub'},subcontent) : null);
      if (typeof document !== 'undefined' && document.body) {
        return require('react-dom').createPortal(node, document.body);
      }
      return node;
    }
    function TooltipButton({ tooltip, tooltipSub = null, tooltipSide = 'top', tooltipSuppressed = false, buttonRef = null, onMouseEnter, onMouseLeave, onFocus, onBlur, onPointerDown, onClick, children, ...rest }) {
      const { tip, tipRef, setTriggerRef, triggerProps } = useActionTooltip({
        content: tooltip,
        subcontent: tooltipSub,
        side: tooltipSide,
        suppressed: tooltipSuppressed,
        anchorRef: buttonRef,
      });
      return h(React.Fragment,null,
        h('button',{
          ...rest,
          ref:setTriggerRef,
          'data-t3i-tooltip-trigger':triggerProps['data-t3i-tooltip-trigger'],
          onMouseEnter:mergeHandlers(triggerProps.onMouseEnter, onMouseEnter),
          onMouseLeave:mergeHandlers(triggerProps.onMouseLeave, onMouseLeave),
          onFocus:mergeHandlers(triggerProps.onFocus, onFocus),
          onBlur:mergeHandlers(triggerProps.onBlur, onBlur),
          onPointerDown:mergeHandlers(triggerProps.onPointerDown, onPointerDown),
          onClick:mergeHandlers(triggerProps.onClick, onClick),
        },children),
        h(ActionTooltipPopup,{tip,tipRef,content:tooltip,subcontent:tooltipSub}));
    }
    function SearchResultRow({ card, query, ranges = null, snippet = null, snippetRanges = null, optionId = undefined, active, routeActive = false, runtime, onHover, t }) {
      const nowMinute = useNowMinute();
      const rowRef = React.useRef(null);
      const { preview, previewRef, showPreview, hidePreview } = useThreadPreview(rowRef, card.sessionId);
      const time = relativeTime(cardActivityAt(card), nowMinute * 60000, runtime.locale(), t);
      const settled = card.section === 'settled';
      const ws = workspaceInfo(card);
      return h(React.Fragment,null,
        h('button',{ref:rowRef,id:optionId,type:'button',role:'option',className:'t3i-search-row','data-session-id':card.sessionId,'data-active':active ? 'true' : undefined,'data-settled':settled ? 'true' : undefined,'aria-selected':active,'aria-current':routeActive ? 'page' : undefined,onMouseMove:onHover,onMouseEnter:showPreview,onMouseLeave:() => hidePreview({ fromPointer:true }),onClick:() => { hidePreview({ force:true }); runtime.changeView({search:''}); runtime.openCard(card); }},
          h(Monogram,{card}),
          h('div',{className:'t3i-search-row-text'},
            h('div',{className:'t3i-search-row-head'},
              h('span',{className:'t3i-search-title'}, highlightText(card.title, query, ranges)),
              time ? h('span',{className:'t3i-search-time','aria-hidden':true}, time) : null),
            snippet ? h('span',{className:'t3i-search-excerpt'}, highlightText(snippet, query, snippetRanges)) : null)),
        h(ThreadHoverPreview,{card,preview,previewRef,ws,t}));
    }
    function cardActivityAt(card) {
      return typeof sharedActivityTimestamp === 'function' ? sharedActivityTimestamp(card) : localActivityTimestamp(card);
    }
    function cardSettledAt(card) {
      return typeof sharedSettledTimestamp === 'function' ? sharedSettledTimestamp(card) : localSettledTimestamp(card);
    }
    const sharedResolveDropVerb = (() => {
      try { return require('dsh-t3-inbox/model').resolveDropVerb; } catch { return null; }
    })();
    function resolveDropVerb(from, to) {
      if (typeof sharedResolveDropVerb === 'function') return sharedResolveDropVerb(from, to);
      if (!to || to === from || to === 'working' || to === 'snoozed' || from === 'working') return null;
      if (to === 'pinned') return 'pin';
      if (to === 'settled') return 'settle';
      if (from === 'pinned') return 'unpin';
      if (from === 'settled') return 'unsettle';
      if (from === 'snoozed' && to === 'active') return 'wake';
      return null;
    }
    const dropVerbLabel = { pin:'dropPin', unpin:'dropUnpin', settle:'dropSettle', unsettle:'dropUnsettle', wake:'dropWake' };
    const dropVerbIcon = { pin:'pin', unpin:'pinOff', settle:'checkcircle', unsettle:'restore', wake:'alarmOff' };
    const SIDEBAR_MARKER_PREFIX = 'sidebar-marker-';
    function sidebarMarkerId(marker) { return `${SIDEBAR_MARKER_PREFIX}${marker}`; }
    function sidebarListItemId(item) { return item?.kind === 'thread' ? item.key : sidebarMarkerId(item?.marker); }
    const sharedResolveSidebarDropTarget = (() => {
      try { return require('dsh-t3-inbox/model').resolveSidebarDropTarget; } catch { return null; }
    })();
    const sharedProjectSidebarDrag = (() => {
      try { return require('dsh-t3-inbox/model').projectSidebarDrag; } catch { return null; }
    })();
    function localSectionAtSidebarSlot(items, index) {
      let section = 'pinned';
      for (let i = 0; i < index && i < items.length; i += 1) {
        const item = items[i];
        if (item.kind !== 'marker') continue;
        if (item.marker === 'pinned-divider') section = 'active';
        else if (item.marker === 'working-header') section = 'working';
        else if (item.marker === 'snoozed-header') section = 'snoozed';
        else if (item.marker === 'settled-header') section = 'settled';
      }
      return section;
    }
    function resolveSidebarDropTarget(items, activeKey, overId) {
      if (typeof sharedResolveSidebarDropTarget === 'function') return sharedResolveSidebarDropTarget(items, activeKey, overId);
      const activeIndex = items.findIndex((item) => sidebarListItemId(item) === activeKey);
      const overIndex = items.findIndex((item) => sidebarListItemId(item) === overId);
      if (activeIndex === -1 || overIndex === -1 || items[activeIndex]?.kind !== 'thread') return null;
      const moved = items.filter((_, index) => index !== activeIndex);
      moved.splice(overIndex, 0, items[activeIndex]);
      const section = localSectionAtSidebarSlot(moved, overIndex);
      if (section === 'working' || section === 'snoozed') return null;
      const pinnedOrder = [], activeOrder = [];
      let currentSection = 'pinned';
      for (const item of moved) {
        if (item.kind === 'marker') {
          if (item.marker === 'pinned-divider') currentSection = 'active';
          else if (item.marker === 'working-header' || item.marker === 'snoozed-header' || item.marker === 'settled-header') break;
        } else if (currentSection === 'pinned') pinnedOrder.push(item.key);
        else activeOrder.push(item.key);
      }
      return { section, pinnedOrder, activeOrder };
    }
    function projectSidebarDrag(input) {
      if (typeof sharedProjectSidebarDrag === 'function') return sharedProjectSidebarDrag(input);
      const { items = [], rects = [], activeKey, overId, settledOrder = [], activeOrder = null, settledExpanded = false, settledVisibleCount = 10, routeThreadKey = null, snoozedThreadCount = 0, cardHeight: inputCardHeight, slimHeight: inputSlimHeight, boundaryLabelHeight = 24, containerHeight = null, footerHeight = 0 } = input ?? {};
      const activeIndex = items.findIndex((item) => sidebarListItemId(item) === activeKey);
      if (activeIndex === -1 || !rects[0]) return { transforms:new Map(), target:null, projected:[] };
      const active = items[activeIndex];
      const overIndexRaw = items.findIndex((item) => sidebarListItemId(item) === overId);
      const over = (overIndexRaw >= 0 ? items[overIndexRaw] : active) ?? active;
      const target = resolveSidebarDropTarget(items, active.key, sidebarListItemId(over));
      if (!target) return { transforms:new Map(), target:null, projected:[] };
      const indices = new Map(items.map((item, idx) => [sidebarListItemId(item), idx]));
      const groups = { pinned:[], active:[], working:[], snoozed:[], settled:[] };
      let cardHeight = inputCardHeight, slimHeight = inputSlimHeight;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'marker') continue;
        if (item.section === 'pinned' || item.section === 'active' || item.section === 'working') { if (cardHeight === undefined && rects[i]?.height) cardHeight = rects[i].height; }
        else if (slimHeight === undefined && rects[i]?.height) slimHeight = rects[i].height;
        if (item.key !== active.key) groups[item.section].push(item);
      }
      cardHeight = cardHeight ?? 64; slimHeight = slimHeight ?? 36;
      const targetGroup = groups[target.section];
      const order = target.section === 'pinned' ? target.pinnedOrder : target.section === 'settled' ? settledOrder : (activeOrder ?? target.activeOrder);
      const ranks = new Map(order.map((key, idx) => [key, idx]));
      const rank = ranks.get(active.key) ?? Infinity;
      const insertAt = targetGroup.findIndex((item) => (ranks.get(item.key) ?? Infinity) > rank);
      targetGroup.splice(insertAt < 0 ? targetGroup.length : insertAt, 0, { ...active, section:target.section });
      const nextSettled = (settledOrder.length > 0 ? settledOrder : groups.settled.map((item) => item.key)).filter((key) => key !== active.key || target.section === 'settled');
      if (target.section === 'settled' && !nextSettled.includes(active.key)) nextSettled.unshift(active.key);
      const visibleSettled = settledExpanded ? nextSettled.slice(0, settledVisibleCount) : [];
      if (routeThreadKey && nextSettled.includes(routeThreadKey) && !visibleSettled.includes(routeThreadKey)) visibleSettled.push(routeThreadKey);
      groups.settled = visibleSettled.map((key) => ({ kind:'thread', key, section:'settled' }));
      const projected = [];
      const marker = (name) => projected.push({ kind:'marker', marker:name });
      marker('pinned-header'); projected.push(...groups.pinned); marker('pinned-divider');
      if (groups.active.length > 0) projected.push(...groups.active); else marker('active-placeholder');
      if (items.some((item) => item.kind === 'marker' && item.marker === 'working-header')) { marker('working-header'); projected.push(...groups.working); }
      if (groups.snoozed.length > 0 || ((active.section !== 'snoozed' || snoozedThreadCount > 1) && items.some((item) => item.kind === 'marker' && item.marker === 'snoozed-header'))) { marker('snoozed-header'); projected.push(...groups.snoozed); }
      marker('settled-header');
      if (groups.settled.length > 0) projected.push(...groups.settled); else marker('settled-placeholder');
      const heights = projected.map((item) => {
        const idx = indices.get(sidebarListItemId(item));
        const rect = idx === undefined ? undefined : rects[idx];
        const fallback = item.kind === 'thread' && (item.section === 'pinned' || item.section === 'active' || item.section === 'working') ? cardHeight : slimHeight;
        if (item.kind === 'marker' && (item.marker === 'pinned-header' || item.marker === 'pinned-divider')) return boundaryLabelHeight;
        if (item.kind === 'marker' && item.marker.endsWith('-placeholder')) return slimHeight;
        if (item.kind === 'thread' && item.key === active.key) return fallback;
        return rect?.height ?? fallback;
      });
      const isShelf = (item) => item?.kind === 'marker' && (item.marker === 'working-header' || item.marker === 'snoozed-header' || item.marker === 'settled-header');
      const firstShelfIndex = items.findIndex(isShelf);
      const shelfRect = firstShelfIndex >= 0 ? rects[firstShelfIndex] : undefined;
      const beforeShelf = firstShelfIndex > 0 ? rects[firstShelfIndex - 1] : undefined;
      const lastRect = rects.at(-1);
      const contentSpan = lastRect ? lastRect.bottom - rects[0].top : 0;
      const availableSpan = Math.max(contentSpan, containerHeight ?? 0);
      const totalProjected = heights.reduce((sum, h) => sum + h, 0) + footerHeight;
      let shelfSpace = (shelfRect && (!beforeShelf || shelfRect.top > beforeShelf.bottom + 1 || availableSpan > totalProjected)) ? Math.max(0, availableSpan - totalProjected) : 0;
      const transforms = new Map();
      for (const item of items) transforms.set(sidebarListItemId(item), { y:0, hidden:true });
      let top = rects[0].top;
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        if (isShelf(item)) { top += shelfSpace; shelfSpace = 0; }
        const id = sidebarListItemId(item);
        const idx = indices.get(id);
        const rect = idx === undefined ? undefined : rects[idx];
        if (idx !== undefined && rect) transforms.set(id, { y:Math.round(top - rect.top), hidden:false });
        top += heights[i];
      }
      transforms.set(sidebarListItemId(active), { y:0, hidden:false });
      return { transforms, target, projected, contentBottom:top };
    }
    /** Compact sidebar time — T3 floor buckets (`now`/`刚刚`, `{count}m`/`{count} 分钟`, `{count}h`/`{count} 小时`, `{count}d`/`{count} 天`). */
    function relativeTime(time, nowMs = Date.now(), locale = 'en', t = null) {
      if (typeof t !== 'function' && typeof sharedFormatSidebarRelativeTime === 'function') {
        return sharedFormatSidebarRelativeTime(time, nowMs, locale);
      }
      if (time == null || time === '') return '';
      const then = typeof time === 'number' ? time : Date.parse(time);
      if (!Number.isFinite(then)) return '';
      const seconds = Math.floor(Math.max(0, nowMs - then) / 1000);
      if (seconds < 60) return resolveLocalized(t, locale, 'timeNow');
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return resolveLocalized(t, locale, 'timeMinutes', { count: minutes });
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return resolveLocalized(t, locale, 'timeHours', { count: hours });
      return resolveLocalized(t, locale, 'timeDays', { count: Math.floor(hours / 24) });
    }
    const PINNED_ORDER_KEY = 'dsh-t3-inbox:pinned-order';
    function readPinnedOrder() {
      try { const raw = JSON.parse(localStorage.getItem(PINNED_ORDER_KEY) || 'null'); return Array.isArray(raw) ? raw.filter((id) => typeof id === 'string') : null; } catch { return null; }
    }
    function savePinnedOrder(ids) {
      const clean = [];
      const seen = new Set();
      for (const id of ids ?? []) {
        if (typeof id === 'string' && id && !seen.has(id)) { seen.add(id); clean.push(id); }
      }
      try {
        localStorage.removeItem('dsh-t3-inbox:order');
        if (clean.length > 0) localStorage.setItem(PINNED_ORDER_KEY, JSON.stringify(clean));
        else localStorage.removeItem(PINNED_ORDER_KEY);
        return true;
      } catch { return false; }
    }
    function removePinnedOrderId(sessionId) {
      if (!sessionId) return false;
      const existing = readPinnedOrder();
      if (!existing || !existing.includes(sessionId)) return false;
      return savePinnedOrder(existing.filter((id) => id !== sessionId));
    }
    function sorted(cards, section, workingShelfEnabled = true) {
      const list = cards.filter((card) => {
        if (section === 'pinned') return Boolean(card.pinned);
        if (card.pinned) return false;
        if (section === 'working') return workingShelfEnabled ? card.section === 'working' : false;
        if (section === 'active') return card.section === 'active' || (!workingShelfEnabled && card.section === 'working');
        return card.section === section;
      });
      if (section === 'pinned') return sortPinnedCards(list, readPinnedOrder());
      if (section === 'active') return sortInboxCardsByReturn(list);
      if (section === 'working') return sortWorkingCardsBySend(list);
      if (section === 'snoozed') return sortSnoozedCards(list);
      if (section === 'settled') return sortSettledCards(list);
      return list;
    }
    function resolveDraggedOrders(bySection, activeKey, occurredAt, cardsById) {
      const others = (list) => (list ?? []).filter((item) => item.sessionId !== activeKey);
      const card = cardsById?.get?.(activeKey);
      if (!card) {
        return {
          settledOrder: (bySection?.settled ?? []).map((item) => item.sessionId),
          activeOrder: (bySection?.active ?? []).map((item) => item.sessionId),
        };
      }
      const settledCandidate = {
        ...card, section:'settled', pinned:false, snoozed:false,
        settledAt:card.section === 'settled' ? (card.settledAt ?? occurredAt) : occurredAt,
        unsettledAt:null,
      };
      const activeCandidate = {
        ...card, section:'active', pinned:false, snoozed:false,
        settledAt:null,
        unsettledAt:card.section === 'settled' ? occurredAt : card.unsettledAt,
      };
      return {
        settledOrder: sortSettledCards([...others(bySection?.settled), settledCandidate]).map((item) => item.sessionId),
        activeOrder: sortInboxCardsByReturn([...others(bySection?.active), activeCandidate]).map((item) => item.sessionId),
      };
    }
    function allowedDropVerb(card, verb, pending) {
      if (!verb) return true;
      if (!card || pending) return false;
      if (verb === 'pin') return !card.archived;
      if (verb === 'unpin') return Boolean(card.pinned);
      if (verb === 'settle') return settleClickable({ ...card, pinned:false }, pending);
      if (verb === 'unsettle' || verb === 'wake') return !card.treeError;
      return false;
    }
    function computeSlotWithHysteresis(pointerY, zoneTop, height, count, prevSlot) {
      if (count <= 1) return 0;
      const safeH = height > 0 ? height : 64;
      const raw = Math.min(count - 1, Math.max(0, Math.floor((pointerY - zoneTop) / safeH)));
      if (prevSlot == null || prevSlot < 0 || prevSlot >= count || raw === prevSlot) return raw;
      if (raw > prevSlot) {
        const edge = zoneTop + (prevSlot + 1) * safeH;
        return pointerY >= edge + 6 ? raw : prevSlot;
      }
      const edge = zoneTop + prevSlot * safeH;
      return pointerY <= edge - 6 ? raw : prevSlot;
    }
    function resolveSidebarDragSelection({ items, rects, activeKey, originShelf, pointerY, prevZone, prevSlot, cardsById, pendingActions }) {
      if (!items.length || !rects.length) return { zone:originShelf, slot:prevSlot ?? null, overId:activeKey, disallowed:false };
      const cardH = rects.find((r, i) => items[i]?.kind === 'thread' && ['pinned','active','working'].includes(items[i].section) && r?.height > 0)?.height ?? 64;
      const boundaryH = 24;
      const baseTop = rects[0]?.top ?? 0;
      const pinnedItems = items.filter((item) => item.kind === 'thread' && item.section === 'pinned');
      const activeItems = items.filter((item) => item.kind === 'thread' && item.section === 'active');
      const pinnedDividerIdx = items.findIndex((item) => item.kind === 'marker' && item.marker === 'pinned-divider');
      const activePlaceholderIdx = items.findIndex((item) => item.kind === 'marker' && item.marker === 'active-placeholder');
      const workingIdx = items.findIndex((item) => item.kind === 'marker' && item.marker === 'working-header');
      const snoozedIdx = items.findIndex((item) => item.kind === 'marker' && item.marker === 'snoozed-header');
      const settledIdx = items.findIndex((item) => item.kind === 'marker' && item.marker === 'settled-header');
      const pinnedZoneTop = baseTop + boundaryH;
      const dividerTop = pinnedZoneTop + pinnedItems.length * cardH;
      const dividerMid = dividerTop + boundaryH / 2;
      const activeZoneTop = dividerTop + boundaryH;
      const workingTop = workingIdx >= 0 && rects[workingIdx]?.height > 0 ? rects[workingIdx].top : null;
      const snoozedTop = snoozedIdx >= 0 && rects[snoozedIdx]?.height > 0 ? rects[snoozedIdx].top : null;
      const settledTop = settledIdx >= 0 && rects[settledIdx]?.height > 0 ? rects[settledIdx].top : null;

      let zone;
      if (settledTop != null && pointerY >= (prevZone === 'settled' ? settledTop - 40 : settledTop - 12)) {
        zone = 'settled';
      } else if (snoozedTop != null && pointerY >= snoozedTop) {
        zone = 'snoozed';
      } else if (workingTop != null && pointerY >= workingTop) {
        zone = 'working';
      } else if (prevZone === 'pinned') {
        zone = pointerY <= dividerMid + 8 ? 'pinned' : 'active';
      } else {
        zone = pointerY < dividerMid - 8 ? 'pinned' : 'active';
      }

      const card = cardsById.get(activeKey);
      const pending = Boolean(pendingActions?.[activeKey]);
      const verbForZone = resolveDropVerb(originShelf, zone);
      if (zone !== originShelf && verbForZone && !allowedDropVerb(card, verbForZone, pending)) {
        return { zone, slot:null, overId:activeKey, disallowed:true };
      }
      if (zone === 'working' || zone === 'snoozed') return { zone, slot:null, overId:activeKey, disallowed:true };
      if (zone === 'settled') {
        return { zone, slot:null, overId:originShelf === 'settled' ? activeKey : sidebarMarkerId('settled-header'), disallowed:false };
      }

      const activeIndex = items.findIndex((item) => item.kind === 'thread' && item.key === activeKey);
      if (zone === 'pinned') {
        if (originShelf === 'pinned') {
          if (pinnedItems.length <= 1) return { zone, slot:0, overId:activeKey, disallowed:false };
          const origIdx = pinnedItems.findIndex((item) => item.key === activeKey);
          const others = pinnedItems.filter((item) => item.key !== activeKey);
          const slot = computeSlotWithHysteresis(pointerY, pinnedZoneTop, cardH, pinnedItems.length, prevZone === 'pinned' ? prevSlot : origIdx);
          const overId = slot === origIdx ? activeKey : slot < origIdx ? others[slot].key : others[slot - 1].key;
          return { zone, slot, overId, disallowed:false };
        }
        if (pinnedItems.length === 0) return { zone, slot:0, overId:sidebarMarkerId('pinned-header'), disallowed:false };
        const slot = Math.min(pinnedItems.length, Math.max(0, Math.round((pointerY - pinnedZoneTop - 0.5 * cardH) / cardH)));
        const overId = slot < pinnedItems.length ? pinnedItems[slot].key : sidebarMarkerId('pinned-divider');
        return { zone, slot, overId, disallowed:false };
      }

      if (originShelf === 'active') {
        if (activeItems.length <= 1) return { zone, slot:0, overId:activeKey, disallowed:false };
        const origIdx = activeItems.findIndex((item) => item.key === activeKey);
        const others = activeItems.filter((item) => item.key !== activeKey);
        const slot = computeSlotWithHysteresis(pointerY, activeZoneTop, cardH, activeItems.length, prevZone === 'active' ? prevSlot : origIdx);
        const overId = slot === origIdx ? activeKey : slot < origIdx ? others[slot].key : others[slot - 1].key;
        return { zone, slot, overId, disallowed:false };
      }
      if (activeItems.length === 0) {
        return { zone, slot:0, overId:activeIndex < pinnedDividerIdx ? sidebarMarkerId('pinned-divider') : sidebarMarkerId('active-placeholder'), disallowed:false };
      }
      const slot = Math.min(activeItems.length, Math.max(0, Math.round((pointerY - activeZoneTop - 0.5 * cardH) / cardH)));
      if (activeIndex < pinnedDividerIdx) {
        return { zone, slot, overId:slot === 0 ? sidebarMarkerId('pinned-divider') : activeItems[slot - 1].key, disallowed:false };
      }
      return { zone, slot, overId:slot < activeItems.length ? activeItems[slot].key : sidebarMarkerId('active-placeholder'), disallowed:false };
    }
    function buildDragItems(bySection, workingOpen, snoozedOpen, settledOpen, settledLimit, activeSessionId) {
      if (!bySection) return [];
      const list = [];
      list.push({ kind:'marker', marker:'pinned-header' });
      for (const card of bySection.pinned) list.push({ kind:'thread', key:card.sessionId, section:'pinned' });
      list.push({ kind:'marker', marker:'pinned-divider' });
      for (const card of bySection.active) list.push({ kind:'thread', key:card.sessionId, section:'active' });
      list.push({ kind:'marker', marker:'active-placeholder' });
      if (bySection.working.length > 0) {
        list.push({ kind:'marker', marker:'working-header' });
        for (const card of visibleShelfCards(bySection.working, 'working', workingOpen, activeSessionId, settledLimit)) {
          list.push({ kind:'thread', key:card.sessionId, section:'working' });
        }
      }
      if (bySection.snoozed.length > 0) {
        list.push({ kind:'marker', marker:'snoozed-header' });
        for (const card of visibleShelfCards(bySection.snoozed, 'snoozed', snoozedOpen, activeSessionId, settledLimit)) {
          list.push({ kind:'thread', key:card.sessionId, section:'snoozed' });
        }
      }
      list.push({ kind:'marker', marker:'settled-header' });
      list.push({ kind:'marker', marker:'settled-placeholder' });
      for (const card of visibleShelfCards(bySection.settled, 'settled', settledOpen, activeSessionId, settledLimit)) {
        list.push({ kind:'thread', key:card.sessionId, section:'settled' });
      }
      return list;
    }
    function shiftDragMetrics(metrics, scrollDelta) {
      if (!metrics || !scrollDelta) return metrics;
      return {
        ...metrics,
        rects:metrics.rects.map((rect) => ({ ...rect, top:rect.top - scrollDelta, bottom:rect.bottom - scrollDelta })),
        startRect:metrics.startRect ? { ...metrics.startRect, top:metrics.startRect.top - scrollDelta, bottom:metrics.startRect.bottom - scrollDelta } : metrics.startRect,
        showMoreTop:metrics.showMoreTop != null ? metrics.showMoreTop - scrollDelta : null,
      };
    }
    function measureDragMetrics(scrollEl, items, activeKey) {
      const byId = new Map();
      if (scrollEl?.querySelectorAll) {
        for (const node of scrollEl.querySelectorAll('[data-drag-item-id]')) {
          const id = node.getAttribute('data-drag-item-id');
          if (id && !byId.has(id)) byId.set(id, node);
        }
      }
      const emptyRect = { top:0, bottom:0, left:0, right:0, width:0, height:0 };
      const rects = items.map((item) => {
        const rect = byId.get(sidebarListItemId(item))?.getBoundingClientRect?.();
        return rect ? { top:rect.top, bottom:rect.bottom, left:rect.left, right:rect.right, width:rect.width, height:rect.height } : { ...emptyRect };
      });
      const scrollRect = scrollEl?.getBoundingClientRect?.() ?? emptyRect;
      const showMoreEl = scrollEl?.querySelector?.('.t3i-show-more') ?? null;
      const showMoreRect = showMoreEl?.getBoundingClientRect?.() ?? null;
      if (!byId.has(sidebarMarkerId('pinned-header')) && items[0]?.marker === 'pinned-header') {
        const firstThreadIdx = items.findIndex((item) => item.kind === 'thread');
        if (firstThreadIdx >= 0 && rects[firstThreadIdx]?.height > 0) {
          const synthTop = rects[firstThreadIdx].top - 24;
          rects[0] = { top:synthTop, bottom:synthTop, left:rects[firstThreadIdx].left, right:rects[firstThreadIdx].right, width:rects[firstThreadIdx].width, height:0 };
        }
      }
      const settledIdx = items.findIndex((item) => item.kind === 'marker' && item.marker === 'settled-header');
      if (settledIdx >= 0 && !(rects[settledIdx]?.height > 0) && scrollRect.bottom > scrollRect.top) {
        const synthTop = Math.max(scrollRect.top, scrollRect.bottom - 36);
        rects[settledIdx] = { top:synthTop, bottom:synthTop + 32, left:scrollRect.left, right:scrollRect.right, width:scrollRect.width, height:32 };
      }
      const activeIdx = items.findIndex((item) => item.kind === 'thread' && item.key === activeKey);
      const startRect = activeIdx >= 0 ? rects[activeIdx] : emptyRect;
      return {
        items,
        rects,
        startRect,
        scrollTop:scrollRect.top,
        scrollBottom:scrollRect.bottom,
        scrollLeft:scrollRect.left,
        scrollRight:scrollRect.right,
        scrollWidth:scrollRect.width,
        containerHeight:scrollRect.height > 0 ? Math.max(0, scrollRect.height - 8) : null,
        showMoreTop:showMoreRect?.top ?? null,
        footerHeight:showMoreRect?.height ?? 0,
      };
    }
    const sharedResolveAdjacentThreadId = (() => {
      try { return require('dsh-t3-inbox/model').resolveAdjacentThreadId; } catch { return null; }
    })();
    function resolveAdjacentThreadId(input) {
      if (typeof sharedResolveAdjacentThreadId === 'function') return sharedResolveAdjacentThreadId(input);
      const { threadIds, currentThreadId, direction } = input;
      if (!Array.isArray(threadIds) || threadIds.length === 0) return null;
      if (currentThreadId === null || currentThreadId === undefined) {
        return direction === 'previous' ? (threadIds.at(-1) ?? null) : (threadIds[0] ?? null);
      }
      const index = threadIds.indexOf(currentThreadId);
      if (index === -1) return null;
      if (direction === 'previous') return index > 0 ? (threadIds[index - 1] ?? null) : null;
      return index < threadIds.length - 1 ? (threadIds[index + 1] ?? null) : null;
    }
    const sharedResolveSidebarSweepKeys = (() => {
      try { return require('dsh-t3-inbox/model').resolveSidebarSweepKeys; } catch { return null; }
    })();
    function resolveSidebarSweepKeys(orderedKeys, originKey, targetKey, canApply = () => true) {
      if (typeof sharedResolveSidebarSweepKeys === 'function') return sharedResolveSidebarSweepKeys(orderedKeys, originKey, targetKey, canApply);
      if (!Array.isArray(orderedKeys)) return [];
      const origin = orderedKeys.indexOf(originKey);
      const target = orderedKeys.indexOf(targetKey);
      if (origin === -1 || target === -1) return [];
      return orderedKeys.slice(Math.min(origin, target), Math.max(origin, target) + 1).filter(canApply);
    }
    function hasCompletedTurn(card) {
      if (typeof sharedModel?.hasCompletedTurn === 'function') return sharedModel.hasCompletedTurn(card);
      if (!card || typeof card !== 'object') return false;
      if (card.result || card.progress?.latestResult) return true;
      return (card.members ?? []).some((member) => Boolean(member?.progress?.latestResult));
    }
    function canMarkUnreadCard(card, pending) {
      return Boolean(card && !pending && !card.archived && hasCompletedTurn(card));
    }
    function nextCandidate(cards, currentId, actionId, excludeIds = null, opts = {}) {
      if (typeof sharedModel?.nextCandidate === 'function') return sharedModel.nextCandidate(cards, currentId, actionId, excludeIds, { ...opts, pinnedOrderIds:readPinnedOrder() });
      const { workingOpen = true, workingShelfEnabled = true } = opts ?? {};
      const excluded = excludeIds instanceof Set ? excludeIds : (excludeIds ? new Set(excludeIds) : null);
      const workingCards = !workingShelfEnabled
        ? []
        : (workingOpen
          ? sorted(cards, 'working', true)
          : sorted(cards, 'working', true).filter((card) => card.sessionId === currentId));
      const list = [...sorted(cards, 'pinned', workingShelfEnabled), ...sorted(cards, 'active', workingShelfEnabled), ...workingCards].filter((card) => !card.archived && card.accessible !== false);
      if (!list.length) return null;
      const index = list.findIndex((card) => card.sessionId === currentId);
      for (let offset = 1; offset <= list.length; offset++) {
        const candidate = list[((index < 0 ? -1 : index) + offset) % list.length];
        if (
          candidate.sessionId !== currentId &&
          candidate.sessionId !== actionId &&
          !excluded?.has(candidate.sessionId) &&
          (candidate.pinned || (candidate.section !== 'settled' && candidate.section !== 'snoozed')) &&
          !(candidate.snoozed && !candidate.woke)
        ) return candidate;
      }
      return null;
    }
    function visibleShelfCards(cards, section, open, activeSessionId, settledLimit = SETTLED_INITIAL_COUNT) {
      if (!cards.length) return [];
      const isSettled = section === 'settled' || section === 'home-settled';
      const routeCard = activeSessionId ? cards.find((card) => card.sessionId === activeSessionId) : null;
      if (!open) return routeCard ? [routeCard] : [];
      if (!isSettled) return cards;
      const paged = cards.slice(0, settledLimit);
      return routeCard && !paged.some((card) => card.sessionId === routeCard.sessionId) ? [...paged, routeCard] : paged;
    }
    function visibleOrderedCards(cards, view, activeSessionId) {
      const query = (view.search || '').trim();
      const workingShelfEnabled = view.workingShelfEnabled !== false;
      const bySection = {
        pinned: sorted(cards,'pinned', workingShelfEnabled),
        active: sorted(cards,'active', workingShelfEnabled),
        working: sorted(cards,'working', workingShelfEnabled),
        snoozed: sorted(cards,'snoozed', workingShelfEnabled),
        settled: sorted(cards,'settled', workingShelfEnabled),
      };
      if (query) {
        const searchable = [
          ...bySection.pinned,
          ...bySection.active,
          ...bySection.working,
          ...bySection.snoozed,
          ...bySection.settled,
        ];
        const searchHits = searchSidebarCards(searchable, view.search);
        return { query, orderedIds: searchHits.map((hit) => hit.card.sessionId), searchHits, bySection: null };
      }
      const limit = Number.isFinite(view.settledLimit) ? view.settledLimit : SETTLED_INITIAL_COUNT;
      const orderedIds = [
        ...bySection.pinned,
        ...bySection.active,
        ...visibleShelfCards(bySection.working, 'working', view.workingOpen, activeSessionId, limit),
        ...visibleShelfCards(bySection.snoozed, 'snoozed', view.snoozedOpen, activeSessionId, limit),
        ...visibleShelfCards(bySection.settled, 'settled', view.settledOpen, activeSessionId, limit),
      ].map((card) => card.sessionId);
      return { query: '', orderedIds, searchHits: null, bySection };
    }
    function sidebarThreadKeyAtY(listEl, y) {
      if (!listEl) return null;
      const rect = listEl.getBoundingClientRect();
      const visibleY = rect && rect.height > 0 ? Math.min(Math.max(y, rect.top), rect.bottom - 1) : y;
      let key = null;
      for (const row of listEl.querySelectorAll('.t3i-item[data-session-id]')) {
        if (key !== null && row.getBoundingClientRect().top > visibleY) break;
        key = row.getAttribute('data-session-id');
      }
      return key;
    }
    const MODIFIER_KEY_NAMES = new Set(['Meta','OS','Command','Control','Alt','Option','Shift']);
    function isMacPlatform(shortcuts) {
      if (shortcuts?.platform) return shortcuts.platform === 'macos';
      const desktop = typeof document !== 'undefined' ? document.documentElement?.dataset?.platform : undefined;
      const source = desktop ?? (typeof navigator !== 'undefined' ? navigator.platform : '');
      return /darwin|mac|iphone|ipad/iu.test(source || '');
    }
    function activeNonSidebarModal() {
      if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return null;
      const modals = [...document.querySelectorAll('[data-shortcut-modal]')];
      const top = modals.at(-1);
      if (!top) return null;
      const kind = top.getAttribute('data-shortcut-modal') || 'other';
      return kind === 'sidebar' ? null : kind;
    }
    function isEditableFocused(target) {
      const element = target && typeof target.closest === 'function' ? target : (typeof document !== 'undefined' ? document.activeElement : null);
      if (!element || typeof element.closest !== 'function') return false;
      return Boolean(element.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]'));
    }
    function isTerminalFocused(target) {
      const element = target && typeof target.closest === 'function' ? target : (typeof document !== 'undefined' ? document.activeElement : null);
      return Boolean(element && typeof element.closest === 'function' && element.closest('.xterm'));
    }
    function formatShortcutKeys(keys, mac) {
      if (!Array.isArray(keys) || !keys.length) return '';
      if (mac) return keys.join('');
      return keys.includes('+') ? keys.join('') : keys.join('+');
    }
    function isPrimaryModEvent(event, mac) {
      return mac ? Boolean(event.metaKey && !event.ctrlKey) : Boolean(event.ctrlKey && !event.metaKey);
    }
    const THREAD_JUMP_HINT_SHOW_DELAY_MS = 200;
    const EMPTY_MODIFIERS = { metaKey:false, ctrlKey:false, altKey:false, shiftKey:false };
    const EMPTY_CATALOG = [];
    function normalizeModifierKeyName(key) {
      switch (key) {
        case 'Meta': case 'OS': case 'Command': return 'metaKey';
        case 'Control': return 'ctrlKey';
        case 'Alt': case 'Option': return 'altKey';
        case 'Shift': return 'shiftKey';
        default: return null;
      }
    }
    function nextModifierState(current, event) {
      const modKey = normalizeModifierKeyName(event.key);
      const next = modKey
        ? { ...current, [modKey]: event.type === 'keydown' }
        : {
            metaKey: current.metaKey && Boolean(event.metaKey),
            ctrlKey: current.ctrlKey && Boolean(event.ctrlKey),
            altKey: current.altKey && Boolean(event.altKey),
            shiftKey: current.shiftKey && Boolean(event.shiftKey),
          };
      return (next.metaKey === current.metaKey && next.ctrlKey === current.ctrlKey && next.altKey === current.altKey && next.shiftKey === current.shiftKey)
        ? current : next;
    }
    function jumpModifierMatches(modifiers, mac, catalogRows) {
      const jumpRows = catalogRows.filter((row) => /^t3inbox\.thread\.jump[1-9]$/.test(row.id ?? '') && row.binding && !row.issue && !(row.conflicts?.length > 0));
      if (jumpRows.length) {
        return jumpRows.some((row) => {
          const mods = row.binding.modifiers ?? [];
          return mods.includes('meta') === modifiers.metaKey
            && mods.includes('control') === modifiers.ctrlKey
            && mods.includes('alt') === modifiers.altKey
            && mods.includes('shift') === modifiers.shiftKey
            && mods.length > 0;
        });
      }
      return mac
        ? modifiers.metaKey && !modifiers.ctrlKey && !modifiers.altKey && !modifiers.shiftKey
        : modifiers.ctrlKey && !modifiers.metaKey && !modifiers.altKey && !modifiers.shiftKey;
    }
    function resolveJumpHintLabels(catalogRows, mac) {
      const labels = new Map();
      const hasCatalog = catalogRows.some((row) => /^t3inbox\.thread\.jump[1-9]$/.test(row.id ?? ''));
      for (let index = 1; index <= 9; index++) {
        const row = catalogRows.find((entry) => entry.id === `t3inbox.thread.jump${index}`);
        if (hasCatalog && row) {
          if (row.binding && !row.issue && !(row.conflicts?.length > 0) && Array.isArray(row.keys) && row.keys.length) {
            labels.set(index, formatShortcutKeys(row.keys, mac));
          }
          continue;
        }
        labels.set(index, mac ? `⌘${index}` : `Ctrl+${index}`);
      }
      return labels;
    }
    function useJumpHints({ catalog, blocked, mac }) {
      const catalogRows = React.useSyncExternalStore(
        (listener) => (catalog?.subscribe ? catalog.subscribe(listener) : () => {}),
        () => catalog?.getSnapshot?.() ?? EMPTY_CATALOG,
        () => EMPTY_CATALOG,
      );
      const [modifiers, setModifiers] = React.useState(EMPTY_MODIFIERS);
      const modRef = React.useRef(EMPTY_MODIFIERS);
      const [shown, setShown] = React.useState(false);
      React.useEffect(() => {
        const update = (next) => {
          if (next === modRef.current) return;
          modRef.current = next;
          setModifiers(next);
        };
        const reset = () => {
          if (modRef.current !== EMPTY_MODIFIERS) { modRef.current = EMPTY_MODIFIERS; setModifiers(EMPTY_MODIFIERS); }
        };
        const onKey = (event) => {
          if (blocked || isTerminalFocused(event.target) || activeNonSidebarModal()) { reset(); return; }
          if (!normalizeModifierKeyName(event.key) && event.type === 'keydown') { reset(); return; }
          update(nextModifierState(modRef.current, event));
        };
        const onFocus = (event) => { if (isTerminalFocused(event.target) || activeNonSidebarModal()) reset(); };
        const onVis = () => { if (typeof document !== 'undefined' && document.visibilityState !== 'visible') reset(); };
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('keyup', onKey, true);
        window.addEventListener('focusin', onFocus);
        window.addEventListener('paste', reset, true);
        window.addEventListener('blur', reset);
        document.addEventListener('visibilitychange', onVis);
        return () => {
          window.removeEventListener('keydown', onKey, true);
          window.removeEventListener('keyup', onKey, true);
          window.removeEventListener('focusin', onFocus);
          window.removeEventListener('paste', reset, true);
          window.removeEventListener('blur', reset);
          document.removeEventListener('visibilitychange', onVis);
        };
      }, [blocked]);
      const held = !blocked && !activeNonSidebarModal() && jumpModifierMatches(modifiers, mac, catalogRows);
      React.useEffect(() => {
        if (!held) { setShown(false); return; }
        const timer = setTimeout(() => setShown(true), THREAD_JUMP_HINT_SHOW_DELAY_MS);
        return () => clearTimeout(timer);
      }, [held]);
      return React.useMemo(() => (shown ? resolveJumpHintLabels(catalogRows, mac) : null), [shown, catalogRows, mac]);
    }

    function useWorkingGrace(cards) {
      const states = React.useRef(new Map());
      const returns = React.useRef(new Map());
      const [tickCount,tick] = React.useState(0);
      const now = Date.now();
      const seen = new Set();
      let nearest = Infinity;
      const result = cards.map((card) => {
        seen.add(card.sessionId);
        const previous = states.current.get(card.sessionId);
        const failed = ['error','max-tokens','blocked'].includes(card.result?.reason?.kind);
        const immediate = card.needsYou || card.woke || failed || card.pinned || card.archived || card.section === 'settled' || card.section === 'snoozed';
        const excluded = Boolean(card.pinned || card.archived || card.section === 'settled' || card.section === 'snoozed');
        if (card.section === 'working') {
          returns.current.delete(card.sessionId);
          states.current.set(card.sessionId,{working:true,deadline:null});
          return card;
        }
        if (previous?.working) {
          if (card.section === 'active' && !immediate) {
            const deadline = previous.deadline ?? now + 2000;
            if (deadline > now) {
              nearest = Math.min(nearest,deadline);
              states.current.set(card.sessionId,{working:true,deadline});
              return {...card,section:'working',workingGrace:true};
            }
            const stamp = previous.deadline && previous.deadline <= now ? previous.deadline : now;
            returns.current.set(card.sessionId, stamp);
          } else if (!excluded && card.section === 'active') {
            returns.current.set(card.sessionId, now);
          } else if (excluded) {
            returns.current.delete(card.sessionId);
          }
        } else if (excluded || card.section !== 'active') {
          returns.current.delete(card.sessionId);
        }
        states.current.set(card.sessionId,{working:false,deadline:null});
        const observedReturnAt = card.section === 'active' && !card.pinned ? returns.current.get(card.sessionId) : undefined;
        return observedReturnAt ? { ...card, observedReturnAt } : card;
      });
      for (const id of states.current.keys()) {
        if (!seen.has(id)) {
          states.current.delete(id);
          returns.current.delete(id);
        }
      }
      React.useEffect(() => {
        if (!Number.isFinite(nearest)) return;
        const timer = setTimeout(() => tick((value) => value+1),Math.max(0,nearest-Date.now()));
        return () => clearTimeout(timer);
      },[nearest, tickCount]);
      return result;
    }

    function stopRow(handler) {
      return (event) => {
        event.preventDefault();
        event.stopPropagation();
        handler?.(event);
      };
    }
    function emitPreview(detail) {
      if (detail?.clear) {
        dismissActiveTooltip({ fromScroll: Boolean(detail.fromScroll), force: !detail.fromScroll });
      }
      const EventCtor = window.CustomEvent ?? CustomEvent;
      window.dispatchEvent(new EventCtor('t3i-force-preview',{detail}));
    }
    function ActionButton({ icon, label, tooltip, tooltipSub = null, tooltipSide = 'top', tooltipSuppressed = false, active = false, onClick, onKeyDown, buttonRef, className, controls, disabled, expanded, hint }) {
      const tipText = tooltip ?? hint ?? label;
      return h(TooltipButton,{buttonRef,type:'button',className:className ? `t3i-icon-button ${className}` : 't3i-icon-button','aria-label':label,'aria-haspopup':controls ? 'menu' : undefined,'aria-controls':controls,'aria-expanded':expanded,'data-active':active ? 'true' : undefined,tooltip:tipText,tooltipSub,tooltipSide,tooltipSuppressed,onClick,onKeyDown,onPointerDown:stopRow(),disabled},h(Icon,{name:icon,size:16}));
    }
    function SnoozeAction({ label, hint, onClick, onKeyDown, buttonRef, controls, disabled, expanded }) {
      const tooltipText = hint ?? label;
      const { tip, tipRef, setTriggerRef, triggerProps } = useActionTooltip({
        content: tooltipText,
        side: 'top',
        suppressed: Boolean(expanded),
      });
      return h(React.Fragment,null,
        h('span',{
          ref:setTriggerRef,
          className:'t3i-tip-host',
          'data-disabled':disabled ? 'true' : undefined,
          'data-t3i-tooltip-trigger':triggerProps['data-t3i-tooltip-trigger'],
          onMouseEnter:triggerProps.onMouseEnter,
          onMouseLeave:triggerProps.onMouseLeave,
          onFocus:triggerProps.onFocus,
          onBlur:triggerProps.onBlur,
          onPointerDown:disabled ? stopRow(triggerProps.onPointerDown) : triggerProps.onPointerDown,
          onClick:disabled ? stopRow(triggerProps.onClick) : triggerProps.onClick,
        },
          h('button',{ref:buttonRef,type:'button',className:'t3i-snooze-action','aria-label':label,'aria-haspopup':controls ? 'menu' : undefined,'aria-controls':controls,'aria-expanded':expanded,onClick:mergeHandlers(triggerProps.onClick, onClick),onKeyDown,onPointerDown:stopRow(triggerProps.onPointerDown),disabled},h(Icon,{name:'clock',size:12}))),
        h(ActionTooltipPopup,{tip,tipRef,content:tooltipText}));
    }
    function PrimaryAction({ icon, label, hint, onClick, onPointerDown, disabled }) {
      const tooltipText = hint ?? label;
      const { tip, tipRef, setTriggerRef, triggerProps } = useActionTooltip({
        content: tooltipText,
        side: 'top',
      });
      return h(React.Fragment,null,
        h('span',{
          ref:setTriggerRef,
          className:'t3i-tip-host',
          'data-disabled':disabled ? 'true' : undefined,
          'data-t3i-tooltip-trigger':triggerProps['data-t3i-tooltip-trigger'],
          onMouseEnter:triggerProps.onMouseEnter,
          onMouseLeave:triggerProps.onMouseLeave,
          onFocus:triggerProps.onFocus,
          onBlur:triggerProps.onBlur,
          onPointerDown:disabled ? stopRow(triggerProps.onPointerDown) : triggerProps.onPointerDown,
          onClick:disabled ? stopRow(triggerProps.onClick) : triggerProps.onClick,
        },
          h('button',{type:'button',className:'t3i-primary-action','aria-label':label,onClick:mergeHandlers(triggerProps.onClick, onClick),onPointerDown:mergeHandlers(triggerProps.onPointerDown, onPointerDown ?? stopRow()),disabled},h(Icon,{name:icon,size:14}),h('span',null,label))),
        h(ActionTooltipPopup,{tip,tipRef,content:tooltipText}));
    }
    function clockTime(ms, locale, timeFormat = readTimeFormat()) {
      const opts = { hour:'numeric', minute:'2-digit' };
      if (timeFormat === '12-hour') opts.hour12 = true;
      else if (timeFormat === '24-hour') opts.hour12 = false;
      try { return new Date(ms).toLocaleTimeString(locale, opts); }
      catch { return ''; }
    }
    const CUSTOM_UNIT_MS = { minutes:60000, hours:3600000, days:86400000 };
    function localSnoozeDate(date) {
      const d = date instanceof Date ? date : new Date(date);
      const pad = (value) => String(value).padStart(2, '0');
      return `${String(d.getFullYear()).padStart(4, '0')}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    function localSnoozeTime(date) {
      const d = date instanceof Date ? date : new Date(date);
      const pad = (value) => String(value).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function startOfLocalDay(ms) {
      const day = new Date(ms);
      day.setHours(0, 0, 0, 0);
      return day;
    }
    function resolveCustomSnooze(custom, t, now = new Date()) {
      let wake;
      if (custom.mode === 'duration') {
        const amount = Number(custom.amount);
        if (!Number.isFinite(amount) || amount <= 0) return { error:t('durationInvalid') };
        const unitMs = CUSTOM_UNIT_MS[custom.unit];
        if (!unitMs) return { error:t('durationInvalid') };
        wake = new Date(now.getTime() + amount * unitMs);
      } else {
        const dateStr = custom.dateStr ?? (custom.date instanceof Date ? localSnoozeDate(custom.date) : '');
        const timeStr = custom.time ?? '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) return { error:t('snoozeInvalid') };
        wake = new Date(`${dateStr}T${timeStr}:00`);
        if (Number.isNaN(wake.getTime()) || localSnoozeDate(wake) !== dateStr || localSnoozeTime(wake) !== timeStr) {
          return { error:t('snoozeInvalid') };
        }
      }
      if (!Number.isFinite(wake.getTime()) || wake.getTime() <= now.getTime()) return { error:t('snoozeInvalid') };
      return { until:wake.getTime() };
    }
    /** Incomplete/cold host state is silent (T3 has no cold UX); only business blockers explain. */
    function actionDisableHint(card, kind, { pending = false } = {}, t) {
      if (pending) return t('actionBusy');
      if (!card.context || card.completeness !== 'complete' || card.treeError) return null;
      if (kind === 'settle') {
        if (card.archived) return null;
        if (card.running && !card.needsYou) return t('settleBusy');
        if (!card.canSettle && !card.pinned && card.section !== 'settled') return t('settleNotReady');
        return null;
      }
      if (kind === 'snooze') {
        if (card.archived) return null;
        /* T3: Input (user_input) stays snoozeable; Approvals do not. */
        if (card.needsYou && (card.pending ?? []).some((item) => item.kind === 'approval')) return t('snoozeNotReady');
        if (!card.canSnooze && !(card.needsYou && card.completeness === 'complete')) return t('snoozeNotReady');
        return null;
      }
      return null;
    }
    function needsSilentPrepare(card) {
      return Boolean(card && !card.archived && (!card.context || card.completeness !== 'complete') && !card.treeError);
    }
    function settleClickable(card, pending) {
      /* T3: Settle stays available during Input even if runtime still looks "running",
         and any non-settled complete session (even zero-result) can be settled. */
      if (pending || card.archived || (card.running && !card.needsYou)) return false;
      if (!card.pinned && card.section === 'settled') return false;
      if (card.canSettle) return true;
      if (card.needsYou && card.completeness === 'complete') return true;
      return needsSilentPrepare(card);
    }
    function snoozeClickable(card, pending) {
      if (pending || card.archived) return false;
      if ((card.pending ?? []).some((item) => item.kind === 'approval')) return false;
      if (card.canSnooze) return true;
      /* T3 canSnooze during user_input; Client overlay may show needsYou before Host identity lands. */
      if (card.needsYou && card.completeness === 'complete') return true;
      return needsSilentPrepare(card) && !card.running;
    }
    /* Keep the displayed absolute wake fixed; durations are recalculated when selected. */
    const defaultSnoozeOptions = [
      {kind:'after',minutes:60},{kind:'after',minutes:180},{kind:'at',day:'today',time:'18:00'},
      {kind:'at',day:'tomorrow',time:'09:00'},{kind:'at',day:'monday',time:'09:00'},
    ];
    const SNOOZE_DAY_KEYS = {
      after:'whenAfter', today:'dayToday', tomorrow:'dayTomorrow',
      monday:'dayMonday', tuesday:'dayTuesday', wednesday:'dayWednesday', thursday:'dayThursday',
      friday:'dayFriday', saturday:'daySaturday', sunday:'daySunday',
    };
    const SNOOZE_NEXT_DAY_KEYS = {
      sunday:'nextSunday', monday:'nextMonday', tuesday:'nextTuesday', wednesday:'nextWednesday',
      thursday:'nextThursday', friday:'nextFriday', saturday:'nextSaturday',
    };
    function snoozePresets(locale, settings = defaultSnoozeOptions, timeFormat = readTimeFormat(), t = null) {
      const now = new Date();
      const weekdays = {sunday:0,monday:1,tuesday:2,wednesday:3,thursday:4,friday:5,saturday:6};
      const entries = settings.map((option) => {
        if (option.kind === 'after') {
          const n = option.minutes;
          let label;
          if (n % 1440 === 0) {
            const amount = n / 1440;
            const key = selectPluralKey(locale, amount, { one:'snoozeInDay', few:'snoozeInDayFew', other:'snoozeInDays' });
            label = resolveLocalized(t, locale, key, { count: amount });
          } else if (n % 60 === 0) {
            const amount = n / 60;
            const key = selectPluralKey(locale, amount, { one:'snoozeInHour', few:'snoozeInHourFew', other:'snoozeInHours' });
            label = resolveLocalized(t, locale, key, { count: amount });
          } else {
            const key = selectPluralKey(locale, n, { one:'snoozeInMinute', few:'snoozeInMinuteFew', other:'snoozeInMinutes' });
            label = resolveLocalized(t, locale, key, { count: n });
          }
          return {id:`after:${n}`,minutes:n,at:now.getTime()+n*60000,labelNamesDay:false,label};
        }
        const days = option.day === 'today' ? 0 : option.day === 'tomorrow' ? 1 : (weekdays[option.day]-now.getDay()+7)%7 || 7;
        const wake = new Date(now); wake.setDate(wake.getDate()+days); wake.setHours(Number(option.time.slice(0,2)),Number(option.time.slice(3)),0,0);
        const hour = Number(option.time.slice(0,2));
        let labelKey;
        if (days === 0) labelKey = hour < 12 ? 'thisMorning' : hour < 17 ? 'thisAfternoon' : 'thisEvening';
        else if (days === 1) labelKey = 'tomorrow';
        else if (days > 1 && option.day === 'monday') labelKey = 'nextWeek';
        else labelKey = days === 7 ? SNOOZE_NEXT_DAY_KEYS[option.day] : SNOOZE_DAY_KEYS[option.day];
        const label = resolveLocalized(t, locale, labelKey);
        const labelNamesDay = !(days > 1 && option.day === 'monday');
        return {id:`at:${option.day}:${option.time}`,at:wake.getTime(),labelNamesDay,label};
      });
      const seen = new Set();
      return entries.filter((preset) => preset.at > now.getTime())
        .sort((a,b) => Math.floor(a.at/60000)-Math.floor(b.at/60000))
        .filter((preset) => { const minute = Math.floor(preset.at/60000); if (seen.has(minute)) return false; seen.add(minute); return true; })
        .map((preset) => {
          const wake = new Date(preset.at);
          const includeDay = !preset.labelNamesDay && wake.toDateString() !== now.toDateString();
          let weekday = '';
          if (includeDay) { try { weekday = `${wake.toLocaleDateString(locale, {weekday:'short'})} `; } catch { weekday = `${wake.toLocaleDateString(undefined, {weekday:'short'})} `; } }
          return {...preset,whenLabel:`${weekday}${clockTime(preset.at,locale,timeFormat)}`};
        });
    }
    function pickSnoozePreset(preset) {
      const now = Date.now();
      if (preset.minutes) return now + preset.minutes*60000;
      return preset.at > now ? preset.at : null;
    }
    function SnoozeChoices({ choose, onCustom, t, locale, options, timeFormat = null, allowCustom = true }) {
      const resolvedTimeFormat = timeFormat ?? readTimeFormat();
      const optionsKey = JSON.stringify(options ?? null);
      const presets = React.useMemo(() => snoozePresets(locale, options, resolvedTimeFormat, t), [locale, optionsKey, resolvedTimeFormat, t]);
      const items = presets.map((preset) => h('button',{
        key:preset.id,type:'button',role:'menuitem',className:'t3i-preset',
        onClick:() => choose(preset),
      },
        h('span',null,preset.label),
        h('span',{className:'t3i-preset-when'},preset.whenLabel)));
      if (allowCustom) {
        if (items.length) items.push(h('div',{key:'separator',className:'t3i-menu-separator',role:'separator'}));
        items.push(h('button',{key:'custom',type:'button',role:'menuitem',className:'t3i-preset','data-custom':'true',onClick:() => onCustom?.()},t('customSnooze')));
      }
      return items;
    }
    function translateEnFallback(key, params) {
      return translate('en', key, params);
    }
    function SnoozeOptionFields({ option, index, onChange, onRemove, t }) {
      const split = (minutes) => minutes % 1440 === 0 ? ['days',minutes/1440] : minutes % 60 === 0 ? ['hours',minutes/60] : ['minutes',minutes];
      const [unit,setUnit] = React.useState(() => option.kind === 'after' ? split(option.minutes)[0] : 'minutes');
      const factor = {minutes:1,hours:60,days:1440}[unit];
      const amount = option.kind === 'after' ? option.minutes/factor : 0;
      const [draft,setDraft] = React.useState(String(amount));
      const memory = React.useRef({minutes:60,time:'09:00'});
      React.useEffect(() => { if (option.kind === 'after') setDraft(String(option.minutes/factor)); },[option.kind,option.minutes,factor]);
      const commit = () => {
        const value = Number(draft);
        if (draft.trim() === '' || !Number.isFinite(value)) { setDraft(String(amount)); return; }
        const next = Math.max(1,Math.min(Math.floor(43200/factor),Math.round(value)));
        setDraft(String(next));
        if (next !== amount) onChange({kind:'after',minutes:next*factor});
      };
      const step = (delta) => { const next = Math.max(1,Math.min(Math.floor(43200/factor),amount+delta)); setDraft(String(next)); if (next !== amount) onChange({kind:'after',minutes:next*factor}); };
      const unitLabelText = (value) => {
        const mapped = value === 'minutes' ? t('unitMinutes') : value === 'hours' ? t('unitHours') : t('unitDays');
        if (mapped === en[value === 'minutes' ? 'unitMinutes' : value === 'hours' ? 'unitHours' : 'unitDays']) {
          return amount === 1 ? value.slice(0, -1) : value;
        }
        return mapped;
      };
      return h('div',{className:'t3i-settings-row'},
        h('select',{'aria-label':t('whenLabel'),value:option.kind === 'after' ? 'after' : option.day,onChange:(event) => {
          const value = event.target.value;
          if (option.kind === 'after') memory.current.minutes = option.minutes; else memory.current.time = option.time;
          if (value === 'after') { const minutes = memory.current.minutes; setUnit(split(minutes)[0]); onChange({kind:'after',minutes}); }
          else onChange({kind:'at',day:value,time:option.kind === 'at' ? option.time : memory.current.time});
        }},...['after','today','tomorrow','monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((value) => h('option',{key:value,value},t(SNOOZE_DAY_KEYS[value])))),
        option.kind === 'after' ? h(React.Fragment,null,
          h('div',{className:'t3i-settings-stepper'},
            h('button',{type:'button','aria-label':t('decrease'),disabled:amount <= 1,onMouseDown:(event) => event.preventDefault(),onClick:() => step(-1)},'−'),
            h('input',{'aria-label':t('amountLabel'),type:'number',min:1,max:Math.floor(43200/factor),step:'any',value:draft,onChange:(event) => setDraft(event.target.value),onBlur:(event) => { if (event.relatedTarget?.getAttribute('aria-label') === t('unitLabel')) setDraft(String(amount)); else commit(); },onKeyDown:(event) => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }}),
            h('button',{type:'button','aria-label':t('increase'),disabled:amount >= Math.floor(43200/factor),onMouseDown:(event) => event.preventDefault(),onClick:() => step(1)},'+')),
          h('select',{'aria-label':t('unitLabel'),value:unit,onChange:(event) => {
            const next = event.target.value, nextFactor = {minutes:1,hours:60,days:1440}[next];
            setUnit(next); onChange({kind:'after',minutes:Math.min(amount*nextFactor,43200)});
          }},...['minutes','hours','days'].map((value) => h('option',{key:value,value},unitLabelText(value)))))
          : h(React.Fragment,null,h('small',{style:{marginLeft:0}},t('atWord')),h('input',{'aria-label':t('timeFieldLabel'),type:'time',value:option.time,onChange:(event) => { if (/^([01]\d|2[0-3]):[0-5]\d$/.test(event.target.value)) onChange({...option,time:event.target.value}); }})),
        h('button',{type:'button',className:'t3i-setting-subcontrol t3i-setting-danger','aria-label':t('removeSnoozeOption',{index:index+1}),onClick:onRemove},t('removeOption')));
    }
    function InboxSettingRow({ id, label, description, expanded = false, children }) {
      return h('div',{className:'t3i-settings-pref','data-expanded':expanded ? 'true' : undefined},
        h('div',{className:'t3i-settings-pref-text'},
          id ? h('label',{className:'t3i-settings-pref-title',htmlFor:id},label) : h('span',{className:'t3i-settings-pref-title'},label),
          description ? h('span',{className:'t3i-settings-pref-desc',id:id ? `${id}-desc` : undefined},description) : null),
        children);
    }
    function SettingsToggle({ id, label, checked, onChange }) {
      if (hostUI.Switch) return h(hostUI.Switch,{id,label,checked,onChange});
      return h('input',{id,type:'checkbox',role:'switch',className:'t3i-settings-toggle','aria-describedby':`${id}-desc`,checked,onChange:(event) => onChange(event.target.checked)});
    }
    function SettingsChoice({ id, label, value, options, onChange }) {
      const [open,setOpen] = React.useState(false);
      const descriptionId = `${id}-desc`;
      if (!hostUI.Menu || !hostUI.IconChevronDownOutlineRegular) {
        return h('select',{id,className:'t3i-setting-control','aria-describedby':descriptionId,value,onChange:(event) => onChange(event.target.value)},
          ...options.map(([key,text]) => h('option',{key,value:key},text)));
      }
      const selectedLabel = options.find(([key]) => key === value)?.[1];
      return h('div',{className:'t3i-setting-choice'},h(hostUI.Menu,{
        open,onClose:() => setOpen(false),align:'end',portal:true,
        items:options.map(([key,text]) => ({id:key,label:text})),selectedId:value,
        onSelect:(key) => { onChange(key); setOpen(false); },
        anchor:h('button',{id,type:'button',className:'t3i-setting-control','aria-label':`${label}, ${selectedLabel}`,'aria-describedby':descriptionId,'aria-haspopup':'menu','aria-expanded':open,onClick:() => setOpen(!open)},
          h('span',{className:'t3i-setting-choice-label'},selectedLabel),h(hostUI.IconChevronDownOutlineRegular)),
      }));
    }
    function SidebarViewSetting({ mode, runtime, t }) {
      const labelId = React.useId();
      return h('div',{className:'t3i-settings-view',role:'group','aria-labelledby':labelId},
        h('div',{id:labelId,className:'t3i-settings-pref-title'},t('sidebarView')),
        h('div',{className:'t3i-settings-view-options'},
          h('button',{type:'button',className:'t3i-settings-view-option','aria-pressed':mode === 'inbox',onClick:() => runtime.setMode('inbox')},
            h(SidebarSwitchIcon,{destination:'inbox'}),t('inboxView')),
          h('button',{type:'button',className:'t3i-settings-view-option','aria-pressed':mode === 'native',onClick:() => runtime.setMode('native')},
            h(SidebarSwitchIcon,{destination:'workspaces'}),t('workspacesView'))));
    }
    function InboxSidebarSettings({ appearance, panelsPosition, runtime, t }) {
      const id = React.useId();
      const panelsId = `${id}-panels`;
      const backgroundId = `${id}-background`;
      const isCustom = appearance.mode === 'custom';
      return h(React.Fragment,null,
        h(InboxSettingRow,{id:backgroundId,label:t('sidebarBackground'),description:t('sidebarBackgroundDesc'),expanded:isCustom},
          h(SettingsChoice,{id:backgroundId,label:t('sidebarBackground'),value:appearance.mode,onChange:(mode) => runtime.setSidebarAppearance({mode}),options:[
            ['host',t('sidebarBackgroundHost')],['t3',t('sidebarBackgroundT3')],['custom',t('sidebarBackgroundCustom')],
          ]})),
        isCustom ? h('div',{className:'t3i-settings-subpanel t3i-settings-colors'},
          ['light','dark'].map((theme) => h(InboxSettingRow,{id:`${id}-${theme}`,key:theme,label:t(theme === 'light' ? 'sidebarLightColor' : 'sidebarDarkColor')},
            h('div',{className:'t3i-settings-color-control'},
              h('span',{className:'t3i-settings-color-hex'},appearance[theme]),
              h('input',{id:`${id}-${theme}`,type:'color',value:appearance[theme],onChange:(event) => runtime.setSidebarAppearance({[theme]:event.target.value})}))))) : null,
        h(InboxSettingRow,{id:panelsId,label:t('globalPanelsLabel'),description:t('globalPanelsDesc')},
          h(SettingsChoice,{id:panelsId,label:t('globalPanelsLabel'),value:panelsPosition,onChange:runtime.setPanelsPosition,options:[
            ['footer',t('globalPanelsFooter')],['top',t('globalPanelsTop')],['hidden',t('globalPanelsHidden')],
          ]})));
    }
    function InboxSettingsSection({ inbox:runtime, t:tProp = null }) {
      const t = typeof tProp === 'function' ? tProp : translateEnFallback;
      const view = useView(runtime);
      const saved = view.remote?.snoozeSettings;
      const timeFormat = view.timeFormat || 'locale';
      const workingShelfEnabled = view.workingShelfEnabled !== false;
      const appearanceHeadingId = React.useId();
      const behaviorHeadingId = React.useId();
      const snoozePanelId = React.useId();
      const workingShelfId = React.useId();
      const timeFormatId = React.useId();
      const [showShortcuts,setShowShortcuts] = React.useState(false);
      const [editingKey,setEditingKey] = React.useState(null);
      React.useLayoutEffect(() => {
        if (!view.editSnoozeShortcuts) return;
        setShowShortcuts(true);
        runtime.store.set({editSnoozeShortcuts:false});
      },[view.editSnoozeShortcuts,runtime]);
      useNowMinute();
      const sortRows = (rows) => [...rows].sort((a,b) => (snoozePresets(runtime.locale(),[a.option],timeFormat)[0]?.at ?? Infinity) - (snoozePresets(runtime.locale(),[b.option],timeFormat)[0]?.at ?? Infinity));
      const ids = (options) => options.map((option) => JSON.stringify(option)).sort();
      const [rows,setRows] = React.useState(() => sortRows((saved?.presets ?? defaultSnoozeOptions).map((option) => ({key:crypto.randomUUID(),option}))));
      const rowsRef = React.useRef(rows); rowsRef.current = rows;
      const pending = React.useRef(null), writing = React.useRef(false), revision = React.useRef(saved?.revision ?? 0);
      const [error,setError] = React.useState(null);
      React.useEffect(() => {
        if (!saved || writing.current || pending.current) return;
        revision.current = saved.revision;
        if (JSON.stringify(ids(saved.presets)) === JSON.stringify(ids(rowsRef.current.map((row) => row.option)))) return;
        setRows(sortRows(saved.presets.map((option) => ({key:crypto.randomUUID(),option}))));
      },[view.remote?.generation,saved?.revision]);
      const publish = (next) => {
        if (!saved) { setError(t('snoozeLoading')); return; }
        if (JSON.stringify(next.map((row) => row.option)) === JSON.stringify(rowsRef.current.map((row) => row.option)) && !saved.error) return;
        rowsRef.current = next; setRows(next);
        pending.current = next.map((row) => row.option);
        if (writing.current) return;
        writing.current = true;
        void (async () => {
          while (pending.current) {
            const presets = pending.current; pending.current = null;
            try {
              const result = await runtime.saveSnoozeSettings({revision:revision.current,presets});
              revision.current = result.settings.revision;
              if (result.status !== 'committed') throw new Error(t('snoozeSaveConflict'));
              setError(null);
            } catch (failure) {
              pending.current = null;
              console.error('Snooze options save failed:',failure);
              setError(t('snoozeSaveFailed'));
              const latest = runtime.store.getSnapshot().remote?.snoozeSettings;
              if (latest) { revision.current = latest.revision; const restored = latest.presets.map((option) => ({key:crypto.randomUUID(),option})); rowsRef.current = restored; setRows(restored); }
              break;
            }
          }
          writing.current = false;
        })();
      };
      const options = rows.map((row) => row.option);
      const seenIds = new Set(), seenWakes = new Set();
      const summaries = showShortcuts ? options.map((option) => {
        const resolved = snoozePresets(runtime.locale(),[option],timeFormat,t)[0];
        const label = option.kind === 'at' ? `${t(SNOOZE_DAY_KEYS[option.day])} ${option.time}`
          : resolved?.label;
        const whenLabel = resolved?.whenLabel && resolved.whenLabel !== label ? resolved.whenLabel : null;
        if (!resolved) return {label,warning:t('passedToday')};
        if (seenIds.has(resolved.id)) return {label,warning:t('duplicateOption')};
        const minute = Math.floor(resolved.at/60000);
        if (seenWakes.has(minute)) return {label,warning:t('sameTimeOption')};
        seenIds.add(resolved.id); seenWakes.add(minute);
        return {label,whenLabel};
      }) : [];
      const differentDefaults = JSON.stringify(ids(options)) !== JSON.stringify(ids(defaultSnoozeOptions));
      const viewSetting = h(SidebarViewSetting,{mode:view.mode,runtime,t});
      if (view.mode !== 'inbox') return h('div',{className:'t3i-settings'},viewSetting);
      return h('div',{className:'t3i-settings'},
        viewSetting,
        h('section',{className:'t3i-settings-group','aria-labelledby':appearanceHeadingId},
          h('h3',{id:appearanceHeadingId,className:'t3i-settings-group-title'},t('settingsAppearanceSection')),
          h(InboxSidebarSettings,{appearance:view.sidebarAppearance,panelsPosition:view.panelsPosition,runtime,t})),
        h('section',{className:'t3i-settings-group','aria-labelledby':behaviorHeadingId},
          h('h3',{id:behaviorHeadingId,className:'t3i-settings-group-title'},t('settingsBehaviorSection')),
          h(InboxSettingRow,{id:workingShelfId,label:t('workingShelfLabel'),description:t('workingShelfDesc')},
            h(SettingsToggle,{id:workingShelfId,label:t('workingShelfLabel'),checked:workingShelfEnabled,onChange:runtime.setWorkingShelfEnabled})),
          h(InboxSettingRow,{label:t('snoozeOptionsTitle'),description:t('snoozeOptionsHelp'),expanded:showShortcuts},
            h('button',{type:'button',className:'t3i-setting-control','aria-expanded':showShortcuts,'aria-controls':snoozePanelId,onClick:() => {
              if (showShortcuts) setEditingKey(null);
              setShowShortcuts(!showShortcuts);
            }},t(showShortcuts ? 'hideShortcuts' : 'editShortcuts'))),
          h('section',{id:snoozePanelId,className:'t3i-settings-editor t3i-settings-subpanel','aria-label':t('snoozeOptionsTitle'),hidden:!showShortcuts},showShortcuts ? h(React.Fragment,null,
            error || saved?.error ? h('p',{role:'alert'},error ?? saved.error) : null,
            h('div',{onBlur:(event) => { const list = event.currentTarget; if (list.contains(event.relatedTarget)) return; queueMicrotask(() => {
              if (list.contains(document.activeElement)) return;
              const current = rowsRef.current;
              const sorted = sortRows(current);
              rowsRef.current = sorted; setRows(sorted);
            }); }},
              ...rows.map((row,index) => {
                const editing = editingKey === row.key;
                const fieldsId = `${snoozePanelId}-${row.key}`;
                const summary = summaries[index];
                return h('div',{key:row.key,className:'t3i-settings-option',role:'group','aria-label':t('snoozeOptionItem',{index:index+1})},
                  h(InboxSettingRow,{label:summary.label,description:summary.warning},
                    h('div',{className:'t3i-settings-option-meta'},
                      summary.whenLabel ? h('span',{className:'t3i-settings-option-when'},summary.whenLabel) : null,
                      h('button',{type:'button',className:'t3i-setting-subcontrol','aria-expanded':editing,'aria-controls':fieldsId,onClick:() => setEditingKey(editing ? null : row.key)},t(editing ? 'doneEditingOption' : 'editOption')))),
                  h('div',{id:fieldsId,className:'t3i-settings-option-fields',hidden:!editing},editing ? h(SnoozeOptionFields,{option:row.option,index,t,
                    onChange:(option) => publish(rowsRef.current.map((item) => item.key === row.key ? {...item,option} : item)),
                    onRemove:() => { setEditingKey(null); publish(rowsRef.current.filter((item) => item.key !== row.key)); },
                  }) : null));
              }),
              h('div',{className:'t3i-settings-actions'},
              h('button',{type:'button',className:'t3i-setting-subcontrol',disabled:!saved || rows.length >= 8,onClick:() => {
                const candidates = [...defaultSnoozeOptions,{kind:'after',minutes:30},{kind:'at',day:'saturday',time:'09:00'},{kind:'after',minutes:1440}];
                const used = new Set(rowsRef.current.map((row) => JSON.stringify(row.option)));
                const option = candidates.find((candidate) => !used.has(JSON.stringify(candidate))) ?? {kind:'after',minutes:60};
                const key = crypto.randomUUID();
                setEditingKey(key);
                publish([...rowsRef.current,{key,option:{...option}}]);
              }},t('addOption')),
              differentDefaults || saved?.error ? h('button',{type:'button',className:'t3i-setting-subcontrol',disabled:!saved,onClick:() => {
                setEditingKey(null);
                publish(sortRows(defaultSnoozeOptions.map((option) => ({key:crypto.randomUUID(),option:{...option}}))));
              }},t('resetLabel')) : null,rows.length >= 8 ? h('small',null,t('maxOptionsHint')) : null))) : null),
          h(InboxSettingRow,{id:timeFormatId,label:t('timeFormatLabel'),description:t('timeFormatDesc')},
            h(SettingsChoice,{id:timeFormatId,label:t('timeFormatLabel'),value:timeFormat,onChange:runtime.setTimeFormat,options:[
              ['locale',t('timeFormatLocale')],['12-hour',t('timeFormat12')],['24-hour',t('timeFormat24')],
            ]}))));
    }
    function weekStartsOnForLocale(locale) {
      try {
        const info = new Intl.Locale(locale || 'en-US').getWeekInfo?.() ?? new Intl.Locale(locale || 'en-US').weekInfo;
        if (info?.firstDay === 1) return 1;
        if (info?.firstDay === 7) return 0;
      } catch {}
      const primary = normalizeLocale(locale);
      return (primary === 'zh' || primary === 'de' || primary === 'es' || primary === 'fr' || primary === 'ru') ? 1 : 0;
    }
    function MonthCalendar({ selected, today, locale, onSelect, t }) {
      const [viewMonth,setViewMonth] = React.useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
      const [focusedDayKey,setFocusedDayKey] = React.useState(() => localSnoozeDate(selected));
      const dayRefs = React.useRef(new Map());
      const pendingFocusKeyRef = React.useRef(null);
      const weekStartsOn = weekStartsOnForLocale(locale);
      const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
      const offset = (firstDay.getDay() - weekStartsOn + 7) % 7;
      const start = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1 - offset);
      const cells = Array.from({ length: 42 }, (_, idx) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + idx));
      const weekdays = Array.from({ length: 7 }, (_, idx) => {
        const ref = new Date(2026, 0, 4 + ((weekStartsOn + idx) % 7));
        try { return ref.toLocaleDateString(locale || undefined, { weekday:'short' }); }
        catch { return ['Su','Mo','Tu','We','Th','Fr','Sa'][(weekStartsOn + idx) % 7]; }
      });
      let caption = `${viewMonth.getFullYear()}-${viewMonth.getMonth() + 1}`;
      try { caption = viewMonth.toLocaleDateString(locale || undefined, { month:'long', year:'numeric' }); } catch {}
      const selectedDayMs = startOfLocalDay(selected.getTime()).getTime();
      const todayMs = startOfLocalDay(today.getTime()).getTime();
      const fallbackActiveKey = (() => {
        if (cells.some((cell) => localSnoozeDate(cell) === focusedDayKey && startOfLocalDay(cell.getTime()).getTime() >= todayMs)) return focusedDayKey;
        const sel = cells.find((cell) => startOfLocalDay(cell.getTime()).getTime() === selectedDayMs && selectedDayMs >= todayMs);
        if (sel) return localSnoozeDate(sel);
        const firstEnabled = cells.find((cell) => !cell.getMonth || (cell.getMonth() === viewMonth.getMonth() && startOfLocalDay(cell.getTime()).getTime() >= todayMs));
        return firstEnabled ? localSnoozeDate(firstEnabled) : localSnoozeDate(today);
      })();
      React.useEffect(() => {
        const pending = pendingFocusKeyRef.current;
        if (!pending) return;
        pendingFocusKeyRef.current = null;
        dayRefs.current.get(pending)?.focus?.({ preventScroll:true });
      }, [viewMonth, focusedDayKey]);
      const moveFocusTo = (targetDate) => {
        const clampedMs = Math.max(todayMs, startOfLocalDay(targetDate.getTime()).getTime());
        const clamped = new Date(clampedMs);
        const nextKey = localSnoozeDate(clamped);
        pendingFocusKeyRef.current = nextKey;
        setFocusedDayKey(nextKey);
        if (clamped.getFullYear() !== viewMonth.getFullYear() || clamped.getMonth() !== viewMonth.getMonth()) {
          setViewMonth(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
        } else {
          queueMicrotask(() => { dayRefs.current.get(nextKey)?.focus?.({ preventScroll:true }); });
        }
      };
      const shiftMonth = (cell, deltaMonths) => {
        const targetMonth = new Date(cell.getFullYear(), cell.getMonth() + deltaMonths, 1);
        const maxDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
        return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), Math.min(cell.getDate(), maxDay));
      };
      return h('div',{className:'t3i-calendar'},
        h('div',{className:'t3i-cal-head'},
          h('button',{type:'button',className:'t3i-cal-nav','aria-label':t('prevMonth'),onClick:() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))},h(Icon,{name:'chevronLeft',size:16})),
          h('span',{className:'t3i-cal-caption'},caption),
          h('button',{type:'button',className:'t3i-cal-nav','aria-label':t('nextMonth'),onClick:() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))},h(Icon,{name:'chevronRight',size:16}))),
        h('div',{className:'t3i-cal-grid',role:'grid','aria-label':caption},
          ...weekdays.map((name, idx) => h('span',{key:`wd-${idx}`,className:'t3i-cal-weekday','aria-hidden':true},name)),
          ...cells.map((cell) => {
            const key = localSnoozeDate(cell);
            const dayMs = startOfLocalDay(cell.getTime()).getTime();
            const outside = cell.getMonth() !== viewMonth.getMonth();
            const isToday = dayMs === todayMs;
            const isSelected = dayMs === selectedDayMs;
            const disabled = dayMs < todayMs;
            let dayAria = key;
            try { dayAria = cell.toLocaleDateString(locale || undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' }); } catch {}
            return h('button',{
              key,type:'button',className:'t3i-cal-day',disabled,
              ref:(el) => { if (el) dayRefs.current.set(key, el); else dayRefs.current.delete(key); },
              tabIndex:!disabled && fallbackActiveKey === key ? 0 : -1,
              'data-outside':outside ? 'true' : undefined,
              'data-today':isToday ? 'true' : undefined,
              'data-selected':isSelected ? 'true' : undefined,
              'aria-pressed':isSelected,
              'aria-label':dayAria,
              onFocus:() => setFocusedDayKey(key),
              onKeyDown:(event) => {
                let target = null;
                if (event.key === 'ArrowLeft') target = new Date(cell.getFullYear(), cell.getMonth(), cell.getDate() - 1);
                else if (event.key === 'ArrowRight') target = new Date(cell.getFullYear(), cell.getMonth(), cell.getDate() + 1);
                else if (event.key === 'ArrowUp') target = new Date(cell.getFullYear(), cell.getMonth(), cell.getDate() - 7);
                else if (event.key === 'ArrowDown') target = new Date(cell.getFullYear(), cell.getMonth(), cell.getDate() + 7);
                else if (event.key === 'Home') {
                  const col = (cell.getDay() - weekStartsOn + 7) % 7;
                  target = new Date(cell.getFullYear(), cell.getMonth(), cell.getDate() - col);
                } else if (event.key === 'End') {
                  const col = (cell.getDay() - weekStartsOn + 7) % 7;
                  target = new Date(cell.getFullYear(), cell.getMonth(), cell.getDate() + (6 - col));
                } else if (event.key === 'PageUp') target = shiftMonth(cell, -1);
                else if (event.key === 'PageDown') target = shiftMonth(cell, 1);
                if (!target) return;
                event.preventDefault();
                event.stopPropagation();
                moveFocusTo(target);
              },
              onClick:() => onSelect(cell),
            },String(cell.getDate()));
          })));
    }
    function CustomSnoozeModal({ count = 1, locale = 'en', returnFocusEl = null, onChoose, onCancel, onEditOptions, t }) {
      const idPrefix = React.useId();
      const [initial] = React.useState(() => new Date(Date.now() + 3600000));
      const nowMinute = useNowMinute();
      const today = startOfLocalDay(nowMinute * 60000);
      const [mode,setMode] = React.useState('date');
      const [date,setDate] = React.useState(initial);
      const [calendarOpen,setCalendarOpen] = React.useState(false);
      const [time,setTime] = React.useState(() => localSnoozeTime(initial));
      const [amount,setAmount] = React.useState('2');
      const [unit,setUnit] = React.useState('hours');
      const [error,setError] = React.useState('');
      const dialogRef = React.useRef(null);
      const dateBtnRef = React.useRef(null);
      const popoverRef = React.useRef(null);
      const previousFocusRef = React.useRef(null);
      const calendarOpenRef = React.useRef(calendarOpen);
      calendarOpenRef.current = calendarOpen;
      const onCancelRef = React.useRef(onCancel);
      onCancelRef.current = onCancel;
      const returnFocusRef = React.useRef(returnFocusEl);
      returnFocusRef.current = returnFocusEl;
      const closeDialog = React.useCallback((restoreFocus = true) => {
        const previous = previousFocusRef.current;
        onCancelRef.current?.();
        if (restoreFocus && previous?.isConnected) {
          queueMicrotask(() => { previous.focus?.({ preventScroll:true }); });
        }
      },[]);
      React.useEffect(() => {
        const active = returnFocusRef.current ?? (typeof document !== 'undefined' ? document.activeElement : null);
        previousFocusRef.current = active && typeof active.focus === 'function' && active !== document.body ? active : null;
        const focusable = dialogRef.current?.querySelector('.t3i-modal-panel button, .t3i-modal-panel input, .t3i-modal-panel select');
        focusable?.focus?.({ preventScroll:true });
        const onKey = (event) => {
          if (event.key === 'Tab') {
            const container = dialogRef.current;
            if (!container) return;
            const raw = [...container.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')];
            const list = raw.filter((el) => el.getAttribute('tabindex') !== '-1' && !el.closest('[inert],[aria-hidden="true"]'));
            event.preventDefault();
            event.stopPropagation();
            if (!list.length) return;
            const active = typeof document !== 'undefined' ? document.activeElement : null;
            const first = list[0];
            const last = list[list.length - 1];
            const idx = list.indexOf(active);
            if (idx === -1) (event.shiftKey ? last : first).focus?.({ preventScroll:true });
            else if (event.shiftKey && idx === 0) last.focus?.({ preventScroll:true });
            else if (!event.shiftKey && idx === list.length - 1) first.focus?.({ preventScroll:true });
            else list[event.shiftKey ? idx - 1 : idx + 1]?.focus?.({ preventScroll:true });
            return;
          }
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          if (calendarOpenRef.current) {
            setCalendarOpen(false);
            dateBtnRef.current?.focus?.({ preventScroll:true });
            return;
          }
          closeDialog(true);
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
      },[closeDialog]);
      React.useEffect(() => {
        if (!calendarOpen) return undefined;
        const onPointerDown = (event) => {
          if (popoverRef.current?.contains(event.target) || dateBtnRef.current?.contains(event.target)) return;
          setCalendarOpen(false);
        };
        window.addEventListener('pointerdown', onPointerDown, true);
        return () => window.removeEventListener('pointerdown', onPointerDown, true);
      },[calendarOpen]);
      const stepDuration = (delta) => {
        const cur = Number(amount);
        const next = Math.max(0, (Number.isFinite(cur) ? cur : 0) + delta);
        setAmount(String(next));
        setError('');
      };
      let formattedDate = localSnoozeDate(date);
      try { formattedDate = date.toLocaleDateString(locale || undefined, { month:'short', day:'numeric', year:'numeric' }); } catch {}
      const content = h('div',{className:'t3i-modal-backdrop',role:'presentation',onMouseDown:(event) => { if (event.target === event.currentTarget) closeDialog(true); }},
        h('div',{ref:dialogRef,className:'t3i-modal',role:'dialog','aria-modal':'true','aria-label':t('customSnoozeDialog'),'data-shortcut-modal':'t3i-custom-snooze'},
          h('form',{style:{display:'flex',minHeight:0,flexDirection:'column'},onSubmit:(event) => {
            event.preventDefault();
            const resolved = resolveCustomSnooze(mode === 'date' ? { mode:'date', dateStr:localSnoozeDate(date), time } : { mode:'duration', amount, unit }, t);
            if (resolved.error) { setError(resolved.error); return; }
            onChoose(resolved.until);
          }},
            h('div',{className:'t3i-modal-header'},
              h('h3',{className:'t3i-modal-title'},t('customSnoozeDialog')),
              h('p',{className:'t3i-modal-help'},count > 1 ? t('customSnoozeBatchHelp', { count }) : t('customSnoozeHelp')),
              h('button',{type:'button',className:'t3i-modal-close','aria-label':t('close'),title:t('close'),onClick:() => closeDialog(true)},h(Icon,{name:'close',size:16}))),
            h('div',{className:'t3i-modal-panel'},
              h('div',{className:'t3i-custom-snooze'},
                h('div',{className:'t3i-custom-modes',role:'group','aria-label':t('customSnoozeTitle')},
                  h('button',{type:'button',className:'t3i-mode-chip','data-active':String(mode === 'date'),onClick:() => { setMode('date'); setError(''); }},t('snoozeModeDate')),
                  h('button',{type:'button',className:'t3i-mode-chip','data-active':String(mode === 'duration'),onClick:() => { setMode('duration'); setCalendarOpen(false); setError(''); }},t('snoozeModeDuration'))),
                mode === 'date'
                  ? h('div',{className:'t3i-custom-grid'},
                      h('div',{className:'t3i-custom-field'},
                        h('label',{className:'t3i-custom-snooze-title',htmlFor:`${idPrefix}-date`},t('snoozeDateLabel')),
                        h('button',{ref:dateBtnRef,id:`${idPrefix}-date`,type:'button',className:'t3i-date-trigger','aria-haspopup':'dialog','aria-expanded':calendarOpen,onClick:() => setCalendarOpen((open) => !open)},
                          h('span',null,formattedDate),
                          h(Icon,{name:'calendar',size:16})),
                        calendarOpen ? h('div',{ref:popoverRef,className:'t3i-calendar-popover',role:'dialog','aria-label':t('chooseSnoozeDate')},
                          h(MonthCalendar,{selected:date,today,locale,t,onSelect:(picked) => {
                            setDate(picked);
                            setCalendarOpen(false);
                            setError('');
                            dateBtnRef.current?.focus?.({ preventScroll:true });
                          }})) : null),
                      h('label',{className:'t3i-custom-field',htmlFor:`${idPrefix}-time`},
                        h('span',{className:'t3i-custom-snooze-title'},t('snoozeTimeLabel')),
                        h('input',{
                          id:`${idPrefix}-time`,type:'time',required:true,className:'t3i-custom-snooze-input',value:time,
                          onChange:(event) => { setTime(event.target.value); setError(''); },
                        })))
                  : h('div',{className:'t3i-custom-grid'},
                      h('div',{className:'t3i-custom-field'},
                        h('label',{className:'t3i-custom-snooze-title',htmlFor:`${idPrefix}-amount`},t('snoozeAmount')),
                        h('div',{className:'t3i-number-field'},
                          h('button',{type:'button',className:'t3i-number-step','aria-label':t('decreaseDuration'),disabled:Number(amount) <= 0,onClick:() => stepDuration(-1)},'−'),
                          h('input',{
                            id:`${idPrefix}-amount`,type:'number',min:'0',step:'any',required:true,className:'t3i-number-input',value:amount,
                            onChange:(event) => { setAmount(event.target.value); setError(''); },
                            onKeyDown:(event) => {
                              if (event.key === 'ArrowUp') { event.preventDefault(); stepDuration(1); }
                              else if (event.key === 'ArrowDown') { event.preventDefault(); stepDuration(-1); }
                            },
                          }),
                          h('button',{type:'button',className:'t3i-number-step','aria-label':t('increaseDuration'),onClick:() => stepDuration(1)},'+'))),
                      h('label',{className:'t3i-custom-field',htmlFor:`${idPrefix}-unit`},
                        h('span',{className:'t3i-custom-snooze-title'},t('snoozeUnit')),
                        h('select',{id:`${idPrefix}-unit`,className:'t3i-custom-snooze-input',value:unit,onChange:(event) => { setUnit(event.target.value); setError(''); }},
                          h('option',{value:'minutes'},t('unitMinutes')),
                          h('option',{value:'hours'},t('unitHours')),
                          h('option',{value:'days'},t('unitDays'))))),
                error ? h('p',{className:'t3i-custom-snooze-error',role:'alert'},error) : null)),
            h('div',{className:'t3i-modal-footer'},
              h('button',{type:'button',className:'t3i-modal-edit-options',onClick:() => { if (!onEditOptions?.()) setError(t('snoozeOpenSettingsFailed')); }},
                h(Icon,{name:'sliders',size:14}),
                h('span',null,t('editSnoozeOptions'))),
              h('button',{type:'button',className:'t3i-modal-btn',onClick:() => closeDialog(true)},t('customSnoozeCancel')),
              h('button',{type:'submit',className:'t3i-modal-btn','data-primary':'true'},t('customSnoozeConfirm'))))));
      if (typeof document !== 'undefined' && document.body) {
        return require('react-dom').createPortal(content, document.body);
      }
      return content;
    }

    /** Self-ticking working duration — mirrors T3 `formatWorkingDurationLabel`. */
    function formatElapsed(ms, locale = 'en', t = null) {
      const seconds = Number.isFinite(ms) ? Math.max(0, Math.floor(ms/1000)) : 0;
      if (seconds < 60) return resolveLocalized(t, locale, 'elapsedSeconds', { count: seconds });
      const minutes = Math.floor(seconds/60);
      if (minutes < 60) return resolveLocalized(t, locale, 'elapsedMinutes', { count: minutes });
      return resolveLocalized(t, locale, 'elapsedHoursMinutes', { hours: Math.floor(minutes/60), minutes: minutes%60 });
    }
    function WorkingDuration({ startedAt, locale = 'en', t = null }) {
      const [,tick] = React.useState(0);
      React.useEffect(() => {
        const timer = setInterval(() => tick((value) => value + 1),1000);
        return () => clearInterval(timer);
      },[]);
      if (!Number.isFinite(startedAt)) return null;
      return h('span',{className:'t3i-status-time'},formatElapsed(Date.now() - startedAt, locale, t));
    }

    /**
     * Desktop Client ModuleLoader only resolves inject + package.json "external"
     * (currently zod). `dsh-t3-inbox/model` is not on that path, so production uses
     * the local algorithm below. Optional shared require is diagnostic-only.
     */
    const sharedDeriveCardStatus = (() => {
      try { return require('dsh-t3-inbox/model').deriveCardStatus; } catch { return null; }
    })();
    const cardStatusSource = typeof sharedDeriveCardStatus === 'function' ? 'shared' : 'local';
    /** Mirrors lib/model.js deriveCardStatus (Desktop may not resolve the shared export). */
    function isCardSnoozed(card) {
      return Boolean((card?.snoozed || card?.section === 'snoozed') && !card?.woke);
    }
    function isCardActivelyWorking(card) {
      return Boolean(
        card?.running
        || (card?.section === 'working' && card?.running !== false && !card?.workingGrace),
      );
    }
    function resolvePendingOverlay() {
      try { return require('dsh-t3-inbox/model').applyClientPendingOverlay; } catch { return null; }
    }
    function resolveRunningOverlay() {
      try { return require('dsh-t3-inbox/model').applyClientRunningOverlay; } catch { return null; }
    }
    function localPendingOverlay(card, pendingInteraction) {
      const kind = pendingInteraction === 'approval' || pendingInteraction === 'plan-review' ? 'approval' : pendingInteraction === 'question' ? 'question' : null;
      if (!kind) return card;
      if (card.snoozed || card.section === 'snoozed' || card.snoozeEffect?.active) return card;
      const pending = Array.isArray(card.pending) ? [...card.pending] : [];
      if (!pending.some((item) => item.kind === kind)) pending.push({ sessionId:card.sessionId, kind, identity:null });
      let section = card.section;
      if (section === 'working' || section === 'snoozed') section = 'active';
      return { ...card, pending, needsYou:true, pendingCount:Math.max(card.pendingCount ?? 0, pending.length), section };
    }
    function localRunningOverlay(card, sessions) {
      if (!card || !card.running) return card;
      if (!sessions || sessions.phase === 'pending') return card;
      const summary = sessions.byId?.[card.sessionId];
      if (summary?.running !== false) return card;
      if (card.runtime?.queue?.length > 0) return card;
      const children = Array.isArray(card.members) ? card.members.slice(1) : [];
      const childRunning = children.some((member) => {
        const childSummary = sessions.byId?.[member?.sessionId];
        return Boolean(
          childSummary?.running === true
          || member?.runtime?.running
          || member?.runtime?.queue?.length
          || (member?.progress?.turn && !member.progress.turn.end),
        );
      });
      if (childRunning) {
        const waiting = !card.needsYou;
        return card.waiting === waiting ? card : { ...card, waiting };
      }
      const section = card.section === 'working' ? 'active' : card.section;
      return { ...card, running:false, waiting:false, section };
    }
    function buildOptimisticCardEntry(card, kind, { until = null, wasPinned = false, now = Date.now(), token = crypto.randomUUID() } = {}) {
      if (!card) return null;
      const baseRevision = card.revision ?? 0;
      if (kind === 'settle') {
        return {
          token,
          baseRevision,
          patch: {
            section:'settled', settled:true, settledOverride:'settled', settledAt:now, unsettledAt:null,
            snooze:null, snoozed:false, snoozeUntil:null,
            snoozeEffect:{ active:false, woke:false, deferExceptions:false, reason:'none' },
            woke:false, canSettle:false,
            ...(wasPinned ? { pinned:false } : {}),
          },
        };
      }
      if (kind === 'restore') {
        return {
          token,
          baseRevision,
          patch: {
            section:'active', settled:false, settledOverride:'active', settledAt:null, unsettledAt:now,
            snooze:null, snoozed:false, snoozeUntil:null,
            snoozeEffect:{ active:false, woke:false, deferExceptions:false, reason:'none' },
            woke:false, canSettle:true,
          },
        };
      }
      if (kind === 'snooze') {
        if (typeof until !== 'string' || !Number.isFinite(Date.parse(until))) return null;
        return {
          token,
          baseRevision,
          patch: {
            section:'snoozed', settled:false, settledOverride:null, settledAt:null,
            snooze:{ ...(card.snooze ?? {}), until }, snoozed:true, snoozeUntil:until,
            snoozeEffect:{ active:true, woke:false, deferExceptions:true, reason:'snoozed' },
            woke:false,
          },
        };
      }
      if (kind === 'wake') {
        return {
          token,
          baseRevision,
          patch: {
            section:'active', snooze:null, snoozed:false, snoozeUntil:null,
            snoozeEffect:{ active:false, woke:false, deferExceptions:false, reason:'none' },
            woke:false,
          },
        };
      }
      if (kind === 'mark-unread') {
        return { token, baseRevision, patch:{ manualUnread:true, unreadAt:now, newResult:true } };
      }
      if (kind === 'clear-unread') {
        return { token, baseRevision, patch:{ manualUnread:false, unreadAt:null } };
      }
      return null;
    }
    function enrichCard(card, workspaces, sessions, phase, applyPendingOverlay, applyRunningOverlay, optimisticCards = null) {
      if (!card) return null;
      const pinnedIds = workspaces?.pinnedSessionIds ?? workspaces?.pinnedIds ?? [];
      const archivedIds = workspaces?.archivedSessionIds ?? [];
      const summary = sessions?.byId?.[card.sessionId];
      const base = {
        ...card,
        pinned:pinnedIds.includes(card.sessionId),
        archived:archivedIds.includes(card.sessionId),
        title:summary?.title ?? card.title,
        workspaceTitle:workspaces?.items?.find((workspace) => workspace.workspaceId === card.workspaceId)?.title ?? card.workspaceTitle,
        canSettle:phase === 'ready' && card.canSettle,
        canSnooze:phase === 'ready' && card.canSnooze,
      };
      const overlay = typeof applyPendingOverlay === 'function' ? applyPendingOverlay : localPendingOverlay;
      const withPending = overlay(base, summary?.pendingInteraction);
      const runningOverlay = typeof applyRunningOverlay === 'function' ? applyRunningOverlay : localRunningOverlay;
      const enriched = runningOverlay(withPending, sessions);
      const optimistic = optimisticCards?.[card.sessionId];
      if (optimistic && optimistic.baseRevision === card.revision) {
        return { ...enriched, ...optimistic.patch };
      }
      return enriched;
    }
    function mapFriendlyError(kind, raw, t, { code = null, status = null, cardPinned = false, unavailableKey = null } = {}) {
      const titleByKind = {
        settle:t('errSettleTitle'), restore:t('errUnsettleTitle'), snooze:t('errSnoozeTitle'), wake:t('errWakeTitle'),
        'mark-unread':t('errUnreadTitle'), 'clear-unread':t('errUnreadTitle'),
        pin:cardPinned ? t('errPinTitle') : t('errUnpinTitle'), undo:t('errUndoTitle'),
        rename:t('errRenameTitle'), archive:t('errArchiveTitle'),
        'add-project':t('errAddProjectTitle'), refresh:t('errRefreshTitle'),
      };
      const title = kind === 'shortcut' && unavailableKey ? t(unavailableKey) : (titleByKind[kind] ?? t('actionFailed'));
      const rawText = raw instanceof Error ? raw.message : typeof raw === 'string' ? raw : '';
      let description = null;
      if (code === 'snooze-time-passed') description = t('snoozeTimePassed');
      else if (code === 'session-missing' || status === 'not-found') description = t('errSessionMissing');
      else if (kind === 'refresh') description = t('errRefreshDesc');
      else if (status === 'stale' || status === 'stale-revision' || status === 'expired' || /expired|stale|revision|context/i.test(rawText)) description = t('errStaleContext');
      else if (status === 'busy' || /\b(running|busy)\b/i.test(rawText)) description = t('settleBusy');
      else if (status === 'needs-input' || /needsYou|pending.*interaction|\binput\b|\bapproval\b/i.test(rawText)) description = t('settleNeedsYou');
      else if (kind !== 'shortcut') description = t('errActionGeneric');
      return { title, description, message:description ?? title };
    }
    function localDeriveCardStatus(card, unread = card.newResult) {
      const reason = card.result?.reason?.kind;
      const failed = reason === 'error' || reason === 'blocked';
      const limited = reason === 'max-tokens';
      if (card.needsYou) {
        const pendingKinds = new Set((card.pending ?? []).map((item) => item.kind));
        const approval = pendingKinds.has('approval');
        /* T3 TopStatusIcon for input = MessageCircleQuestion */
        return { icon:approval ? 'shield' : 'message', label:approval ? 'approval' : 'needsYou', tone:approval ? 'approval' : 'input' };
      }
      /* T3 snoozed rows paint snoozeWakeLabel, not Working — even if runtime still looks running. */
      if ((card.snoozed || card.section === 'snoozed') && !card.woke) return null;
      /* Active work overrides a stale failed/limited result or prior woke state. */
      if (card.waiting) return { icon:'dotdashed', label:'waiting', tone:'waiting' };
      if (isCardActivelyWorking(card)) return { icon:'dashed', label:'working', tone:'working' };
      if (failed || card.treeError) return { icon:'alert', label:'failed', tone:'failed' };
      if (limited) return { icon:'alert', label:'limited', tone:'limited' };
      if (card.woke) return { icon:'alarm', label:'woke', tone:'woke' };
      if (unread) return { icon:'checkcircle', label:'done', tone:'done' };
      return null;
    }
    function cardStatus(card, unread = card.newResult) {
      return cardStatusSource === 'shared' ? sharedDeriveCardStatus(card, unread) : localDeriveCardStatus(card, unread);
    }
    /** Single Idle/Done corner decision used by SessionCard and exposed on runtime. */
    function cardCornerMeta(card, unread) {
      /* Active snooze: StatusSlot owns wake remaining; suppress relative-time twin. */
      if ((card.snoozed || card.section === 'snoozed') && !card.woke) {
        return { unread, status:null, statusLabel:null, showRelativeTime:false, source:cardStatusSource };
      }
      const status = cardStatus(card, unread);
      return { unread, status, statusLabel:status?.label ?? null, showRelativeTime:status == null, source:cardStatusSource };
    }
    function cardStartedAt(card) {
      const turnStart = card.progress?.turn?.start?.time;
      if (Number.isFinite(turnStart)) return turnStart;
      if (Number.isFinite(card.runtime?.startedAt)) return card.runtime.startedAt;
      if (Number.isFinite(card.progress?.latestWork?.time)) return card.progress.latestWork.time;
      return null;
    }
    /** T3 Code snoozeWakeLabel: AlarmClock + time remaining until wake. */
    function formatWakeRemaining(ms, locale = 'en', t = null) {
      if (ms <= 0) return resolveLocalized(t, locale, 'wakeNowLabel');
      const minutes = Math.max(1, Math.ceil(ms/60000));
      if (minutes < 60) return resolveLocalized(t, locale, 'wakeMinutes', { count: minutes });
      const hours = Math.ceil(ms/3600000);
      if (hours < 24) return resolveLocalized(t, locale, 'wakeHours', { count: hours });
      return resolveLocalized(t, locale, 'wakeDays', { count: Math.ceil(ms/86400000) });
    }
    function snoozeWakeRemaining(card, locale = 'en', t = null) {
      const until = Date.parse(card.snooze?.until ?? '');
      if (!Number.isFinite(until)) return null;
      return formatWakeRemaining(until - Date.now(), locale, t);
    }
    /**
     * T3 `shouldRecedeSidebarThread`: Working/waiting recede; ready/approval recede when
     * not unread and not woke; never recede Input/request/selected/active route.
     */
    function shouldRecedeCard(card, unread, current, failed, selected = false, swept = false) {
      if (current || selected || swept || card.woke || failed || card.treeError) return false;
      const pendingKinds = (card.pending ?? []).map((item) => item.kind);
      const isInput = card.needsYou && pendingKinds.some((kind) => kind === 'question' || kind === 'user_input' || kind === 'ask');
      const isApproval = card.needsYou && pendingKinds.some((kind) => kind === 'approval');
      /* T3: input/request never recede; approval may recede when read. */
      if (isInput || (card.needsYou && !isApproval)) return false;
      if (card.section === 'working' && !card.workingGrace) return true;
      if (card.section === 'snoozed') return Boolean(card.running || !unread);
      if (card.section === 'active' || card.section === 'pinned' || card.workingGrace) return !unread;
      return false;
    }
    function StatusSlot({ card, t, locale = 'en', unread, status:statusProp, onAckWoke }) {
      const wake = card.section === 'snoozed' ? snoozeWakeRemaining(card, locale, t) : null;
      if (wake) {
        return h('span',{className:'t3i-status','data-tone':'woke',title:t('snoozed')},
          h(Icon,{name:'alarm',size:16}), h('span',null,wake));
      }
      const status = statusProp === undefined ? cardStatus(card, unread) : statusProp;
      if (!status) return null;
      /* T3: Woke is a dismiss button (ack without opening the session). */
      if (status.tone === 'woke' && typeof onAckWoke === 'function') {
        return h(TooltipButton,{type:'button',className:'t3i-status','data-tone':'woke','aria-label':t('dismissWoke'),tooltip:t('dismissWoke'),
          onClick:(event) => { event.preventDefault(); event.stopPropagation(); onAckWoke(); }},
          h(Icon,{name:'alarm',size:16}), h('span',{role:'status'},t(status.label)));
      }
      const waitingStartedAt = status.tone === 'waiting'
        ? (card.members?.[0]?.progress?.turn?.end?.time ?? card.progress?.turn?.end?.time ?? cardStartedAt(card))
        : cardStartedAt(card);
      return h('span',{className:'t3i-status','data-tone':status.tone},
        h(Icon,{name:status.icon,size:16}),
        h('span',null,t(status.label)),
        (status.tone === 'working' || status.tone === 'waiting') ? h(WorkingDuration,{startedAt:waitingStartedAt,locale,t}) : null);
    }


    function SessionCard(props) {
      const { card, compact = false } = props;
      const isCompact = !card.pinned && (compact || card.section === 'settled' || isCardSnoozed(card));
      return h(SessionCardRow, { key: isCompact ? 'compact' : 'card', ...props, isCompact });
    }

    function SessionCardRow({ card, compact = false, isCompact: isCompactProp, selected = false, sweepAction = null, jumpLabel = null, rowDrag = null, onBatchContextMenu = null, onSweepStart = null, portalRootRef = null, usePanelInfo, runtime, t }) {
      const [menu,setMenu] = React.useState(false);
      const [contextMenu,setContextMenu] = React.useState(null);
      const [contextSnooze,setContextSnooze] = React.useState(false);
      const [renaming,setRenaming] = React.useState(false);
      const [draftTitle,setDraftTitle] = React.useState(card.title);
      const rootRef = React.useRef(null);
      const menuRef = React.useRef(null);
      const rowRef = React.useRef(null);
      const renameInputRef = React.useRef(null);
      const renameCommittedRef = React.useRef(false);
      const inlineRef = React.useRef(null);
      const triggerRef = React.useRef(null);
      const submenuRef = React.useRef(null);
      const submenuTriggerRef = React.useRef(null);
      const focusSubmenu = React.useRef(false);
      const menuId = React.useId();
      const submenuId = React.useId();
      usePanelInfo((value) => value);
      const current = runtime.store.getSnapshot().currentSessionId === card.sessionId && runtime.store.getSnapshot().panelKey === 'conversation';
      const pending = runtime.store.getSnapshot().pendingActions[card.sessionId] > 0;
      const reason = card.result?.reason?.kind;
      const isSnoozed = isCardSnoozed(card);
      const isWorking = !card.needsYou && !isSnoozed && isCardActivelyWorking(card);
      const limited = !isWorking && reason === 'max-tokens';
      const failed = !isWorking && (reason === 'error' || reason === 'blocked');
      const activeTreeError = isWorking ? null : card.treeError;
      const unread = runtime.isUnread(card);
      const corner = cardCornerMeta(card, unread);
      const tone = card.needsYou || failed || activeTreeError || limited ? (failed || activeTreeError) ? 'error' : 'attention' : isWorking ? 'working' : unread ? 'done' : 'idle';
      /* Aria meta follows T3 topStatus XOR time — never announce Idle (quiet shell).
         Snoozed rows announce wake remaining (not Working while runtime still runs). */
      const locale = runtime.locale();
      const wakeRemain = isSnoozed ? snoozeWakeRemaining(card, locale, t) : null;
      const status = activeTreeError ?? (wakeRemain ? wakeRemain : (corner.statusLabel ? t(corner.statusLabel) : null));
      const nowMinute = useNowMinute();
      const time = relativeTime((!card.pinned && card.section === 'settled') ? cardSettledAt(card) : cardActivityAt(card), nowMinute * 60000, locale, t);
      const ws = workspaceInfo(card);
      const meta = [ws.name, status, corner.showRelativeTime ? time : null].filter(Boolean).join(' · ');
      const viewState = runtime.store.getSnapshot();
      const workingShelfEnabled = viewState.workingShelfEnabled !== false;
      const timeFormat = viewState.timeFormat || 'locale';
      const selectedWorkspaces = viewState.workspaceIds?.length ? viewState.workspaceIds : (viewState.workspaceId ? [viewState.workspaceId] : []);
      const filteredByThisWorkspace = Boolean(card.workspaceId && selectedWorkspaces.includes(card.workspaceId));
      const isSettled = !card.pinned && card.section === 'settled';
      const canSettleClick = settleClickable(card, pending);
      const canSnoozeClick = snoozeClickable(card, pending);
      const canMarkUnreadClick = canMarkUnreadCard(card, pending);
      const canRename = Boolean(typeof runtime.renameSession === 'function' && !card.archived && card.accessible !== false);
      const settleHint = actionDisableHint(card, 'settle', { pending }, t);
      const snoozeHint = actionDisableHint(card, 'snooze', { pending }, t);
      const restoreHint = actionDisableHint(card, isSettled ? 'restore' : isSnoozed ? 'wake' : 'settle', { pending }, t);
      const shelf = card.pinned ? 'pinned' : (!workingShelfEnabled && card.section === 'working') ? 'active' : card.section;
      const draggable = shelf !== 'working' && card.section !== 'working' && !card.running && !card.waiting;
      const { preview, previewRef, showPreview, hidePreview } = useThreadPreview(rowRef, card.sessionId);
      const startRename = React.useCallback(() => {
        if (!canRename) return;
        hidePreview({ force:true });
        renameCommittedRef.current = false;
        setDraftTitle(card.title);
        setRenaming(true);
      }, [canRename, card.title, hidePreview]);
      const commitRename = React.useCallback(() => {
        if (renameCommittedRef.current) return;
        renameCommittedRef.current = true;
        setRenaming(false);
        const nextTitle = draftTitle.trim();
        if (!nextTitle || nextTitle === card.title) return;
        void runtime.renameSession?.(card, nextTitle);
      }, [draftTitle, card, runtime]);
      const cancelRename = React.useCallback(() => {
        renameCommittedRef.current = true;
        setRenaming(false);
        setDraftTitle(card.title);
        queueMicrotask(() => { rowRef.current?.focus?.({ preventScroll:true }); });
      }, [card.title]);
      React.useEffect(() => {
        if (!renaming) return;
        const input = renameInputRef.current;
        if (!input) return;
        input.focus?.({ preventScroll:true });
        input.select?.();
      }, [renaming]);
      const dragHandlers = draggable && rowDrag?.onMouseDown ? {
        onMouseDown:(event) => {
          if (renaming || event.target?.closest?.('.t3i-rename-input')) return;
          hidePreview({ fromPointer:true });
          rowDrag.onMouseDown(card, shelf, event);
        },
      } : {};
      const chooseSnooze = (preset) => {
        const until = pickSnoozePreset(preset);
        setMenu(false); setContextMenu(null); setContextSnooze(false);
        if (until === null) {
          if (runtime.reportError) runtime.reportError('snooze', null, { code:'snooze-time-passed' });
          else runtime.store.set({actionError:t('snoozeTimePassed')});
          return;
        }
        void runtime.act(card,'snooze',{until:new Date(until).toISOString()});
      };
      const openCustomSnooze = () => {
        const returnFocusEl = menu ? triggerRef.current : (contextMenu ? rowRef.current : (typeof document !== 'undefined' ? document.activeElement : null));
        setMenu(false); setContextMenu(null); setContextSnooze(false); hidePreview({ force:true });
        runtime.openCustomSnooze?.(card.sessionId, returnFocusEl);
      };
      const closeContext = () => { setContextMenu(null); setContextSnooze(false); };
      const openContext = (event) => {
        event.preventDefault();
        hidePreview({ force:true });
        const bounds = event.currentTarget.getBoundingClientRect();
        const rawX = event.clientX || bounds.left + 24;
        const rawY = event.clientY || bounds.top + 16;
        setMenu(false); setContextSnooze(false);
        if (selected && onBatchContextMenu) { setContextMenu(null); onBatchContextMenu(card, { x:rawX, y:rawY }); return; }
        if (runtime.openSessionMenu?.(card, { x:rawX, y:rawY })) { setContextMenu(null); return; }
        setContextMenu({x:Math.min(rawX,window.innerWidth-180),y:Math.min(rawY,window.innerHeight-180),side:rawX > window.innerWidth-350 ? 'left' : 'right'});
      };
      React.useEffect(() => {
        if (!menu && !contextMenu) return;
        const pointer = (event) => { if (!rootRef.current?.contains(event.target) && !inlineRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) { setMenu(false); closeContext(); } };
        window.addEventListener('pointerdown',pointer,true);
        return () => window.removeEventListener('pointerdown',pointer,true);
      },[menu,contextMenu]);
      React.useEffect(() => { if (contextMenu) menuRef.current?.querySelector('button')?.focus(); },[contextMenu]);
      React.useLayoutEffect(() => {
        if (!menu) return;
        const popup = inlineRef.current, anchor = triggerRef.current;
        if (!popup || !anchor) return;
        const inheritedFont = window.getComputedStyle(rootRef.current).font;
        if (inheritedFont) popup.style.font = inheritedFont;
        const list = anchor.closest('.t3i-scroll');
        const place = () => {
          const rect = anchor.getBoundingClientRect();
          const bounds = list?.getBoundingClientRect();
          if (bounds && bounds.width > 0 && bounds.height > 0 &&
            (rect.bottom <= bounds.top || rect.top >= bounds.bottom || rect.right <= bounds.left || rect.left >= bounds.right)) {
            setMenu(false); return;
          }
          const margin = 16, gap = 4;
          const maxWidth = Math.max(0,window.innerWidth - margin*2);
          const maxHeight = Math.max(0,window.innerHeight - margin*2);
          const size = popup.getBoundingClientRect();
          const naturalHeight = Math.max(size.height,popup.scrollHeight + popup.offsetHeight - popup.clientHeight);
          const width = Math.min(size.width,maxWidth), height = Math.min(naturalHeight,maxHeight);
          const below = Math.max(0,window.innerHeight-margin-rect.bottom-gap);
          const above = Math.max(0,rect.top-gap-margin);
          const flip = height > below && above > below;
          const available = flip ? above : below;
          const actualHeight = Math.min(height,available || maxHeight);
          popup.style.maxHeight = `${actualHeight}px`;
          const left = Math.max(margin,Math.min(rect.right-width,window.innerWidth-margin-width));
          const desiredTop = flip ? rect.top-gap-actualHeight : rect.bottom+gap;
          const top = Math.max(margin,Math.min(desiredTop,window.innerHeight-margin-actualHeight));
          popup.style.left = `${left}px`; popup.style.top = `${top}px`; popup.style.visibility = 'visible';
        };
        const onScroll = (event) => { if (!event.target?.nodeType || !popup.contains(event.target)) place(); };
        place(); popup.focus();
        window.addEventListener('scroll',onScroll,true);
        window.addEventListener('resize',place);
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null;
        observer?.observe(anchor); observer?.observe(popup); if (list) observer?.observe(list);
        return () => { window.removeEventListener('scroll',onScroll,true); window.removeEventListener('resize',place); observer?.disconnect(); };
      },[menu]);
      React.useEffect(() => {
        if (contextSnooze && focusSubmenu.current) submenuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
        focusSubmenu.current = false;
      },[contextSnooze]);
      const navigateMenu = (event, container) => {
        if (['Enter',' '].includes(event.key)) { event.stopPropagation(); return; }
        if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const items = [...container.querySelectorAll(':scope > [role="menuitem"]:not(:disabled)')];
        if (!items.length) return;
        const index = items.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
          : index < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next].focus();
      };
      const closeInline = (event) => {
        if (event.key !== 'Escape') return false;
        event.preventDefault(); event.stopPropagation(); setMenu(false); triggerRef.current?.focus();
        return true;
      };
      const submenuKey = (event) => {
        if (event.key === 'Escape' || event.key === 'ArrowLeft') {
          event.preventDefault(); event.stopPropagation(); setContextSnooze(false); submenuTriggerRef.current?.focus(); return;
        }
        navigateMenu(event, event.currentTarget);
      };
      const contextKey = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault(); event.stopPropagation(); closeContext(); rowRef.current?.focus(); return;
        }
        if (event.key === 'ArrowRight' && event.target === submenuTriggerRef.current && !submenuTriggerRef.current.disabled) {
          event.preventDefault(); event.stopPropagation();
          if (contextSnooze) submenuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
          else { focusSubmenu.current = true; setContextSnooze(true); }
          return;
        }
        navigateMenu(event, event.currentTarget);
      };
      const isDragging = Boolean(rowDrag?.isDragging);
      const inlineDropVerb = isDragging && rowDrag?.dropVerb ? h('span',{className:'t3i-inline-drop-verb',role:'status'},
        h(Icon,{name:dropVerbIcon[rowDrag.dropVerb],size:12}),
        h('span',null,t(dropVerbLabel[rowDrag.dropVerb]))) : null;
      const showPin = card.pinned && (!isDragging || (rowDrag?.dragOverPinned && !rowDrag?.dropVerb));
      const isCompact = isCompactProp !== undefined ? isCompactProp : (!card.pinned && (compact || isSettled || isSnoozed));
      const primary = isSettled
        ? {icon:'restore',label:t('restore'),hint:restoreHint ?? undefined,disabled:pending || Boolean(card.treeError),action:() => runtime.act(card,'restore')}
        : isSnoozed
          ? {icon:isCompact ? 'alarmOff' : 'clock',label:isCompact ? t('wakeNow') : t('wake'),hint:restoreHint ?? t('wakeNow'),disabled:pending || Boolean(card.treeError),action:() => runtime.act(card,'wake')}
          : {icon:'check',label:t('settle'),hint:settleHint ?? t('settleSession'),disabled:!canSettleClick,action:() => runtime.act(card,'settle')};
      const hasMeta = Boolean(card.branch);
      const cardSweepAction = isSettled ? 'unsettle' : isSnoozed ? 'wake' : 'settle';
      const sweepBadge = sweepAction ? h('span',{className:'t3i-sweep-badge','aria-hidden':true},
        h(Icon,{name:sweepAction === 'settle' ? 'checkcircle' : sweepAction === 'unsettle' ? 'restore' : 'alarmOff',size:12}),
        h('span',null,t(sweepAction === 'settle' ? 'sweepSettle' : sweepAction === 'unsettle' ? 'sweepUnsettle' : 'sweepWake'))) : null;
      const jumpHintLabel = menu || sweepAction || isDragging ? null : jumpLabel;
      const jumpHint = jumpHintLabel ? h('kbd',{className:'t3i-jump-hint','data-jump-hint':'true','aria-hidden':true},jumpHintLabel) : null;
      const onActionPointerDown = (event) => {
        if (event.isPrimary === false || event.button !== 0 || primary.disabled || !onSweepStart) { event.stopPropagation(); return; }
        event.stopPropagation();
        onSweepStart(card, cardSweepAction, event);
      };
      const openRow = (event) => {
        if (renaming || rowDrag?.shouldSuppressClick?.()) return;
        if (event && isPrimaryModEvent(event, isMacPlatform(runtime.shortcuts))) {
          event.preventDefault();
          event.stopPropagation();
          runtime.toggleSelect?.(card.sessionId);
          return;
        }
        if (event?.shiftKey) {
          event.preventDefault();
          event.stopPropagation();
          runtime.rangeSelect?.(card.sessionId, runtime.orderedSessionIds?.() ?? []);
          return;
        }
        runtime.clearSelection?.(card.sessionId);
        runtime.openCard(card);
      };
      const sidebarParent = !card.pinned && ((workingShelfEnabled && card.section === 'working') || card.section === 'snoozed' || card.section === 'settled') ? card.section : undefined;
      const rowAriaLabel = [card.title, status, ws.name].filter(Boolean).join(', ');
      const titleNode = renaming
        ? h('input',{
            ref:renameInputRef,
            type:'text',
            className:'t3i-rename-input',
            'aria-label':t('threadTitle'),
            value:draftTitle,
            onChange:(event) => setDraftTitle(event.target.value),
            onClick:stopRow(),
            onDoubleClick:stopRow(),
            onMouseDown:(event) => event.stopPropagation(),
            onPointerDown:(event) => event.stopPropagation(),
            onBlur:() => commitRename(),
            onKeyDown:(event) => {
              event.stopPropagation();
              if (event.key === 'Enter') { event.preventDefault(); commitRename(); }
              else if (event.key === 'Escape') { event.preventDefault(); cancelRename(); }
            },
          })
        : h('span',{className:'t3i-row-title'},card.title);
      const rowProps = {
        ref:rowRef, role:'button', tabIndex:0, className:'t3i-row',
        'data-sidebar-row':`thread:${card.sessionId}`,
        'data-sidebar-parent':sidebarParent,
        'aria-current':current ? 'page' : undefined, 'aria-label':rowAriaLabel,
        onClick:openRow,
        onDoubleClick:canRename ? (event) => { event.preventDefault(); event.stopPropagation(); startRename(); } : undefined,
        onKeyDown:(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'F2' && canRename) {
            event.preventDefault();
            event.stopPropagation();
            startRename();
            return;
          }
          if (!['Enter',' '].includes(event.key)) return;
          event.preventDefault();
          runtime.clearSelection?.(card.sessionId);
          runtime.openCard(card);
        },
      };
      const contextMenuNode = contextMenu ? h('div',{ref:menuRef,className:'t3i-context-menu','data-side':contextMenu.side,role:'menu','aria-label':t('sessionActions'),onKeyDown:contextKey,style:{left:contextMenu.x,top:contextMenu.y},onBlur:() => { queueMicrotask(() => { if (menuRef.current && !menuRef.current.contains(document.activeElement)) closeContext(); }); }},
        h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:pending || card.archived,onClick:() => { closeContext(); void runtime.pin(card,!card.pinned); }},card.pinned ? t('unpin') : t('pin')),
        isSettled
          ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',title:restoreHint ?? undefined,disabled:pending || Boolean(card.treeError),onClick:() => { closeContext(); void runtime.act(card,'restore'); }},t('unsettleSession'))
          : h('button',{type:'button',role:'menuitem',className:'t3i-context-item',title:settleHint ?? undefined,disabled:!canSettleClick,onClick:() => { closeContext(); void runtime.act(card,'settle'); }},t('settleSession')),
        isSnoozed
          ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',title:restoreHint ?? undefined,disabled:pending || Boolean(card.treeError),onClick:() => { closeContext(); void runtime.act(card,'wake'); }},t('wakeSession'))
          : h('button',{ref:submenuTriggerRef,type:'button',role:'menuitem',className:'t3i-context-item','aria-haspopup':'menu','aria-controls':submenuId,'aria-expanded':contextSnooze,title:snoozeHint ?? undefined,disabled:!canSnoozeClick,onClick:(event) => { if (!contextSnooze && event.detail === 0) focusSubmenu.current = true; setContextSnooze(!contextSnooze); },onMouseEnter:() => setContextSnooze(true)},t('snoozeAction'),h(Icon,{name:'chevron',size:12,className:'t3i-menu-chevron'})),
        contextSnooze && !isSnoozed ? h('div',{id:submenuId,ref:submenuRef,className:'t3i-context-submenu',role:'menu',tabIndex:-1,'aria-label':t('snoozeSession'),onKeyDown:submenuKey},h(SnoozeChoices,{choose:chooseSnooze,onCustom:openCustomSnooze,t,locale,timeFormat,options:runtime.store.getSnapshot().remote?.snoozeSettings?.presets})) : null,
        !card.archived ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!canMarkUnreadClick,onClick:() => { closeContext(); void runtime.markUnread(card); }},t('markUnread')) : null,
        card.workspaceId ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',onClick:() => { closeContext(); runtime.setWorkspaceFilter(filteredByThisWorkspace ? [] : [card.workspaceId]); }},filteredByThisWorkspace ? t('showAllProjects') : t('filterBy').replace('{name}', ws.name)) : null) : null;
      const contextMenuPortalTarget = portalRootRef?.current ?? (typeof document !== 'undefined' ? document.body : null);
      return h(React.Fragment,null,
        h('li',{ref:rootRef,className:`t3i-item${rowDrag?.isPeer ? ' t3i-drag-peer' : ''}`,'data-variant':isCompact ? 'compact' : 'card','data-session-id':card.sessionId,'data-drag-item-id':card.sessionId,'data-section':card.pinned ? 'pinned' : card.section,'data-shelf':shelf,'data-working':corner.status?.tone === 'working' ? 'true' : undefined,'data-unread':unread ? 'true' : undefined,'data-selected':selected ? 'true' : undefined,'data-sweep':sweepAction ?? undefined,'data-has-meta':(!isCompact && hasMeta) ? 'true' : undefined,'data-drag-enabled':draggable ? 'true' : undefined,'data-drag-peer':rowDrag?.isPeer ? 'true' : undefined,'data-dragging':isDragging ? 'true' : undefined,'data-recede':shouldRecedeCard(card, unread, current, corner.status?.tone === 'failed' || corner.status?.tone === 'limited', selected, Boolean(sweepAction) || isDragging) ? 'true' : undefined,'data-failed-read':(corner.status?.tone === 'failed' && !unread && !card.woke) ? 'true' : undefined,style:rowDrag?.style,onContextMenu:openContext,onMouseEnter:(event) => { if (renaming || menu || contextMenu || isDragging) return; if (!closestTooltipTrigger(event?.target)) showPreview(); },onMouseOver:(event) => { if (renaming || menu || contextMenu || isDragging) return; if (event?.relatedTarget && rootRef.current?.contains(event.relatedTarget) && closestTooltipTrigger(event.relatedTarget) && !closestTooltipTrigger(event?.target)) showPreview(); },onMouseLeave:() => hidePreview({ fromPointer:true }),...dragHandlers},
          isCompact
            ? h('div',rowProps,
                h(Monogram,{card}),
                h('span',{className:'t3i-row-main'},
                  titleNode),
                isDragging ? inlineDropVerb : h('span',{className:'t3i-slim-slot','data-jump':jumpHint ? 'true' : undefined},
                  isSnoozed && wakeRemain
                    ? h('span',{className:'t3i-slim-wake','aria-hidden':true},h(Icon,{name:'alarm',size:12}),h('span',null,wakeRemain))
                    : (time ? h('span',{className:'t3i-row-time','aria-hidden':true},time) : null),
                  h(TooltipButton,{type:'button',className:'t3i-slim-action','aria-label':primary.label,tooltip:primary.hint ?? primary.label,disabled:primary.disabled,onClick:stopRow(primary.action),onPointerDown:onActionPointerDown},
                    h(Icon,{name:primary.icon,size:primary.icon === 'restore' ? 14 : 12})),
                  jumpHint,
                  sweepBadge))
            : h('div',rowProps,
                h('span',{className:'t3i-card-top'},
                  h('span',{className:'t3i-ws'},
                    h(Monogram,{card}),
                    showPin ? h(TooltipButton,{type:'button',className:'t3i-pin','aria-label':resolveLocalized(t, locale, 'unpinThread'),tooltip:resolveLocalized(t, locale, 'unpinThread'),
                      onClick:(event) => { event.preventDefault(); event.stopPropagation(); void runtime.pin(card,false); }},
                      h(Icon,{name:'pin',size:12,className:'t3i-pin-on'}),
                      h(Icon,{name:'pinOff',size:12,className:'t3i-pin-off'})) : null,
                    h('span',{className:'t3i-ws-name'},ws.name)),
                  h('span',{className:'t3i-card-meta'},
                    isDragging ? inlineDropVerb : h('span',{className:'t3i-status-slot','data-open':String(menu),'data-jump':jumpHint ? 'true' : undefined},
                      h('span',{className:'t3i-status-slot-label','data-interactive':corner.status?.tone === 'woke' ? 'true' : undefined},
                        h(StatusSlot,{card,t,locale,unread,status:corner.status,onAckWoke:() => void runtime.act(card,'ack-woke')}),
                        corner.showRelativeTime && time ? h('span',{className:'t3i-row-time','aria-hidden':true},time) : null),
                      h('span',{className:'t3i-status-slot-actions'},
                        !isSnoozed ? h(SnoozeAction,{label:t('snoozeSession'),hint:snoozeHint ?? t('snoozeSession'),disabled:!canSnoozeClick,expanded:menu,controls:menuId,buttonRef:triggerRef,onKeyDown:(event) => { if (menu) closeInline(event); },onClick:stopRow(() => { hidePreview({ force:true }); setMenu(!menu); })}) : null,
                        h(PrimaryAction,{...primary,onPointerDown:onActionPointerDown,onClick:stopRow(primary.action)})),
                      jumpHint,
                      sweepBadge))),
                h('span',{className:'t3i-card-bottom'},
                  h('span',{className:'t3i-row-main'},titleNode)),
                hasMeta ? h('span',{className:'t3i-card-meta-line','aria-hidden':true},
                  h('span',{className:'t3i-card-meta-branch',title:card.worktree && card.branch ? resolveLocalized(t, locale, 'worktreeLabel', {branch:card.branch}) : undefined},
                    card.worktree ? h(Icon,{name:'folderGit2',size:14,className:'t3i-card-meta-worktree-icon'}) : null,
                    h('span',{className:'t3i-card-meta-branch-text'},h(MiddleTruncate,{value:card.branch,title:false})))) : null)),
        menu ? require('react-dom').createPortal(h('div',{id:menuId,ref:inlineRef,className:'t3i-snooze-menu',style:{visibility:'hidden'},role:'menu',tabIndex:-1,'aria-label':t('snoozeSession'),onKeyDown:(event) => { if (!closeInline(event)) navigateMenu(event,event.currentTarget); }},h(SnoozeChoices,{choose:chooseSnooze,onCustom:openCustomSnooze,t,locale,timeFormat,options:runtime.store.getSnapshot().remote?.snoozeSettings?.presets})),document.body) : null,
        contextMenuNode ? (contextMenuPortalTarget ? require('react-dom').createPortal(contextMenuNode, contextMenuPortalTarget) : contextMenuNode) : null,
        !renaming && !menu && !contextMenu && !isDragging ? h(ThreadHoverPreview,{card,preview,previewRef,ws,t}) : null);
    }

    function ErrorToast({ toast, runtime, t }) {
      React.useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => runtime.dismissError(toast.id), 6000);
        return () => clearTimeout(timer);
      }, [toast?.id, runtime]);
      if (!toast) return null;
      const content = h('div',{className:'t3i-toast-viewport'},
        h('div',{key:toast.id,className:'t3i-toast',role:'alert','aria-live':'assertive'},
          h('span',{className:'t3i-toast-icon'},h(Icon,{name:'alert',size:16})),
          h('div',{className:'t3i-toast-body'},
            h('div',{className:'t3i-toast-title'},toast.title),
            toast.description ? h('div',{className:'t3i-toast-desc'},toast.description) : null),
          h('button',{type:'button',className:'t3i-toast-close','aria-label':t('dismiss'),onClick:() => runtime.dismissError(toast.id)},h(Icon,{name:'close',size:14}))));
      if (typeof document !== 'undefined' && document.body) {
        return require('react-dom').createPortal(content, document.body);
      }
      return content;
    }

    function DragBoundary({ marker, label, target = false, style = undefined }) {
      return h('li',{
        className:'t3i-drag-boundary t3i-drag-peer',
        'data-drag-item-id':sidebarMarkerId(marker),
        'data-testid':`sidebar-${marker}`,
        'data-target':target ? 'true' : undefined,
        style,
        'aria-hidden':true,
      },
        h('div',{className:'t3i-drag-boundary-label'},
          h('span',{className:'t3i-drag-boundary-text'},label),
          h('span',{className:'t3i-drag-boundary-line'})));
    }

    function DropPlaceholder({ marker, label, hidden = true, target = false, revealOverflow = false, style = undefined }) {
      const boxRef = React.useRef(null);
      React.useEffect(() => {
        if (!hidden && target && revealOverflow && typeof boxRef.current?.scrollIntoView === 'function') {
          try { boxRef.current.scrollIntoView({ block:'nearest', inline:'nearest' }); } catch {}
        }
      },[hidden, target, revealOverflow]);
      return h('li',{
        className:'t3i-drop-placeholder',
        'data-drag-item-id':sidebarMarkerId(marker),
        'data-testid':`sidebar-${marker}`,
        'data-target':!hidden && target ? 'true' : undefined,
        style,
        'aria-hidden':true,
      }, hidden ? null : h('div',{ref:boxRef,className:'t3i-drop-placeholder-box'},label));
    }

    function ShelfHeader({ id, title, count, open, marker = null, bottomAnchor = false, dragging = false, isDropTarget = false, style = undefined, onToggle }) {
      return h('li',{
        className:`t3i-section-header${marker ? ' t3i-drag-peer' : ''}`,
        'data-section-header':id,
        'data-bottom-anchor':bottomAnchor ? 'true' : undefined,
        'data-drag-item-id':marker ? sidebarMarkerId(marker) : undefined,
        'data-testid':marker ? `sidebar-${marker}` : undefined,
        'data-drop-dragging':dragging ? 'true' : undefined,
        'data-drop-target':isDropTarget ? 'true' : undefined,
        style,
      },
        h('button',{
          type:'button',
          className:'t3i-section-title',
          'data-sidebar-row':id,
          'data-drop-dragging':dragging ? 'true' : undefined,
          'data-drop-target':isDropTarget ? 'true' : undefined,
          onClick:onToggle,
          'aria-expanded':open,
        },
          h('span',{className:'t3i-section-label'},title),
          h('span',{className:'t3i-section-right'},
            h('span',{className:'t3i-section-count'},count),
            h(Icon,{name:'chevron',size:12,className:'t3i-section-chevron'}))));
    }

    function UndoBar({ undo, runtime, t }) {
      React.useEffect(() => {
        const remaining = undo.expiresAt - Date.now();
        if (remaining <= 0) { runtime.dismissUndo(undo.id ?? undo.operationId); return; }
        const timer = setTimeout(() => runtime.dismissUndo(undo.id ?? undo.operationId),remaining);
        return () => clearTimeout(timer);
      },[undo.expiresAt,undo.id,undo.operationId,runtime]);
      const actionKey = undo.action === 'Snoozed' ? 'undoSnoozed' : undo.action === 'Unpinned' ? 'undoUnpinned' : 'undoSettled';
      const summary = (undo.count ?? 1) === 1 ? t(actionKey) : `${t(actionKey)} ${undo.count}`;
      const pending = (undo.items ?? [undo]).some((item) => Boolean(runtime.store.getSnapshot().pendingActions[item.sessionId]));
      return h('div',{className:'t3i-undo',role:'status'},h('span',null,summary),
        h('button',{type:'button',className:'t3i-action',disabled:pending,onClick:() => runtime.undo(undo)},t('undoButtonPlain')));
    }

    function FootUndo({ undo, runtime, t }) {
      const [shownUndo,setShownUndo] = React.useState(undo);
      const [live,setLive] = React.useState(false);
      const activeUndo = undo ?? shownUndo;
      const undoKey = activeUndo?.id ?? activeUndo?.operationId ?? null;
      React.useEffect(() => {
        if (undo) {
          setShownUndo(undo);
          setLive(false);
          const timer = setTimeout(() => setLive(true),10);
          return () => clearTimeout(timer);
        }
        setLive(false);
        if (!shownUndo) return undefined;
        const timer = setTimeout(() => setShownUndo(null),220);
        return () => clearTimeout(timer);
      },[undo,undoKey]);
      React.useEffect(() => {
        if (!undo) return undefined;
        const remaining = undo.expiresAt - Date.now();
        if (remaining <= 0) { runtime.dismissUndo(undo.id ?? undo.operationId); return; }
        const timer = setTimeout(() => runtime.dismissUndo(undo.id ?? undo.operationId),remaining);
        return () => clearTimeout(timer);
      },[undo?.expiresAt,undo?.id,undo?.operationId,runtime]);
      if (!activeUndo) return h('span',{style:{flex:'1'}});
      const locale = runtime.locale();
      const count = activeUndo.count ?? activeUndo.items?.length ?? 1;
      const oneKey = activeUndo.action === 'Snoozed' ? 'undoSnoozedOne' : activeUndo.action === 'Unpinned' ? 'undoUnpinnedOne' : 'undoSettledOne';
      const manyKey = activeUndo.action === 'Snoozed' ? 'undoSnoozedMany' : activeUndo.action === 'Unpinned' ? 'undoUnpinnedMany' : 'undoSettledMany';
      const summaryText = resolveLocalized(t, locale, count === 1 ? oneKey : manyKey, { count });
      const shortcut = runtime.undoShortcutLabel?.() ?? (isMacPlatform(runtime.shortcuts) ? '⌘Z' : 'Ctrl+Z');
      const buttonLabel = shortcut ? resolveLocalized(t, locale, 'undoToUndo', { shortcut }) : resolveLocalized(t, locale, 'undoButtonPlain');
      const pending = (activeUndo.items ?? [activeUndo]).some((item) => Boolean(runtime.store.getSnapshot().pendingActions[item.sessionId]));
      const fadingOut = !undo;
      return h('div',{className:'t3i-foot-undo','data-live':String(Boolean(undo && live)),'aria-hidden':fadingOut ? 'true' : undefined,role:'status','aria-label':`${summaryText} ${buttonLabel}`,onTransitionEnd:(event) => { if (!undo && event.target === event.currentTarget && event.propertyName === 'opacity') setShownUndo(null); }},
        h('button',{type:'button',disabled:pending || fadingOut,tabIndex:fadingOut ? -1 : undefined,onClick:() => runtime.undo(activeUndo)},h(Icon,{name:'restore',size:12}),h('span',null,buttonLabel)),
        h('span',{className:'t3i-foot-undo-text'},summaryText));
    }

    function FooterPanelIcon({ id, active, renderFactorySlot }) {
      const fallback = h(Icon,{name:'panels',size:16});
      const glyph = typeof renderFactorySlot === 'function'
        ? (renderFactorySlot('sidebar.panel.icon',{id,size:16,active},{fallback}) ?? fallback)
        : fallback;
      return h('span',{className:'t3i-foot-panel-glyph','aria-hidden':true},glyph);
    }

    function InboxFooter({ undo, panelsPosition = 'footer', globalPanels = [], activePanelId = null, renderFactorySlot = null, runtime, t }) {
      const showPanels = panelsPosition === 'footer' && globalPanels.length > 0;
      const inlinePanels = showPanels
        ? (globalPanels.length <= MAX_FOOTER_PANELS ? globalPanels : globalPanels.slice(0, MAX_FOOTER_PANELS - 1))
        : [];
      const overflowPanels = showPanels && globalPanels.length > MAX_FOOTER_PANELS
        ? globalPanels.slice(MAX_FOOTER_PANELS - 1)
        : [];
      const overflowActive = overflowPanels.some((panel) => panel.id === activePanelId);
      const [moreOpen,setMoreOpen] = React.useState(false);
      const [morePlace,setMorePlace] = React.useState(null);
      const footRef = React.useRef(null);
      const moreAnchorRef = React.useRef(null);
      const moreBtnRef = React.useRef(null);
      const moreMenuRef = React.useRef(null);
      const moreMenuId = React.useId();

      const placeMoreMenu = React.useCallback(() => {
        const anchor = (moreAnchorRef.current ?? moreBtnRef.current)?.getBoundingClientRect?.();
        const root = footRef.current?.closest?.('.t3i-root')?.getBoundingClientRect?.();
        if (!anchor) return { left:8, bottom:44 };
        const pad = 6;
        const width = 184;
        const bounds = root && root.width > 40
          ? { left:root.left + pad, right:root.right - pad }
          : { left:pad, right:window.innerWidth - pad };
        let left = Math.min(anchor.left, bounds.right - width);
        if (left < bounds.left) left = bounds.left;
        const bottom = Math.max(pad, Math.round(window.innerHeight - anchor.top + 4));
        return { left:Math.round(left), bottom };
      },[]);

      React.useEffect(() => {
        if (!showPanels || overflowPanels.length === 0) {
          setMoreOpen(false);
          setMorePlace(null);
        }
      },[showPanels, overflowPanels.length]);

      React.useEffect(() => {
        if (!moreOpen) return undefined;
        setMorePlace(placeMoreMenu());
        let cancelled = false;
        queueMicrotask(() => {
          if (cancelled || !moreMenuRef.current) return;
          const activeOption = moreMenuRef.current.querySelector('.t3i-foot-panel-option[data-active="true"]:not(:disabled)');
          const firstOption = moreMenuRef.current.querySelector('[role="menuitem"]:not(:disabled)');
          (activeOption ?? firstOption)?.focus?.({ preventScroll:true });
        });
        const onPointerDown = (event) => {
          if (!moreAnchorRef.current?.contains(event.target) && !moreMenuRef.current?.contains(event.target)) {
            setMoreOpen(false);
          }
        };
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          setMoreOpen(false);
          moreBtnRef.current?.focus?.({ preventScroll:true });
        };
        const onResize = () => setMorePlace(placeMoreMenu());
        const onScroll = (event) => {
          if (!moreMenuRef.current?.contains(event.target)) setMoreOpen(false);
        };
        window.addEventListener('pointerdown',onPointerDown,true);
        window.addEventListener('keydown',onKeyDown,true);
        window.addEventListener('resize',onResize);
        window.addEventListener('scroll',onScroll,true);
        return () => {
          cancelled = true;
          window.removeEventListener('pointerdown',onPointerDown,true);
          window.removeEventListener('keydown',onKeyDown,true);
          window.removeEventListener('resize',onResize);
          window.removeEventListener('scroll',onScroll,true);
        };
      },[moreOpen, placeMoreMenu]);

      return h('div',{ref:footRef,className:'t3i-foot'},
        h(ActionButton,{icon:'gear',label:t('settings'),className:'t3i-settings-trigger',onClick:() => { setMoreOpen(false); void runtime.openSettings(); }}),
        ...inlinePanels.map((panel) => {
          const active = panel.id === activePanelId;
          return h(TooltipButton,{
            key:panel.id,
            type:'button',
            className:'t3i-icon-button t3i-foot-panel',
            'aria-label':panel.label,
            'aria-pressed':active,
            'aria-current':active ? 'page' : undefined,
            'data-panel-id':panel.id,
            'data-active':active ? 'true' : undefined,
            tooltip:panel.label,
            tooltipSide:'top',
            onPointerDown:stopRow(),
            onClick:() => { setMoreOpen(false); runtime.toggleGlobalPanel(panel.id); },
          },h(FooterPanelIcon,{id:panel.id,active,renderFactorySlot}));
        }),
        overflowPanels.length > 0 ? h('div',{ref:moreAnchorRef,className:'t3i-filter-anchor'},
          h(ActionButton,{
            icon:'moreHorizontal',
            label:t('moreGlobalPanels'),
            className:'t3i-foot-panels-more',
            active:overflowActive,
            buttonRef:moreBtnRef,
            controls:moreMenuId,
            expanded:moreOpen,
            tooltipSuppressed:moreOpen,
            onClick:() => {
              if (moreOpen) { setMoreOpen(false); return; }
              setMorePlace(placeMoreMenu());
              setMoreOpen(true);
            },
          }),
          moreOpen ? h('div',{
            id:moreMenuId,
            ref:moreMenuRef,
            className:'t3i-foot-panels-menu',
            role:'menu',
            'aria-label':t('moreGlobalPanels'),
            style:morePlace ? { left:morePlace.left, bottom:morePlace.bottom } : undefined,
            onKeyDown:(event) => navigateMenuItems(event, moreMenuRef.current),
          },
            ...overflowPanels.map((panel) => {
              const active = panel.id === activePanelId;
              return h('button',{
                key:panel.id,
                type:'button',
                role:'menuitem',
                className:'t3i-project-option t3i-foot-panel-option',
                'data-panel-id':panel.id,
                'data-active':active ? 'true' : undefined,
                onClick:() => {
                  setMoreOpen(false);
                  moreBtnRef.current?.focus?.({ preventScroll:true });
                  runtime.toggleGlobalPanel(panel.id);
                },
              },
                h(FooterPanelIcon,{id:panel.id,active,renderFactorySlot}),
                h('span',{className:'t3i-project-option-label'},panel.label),
                active ? h(Icon,{name:'check',size:14,className:'t3i-foot-panel-check'}) : null);
            })) : null) : null,
        h(FootUndo,{undo,runtime,t}));
    }

    function navigateMenuItems(event, container) {
      if (['Enter',' '].includes(event.key)) { event.stopPropagation(); return; }
      if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const items = [...container.querySelectorAll(':scope > [role="menuitem"]:not(:disabled)')];
      if (!items.length) return;
      const index = items.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1
        : index < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1)
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next].focus();
    }
    function installSidebarTree(root) {
      if (!root) return () => {};
      const ObserverCtor = typeof MutationObserver === 'function' ? MutationObserver : window?.MutationObserver;
      const cssEscape = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape.bind(CSS)
        : (typeof window !== 'undefined' && typeof window.CSS?.escape === 'function' ? window.CSS.escape.bind(window.CSS) : (s) => String(s).replace(/([^\w-])/g, '\\$1'));
      const ROW = '[data-sidebar-row]';
      let focusedId;
      let focusedParent;
      let focusedIndex = -1;
      let ownsFocus = false;
      let contextMenuRow;

      const isVisibleRow = (row) => {
        const hidden = row.closest('[hidden], [inert], [aria-hidden="true"]');
        return (!hidden || !root.contains(hidden)) && !row.matches(':disabled');
      };
      const visibleRows = () => [...root.querySelectorAll(ROW)].filter(isVisibleRow);
      const ownerRow = (element) => {
        const row = element.closest(ROW);
        if (row) return row;
        const linked = element.dataset?.sidebarActionFor;
        return linked ? root.querySelector(`[data-sidebar-row="${cssEscape(linked)}"]`) : null;
      };
      const focusRow = (row) => {
        row.scrollIntoView?.({ block:'nearest' });
        row.focus?.({ preventScroll:true });
      };
      const restoreFocus = () => {
        if (!ownsFocus || focusedId === undefined) return;
        const activeEl = document.activeElement;
        const lost = activeEl === document.body || (activeEl && activeEl.nodeType === 1 && root.contains(activeEl) && activeEl.matches(ROW) && !isVisibleRow(activeEl));
        if (!lost) return;
        const rows = visibleRows();
        const target =
          rows.find((row) => row.dataset?.sidebarRow === focusedId) ??
          rows.find((row) => row.dataset?.sidebarRow === focusedParent) ??
          rows[Math.min(Math.max(focusedIndex, 0), rows.length - 1)];
        target?.focus?.({ preventScroll:true });
      };
      const onPointerDown = (event) => {
        const focusable = event.target?.nodeType === 1 ? event.target.closest(`${ROW}, button, a[href], input, [tabindex]`) : null;
        ownsFocus = focusable !== null && root.contains(focusable);
      };
      const onFocus = (event) => {
        ownsFocus = Boolean(event.target && root.contains(event.target));
        if (!ownsFocus || event.target?.nodeType !== 1) return;
        const row = ownerRow(event.target);
        if (!row) return;
        focusedId = row.dataset?.sidebarRow;
        focusedParent = row.dataset?.sidebarParent;
        focusedIndex = visibleRows().indexOf(row);
      };
      const onKeyDown = (event) => {
        const row = event.target;
        if (row?.nodeType === 1 && row.closest('.t3i-context-menu, .t3i-snooze-menu')) return;
        if (
          !event.defaultPrevented && !event.isComposing && !event.altKey && !event.ctrlKey && !event.metaKey &&
          (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) &&
          row?.nodeType === 1 && row.matches(ROW)
        ) {
          event.preventDefault();
          event.stopPropagation();
          contextMenuRow = row;
          return;
        }
        if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (row?.nodeType !== 1 || !row.matches(ROW)) return;
        const rows = visibleRows();
        const index = rows.indexOf(row);
        if (index < 0) return;
        let target;
        switch (event.key) {
          case 'ArrowDown': target = rows[Math.min(index + 1, rows.length - 1)]; break;
          case 'ArrowUp': target = rows[Math.max(index - 1, 0)]; break;
          case 'Home': target = rows[0]; break;
          case 'End': target = rows.at(-1); break;
          case 'ArrowRight':
            if (row.getAttribute('aria-expanded') === 'false') row.click();
            else target = rows.find((candidate) => candidate.dataset?.sidebarParent === row.dataset?.sidebarRow);
            break;
          case 'ArrowLeft':
            if (row.getAttribute('aria-expanded') === 'true') row.click();
            else if (row.dataset?.sidebarParent) target = rows.find((candidate) => candidate.dataset?.sidebarRow === row.dataset?.sidebarParent);
            break;
          default: return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (target) focusRow(target);
      };
      const onKeyUp = (event) => {
        if (!contextMenuRow || (event.key !== 'ContextMenu' && event.key !== 'F10')) return;
        const row = contextMenuRow;
        contextMenuRow = undefined;
        event.preventDefault();
        event.stopPropagation();
        if (document.activeElement !== row || !row.isConnected) return;
        const rect = row.getBoundingClientRect();
        const MouseEvt = (typeof window !== 'undefined' && window.MouseEvent) || MouseEvent;
        row.dispatchEvent(new MouseEvt('contextmenu', { bubbles:true, cancelable:true, clientX:rect.left, clientY:rect.bottom }));
      };
      const observer = typeof ObserverCtor === 'function' ? new ObserverCtor(restoreFocus) : null;
      observer?.observe(root, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden','inert','aria-hidden'] });
      document.addEventListener('focusin', onFocus);
      document.addEventListener('pointerdown', onPointerDown, true);
      root.addEventListener('keydown', onKeyDown, true);
      root.addEventListener('keyup', onKeyUp, true);
      return () => {
        observer?.disconnect();
        document.removeEventListener('focusin', onFocus);
        document.removeEventListener('pointerdown', onPointerDown, true);
        root.removeEventListener('keydown', onKeyDown, true);
        root.removeEventListener('keyup', onKeyUp, true);
      };
    }

    function buildBatchMenuModel(cards, pendingMap, presets, locale, t, canArchiveApi = false) {
      const pinnedCards = cards.filter((card) => card.pinned && !card.archived);
      const settledCards = cards.filter((card) => !card.pinned && card.section === 'settled' && !card.archived);
      const unsettledCards = cards.filter((card) => (card.pinned || card.section !== 'settled') && !card.archived);
      const snoozedCards = cards.filter((card) => isCardSnoozed(card) && !card.archived);
      const unreadCards = cards.filter((card) => !card.archived && hasCompletedTurn(card));
      const archivableCards = cards.filter((card) => !card.archived);
      return {
        pinnedCards,
        settledCards,
        unsettledCards,
        snoozedCards,
        unreadCards,
        archivableCards,
        showUnpin: pinnedCards.length > 0,
        canUnpin: pinnedCards.length > 0 && !pinnedCards.some((card) => Boolean(pendingMap[card.sessionId])),
        showSettle: unsettledCards.length > 0,
        canSettle: unsettledCards.length > 0 && unsettledCards.every((card) => settleClickable({ ...card, pinned:false }, Boolean(pendingMap[card.sessionId]))),
        showUnsettle: settledCards.length > 0,
        canUnsettle: settledCards.length > 0 && !settledCards.some((card) => Boolean(pendingMap[card.sessionId] || card.treeError)),
        showWake: snoozedCards.length > 0,
        canWake: snoozedCards.length > 0 && !snoozedCards.some((card) => Boolean(pendingMap[card.sessionId] || card.treeError)),
        showSnooze: cards.length > 0 && cards.every((card) => !card.archived && snoozeClickable(card, Boolean(pendingMap[card.sessionId]))),
        canMarkUnread: unreadCards.length > 0 && !unreadCards.some((card) => Boolean(pendingMap[card.sessionId])),
        showArchive: Boolean(canArchiveApi) && archivableCards.length > 0,
        canArchive: Boolean(canArchiveApi) && archivableCards.length > 0 && !archivableCards.some((card) => Boolean(pendingMap[card.sessionId])),
        presets: (presets ?? []).map((preset) => ({
          preset,
          id:`snooze-${preset.id}`,
          label:`${preset.label} (${preset.whenLabel})`,
        })),
      };
    }
    function BatchContextMenu({ menu, runtime, t, onClose }) {
      const [snoozeOpen,setSnoozeOpen] = React.useState(false);
      const menuRef = React.useRef(null);
      const submenuRef = React.useRef(null);
      const triggerRef = React.useRef(null);
      const focusSub = React.useRef(false);
      const submenuId = React.useId();
      React.useEffect(() => { menuRef.current?.querySelector('button:not(:disabled)')?.focus(); },[]);
      React.useEffect(() => {
        if (snoozeOpen && focusSub.current) submenuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
        focusSub.current = false;
      },[snoozeOpen]);
      React.useEffect(() => {
        const pointer = (event) => { if (!menuRef.current?.contains(event.target)) onClose(); };
        window.addEventListener('pointerdown',pointer,true);
        return () => window.removeEventListener('pointerdown',pointer,true);
      },[onClose]);
      const cards = menu.cards;
      const viewSnapshot = runtime.store.getSnapshot();
      const pendingMap = viewSnapshot.pendingActions;
      const timeFormat = viewSnapshot.timeFormat || 'locale';
      const locale = runtime.locale();
      const presets = viewSnapshot.remote?.snoozeSettings?.presets;
      const model = buildBatchMenuModel(cards, pendingMap, snoozePresets(locale, presets, timeFormat, t), locale, t, typeof runtime.archiveMany === 'function');
      const chooseBatchSnooze = (preset) => {
        const until = pickSnoozePreset(preset);
        onClose();
        runtime.clearSelection?.();
        if (until === null) { runtime.reportError?.('snooze', null, { code:'snooze-time-passed' }); return; }
        void runtime.actMany?.(cards, 'snooze', { until:new Date(until).toISOString() });
      };
      const onContextKey = (event) => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return; }
        if (event.key === 'ArrowRight' && event.target === triggerRef.current && !triggerRef.current.disabled) {
          event.preventDefault(); event.stopPropagation();
          if (snoozeOpen) submenuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
          else { focusSub.current = true; setSnoozeOpen(true); }
          return;
        }
        navigateMenuItems(event, event.currentTarget);
      };
      const onSubmenuKey = (event) => {
        if (event.key === 'Escape' || event.key === 'ArrowLeft') {
          event.preventDefault(); event.stopPropagation(); setSnoozeOpen(false); triggerRef.current?.focus(); return;
        }
        navigateMenuItems(event, event.currentTarget);
      };
      return h('div',{ref:menuRef,className:'t3i-context-menu','data-side':menu.side,'data-batch':'true',role:'menu','aria-label':t('batchActions'),onKeyDown:onContextKey,style:{left:menu.x,top:menu.y},
        onBlur:() => { queueMicrotask(() => { if (menuRef.current && !menuRef.current.contains(document.activeElement)) onClose(); }); }},
        model.showUnpin ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!model.canUnpin,onClick:() => { onClose(); runtime.clearSelection?.(); void runtime.unpinMany?.(model.pinnedCards); }},t('unpinBatch',{count:model.pinnedCards.length})) : null,
        model.showSettle ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!model.canSettle,onClick:() => { onClose(); runtime.clearSelection?.(); void runtime.actMany?.(model.unsettledCards,'settle'); }},t('settleBatch',{count:model.unsettledCards.length})) : null,
        model.showUnsettle ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!model.canUnsettle,onClick:() => { onClose(); runtime.clearSelection?.(); void runtime.actMany?.(model.settledCards,'restore'); }},t('unsettleBatch',{count:model.settledCards.length})) : null,
        model.showWake ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!model.canWake,onClick:() => { onClose(); runtime.clearSelection?.(); void runtime.actMany?.(model.snoozedCards,'wake'); }},t('wakeBatch',{count:model.snoozedCards.length})) : null,
        model.showSnooze ? h('button',{ref:triggerRef,type:'button',role:'menuitem',className:'t3i-context-item','aria-haspopup':'menu','aria-controls':submenuId,'aria-expanded':snoozeOpen,onClick:(event) => { if (!snoozeOpen && event.detail === 0) focusSub.current = true; setSnoozeOpen(!snoozeOpen); },onMouseEnter:() => setSnoozeOpen(true)},t('snoozeBatch',{count:cards.length}),h(Icon,{name:'chevron',size:12,className:'t3i-menu-chevron'})) : null,
        model.showSnooze && snoozeOpen ? h('div',{id:submenuId,ref:submenuRef,className:'t3i-context-submenu',role:'menu',tabIndex:-1,'aria-label':t('snoozeSession'),onKeyDown:onSubmenuKey},
          h(SnoozeChoices,{choose:chooseBatchSnooze,onCustom:() => {
            const firstId = cards[0]?.sessionId;
            const returnEl = firstId && typeof document !== 'undefined'
              ? [...document.querySelectorAll('.t3i-item[data-session-id]')].find((el) => el.getAttribute('data-session-id') === firstId)?.querySelector('.t3i-row') ?? null
              : null;
            onClose(); runtime.clearSelection?.(); runtime.openCustomSnoozeBatch?.(cards.map((card) => card.sessionId), returnEl);
          },t,locale,timeFormat,options:presets})) : null,
        h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!model.canMarkUnread,onClick:() => { onClose(); runtime.clearSelection?.(); void runtime.markUnreadMany?.(model.unreadCards); }},t('markUnreadBatch',{count:model.unreadCards.length || cards.length})),
        model.showArchive ? h('button',{type:'button',role:'menuitem',className:'t3i-context-item',disabled:!model.canArchive,onClick:() => { onClose(); runtime.clearSelection?.(); void runtime.archiveMany?.(model.archivableCards); }},t('archiveBatch',{count:model.archivableCards.length})) : null);
    }

    function InboxBrowser(props) {
      const { wide, expandSidebar, useWorkspaces, usePanelInfo, useSessions, renderFactorySlot = null, t, inbox:runtime } = props;
      const view = useView(runtime);
      const [filterOpen,setFilterOpen] = React.useState(false);
      const [filterHighlightIdx,setFilterHighlightIdx] = React.useState(0);
      const [newMenuOpen,setNewMenuOpen] = React.useState(false);
      const [newMenuPlace,setNewMenuPlace] = React.useState(null);
      const [searchHighlightId,setSearchHighlightId] = React.useState(null);
      const [searchNavTick,setSearchNavTick] = React.useState(0);
      const [messageSearch,setMessageSearch] = React.useState({ query:'', items:[] });
      const [filterPlace,setFilterPlace] = React.useState(null);
      const [projectQuery,setProjectQuery] = React.useState('');
      const [batchMenu,setBatchMenu] = React.useState(null);
      const [sweepState,setSweepState] = React.useState(null);
      const [dragState,setDragState] = React.useState(null);
      const [orderRevision,setOrderRevision] = React.useState(0);
      const rootRef = React.useRef(null);
      const headRef = React.useRef(null);
      const scrollRef = React.useRef(null);
      const filterAnchorRef = React.useRef(null);
      const filterTriggerRef = React.useRef(null);
      const projectQueryRef = React.useRef(null);
      const newAnchorRef = React.useRef(null);
      const newTriggerRef = React.useRef(null);
      const newMenuRef = React.useRef(null);
      const newMenuId = React.useId();
      const filterOptionsRef = React.useRef([]);
      const activeFilterIdxRef = React.useRef(-1);
      const selectedIdsRef = React.useRef([]);
      const selectedSetRef = React.useRef(new Set());
      const shownMessageOrderRef = React.useRef([]);
      const orderedRef = React.useRef([]);
      const orderedSectionsRef = React.useRef(null);
      const dragSettledOpenRef = React.useRef(false);
      const dragSettledLimitRef = React.useRef(SETTLED_INITIAL_COUNT);
      const activeSessionIdRef = React.useRef(null);
      const cardsByIdRef = React.useRef(new Map());
      const sweepCleanupRef = React.useRef(null);
      const sweepClickCleanupRef = React.useRef(null);
      const dragCleanupRef = React.useRef(null);
      const dragStateRef = React.useRef(null);
      const dragSelectionRef = React.useRef({ zone:null, slot:null });
      const latestPointerYRef = React.useRef(0);
      const dragSuppressUntilRef = React.useRef(0);
      const searchKeyNavRef = React.useRef(false);
      const listMotionRef = React.useRef(null);
      const listMotionNodeRef = React.useRef(null);
      dragStateRef.current = dragState;
      const workspaces = useWorkspaces((value) => value);
      const panel = usePanelInfo((value) => value);
      const sessions = useSessions((value) => value);
      const currentSessionId = Object.values(sessions?.byId ?? {}).find((session) => (session.retainedBy?.mainView ?? 0) > 0)?.id ?? null;
      React.useLayoutEffect(() => runtime.noteWide(wide),[wide,runtime]);
      React.useEffect(() => runtime.notePanel(panel,currentSessionId),[panel,currentSessionId,runtime]);
      React.useEffect(() => {
        if (runtime.store.getSnapshot().filterOpen !== filterOpen) runtime.store.set({filterOpen});
      },[filterOpen,runtime]);
      React.useEffect(() => () => {
        sweepCleanupRef.current?.();
        sweepClickCleanupRef.current?.();
        dragCleanupRef.current?.();
        listMotionRef.current?.dispose();
        listMotionRef.current = null;
        listMotionNodeRef.current = null;
        if (typeof document !== 'undefined') document.body?.removeAttribute('data-t3i-dragging');
        if (runtime.store.getSnapshot().filterOpen) runtime.store.set({filterOpen:false});
      },[runtime]);
      const attachListMotionRef = React.useCallback((node) => {
        if (listMotionNodeRef.current === node) return;
        listMotionRef.current?.dispose();
        listMotionRef.current = null;
        listMotionNodeRef.current = node;
        if (!node) return;
        const motion = createSidebarListMotion(node);
        listMotionRef.current = motion;
        motion.update(false);
      },[]);
      const closeFilter = React.useCallback((restoreFocus = false) => {
        setFilterOpen(false);
        setFilterPlace(null);
        setProjectQuery('');
        setFilterHighlightIdx(0);
        if (restoreFocus) filterTriggerRef.current?.focus({ preventScroll:true });
      },[]);
      const closeNewMenu = React.useCallback((restoreFocus = false) => {
        setNewMenuOpen(false);
        setNewMenuPlace(null);
        if (restoreFocus) newTriggerRef.current?.focus({ preventScroll:true });
      },[]);
      /** Clamp fixed popover inside the Inbox root — host sidebar overflow, not window width, is the real clip edge. */
      const placePopover = React.useCallback((anchorEl, maxWidth = 272) => {
        const anchor = anchorEl?.getBoundingClientRect();
        const root = (rootRef.current ?? headRef.current?.closest?.('.t3i-root'))?.getBoundingClientRect?.();
        if (!anchor) return { left:0, top:0, width:Math.min(220, maxWidth) };
        const pad = 6;
        const bounds = root && root.width > 40
          ? { left:root.left + pad, right:root.right - pad, width:Math.max(120, root.width - pad * 2) }
          : { left:pad, right:window.innerWidth - pad, width:Math.min(maxWidth, window.innerWidth - pad * 2) };
        const width = Math.min(maxWidth, bounds.width);
        let left = Math.min(anchor.left, bounds.right - width);
        if (left < bounds.left) left = bounds.left;
        return { left:Math.round(left), top:Math.round(anchor.bottom + 4), width:Math.round(width) };
      },[]);
      const placeFilter = React.useCallback(() => placePopover(filterAnchorRef.current, 272), [placePopover]);
      const placeNewMenu = React.useCallback(() => placePopover(newAnchorRef.current, 248), [placePopover]);
      const openFilter = React.useCallback(() => {
        closeNewMenu(false);
        setFilterHighlightIdx(0);
        setFilterPlace(placeFilter());
        setFilterOpen(true);
      },[closeNewMenu,placeFilter]);
      const openNewMenu = React.useCallback(() => {
        closeFilter(false);
        setNewMenuPlace(placeNewMenu());
        setNewMenuOpen(true);
      },[closeFilter,placeNewMenu]);
      const resetSidebarScrollX = React.useCallback(() => {
        let node = rootRef.current ?? headRef.current;
        while (node && node !== document.documentElement) {
          if (node.scrollLeft) node.scrollLeft = 0;
          node = node.parentElement;
        }
      },[]);
      const selectFilterOption = React.useCallback((option, { multi = false } = {}) => {
        if (!option) return;
        if (option.kind === 'all') {
          runtime.setWorkspaceFilter([]);
          closeFilter(true);
          return;
        }
        const id = option.workspace?.workspaceId;
        if (!id) return;
        if (multi) {
          const isSel = selectedSetRef.current.has(id);
          runtime.setWorkspaceFilter(isSel ? selectedIdsRef.current.filter((item) => item !== id) : [...selectedIdsRef.current, id]);
        } else {
          runtime.setWorkspaceFilter([id]);
          closeFilter(true);
        }
      },[closeFilter,runtime]);
      React.useEffect(() => {
        if (!filterOpen) return;
        setFilterPlace(placeFilter());
        const scheduleFocus = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : queueMicrotask(fn));
        scheduleFocus(() => {
          projectQueryRef.current?.focus({ preventScroll:true });
          resetSidebarScrollX();
        });
        const onResize = () => setFilterPlace(placeFilter());
        const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;
        if (rootRef.current) resizeObserver?.observe(rootRef.current);
        if (filterAnchorRef.current) resizeObserver?.observe(filterAnchorRef.current);
        window.addEventListener('resize',onResize);
        const close = (event) => { if (!filterAnchorRef.current?.contains(event.target)) closeFilter(false); };
        const keyboard = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeFilter(true);
            return;
          }
          if (!['ArrowDown','ArrowUp','Enter'].includes(event.key)) return;
          const optsList = filterOptionsRef.current ?? [];
          if (!optsList.length) return;
          const domOptions = [...(filterAnchorRef.current?.querySelectorAll('.t3i-filter-popover .t3i-project-option') ?? [])];
          const active = document.activeElement;
          const domIdx = domOptions.indexOf(active);
          if (event.key === 'Enter') {
            if (active === projectQueryRef.current || (domIdx >= 0 && event.shiftKey)) {
              const targetIdx = domIdx >= 0 ? domIdx : activeFilterIdxRef.current;
              const chosen = optsList[targetIdx];
              if (chosen) {
                event.preventDefault();
                event.stopPropagation();
                selectFilterOption(chosen, { multi: event.shiftKey });
              }
            }
            return;
          }
          event.preventDefault();
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          const base = domIdx >= 0 ? domIdx : (activeFilterIdxRef.current >= 0 ? activeFilterIdxRef.current : (delta > 0 ? -1 : 0));
          const nextIdx = (base + delta + optsList.length) % optsList.length;
          setFilterHighlightIdx(nextIdx);
          if (domIdx >= 0) domOptions[nextIdx]?.focus?.({ preventScroll:true });
          else domOptions[nextIdx]?.scrollIntoView?.({ block:'nearest' });
        };
        window.addEventListener('pointerdown',close,true);
        window.addEventListener('keydown',keyboard,true);
        return () => {
          window.removeEventListener('pointerdown',close,true);
          window.removeEventListener('keydown',keyboard,true);
          window.removeEventListener('resize',onResize);
          resizeObserver?.disconnect();
          resetSidebarScrollX();
        };
      },[filterOpen,closeFilter,placeFilter,resetSidebarScrollX,selectFilterOption]);
      React.useEffect(() => {
        if (!newMenuOpen) return;
        setNewMenuPlace(placeNewMenu());
        const scheduleFocus = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : queueMicrotask(fn));
        scheduleFocus(() => {
          newMenuRef.current?.querySelector('button:not(:disabled)')?.focus?.({ preventScroll:true });
        });
        const onResize = () => setNewMenuPlace(placeNewMenu());
        window.addEventListener('resize', onResize);
        const close = (event) => { if (!newAnchorRef.current?.contains(event.target)) closeNewMenu(false); };
        const keyboard = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            closeNewMenu(true);
            return;
          }
          if (!newMenuRef.current) return;
          navigateMenuItems(event, newMenuRef.current);
        };
        window.addEventListener('pointerdown', close, true);
        window.addEventListener('keydown', keyboard, true);
        return () => {
          window.removeEventListener('pointerdown', close, true);
          window.removeEventListener('keydown', keyboard, true);
          window.removeEventListener('resize', onResize);
        };
      },[newMenuOpen,closeNewMenu,placeNewMenu]);
      const applyPendingOverlay = React.useMemo(() => resolvePendingOverlay(), []);
      const applyRunningOverlay = React.useMemo(() => resolveRunningOverlay(), []);
      const cards = useWorkingGrace((view.remote?.cards ?? []).map((card) => enrichCard(card, workspaces, sessions, view.remote?.phase, applyPendingOverlay, applyRunningOverlay, view.optimisticCards)));
      const searchRef = React.useRef(null);
      const selectedIds = view.workspaceIds?.length ? view.workspaceIds : (view.workspaceId ? [view.workspaceId] : []);
      const selectedSet = new Set(selectedIds);
      const scopeKey = selectedIds.join(',');
      React.useEffect(() => {
        if (runtime.store.getSnapshot().settledLimit !== SETTLED_INITIAL_COUNT) runtime.store.set({ settledLimit: SETTLED_INITIAL_COUNT });
      }, [scopeKey, runtime]);
      const panelKey = (panel?.activePanelId ?? null) ?? 'conversation';
      const activeSessionId = panelKey === 'conversation' ? currentSessionId : null;
      const workspaceItems = workspaces?.items ?? [];
      const selectedProjects = selectedIds.map((id) => workspaceItems.find((workspace) => workspace.workspaceId === id)).filter(Boolean);
      const normalizedProjectQuery = projectQuery.trim().toLocaleLowerCase();
      const filteredProjects = workspaceItems.filter((workspace) => !normalizedProjectQuery || `${workspace.title ?? ''} ${workspace.path ?? ''} ${workspace.workspaceId}`.toLocaleLowerCase().includes(normalizedProjectQuery));
      const showAllFilterOption = !normalizedProjectQuery;
      const filterOptions = [
        ...(showAllFilterOption ? [{ kind:'all', key:'__all__' }] : []),
        ...filteredProjects.map((workspace) => ({ kind:'workspace', key:workspace.workspaceId, workspace })),
      ];
      const activeFilterIdx = filterOptions.length ? Math.min(Math.max(0, filterHighlightIdx), filterOptions.length - 1) : -1;
      filterOptionsRef.current = filterOptions;
      activeFilterIdxRef.current = activeFilterIdx;
      selectedIdsRef.current = selectedIds;
      selectedSetRef.current = selectedSet;
      const query = view.search.trim();
      React.useEffect(() => { setSearchHighlightId(null); }, [query]);
      React.useEffect(() => {
        if (!query) {
          shownMessageOrderRef.current = [];
          setMessageSearch((prev) => (prev.query === '' && prev.items.length === 0 ? prev : { query:'', items:[] }));
          return undefined;
        }
        if (typeof runtime.searchSessionContent !== 'function') return undefined;
        const controller = new AbortController();
        const timer = setTimeout(() => {
          void (async () => {
            try {
              const res = await runtime.searchSessionContent(query, controller.signal);
              if (controller.signal.aborted) return;
              const rawItems = Array.isArray(res?.value?.items) ? res.value.items : Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
              const byId = new Map();
              for (const item of rawItems) {
                if (!item?.sessionId || byId.has(item.sessionId)) continue;
                byId.set(item.sessionId, item.snippet ?? item.excerpt ?? null);
              }
              const prevOrder = shownMessageOrderRef.current;
              const nextOrder = [
                ...prevOrder.filter((id) => byId.has(id)),
                ...[...byId.keys()].filter((id) => !prevOrder.includes(id)),
              ];
              shownMessageOrderRef.current = nextOrder;
              setMessageSearch({ query, items:nextOrder.map((sessionId) => ({ sessionId, snippet:byId.get(sessionId) ?? null })) });
            } catch {
              if (!controller.signal.aborted) setMessageSearch({ query, items:[] });
            }
          })();
        }, 140);
        return () => {
          clearTimeout(timer);
          controller.abort();
        };
      }, [query, runtime]);
      void orderRevision;
      const scopedCards = cards.filter((card) => (selectedSet.size === 0 || selectedSet.has(card.workspaceId)) && (!card.archived || card.needsYou));
      const ordered = visibleOrderedCards(scopedCards, view, activeSessionId);
      const titleHits = ordered.searchHits ?? [];
      const titleHitIds = new Set(titleHits.map((hit) => hit.card.sessionId));
      const scopedById = new Map(scopedCards.map((card) => [card.sessionId, card]));
      const messageHits = query && messageSearch.query === query
        ? messageSearch.items
            .filter((item) => !titleHitIds.has(item.sessionId))
            .map((item) => {
              const card = scopedById.get(item.sessionId);
              return card ? { card, ranges:null, snippet:item.snippet ?? null } : null;
            })
            .filter(Boolean)
        : [];
      const searchHits = [...titleHits, ...messageHits];
      const activeSearchIdx = searchHits.length ? Math.max(0, searchHighlightId == null ? 0 : searchHits.findIndex((hit) => hit.card.sessionId === searchHighlightId)) : 0;
      const activeSearchIndex = searchHits.length ? Math.min(activeSearchIdx, searchHits.length - 1) : 0;
      const activeSearchDescendantId = query && searchHits.length ? `t3i-search-hit-${activeSearchIndex}` : undefined;
      React.useLayoutEffect(() => {
        if (!searchKeyNavRef.current) return;
        searchKeyNavRef.current = false;
        const activeRow = scrollRef.current?.querySelector('.t3i-search-row[data-active="true"]');
        activeRow?.scrollIntoView?.({ block:'nearest' });
      }, [query, activeSearchIndex, searchNavTick]);
      React.useEffect(() => {
        if (!wide || view.mode !== 'inbox' || query) return undefined;
        return installSidebarTree(scrollRef.current);
      }, [wide, view.mode, query]);
      const updateScrollFade = React.useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const top = (el.scrollTop ?? 0) > 1 ? '12px' : '0px';
        const bottom = ((el.scrollTop ?? 0) + (el.clientHeight ?? 0)) < ((el.scrollHeight ?? 0) - 1) ? '12px' : '0px';
        if (el.style.getPropertyValue('--t3i-fade-top') !== top) el.style.setProperty('--t3i-fade-top', top);
        if (el.style.getPropertyValue('--t3i-fade-bottom') !== bottom) el.style.setProperty('--t3i-fade-bottom', bottom);
      },[]);
      React.useLayoutEffect(() => {
        updateScrollFade();
        const el = scrollRef.current;
        if (!el || typeof ResizeObserver !== 'function') return undefined;
        const ro = new ResizeObserver(updateScrollFade);
        ro.observe(el);
        return () => ro.disconnect();
      }, [updateScrollFade, wide, view.mode, query, scopedCards.length, searchHits.length, view.workingOpen, view.snoozedOpen, view.settledOpen, view.settledLimit, view.workingShelfEnabled]);
      orderedRef.current = query ? searchHits.map((hit) => hit.card.sessionId) : ordered.orderedIds;
      orderedSectionsRef.current = ordered.bySection;
      cardsByIdRef.current = scopedById;
      activeSessionIdRef.current = activeSessionId;
      const dragSettledOpen = Boolean(view.settledOpen);
      const dragSettledLimit = Number.isFinite(view.settledLimit) ? view.settledLimit : SETTLED_INITIAL_COUNT;
      dragSettledOpenRef.current = dragSettledOpen;
      dragSettledLimitRef.current = dragSettledLimit;
      const selectedThreadSet = new Set(view.selectedIds ?? []);
      const customSnoozeBatchCards = view.customSnoozeSessionIds?.length
        ? view.customSnoozeSessionIds.map((id) => cards.find((card) => card.sessionId === id)).filter(Boolean)
        : [];
      const customSnoozeCard = !customSnoozeBatchCards.length && view.customSnoozeSessionId ? cards.find((card) => card.sessionId === view.customSnoozeSessionId) : null;
      const jumpBlocked = !wide || view.mode !== 'inbox' || Boolean(query) || filterOpen || newMenuOpen || Boolean(customSnoozeCard) || customSnoozeBatchCards.length > 0 || Boolean(batchMenu) || Boolean(dragState);
      const jumpLabels = useJumpHints({ catalog: runtime.shortcuts?.catalog, blocked: jumpBlocked, mac: isMacPlatform(runtime.shortcuts) });
      const jumpBySessionId = new Map();
      if (jumpLabels) {
        ordered.orderedIds.slice(0, 9).forEach((id, index) => {
          const label = jumpLabels.get(index + 1);
          if (label) jumpBySessionId.set(id, label);
        });
      }
      React.useEffect(() => {
        if (!view.selectedIds?.length) return;
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          if (filterOpen || batchMenu || customSnoozeCard || customSnoozeBatchCards.length > 0) return;
          if (document.querySelector('.t3i-snooze-menu, .t3i-context-menu')) return;
          if (document.activeElement === searchRef.current && view.search) return;
          event.preventDefault();
          event.stopPropagation();
          runtime.clearSelection?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      },[view.selectedIds?.length, filterOpen, batchMenu, customSnoozeCard, customSnoozeBatchCards.length, view.search, runtime]);
      const startSweep = React.useCallback((originCard, action, downEvent) => {
        sweepCleanupRef.current?.();
        const originId = originCard.sessionId;
        const originSection = originCard.pinned ? 'pinned' : originCard.section;
        const originX = downEvent.clientX ?? 0;
        const originY = downEvent.clientY ?? 0;
        let sweeping = false;
        let targetId = null;
        let sweptIds = [];
        const canApply = (id) => {
          const card = cardsByIdRef.current.get(id);
          if (!card) return false;
          if ((card.pinned ? 'pinned' : card.section) !== originSection) return false;
          const pendingNow = Boolean(runtime.store.getSnapshot().pendingActions[id]);
          if (action === 'settle') return settleClickable({ ...card, pinned:false }, pendingNow);
          if (action === 'unsettle' || action === 'wake') return !pendingNow && !card.treeError;
          return false;
        };
        const sweepTo = (nextId) => {
          if (!nextId || nextId === targetId) return;
          targetId = nextId;
          sweptIds = resolveSidebarSweepKeys(orderedRef.current, originId, nextId, canApply);
          setSweepState({ action, ids: new Set(sweptIds) });
        };
        const cleanup = () => {
          if (typeof window !== 'undefined') {
            window.removeEventListener('pointermove', onMove, true);
            window.removeEventListener('pointerup', onUp, true);
            window.removeEventListener('pointercancel', onCancel, true);
            window.removeEventListener('keydown', onKey, true);
            window.removeEventListener('blur', onCancel);
            window.removeEventListener('resize', onCancel);
          }
          if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', onVis);
            document.body?.removeAttribute('data-t3i-sweeping');
          }
          if (sweepCleanupRef.current === cleanup) sweepCleanupRef.current = null;
        };
        const finish = (commit) => {
          cleanup();
          setSweepState(null);
          if (!commit || !sweeping) return;
          sweepClickCleanupRef.current?.();
          let armed = true;
          let clickTimer = null;
          const disarmClick = () => {
            armed = false;
            clearTimeout(clickTimer);
            if (typeof window !== 'undefined') window.removeEventListener('click', blockClick, true);
            if (sweepClickCleanupRef.current === disarmClick) sweepClickCleanupRef.current = null;
          };
          const blockClick = (event) => {
            if (!armed) return;
            event.preventDefault();
            event.stopPropagation();
            disarmClick();
          };
          window.addEventListener('click', blockClick, true);
          clickTimer = setTimeout(disarmClick, 60);
          sweepClickCleanupRef.current = disarmClick;
          const targets = sweptIds.map((id) => cardsByIdRef.current.get(id)).filter((card) => card && canApply(card.sessionId));
          if (!targets.length) return;
          const kind = action === 'settle' ? 'settle' : action === 'unsettle' ? 'restore' : 'wake';
          void runtime.actMany?.(targets, kind);
        };
        const onMove = (event) => {
          if (!sweeping) {
            if (Math.hypot((event.clientX ?? 0) - originX, (event.clientY ?? 0) - originY) < 6) return;
            sweeping = true;
            if (typeof document !== 'undefined') document.body?.setAttribute('data-t3i-sweeping', 'true');
            try { window.getSelection?.()?.removeAllRanges?.(); } catch {}
            emitPreview({ clear:true });
            sweepTo(originId);
          }
          const hitId = sidebarThreadKeyAtY(scrollRef.current, event.clientY ?? originY) ?? originId;
          sweepTo(hitId);
        };
        const onUp = () => finish(true);
        const onCancel = () => finish(false);
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          if (sweeping) { event.preventDefault(); event.stopPropagation(); }
          finish(false);
        };
        const onVis = () => { if (document.visibilityState !== 'visible') finish(false); };
        window.addEventListener('pointermove', onMove, true);
        window.addEventListener('pointerup', onUp, true);
        window.addEventListener('pointercancel', onCancel, true);
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('blur', onCancel);
        window.addEventListener('resize', onCancel);
        document.addEventListener('visibilitychange', onVis);
        sweepCleanupRef.current = cleanup;
      },[runtime]);
      const openBatchContext = React.useCallback((_card, point) => {
        const selected = runtime.store.getSnapshot().selectedIds ?? [];
        const selectedCards = orderedRef.current.map((id) => cardsByIdRef.current.get(id)).filter((item) => item && selected.includes(item.sessionId));
        const targets = selectedCards.length ? selectedCards : cards.filter((item) => selected.includes(item.sessionId));
        if (!targets.length) return;
        if (runtime.openBatchMenu?.(targets, point)) { setBatchMenu(null); return; }
        setBatchMenu({
          x:Math.min(point.x, window.innerWidth - 180),
          y:Math.min(point.y, window.innerHeight - 180),
          side:point.x > window.innerWidth - 350 ? 'left' : 'right',
          cards:targets,
        });
      },[cards, runtime]);
      const activeKey = dragState?.activeKey ?? null;
      const isDragging = Boolean(activeKey);
      const dragItems = React.useMemo(() => {
        if (!isDragging || !ordered.bySection) return [];
        return buildDragItems(ordered.bySection, view.workingOpen, view.snoozedOpen, dragSettledOpen, dragSettledLimit, activeSessionId);
      },[isDragging, ordered, view.workingOpen, view.snoozedOpen, dragSettledOpen, dragSettledLimit, activeSessionId]);

      React.useLayoutEffect(() => {
        if (!dragState || dragState.metrics || !dragItems.length) return;
        const baseMetrics = measureDragMetrics(scrollRef.current, dragItems, dragState.activeKey);
        const baseScrollTop = scrollRef.current?.scrollTop ?? 0;
        const current = dragStateRef.current;
        if (!current || current.activeKey !== dragState.activeKey || current.metrics) return;
        if (current.outsideBounds) {
          const next = { ...current, metrics:baseMetrics, baseMetrics, baseScrollTop, overId:dragState.activeKey, targetShelf:null, slotIndex:null, disallowed:true };
          dragStateRef.current = next;
          setDragState(next);
          return;
        }
        const sel = resolveSidebarDragSelection({
          items:baseMetrics.items,
          rects:baseMetrics.rects,
          activeKey:dragState.activeKey,
          originShelf:dragState.originShelf,
          pointerY:latestPointerYRef.current || (dragState.originClientY + dragState.deltaY),
          prevZone:dragSelectionRef.current.zone,
          prevSlot:dragSelectionRef.current.slot,
          cardsById:cardsByIdRef.current,
          pendingActions:runtime.store.getSnapshot().pendingActions,
        });
        dragSelectionRef.current = { zone:sel.zone, slot:sel.slot };
        const next = { ...current, metrics:baseMetrics, baseMetrics, baseScrollTop, overId:sel.overId, targetShelf:sel.disallowed ? null : sel.zone, slotIndex:sel.slot, disallowed:sel.disallowed };
        dragStateRef.current = next;
        setDragState(next);
      },[dragState, dragItems, runtime]);

      const cancelDrag = React.useCallback((suppressClick = true) => {
        if (suppressClick && dragStateRef.current) dragSuppressUntilRef.current = Date.now() + 300;
        dragCleanupRef.current?.();
        dragCleanupRef.current = null;
        if (typeof document !== 'undefined') document.body?.removeAttribute('data-t3i-dragging');
        if (dragStateRef.current) listMotionRef.current?.release();
        dragStateRef.current = null;
        setDragState(null);
      },[]);

      React.useEffect(() => {
        if (!dragState) return;
        const stillExists = ordered.bySection && [
          ...ordered.bySection.pinned,
          ...ordered.bySection.active,
          ...ordered.bySection.snoozed,
          ...ordered.bySection.settled,
        ].some((card) => card.sessionId === dragState.activeKey);
        if (!stillExists || query || !wide || view.mode !== 'inbox') cancelDrag(false);
      },[dragState, ordered, query, wide, view.mode, cancelDrag]);

      const applyDropAction = React.useCallback((card, verb, opts = {}) => {
        if (!card || !verb) return;
        if (verb === 'pin') void runtime.pin(card, true, opts);
        else if (verb === 'unpin') void runtime.pin(card, false, opts);
        else if (verb === 'settle') void runtime.act(card, 'settle', opts);
        else if (verb === 'unsettle') void runtime.act(card, 'restore', opts);
        else if (verb === 'wake') void runtime.act(card, 'wake', opts);
      },[runtime]);

      const startDrag = React.useCallback((originCard, originShelf, downEvent) => {
        if (downEvent.button !== 0 || downEvent.metaKey || downEvent.ctrlKey || downEvent.altKey || downEvent.shiftKey) return;
        if (downEvent.target?.closest?.('button, input, select, textarea, a, [role="menuitem"], .t3i-actions, .t3i-tip-host, .t3i-pin, .t3i-slim-action, .t3i-snooze-action')) return;
        if (filterOpen || batchMenu || customSnoozeCard || customSnoozeBatchCards.length > 0 || sweepState) return;
        dragCleanupRef.current?.();
        const originKey = originCard.sessionId;
        const originClientX = downEvent.clientX ?? 0;
        const originClientY = downEvent.clientY ?? 0;
        const scrollEl = scrollRef.current;
        const originScrollTop = scrollEl?.scrollTop ?? 0;
        let latestClientX = originClientX;
        let latestClientY = originClientY;
        latestPointerYRef.current = originClientY;
        let activated = false;
        let autoScrollTimer = 0;

        const isOutsideSidebarX = (clientX) => {
          if (!Number.isFinite(clientX)) return false;
          const rect = scrollRef.current?.getBoundingClientRect?.();
          if (!rect || !(rect.width > 0)) return false;
          return clientX < rect.left - 8 || clientX > rect.right + 8;
        };
        const computeDeltaY = () => (latestClientY - originClientY) + ((scrollRef.current?.scrollTop ?? 0) - originScrollTop);
        const buildCurrentItems = () => {
          const snapState = runtime.store.getSnapshot();
          return buildDragItems(
            orderedSectionsRef.current,
            Boolean(snapState.workingOpen),
            Boolean(snapState.snoozedOpen),
            dragSettledOpenRef.current,
            dragSettledLimitRef.current,
            activeSessionIdRef.current,
          );
        };
        const updateDragState = () => {
          const current = dragStateRef.current;
          if (!current || current.activeKey !== originKey) return;
          const deltaY = computeDeltaY();
          const outsideBounds = isOutsideSidebarX(latestClientX);
          const scrollDelta = current.baseMetrics ? ((scrollRef.current?.scrollTop ?? 0) - (current.baseScrollTop ?? 0)) : 0;
          const metrics = current.baseMetrics
            ? shiftDragMetrics(current.baseMetrics, scrollDelta)
            : current.metrics;
          if (outsideBounds) {
            const next = { ...current, metrics, deltaY, outsideBounds:true, disallowed:true, targetShelf:null, overId:originKey, slotIndex:null };
            dragStateRef.current = next;
            setDragState(next);
            return;
          }
          if (metrics) {
            const sel = resolveSidebarDragSelection({
              items:metrics.items,
              rects:metrics.rects,
              activeKey:originKey,
              originShelf,
              pointerY:latestClientY,
              prevZone:dragSelectionRef.current.zone,
              prevSlot:dragSelectionRef.current.slot,
              cardsById:cardsByIdRef.current,
              pendingActions:runtime.store.getSnapshot().pendingActions,
            });
            dragSelectionRef.current = { zone:sel.zone, slot:sel.slot };
            const next = { ...current, metrics, deltaY, outsideBounds:false, overId:sel.overId, targetShelf:sel.disallowed ? null : sel.zone, slotIndex:sel.slot, disallowed:sel.disallowed };
            dragStateRef.current = next;
            setDragState(next);
          } else {
            const next = { ...current, deltaY, outsideBounds:false };
            dragStateRef.current = next;
            setDragState(next);
          }
        };
        const onContainerScroll = () => {
          if (!activated) return;
          updateDragState();
        };
        const startAutoScroll = () => {
          if (autoScrollTimer || typeof setInterval !== 'function') return;
          autoScrollTimer = setInterval(() => {
            const scroller = scrollRef.current;
            if (!activated || !scroller || isOutsideSidebarX(latestClientX)) return;
            const rect = scroller.getBoundingClientRect?.();
            if (!rect || !(rect.height > 0) || scroller.scrollHeight <= scroller.clientHeight + 1) return;
            const threshold = Math.max(24, Math.min(40, rect.height * 0.08));
            let step = 0;
            if (latestClientY < rect.top + threshold && scroller.scrollTop > 0) {
              step = -Math.max(4, Math.round((1 - Math.max(0, latestClientY - rect.top) / threshold) * 14));
            } else if (latestClientY > rect.bottom - threshold && scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight) {
              step = Math.max(4, Math.round((1 - Math.max(0, rect.bottom - latestClientY) / threshold) * 14));
            }
            if (!step) return;
            const prevTop = scroller.scrollTop;
            scroller.scrollTop = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, prevTop + step));
            if (scroller.scrollTop !== prevTop) updateDragState();
          }, 16);
        };

        const finish = (commit) => {
          if (autoScrollTimer) { clearInterval(autoScrollTimer); autoScrollTimer = 0; }
          scrollEl?.removeEventListener?.('scroll', onContainerScroll);
          window.removeEventListener('mousemove', onMove, true);
          window.removeEventListener('mouseup', onUp, true);
          window.removeEventListener('pointercancel', onCancel, true);
          window.removeEventListener('keydown', onKey, true);
          window.removeEventListener('blur', onCancel);
          document.removeEventListener('visibilitychange', onVis);
          if (dragCleanupRef.current === cleanup) dragCleanupRef.current = null;
          if (typeof document !== 'undefined') document.body?.removeAttribute('data-t3i-dragging');
          const snapDrag = dragStateRef.current;
          if (activated) {
            dragSuppressUntilRef.current = Date.now() + 300;
            listMotionRef.current?.release();
          }
          dragStateRef.current = null;
          setDragState(null);
          if (!commit || !activated || !snapDrag || isOutsideSidebarX(latestClientX)) return;
          const snapState = runtime.store.getSnapshot();
          const finalScrollDelta = snapDrag.baseMetrics ? ((scrollRef.current?.scrollTop ?? 0) - (snapDrag.baseScrollTop ?? 0)) : 0;
          const metrics = (snapDrag.baseMetrics ? shiftDragMetrics(snapDrag.baseMetrics, finalScrollDelta) : snapDrag.metrics) ?? measureDragMetrics(
            scrollRef.current,
            buildDragItems(
              orderedSectionsRef.current,
              Boolean(snapState.workingOpen),
              Boolean(snapState.snoozedOpen),
              dragSettledOpenRef.current,
              dragSettledLimitRef.current,
              activeSessionIdRef.current,
            ),
            originKey,
          );
          const sel = resolveSidebarDragSelection({
            items:metrics.items,
            rects:metrics.rects,
            activeKey:originKey,
            originShelf,
            pointerY:latestClientY,
            prevZone:dragSelectionRef.current.zone,
            prevSlot:dragSelectionRef.current.slot,
            cardsById:cardsByIdRef.current,
            pendingActions:snapState.pendingActions,
          });
          if (sel.disallowed) return;
          const card = cardsByIdRef.current.get(originKey);
          if (!card) return;
          const bySec = orderedSectionsRef.current;
          const draggedOrders = resolveDraggedOrders(bySec, originKey, snapDrag.occurredAt ?? Date.now(), cardsByIdRef.current);
          const proj = projectSidebarDrag({
            items:metrics.items,
            rects:metrics.rects,
            activeKey:originKey,
            overId:sel.overId ?? originKey,
            settledOrder:draggedOrders.settledOrder,
            activeOrder:draggedOrders.activeOrder,
            settledExpanded:dragSettledOpenRef.current,
            settledVisibleCount:dragSettledLimitRef.current,
            routeThreadKey:activeSessionIdRef.current,
            snoozedThreadCount:(bySec?.snoozed ?? []).length,
            containerHeight:metrics.containerHeight,
            footerHeight:metrics.footerHeight,
          });
          const target = proj?.target;
          if (!target) return;
          const verb = resolveDropVerb(originShelf, target.section);
          const pending = Boolean(snapState.pendingActions[originKey]);
          if (!allowedDropVerb(card, verb, pending)) return;
          if (originShelf === 'active' && target.section === 'active') return;
          if (target.section === 'pinned') {
            const currentPinned = (bySec?.pinned ?? []).map((item) => item.sessionId);
            if (originShelf === 'pinned' && target.pinnedOrder.length === currentPinned.length && target.pinnedOrder.every((id, index) => id === currentPinned[index])) {
              return;
            }
            if (savePinnedOrder(target.pinnedOrder)) setOrderRevision((n) => n + 1);
            if (verb) applyDropAction(card, verb, { preservePinnedOrder:true });
            return;
          }
          if (originShelf === 'pinned') {
            const prevPinnedOrder = readPinnedOrder();
            if (prevPinnedOrder && prevPinnedOrder.includes(originKey)) {
              if (savePinnedOrder(prevPinnedOrder.filter((id) => id !== originKey))) setOrderRevision((n) => n + 1);
            }
            if (verb) applyDropAction(card, verb, { pinnedOrderSnapshot:prevPinnedOrder });
            return;
          }
          if (verb) applyDropAction(card, verb);
        };

        const cleanup = () => finish(false);
        const onMove = (event) => {
          const clientX = event.clientX ?? originClientX;
          const clientY = event.clientY ?? originClientY;
          latestClientX = clientX;
          latestClientY = clientY;
          latestPointerYRef.current = clientY;
          if (!activated) {
            if (Math.abs(clientY - originClientY) < 6) return;
            activated = true;
            listMotionRef.current?.suspend();
            dragSelectionRef.current = { zone:originShelf, slot:null };
            if (typeof document !== 'undefined') document.body?.setAttribute('data-t3i-dragging', 'true');
            try { window.getSelection?.()?.removeAllRanges?.(); } catch {}
            const outsideBounds = isOutsideSidebarX(clientX);
            const next = { activeKey:originKey, originShelf, originClientY, deltaY:computeDeltaY(), occurredAt:Date.now(), overId:originKey, targetShelf:outsideBounds ? null : originShelf, slotIndex:null, disallowed:outsideBounds, outsideBounds, metrics:null };
            dragStateRef.current = next;
            setDragState(next);
            scrollEl?.addEventListener?.('scroll', onContainerScroll);
            startAutoScroll();
            return;
          }
          updateDragState();
        };
        const onUp = (event) => {
          if (Number.isFinite(event?.clientX)) latestClientX = event.clientX;
          if (Number.isFinite(event?.clientY)) {
            latestClientY = event.clientY;
            latestPointerYRef.current = event.clientY;
          }
          finish(true);
        };
        const onCancel = () => finish(false);
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          finish(false);
        };
        const onVis = () => { if (document.visibilityState === 'hidden') finish(false); };

        dragCleanupRef.current = cleanup;
        window.addEventListener('mousemove', onMove, true);
        window.addEventListener('mouseup', onUp, true);
        window.addEventListener('pointercancel', onCancel, true);
        window.addEventListener('keydown', onKey, true);
        window.addEventListener('blur', onCancel);
        document.addEventListener('visibilitychange', onVis);
      },[filterOpen, batchMenu, customSnoozeCard, customSnoozeBatchCards.length, sweepState, runtime, applyDropAction]);

      const dragProjection = React.useMemo(() => {
        if (!dragState?.metrics || dragState.disallowed) return null;
        const draggedOrders = resolveDraggedOrders(ordered.bySection, dragState.activeKey, dragState.occurredAt ?? Date.now(), cardsByIdRef.current);
        return projectSidebarDrag({
          items:dragState.metrics.items,
          rects:dragState.metrics.rects,
          activeKey:dragState.activeKey,
          overId:dragState.overId ?? dragState.activeKey,
          settledOrder:draggedOrders.settledOrder,
          activeOrder:draggedOrders.activeOrder,
          settledExpanded:dragSettledOpen,
          settledVisibleCount:dragSettledLimit,
          routeThreadKey:activeSessionId,
          snoozedThreadCount:(ordered.bySection?.snoozed ?? []).length,
          containerHeight:dragState.metrics.containerHeight,
          footerHeight:dragState.metrics.footerHeight,
        });
      },[dragState, ordered.bySection, dragSettledOpen, dragSettledLimit, activeSessionId]);

      const dragTargetShelf = dragState && !dragState.disallowed ? (dragProjection?.target?.section ?? dragState.targetShelf ?? dragState.originShelf) : null;
      const dragOriginCard = isDragging ? cardsByIdRef.current.get(activeKey) : null;
      const dragDropVerbRaw = isDragging && dragTargetShelf ? resolveDropVerb(dragState.originShelf, dragTargetShelf) : null;
      const dragDropVerb = dragDropVerbRaw && allowedDropVerb(dragOriginCard, dragDropVerbRaw, Boolean(view.pendingActions?.[activeKey])) ? dragDropVerbRaw : null;
      const clampedDeltaY = React.useMemo(() => {
        if (!dragState) return 0;
        const startRect = dragState.metrics?.startRect;
        const pinnedHeaderRect = dragState.metrics?.rects?.[0];
        if (startRect?.height > 0 && pinnedHeaderRect) {
          return Math.max((pinnedHeaderRect.top + 24) - startRect.top, dragState.deltaY);
        }
        return dragState.deltaY;
      },[dragState]);
      const shouldSuppressDragClick = React.useCallback(() => Date.now() < dragSuppressUntilRef.current,[]);
      const markerStyle = (marker) => {
        const tr = dragProjection?.transforms.get(sidebarMarkerId(marker));
        return tr && !tr.hidden && tr.y ? { transform:`translate3d(0, ${tr.y}px, 0)` } : undefined;
      };
      const showMoreStyle = (dragProjection && dragState?.metrics?.showMoreTop != null && dragProjection.contentBottom != null)
        ? (() => {
            const dy = Math.round(dragProjection.contentBottom - dragState.metrics.showMoreTop);
            return dy ? { transform:`translate3d(0, ${dy}px, 0)` } : undefined;
          })()
        : undefined;
      const activePlaceholderTr = dragProjection?.transforms.get(sidebarMarkerId('active-placeholder'));
      const activePlaceholderHidden = !activePlaceholderTr || activePlaceholderTr.hidden;
      const settledPlaceholderTr = dragProjection?.transforms.get(sidebarMarkerId('settled-placeholder'));
      const settledPlaceholderHidden = !settledPlaceholderTr || settledPlaceholderTr.hidden;

      const renderRow = (card, compact) => {
        const cardIsDragging = isDragging && card.sessionId === activeKey;
        const cardTr = isDragging && !cardIsDragging ? dragProjection?.transforms.get(card.sessionId) : null;
        let rowStyle = undefined;
        if (cardIsDragging) {
          if (dragState?.metrics && clampedDeltaY) rowStyle = { transform:`translate3d(0, ${clampedDeltaY}px, 0)` };
        } else if (cardTr?.hidden) {
          rowStyle = { opacity:0, pointerEvents:'none' };
        } else if (cardTr && cardTr.y) {
          rowStyle = { transform:`translate3d(0, ${cardTr.y}px, 0)` };
        }
        return h(SessionCard,{
          key:card.sessionId, card, compact,
          selected:selectedThreadSet.has(card.sessionId),
          sweepAction:sweepState?.ids?.has(card.sessionId) ? sweepState.action : null,
          jumpLabel:jumpLabels ? (jumpBySessionId.get(card.sessionId) ?? null) : null,
          rowDrag:{
            isDragging:cardIsDragging,
            dropVerb:cardIsDragging ? dragDropVerb : null,
            dragOverPinned:cardIsDragging && dragTargetShelf === 'pinned',
            isPeer:isDragging && !cardIsDragging,
            style:rowStyle,
            onMouseDown:startDrag,
            shouldSuppressClick:shouldSuppressDragClick,
          },
          onBatchContextMenu:openBatchContext,
          onSweepStart:startSweep,
          portalRootRef:rootRef,
          usePanelInfo, runtime, t,
        });
      };
      const cardRow = (card) => renderRow(card, false);
      const settledRow = (card) => renderRow(card, true);
      const pinnedCards = ordered.bySection?.pinned ?? [];
      const activeCards = ordered.bySection?.active ?? [];
      const workingCards = ordered.bySection?.working ?? [];
      const snoozedCards = ordered.bySection?.snoozed ?? [];
      const settledCards = ordered.bySection?.settled ?? [];
      const showWorkingShelf = view.workingShelfEnabled !== false && workingCards.length > 0;
      const visibleWorkingCards = showWorkingShelf ? visibleShelfCards(workingCards, 'working', view.workingOpen, activeSessionId, dragSettledLimit) : [];
      const showSnoozedShelf = snoozedCards.length > 0;
      const visibleSnoozedCards = showSnoozedShelf ? visibleShelfCards(snoozedCards, 'snoozed', view.snoozedOpen, activeSessionId, dragSettledLimit) : [];
      const showSettledShelf = settledCards.length > 0 || isDragging;
      const visibleSettledCards = showSettledShelf ? visibleShelfCards(settledCards, 'settled', view.settledOpen, activeSessionId, dragSettledLimit) : [];
      const settledRemaining = view.settledOpen ? Math.max(0, settledCards.length - visibleSettledCards.length) : 0;
      const bottomAnchorShelf = showWorkingShelf ? 'working' : showSnoozedShelf ? 'snoozed' : showSettledShelf ? 'settled' : null;
      const hasListContent = pinnedCards.length > 0 || activeCards.length > 0 || showWorkingShelf || showSnoozedShelf || showSettledShelf;
      const listMotionLayoutKey = (() => {
        if (query || !hasListContent) return '';
        const keys = [];
        if (isDragging) keys.push('m:pinned-header');
        for (const card of pinnedCards) keys.push(`pinned:${card.sessionId}`);
        if (isDragging) {
          keys.push('m:pinned-divider');
          keys.push('m:active-placeholder');
        }
        for (const card of activeCards) keys.push(`active:${card.sessionId}`);
        if (showWorkingShelf) {
          keys.push('m:working-header');
          for (const card of visibleWorkingCards) keys.push(`working:${card.sessionId}`);
        }
        if (showSnoozedShelf) {
          keys.push('m:snoozed-header');
          for (const card of visibleSnoozedCards) keys.push(`snoozed:${card.sessionId}`);
        }
        if (showSettledShelf) {
          keys.push('m:settled-header');
          if (isDragging) keys.push('m:settled-placeholder');
          for (const card of visibleSettledCards) keys.push(`settled:${card.sessionId}`);
          if (settledRemaining > 0) keys.push('m:settled-more');
        }
        return keys.join('\n');
      })();
      const shelfExpansionKey = [Boolean(view.workingOpen), Boolean(view.snoozedOpen), Boolean(view.settledOpen)].join(':');
      const previousShelfExpansionKeyRef = React.useRef(shelfExpansionKey);
      React.useLayoutEffect(() => {
        const shelvesUnchanged = previousShelfExpansionKeyRef.current === shelfExpansionKey;
        previousShelfExpansionKeyRef.current = shelfExpansionKey;
        if (!query && hasListContent) {
          listMotionRef.current?.update(!isDragging && shelvesUnchanged);
        }
      }, [query, hasListContent, listMotionLayoutKey, isDragging, shelfExpansionKey]);
      const undo = view.undo;
      const projectCard = (workspace) => ({workspaceTitle:workspace.title,cwd:workspace.path});
      const filterLabel = selectedProjects.length ? resolveLocalized(t, runtime.locale(), 'filterWorkspaceSelected', { projects: selectedProjects.map((workspace) => workspace.title ?? workspace.workspaceId).join(', ') }) : t('filterWorkspace');
      const filterTrigger = h(TooltipButton,{buttonRef:filterTriggerRef,type:'button',className:'t3i-icon-button t3i-project-filter','aria-label':filterLabel,tooltip:filterLabel,tooltipSuppressed:filterOpen,'aria-expanded':filterOpen,'aria-haspopup':'dialog','data-active':selectedIds.length ? 'true' : undefined,onClick:() => filterOpen ? closeFilter(false) : openFilter()},
        selectedProjects.length === 1 ? h(Monogram,{card:projectCard(selectedProjects[0])})
          : selectedProjects.length > 1 ? h('span',{className:'t3i-scope-stack'},selectedProjects.slice(0,2).map((workspace) => h(Monogram,{key:workspace.workspaceId,card:projectCard(workspace)})))
            : h(Icon,{name:'filter',size:16}));
      if (!wide) return h('div',{className:'t3i-root'},
        h('div',{className:'t3i-head'},
          h(ActionButton,{icon:'inbox',label:t('expandInbox'),onClick:expandSidebar})),
        h(ErrorToast,{toast:view.errorToast,runtime,t}));
      return h('div',{ref:rootRef,className:'t3i-root','data-wide':'true'},
        h('div',{ref:headRef,className:'t3i-head'},
          h('div',{className:'t3i-title-row'},
            h('h2',{className:'t3i-title'},t('inbox')),
            h('div',{className:'t3i-search-wrap'},
              h(Icon,{name:'search',size:16,className:'t3i-search-icon'}),
              h('input',{className:'t3i-search',type:'search',role:'combobox','aria-autocomplete':'list','aria-expanded':Boolean(query),'aria-controls':'t3i-search-results','aria-activedescendant':activeSearchDescendantId,value:view.search,placeholder:t('search'),'aria-label':resolveLocalized(t, runtime.locale(), 'searchThreads'),ref:searchRef,
                onChange:(event) => runtime.changeView({search:event.target.value}),
                onKeyDown:(event) => {
                  if (event.key === 'Escape' && view.search) {
                    event.preventDefault(); event.stopPropagation();
                    runtime.changeView({search:''});
                    return;
                  }
                  if (!query || !searchHits.length) return;
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    searchKeyNavRef.current = true;
                    const delta = event.key === 'ArrowDown' ? 1 : -1;
                    const nextIdx = (activeSearchIndex + delta + searchHits.length) % searchHits.length;
                    setSearchHighlightId(searchHits[nextIdx]?.card.sessionId ?? null);
                    setSearchNavTick((count) => count + 1);
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    const hit = searchHits[activeSearchIndex];
                    if (hit) {
                      runtime.changeView({search:''});
                      runtime.openCard(hit.card);
                    }
                  }
                }}),
              view.search ? h(TooltipButton,{type:'button',className:'t3i-search-clear','aria-label':t('clearSearch'),tooltip:t('clearSearch'),onClick:() => { runtime.changeView({search:''}); searchRef.current?.focus({ preventScroll:true }); }},h(Icon,{name:'close',size:12})) : null),
            /* T3 search chrome has no needs-count pill — keep quiet */
            h('div',{className:'t3i-head-actions'},
              h('div',{ref:filterAnchorRef,className:'t3i-filter-anchor'},
              filterTrigger,
              filterOpen ? h('div',{className:'t3i-filter-popover',role:'dialog','aria-label':t('filterWorkspace'),style:filterPlace ? {left:filterPlace.left,top:filterPlace.top,width:filterPlace.width} : undefined},
                h('div',{className:'t3i-project-query'},
                  h(Icon,{name:'search',size:14}),
                  h('input',{ref:projectQueryRef,className:'t3i-project-query-input',value:projectQuery,placeholder:t('searchProjects'),'aria-label':t('searchProjects'),onChange:(event) => { setProjectQuery(event.target.value); setFilterHighlightIdx(0); }})),
                h('div',{className:'t3i-project-options'},
                  showAllFilterOption ? h('button',{type:'button',role:'menuitem',className:'t3i-project-option','data-selected':String(selectedIds.length === 0),'data-highlighted':activeFilterIdx === 0 ? 'true' : undefined,onMouseMove:() => { if (filterHighlightIdx !== 0) setFilterHighlightIdx(0); },onClick:() => selectFilterOption({ kind:'all' })},
                    h('span',{className:'t3i-project-icon-wrap'},
                      h(Icon,{name:'folder',size:16}),
                      selectedIds.length === 0 ? h('span',{className:'t3i-project-badge','aria-hidden':true},h(Icon,{name:'check',size:9})) : null),
                    h('span',{className:'t3i-project-option-label'},t('all'))) : null,
                  filteredProjects.map((workspace, projectIdx) => {
                    const optionIdx = (showAllFilterOption ? 1 : 0) + projectIdx;
                    const selected = selectedSet.has(workspace.workspaceId);
                    return h('button',{key:workspace.workspaceId,type:'button',role:'menuitemcheckbox','aria-checked':selected,className:'t3i-project-option','data-selected':String(selected),'data-highlighted':activeFilterIdx === optionIdx ? 'true' : undefined,onMouseMove:() => { if (filterHighlightIdx !== optionIdx) setFilterHighlightIdx(optionIdx); },onClick:(event) => selectFilterOption({ kind:'workspace', workspace }, { multi: event.shiftKey })},
                      h('span',{className:'t3i-project-icon-wrap'},
                        h(Monogram,{card:projectCard(workspace)}),
                        selected ? h('span',{className:'t3i-project-badge','aria-hidden':true},h(Icon,{name:'check',size:9})) : null),
                      h('span',{className:'t3i-project-option-label'},workspace.title ?? workspace.path ?? workspace.workspaceId));
                  }),
                  filteredProjects.length === 0 ? h('div',{className:'t3i-filter-empty'},t('noProjects')) : null)) : null),
            h(ActionButton,{icon:'folderPlus',label:t('addProject'),onClick:() => { void runtime.addProject(); }}),
            h('div',{ref:newAnchorRef,className:'t3i-filter-anchor'},
              h(ActionButton,{
                icon:'compose',
                label:t('newSession'),
                tooltip:t('newSession'),
                tooltipSub:workspaceItems.length > 1 && selectedIds.length !== 1 ? t('newThreadInHint') : null,
                tooltipSuppressed:workspaceItems.length > 1 && selectedIds.length !== 1 ? newMenuOpen : false,
                buttonRef:newTriggerRef,
                controls:workspaceItems.length > 1 && selectedIds.length !== 1 ? newMenuId : undefined,
                expanded:workspaceItems.length > 1 && selectedIds.length !== 1 ? newMenuOpen : undefined,
                onClick:(event) => {
                  if (workspaceItems.length > 1 && selectedIds.length !== 1 && !event.shiftKey) {
                    if (newMenuOpen) closeNewMenu(false);
                    else openNewMenu();
                    return;
                  }
                  closeNewMenu(false);
                  runtime.startSession(selectedIds.length === 1 ? selectedIds[0] : (workspaceItems[0]?.workspaceId ?? undefined));
                },
              }),
              newMenuOpen ? h('div',{id:newMenuId,ref:newMenuRef,className:'t3i-new-menu',role:'menu','aria-label':t('newThreadInTitle'),style:newMenuPlace ? {left:newMenuPlace.left,top:newMenuPlace.top,width:newMenuPlace.width} : undefined},
                h('div',{className:'t3i-new-menu-label'},t('newThreadInTitle')),
                h('div',{className:'t3i-new-menu-list'},
                  workspaceItems.map((workspace) => h('button',{key:workspace.workspaceId,type:'button',role:'menuitem',className:'t3i-project-option',onClick:() => { closeNewMenu(false); runtime.startSession(workspace.workspaceId); }},
                    h(Monogram,{card:projectCard(workspace)}),
                    h('span',{className:'t3i-project-option-label'},workspace.title ?? workspace.path ?? workspace.workspaceId))))) : null)))),
        h('div',{ref:scrollRef,className:'t3i-scroll',onScroll:() => { emitPreview({clear:true,fromScroll:true}); updateScrollFade(); }},
          query ? (searchHits.length ? h('div',{id:'t3i-search-results',className:'t3i-search-list',role:'listbox','aria-label':resolveLocalized(t, runtime.locale(), 'searchResults')},
            searchHits.map(({ card, ranges, snippet }, index) => h(SearchResultRow,{key:card.sessionId,card,query,ranges,snippet,optionId:`t3i-search-hit-${index}`,active:index === activeSearchIndex,routeActive:card.sessionId === activeSessionId,runtime,onHover:() => setSearchHighlightId(card.sessionId),t})))
            : h('div',{className:'t3i-empty',role:'status'},t('emptySearch')))
          : hasListContent
            ? h('ul',{ref:attachListMotionRef,className:'t3i-list',role:'presentation'},
                isDragging ? h(DragBoundary,{key:'pinned-header',marker:'pinned-header',label:t('pinned'),target:dragTargetShelf === 'pinned',style:markerStyle('pinned-header')}) : null,
                ...pinnedCards.map(cardRow),
                isDragging ? h(DragBoundary,{key:'pinned-divider',marker:'pinned-divider',label:t('active'),target:dragTargetShelf === 'active',style:markerStyle('pinned-divider')}) : null,
                isDragging ? h(DropPlaceholder,{key:'active-placeholder',marker:'active-placeholder',label:t('active'),hidden:activePlaceholderHidden,target:dragTargetShelf === 'active',style:markerStyle('active-placeholder')}) : null,
                ...activeCards.map(cardRow),
                showWorkingShelf ? h(ShelfHeader,{key:'working-header',id:'working',title:resolveLocalized(t, runtime.locale(), 'workingSection'),count:workingCards.length,open:view.workingOpen,marker:'working-header',bottomAnchor:bottomAnchorShelf === 'working',style:markerStyle('working-header'),onToggle:() => runtime.toggleShelf('working')}) : null,
                ...visibleWorkingCards.map(cardRow),
                showSnoozedShelf ? h(ShelfHeader,{key:'snoozed-header',id:'snoozed',title:t('snoozed'),count:snoozedCards.length,open:view.snoozedOpen,marker:'snoozed-header',bottomAnchor:bottomAnchorShelf === 'snoozed',style:markerStyle('snoozed-header'),onToggle:() => runtime.toggleShelf('snoozed')}) : null,
                ...visibleSnoozedCards.map(settledRow),
                showSettledShelf ? h(ShelfHeader,{key:'settled-header',id:'settled',title:t('settled'),count:settledCards.length,open:view.settledOpen,marker:'settled-header',bottomAnchor:bottomAnchorShelf === 'settled',dragging:isDragging,isDropTarget:dragTargetShelf === 'settled',style:markerStyle('settled-header'),onToggle:() => runtime.toggleShelf('settled')}) : null,
                isDragging ? h(DropPlaceholder,{key:'settled-placeholder',marker:'settled-placeholder',label:t('settled'),hidden:settledPlaceholderHidden,target:dragTargetShelf === 'settled',revealOverflow:true,style:markerStyle('settled-placeholder')}) : null,
                ...visibleSettledCards.map(settledRow),
                settledRemaining > 0
                  ? (() => {
                      const nextCount = Math.min(settledRemaining, SETTLED_PAGE_COUNT);
                      const useOne = nextCount === 1 && (typeof t !== 'function' || t('showMoreOne', { count: 1 }) !== 'showMoreOne');
                      const showMoreLabel = resolveLocalized(t, runtime.locale(), useOne ? 'showMoreOne' : 'showMore', { count: nextCount });
                      return h('li',{key:'settled-show-more',className:`t3i-list-more${isDragging ? ' t3i-drag-peer' : ''}`,'data-section-more':'settled',style:showMoreStyle},
                        h('button',{type:'button',className:'t3i-show-more',onClick:() => runtime.showMoreSettled?.()},h(Icon,{name:'chevron',size:16}),h('span',null,showMoreLabel)));
                    })()
                  : null)
            : (workspaceItems.length === 0
              ? h('div',{className:'t3i-empty-contextual',role:'status'},
                  h('p',null,t('noProjectsYet')),
                  h('button',{type:'button',className:'t3i-empty-add',onClick:() => { void runtime.addProject(); }},
                    h(Icon,{name:'folderPlus',size:14}),
                    h('span',null,t('addProject'))))
              : selectedProjects.length > 1
                ? h('div',{className:'t3i-empty-contextual',role:'status'},h('p',null,t('noThreadsInProjects')))
                : selectedProjects.length === 1
                  ? h('div',{className:'t3i-empty-contextual',role:'status'},h('p',null,resolveLocalized(t, runtime.locale(), 'noThreadsInProject', { name: selectedProjects[0].title ?? selectedProjects[0].path ?? selectedProjects[0].workspaceId })))
                  : h('div',{className:'t3i-empty-contextual',role:'status'},h('p',null,t('noThreadsYet'))))),
        h(InboxFooter,{undo,panelsPosition:view.panelsPosition,globalPanels:view.globalPanels,activePanelId:panel?.activePanelId ?? null,renderFactorySlot,runtime,t}),
        h(ErrorToast,{toast:view.errorToast,runtime,t}),
        batchMenu ? h(BatchContextMenu,{menu:batchMenu,runtime,t,onClose:() => setBatchMenu(null)}) : null,
        (customSnoozeCard || customSnoozeBatchCards.length > 0) ? h(CustomSnoozeModal,{
          count:customSnoozeBatchCards.length || 1,
          locale:runtime.locale(),
          returnFocusEl:runtime.getCustomSnoozeReturnFocus?.() ?? null,
          t,
          onCancel:() => runtime.closeCustomSnooze?.(),
          onEditOptions:() => { const opened = runtime.openInboxSettings({editSnooze:true}); if (opened) runtime.closeCustomSnooze(); return opened; },
          onChoose:(until) => {
            runtime.closeCustomSnooze?.();
            const iso = new Date(until).toISOString();
            if (customSnoozeBatchCards.length) void runtime.actMany?.(customSnoozeBatchCards,'snooze',{until:iso});
            else void runtime.act(customSnoozeCard,'snooze',{until:iso});
          },
        }) : null);
    }

    function SidebarSwitchIcon({ size = 16, destination }) {
      const outline = destination === 'workspaces'
        ? 'M1.75 4.5A1.25 1.25 0 0 1 3 3.25h3l1.4 1.5H13A1.25 1.25 0 0 1 14.25 6v5.5A1.25 1.25 0 0 1 13 12.75H3a1.25 1.25 0 0 1-1.25-1.25Z'
        : 'm1.75 8 2.1-4a1 1 0 0 1 .88-.5h6.54a1 1 0 0 1 .88.5l2.1 4v3.25A1.25 1.25 0 0 1 13 12.5H3a1.25 1.25 0 0 1-1.25-1.25ZM1.75 8h3.6l1.2 1.75h2.9L10.65 8h3.6';
      return h('svg',{
        width:size,height:size,viewBox:'0 0 16 16',fill:'none',stroke:'currentColor',
        strokeWidth:1.15,strokeLinecap:'round',strokeLinejoin:'round',
        className:'t3i-sidebar-switch-icon','aria-hidden':true,focusable:'false',
      },h('path',{d:outline}));
    }
    function InboxSettingsNavIcon({ size = 16 }) {
      return h('svg',{
        width:size,height:size,viewBox:'0 0 16 16',fill:'none',stroke:'currentColor',
        strokeWidth:1.35,strokeLinecap:'round',strokeLinejoin:'round',
        className:'t3i-settings-nav-icon','aria-hidden':true,focusable:'false',
      },
        h('path',{d:'M2.25 8.25 4.05 4.1a1.1 1.1 0 0 1 1.01-.66h5.88a1.1 1.1 0 0 1 1.01.66l1.8 4.15v3.35A1.4 1.4 0 0 1 12.35 13h-8.7a1.4 1.4 0 0 1-1.4-1.4Z'}),
        h('path',{d:'M2.25 8.25h3.4l1.15 1.75h2.4l1.15-1.75h3.4'}));
    }

    function InboxPanelLauncher({ inbox:runtime }) {
      React.useLayoutEffect(() => { runtime.toggleInboxFromPanel(); },[runtime]);
      return null;
    }

    function InboxActivation({ inbox:runtime, onDismiss }) {
      React.useLayoutEffect(() => {
        runtime.applyActivationDefaults();
        onDismiss();
      },[runtime,onDismiss]);
      return null;
    }

    return {
      inject: ['slots','locale','layout','uiWorkspace','remote','sessions','workspaces','cordisInspect','shortcuts','contextMenus'],
      async apply(ctx) {
        await mountRemote(ctx);
        const store = createViewStore();
        let active = true;
        const lifetime = new AbortController();
        let retry = null;
        let streamController = null;
        const UNDO_TTL_MS = 5000;
        let liveUndos = [];
        const consumedUndoIds = new Set();
        const deferredUndoSessions = new Map();
        let undoTimer = 0;
        let shortcutClaimed = false;
        let heldUndoKey = null;
        const deferUndoFor = (ids) => {
          const keys = [...new Set(ids)].filter(Boolean);
          for (const id of keys) deferredUndoSessions.set(id, (deferredUndoSessions.get(id) ?? 0) + 1);
          return () => {
            for (const id of keys) {
              const next = (deferredUndoSessions.get(id) ?? 1) - 1;
              if (next <= 0) deferredUndoSessions.delete(id);
              else deferredUndoSessions.set(id, next);
            }
          };
        };
        const clearPending = (sessionId) => {
          if (!active || !sessionId) return;
          const now = store.getSnapshot();
          if (!now.pendingActions[sessionId]) return;
          const pending = { ...now.pendingActions };
          delete pending[sessionId];
          store.set({ pendingActions: pending });
        };
        const setOptimisticCard = (sessionId, entry) => {
          if (!active || !sessionId || !entry) return;
          const now = store.getSnapshot();
          store.set({ optimisticCards: { ...(now.optimisticCards ?? {}), [sessionId]: entry } });
        };
        const clearOptimisticCard = (sessionId, token) => {
          if (!active || !sessionId) return;
          const now = store.getSnapshot();
          const currentEntry = now.optimisticCards?.[sessionId];
          if (!currentEntry || (token !== undefined && currentEntry.token !== token)) return;
          const next = { ...now.optimisticCards };
          delete next[sessionId];
          store.set({ optimisticCards: next });
        };
        const hasLiveUndo = () => {
          const now = Date.now();
          return liveUndos.some((entry) => entry.expiresAt > now);
        };
        const refreshUndoNotice = (force = false) => {
          const now = Date.now();
          const expired = liveUndos.filter((entry) => entry.expiresAt <= now);
          if (expired.length) {
            for (const entry of expired) {
              consumedUndoIds.add(entry.id);
              if (entry.operationId) consumedUndoIds.add(entry.operationId);
            }
            liveUndos = liveUndos.filter((entry) => entry.expiresAt > now);
          }
          clearTimeout(undoTimer);
          undoTimer = 0;
          if (!liveUndos.length) {
            shortcutClaimed = false;
            if (store.getSnapshot().undo) store.set({undo:null});
            return;
          }
          const earliest = Math.min(...liveUndos.map((entry) => entry.expiresAt));
          undoTimer = setTimeout(() => { if (active) refreshUndoNotice(); }, Math.max(10, earliest - now + 10));
          const latest = liveUndos.at(-1);
          const group = [];
          for (let index = liveUndos.length - 1; index >= 0; index--) {
            const entry = liveUndos[index];
            if (entry.action !== latest.action) break;
            group.unshift(entry);
          }
          const newest = group.at(-1);
          const notice = {
            id:group.map((entry) => entry.id).join(':'),
            action:latest.action,
            count:group.length,
            items:group,
            operationIds:group.map((entry) => entry.operationId).filter(Boolean),
            operationId:newest.operationId ?? newest.id,
            sessionId:newest.sessionId,
            kind:newest.kind,
            expiresAt:Math.max(...group.map((entry) => entry.expiresAt)),
          };
          const prev = store.getSnapshot().undo;
          if (force || !prev || prev.id !== notice.id || prev.count !== notice.count || prev.expiresAt !== notice.expiresAt) {
            store.set({undo:notice});
          }
        };
        const pushUndo = (entry, opts = {}) => {
          if (!entry || !Number.isFinite(entry.expiresAt) || entry.expiresAt <= Date.now()) return;
          if (entry.operationId && consumedUndoIds.has(entry.operationId)) return;
          if (consumedUndoIds.has(entry.id)) return;
          let normalized = entry;
          if (entry.action === 'Unpinned' && entry.sawUnpinned === undefined) {
            const pinnedSet = new Set(ctx.workspaces?.list?.getSnapshot?.()?.pinnedSessionIds ?? ctx.workspaces?.list?.getSnapshot?.()?.pinnedIds ?? []);
            normalized = { ...entry, sawUnpinned: !pinnedSet.has(entry.sessionId) };
          }
          const existingIndex = normalized.operationId ? liveUndos.findIndex((item) => item.operationId === normalized.operationId) : -1;
          if (existingIndex >= 0) {
            liveUndos[existingIndex] = { ...liveUndos[existingIndex], ...normalized };
          } else {
            liveUndos.push(normalized);
          }
          shortcutClaimed = true;
          if (!opts.deferRefresh) refreshUndoNotice(true);
        };
        const invalidateUndo = (sessionId, actions = null) => {
          if (!sessionId || !liveUndos.length) return;
          let changed = false;
          liveUndos = liveUndos.filter((entry) => {
            const match = entry.sessionId === sessionId && (!actions || actions.includes(entry.action));
            if (match) {
              changed = true;
              consumedUndoIds.add(entry.id);
              if (entry.operationId) consumedUndoIds.add(entry.operationId);
            }
            return !match;
          });
          if (changed) refreshUndoNotice();
        };
        const readWorkspacePinnedIds = () => (
          ctx.workspaces?.list?.getSnapshot?.()?.pinnedSessionIds
          ?? ctx.workspaces?.list?.getSnapshot?.()?.pinnedIds
          ?? []
        );
        let prevPinnedIds = new Set(readWorkspacePinnedIds());
        const managedPinOps = new Map();
        const markManagedPinOp = (sessionId, pinned) => {
          const op = { pinned: Boolean(pinned), expiresAt: Date.now() + 5000 };
          managedPinOps.set(sessionId, op);
          return op;
        };
        const clearManagedPinOp = (sessionId, op) => {
          if (managedPinOps.get(sessionId) === op) managedPinOps.delete(sessionId);
        };
        const consumeManagedPinOp = (sessionId, pinned) => {
          const op = managedPinOps.get(sessionId);
          if (!op) return false;
          if (op.expiresAt <= Date.now()) {
            managedPinOps.delete(sessionId);
            return false;
          }
          if (op.pinned !== Boolean(pinned)) return false;
          managedPinOps.delete(sessionId);
          return true;
        };
        const reconcilePinnedUndo = () => {
          if (!liveUndos.some((entry) => entry.action === 'Unpinned')) return;
          const pinnedSet = new Set(readWorkspacePinnedIds());
          let changed = false;
          liveUndos = liveUndos.filter((entry) => {
            if (entry.action !== 'Unpinned') return true;
            if (!pinnedSet.has(entry.sessionId)) {
              entry.sawUnpinned = true;
              return true;
            }
            if (!entry.sawUnpinned) return true;
            changed = true;
            consumedUndoIds.add(entry.id);
            return false;
          });
          if (changed) refreshUndoNotice();
        };
        const reconcileWorkspacePins = () => {
          reconcilePinnedUndo();
          const curIds = readWorkspacePinnedIds();
          const curSet = new Set(curIds);
          const added = curIds.filter((id) => !prevPinnedIds.has(id));
          const removed = [...prevPinnedIds].filter((id) => !curSet.has(id));
          prevPinnedIds = curSet;
          const addedExternally = added.filter((id) => !consumeManagedPinOp(id, true));
          const removedExternally = removed.filter((id) => !consumeManagedPinOp(id, false));
          let orderChanged = false;
          for (const id of removedExternally) {
            if (removePinnedOrderId(id)) orderChanged = true;
          }
          const remoteSnap = store.getSnapshot().remote;
          if (addedExternally.length > 0 && remoteSnap) {
            const existingOrder = readPinnedOrder();
            if (curIds.length > 1 || (Array.isArray(existingOrder) && existingOrder.length > 0)) {
              const addedSet = new Set(addedExternally);
              const existingPinnedCards = (remoteSnap.cards ?? []).filter(
                (item) => curSet.has(item.sessionId) && !addedSet.has(item.sessionId),
              );
              const orderedExistingIds = sortPinnedCards(existingPinnedCards, existingOrder).map((item) => item.sessionId);
              for (const id of curIds) {
                if (!addedSet.has(id) && !orderedExistingIds.includes(id)) orderedExistingIds.push(id);
              }
              const nextPinnedOrder = [...addedExternally.slice().reverse(), ...orderedExistingIds];
              if (savePinnedOrder(nextPinnedOrder)) orderChanged = true;
            }
            for (const id of addedExternally) {
              const remoteCard = remoteSnap.cards?.find((item) => item.sessionId === id);
              if (!remoteCard) continue;
              const needsPromotion = remoteCard.section === 'settled'
                || remoteCard.section === 'snoozed'
                || remoteCard.settledAt != null
                || remoteCard.snooze != null
                || remoteCard.snoozeUntil != null;
              if (!needsPromotion) continue;
              invalidateUndo(id, null);
              if (typeof inboxRemote(ctx)?.pin === 'function') {
                void inboxRemote(ctx).pin({ sessionId: id, pinned: true }, lifetime.signal)
                  .then((res) => { if (active && res?.ok) runtime.syncSnapshot?.(); })
                  .catch(() => {});
              }
            }
          }
          if (orderChanged) {
            store.set({ viewRevision: store.getSnapshot().viewRevision + 1 });
          }
        };
        const acceptSnapshot = (snapshot) => {
          const current = store.getSnapshot().remote;
          const previous = current?.snoozeSettings;
          const incoming = snapshot?.snoozeSettings;
          const keep = current?.generation === snapshot?.generation && previous &&
            (previous.revision > (incoming?.revision ?? -1));
          const remote = keep ? {...snapshot,snoozeSettings:previous} : snapshot;
          const snapState = store.getSnapshot();
          const cardMap = new Map((remote?.cards ?? []).map((card) => [card.sessionId, card]));
          const sameGeneration = Boolean(current) && current.generation === snapshot?.generation;
          const prevOptimistic = snapState.optimisticCards ?? {};
          const nextOptimistic = {};
          let optimisticPruned = false;
          for (const [id, entry] of Object.entries(prevOptimistic)) {
            const incomingCard = cardMap.get(id);
            if (sameGeneration && incomingCard && incomingCard.revision === entry.baseRevision) {
              nextOptimistic[id] = entry;
            } else {
              optimisticPruned = true;
            }
          }
          const optimisticPatch = optimisticPruned ? { optimisticCards: nextOptimistic } : {};
          const nextSelected = (snapState.selectedIds ?? []).filter((id) => cardMap.has(id));
          const selectionPatch = nextSelected.length !== (snapState.selectedIds ?? []).length
            ? { selectedIds:nextSelected, anchorId:cardMap.has(snapState.anchorId) ? snapState.anchorId : null }
            : {};
          if (snapshot?.error) {
            if (snapshot.error !== current?.error) reportError('refresh', snapshot.error);
            store.set({remote, ...selectionPatch, ...optimisticPatch});
            return;
          }
          const prevToast = snapState.errorToast;
          // Publish a visible completion and its visit together so the sidebar never renders it as Done.
          const viewed = snapState.panelKey === 'conversation' ? cardMap.get(snapState.currentSessionId) : null;
          const visitPatch = viewed?.newResult && !viewed.manualUnread
            ? advanceVisits(snapState.visited,[viewed.sessionId],viewed.result?.time)
            : {};
          const errorPatch = prevToast?.kind === 'refresh' ? {actionError:null,errorToast:null} : {};
          store.set({remote,error:null,...errorPatch,...selectionPatch,...visitPatch,...optimisticPatch});
          reconcilePinnedUndo();
          const now = Date.now();
          for (const receipt of remote?.receipts ?? []) {
            if (receipt.kind === 'restore') invalidateUndo(receipt.sessionId, ['Settled']);
            else if (receipt.kind === 'wake') invalidateUndo(receipt.sessionId, ['Snoozed']);
          }
          let addedFromStream = false;
          for (const receipt of remote?.receipts ?? []) {
            if (!['settle','snooze'].includes(receipt.kind)) continue;
            if (!receipt.operationId || consumedUndoIds.has(receipt.operationId)) continue;
            if (!Number.isFinite(receipt.expiresAt) || receipt.expiresAt <= now) continue;
            if (snapState.pendingActions?.[receipt.sessionId] || deferredUndoSessions.has(receipt.sessionId)) continue;
            const liveCard = cardMap.get(receipt.sessionId);
            if (receipt.kind === 'settle' && liveCard && liveCard.section !== 'settled') continue;
            if (receipt.kind === 'snooze' && liveCard && !isCardSnoozed(liveCard)) continue;
            if (!liveUndos.some((entry) => entry.operationId === receipt.operationId)) {
              liveUndos.push({
                id:receipt.operationId,
                operationId:receipt.operationId,
                sessionId:receipt.sessionId,
                action:receipt.kind === 'snooze' ? 'Snoozed' : 'Settled',
                kind:receipt.kind,
                expiresAt:receipt.expiresAt,
              });
              addedFromStream = true;
            }
          }
          if (addedFromStream) shortcutClaimed = true;
          refreshUndoNotice();
        };
        const pendingOverlay = resolvePendingOverlay();
        const runningOverlay = resolveRunningOverlay();
        let customSnoozeReturnFocus = null;
        const currentCard = (sessionId) => {
          const remote = store.getSnapshot().remote;
          const raw = remote?.cards?.find((item) => item.sessionId === sessionId) ?? null;
          if (!raw) return null;
          return enrichCard(raw, ctx.workspaces?.list?.getSnapshot?.(), ctx.sessions?.list?.getSnapshot?.(), remote?.phase, pendingOverlay, runningOverlay);
        };
        const reportError = (kind, raw, opts = {}) => {
          if (raw) console.warn(`t3-inbox ${kind} failed:`, raw);
          const t = (key) => translate(runtime.locale(), key);
          const mapped = mapFriendlyError(kind, raw, t, opts);
          store.set({actionError:mapped.message,errorToast:{id:crypto.randomUUID(),kind,title:mapped.title,description:mapped.description}});
        };
        const housekeepingInFlight = new Set();
        const quietOpenHousekeeping = (sessionId, fallbackCard = null) => {
          if (!sessionId || housekeepingInFlight.has(sessionId)) return;
          const initial = currentCard(sessionId) ?? fallbackCard;
          if (!initial) return;
          if (!needsSilentPrepare(initial) && !initial.woke && !initial.unreadAt) return;
          housekeepingInFlight.add(sessionId);
          void (async () => {
            try {
              let current = currentCard(sessionId) ?? initial;
              if (needsSilentPrepare(current)) {
                const ready = await runtime.prepare(current);
                if (!ready) return;
                current = currentCard(sessionId) ?? current;
              }
              if (current.woke && current.context) await runtime.act(current,'ack-woke',{silentError:true});
              const latest = currentCard(sessionId) ?? current;
              if (latest.unreadAt && latest.context) await runtime.act(latest,'clear-unread',{silentError:true});
            } finally {
              housekeepingInFlight.delete(sessionId);
            }
          })();
        };
        const runtime = {
          store, shortcuts:ctx.shortcuts,
          locale:() => {
            const locale = ctx.locale.getLocale();
            return locale.active ?? locale.id ?? 'en';
          },
          reportError,
          dismissError(id) {
            const current = store.getSnapshot();
            if (id && current.errorToast && current.errorToast.id !== id) return;
            store.set({error:null,actionError:null,errorToast:null});
          },
          noteWide(wide) { if (store.getSnapshot().wide !== wide) store.set({wide}); },
          changeView(patch) {
            const current = store.getSnapshot();
            const searchChanged = 'search' in patch && patch.search !== current.search;
            store.set({
              ...patch,
              ...(searchChanged ? { selectedIds:[], anchorId:null } : {}),
              viewRevision:current.viewRevision + 1,
            });
          },
          toggleShelf(id) {
            const field = id === 'working' ? 'workingOpen' : id === 'snoozed' ? 'snoozedOpen' : id === 'settled' ? 'settledOpen' : null;
            if (!field) return;
            const next = !store.getSnapshot()[field];
            if (SHELF_EXPANDED_KEYS[id]) writeShelfExpanded(SHELF_EXPANDED_KEYS[id], next);
            store.set({[field]:next});
          },
          showMoreSettled() {
            const current = store.getSnapshot().settledLimit ?? SETTLED_INITIAL_COUNT;
            store.set({ settledLimit:current + SETTLED_PAGE_COUNT });
          },
          orderedSessionIds() {
            const snap = store.getSnapshot();
            const workspacesSnap = ctx.workspaces?.list?.getSnapshot?.();
            const sessionsSnap = ctx.sessions?.list?.getSnapshot?.();
            const panelSnap = ctx.layout?.panelInfo?.getSnapshot?.();
            const rawCards = (snap.remote?.cards ?? []).map((card) => enrichCard(card, workspacesSnap, sessionsSnap, snap.remote?.phase, pendingOverlay, runningOverlay, snap.optimisticCards));
            const selectedWorkspaces = snap.workspaceIds?.length ? snap.workspaceIds : (snap.workspaceId ? [snap.workspaceId] : []);
            const workspaceSet = new Set(selectedWorkspaces);
            const matching = rawCards.filter((card) => (workspaceSet.size === 0 || workspaceSet.has(card.workspaceId)) && (!card.archived || card.needsYou));
            const pKey = (panelSnap?.activePanelId ?? null) ?? snap.panelKey ?? 'conversation';
            const activeId = pKey === 'conversation' ? (Object.values(sessionsSnap?.byId ?? {}).find((session) => (session.retainedBy?.mainView ?? 0) > 0)?.id ?? snap.currentSessionId ?? null) : null;
            return visibleOrderedCards(matching, snap, activeId).orderedIds;
          },
          toggleSelect(sessionId) {
            if (!sessionId) return;
            const snap = store.getSnapshot();
            const next = new Set(snap.selectedIds ?? []);
            if (next.has(sessionId)) next.delete(sessionId);
            else next.add(sessionId);
            store.set({
              selectedIds:[...next],
              anchorId:next.has(sessionId) ? sessionId : snap.anchorId,
            });
          },
          rangeSelect(sessionId, orderedIds = null) {
            if (!sessionId) return;
            const snap = store.getSnapshot();
            const list = Array.isArray(orderedIds) ? orderedIds : runtime.orderedSessionIds();
            const anchor = snap.anchorId;
            const anchorIndex = anchor ? list.indexOf(anchor) : -1;
            const targetIndex = list.indexOf(sessionId);
            if (!anchor || anchorIndex === -1 || targetIndex === -1) {
              const next = new Set(snap.selectedIds ?? []);
              next.add(sessionId);
              store.set({ selectedIds:[...next], anchorId:sessionId });
              return;
            }
            const next = new Set(snap.selectedIds ?? []);
            const start = Math.min(anchorIndex, targetIndex);
            const end = Math.max(anchorIndex, targetIndex);
            for (let i = start; i <= end; i++) {
              if (list[i] !== undefined) next.add(list[i]);
            }
            store.set({ selectedIds:[...next], anchorId:anchor });
          },
          clearSelection(anchorId = null) {
            const snap = store.getSnapshot();
            if (!(snap.selectedIds?.length > 0) && snap.anchorId === anchorId) return;
            store.set({ selectedIds:[], anchorId });
          },
          undoShortcutLabel() {
            return isMacPlatform(ctx.shortcuts) ? '⌘Z' : 'Ctrl+Z';
          },
          undoLatest() {
            const current = store.getSnapshot().undo;
            if (!current) return false;
            void runtime.undo(current);
            return true;
          },
          notePanel(value, mainSessionId) {
            const rawPanel = value?.activePanelId ?? null;
            if (rawPanel === INBOX_PANEL_ID) return;
            const panelKey = rawPanel ?? 'conversation';
            const sessionId = panelKey === 'conversation' ? mainSessionId : null;
            const signature = `${panelKey}:${sessionId ?? ''}`;
            const current = store.getSnapshot();
            if (current.panelSignature === signature) return;
            const epoch = current.navigationEpoch + 1;
            let owner = null;
            const pending = current.pendingNavigation;
            if (pending && pending.signature === signature) owner = {operationId:pending.operationId,origin:pending.origin,signature,epoch};
            // Close the previous visit at navigation time, including results still in transit.
            const visitPatch = advanceVisits(current.visited,[current.currentSessionId,sessionId],Date.now());
            store.set({panelSignature:signature,panelKey,currentSessionId:sessionId,navigationEpoch:epoch,navigationOwner:owner,pendingNavigation:null,...visitPatch});
            if (sessionId) quietOpenHousekeeping(sessionId);
          },
          openSession(id) { store.set({pendingNavigation:null,navigationOwner:null}); ctx.uiWorkspace.openSession(id); },
          markVisited(sessionId, at = Date.now()) {
            const patch = advanceVisits(store.getSnapshot().visited,[sessionId],at);
            if (patch.visited) store.set(patch);
          },
          isUnread(card) {
            if (card.manualUnread) return true;
            if (!card.newResult) return false;
            const completedAt = card.result?.time ?? card.sortAt;
            if (!Number.isFinite(completedAt)) return false;
            return completedAt > (store.getSnapshot().visited?.[card.sessionId] ?? 0);
          },
          /** Production SessionCard corner decision (Done vs relative time). */
          cardCornerMeta(card) {
            return cardCornerMeta(card, runtime.isUnread(card));
          },
          cardStatusSource() { return cardStatusSource; },
          setWorkspaceFilter(ids) {
            const workspaceIds = [...new Set(ids.filter(Boolean))];
            store.set({workspaceIds,workspaceId:workspaceIds.length === 1 ? workspaceIds[0] : '',settledLimit:SETTLED_INITIAL_COUNT,selectedIds:[],anchorId:null,viewRevision:store.getSnapshot().viewRevision+1});
          },
          openSessionMenu(card, point) {
            const menus = ctx.contextMenus;
            if (!menus || typeof menus.open !== 'function') return false;
            try {
              menus.open({ kind:'session', value:{ sessionId:card.sessionId, displayTitle:card.title } }, point);
              return true;
            } catch { return false; }
          },
          openBatchMenu(cards, point) {
            const menus = ctx.contextMenus;
            if (!menus || typeof menus.open !== 'function') return false;
            try {
              menus.open({ kind:'t3inbox-batch', value:{ sessionIds:cards.map((card) => card.sessionId) } }, point);
              return true;
            } catch { return false; }
          },
          openCustomSnooze(sessionId, returnFocusEl = null) {
            customSnoozeReturnFocus = returnFocusEl ?? (typeof document !== 'undefined' ? document.activeElement : null);
            store.set({customSnoozeSessionId:sessionId,customSnoozeSessionIds:null});
          },
          openCustomSnoozeBatch(sessionIds, returnFocusEl = null) {
            customSnoozeReturnFocus = returnFocusEl ?? (typeof document !== 'undefined' ? document.activeElement : null);
            store.set({customSnoozeSessionId:null,customSnoozeSessionIds:[...sessionIds]});
          },
          getCustomSnoozeReturnFocus() { return customSnoozeReturnFocus; },
          closeCustomSnooze() {
            const snap = store.getSnapshot();
            if (snap.customSnoozeSessionId || snap.customSnoozeSessionIds) store.set({customSnoozeSessionId:null,customSnoozeSessionIds:null});
            customSnoozeReturnFocus = null;
          },
          async markUnread(card) {
            if (!canMarkUnreadCard(card, false)) return { committed:false };
            const completedAt = card.result?.time ?? card.sortAt ?? Date.now();
            runtime.markVisited(card.sessionId, Math.max(0, completedAt - 1));
            return runtime.act(card,'mark-unread');
          },
          async markUnreadMany(cards) {
            const unique = [...new Map((cards ?? []).map((card) => [card.sessionId, card])).values()];
            await Promise.allSettled(unique.map((card) => runtime.markUnread(card)));
          },
          openCard(card) {
            runtime.markVisited(card.sessionId);
            runtime.openSession(card.sessionId);
            quietOpenHousekeeping(card.sessionId, card);
          },
          startSession(workspaceId) { store.set({pendingNavigation:null,navigationOwner:null}); ctx.uiWorkspace.startSession(workspaceId); },
          setWorkingShelfEnabled(enabled) {
            const next = Boolean(enabled);
            try { localStorage.setItem('dsh-t3-inbox:working-shelf', next ? 'on' : 'off'); } catch {}
            store.set({ workingShelfEnabled:next, viewRevision:store.getSnapshot().viewRevision + 1 });
          },
          setTimeFormat(format) {
            const next = format === '12-hour' || format === '24-hour' ? format : 'locale';
            try { localStorage.setItem('dsh-t3-inbox:time-format', next); } catch {}
            store.set({ timeFormat:next, viewRevision:store.getSnapshot().viewRevision + 1 });
          },
          renameSession:typeof ctx.sessions?.manager?.rename === 'function' ? async (card, title) => {
            if (!card?.sessionId || typeof title !== 'string') return { ok:false };
            const trimmed = title.trim();
            if (!trimmed || trimmed === card.title) return { ok:true };
            try {
              const result = await ctx.sessions.manager.rename(card.sessionId, trimmed);
              if (result && result.ok === false) {
                reportError('rename', result.error ?? result.reason ?? new Error('Rename failed'));
                return result;
              }
              return result ?? { ok:true };
            } catch (error) {
              reportError('rename', error);
              return { ok:false, error };
            }
          } : null,
          searchSessionContent:typeof ctx.sessions?.search === 'function' ? (query, signal) => ctx.sessions.search(query, signal) : null,
          archiveMany:(typeof ctx.workspaces?.archiveSession === 'function' || typeof ctx.uiWorkspace?.archiveSession === 'function') ? async (cards) => {
            const archiveFn = typeof ctx.workspaces?.archiveSession === 'function'
              ? (id, opts) => ctx.workspaces.archiveSession(id, opts)
              : (id, opts) => ctx.uiWorkspace.archiveSession(id, opts);
            const unique = [...new Map((cards ?? []).map((card) => [card.sessionId, card])).values()];
            let firstError = null;
            for (const card of unique) {
              if (!card?.sessionId || card.archived) continue;
              try {
                const res = await archiveFn(card.sessionId, { stopActivity:true });
                if (res && res.ok === false && !firstError) firstError = res.error ?? new Error('Archive failed');
              } catch (error) {
                if (!firstError) firstError = error;
              }
            }
            if (firstError) reportError('archive', firstError);
          } : null,
          toggleMode(options) {
            runtime.setMode(store.getSnapshot().mode === 'inbox' ? 'native' : 'inbox',options);
          },
          setMode(mode,{restoreFocus = false} = {}) {
            const nextMode = mode === 'native' ? 'native' : 'inbox';
            const current = store.getSnapshot();
            if (current.mode === nextMode) return;
            try { localStorage.setItem('dsh-t3-inbox:mode', nextMode); } catch {}
            store.set({mode:nextMode,selectedIds:[],anchorId:null,viewRevision:current.viewRevision+1,pendingNavigation:null,navigationOwner:null});
            if (restoreFocus) window.requestAnimationFrame?.(() => {
              if (!active || store.getSnapshot().mode !== nextMode) return;
              const nativeRow = 'button.kB3qhq_panelRow:has(.t3i-sidebar-switch-icon)';
              const controls = [nativeRow,'.kB3qhq_panelList button[aria-haspopup="menu"]','.t3i-settings-trigger'];
              const next = controls.map((selector) => document.querySelector(selector)).find((button) => button?.getClientRects().length);
              next?.focus({preventScroll:true});
            });
          },
          toggleInboxFromPanel() {
            if (ctx.layout.panelInfo.getSnapshot().activePanelId !== INBOX_PANEL_ID) return;
            runtime.toggleMode({restoreFocus:true});
            ctx.layout.selectPanel(null);
          },
          applyActivationDefaults() {
            if (store.getSnapshot().mode !== 'inbox') runtime.setMode('inbox');
          },
          setPanelsPosition(position) {
            const next = normalizePanelsPosition(position);
            try { localStorage.setItem(GLOBAL_PANELS_KEY, next); } catch {}
            store.set({panelsPosition:next});
          },
          toggleGlobalPanel(panelId) {
            if (!panelId) return;
            const activePanelId = ctx.layout?.panelInfo?.getSnapshot?.()?.activePanelId ?? null;
            try {
              ctx.layout?.selectPanel?.(activePanelId === panelId ? null : panelId);
            } catch (error) {
              reportError('panel', error);
            }
          },
          setSidebarAppearance(patch) {
            const sidebarAppearance = normalizeSidebarAppearance({...store.getSnapshot().sidebarAppearance,...patch});
            try { localStorage.setItem(SIDEBAR_APPEARANCE_KEY,JSON.stringify(sidebarAppearance)); } catch {}
            store.set({sidebarAppearance});
          },
          async invokeShortcut(id, unavailableKey) {
            const registry = ctx.shortcuts?.registry;
            try {
              const catalog = ctx.shortcuts?.catalog?.getSnapshot?.() ?? [];
              if (registry && typeof registry.invoke === 'function' && catalog.some((row) => row.id === id)) {
                const target = document.activeElement ?? null;
                const region = target && typeof target.matches === 'function' && target.matches('input, textarea, select, [contenteditable="true"], [contenteditable=""]') ? 'editable' : 'page';
                const modalElement = [...document.querySelectorAll('[data-shortcut-modal]')].at(-1);
                const modal = modalElement ? (modalElement.getAttribute('data-shortcut-modal') || 'other') : null;
                const outcome = registry.invoke(id, { source:'menu', target, region, modal });
                if (outcome?.status === 'blocked') {
                  reportError('shortcut', outcome.reason, {unavailableKey});
                  return false;
                }
                return true;
              }
            } catch (error) {
              reportError('shortcut', error, {unavailableKey});
              return false;
            }
            reportError('shortcut', null, {unavailableKey});
            return false;
          },
          openHostSettings() {
            try {
              const entries = ctx.slots.entries?.('sidebar.settings') ?? [];
              for (const entry of entries) {
                if (!entry.children?.['settings.section'] || typeof entry.store?.create !== 'function') continue;
                const actions = entry.store.create()?.actions;
                if (typeof actions?.open === 'function') {
                  actions.open();
                  return true;
                }
              }
            } catch { /* The host may not expose the settings store. */ }
            return false;
          },
          async openSettings() {
            const catalog = ctx.shortcuts?.catalog?.getSnapshot?.() ?? [];
            if (typeof ctx.shortcuts?.registry?.invoke === 'function' && catalog.some((row) => row.id === 'settings.open')) {
              return runtime.invokeShortcut('settings.open', 'settingsUnavailable');
            }
            if (runtime.openHostSettings()) return true;
            return runtime.invokeShortcut('settings.open', 'settingsUnavailable');
          },
          openInboxSettings({editSnooze = false} = {}) {
            try {
              const entries = ctx.slots.entries?.('sidebar.settings') ?? [];
              for (const entry of entries) {
                if (!entry.children?.['settings.section'] || typeof entry.store?.create !== 'function') continue;
                const actions = entry.store.create()?.actions;
                if (typeof actions?.openSection === 'function') {
                  actions.openSection(INBOX_SETTINGS_ID);
                  store.set({editSnoozeShortcuts:editSnooze});
                  return true;
                }
              }
            } catch { /* The host may not expose the settings store. */ }
            return false;
          },
          async saveSnoozeSettings(request) {
            const generation = store.getSnapshot().remote?.generation;
            const response = await inboxRemote(ctx).saveSnoozeSettings(request, lifetime.signal);
            if (!response.ok) throw response.error;
            const result = response.value;
            const current = store.getSnapshot().remote;
            if (current?.generation !== generation) throw new Error('Connection changed while saving Snooze options. Review and try again.');
            if (current && current.generation === generation && (current.snoozeSettings?.revision ?? -1) <= result.settings.revision) {
              store.set({remote:{...current,snoozeSettings:result.settings}});
            }
            return result;
          },
          async addProject() {
            if (typeof ctx.uiWorkspace?.pickDirectory === 'function' && typeof ctx.workspaces?.create === 'function') {
              try {
                const path = await ctx.uiWorkspace.pickDirectory();
                if (path === null || path === undefined) return true;
                await ctx.workspaces.create({path});
                return true;
              } catch (error) {
                reportError('add-project', error);
                return false;
              }
            }
            return runtime.invokeShortcut('workspace.add','addProjectUnavailable');
          },
          async syncSnapshot(signal=lifetime.signal) {
            const result = await inboxRemote(ctx).snapshot({},signal);
            if (!result.ok) throw result.error;
            if (!result.value || result.value.schemaVersion !== 1 || !Array.isArray(result.value.cards)) throw new Error('Invalid Inbox snapshot');
            if (active && !signal.aborted) {
              acceptSnapshot(result.value);
              const currentSessionId = store.getSnapshot().currentSessionId;
              if (currentSessionId) runtime.markVisited(currentSessionId);
            }
          },
          async pin(card,pinned,opts = {}) {
            const { internal = false, batchExpiresAt = null, pinnedOrderSnapshot: passedOrderSnapshot = undefined, preservePinnedOrder = false } = opts;
            const pinnedOrderSnapshot = !pinned
              ? (passedOrderSnapshot !== undefined ? passedOrderSnapshot : readPinnedOrder())
              : null;
            let nextPinnedOrder = null;
            if (pinned && !preservePinnedOrder) {
              const workspacesSnap = ctx.workspaces?.list?.getSnapshot?.();
              const curPinnedIds = workspacesSnap?.pinnedSessionIds ?? workspacesSnap?.pinnedIds ?? [];
              const curPinnedCards = (store.getSnapshot().remote?.cards ?? []).filter((item) => curPinnedIds.includes(item.sessionId));
              const orderedPinnedIds = sortPinnedCards(curPinnedCards, readPinnedOrder()).map((item) => item.sessionId);
              for (const id of curPinnedIds) if (!orderedPinnedIds.includes(id)) orderedPinnedIds.push(id);
              nextPinnedOrder = [card.sessionId, ...orderedPinnedIds.filter((id) => id !== card.sessionId)];
            }
            const managedPinOp = markManagedPinOp(card.sessionId, pinned);
            try {
              const result = await inboxRemote(ctx).pin({sessionId:card.sessionId,pinned},lifetime.signal);
              if (!active) { clearManagedPinOp(card.sessionId, managedPinOp); return false; }
              if (!result.ok) { clearManagedPinOp(card.sessionId, managedPinOp); reportError('pin', result.error, {cardPinned:Boolean(pinned)}); return false; }
              if (pinned) {
                invalidateUndo(card.sessionId, null);
                if (nextPinnedOrder && savePinnedOrder(nextPinnedOrder)) {
                  store.set({ viewRevision:store.getSnapshot().viewRevision + 1 });
                }
              } else {
                if (removePinnedOrderId(card.sessionId)) {
                  store.set({ viewRevision:store.getSnapshot().viewRevision + 1 });
                }
                if (!internal) {
                  pushUndo({
                    id:crypto.randomUUID(),
                    operationId:null,
                    sessionId:card.sessionId,
                    action:'Unpinned',
                    kind:'unpin',
                    cardSnapshot:card,
                    pinnedOrderSnapshot,
                    expiresAt:batchExpiresAt ?? (Date.now() + UNDO_TTL_MS),
                  });
                }
              }
              return true;
            } catch (error) {
              clearManagedPinOp(card.sessionId, managedPinOp);
              if (active) reportError('pin', error, {cardPinned:Boolean(pinned)});
              return false;
            }
          },
          /** Quietly warm a card for writeContext. Returns true when context is ready. Never surfaces cold UX copy. */
          async prepare(card) {
            const before = store.getSnapshot();
            if (before.pendingActions[card.sessionId]) return false;
            if (card.context && card.completeness === 'complete') return true;
            if (card.treeError || card.archived) return false;
            store.set({pendingActions:{...before.pendingActions,[card.sessionId]:1}});
            try {
              const result = await inboxRemote(ctx).prepare({sessionId:card.sessionId},lifetime.signal);
              if (!active || lifetime.signal.aborted) return false;
              if (!result.ok) return false;
              await runtime.syncSnapshot();
              if (!active || lifetime.signal.aborted) return false;
              const fresh = store.getSnapshot().remote?.cards?.find((item) => item.sessionId === card.sessionId);
              return Boolean(result.value.status === 'ready' && fresh?.context && fresh.completeness === 'complete');
            } catch {
              return false;
            } finally {
              if (active) {
                const pending = {...store.getSnapshot().pendingActions};
                delete pending[card.sessionId];
                store.set({pendingActions:pending});
              }
            }
          },
          async act(card,kind,extra={}) {
            const { coParkingKeys = null, skipNavigation = false, batchExpiresAt = null, collectUndo = null, pinnedOrderSnapshot: passedPinnedOrderSnapshot = undefined, silentError = false, ...wireExtra } = extra;
            if (store.getSnapshot().pendingActions[card.sessionId]) return { committed:false };
            let target = card;
            if (needsSilentPrepare(target)) {
              const ready = await runtime.prepare(target);
              if (!ready) {
                if (!silentError) reportError(kind, null, { status:'unavailable' });
                return { committed:false };
              }
              target = currentCard(card.sessionId) ?? target;
            }
            if (store.getSnapshot().pendingActions[target.sessionId]) return { committed:false };
            if (!target.context) {
              if (!silentError) reportError(kind, null, { status:'unavailable' });
              return { committed:false };
            }
            if (kind === 'settle' && target.running && !target.needsYou) {
              if (!silentError) reportError('settle', 'running', {status:'busy'});
              return { committed:false };
            }
            const computeForwardPlan = (snapState) => {
              const nativeWorkspaces = ctx.workspaces.list?.getSnapshot?.();
              if (!nativeWorkspaces) return null;
              const workspaceIds = snapState.workspaceIds?.length ? snapState.workspaceIds : (snapState.workspaceId ? [snapState.workspaceId] : []);
              const fallbackWorkspaceId = (workspaceIds.length === 1 ? workspaceIds[0] : undefined) || target.workspaceId || card.workspaceId || undefined;
              const sessionsSnap = ctx.sessions?.list?.getSnapshot?.();
              const scoped = (snapState.remote?.cards ?? [])
                .map((candidate) => enrichCard(candidate, nativeWorkspaces, sessionsSnap, snapState.remote?.phase, pendingOverlay, runningOverlay, snapState.optimisticCards))
                .filter((candidate) => candidate && !candidate.archived && (!workspaceIds.length || workspaceIds.includes(candidate.workspaceId)));
              const searchQ = (snapState.search || '').trim();
              if (searchQ) {
                const hits = searchSidebarCards(scoped, snapState.search).map((hit) => hit.card);
                const idx = hits.findIndex((item) => item.sessionId === card.sessionId);
                const pool = idx < 0 ? hits : [...hits.slice(idx + 1), ...hits.slice(0, idx)];
                const chosen = pool.find((item) =>
                  item.sessionId !== card.sessionId &&
                  !coParkingKeys?.has(item.sessionId) &&
                  (item.pinned || (item.section !== 'settled' && item.section !== 'snoozed')) &&
                  !(item.snoozed && !item.woke),
                ) ?? null;
                return { nextId:chosen?.sessionId ?? null, fallbackWorkspaceId };
              }
              const chosen = nextCandidate(scoped, card.sessionId, card.sessionId, coParkingKeys, { workingOpen:Boolean(snapState.workingOpen), workingShelfEnabled:snapState.workingShelfEnabled !== false });
              return { nextId:chosen?.sessionId ?? null, fallbackWorkspaceId };
            };
            const snapBeforePin = store.getSnapshot();
            const preNavSnapshot = !skipNavigation && snapBeforePin.panelKey === 'conversation' && snapBeforePin.currentSessionId === target.sessionId && ['settle','snooze'].includes(kind)
              ? computeForwardPlan(snapBeforePin)
              : null;
            const pinnedIds = ctx.workspaces?.list?.getSnapshot?.()?.pinnedSessionIds ?? ctx.workspaces?.list?.getSnapshot?.()?.pinnedIds ?? [];
            const isPinned = Boolean(card.pinned || target.pinned || pinnedIds.includes(target.sessionId));
            const wasPinned = kind === 'settle' && isPinned;
            const wasPinnedOrderSnapshot = wasPinned
              ? (passedPinnedOrderSnapshot !== undefined ? passedPinnedOrderSnapshot : readPinnedOrder())
              : null;
            const optimisticToken = crypto.randomUUID();
            let optimisticEntry = buildOptimisticCardEntry(target, kind, {
              until: wireExtra.until,
              wasPinned,
              now: Date.now(),
              token: optimisticToken,
            });
            if (wasPinned) {
              const beforePin = store.getSnapshot();
              store.set({
                pendingActions:{...beforePin.pendingActions,[target.sessionId]:1},
                ...(optimisticEntry ? { optimisticCards:{ ...(beforePin.optimisticCards ?? {}), [target.sessionId]:optimisticEntry } } : {}),
              });
              let unpinned = false;
              try {
                unpinned = await runtime.pin(target, false, { internal:true });
              } finally {
                if (active && !unpinned) {
                  clearPending(target.sessionId);
                  clearOptimisticCard(target.sessionId, optimisticToken);
                }
              }
              if (!active || !unpinned) return { committed:false };
              target = currentCard(card.sessionId) ?? target;
              if (optimisticEntry && target.revision !== optimisticEntry.baseRevision) {
                optimisticEntry = { ...optimisticEntry, baseRevision: target.revision };
              }
            }
            const operationId = crypto.randomUUID();
            const before = store.getSnapshot();
            const navigation = before.panelKey === 'conversation' && before.currentSessionId === target.sessionId ? {
              epoch:before.navigationEpoch,viewRevision:before.viewRevision,signature:before.panelSignature,origin:target.sessionId,
            } : null;
            store.set({
              error:null,actionError:null,errorToast:null,lastAction:{operationId,kind,phase:'started'},
              pendingActions:{...before.pendingActions,[target.sessionId]:1},
              ...(optimisticEntry ? { optimisticCards:{ ...(before.optimisticCards ?? {}), [target.sessionId]:optimisticEntry } } : {}),
            });
            try {
              const result = await inboxRemote(ctx).act({sessionId:target.sessionId,operationId,revision:target.revision,context:target.context,kind,...wireExtra},lifetime.signal);
              if (!active) return { committed:false };
              if (!result.ok) {
                const raw = result.error?.message ?? String(result.error);
                store.set({lastAction:{operationId,kind,phase:'transport-error',message:raw}});
                if (!silentError) reportError(kind, result.error);
                return { committed:false };
              }
              const answer = result.value;
              if (answer.status !== 'committed') {
                const raw = answer.message ?? `${kind}: ${answer.status}`;
                store.set({lastAction:{operationId,kind,phase:answer.status,message:raw}});
                if (!silentError) reportError(kind, raw, {status:answer.status});
                return { committed:false };
              }
              const postActCard = currentCard(target.sessionId);
              if (!postActCard || postActCard.revision !== answer.revision) {
                await runtime.syncSnapshot();
              } else {
                const currentSessionId = store.getSnapshot().currentSessionId;
                if (currentSessionId) runtime.markVisited(currentSessionId);
              }
              if (!active || lifetime.signal.aborted) return { committed:false };
              clearPending(target.sessionId);
              store.set({lastAction:{operationId,kind,phase:'committed',effect:answer.effect,revision:answer.revision}});
              if (kind === 'restore') invalidateUndo(card.sessionId, ['Settled']);
              else if (kind === 'wake') invalidateUndo(card.sessionId, ['Snoozed']);
              else if (answer.receipt && (kind === 'settle' || kind === 'snooze')) {
                const entry = {
                  id:answer.receipt.operationId ?? operationId,
                  operationId:answer.receipt.operationId ?? operationId,
                  sessionId:card.sessionId,
                  action:kind === 'snooze' ? 'Snoozed' : 'Settled',
                  kind,
                  wasPinned,
                  pinnedOrderSnapshot:wasPinnedOrderSnapshot,
                  origin:navigation?.origin ?? null,
                  expiresAt:batchExpiresAt ?? answer.receipt.expiresAt,
                };
                if (typeof collectUndo === 'function') collectUndo(entry);
                else pushUndo(entry);
              }
              const latest = store.getSnapshot();
              const validNavigation = navigation && latest.navigationCapable && latest.navigationEpoch === navigation.epoch && latest.viewRevision === navigation.viewRevision && latest.panelSignature === navigation.signature;
              if (!skipNavigation && validNavigation && ['settle','snooze'].includes(kind) && answer.effect === 'effective') {
                const nativeWorkspaces = ctx.workspaces.list?.getSnapshot?.();
                if (!nativeWorkspaces) return { committed:true, effect:answer.effect, revision:answer.revision, operationId };
                const archived = new Set(nativeWorkspaces.archivedSessionIds ?? []);
                const plannedCard = preNavSnapshot?.nextId ? currentCard(preNavSnapshot.nextId) : null;
                const plannedValid = Boolean(
                  plannedCard &&
                  !archived.has(plannedCard.sessionId) &&
                  plannedCard.accessible !== false &&
                  (plannedCard.pinned || (plannedCard.section !== 'settled' && plannedCard.section !== 'snoozed')) &&
                  !(plannedCard.snoozed && !plannedCard.woke),
                );
                const fallbackPlan = !plannedValid ? computeForwardPlan(latest) : null;
                const nextId = plannedValid ? plannedCard.sessionId : (fallbackPlan?.nextId ?? null);
                const startWorkspaceId = preNavSnapshot?.fallbackWorkspaceId ?? fallbackPlan?.fallbackWorkspaceId;
                const signature = nextId ? `conversation:${nextId}` : 'new-session:';
                store.set({pendingNavigation:{operationId,origin:card.sessionId,signature}});
                if (nextId) ctx.uiWorkspace.openSession(nextId);
                else ctx.uiWorkspace.startSession(startWorkspaceId || undefined);
              }
              return { committed:true, effect:answer.effect, revision:answer.revision, operationId };
            } catch (error) {
              if (active) {
                const message = error instanceof Error ? error.message : String(error);
                store.set({lastAction:{operationId,kind,phase:'exception',message}});
                if (!silentError) reportError(kind, error);
              }
              return { committed:false };
            }
            finally {
              clearPending(card.sessionId);
              clearOptimisticCard(target.sessionId, optimisticToken);
              if (card.sessionId !== target.sessionId) clearOptimisticCard(card.sessionId, optimisticToken);
            }
          },
          async actMany(cards, kind, extra = {}) {
            const unique = [...new Map((cards ?? []).map((card) => [card.sessionId, card])).values()];
            if (!unique.length) return;
            const coParkingKeys = new Set(unique.map((card) => card.sessionId));
            const snap = store.getSnapshot();
            const activeOrigin = snap.panelKey === 'conversation' && coParkingKeys.has(snap.currentSessionId) ? snap.currentSessionId : null;
            const releaseUndoDefer = deferUndoFor(coParkingKeys);
            const collectedUndos = [];
            try {
              if (['settle','snooze'].includes(kind)) {
                const coldTargets = unique.filter((card) => needsSilentPrepare(card));
                if (coldTargets.length) {
                  await Promise.allSettled(coldTargets.map((card) => runtime.prepare(card)));
                }
              }
              if (!active || lifetime.signal.aborted) return;
              const prepared = unique.map((card) => currentCard(card.sessionId) ?? card);
              await Promise.allSettled(prepared.map((card) => runtime.act(card, kind, {
                ...extra,
                coParkingKeys,
                skipNavigation:card.sessionId !== activeOrigin,
                collectUndo:(entry) => { collectedUndos.push(entry); },
              })));
            } finally {
              releaseUndoDefer();
            }
            if (!active || lifetime.signal.aborted || !collectedUndos.length) return;
            const minExpiresAt = Math.min(...collectedUndos.map((entry) => entry.expiresAt));
            for (const entry of collectedUndos) {
              pushUndo({ ...entry, expiresAt:minExpiresAt }, { deferRefresh:true });
            }
            refreshUndoNotice(true);
          },
          async unpinMany(cards) {
            const unique = [...new Map((cards ?? []).map((card) => [card.sessionId, card])).values()].filter((card) => card.pinned && !card.archived);
            if (!unique.length) return;
            const batchExpiresAt = Date.now() + UNDO_TTL_MS;
            const pinnedOrderSnapshot = readPinnedOrder();
            const results = await Promise.all(unique.map((card) => runtime.pin(card, false, { internal:true })));
            let pushed = 0;
            unique.forEach((card, index) => {
              if (!results[index]) return;
              pushed += 1;
              pushUndo({
                id:crypto.randomUUID(),
                operationId:null,
                sessionId:card.sessionId,
                action:'Unpinned',
                kind:'unpin',
                cardSnapshot:card,
                pinnedOrderSnapshot,
                expiresAt:batchExpiresAt,
              }, { deferRefresh:true });
            });
            if (pushed > 0) refreshUndoNotice(true);
          },
          async undo(undo) {
            const items = Array.isArray(undo?.items) && undo.items.length ? undo.items : (undo ? [undo] : []);
            if (!items.length) return;
            store.set({lastAction:{kind:'undo',phase:'requested',targetOperationId:undo.operationId ?? items.at(-1)?.operationId}});
            const pendingNow = store.getSnapshot().pendingActions;
            if (items.some((item) => Boolean(pendingNow[item.sessionId]))) return;
            const noticeKey = undo.id ?? undo.operationId;
            for (const item of items) {
              consumedUndoIds.add(item.id ?? item.operationId);
              if (item.operationId) consumedUndoIds.add(item.operationId);
            }
            if (noticeKey) consumedUndoIds.add(noticeKey);
            const itemSet = new Set(items);
            liveUndos = liveUndos.filter((entry) => !itemSet.has(entry) && (!entry.operationId || !items.some((item) => item.operationId === entry.operationId)));
            refreshUndoNotice();
            if (store.getSnapshot().undo?.id === noticeKey || store.getSnapshot().undo?.operationId === noticeKey) store.set({undo:null});
            for (const item of [...items].reverse()) {
              const card = store.getSnapshot().remote?.cards.find((candidate) => candidate.sessionId === item.sessionId) ?? item.cardSnapshot;
              if (!card) { reportError('undo', null, {code:'session-missing'}); continue; }
              if (item.kind === 'unpin') {
                const repinned = await runtime.pin(card, true, { preservePinnedOrder:true });
                if (repinned && Array.isArray(item.pinnedOrderSnapshot)) {
                  if (savePinnedOrder([...item.pinnedOrderSnapshot, ...(readPinnedOrder() ?? [])])) {
                    store.set({ viewRevision:store.getSnapshot().viewRevision + 1 });
                  }
                }
                continue;
              }
              const owner = store.getSnapshot().navigationOwner;
              const origin = owner?.operationId === item.operationId ? owner.origin : null;
              const outcome = await runtime.act(card,'undo',{targetOperationId:item.operationId});
              if (outcome?.committed) {
                if (item.wasPinned) {
                  const fresh = currentCard(item.sessionId) ?? card;
                  const repinned = await runtime.pin(fresh, true, { preservePinnedOrder:true });
                  if (repinned && Array.isArray(item.pinnedOrderSnapshot)) {
                    if (savePinnedOrder([...item.pinnedOrderSnapshot, ...(readPinnedOrder() ?? [])])) {
                      store.set({ viewRevision:store.getSnapshot().viewRevision + 1 });
                    }
                  }
                }
                if (origin && store.getSnapshot().navigationOwner?.operationId === item.operationId) runtime.openSession(origin);
              }
            }
          },
          dismissUndo(operationId) {
            const current = store.getSnapshot().undo;
            if (!operationId) return;
            consumedUndoIds.add(operationId);
            liveUndos = liveUndos.filter((entry) => {
              const match = entry.id === operationId || entry.operationId === operationId || (current?.id === operationId && current.items?.includes(entry));
              if (match && entry.operationId) consumedUndoIds.add(entry.operationId);
              return !match;
            });
            if (current && (current.id === operationId || current.operationId === operationId)) store.set({undo:null});
            refreshUndoNotice();
          },
        };
        const menuCard = currentCard;
        const menuText = (key) => translate(runtime.locale(), key);
        const menuPresets = () => snoozePresets(runtime.locale(),store.getSnapshot().remote?.snoozeSettings?.presets,store.getSnapshot().timeFormat || 'locale',menuText);
        const registerMenu = (id, order, resolve) => ctx.effect(() => ctx.contextMenus.register({ id, target:'session', order, resolve: (target) => resolve(menuCard(target.sessionId)) }), `t3-inbox: ${id} menu`);
        if (ctx.contextMenus?.register) {
        registerMenu('t3inbox.settle', 150, (card) => {
          if (!card || card.archived) return [];
          const pending = Boolean(store.getSnapshot().pendingActions[card.sessionId]);
          if (!card.pinned && card.section === 'settled') {
            return [{ id:'unsettle', label:menuText('unsettleSession'), icon:{key:'t3inbox.unsettle'}, disabled:pending || Boolean(card.treeError), run:() => { void runtime.act(card,'restore'); } }];
          }
          return [{ id:'settle', label:menuText('settleSession'), icon:{key:'t3inbox.settle'}, disabled:!settleClickable(card, pending), run:() => { void runtime.act(card,'settle'); } }];
        });
        registerMenu('t3inbox.snooze', 160, (card) => {
          if (!card || card.archived) return [];
          const pending = Boolean(store.getSnapshot().pendingActions[card.sessionId]);
          if (isCardSnoozed(card)) {
            return [{ id:'wake', label:menuText('wakeSession'), icon:{key:'t3inbox.snooze'}, disabled:pending || Boolean(card.treeError), run:() => { void runtime.act(card,'wake'); } }];
          }
          if (!snoozeClickable(card, pending)) {
            return [{ id:'snooze', label:menuText('snoozeAction'), icon:{key:'t3inbox.snooze'}, disabled:true }];
          }
          const presets = menuPresets();
          return [{
            id:'snooze', label:menuText('snoozeAction'), icon:{key:'t3inbox.snooze'},
            children: [
              ...presets.map((preset) => ({
                id:`snooze-${preset.id}`,
                label:`${preset.label} (${preset.whenLabel})`,
                run:() => {
                  const until = pickSnoozePreset(preset);
                  if (until === null) { reportError('snooze', null, {code:'snooze-time-passed'}); return; }
                  void runtime.act(card,'snooze',{until:new Date(until).toISOString()});
                },
              })),
              {
                id:'snooze-custom',
                label:menuText('customSnooze'),
                ...(presets.length > 0 ? {separatorBefore:true} : {}),
                run:() => {
                  const returnEl = typeof document !== 'undefined'
                    ? [...document.querySelectorAll('.t3i-item[data-session-id]')].find((el) => el.getAttribute('data-session-id') === card.sessionId)?.querySelector('.t3i-row') ?? document.activeElement
                    : null;
                  runtime.openCustomSnooze(card.sessionId, returnEl);
                },
              },
            ],
          }];
        });
        registerMenu('t3inbox.unread', 350, (card) => {
          if (!card || card.archived) return [];
          const pending = Boolean(store.getSnapshot().pendingActions[card.sessionId]);
          return [{ id:'mark-unread', label:menuText('markUnread'), icon:{key:'t3inbox.unread'}, disabled:!canMarkUnreadCard(card, pending), run:() => { void runtime.markUnread(card); } }];
        });
        registerMenu('t3inbox.filter', 360, (card) => {
          if (!card || !card.workspaceId) return [];
          const current = store.getSnapshot();
          const selected = current.workspaceIds?.length ? current.workspaceIds : (current.workspaceId ? [current.workspaceId] : []);
          const isFiltered = selected.includes(card.workspaceId);
          const projectLabel = (card.workspaceTitle || '').trim() || (card.cwd ? card.cwd.split(/[\\/]/).filter(Boolean).pop() : '') || card.workspaceId;
          return [{
            id:'filter-project',
            label:isFiltered ? menuText('showAllProjects') : translate(runtime.locale(),'filterBy').replace('{name}', projectLabel),
            icon:{key:'t3inbox.filter'},
            run:() => { runtime.setWorkspaceFilter(isFiltered ? [] : [card.workspaceId]); },
          }];
        });
        ctx.effect(() => ctx.contextMenus.register({
          id:'t3inbox.batch', target:'t3inbox-batch', order:100,
          resolve:(value) => {
            const batchCards = (Array.isArray(value?.sessionIds) ? value.sessionIds : []).map((id) => menuCard(id)).filter(Boolean);
            if (!batchCards.length) return [];
            const locale = runtime.locale();
            const model = buildBatchMenuModel(batchCards, store.getSnapshot().pendingActions, menuPresets(), locale, menuText, typeof runtime.archiveMany === 'function');
            const items = [];
            if (model.showUnpin) {
              items.push({
                id:'unpin-batch',
                label:menuText('unpinBatch').replace('{count}', String(model.pinnedCards.length)),
                icon:{key:'t3inbox.pin'},
                disabled:!model.canUnpin,
                run:() => { runtime.clearSelection(); void runtime.unpinMany(model.pinnedCards); },
              });
            }
            if (model.showSettle) {
              items.push({
                id:'settle-batch',
                label:menuText('settleBatch').replace('{count}', String(model.unsettledCards.length)),
                icon:{key:'t3inbox.settle'},
                disabled:!model.canSettle,
                run:() => { runtime.clearSelection(); void runtime.actMany(model.unsettledCards,'settle'); },
              });
            }
            if (model.showUnsettle) {
              items.push({
                id:'unsettle-batch',
                label:menuText('unsettleBatch').replace('{count}', String(model.settledCards.length)),
                icon:{key:'t3inbox.unsettle'},
                disabled:!model.canUnsettle,
                run:() => { runtime.clearSelection(); void runtime.actMany(model.settledCards,'restore'); },
              });
            }
            if (model.showWake) {
              items.push({
                id:'wake-batch',
                label:menuText('wakeBatch').replace('{count}', String(model.snoozedCards.length)),
                icon:{key:'t3inbox.snooze'},
                disabled:!model.canWake,
                run:() => { runtime.clearSelection(); void runtime.actMany(model.snoozedCards,'wake'); },
              });
            }
            if (model.showSnooze) {
              items.push({
                id:'snooze-batch',
                label:menuText('snoozeBatch').replace('{count}', String(batchCards.length)),
                icon:{key:'t3inbox.snooze'},
                children:[
                  ...model.presets.map((entry) => ({
                    id:entry.id,
                    label:entry.label,
                    run:() => {
                      runtime.clearSelection();
                      const until = pickSnoozePreset(entry.preset);
                      if (until === null) { reportError('snooze', null, {code:'snooze-time-passed'}); return; }
                      void runtime.actMany(batchCards,'snooze',{until:new Date(until).toISOString()});
                    },
                  })),
                  {
                    id:'snooze-custom',
                    label:menuText('customSnooze'),
                    ...(model.presets.length > 0 ? {separatorBefore:true} : {}),
                    run:() => {
                      const firstId = batchCards[0]?.sessionId;
                      const returnEl = firstId && typeof document !== 'undefined'
                        ? [...document.querySelectorAll('.t3i-item[data-session-id]')].find((el) => el.getAttribute('data-session-id') === firstId)?.querySelector('.t3i-row') ?? document.activeElement
                        : null;
                      runtime.clearSelection();
                      runtime.openCustomSnoozeBatch(batchCards.map((card) => card.sessionId), returnEl);
                    },
                  },
                ],
              });
            }
            items.push({
              id:'mark-unread-batch',
              label:menuText('markUnreadBatch').replace('{count}', String(model.unreadCards.length || batchCards.length)),
              icon:{key:'t3inbox.unread'},
              disabled:!model.canMarkUnread,
              run:() => { runtime.clearSelection(); void runtime.markUnreadMany(model.unreadCards); },
            });
            if (model.showArchive) {
              items.push({
                id:'archive-batch',
                label:menuText('archiveBatch').replace('{count}', String(model.archivableCards.length)),
                icon:{key:'t3inbox.archive'},
                disabled:!model.canArchive,
                run:() => { runtime.clearSelection(); void runtime.archiveMany(model.archivableCards); },
              });
            }
            return items;
          },
        }), 't3-inbox: batch menu');
        ctx.slots.inject('contextMenu.icon', function* () {
          for (const [key, icon] of [['t3inbox.settle','checkcircle'],['t3inbox.unsettle','restore'],['t3inbox.snooze','clock'],['t3inbox.unread','inbox'],['t3inbox.filter','filter'],['t3inbox.pin','pinOff'],['t3inbox.archive','archive']]) {
            yield ctx.slots.register({ name:'contextMenu.icon', key }, (props) => h(Icon,{ name:icon, size:14, className:props?.className }));
          }
        });
        }
        const connect = () => {
          if (!active) return;
          if (retry) { clearTimeout(retry); retry = null; }
          streamController?.abort();
          const previous = store.getSnapshot().remote;
          if (previous) store.set({remote:{...previous,phase:'building',error:null}});
          const controller = new AbortController();
          streamController = controller;
          const abort = () => controller.abort();
          lifetime.signal.addEventListener('abort',abort,{once:true});
          (async () => {
            try {
              const initial = await inboxRemote(ctx).snapshot({},controller.signal);
              if (!initial.ok) throw initial.error;
              if (!initial.value || initial.value.schemaVersion !== 1 || !Array.isArray(initial.value.cards)) throw new Error('Invalid Inbox snapshot');
              if (active && !controller.signal.aborted) acceptSnapshot(initial.value);
              const stream = inboxRemote(ctx).follow({},controller.signal);
              for await (const snapshot of stream) {
                if (!active || controller.signal.aborted) break;
                if (!snapshot || snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.cards)) throw new Error('Invalid Inbox snapshot');
                acceptSnapshot(snapshot);
              }
              if (active && !controller.signal.aborted) throw new Error('Inbox stream ended');
            } catch (error) {
              if (active && !controller.signal.aborted) {
                reportError('refresh', error);
                retry = setTimeout(connect,500);
              }
            } finally {
              lifetime.signal.removeEventListener('abort',abort);
              if (streamController === controller) streamController = null;
            }
          })();
        };
        for (const [lang, dict] of Object.entries(LOCALES)) {
          ctx.effect(() => ctx.locale.register(NS, lang, dict));
        }
        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name:'settings.section',id:INBOX_SETTINGS_ID,order:110,label:'T3 Inbox',locale:NS,inject:() => ({inbox:runtime}),
        },InboxSettingsSection));
        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name:'settings.section.icon',id:INBOX_SETTINGS_ID,order:110,
        },InboxSettingsNavIcon));
        ctx.slots.inject('plugins.bundle.activation', () => ctx.slots.register({
          name:'plugins.bundle.activation',key:NS,inject:() => ({inbox:runtime}),
        },InboxActivation));
        ctx.effect(() => {
          const element = document.createElement('style'); element.textContent = styles; element.dataset.t3Inbox = '';
          document.head.append(element); return () => element.remove();
        });
        ctx.effect(() => {
          const shellRoot = typeof document !== 'undefined' ? document.documentElement : null;
          if (!shellRoot || typeof shellRoot.setAttribute !== 'function') return () => {};
          const clearColors = () => {
            shellRoot.style.removeProperty('--t3i-sidebar-light');
            shellRoot.style.removeProperty('--t3i-sidebar-dark');
          };
          const clearShell = () => {
            shellRoot.removeAttribute('data-t3-inbox');
            shellRoot.removeAttribute('data-t3-inbox-nav');
            shellRoot.removeAttribute('data-t3-inbox-background');
            clearColors();
          };
          let previous;
          const sync = () => {
            const current = store.getSnapshot();
            if (previous && current.mode === previous.mode && current.wide === previous.wide &&
              current.panelsPosition === previous.panelsPosition && current.sidebarAppearance === previous.sidebarAppearance) return;
            previous = current;
            if (current.mode === 'inbox' && current.wide === true) {
              const {mode,light,dark} = current.sidebarAppearance;
              shellRoot.setAttribute('data-t3-inbox','wide');
              shellRoot.setAttribute('data-t3-inbox-nav',current.panelsPosition === 'top' ? 'on' : 'off');
              shellRoot.setAttribute('data-t3-inbox-background',mode);
              if (mode === 'custom') {
                shellRoot.style.setProperty('--t3i-sidebar-light',light);
                shellRoot.style.setProperty('--t3i-sidebar-dark',dark);
              } else clearColors();
            } else clearShell();
          };
          sync();
          const unsubscribe = store.subscribe(sync);
          return () => { unsubscribe(); clearShell(); };
        },'t3-inbox: host shell chrome adaptation');
        ctx.effect(() => {
          let disposeBrowser;
          const reconcile = () => {
            const enabled = store.getSnapshot().mode === 'inbox';
            if (enabled && !disposeBrowser) disposeBrowser = ctx.slots.inject('sidebar.workspaces',() => ctx.slots.register({name:'sidebar.workspaces',priority:-10,locale:NS,inject:() => ({inbox:runtime})},InboxBrowser));
            if (!enabled && disposeBrowser) { disposeBrowser(); disposeBrowser = undefined; }
          };
          reconcile();
          const unsubscribe = store.subscribe(reconcile);
          return () => { unsubscribe(); disposeBrowser?.(); };
        },'t3-inbox: native browser restoration');
        ctx.slots.inject('main',() => ctx.slots.register({name:'main',key:INBOX_PANEL_ID,locale:NS,inject:() => ({inbox:runtime})},InboxPanelLauncher));
        ctx.slots.inject('sidebar.panellist',() => {
          let mode = store.getSnapshot().mode;
          const register = () => {
            const destination = mode === 'inbox' ? 'workspaces' : 'inbox';
            const label = destination === 'workspaces' ? 'workspacesView' : 'inboxView';
            return ctx.slots.register({
              name:'sidebar.panellist',id:INBOX_PANEL_ID,order:30,locale:NS,
              label:() => translate(runtime.locale(),label),inject:() => ({destination}),
            },SidebarSwitchIcon);
          };
          let dispose = register();
          // The host refreshes panel labels on registration and locale changes.
          const unsubscribe = store.subscribe(() => {
            const nextMode = store.getSnapshot().mode;
            if (nextMode === mode) return;
            mode = nextMode;
            dispose();
            dispose = register();
          });
          return () => { unsubscribe(); dispose(); };
        });
        const resolvePanelLabel = (label, fallbackId) => {
          try {
            const value = typeof label === 'function' ? label() : label;
            return typeof value === 'string' && value.trim() ? value : fallbackId;
          } catch {
            return fallbackId;
          }
        };
        ctx.effect(() => {
          const syncGlobalPanels = () => {
            if (!active) return;
            const rawEntries = ctx.slots?.entriesOfSlot?.('sidebar.panellist') ?? ctx.slots?.entries?.('sidebar.panellist') ?? [];
            const next = rawEntries
              .map((entry) => {
                const opts = entry?.options ?? entry ?? {};
                const id = typeof opts.id === 'string' && opts.id ? opts.id : null;
                if (!id || id === INBOX_PANEL_ID) return null;
                const order = Number.isFinite(opts.order) ? opts.order : 0;
                const label = resolvePanelLabel(opts.label, id);
                return { id, order, label };
              })
              .filter(Boolean)
              .sort((a, b) => a.order - b.order);
            const prev = store.getSnapshot().globalPanels ?? [];
            if (prev.length === next.length && prev.every((panel, index) => {
              const candidate = next[index];
              return panel.id === candidate.id && panel.order === candidate.order && panel.label === candidate.label;
            })) return;
            store.set({ globalPanels: next });
          };
          syncGlobalPanels();
          const offSlots = typeof ctx.slots?.subscribe === 'function' ? ctx.slots.subscribe('sidebar.panellist', syncGlobalPanels) : null;
          const offLocale = typeof ctx.locale?.subscribe === 'function' ? ctx.locale.subscribe(syncGlobalPanels) : null;
          return () => { offSlots?.(); offLocale?.(); };
        },'t3-inbox: global panels');
        ctx.on('connection/reset',connect);
        ctx.effect(() => {
          if (typeof ctx.slots.onEntryError !== 'function') return;
          return ctx.slots.onEntryError((_key,registration,cause) => {
            if (![InboxBrowser,InboxPanelLauncher,SidebarSwitchIcon,InboxSettingsNavIcon,InboxActivation].includes(registration?.component)) return;
            store.set({slotError:cause instanceof Error ? cause.message : String(cause)});
          });
        },'t3-inbox: own Slot errors');
        ctx.effect(() => ctx.cordisInspect.register({
          manifest:{
            id:'T3Inbox',description:'Read the live dsh-t3-inbox view and its own rendered DOM summary.',
            methods:[
              {name:'getViewState',description:'Return sanitized live view, snapshot, and rendering evidence.',inputSchema:{type:'object',properties:{requireRendered:{type:'boolean',description:'Only answer from a Client with a visible Inbox browser or Home.'}},additionalProperties:false},outputSchema:{description:'Sanitized live Inbox Client state.'}},
              {name:'showHoverPreview',description:'Force the ThreadHoverCard-style preview for a session (or clear). For Computer Use without a real cursor.',inputSchema:{type:'object',properties:{sessionId:{type:'string'},clear:{type:'boolean'}},additionalProperties:false},outputSchema:{description:'Whether the preview is visible after the force.'}},
            ],
          },
          query(method,input) {
            if (method === 'showHoverPreview') {
              if (input?.clear) {
                emitPreview({clear:true});
                return {ok:true,previewVisible:false};
              }
              const sessionId = input?.sessionId;
              if (!sessionId) throw new Error('sessionId is required unless clear=true');
              const item = document.querySelector(`.t3i-item[data-session-id="${CSS.escape(sessionId)}"]`);
              if (!item) throw new Error(`No rendered card for ${sessionId}`);
              emitPreview({sessionId});
              return {ok:true,sessionId,previewVisible:true};
            }
            if (method !== 'getViewState') throw new Error(`Unknown T3Inbox method ${method}`);
            const view = inspectionView(store);
            if (input?.requireRendered && !view.rendered?.roots.some((root) => root.visible) && !view.rendered?.home) throw new Error('This Client has no visible Inbox browser or Home');
            return view;
          },
        }),'t3-inbox: inspect provider');
        ctx.effect(() => {
          const panelSource = ctx.layout.panelInfo;
          const sessionsSource = ctx.sessions.list;
          if (!panelSource?.subscribe || !panelSource?.getSnapshot || !sessionsSource?.subscribe || !sessionsSource?.getSnapshot) return;
          const reconcile = () => {
            const sessions = sessionsSource.getSnapshot();
            const sessionId = Object.values(sessions?.byId ?? {}).find((session) => (session.retainedBy?.mainView ?? 0) > 0)?.id ?? null;
            runtime.notePanel(panelSource.getSnapshot(),sessionId);
          };
          const offPanel = panelSource.subscribe(reconcile);
          const offSessions = sessionsSource.subscribe(reconcile);
          reconcile();
          store.set({navigationCapable:true});
          return () => { offPanel(); offSessions(); store.set({navigationCapable:false}); };
        },'t3-inbox: native navigation epochs');
        const ALL_5_PROFILES = ['desktop:macos','desktop:windows','desktop:linux','web:macos','web:windows'];
        const DESKTOP_3_PROFILES = ['desktop:macos','desktop:windows','desktop:linux'];
        const shortcutDefaults = (profiles, binding) => Object.fromEntries(profiles.map((profile) => [profile, binding]));
        const shortcutAllowed = (context, { isPin = false } = {}) => {
          const snap = store.getSnapshot();
          if (snap.mode !== 'inbox' || snap.wide === false) return false;
          if (snap.filterOpen || snap.customSnoozeSessionId || snap.customSnoozeSessionIds?.length) return false;
          if (activeNonSidebarModal()) return false;
          if (context?.modal !== null && context?.modal !== undefined && context.modal !== 'sidebar') return false;
          if (context?.region === 'terminal' || isTerminalFocused(context?.target)) return false;
          if (isPin && context?.target?.closest?.('[role="combobox"][aria-expanded="true"]')) return false;
          return true;
        };
        const openFromShortcut = (targetId) => {
          runtime.clearSelection(targetId);
          const card = currentCard(targetId);
          if (card) runtime.openCard(card);
          else runtime.openSession(targetId);
        };
        if (typeof ctx.shortcuts?.register === 'function') {
          ctx.effect(() => {
            const disposers = [];
            const reg = (spec) => disposers.push(ctx.shortcuts.register({
              regions:['page','editable'],
              modals:['sidebar'],
              aliases:[],
              ...spec,
            }));
            const navigate = (direction, context) => {
              if (!shortcutAllowed(context)) return { status:'pass' };
              const ids = runtime.orderedSessionIds();
              const snap = store.getSnapshot();
              const currentId = snap.panelKey === 'conversation' ? snap.currentSessionId : null;
              const targetId = resolveAdjacentThreadId({ threadIds:ids, currentThreadId:currentId, direction });
              return { status:'handled', run:() => { if (targetId) openFromShortcut(targetId); } };
            };
            reg({
              id:'t3inbox.thread.previous',
              label:() => translate(runtime.locale(), 'cmdPreviousThread'),
              aliases:['previous thread','prev thread','上一个会话'],
              defaults:shortcutDefaults(ALL_5_PROFILES, { code:'BracketLeft', modifiers:['primary','shift'] }),
              resolve:(context) => navigate('previous', context),
            });
            reg({
              id:'t3inbox.thread.next',
              label:() => translate(runtime.locale(), 'cmdNextThread'),
              aliases:['next thread','下一个会话'],
              defaults:shortcutDefaults(ALL_5_PROFILES, { code:'BracketRight', modifiers:['primary','shift'] }),
              resolve:(context) => navigate('next', context),
            });
            reg({
              id:'t3inbox.thread.settle',
              label:() => translate(runtime.locale(), 'cmdSettleThread'),
              aliases:['settle thread','unsettle thread','收尾会话','取消会话收尾'],
              defaults:shortcutDefaults(ALL_5_PROFILES, { code:'KeyS', modifiers:['primary','shift'] }),
              resolve:(context) => {
                if (!shortcutAllowed(context)) return { status:'pass' };
                const snap = store.getSnapshot();
                const card = snap.panelKey === 'conversation' && snap.currentSessionId ? currentCard(snap.currentSessionId) : null;
                if (!card || card.archived) return { status:'pass' };
                return { status:'handled', run:() => { void runtime.act(card, card.section === 'settled' ? 'restore' : 'settle'); } };
              },
            });
            reg({
              id:'t3inbox.thread.pin',
              label:() => translate(runtime.locale(), 'cmdPinThread'),
              aliases:['pin thread','unpin thread','置顶会话'],
              defaults:shortcutDefaults(ALL_5_PROFILES, { code:'KeyP', modifiers:['primary','shift'] }),
              resolve:(context) => {
                if (!shortcutAllowed(context, { isPin:true })) return { status:'pass' };
                const snap = store.getSnapshot();
                const card = snap.panelKey === 'conversation' && snap.currentSessionId ? currentCard(snap.currentSessionId) : null;
                if (!card || card.archived) return { status:'pass' };
                return { status:'handled', run:() => { void runtime.pin(card, !card.pinned); } };
              },
            });
            for (let index = 1; index <= 9; index++) {
              reg({
                id:`t3inbox.thread.jump${index}`,
                label:() => translate(runtime.locale(), 'cmdJumpThread').replace('{index}', String(index)),
                aliases:[`jump to thread ${index}`, `thread ${index}`],
                defaults:shortcutDefaults(DESKTOP_3_PROFILES, { code:`Digit${index}`, modifiers:['primary'] }),
                resolve:(context) => {
                  if (!shortcutAllowed(context)) return { status:'pass' };
                  const targetId = runtime.orderedSessionIds()[index - 1] ?? null;
                  if (!targetId) return { status:'pass' };
                  return { status:'handled', run:() => openFromShortcut(targetId) };
                },
              });
            }
            return () => { for (const dispose of disposers.reverse()) dispose?.(); };
          }, 't3-inbox: shortcuts');
        }
        if (typeof ctx.workspaces?.list?.subscribe === 'function') {
          prevPinnedIds = new Set(readWorkspacePinnedIds());
          ctx.effect(() => ctx.workspaces.list.subscribe(reconcileWorkspacePins), 't3-inbox: unpin undo sync');
        }
        ctx.effect(() => {
          const onKeyDownCapture = (event) => {
            if (event.repeat) {
              if (heldUndoKey && (event.code === heldUndoKey || event.key?.toLowerCase() === 'z')) {
                event.preventDefault();
                event.stopPropagation();
              }
              return;
            }
            const isModOnly = MODIFIER_KEY_NAMES.has(event.key);
            if (!isModOnly) heldUndoKey = null;
            const mac = isMacPlatform(ctx.shortcuts);
            const isUndoKey = isPrimaryModEvent(event, mac) && !event.altKey && !event.shiftKey && (event.code === 'KeyZ' || event.key?.toLowerCase() === 'z');
            const snap = store.getSnapshot();
            const blocked = snap.mode !== 'inbox' || snap.wide === false || Boolean(activeNonSidebarModal()) || snap.filterOpen || Boolean(snap.customSnoozeSessionId) || Boolean(snap.customSnoozeSessionIds?.length) || isTerminalFocused(event.target);
            if (blocked || !isUndoKey) {
              if (!isModOnly) shortcutClaimed = false;
              return;
            }
            if (!hasLiveUndo() || (!shortcutClaimed && isEditableFocused(event.target))) {
              shortcutClaimed = false;
              return;
            }
            heldUndoKey = event.code || 'KeyZ';
            event.preventDefault();
            event.stopPropagation();
            void runtime.undoLatest();
          };
          const onInputCapture = () => { shortcutClaimed = false; };
          const offFixed = typeof ctx.shortcuts?.observeFixedInput === 'function'
            ? ctx.shortcuts.observeFixedInput((input) => {
                if (input?.type === 'reset') { heldUndoKey = null; return; }
                if (input?.type !== 'keydown' || !input.gesture || input.gesture.defaultPrevented || input.gesture.composing) return;
                const g = input.gesture;
                const mac = isMacPlatform(ctx.shortcuts);
                const primaryHeld = mac ? Boolean(g.meta && !g.control) : Boolean(g.control && !g.meta);
                if (g.repeat) {
                  if (heldUndoKey && g.code === heldUndoKey) input.consume?.();
                  return;
                }
                const snap = store.getSnapshot();
                const modal = input.context?.modal;
                const badModal = modal !== null && modal !== undefined && modal !== 'sidebar';
                if (snap.mode !== 'inbox' || snap.wide === false || badModal || snap.filterOpen || snap.customSnoozeSessionId || snap.customSnoozeSessionIds?.length || input.context?.region === 'terminal') return;
                if (!(primaryHeld && !g.alt && !g.shift && g.code === 'KeyZ')) {
                  shortcutClaimed = false;
                  return;
                }
                if (!hasLiveUndo() || (!shortcutClaimed && input.context?.region === 'editable')) return;
                heldUndoKey = g.code;
                input.consume?.();
                void runtime.undoLatest();
              })
            : null;
          if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            window.addEventListener('keydown', onKeyDownCapture, true);
            window.addEventListener('input', onInputCapture, true);
          }
          return () => {
            offFixed?.();
            if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
              window.removeEventListener('keydown', onKeyDownCapture, true);
              window.removeEventListener('input', onInputCapture, true);
            }
          };
        }, 't3-inbox: undo shortcut');
        ctx.effect(() => {
          connect();
          return () => { active=false; lifetime.abort(); if (retry) clearTimeout(retry); clearTimeout(undoTimer); resetTooltipCoordinator(); };
        },'t3-inbox: stream lifetime');
      },
    };
  },
});
