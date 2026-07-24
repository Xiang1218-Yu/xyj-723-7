# Adventure Capitalist 项目增强规划文档

## 项目现状分析

本项目是一个基于 React + Redux 的增量放置类游戏（AdVenture Capitalist 克隆版）。

### 现有核心功能

| 功能模块 | 说明 |
|----------|------|
| 余额系统 | 资金增加/减少，金额四舍五入处理 |
| 业务系统 | 10 种业务（柠檬水摊到石油公司），可购买、手动运行 |
| 价格递增机制 | 每次购买价格上涨 10%（`PRICE_GAIN = 1.1`） |
| 利润增长机制 | 购买后利润按购买价 30% 增长（`PROFIT_FROM_PRICE = 0.3`） |
| 经理系统 | 10 位经理，雇佣后对应业务自动运行 |
| 离线收益 | 关闭页面后经理管理的业务继续产出，返回时弹窗展示 |
| 本地持久化 | 通过 localStorage 保存/恢复游戏状态 |
| 进度条与倒计时 | 实时显示业务生产进度和剩余时间 |

### 技术架构概览

- **状态管理**：Redux（4 个 reducer：balance、businesses、managers、awayEarning）
- **数据流向**：组件 `useDispatch` 触发 action → reducer 纯函数更新 → `useSelector` 订阅变化
- **持久化**：`store.subscribe` 自动保存到 localStorage，加载时执行离线收益计算
- **UI 组件**：Business、Managers、Progress、CountDown、Modal、EarningModal

---

## 一、可扩展功能模块（从 0-1 开发的全新独立功能）

以下 10 个模块均为独立的全新功能，彼此之间无依赖关系，也不与现有功能重复。

| 编号 | 模块名称 | 功能概述 | 核心交互 | 技术实现思路 |
|------|----------|----------|----------|-------------|
| 1 | **成就徽章系统** | 玩家达成特定里程碑时解锁成就徽章，展示在专属画廊中 | 点击导航栏成就图标打开面板，已解锁徽章高亮可查看详情，未解锁徽章显示解锁条件和进度百分比 | 新建 `src/redux/reducers/achievements.js`，定义成就规则配置表（如"持有 $1M"、"购买 100 个柠檬水摊"），在余额变更和购买 action 后触发成就检查，使用本地 mock 数据，无后端 |
| 2 | **业务升级道具商店** | 为每个业务提供一次性购买的永久升级道具（如"银质榨汁器：利润 x2"、"涡轮引擎：时间 -50%"） | 点击业务卡片上的升级图标打开升级列表，每个道具显示效果描述和价格，购买后道具变灰并实时生效 | 新建 `src/data/upgrades.js` 配置道具数据（id、businessId、name、description、cost、effect 类型和值），新建 `src/redux/reducers/upgrades.js` 管理购买状态，在 businesses reducer 计算利润和时间时应用已购买升级的效果叠加 |
| 3 | **统计数据仪表盘** | 可视化展示游戏过程中的关键统计指标 | 点击导航栏统计按钮打开仪表盘页面，包含数字卡片（总收入、总点击数、业务运行次数）和进度条（各业务收益占比），数据实时更新 | 新建 `src/redux/reducers/stats.js` 记录累计统计数据（totalEarned、totalClicks、businessRuns 等），在现有 action 处理中同步更新统计，使用纯 CSS 或轻量图表展示，数据全部来自本地状态 |
| 4 | **每日任务系统** | 每天刷新 3 个随机任务（如"今日赚取 $10K"、"购买 5 个业务"、"雇佣 1 位经理"），完成后获得奖励 | 打开任务面板查看今日任务列表和进度条，完成后任务卡片显示"领取"按钮，点击领取奖励资金 | 新建 `src/redux/reducers/dailyTasks.js`，任务模板配置在 `src/data/tasks.js`，使用日期字符串作为 key 存储每日任务和完成状态，进度通过订阅现有 balance/businesses/managers 变化自动追踪，奖励直接 dispatch increaseBalance |
| 5 | **天使投资者转生系统** | 重置当前进度以获得天使投资者，天使投资者永久提供全局收益加成 | 当余额达到阈值时转生按钮高亮，点击打开确认面板显示可获得的天使数量和加成比例，确认后重置游戏但保留天使数 | 新建 `src/redux/reducers/prestige.js` 管理天使数量，转生时根据总收益计算天使数（平方根公式），重置 businesses/managers/balance 到初始状态但保留 angels，在利润计算时乘以 `(1 + angels * 0.01)` 全局倍率 |
| 6 | **主题皮肤系统** | 提供多套 UI 配色方案，玩家可自由切换界面风格 | 打开设置面板选择主题（经典绿、暗夜紫、金融金、海洋蓝等），点击主题卡片即时预览，选择后全局生效 | 新建 `src/data/themes.js` 定义每套主题的 CSS 变量（主色、背景色、卡片色、文字色），在 `:root` 或 body 上动态设置 CSS 自定义属性，主题选择保存到 localStorage，使用 React Context 或 Redux 管理当前主题 |
| 7 | **游戏音效系统** | 为关键操作添加音效反馈，并提供音量控制和静音开关 | 点击按钮/购买/完成生产/雇佣经理时播放对应音效，设置面板中有音量滑块和静音切换按钮 | 使用 Web Audio API 或 HTML5 Audio 元素，新建 `src/utils/audio.js` 音频管理器，音效文件使用公开 CDN 资源或 base64 内联短音效，音量和静音状态存入 localStorage，在现有 action dispatch 后触发音效播放 |
| 8 | **随机新闻事件系统** | 游戏进行中随机弹出新闻事件，提供限时 buff/debuff 或选择奖励 | 随机间隔弹出新闻弹窗（如"柠檬水节！柠檬水摊收益 x3 持续 60 秒"、"经济危机：所有业务速度 -20% 持续 30 秒"），部分事件提供 2-3 个选项供玩家选择 | 新建 `src/redux/reducers/events.js` 管理活跃事件和剩余时间，事件模板配置在 `src/data/events.js`，使用 `setTimeout`/`setInterval` 触发随机事件，事件效果通过修改全局倍率或业务临时属性实现，倒计时结束自动清除效果 |
| 9 | **股票交易小游戏** | 一个独立的模拟股票交易面板，玩家可用游戏资金买卖虚拟股票 | 打开股票面板，显示 5 只虚拟股票的实时价格走势图（折线图），点击买入/卖出按钮输入股数，持有股票显示盈亏 | 新建 `src/components/StockMarket/` 独立模块，使用 mock 数据和随机游走算法生成股价波动，新建 `src/redux/reducers/stocks.js` 管理持有股票和现金，股价更新使用独立定时器，与主游戏经济隔离（仅共享余额入口/出口） |
| 10 | **本地排行榜系统** | 记录多个存档的里程碑数据，形成本地排行榜进行对比 | 打开排行榜面板，显示当前存档和历史存档的最高分、最快达成记录、总游戏时长等排名，支持标记当前存档 | 新建 `src/redux/reducers/leaderboard.js`，每次达成重要里程碑（如余额首次突破 $1M/$1B）时记录到排行榜数组，数据保存在 localStorage 独立 key 中，排行榜按指标降序排列，使用奖牌图标标注前三名 |

---

## 二、可迭代功能模块（在已有功能上开发增强）

以下 7 个模块均基于现有功能进行增强，与可扩展模块无重复，且彼此独立。

| 编号 | 模块名称 | 功能概述 | 核心交互 | 技术实现思路 |
|------|----------|----------|----------|-------------|
| 1 | **批量购买功能** | 在业务购买按钮旁增加购买数量选择器（x1 / x10 / x100 / Max） | 点击数量按钮切换购买模式，购买按钮显示当前模式下的总价格，点击后一次性购买指定数量 | 修改 `Business.js` 增加本地 `buyQty` 状态，修改 `buyBusiness` action 支持传入数量参数，在 businesses reducer 中循环计算价格递增（保持 1.1 复利公式），Max 模式通过 while 循环计算可承受的最大购买数 |
| 2 | **大数智能格式化** | 将超大数字自动转换为 K/M/B/T/aa/ab 等缩写格式显示 | 余额、利润、价格超过一定阈值时自动缩写（如 $1.5M、$2.3B），鼠标悬停显示完整数字 | 增强 [number.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/utils/number.js)，新增 `formatNumber(num)` 函数，定义后缀数组 `['', 'K', 'M', 'B', 'T', ...]`，以 1000 为进制递归缩写，在所有显示金额的地方（balance、profit、price）统一调用，使用 `<span title={完整数字}>` 显示原始值 |
| 3 | **业务排序与筛选** | 允许按不同维度排序列表中的业务，或按已解锁/未解锁筛选 | 列表顶部增加排序下拉菜单（按收益/价格/时间/解锁顺序）和筛选按钮（全部/已解锁/未解锁），切换后列表即时重排 | 在 `App.js` 中对 `objectToList(businesses)` 结果增加排序和筛选逻辑，排序选项作为本地状态管理，排序规则：按 profit/timeTaken 比值（收益率）、按 price、按 timeTaken、按原始 order，筛选条件检查 `quantityPurchased > 0` |
| 4 | **经理效率分级提升** | 已雇佣的经理可以被进一步"培训"以提升其管理业务的运行速度 | 在经理面板中已雇佣的经理显示培训按钮和等级，每次培训消耗资金并提升该业务速度 5%（最高 10 级） | 修改 managers 数据结构增加 `level` 字段（默认 1），新建 `TRAIN_MANAGER` action type 和对应 action，在 businesses reducer 计算 timeTaken 时除以经理速度倍率（`1 + (level - 1) * 0.05`），培训费用随等级指数增长 |
| 5 | **离线收益自定义设置** | 允许玩家调整离线收益的效率比例和最大离线时长 | 设置面板中增加滑块：离线效率（50%-100%）、最大离线时长（2h-24h），调整后实时预览预期收益 | 新建 `src/redux/reducers/settings.js` 管理用户偏好设置，在 [game.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/utils/game.js) 的 `processBackgroundCalculating` 中读取设置，对 `elapsedSeconds` 应用效率系数和上限截断，设置项保存到 localStorage |
| 6 | **键盘快捷键支持** | 为常用操作绑定键盘快捷键，提升操作效率 | 数字键 1-0 快速点击对应业务开始生产，B 键批量切换购买模式，M 键打开/关闭经理面板，Esc 关闭弹窗 | 在 `App.js` 中添加 `useEffect` 监听 `keydown` 事件，按键映射表定义在组件内部，通过 ref 或直接 dispatch action 触发对应业务操作，首次使用时弹出快捷键提示卡片 |
| 7 | **业务详情展开面板** | 点击业务名称展开详细统计信息面板 | 点击业务名称区域向下展开详情面板，显示：单次利润、每小时收益、购买数量、下次升级价格、已购升级数量、历史总收益 | 修改 `Business.js` 增加展开/收起的本地状态和详情区域 JSX，每小时收益通过 `profit * (3600 / timeTaken) * quantityPurchased` 计算，下次价格使用当前 price * 1.1 计算，详情面板使用 CSS transition 实现平滑展开动画 |

