# dsh-t3-inbox

面向 **DeepSeek Harness** 的 T3 Code 风格注意力收件箱侧边栏插件。

[English](README.md) | 简体中文

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.2.0-1b4ed8.svg)](package.json)
[![DeepSeek Harness](https://img.shields.io/badge/dsh-%3E%3D0.2.2--rc.1-0f1115.svg)](package.json)

> **声明：** 视觉与交互体验致敬开源项目 [T3 Code](https://github.com/pingdotgg/t3code)。本项目为独立社区插件，与 Ping Labs 或 DeepSeek 官方均无从属关系。

![浅色与深色模式侧边栏对比](docs/images/sidebar-light-dark.zh.png)

## 为什么做 T3 Inbox？

当你在多个仓库里同时推进多个 Agent 会话时，按时间线平铺的列表很快就会被刷乱：刚跑完待看的、卡在审批等待确认的、正在后台执行的、还有已经处理完的会话全混在一起。

**T3 Inbox** 在不改动底层会话记录的前提下，从会话日志安全投影出一条「注意力流水线」，同时支持在设置中一键切回宿主原生的 **工作区视图（Workspaces View）**，无侵入、可随时回退。

## 核心特性

- **注意力分区，绝不破坏会话本体**
  - 自动归类为 **置顶（Pinned）**、**收件箱 / Active**（`待审批 Approval`、`需要输入 Input`、`失败 Failed`、`已达上限 Limited`、`已唤醒 Woke`、`已完成 Done`）、**运行中（Working）**（带实时秒级耗时，可折叠）、**已暂缓（Snoozed）**（`36px` 紧凑行显示剩余唤醒倒计时），以及贴底收纳的 **已收尾（Settled）**（`10 + 25` 渐进分页）。
  - **收尾（Settle）** 和 **暂缓（Snooze）** 仅修改插件自身的轻量注意力元数据——绝不会归档会话、中断正在运行的任务、代答询问或清空队列。
  - 支持子智能体树结果聚合与父卡片 **等待中（Waiting）** 状态提示。
- **快、稳、可撤销的交互闭环**
  - Host 侧 **O(1) 单卡增量刷新** 配合 Client **零延迟乐观更新**（失败自动回滚）。
  - 底部提供 **5 秒条件撤销（`⌘Z` / `Ctrl+Z`）**，覆盖收尾、暂缓与直接取消置顶，底层采用版本号 CAS 与幂等操作 ID 校验。
  - 打开或正在阅读当前会话时自动消除未读完成标记；右键菜单也可随时 **标记未读（Mark unread）** 重新拉回关注队列。
- **灵活的暂缓与自定义日历**
  - 支持在设置中增删改排序多达 **8 个暂缓快捷选项**（支持 `分钟 / 小时 / 天` 时长与每周固定时刻），并在任意会话右键/行内打开 **自定义暂缓（Custom snooze）** 弹窗，自由切换 **日期与时间（7 列月历选择器）** 或 **持续时长**。
  - 当 Host 提供同代际请求标识时，普通提问可在暂缓期内静默延后；**审批请求** 与到达时的新交互会即时浮出，不错过关键卡点。
- **高相关搜索、项目筛选与 Git 上下文**
  - 搜索支持标题、Git 分支、项目名、短会话 ID 及防抖后的消息摘要高亮匹配。
  - **项目筛选器** 支持 `Shift+Click` 多选过滤，保留 T3 18 色首字母徽章（Monogram）与多选图标叠放。
  - 卡片自动展示分支与 **Git worktree** 专属图标；行悬停浮卡展示完整标题、项目、分支与当前模型名称。
- **键盘流、指针拖拽与批量管理**
  - 桌面端按住 **`⌘` / `Ctrl`** 显示 `1–9` 跳转角标；同分区 **按住垂直扫选（Sweep）** 批量收尾 / 唤醒 / 取消收尾；**`⌘+Click` / `⇧+Click`** 多选触发批量右键菜单；支持跨 `Pinned` / `Active` / `Settled` **指针拖拽重排**；`F2` 或双击标题即可 **内联重命名**。
- **极简底栏集成与 8 语言支持**
  - **全局面板入口** 默认紧凑收进左下角设置齿轮右侧（超出 3 个自动折叠进 `···` 更多菜单），也可切换至顶部或隐藏；提供 3 种 **侧栏背景**（跟随 DSH 主题 / T3 预设 / 自定义浅深色）；内置 **简体中文、English、日本語、Español、Français、Deutsch、Русский、Português** 8 种语言。

## 安装方法

### 方式一：通过插件市场安装（推荐）

在 `dshmarket` 或 DeepSeek Harness 应用内的 **插件 → 发现（Discover）** 页面搜索 **`dsh-t3-inbox`** 点击安装，随后按提示重启应用即可。

### 方式二：通过命令行安装

```sh
dsh plugin add dsh-t3-inbox
```

如需安装到指定 profile：

```sh
dsh plugin --profile <profile> add dsh-t3-inbox
```

安装完成后重启 DeepSeek Harness 即可生效。

> **无侵入、随时可切回原生：** 你随时可以在 **设置 → T3 Inbox** 中把「侧栏视图」切换回原生的 **工作区视图（Workspaces View）**，所有会话和插件配置都会完整保留。

## 快捷键速查

| 功能 | macOS | Windows / Linux | 说明 |
| --- | --- | --- | --- |
| 上一个 / 下一个会话 | `⌘⇧[` / `⌘⇧]` | `Ctrl+Shift+[` / `Ctrl+Shift+]` | 按侧栏可见顺序切换 |
| 收尾 / 取消收尾当前会话 | `⌘⇧S` | `Ctrl+Shift+S` | 作用于当前打开会话 |
| 置顶 / 取消置顶当前会话 | `⌘⇧P` | `Ctrl+Shift+P` | 置顶会同步更新有序列表 |
| 快速跳转前 1–9 个会话 | `⌘1` – `⌘9` | `Ctrl+1` – `Ctrl+9` | 桌面端；长按 `⌘`/`Ctrl` 200ms 显示角标 |
| 撤销最近操作（5 秒内） | `⌘Z` | `Ctrl+Z` | 支持撤销收尾、暂缓及直接取消置顶 |
| 内联重命名会话标题 | `F2` / 双击 | `F2` / 双击 | `Enter` 保存，`Esc` 取消 |
| 多选会话 / 多选项目筛选 | `⌘+Click` / `⇧+Click` | `Ctrl+Click` / `Shift+Click` | 配合批量右键菜单使用 |
| 键盘遍历与关闭弹层 | `↑` `↓` `←` `→` `Esc` | `↑` `↓` `←` `→` `Esc` | 覆盖列表、搜索、项目筛选与暂缓菜单 |

## 设置项说明（`设置 → T3 Inbox`）

点击 Inbox 视图左下角的齿轮图标打开 **设置**，选择左侧 **T3 Inbox**：

- **侧栏视图**：随时切换 **收件箱视图（Inbox View）** 或宿主原生 **工作区视图（Workspaces View）**。
- **外观与布局**（在收件箱视图下显示）：
  - **背景**：可选 `跟随 DSH 主题（默认）`、`T3 预设色`（浅色 `#fafafa` / 深色 `#000000`）或 `自定义` 浅深双色。
  - **全局面板**：可选 `底栏（默认）`（置入左下角设置旁，最多平铺 3 个并折叠多余面板）、`顶部` 或 `隐藏`。
- **收件箱行为**（在收件箱视图下显示）：
  - **运行中分组**：开启后将运行中/等待中会话收起到「运行中」分组，完成后返回收件箱并显示未读完成。
  - **暂缓快捷选项**：编辑最多 8 个快捷选项并实时预览下次唤醒时刻，支持一键重置默认。
  - **时间格式**：控制暂缓菜单中唤醒时间的显示制式（`系统默认` / `12 小时制` / `24 小时制`）。

所有配置均按 profile 持久化保存在本地，跨重启保留。

## 兼容性与已知边界

- **宿主版本要求**：`dsh >= 0.2.2-rc.1`（已基于 DeepSeek Harness `0.2.2-rc.3` 实机验证）。
- **宽态样式适配说明**：为了无缝接管侧栏边框与顶部留白，宽态 CSS 对齐了当前版 `@deepseek-ai/dsh-client-ui-sidebar` 布局类（`kB3qhq_*`）。若未来宿主侧边栏有较大架构改版，插件需同步跟进；期间随时可在设置中切回原生 **工作区视图** 保证正常使用。
- **能力边界**：
  - `capabilities.awaitedWork` 为 `false`，运行态依据宿主原生运行与队列状态实时判定；
  - 千级根会话 / 200 子节点树并发读写上限已在合成压测中覆盖，暂未基于真实千级活跃会话样本做长期在线遥测。

## 本地开发

```sh
git clone https://github.com/tungloong/dsh-t3-inbox.git
cd dsh-t3-inbox
npm install --ignore-scripts
npm test
npm run check
npm audit --omit=dev
```

### 核心目录结构

- `index.js`：Host 服务（`T3InboxService`）、日志状态投影、树子节点聚合（并发上限 2）、持久化 domain、HMAC 签名 `writeContext`、CAS 写动作与条件撤销。
- `lib/model.js`：纯函数状态归并、注意力分类、T3 排序/搜索排名、拖拽落点投影与下一焦点候选计算。
- `lib/snooze-presets.js`：暂缓预设限制、工作日/夏令时解析与自定义时长计算。
- `lib/schemas.js`：持久化与 Typert 通信严格 Zod Schema。
- `lib/git-branch.js`：Git 分支与 worktree 检测工具。
- `typert.js`：严格 Typert Host 契约注册。
- `client.js`：客户端 Remote 挂载、侧栏 React UI、原生右键菜单、全局快捷键、悬浮提示与设置页组件。
- `locale/*.json`：8 语言包清单元数据。
- `test/`：模型、协议、Dom/React（`jsdom`，限制 512MB 堆）与并发单元测试（共 154 条）。

## 致谢

- 侧边栏视觉与注意力收件箱体验设计灵感源自 [T3 Code](https://github.com/pingdotgg/t3code)。
- 专为 [DeepSeek Harness](https://github.com/deepseek-ai) 插件生态构建。

## 开源协议

[MIT](LICENSE) © 2026 [tungloong](https://github.com/tungloong)
