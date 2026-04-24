# Poker Advisor Pro — 边池自动分离设计文档

**日期**：2026-04-25
**目标用户**：正在打多人 All-In 牌局的玩家
**核心痛点**：多人 All-In 时底池结构不透明，建议引擎用总底池计算赔率导致建议偏差
**方案**：实时边池分离 + 色块可视化 + 建议引擎使用实际可赢金额

---

## 一、数据模型

### 新增状态

在主组件中，将原来的 `totalPot`（单一数值）扩展为 `pots` 数组：

```javascript
// 替代 totalPot 的结构化底池
const [pots, setPots] = useState([]);
// pots 格式：
// [
//   { amount: 600, eligible: ['hero', 'opp-1', 'opp-2'], label: '主池' },
//   { amount: 600, eligible: ['opp-1', 'opp-2'],          label: '边池 1' },
// ]

// 兼容：totalPot 用 pots.reduce 派生，不再是独立状态
const totalPot = pots.reduce((sum, p) => sum + p.amount, 0);
```

### 玩家新增字段

```javascript
// 在 players 状态中每个对象新增：
{
  id, bet, totalContributed, active,
  isAllIn: false,       // 是否已 All-In
  allInAmount: null,    // All-In 时的 totalContributed（含本轮 bet）
}
```

---

## 二、边池计算函数 `computePots()`

纯函数，不依赖任何 React 状态，便于单元测试。

```javascript
// contributions: [{ id, amount, eligible: boolean }]
// - amount: 该玩家在本局累计投入总额（含本轮 bet）
// - eligible: true = 还在局中（未弃牌），false = 已弃牌（筹码留在池里但不能赢）
// 返回：[{ amount, eligible: string[], label }]
function computePots(contributions) {
  const result = [];
  let remaining = contributions.map(c => ({ ...c }));
  let potIndex = 0;

  while (remaining.some(c => c.amount > 0)) {
    const minAmount = Math.min(...remaining.filter(c => c.amount > 0).map(c => c.amount));
    const potAmount = remaining.reduce((sum, c) => sum + Math.min(c.amount, minAmount), 0);
    const eligible = remaining.filter(c => c.amount >= minAmount && c.eligible).map(c => c.id);
    result.push({
      amount: potAmount,
      eligible,
      label: potIndex === 0 ? '主池' : `边池 ${potIndex}`,
    });
    remaining = remaining.map(c => ({ ...c, amount: Math.max(0, c.amount - minAmount) }));
    potIndex++;
  }
  return result;
}
```

---

## 三、触发时机

任意玩家的下注导致 `totalContributed + bet >= stack` 时，将该玩家标记为 All-In，并立即重新计算 `pots`：

```javascript
// 在 handleHeroBetChange / handleOpponentBetChange 末尾调用
function recalcPots() {
  const contributions = [
    { id: 'hero', amount: heroTotalContributed + heroBet, eligible: true },
    ...players.map(p => ({
      id: p.id,
      amount: (p.totalContributed || 0) + p.bet,
      eligible: p.active,  // 弃牌者不 eligible
    })),
  ];
  setPots(computePots(contributions));
}
```

---

## 四、UI 设计

### 4.1 底池显示区（无 All-In 时）

与现在一致，显示 `总底池 $X`。

### 4.2 底池显示区（有 All-In 时）

替换为色块布局：

```
┌─────────────────────────────────────┐
│  [████████ 主池] [████████ 边池 1]  │  ← 比例色条（绿/紫）
│                                     │
│  主池 $600          边池 1 $600     │
│  Hero·Opp1·Opp2     Opp1·Opp2      │
│                                     │
│  总底池 $1200 = 主池 $600 + 边池 $600 │
└─────────────────────────────────────┘
```

- 绿色（`#10b981`）= 主池，紫色（`#6366f1`）= 边池 1，蓝色（`#3b82f6`）= 边池 2（如有）
- All-In 玩家行显示红色 `ALL-IN` 标签

### 4.3 结算界面

进入结算后，每个池子单独显示获胜者和金额：

```
┌──────────────────┐  ┌──────────────────┐
│ 主池 · Hero 获胜  │  │ 边池 · Opp1 获胜  │
│      +$600       │  │      +$600       │
│   顺子 > 两对    │  │   同花 > 顺子     │
└──────────────────┘  └──────────────────┘
```

---

## 五、建议引擎调整

### 当前问题

`potOdds` 用 `totalPot` 计算，但 Hero All-In 后无法赢到边池，导致赔率计算偏低（建议过于激进）。

### 修改方案

```javascript
// 新增：Hero 实际可赢底池
const heroEffectivePot = pots.length > 0
  ? pots.filter(p => p.eligible.includes('hero')).reduce((s, p) => s + p.amount, 0)
  : totalPot;  // 无边池时退化为原逻辑

// 替换 potOdds 计算
const potOdds = heroEffectivePot > 0
  ? (callAmount / (heroEffectivePot + callAmount)) * 100
  : 0;
```

无边池时（`pots` 全部包含 Hero），`heroEffectivePot === totalPot`，行为与现在完全一致。

---

## 六、测试要点

| 场景 | 验证内容 |
|------|---------|
| 无 All-In | `pots` 为空，显示总底池，建议逻辑不变 |
| Hero All-In，有对手超出 | 主池含 Hero，边池不含 Hero；`heroEffectivePot` 仅计主池 |
| 多人 All-In 不同金额 | 生成多个边池，每个 eligible 列表正确 |
| 弃牌者筹码 | 筹码计入最近一个池的金额，但不在任何 eligible 中 |
| 结算分配 | 每个池子独立展示获胜者和金额 |

---

## 七、文件改动预估

| 文件 | 改动类型 |
|------|---------|
| `PokerAdvisorPro.js` | 新增 `pots` 状态、`computePots`、`recalcPots`、底池 UI、建议引擎 `heroEffectivePot`、结算分配展示 |
| `PokerAdvisorPro.test.js` | 新增 `computePots` 单元测试（5+ 测试用例） |

---

## 八、不在本次范围内

- 对手画像（VPIP/PFR）
- 手牌历史
- 多人同时进入结算时的牌力比较自动化
- 运行保险（保险赔率计算）