---

## 三、代码理解建议

### 建议 1：Redux 数据流与离线收益计算机制深度理解

**分析目标**：理解从页面关闭到重新打开这个完整闭环中，状态是如何被保存、恢复和计算的，以及 Redux 单向数据流的具体路径。

**分析步骤**：

1. **阅读入口文件** [index.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/index.js)：
   - 注意 `ReactDOM.render` 中 `<Provider store={store}>` 包裹整个应用
   - 注意 `window.addEventListener('unload', saveCloseTime)` —— 这是离线收益的起点

2. **阅读 Store 初始化** [store.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/store.js)：
   - 第 5 行：`createStore(rootReducer, loadState())` —— 初始状态来自 `loadState()`
   - 第 7-9 行：`store.subscribe` 每次状态变化都调用 `saveState`，理解 Redux 的订阅机制

3. **阅读持久化层** [localStorage.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/localStorage.js)：
   - `loadState()` 从 localStorage 读取 JSON 后调用 `processBackgroundCalculating`
   - 理解为什么要在加载状态时（而不是渲染后）立即计算离线收益
   - `saveCloseTime()` 在页面 unload 时记录时间戳

4. **核心算法分析** [game.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/utils/game.js) 的 `processBackgroundCalculating`：
   - 第 16-22 行：有经理的业务按完成周期数计算总收益（`completedTimes * profit`）
   - 第 29-34 行：无经理但已开始的业务判断是否在离线期间完成
   - 第 41-44 行：构造 `awayEarning` 对象包含金额和时长
   - **关键思考点**：第 21 行为什么要更新 `item.lastRun`？这是为了防止重复计算已结算的周期

5. **追踪一个完整 Action 路径**：以"雇佣经理"为例
   - 组件 [Managers.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Managers/Managers.js) 第 19 行 `dispatch(hireManager(manager))`
   - Action 创建 [actions.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/actions.js) 第 32-37 行返回 `{ type: HIRE_MANAGER, payload: { manager } }`
   - Reducer 分发 [reducers/index.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/index.js) combineReducers 将 action 传递给两个子 reducer
   - [managers.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/managers.js) 将对应经理标记为 `hired: true`
   - [businesses.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/businesses.js) 第 43-52 行将对应业务标记为 `hasManager: true`
   - 组件 [Business.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Business/Business.js) 第 42-49 行 useEffect 检测到 `hasManager` 变为 true 后自动启动生产
   - 同时第 7-9 行 store.subscribe 触发 `saveState` 写入 localStorage

6. **识别潜在问题**：
   - `processBackgroundCalculating` 直接修改传入的 state 对象（第 21、35 行 `item.lastRun = ...`），违反了 Redux reducer 纯函数原则
   - `DECREASSE_BALANCE` 拼写错误（actionTypes.js 第 2 行）
   - 余额可以变为负数（buy 函数中只检查是否够买，但并发情况下可能有问题）

**输出内容**：
- 绘制"页面关闭→保存→刷新→计算离线收益→弹窗显示"的完整时序图（文字描述）
- 标注出每个阶段涉及的关键文件和函数
- 记录发现的违反纯函数原则的代码位置
- 理解 `uuid` 机制在 CountDown/Progress 组件中的作用（作为重新触发 useEffect 的 key）

---

### 建议 2：业务购买经济模型与价格/利润公式推导

**分析目标**：深入理解游戏核心经济循环的数值设计，掌握价格递增和利润增长的数学模型。

**分析步骤**：

1. **阅读常量定义** [businesses.js reducer](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/businesses.js) 第 10-11 行：
   - `PROFIT_FROM_PRICE = 0.3`：每次购买增加的利润 = 当前价格 × 0.3
   - `PRICE_GAIN = 1.1`：每次购买后价格变为原来的 1.1 倍

2. **推导价格公式**：
   - 初始价格 P₀，第 n 次购买时的价格 P(n) = P₀ × 1.1^n
   - 购买 n 个的总花费 = P₀ × (1.1^n - 1) / 0.1（等比数列求和）

3. **推导利润公式**：
   - 初始利润 R₀，第 1 次购买后利润 = R₀ + P₀ × 1 × 0.3
   - 第 2 次购买后利润 = R₀ + P₀ × 0.3 + P₁ × 0.3 = R₀ + 0.3 × P₀ × (1 + 1.1)
   - 第 n 次购买后利润 = R₀ + 0.3 × P₀ × (1.1^n - 1) / 0.1 = R₀ + 3 × P₀ × (1.1^n - 1)
   - 对比价格 P(n) = P₀ × 1.1^n，利润增长速度约为 3 倍价格

4. **分析回本周期**：
   - 单次运行利润 = R(n)，运行时间 = T（不变）
   - 每秒收益 = R(n) / T
   - 第 n 次购买的回本时间 = P(n) / (R(n) / T) = P(n) × T / R(n)
   - 当 n 很大时，R(n) ≈ 3 × P(n)，所以回本时间 ≈ T / 3（固定值）

5. **验证初始数据** [businesses.js 数据](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/data/businesses.js)：
   - 柠檬水摊：价格 $1，利润 $1，时间 1 秒 → 购买 1 个后利润 = 1 + 1×0.3 = 1.3，价格 = 1.1
   - 石油公司：价格 $153B，利润 $51B → 利润/价格 ≈ 0.334
   - 思考为什么不同业务的初始利润/价格比例不同

6. **分析组件状态与 Redux 状态的边界**：
   - [Business.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Business/Business.js) 中 `running`、`timeAlreadyRun`、`uuid` 是组件本地状态
   - `lastRun` 存储在 Redux 中（通过 `setLastRun` action）
   - 理解为什么 `lastRun` 需要在 Redux 中（离线收益需要）而 `running` 不需要
   - 分析 `uuid` 作为 useEffect 依赖项的设计模式：每次需要重新启动倒计时时生成新 uuid

**输出内容**：
- 价格和利润的数学公式推导过程
- 回本周期随购买次数变化的曲线分析（文字描述）
- 初始业务数值设计的合理性评估
- 组件本地状态 vs Redux 全局状态的设计决策记录
- `uuid` 重新触发机制的工作原理图

---

## 四、代码重构建议

### 建议 1：修复纯函数违规与拼写错误，统一状态更新逻辑

**问题识别**：

1. **直接修改状态对象**：[game.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/utils/game.js) 第 21、35 行直接修改了 `state.businesses[item.id]` 和 `item.lastRun`，这在 Redux 中是严重的反模式。虽然 `loadState` 在 createStore 之前调用（严格来说还不在 reducer 内），但 `processBackgroundCalculating` 是一个纯计算函数，不应该有副作用和对象突变。

2. **拼写错误**：`DECREASSE_BALANCE` 在 [actionTypes.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/actionTypes.js) 第 2 行和所有引用处都多了一个 S。

3. **reducer 中缺少 action type import**：[businesses.js reducer](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/businesses.js) 中 BUY_BUSINESS case 里 `const qty = action.payload.qty` 被读取但实际没有在计算中使用 qty 参数（第 20、21 行使用了 qty 但公式只适用于单次购买）。

4. **awayEarning reducer 是空的**：[awayEarning.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/awayEarning.js) 只有一个 default case，没有任何 action 处理它，但 `processBackgroundCalculating` 直接在 state 上设置了 awayEarning 属性，绕过了 Redux 数据流。

5. **SET_LAST_RUN case 缺少大括号**：[businesses.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/businesses.js) 第 33-41 行 `case SET_LAST_RUN:` 后 `const business` 声明在 switch 块作用域中，没有用大括号包裹，这在严格模式下可能导致变量提升问题。

**重构方案**：

1. **重写 `processBackgroundCalculating` 为不可变更新**：

```javascript
export const processBackgroundCalculating = state => {
  let earning = 0;
  const now = Date.now();
  const closeTime = getCloseTime() || now;

  const updatedBusinesses = {};
  Object.values(state.businesses).forEach(item => {
    let updatedItem = { ...item };
    if (item.quantityPurchased && item.hasManager && item.lastRun) {
      const elapsedSeconds = Math.floor((now - item.lastRun) / 1000);
      const completedTimes = Math.floor(elapsedSeconds / item.timeTaken);
      earning += completedTimes * item.profit;
      updatedItem.lastRun = item.lastRun + completedTimes * item.timeTaken * 1000;
    }
    if (item.quantityPurchased && item.hasManager && !item.lastRun) {
      updatedItem.lastRun = now;
    }
    if (item.quantityPurchased && !item.hasManager && item.lastRun
      && (closeTime - item.lastRun) < item.timeTaken * 1000) {
      if ((now - item.lastRun) >= item.timeTaken * 1000) {
        earning += item.profit;
      }
    }
    updatedBusinesses[item.id] = updatedItem;
  });

  return {
    ...state,
    businesses: updatedBusinesses,
    balance: {
      ...state.balance,
      amount: round(state.balance.amount + earning)
    },
    awayEarning: {
      amount: earning,
      awayDuration: millisecondsToStr(now - closeTime)
    }
  };
};
```

2. **修正拼写错误**：将所有 `DECREASSE_BALANCE` 改为 `DECREASE_BALANCE`（包括 actionTypes.js、actions.js、balance.js reducer）。

3. **修复 BUY_BUSINESS 支持多数量购买**：

```javascript
case BUY_BUSINESS: {
  const { businessId, qty } = action.payload;
  const business = state[businessId];
  let totalCost = 0;
  let currentPrice = business.price;
  let profitIncrease = 0;
  for (let i = 0; i < qty; i++) {
    totalCost += round(currentPrice);
    profitIncrease += currentPrice * PROFIT_FROM_PRICE;
    currentPrice = round(currentPrice * PRICE_GAIN);
  }
  const newPrice = round(business.price * Math.pow(PRICE_GAIN, qty));
  return {
    ...state,
    [businessId]: {
      ...business,
      quantityPurchased: business.quantityPurchased + qty,
      price: newPrice,
      profit: round(business.profit + profitIncrease),
      totalSpent: (business.totalSpent || 0) + totalCost
    }
  };
}
```

4. **为 SET_LAST_RUN case 添加大括号**：

```javascript
case SET_LAST_RUN: {
  const business = state[action.payload.businessId];
  return {
    ...state,
    [business.id]: {
      ...business,
      lastRun: Date.now()
    }
  };
}
```

**预期收益**：
- 消除状态突变导致的潜在 bug（如 UI 不更新、时间旅行调试失效）
- 为批量购买功能（可迭代模块 #1）打下基础
- 代码可读性和可维护性提升
- awayEarning 状态变更路径更加清晰

---

### 建议 2：组件拆分与自定义 Hook 提取

**问题识别**：

1. **Business 组件职责过重**：[Business.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Business/Business.js) 一个文件中混合了：购买逻辑、手动运行逻辑、自动运行管理、进度条协调、UI 渲染。组件有 3 个 useState 和 2 个 useEffect，业务逻辑和视图耦合。

2. **定时器逻辑重复**：[Progress.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Progress/Progress.js) 和 [CountDown.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/CountDown/CountDown.js) 各自独立使用 setInterval，逻辑高度相似（都是基于时间差计算进度），但没有复用。而且 CountDown 每 10ms 更新一次（第 23 行），Progress 每 ~1ms 更新一次（没有间隔参数），性能浪费。

3. **Modal 样式硬编码重复**：[Managers.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Managers/Managers.js) 第 28-52 行、[Modal.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Modal/Modal.js) 第 6-22 行、[EarningModal.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/EarningModal/EarningModal.js) 第 10-22 行，三个弹窗的遮罩层和关闭按钮 JSX 结构几乎一样，存在大量重复代码。

4. **内联样式和条件类名拼接**：多处使用字符串拼接 `'business-buy' + (balance.amount >= price ? ' active' : '')`，容易出错且不优雅。

**重构方案**：

1. **提取通用弹窗组件**：

```jsx
// src/components/Modal/Modal.jsx（改造为通用容器）
export function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-close" onClick={onClose}>
          <img src={process.env.PUBLIC_URL + '/images/close.png'} alt="Close" />
        </div>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
```

2. **提取 `useBusinessTimer` 自定义 Hook**：

```javascript
// src/hooks/useBusinessTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';

export function useBusinessTimer({ timeTaken, lastRun, autoStart, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeTaken);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef();

  const calculateProgress = useCallback(() => {
    if (!lastRun) return 0;
    const elapsed = Date.now() - lastRun;
    return Math.min(100, (elapsed / timeTaken) * 100);
  }, [lastRun, timeTaken]);

  useEffect(() => {
    if (!running) return;
    const startTime = lastRun || Date.now();
    const endTime = startTime + timeTaken;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now >= endTime) {
        clearInterval(intervalRef.current);
        setProgress(100);
        setTimeLeft(0);
        onComplete?.();
      } else {
        setProgress(((now - startTime) / timeTaken) * 100);
        setTimeLeft(endTime - now);
      }
    }, 50); // 统一为 50ms 更新（20fps 足够流畅）

    return () => clearInterval(intervalRef.current);
  }, [running, lastRun, timeTaken, onComplete]);

  return { progress, timeLeft, running, start: () => setRunning(true) };
}
```

3. **提取 `useGameActions` Hook**：封装业务相关的 dispatch 调用：

```javascript
// src/hooks/useGameActions.js
import { useDispatch, useSelector } from 'react-redux';
import { increaseBalance, decreaseBalance, buyBusiness, setLastRun, hireManager } from '../redux/actions';

export function useGameActions() {
  const dispatch = useDispatch();
  const balance = useSelector(state => state.balance);

  return {
    balance,
    canAfford: (cost) => balance.amount >= cost,
    runBusiness: (id) => dispatch(setLastRun(id)),
    buyBusiness: (id, qty = 1) => {
      dispatch(buyBusiness(id, qty));
      // 注意：价格计算应在 reducer 中完成，组件不应知道具体价格
    },
    hireManager: (manager) => dispatch(hireManager(manager)),
    addMoney: (amount) => dispatch(increaseBalance(amount)),
    spendMoney: (amount) => dispatch(decreaseBalance(amount))
  };
}
```

4. **使用 clsx 或简单的条件类名工具函数**：

```javascript
// src/utils/cn.js
export const cn = (...classes) => classes.filter(Boolean).join(' ');

// 使用方式
<div className={cn('business-buy', balance.amount >= price && 'active')} onClick={buy}>
```

5. **拆分 Business 组件为更小的子组件**：
   - `BusinessIcon`（图标+数量角标+点击运行）
   - `BusinessProgress`（进度条+利润显示）
   - `BusinessControls`（购买按钮+倒计时）
   - `BusinessUnpurchased`（未解锁状态）

**预期收益**：
- 代码重复率降低约 40%（弹窗、定时器、类名拼接）
- 定时器从 ~1ms 和 10ms 统一为 50ms，减少不必要的渲染，性能提升
- Business 组件从 ~95 行缩减到 ~50 行，每个子组件职责单一
- 自定义 Hook 可在其他功能模块（如升级道具、每日任务）中复用

---

## 五、代码测试建议

### 建议 1：核心逻辑单元测试（工具函数与 Redux Reducer）

**测试框架选择**：Jest（项目已有 `react-scripts test`，Jest 已内置）

**测试范围与重点**：

1. **工具函数测试**（`src/utils/` 目录）：

```javascript
// src/utils/number.test.js
import { round } from './number';

describe('round', () => {
  it('rounds to 2 decimal places by default', () => {
    expect(round(1.234)).toBe(1.23);
    expect(round(1.235)).toBe(1.24);
  });

  it('handles NaN input', () => {
    expect(round(NaN)).toBe(0);
  });

  it('supports custom precision', () => {
    expect(round(3.14159, 4)).toBe(3.1416);
    expect(round(3.14159, 0)).toBe(3);
  });

  it('corrects floating point errors', () => {
    expect(round(0.1 + 0.2)).toBe(0.3);
  });
});
```

```javascript
// src/utils/time.test.js
import { millisecondsToStr } from './time';

describe('millisecondsToStr', () => {
  it('formats seconds', () => {
    expect(millisecondsToStr(5000)).toBe('5 seconds');
    expect(millisecondsToStr(1000)).toBe('1 second');
  });

  it('formats minutes', () => {
    expect(millisecondsToStr(120000)).toBe('2 minutes');
  });

  it('formats hours', () => {
    expect(millisecondsToStr(7200000)).toBe('2 hours');
  });

  it('formats days', () => {
    expect(millisecondsToStr(172800000)).toBe('2 days');
  });

  it('formats years', () => {
    expect(millisecondsToStr(63072000000)).toBe('2 years');
  });

  it('returns "less than a second" for very small durations', () => {
    expect(millisecondsToStr(0)).toBe('less than a second');
    expect(millisecondsToStr(500)).toBe('less than a second');
  });

  it('shows milliseconds when requested', () => {
    expect(millisecondsToStr(500, true)).toContain('millisecond');
  });
});
```

2. **游戏逻辑测试**（`src/utils/game.js`）：

```javascript
// src/utils/game.test.js
import { objectToList, processBackgroundCalculating } from './game';
import businesses from '../data/businesses';
import managers from '../data/managers';

describe('objectToList', () => {
  it('converts object to sorted array by order property', () => {
    const obj = {
      b: { order: 2, name: 'B' },
      a: { order: 1, name: 'A' }
    };
    const list = objectToList(obj);
    expect(list).toHaveLength(2);
    expect(list[0].name).toBe('A');
    expect(list[1].name).toBe('B');
  });
});

describe('processBackgroundCalculating', () => {
  const now = Date.now();

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    // mock getCloseTime
    jest.mock('../localStorage', () => ({
      getCloseTime: () => now - 10000 // 10 seconds ago
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calculates earnings for businesses with managers', () => {
    const state = {
      balance: { amount: 100 },
      businesses: {
        lemonade_stand: {
          ...businesses.lemonade_stand,
          quantityPurchased: 1,
          hasManager: true,
          lastRun: now - 5000, // 5 seconds ago, timeTaken=1s, so 5 cycles
          profit: 1,
          timeTaken: 1
        }
      },
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };

    const result = processBackgroundCalculating(state);
    expect(result.balance.amount).toBe(105); // 5 cycles * $1
    expect(result.awayEarning.amount).toBe(5);
  });

  it('does not mutate the original state', () => {
    const state = {
      balance: { amount: 0 },
      businesses: {},
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };
    const originalBalance = state.balance.amount;
    processBackgroundCalculating(state);
    expect(state.balance.amount).toBe(originalBalance);
  });

  it('handles businesses without managers that completed while away', () => {
    const state = {
      balance: { amount: 0 },
      businesses: {
        lemonade_stand: {
          ...businesses.lemonade_stand,
          quantityPurchased: 1,
          hasManager: false,
          lastRun: now - 2000, // started 2 seconds ago
          profit: 1,
          timeTaken: 1
        }
      },
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };
    const result = processBackgroundCalculating(state);
    expect(result.balance.amount).toBe(1); // completed once
  });
});
```

3. **Reducer 测试**：

```javascript
// src/redux/reducers/businesses.test.js
import businessesReducer from './businesses';
import { BUY_BUSINESS, SET_LAST_RUN, HIRE_MANAGER } from '../actionTypes';
import initialBusinesses from '../../data/businesses';

describe('businesses reducer', () => {
  it('returns initial state', () => {
    const state = businessesReducer(undefined, { type: '@@INIT' });
    expect(state.lemonade_stand.price).toBe(1);
    expect(state.lemonade_stand.profit).toBe(1);
    expect(state.lemonade_stand.quantityPurchased).toBe(1);
  });

  it('increases price by 10% on buy', () => {
    const action = { type: BUY_BUSINESS, payload: { businessId: 'lemonade_stand', qty: 1 } };
    const state = businessesReducer(initialBusinesses, action);
    expect(state.lemonade_stand.price).toBeCloseTo(1.1, 5);
    expect(state.lemonade_stand.quantityPurchased).toBe(2);
  });

  it('increases profit by 30% of current price on buy', () => {
    const action = { type: BUY_BUSINESS, payload: { businessId: 'lemonade_stand', qty: 1 } };
    const state = businessesReducer(initialBusinesses, action);
    // profit = original profit + price * 0.3 = 1 + 1 * 0.3 = 1.3
    expect(state.lemonade_stand.profit).toBeCloseTo(1.3, 5);
  });

  it('sets lastRun timestamp', () => {
    const action = { type: SET_LAST_RUN, payload: { businessId: 'lemonade_stand' } };
    const before = Date.now();
    const state = businessesReducer(initialBusinesses, action);
    const after = Date.now();
    expect(state.lemonade_stand.lastRun).toBeGreaterThanOrEqual(before);
    expect(state.lemonade_stand.lastRun).toBeLessThanOrEqual(after);
  });

  it('marks business as having manager on HIRE_MANAGER', () => {
    const action = {
      type: HIRE_MANAGER,
      payload: { manager: { id: 'alex', businessId: 'lemonade_stand' } }
    };
    const state = businessesReducer(initialBusinesses, action);
    expect(state.lemonade_stand.hasManager).toBe(true);
  });
});
```

```javascript
// src/redux/reducers/balance.test.js
import balanceReducer from './balance';
import { INCREASE_BALANCE, DECREASE_BALANCE } from '../actionTypes';

describe('balance reducer', () => {
  it('increases balance', () => {
    const state = { amount: 100 };
    const action = { type: INCREASE_BALANCE, payload: { amount: 50 } };
    expect(balanceReducer(state, action).amount).toBe(150);
  });

  it('decreases balance', () => {
    const state = { amount: 100 };
    const action = { type: DECREASE_BALANCE, payload: { amount: 30 } };
    expect(balanceReducer(state, action).amount).toBe(70);
  });

  it('rounds floating point results', () => {
    const state = { amount: 0.1 };
    const action = { type: INCREASE_BALANCE, payload: { amount: 0.2 } };
    expect(balanceReducer(state, action).amount).toBe(0.3);
  });
});
```

**测试覆盖率目标**：
- `utils/` 目录：>= 95%（纯函数，容易测试）
- `redux/reducers/` 目录：>= 90%
- 整体语句覆盖率：>= 70%

---

### 建议 2：组件集成测试与交互测试

**测试框架选择**：React Testing Library（已在 dependencies 中）+ Jest

**测试范围与场景**：

1. **Business 组件交互测试**：

```javascript
// src/components/Business/Business.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '../../redux/reducers';
import { Business } from './Business';
import businesses from '../../data/businesses';

const renderWithStore = (ui, initialState) => {
  const store = createStore(rootReducer, initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

describe('Business', () => {
  const lemonade = businesses.lemonade_stand;

  it('renders unpurchased business with lock screen', () => {
    const initialState = {
      balance: { amount: 0 },
      businesses: { newspaper_delivery: { ...businesses.newspaper_delivery, quantityPurchased: 0 } },
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };
    renderWithStore(
      <Business {...businesses.newspaper_delivery} timeTaken={businesses.newspaper_delivery.timeTaken * 1000} />,
      initialState
    );
    expect(screen.getByText(/Newspaper Deliver/i)).toBeInTheDocument();
    expect(screen.getByText(/\$30/)).toBeInTheDocument();
  });

  it('purchases a business when affordable', () => {
    const initialState = {
      balance: { amount: 100 },
      businesses: { newspaper_delivery: { ...businesses.newspaper_delivery, quantityPurchased: 0 } },
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };
    renderWithStore(
      <Business {...businesses.newspaper_delivery} timeTaken={businesses.newspaper_delivery.timeTaken * 1000} />,
      initialState
    );
    fireEvent.click(screen.getByText(/\$30/));
    // After buy, the business should show as purchased (quantity 1)
    // and balance should decrease
  });

  it('does not purchase when balance is insufficient', () => {
    const initialState = {
      balance: { amount: 10 },
      businesses: { newspaper_delivery: { ...businesses.newspaper_delivery, quantityPurchased: 0 } },
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };
    renderWithStore(
      <Business {...businesses.newspaper_delivery} timeTaken={businesses.newspaper_delivery.timeTaken * 1000} />,
      initialState
    );
    const buyArea = screen.getByText(/\$30/).closest('.business-unpurchased');
    expect(buyArea).not.toHaveClass('active');
  });

  it('starts manual run when icon clicked', () => {
    jest.useFakeTimers();
    const initialState = {
      balance: { amount: 100 },
      businesses: { lemonade_stand: { ...lemonade, quantityPurchased: 1 } },
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    };
    renderWithStore(
      <Business {...lemonade} timeTaken={lemonade.timeTaken * 1000} />,
      initialState
    );
    fireEvent.click(screen.getByAltText('icon'));
    // Progress bar should appear
    jest.advanceTimersByTime(1000); // complete the 1s cycle
    // onComplete should have been called
    jest.useRealTimers();
  });
});
```

2. **Managers 组件测试**：

```javascript
// src/components/Managers/Managers.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '../../redux/reducers';
import { Managers } from './Managers';
import managers from '../../data/managers';

describe('Managers', () => {
  const renderWithStore = (amount = 0) => {
    const store = createStore(rootReducer, {
      balance: { amount },
      businesses: {},
      managers: { ...managers },
      awayEarning: { amount: 0, awayDuration: '' }
    });
    return render(<Provider store={store}><Managers /></Provider>);
  };

  it('opens modal when Managers button clicked', () => {
    renderWithStore();
    expect(screen.queryByText(/Looking to make your life easier/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Managers'));
    expect(screen.getByText(/Looking to make your life easier/)).toBeInTheDocument();
  });

  it('shows available managers', () => {
    renderWithStore();
    fireEvent.click(screen.getByText('Managers'));
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });

  it('hires a manager when affordable', () => {
    renderWithStore(100);
    fireEvent.click(screen.getByText('Managers'));
    const hireButton = screen.getAllByText('Hire')[0]; // Alex costs $20
    expect(hireButton).not.toBeDisabled();
    fireEvent.click(hireButton);
    // Alex should no longer appear in the available list
  });

  it('disables hire button when not enough money', () => {
    renderWithStore(0);
    fireEvent.click(screen.getByText('Managers'));
    const hireButtons = screen.getAllByText('Hire');
    hireButtons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('highlights Managers button when an affordable manager exists', () => {
    const { container } = renderWithStore(100);
    const btn = container.querySelector('.manager-btn');
    expect(btn).toHaveClass('active');
  });
});
```

3. **EarningModal 测试**：

```javascript
// src/components/EarningModal/EarningModal.test.js
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { EarningModal } from './EarningModal';

describe('EarningModal', () => {
  it('displays away earning amount and duration', () => {
    const store = createStore(() => ({
      awayEarning: { amount: 1234.56, awayDuration: '5 minutes' }
    }));
    render(
      <Provider store={store}>
        <EarningModal onClose={jest.fn()} />
      </Provider>
    );
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.getByText('5 minutes')).toBeInTheDocument();
    expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    const store = createStore(() => ({
      awayEarning: { amount: 100, awayDuration: '1 minute' }
    }));
    render(
      <Provider store={store}>
        <EarningModal onClose={onClose} />
      </Provider>
    );
    fireEvent.click(screen.getByAltText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

4. **App 组件集成测试**：

```javascript
// src/App.test.js
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './redux/reducers';
import App from './App';

describe('App', () => {
  it('renders welcome modal on first visit (balance is 0)', () => {
    const store = createStore(rootReducer, {
      balance: { amount: 0 },
      businesses: {},
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    });
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(screen.getByText(/Wecome!/)).toBeInTheDocument(); // 注意原代码拼写 Wecome
  });

  it('shows balance amount', () => {
    const store = createStore(rootReducer, {
      balance: { amount: 42 },
      businesses: {},
      managers: {},
      awayEarning: { amount: 0, awayDuration: '' }
    });
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(screen.getByText('$42')).toBeInTheDocument();
  });
});
```

**运行方式**：`npm test`（使用 react-scripts test，即 Jest + React Testing Library）

**注意事项**：
- 测试中使用 `jest.useFakeTimers()` 控制时间，避免真实等待
- 对于 setInterval 驱动的组件，使用 `jest.advanceTimersByTime()` 快进
- 为 data-testid 属性预留选择器（在 JSX 中添加 `data-testid="xxx"`）

---

## 六、代码工程化建议（高级架构级）

### 建议 1：固定时间步游戏循环引擎重构（Game Loop with Fixed Timestep）

**背景与问题**：当前项目中每个 Business 组件各自维护一个 `setInterval`（[Progress.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Progress/Progress.js) 无间隔参数约 1ms 触发、[CountDown.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/CountDown/CountDown.js) 每 10ms 触发）。10 个业务意味着最多 20 个独立定时器并发运行，带来以下问题：
- 定时器频率不一致导致 UI 更新不同步（进度条和倒计时可能错位 1-2 帧）
- `setInterval` 在浏览器标签页切换时会被节流到 1Hz，导致时间计算漂移
- 没有统一的暂停/恢复机制，页面 visibility change 时无法正确处理
- 组件卸载和重新挂载时定时器管理混乱（靠 uuid hack 重新触发 useEffect）
- 离线收益计算和在线收益计算是两套独立逻辑，容易不一致

**重构方案**：实现一个集中式的、基于 `requestAnimationFrame` 的固定时间步游戏循环引擎，采用"累加器模式"（Accumulator Pattern）。

**核心架构设计**：

```
┌─────────────────────────────────────────────────────┐
│                   Game Engine                        │
│                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐    │
│  │  rAF     │───>│  Accumu- │───>│ Fixed Update │    │
│  │  Loop    │    │  lator   │    │ (tick=100ms) │    │
│  └──────────┘    └──────────┘    └──────┬───────┘    │
│                                         │             │
│                    ┌────────────────────┼────────┐    │
│                    │                    │        │    │
│              ┌─────▼─────┐  ┌──────────▼──┐ ┌───▼─┐  │
│              │ Business  │  │  Event Bus  │ │Save │  │
│              │  System   │  │ (pub/sub)   │ │Mgr  │  │
│              └───────────┘  └─────────────┘ └─────┘  │
└─────────────────────────────────────────────────────┘
```

**实施步骤**：

1. **创建游戏引擎核心** `src/engine/GameEngine.js`：

```javascript
const TICK_RATE = 100; // 每 100ms 一个逻辑帧（10 FPS 逻辑更新足够）
const MAX_FRAME_DELTA = 1000; // 防止标签页切回时一次性跳太多帧（最多追赶 1 秒 = 10 帧）

export class GameEngine {
  constructor() {
    this.systems = new Map();       // 注册的游戏系统
    this.listeners = new Map();     // 事件监听器
    this.running = false;
    this.paused = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.tickCount = 0;
    this.rafId = null;
    this._bindVisibilityHandler();
  }

  registerSystem(name, system) {
    this.systems.set(name, system);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this._loop();
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; this.lastTime = performance.now(); }

  _loop = () => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this._loop);
    if (this.paused) return;

    const now = performance.now();
    let delta = now - this.lastTime;
    this.lastTime = now;

    if (delta > MAX_FRAME_DELTA) delta = MAX_FRAME_DELTA;
    this.accumulator += delta;

    while (this.accumulator >= TICK_RATE) {
      this._tick(TICK_RATE);
      this.accumulator -= TICK_RATE;
    }

    this.emit('render', {
      alpha: this.accumulator / TICK_RATE, // 插值因子 0-1，用于平滑渲染
      tickCount: this.tickCount
    });
  }

  _tick(dt) {
    this.tickCount++;
    const timestamp = Date.now();
    for (const system of this.systems.values()) {
      system.update(dt, timestamp, this);
    }
  }

  _bindVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
        this.emit('suspend', { time: Date.now() });
      } else {
        this.emit('resume', { awayTime: Date.now() });
        this.resume();
      }
    });
  }

  destroy() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.systems.clear();
    this.listeners.clear();
  }
}
```

2. **创建业务系统** `src/engine/systems/BusinessSystem.js`，统一管理所有业务的生产进度：

```javascript
import { INCREASE_BALANCE, SET_LAST_RUN } from '../../redux/actionTypes';

export class BusinessSystem {
  constructor(store) {
    this.store = store;
    this.progress = {}; // { businessId: { lastRun, completedCycles } }
  }

  update(dt, now, engine) {
    const state = this.store.getState();
    let totalEarning = 0;
    const updates = {};

    for (const business of Object.values(state.businesses)) {
      if (!business.quantityPurchased) continue;
      if (!business.hasManager && !business.lastRun) continue;

      const timeTakenMs = business.timeTaken * 1000;
      const lastRun = business.lastRun || now;

      // 对有经理的业务：在固定时间步内计算完成的完整周期
      if (business.hasManager) {
        const elapsed = now - lastRun;
        const cyclesCompleted = Math.floor(elapsed / timeTakenMs);
        if (cyclesCompleted > 0) {
          totalEarning += cyclesCompleted * business.profit;
          updates[business.id] = {
            ...business,
            lastRun: lastRun + cyclesCompleted * timeTakenMs
          };
        }
      } else {
        // 无经理但手动启动的业务：检查是否完成单个周期
        if (business.lastRun && (now - business.lastRun) >= timeTakenMs) {
          totalEarning += business.profit;
          // 不自动重启，等待玩家再次点击
          updates[business.id] = { ...business, lastRun: null, _completed: true };
          engine.emit('business:completed', { businessId: business.id, profit: business.profit });
        }
      }
    }

    if (Object.keys(updates).length > 0 || totalEarning > 0) {
      this.store.dispatch({
        type: 'ENGINE_BATCH_UPDATE',
        payload: { businesses: updates, earning: totalEarning }
      });
    }
  }
}
```

3. **创建 SaveSystem** `src/engine/systems/SaveSystem.js`，统一管理自动保存：

```javascript
const SAVE_INTERVAL = 5000; // 每 5 秒保存一次

export class SaveSystem {
  constructor(saveFn) {
    this.saveFn = saveFn;
    this.timeSinceLastSave = 0;
  }

  update(dt) {
    this.timeSinceLastSave += dt;
    if (this.timeSinceLastSave >= SAVE_INTERVAL) {
      this.saveFn();
      this.timeSinceLastSave = 0;
    }
  }
}
```

4. **创建 React Context Provider** `src/engine/GameEngineProvider.jsx`：

```jsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { GameEngine } from './GameEngine';
import { BusinessSystem } from './systems/BusinessSystem';
import { SaveSystem } from './systems/SaveSystem';
import { saveState, saveCloseTime } from '../localStorage';
import store from '../redux/store';

const EngineContext = createContext(null);

export function GameEngineProvider({ children }) {
  const engineRef = useRef(null);
  if (!engineRef.current) {
    const engine = new GameEngine();
    engine.registerSystem('business', new BusinessSystem(store));
    engine.registerSystem('save', new SaveSystem(() => saveState(store.getState())));
    engineRef.current = engine;
  }

  useEffect(() => {
    engineRef.current.start();
    const handleUnload = () => {
      saveState(store.getState());
      saveCloseTime();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      engineRef.current.destroy();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <EngineContext.Provider value={engineRef.current}>
      {children}
    </EngineContext.Provider>
  );
}

export const useGameEngine = () => useContext(EngineContext);
```

5. **改造 Business 组件使用引擎驱动的渲染**（不再用本地 setInterval）：

```jsx
// src/components/Business/Business.js 改造核心部分
import { useGameEngine } from '../../engine/GameEngineProvider';

export function Business({ id, name, price, lastRun, timeTaken, hasManager, quantityPurchased, icon, profit }) {
  const engine = useGameEngine();
  const [renderProgress, setRenderProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeTaken);
  const dispatch = useDispatch();
  const balance = useSelector(state => state.balance);

  useEffect(() => {
    if (!engine) return;
    // 订阅引擎的 render 事件，每帧更新 UI
    const unsubscribe = engine.on('render', ({ alpha }) => {
      if (!lastRun) { setRenderProgress(0); setTimeLeft(timeTaken); return; }
      const now = Date.now();
      const elapsed = now - lastRun;
      const ratio = Math.min(1, elapsed / timeTaken);
      setRenderProgress(ratio * 100);
      setTimeLeft(Math.max(0, timeTaken - elapsed));
      // 如果有经理且周期完成，引擎会自动处理 dispatch
      // 如果无经理且完成，监听 business:completed 事件
    });
    return unsubscribe;
  }, [engine, lastRun, timeTaken]);

  // 无经理业务完成时的回调
  useEffect(() => {
    if (!engine) return;
    return engine.on('business:completed', ({ businessId }) => {
      if (businessId === id && !hasManager) {
        // 播放完成动画/音效
      }
    });
  }, [engine, id, hasManager]);

  const runBusinessManually = () => {
    if (!lastRun && quantityPurchased) {
      dispatch(setLastRun(id));
    }
  };
  // ... 其余 UI 渲染逻辑保持
}
```

6. **新增 ENGINE_BATCH_UPDATE reducer** 替换分散的 action：

```javascript
// src/redux/reducers/businesses.js 新增 case
case 'ENGINE_BATCH_UPDATE': {
  const { businesses: updates, earning } = action.payload;
  const newState = { ...state };
  for (const [id, update] of Object.entries(updates)) {
    const { _completed, ...rest } = update;
    newState[id] = { ...newState[id], ...rest, lastRun: _completed ? null : rest.lastRun };
  }
  // earning 通过单独的 meta reducer 处理 balance
  return newState;
}
```

**技术难点与挑战**：
- 固定时间步与可变帧率渲染的插值（alpha blending）：逻辑更新在 10Hz，渲染在 60Hz，需要在两次逻辑帧之间做插值以保证进度条平滑
- 页面可见性 API 与游戏循环的协调：`visibilitychange` → pause → 记录时间 → resume → 由 `loadState` 的离线计算处理，而不是让累加器追赶大量帧
- 引擎状态与 Redux 状态的边界：引擎负责"何时更新"，Redux 负责"更新成什么"，通过 batch dispatch 减少 React 重渲染次数
- 删除现有 uuid hack 和所有 setInterval/clearInterval 代码，需要确保所有组件正确迁移

**预期收益**：
- 从最多 20 个 setInterval 减少到 1 个 rAF 循环，CPU 占用大幅下降（尤其在 10 个业务全部解锁后）
- 进度条和倒计时完全同步，不再有视觉错位
- 离线/在线收益计算逻辑统一到 BusinessSystem 中，消除两套代码的不一致风险
- 统一的暂停/恢复架构，为未来的"设置面板暂停游戏"、"动画加速"等功能打下基础
- 事件总线架构使得新功能（音效、成就、统计）可以通过订阅事件实现，无需侵入核心逻辑
- 为可扩展模块 #7（音效）、#3（统计）、#1（成就）提供统一的事件接入点

---

### 建议 2：多存档槽位 + 状态版本迁移 + 序列化框架

**背景与问题**：当前项目只有一个自动存档槽位（localStorage key: `AdventureCapitalist_State`），存在以下工程缺陷：
- 玩家无法手动存档/读档，试错成本高
- 游戏更新后如果数据结构变化，旧存档会导致崩溃（`processBackgroundCalculating` 假设所有字段都存在）
- 存档中存储了大量可计算的派生数据（如 price、profit 可以从 quantityPurchased 推算），造成数据冗余
- localStorage 容量限制（5-10MB）下无法存储大型事件日志
- 没有存档损坏检测和恢复机制
- `processBackgroundCalculating` 直接修改反序列化的对象，如果 localStorage 数据被篡改可能导致异常

**重构方案**：设计一个完整的存档管理框架，包含：版本号机制、多槽位存储、Schema 迁移管线、校验和校验、序列化/反序列化分离。

**核心架构设计**：

```
┌─────────────────────────────────────────────────────────────┐
│                   SaveManager (Singleton)                    │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Slot 0      │  │ Migration    │  │ Checksum (CRC32) │    │
│  │ (Auto Save) │  │ Pipeline     │  │ Integrity Check  │    │
│  ├─────────────┤  │ v1→v2→v3...  │  └──────────────────┘    │
│  │ Slot 1-4    │  └──────────────┘                            │
│  │ (Manual)    │                                              │
│  ├─────────────┤  ┌──────────────┐  ┌──────────────────┐    │
│  │ Slot 5      │  │ Serializer   │  │ Compression      │    │
│  │ (Backup)    │  │ (toPlain)    │  │ (LZ-string opt)  │    │
│  └─────────────┘  └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**实施步骤**：

1. **定义版本化的状态 Schema** `src/save/schemaVersion.js`：

```javascript
export const CURRENT_SCHEMA_VERSION = 3;

// 每个版本定义新增/变更/废弃的字段
export const schemaMigrations = [
  {
    version: 1,
    description: '初始版本',
    up: (data) => data,
    down: (data) => data
  },
  {
    version: 2,
    description: '添加统计数据和成就追踪',
    up: (data) => ({
      ...data,
      stats: { totalEarned: data.balance?.amount || 0, totalClicks: 0, businessRuns: {} },
      achievements: { unlocked: [], lastChecked: Date.now() }
    }),
    down: (data) => {
      const { stats, achievements, ...rest } = data;
      return rest;
    }
  },
  {
    version: 3,
    description: '业务数据重构：从扁平 price/profit 改为基础值+数量推算',
    up: (data) => {
      const migratedBusinesses = {};
      for (const [id, b] of Object.entries(data.businesses || {})) {
        migratedBusinesses[id] = {
          id: b.id,
          quantityPurchased: b.quantityPurchased || 0,
          hasManager: b.hasManager || false,
          lastRun: b.lastRun || null,
          // v3 不再存储 price/profit，运行时由 quantityPurchased 计算
        };
      }
      return { ...data, businesses: migratedBusinesses, schemaVersion: 3 };
    },
    down: (data) => {
      // 降级时重新计算 price/profit
      const downgradedBusinesses = {};
      for (const [id, b] of Object.entries(data.businesses || {})) {
        const base = initialBusinesses[id];
        downgradedBusinesses[id] = {
          ...b,
          price: round(base.price * Math.pow(1.1, b.quantityPurchased - (base.quantityPurchased || 0))),
          profit: calculateProfit(base, b.quantityPurchased)
        };
      }
      return { ...data, businesses: downgradedBusinesses, schemaVersion: 2 };
    }
  }
];
```

2. **创建迁移管线** `src/save/migrationPipeline.js`：

```javascript
import { schemaMigrations, CURRENT_SCHEMA_VERSION } from './schemaVersion';

export function migrateSaveData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return createNewSave();
  }

  let data = rawData;
  let fromVersion = data.schemaVersion || 1;

  if (fromVersion === CURRENT_SCHEMA_VERSION) return data;
  if (fromVersion > CURRENT_SCHEMA_VERSION) {
    // 存档版本比游戏版本新（可能是降级运行），尝试降级或警告
    console.warn(`Save version ${fromVersion} is newer than game version ${CURRENT_SCHEMA_VERSION}`);
    // 执行降级迁移
    for (let v = fromVersion; v > CURRENT_SCHEMA_VERSION; v--) {
      const migration = schemaMigrations.find(m => m.version === v);
      if (migration) data = migration.down(data);
    }
    return data;
  }

  // 顺序执行升级迁移
  for (let v = fromVersion; v < CURRENT_SCHEMA_VERSION; v++) {
    const migration = schemaMigrations.find(m => m.version === v + 1);
    if (!migration) throw new Error(`Missing migration to version ${v + 1}`);
    try {
      data = migration.up(data);
    } catch (err) {
      console.error(`Migration v${v}→v${v + 1} failed:`, err);
      // 迁移失败时备份损坏存档并创建新存档
      backupCorruptedSave(rawData, v);
      return createNewSave();
    }
  }

  data.schemaVersion = CURRENT_SCHEMA_VERSION;
  return data;
}

function createNewSave() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    balance: { amount: 0 },
    businesses: JSON.parse(JSON.stringify(initialBusinesses)),
    managers: JSON.parse(JSON.stringify(initialManagers)),
    awayEarning: { amount: 0, awayDuration: '' },
    stats: { totalEarned: 0, totalClicks: 0, businessRuns: {} },
    achievements: { unlocked: [] },
    createdAt: Date.now(),
    lastPlayedAt: Date.now()
  };
}

function backupCorruptedSave(data, failedVersion) {
  try {
    localStorage.setItem(
      `AdventureCapitalist_CorruptBackup_${Date.now()}`,
      JSON.stringify({ data, failedVersion, timestamp: Date.now() })
    );
  } catch (e) { /* quota exceeded, ignore */ }
}
```

3. **创建校验和工具** `src/save/checksum.js`：

```javascript
// CRC32 实现，用于存档完整性校验
const crcTable = (() => {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(str) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function verifyChecksum(payload) {
  const { checksum, data } = payload;
  return crc32(JSON.stringify(data)) === checksum;
}

export function wrapWithChecksum(data) {
  const serialized = JSON.stringify(data);
  return {
    version: data.schemaVersion,
    timestamp: Date.now(),
    checksum: crc32(serialized),
    data: serialized
  };
}
```

4. **创建 SaveManager** `src/save/SaveManager.js`：

```javascript
import { migrateSaveData } from './migrationPipeline';
import { crc32, verifyChecksum, wrapWithChecksum } from './checksum';

const STORAGE_PREFIX = 'AdventureCapitalist_Slot_';
const AUTO_SAVE_SLOT = 0;
const MANUAL_SLOTS = [1, 2, 3, 4];
const MAX_BACKUPS = 3;

export class SaveManager {
  constructor() {
    this.currentSlot = AUTO_SAVE_SLOT;
  }

  loadSlot(slot = this.currentSlot) {
    const key = `${STORAGE_PREFIX}${slot}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const wrapped = JSON.parse(raw);
      // 旧格式（没有 checksum 包装）的兼容处理
      if (!wrapped.checksum) {
        return migrateSaveData(wrapped);
      }
      if (!verifyChecksum(wrapped)) {
        console.error(`Checksum mismatch for slot ${slot}, save may be corrupted`);
        return this._attemptRecovery(slot, wrapped);
      }
      const data = JSON.parse(wrapped.data);
      return migrateSaveData(data);
    } catch (err) {
      console.error(`Failed to load slot ${slot}:`, err);
      return null;
    }
  }

  saveSlot(slot, data) {
    const key = `${STORAGE_PREFIX}${slot}`;
    const wrapped = wrapWithChecksum({ ...data, lastPlayedAt: Date.now() });
    try {
      localStorage.setItem(key, JSON.stringify(wrapped));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        this._evictOldBackups();
        try {
          localStorage.setItem(key, JSON.stringify(wrapped));
          return true;
        } catch (e2) { return false; }
      }
      return false;
    }
  }

  saveManual(slotName) {
    const currentData = this.loadSlot(this.currentSlot);
    if (!currentData) return false;
    const slot = MANUAL_SLOTS[slotName] || this._findEmptySlot();
    if (slot === -1) return false;
    return this.saveSlot(slot, { ...currentData, manualSaveName: slotName, savedAt: Date.now() });
  }

  listSaves() {
    const saves = [];
    for (let i = 0; i <= 4; i++) {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${i}`);
      if (raw) {
        try {
          const wrapped = JSON.parse(raw);
          const data = wrapped.checksum ? JSON.parse(wrapped.data) : wrapped;
          saves.push({
            slot: i,
            type: i === AUTO_SAVE_SLOT ? 'auto' : 'manual',
            timestamp: wrapped.timestamp || data.lastPlayedAt,
            balance: data.balance?.amount,
            name: data.manualSaveName || (i === 0 ? 'Auto Save' : `Slot ${i}`)
          });
        } catch (e) { /* skip corrupted */ }
      }
    }
    return saves;
  }

  deleteSlot(slot) {
    if (slot === AUTO_SAVE_SLOT) return false; // 不能删除自动存档
    localStorage.removeItem(`${STORAGE_PREFIX}${slot}`);
    return true;
  }

  exportSave(slot = this.currentSlot) {
    const data = this.loadSlot(slot);
    if (!data) return null;
    return btoa(unescape(encodeURIComponent(JSON.stringify(wrapWithChecksum(data)))));
  }

  importSave(base64String) {
    try {
      const json = decodeURIComponent(escape(atob(base64String)));
      const wrapped = JSON.parse(json);
      if (!verifyChecksum(wrapped)) throw new Error('Invalid checksum');
      const data = migrateSaveData(JSON.parse(wrapped.data));
      return this.saveSlot(this.currentSlot, data);
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  _attemptRecovery(slot, wrapped) {
    // 尝试从备份恢复
    for (let i = 1; i <= MAX_BACKUPS; i++) {
      const backup = localStorage.getItem(`${STORAGE_PREFIX}${slot}_backup_${i}`);
      if (backup) {
        try {
          const backupWrapped = JSON.parse(backup);
          if (verifyChecksum(backupWrapped)) {
            console.log(`Recovered slot ${slot} from backup ${i}`);
            return migrateSaveData(JSON.parse(backupWrapped.data));
          }
        } catch (e) { continue; }
      }
    }
    return null;
  }

  _evictOldBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && key.includes('_backup_')) {
        backups.push({ key, time: localStorage.getItem(key)?.timestamp || 0 });
      }
    }
    backups.sort((a, b) => a.time - b.time);
    // 删除最旧的备份
    for (let i = 0; i < Math.min(2, backups.length); i++) {
      localStorage.removeItem(backups[i].key);
    }
  }

  _findEmptySlot() {
    for (const slot of MANUAL_SLOTS) {
      if (!localStorage.getItem(`${STORAGE_PREFIX}${slot}`)) return slot;
    }
    return -1;
  }
}

export const saveManager = new SaveManager();
```

5. **改造 localStorage.js 为使用 SaveManager**：

```javascript
// src/localStorage.js 改造
import { saveManager } from './save/SaveManager';
import { processBackgroundCalculating } from './utils/game';

export const loadState = () => {
  try {
    const state = saveManager.loadSlot(0);
    if (!state) return undefined;
    return processBackgroundCalculating(state);
  } catch (error) {
    console.warn('Failed to load state:', error);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    saveManager.saveSlot(0, state);
  } catch (error) {
    console.warn('Failed to save state:', error);
  }
};
```

6. **创建存档管理 UI** `src/components/SaveManager/SaveManager.jsx`：

```jsx
// 存档管理面板组件
import React, { useState } from 'react';
import { saveManager } from '../../save/SaveManager';

export function SaveManager({ onClose }) {
  const [saves, setSaves] = useState(() => saveManager.listSaves());
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  const refresh = () => setSaves(saveManager.listSaves());

  const handleExport = (slot) => {
    const data = saveManager.exportSave(slot);
    navigator.clipboard?.writeText(data);
    alert('Save data copied to clipboard!');
  };

  const handleImport = () => {
    if (saveManager.importSave(importText)) {
      alert('Import successful! Reloading...');
      window.location.reload();
    } else {
      alert('Import failed. Invalid save data.');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <h2>Save Management</h2>
        <div className="save-list">
          {saves.map(save => (
            <div key={save.slot} className="save-item">
              <div>
                <strong>{save.name}</strong>
                <div>{save.balance?.toLocaleString() ?? '$0'}</div>
                <small>{new Date(save.timestamp).toLocaleString()}</small>
              </div>
              <div className="save-actions">
                {save.slot !== 0 && (
                  <button onClick={() => { saveManager.deleteSlot(save.slot); refresh(); }}>
                    Delete
                  </button>
                )}
                <button onClick={() => handleExport(save.slot)}>Export</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => saveManager.saveManual('Manual Save')}>Save Current Game</button>
        <button onClick={() => setShowImport(!showImport)}>Import Save</button>
        {showImport && (
          <div>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Paste save data here..."
              rows={4}
            />
            <button onClick={handleImport}>Confirm Import</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**技术难点与挑战**：
- Schema 迁移的测试：每个迁移函数都需要有对应的测试用例，验证 v1 存档能正确迁移到 v3（包括跨多版本链式迁移）
- 降级迁移的正确性：当玩家用旧版本游戏打开新版本存档时，downgrade 函数必须能还原出旧版本可识别的数据结构
- 校验和碰撞概率：CRC32 不是加密安全的，但用于误损坏检测足够（恶意篡改不是威胁模型）
- localStorage 配额管理：需要处理 QuotaExceededError，实现备份淘汰策略
- 存档导出/导入的 Base64 编码在 Unicode 字符上的正确性（需要 `encodeURIComponent`/`decodeURIComponent` 包装）
- 序列化时需要剥离不可序列化的数据（如函数、undefined、Symbol）

**预期收益**：
- 游戏版本迭代不再破坏旧存档，玩家不会因为更新游戏而丢失进度
- 多存档槽位支持试错玩法（如天使转生系统前存档）
- 存档导入/导出支持玩家在设备间迁移存档
- 校验和机制能检测存档损坏并自动从备份恢复，降低"存档消失"类 bug 的影响
- 数据冗余减少（v3 schema 将 price/profit 变为运行时计算），存档体积缩小约 40%
- 为未来可能的云存档功能预留接口（SaveManager 的接口设计与存储介质无关）

---

### 建议 3：Redux 中间件管道 —— 事件溯源、操作审计与撤销/重做

**背景与问题**：当前 Redux 使用裸 `createStore`（[store.js](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/store.js)），没有任何中间件。这导致：
- 无法追踪状态变化历史，出现 bug 时无法回放操作序列
- 每次状态变化都直接同步写入 localStorage（高频写入，10ms 级）
- 没有异步 action 处理能力（目前 async 逻辑散落在组件 useEffect 中）
- 没有 action 日志，调试困难
- 无法实现"撤销购买"等需要历史回退的功能
- 业务逻辑（离线收益计算）在状态加载时执行，而不是通过 action 触发，绕过了 Redux 数据流

**重构方案**：构建一套完整的 Redux 增强中间件管道，包含：事件溯源日志、撤销/重做、节流持久化、异步 action 支持、开发工具集成。

**架构设计**：

```
Action Dispatch
      │
      ▼
┌──────────────┐
│  Logger MW   │──> console / DevTools
└──────┬───────┘
      │
      ▼
┌──────────────┐
│  Event Log   │──> 环形缓冲区（最近 200 个 action）
│  Middleware  │    支持撤销/重做/回放
└──────┬───────┘
      │
      ▼
┌──────────────┐
│  Thunk MW    │──> 支持 async actions
└──────┬───────┘
      │
      ▼
┌──────────────┐
│  Audit MW    │──> 关键操作（购买/雇佣）记录到审计日志
└──────┬───────┘
      │
      ▼
┌──────────────┐
│  Debounced   │──> 1.5s 防抖 + 过滤高频 action
│  Persist MW  │
└──────┬───────┘
      │
      ▼
   Reducer ──> State ──> React Re-render
```

**实施步骤**：

1. **创建事件日志中间件** `src/redux/middleware/eventLog.js`（支持撤销/重做）：

```javascript
const MAX_HISTORY = 200; // 保留最近 200 个 action
const NON_UNDOABLE = ['@@INIT', 'ENGINE_TICK', 'RENDER_PROGRESS', 'REDUX_STORAGE_SAVE'];

export function createEventLogMiddleware() {
  let past = [];    // 历史状态栈
  let future = [];  // 被撤销后的状态栈（用于重做）

  return store => next => action => {
    // 撤销
    if (action.type === 'UNDO') {
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      future = [store.getState(), ...future];
      past = past.slice(0, -1);
      // 直接替换状态（需要特殊 reducer 支持）
      store.dispatch({ type: 'REPLACE_STATE', payload: previous });
      return;
    }

    // 重做
    if (action.type === 'REDO') {
      if (future.length === 0) return;
      const next = future[0];
      past = [...past, store.getState()];
      future = future.slice(1);
      store.dispatch({ type: 'REPLACE_STATE', payload: next });
      return;
    }

    // 普通 action：记录前状态，执行，记录后状态
    const prevState = store.getState();
    const result = next(action);

    if (!NON_UNDOABLE.includes(action.type)) {
      past = [...past, prevState].slice(-MAX_HISTORY);
      future = []; // 新 action 清空重做栈
    }

    return result;
  };
}
```

2. **创建 REPLACE_STATE reducer 增强**：

```javascript
// src/redux/reducers/withReplace.js
export function withReplace(rootReducer) {
  return function(state, action) {
    if (action.type === 'REPLACE_STATE') {
      return action.payload;
    }
    return rootReducer(state, action);
  };
}
```

3. **创建节流持久化中间件** `src/redux/middleware/persist.js`：

```javascript
import { saveState } from '../../localStorage';

const PERSIST_DEBOUNCE = 1500;
// 定义哪些 action 需要触发保存（排除高频更新）
const PERSIST_BLACKLIST = new Set([
  '@@INIT', '@@redux/INIT',
  'ENGINE_TICK', 'RENDER_PROGRESS',
  'UNDO', 'REDO', 'REPLACE_STATE'
]);

export function createPersistMiddleware(serialize = state => state) {
  let saveTimer = null;
  let pendingSave = false;

  const flush = (state) => {
    saveTimer = null;
    try {
      saveState(serialize(state));
    } catch (e) {
      console.warn('Persist failed:', e);
    }
    pendingSave = false;
  };

  return store => next => action => {
    const result = next(action);

    if (!PERSIST_BLACKLIST.has(action.type)) {
      pendingSave = true;
      // 关键操作（购买/雇佣）立即保存，其他操作防抖
      const isCritical = action.type.startsWith('BUY_') ||
                         action.type === 'HIRE_MANAGER' ||
                         action.type === 'INCREASE_BALANCE';

      if (isCritical) {
        clearTimeout(saveTimer);
        flush(store.getState());
      } else if (!saveTimer) {
        saveTimer = setTimeout(() => flush(store.getState()), PERSIST_DEBOUNCE);
      }
    }

    return result;
  };
}

// 页面卸载时立即保存（同步）
export function createPersistFlush(store) {
  return () => {
    if (pendingSave) {
      saveState(store.getState());
    }
  };
}
```

4. **创建审计日志中间件** `src/redux/middleware/auditLog.js`：

```javascript
const AUDIT_EVENTS = new Set(['BUY_BUSINESS', 'HIRE_MANAGER']);
const MAX_AUDIT_LOG = 500;

export function createAuditMiddleware() {
  return store => next => action => {
    const result = next(action);
    if (AUDIT_EVENTS.has(action.type)) {
      const state = store.getState();
      const auditEntry = {
        timestamp: Date.now(),
        action: action.type,
        payload: action.payload,
        balanceAfter: state.balance.amount,
        // 记录快照摘要而不是完整状态
        summary: action.type === 'BUY_BUSINESS'
          ? `Bought ${action.payload.qty || 1}x ${action.payload.businessId}`
          : `Hired ${action.payload.manager?.name || 'manager'}`
      };

      // 通过自定义事件存入审计日志（可以持久化到 localStorage 独立 key）
      store.dispatch({
        type: 'AUDIT_LOG_APPEND',
        payload: auditEntry
      });
    }
    return result;
  };
}

// 审计日志 reducer
export function auditLogReducer(state = { entries: [] }, action) {
  if (action.type === 'AUDIT_LOG_APPEND') {
    const entries = [action.payload, ...state.entries].slice(0, MAX_AUDIT_LOG);
    return { entries };
  }
  if (action.type === 'AUDIT_LOG_CLEAR') {
    return { entries: [] };
  }
  return state;
}
```

5. **创建 Redux Thunk 支持**（处理异步 action）：

```javascript
// src/redux/middleware/thunk.js
export const thunk = store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action);
};
```

6. **创建离线收益 action**（替代 loadState 中的直接计算）：

```javascript
// src/redux/actions.js 新增
import { processBackgroundCalculating } from '../utils/game';

export const applyOfflineEarnings = () => (dispatch, getState) => {
  const state = getState();
  const processed = processBackgroundCalculating(state);

  if (processed.awayEarning.amount > 0) {
    dispatch({
      type: 'OFFLINE_EARNINGS_APPLIED',
      payload: processed.awayEarning
    });
    // 批量更新业务和余额
    for (const [id, business] of Object.entries(processed.businesses)) {
      dispatch({ type: 'SET_LAST_RUN', payload: { businessId: id } });
    }
    dispatch({ type: 'INCREASE_BALANCE', payload: { amount: processed.awayEarning.amount } });
  }
};
```

7. **组装增强 Store** `src/redux/configureStore.js`：

```javascript
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import { withReplace } from './reducers/withReplace';
import { auditLogReducer } from './middleware/auditLog';
import { createEventLogMiddleware } from './middleware/eventLog';
import { createPersistMiddleware, createPersistFlush } from './middleware/persist';
import { createAuditMiddleware } from './middleware/auditLog';
import { thunk } from './middleware/thunk';
import { loadState } from '../localStorage';

// 合并审计日志 reducer
const rootReducerWithAudit = (state, action) => {
  const rootResult = rootReducer(state, action);
  return {
    ...rootResult,
    auditLog: auditLogReducer(state?.auditLog, action)
  };
};

export function configureStore() {
  const preloadedState = loadState();

  const middlewares = [
    thunk,
    createAuditMiddleware(),
    createEventLogMiddleware(),
    createPersistMiddleware()
  ];

  // 开发环境集成 Redux DevTools
  const composeEnhancers =
    (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const store = createStore(
    withReplace(rootReducerWithAudit),
    preloadedState,
    composeEnhancers(applyMiddleware(...middlewares))
  );

  // 页面卸载时刷新保存
  const flushPersist = createPersistFlush(store);
  window.addEventListener('beforeunload', flushPersist);

  // 开发环境暴露 store 到 window 方便调试
  if (process.env.NODE_ENV === 'development') {
    window.__store = store;
  }

  return store;
}
```

8. **修改 store.js 入口**：

```javascript
// src/redux/store.js 简化为
import { configureStore } from './configureStore';
const store = configureStore();
export default store;
```

9. **在 App.js 中添加撤销/重做快捷键支持**：

```javascript
// src/App.js 添加
useEffect(() => {
  const handler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        store.dispatch({ type: 'REDO' });
      } else {
        store.dispatch({ type: 'UNDO' });
      }
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

**技术难点与挑战**：
- 撤销/重做的状态一致性：Redux 的 combineReducers 模式下，直接替换整个 state 需要 withReplace 高阶 reducer 包装，确保所有子 reducer 都能正确处理 REPLACE_STATE
- 事件日志内存管理：环形缓冲区大小需要平衡内存使用和撤销深度，200 个状态快照可能占用大量内存（需要确保状态对象在被推入历史栈时是深拷贝还是浅引用——浅引用内存效率高但可能被后续 mutation 破坏，因此必须先修复建议 4.1 中的状态突变问题）
- 持久化中间件与 React 18 StrictMode 的双调用问题：StrictMode 下 reducer 会执行两次，需要确保防抖保存逻辑不会因此触发两次
- 中间件顺序至关重要：thunk 必须在最前面，auditLog 必须在 eventLog 前面（这样审计日志也会被记录在事件历史中），persist 必须在最后面（确保保存的是最终状态）
- 离线收益从同步加载改为异步 action 后，需要处理"首次渲染时 awayEarning 为 0，action dispatch 后才更新"的时序问题（EarningModal 的显示逻辑需要调整）
- Redux DevTools 集成在生产构建中应当被 tree-shake 掉，不能影响生产包体积

**预期收益**：
- 开发调试效率大幅提升：Redux DevTools 可查看每一步 action 和状态差异，支持"时间旅行"调试
- 撤销/重做功能对玩家友好（误买高价业务时可 Ctrl+Z 回退）
- 审计日志记录所有关键交易，便于排查"我的钱怎么没了"类问题
- 持久化从每次 state 变化同步写改为防抖+关键操作立即写，localStorage 写入次数减少 90%+
- Thunk 支持后，复杂异步逻辑（如离线收益、随机事件触发）可以从组件 useEffect 迁移到 action creator 中，组件更"干净"
- 事件日志架构为"操作回放"、"bug 复现"、"游戏录像"等高级功能奠定基础

---

## 附录：技术债务清单

以下是代码审查过程中发现的具体技术债务，建议按优先级处理：

| 优先级 | 文件 | 问题 | 建议 |
|--------|------|------|------|
| 🔴 高 | [game.js#L21-L35](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/utils/game.js#L21-L35) | 直接修改 state 对象属性 | 使用展开运算符不可变更新 |
| 🔴 高 | [actionTypes.js#L2](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/actionTypes.js#L2) | `DECREASSE_BALANCE` 拼写错误 | 修正为 `DECREASE_BALANCE` |
| 🟡 中 | [CountDown.js#L15-L23](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/CountDown/CountDown.js#L15-L23) | 10ms 间隔更新过于频繁 | 改为 50ms 或使用 requestAnimationFrame |
| 🟡 中 | [Progress.js#L15-L23](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723/xyj-723-7/adventure-capitalist-main/src/components/Progress/Progress.js#L15-L23) | setInterval 未指定间隔（约每 1ms） | 显式设置间隔为 50ms |
| 🟡 中 | [Business.js#L5](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Business/Business.js#L5) | 引入 uuid 库但可以使用原生 API | 使用 `crypto.randomUUID()` 替代，移除 uuid 依赖 |
| 🟡 中 | [store.js#L7-L9](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/redux/store.js#L7-L9) | 每次 state 变化都同步写入 localStorage | 添加防抖，1-2 秒延迟保存 |
| 🟢 低 | [Modal.js#L11](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/components/Modal/Modal.js#L11) | "Wecome" 拼写错误 | 修正为 "Welcome" |
| 🟢 低 | [businesses.js#L58](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723/xyj-723-7/adventure-capitalist-main/src/redux/reducers/businesses.js#L58) | 缩进不一致（2 空格 vs 4 空格） | 统一为 2 空格 |
| 🟢 低 | [managers.js#L51](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/data/managers.js#L51) | businessId `'Convenience_store'` 与数据 key `'convenience_store'` 大小写不一致 | 统一为小写 |
| 🟢 低 | [App.js#L5](file:///Users/tog/Desktop/code/gsb/gsb-723/xyj-723-7/adventure-capitalist-main/src/App.js#L5) | 导入了 Modal 组件但只在首次余额为 0 时显示 | 考虑更友好的教程引导 |
