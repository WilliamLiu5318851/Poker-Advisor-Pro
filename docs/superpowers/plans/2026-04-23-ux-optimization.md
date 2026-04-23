# Poker Advisor Pro UX 优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 通过快速输入系统和建议面板重设计，改善新手在实际打牌时的使用体验。

**Architecture:** 所有改动集中在两个文件。`PokerData.js` 新增白话文案字段；`PokerAdvisorPro.js` 改造输入层（快捷按钮、对手行内操作）和建议层（交通灯 + 白话 + 折叠详情），以及 CardSelector 底部抽屉重构。

**Tech Stack:** React 18, Tailwind CSS (CDN), Babel standalone, Jest (unit tests for pure functions)

---

## 文件改动总览

| 文件 | 改动类型 | 影响范围 |
|------|---------|---------|
| `PokerData.js` | 新增字段 | `TEXTS.zh` 和 `TEXTS.en` 各增加 5 个 `_plain` key |
| `PokerAdvisorPro.js` | 新增函数 | `getAdviceStyle()` 纯函数（约5行） |
| `PokerAdvisorPro.js` | 新增状态 | `showDetails`, `cardSelectorSuit` |
| `PokerAdvisorPro.js` | 修改 `calculateEquity` | 在 `setResult()` 中新增 `adviceKey`、`plainReason` 字段 |
| `PokerAdvisorPro.js` | 替换 result 渲染块 | 第 1067–1127 行，建议卡完全重写 |
| `PokerAdvisorPro.js` | 新增英雄下注快捷按钮 | 第 1019 行前插入一排按钮 |
| `PokerAdvisorPro.js` | 重构对手行 | 第 1026–1044 行 |
| `PokerAdvisorPro.js` | 重构 `CardSelector` 组件 | 第 105–137 行，改为底部抽屉 |
| `PokerAdvisorPro.test.js` | 新增测试 | `getAdviceStyle` 的单元测试 |

---

## Task 1: 在 PokerData.js 中添加白话理由文案

**Files:**
- Modify: `PokerData.js`（`TEXTS.zh` 对象，约第 270–345 行）

- [ ] **Step 1: 在 TEXTS.zh 的 reason 字段后面添加 _plain 版本**

在 `PokerData.js` 的 `TEXTS.zh` 对象中，找到 `reason_odds: '赔率合适/过牌控池',` 这一行，在 `opponents_short: '人'` 之后添加：

```javascript
    // 白话理由 (新手友好版)
    reason_spr_low_plain: '你已经投入了太多筹码，弃牌比继续打损失更大',
    reason_value_plain: '你的牌很强，趁对手还会跟注时多赚一些',
    reason_bluff_semi_plain: '你有机会击中更强的牌，主动进攻可以多一种赢钱方式',
    reason_bluff_pure_plain: '对手可能也没什么好牌，现在加注有机会让他们直接弃牌',
    reason_odds_plain: '跟注在数学上是合算的，或者先看看情况再说',
```

- [ ] **Step 2: 在 TEXTS.en 对象中同样添加英文白话版**

在 `TEXTS.en` 对象的 `opponents_short` 字段之后添加：

```javascript
    // Plain reasons (beginner-friendly)
    reason_spr_low_plain: 'You\'ve put too many chips in — folding now costs more than continuing',
    reason_value_plain: 'Your hand is strong. Bet now while opponents will still call',
    reason_bluff_semi_plain: 'You can hit a stronger hand. Betting gives you two ways to win',
    reason_bluff_pure_plain: 'Opponent may be weak. A raise here might take the pot without a showdown',
    reason_odds_plain: 'Pot odds make calling profitable, or check and wait for more information',
```

- [ ] **Step 3: 手动验证**

打开 `index.html`，在浏览器控制台运行：
```javascript
console.log(window.PokerData.TEXTS.zh.reason_value_plain);
// 期望输出: '你的牌很强，趁对手还会跟注时多赚一些'
```

---

## Task 2: 添加 `getAdviceStyle` 纯函数并编写单元测试

**Files:**
- Modify: `PokerAdvisorPro.js`（在 `// --- 主程序 ---` 注释前，约第 536 行）
- Modify: `PokerAdvisorPro.test.js`（文件末尾新增 describe block）

- [ ] **Step 1: 在 PokerAdvisorPro.js 中定义函数**

在第 536 行 `// --- 主程序 ---` 注释前插入：

```javascript
// 根据建议键返回对应的 Tailwind 颜色样式
const getAdviceStyle = (adviceKey) => {
  if (adviceKey === 'advice_fold')
    return { bg: 'bg-red-950', border: 'border-red-700', text: 'text-red-300', bar: 'bg-red-500' };
  if (['advice_raise', 'advice_allin', 'advice_raise_bluff', 'advice_allin_bluff'].includes(adviceKey))
    return { bg: 'bg-emerald-950', border: 'border-emerald-700', text: 'text-emerald-300', bar: 'bg-emerald-500' };
  return { bg: 'bg-amber-950', border: 'border-amber-700', text: 'text-amber-300', bar: 'bg-amber-500' };
};
```

- [ ] **Step 2: 在测试文件末尾添加对 getAdviceStyle 的测试**

在 `PokerAdvisorPro.test.js` 文件末尾（最后一个 `});` 之后）追加：

```javascript
// 复制函数到测试文件（遵循本项目的测试约定）
const getAdviceStyle = (adviceKey) => {
  if (adviceKey === 'advice_fold')
    return { bg: 'bg-red-950', border: 'border-red-700', text: 'text-red-300', bar: 'bg-red-500' };
  if (['advice_raise', 'advice_allin', 'advice_raise_bluff', 'advice_allin_bluff'].includes(adviceKey))
    return { bg: 'bg-emerald-950', border: 'border-emerald-700', text: 'text-emerald-300', bar: 'bg-emerald-500' };
  return { bg: 'bg-amber-950', border: 'border-amber-700', text: 'text-amber-300', bar: 'bg-amber-500' };
};

describe('getAdviceStyle', () => {
  test('fold returns red style', () => {
    const s = getAdviceStyle('advice_fold');
    expect(s.bg).toBe('bg-red-950');
    expect(s.bar).toBe('bg-red-500');
  });

  test('raise returns green style', () => {
    const s = getAdviceStyle('advice_raise');
    expect(s.bg).toBe('bg-emerald-950');
    expect(s.bar).toBe('bg-emerald-500');
  });

  test('allin returns green style', () => {
    expect(getAdviceStyle('advice_allin').bg).toBe('bg-emerald-950');
  });

  test('raise_bluff returns green style', () => {
    expect(getAdviceStyle('advice_raise_bluff').bg).toBe('bg-emerald-950');
  });

  test('call returns amber style', () => {
    const s = getAdviceStyle('advice_call');
    expect(s.bg).toBe('bg-amber-950');
    expect(s.bar).toBe('bg-amber-500');
  });

  test('check_call returns amber style', () => {
    expect(getAdviceStyle('advice_check_call').bg).toBe('bg-amber-950');
  });

  test('unknown key returns amber style as default', () => {
    expect(getAdviceStyle('advice_unknown').bg).toBe('bg-amber-950');
  });
});
```

- [ ] **Step 3: 运行测试，确认通过**

```bash
npm test
```

期望输出：
```
PASS PokerAdvisorPro.test.js
  getAdviceStyle
    ✓ fold returns red style
    ✓ raise returns green style
    ✓ allin returns green style
    ✓ raise_bluff returns green style
    ✓ call returns amber style
    ✓ check_call returns amber style
    ✓ unknown key returns amber style as default
```

- [ ] **Step 4: 提交**

```bash
git add PokerAdvisorPro.js PokerAdvisorPro.test.js
git commit -m "feat: add getAdviceStyle pure function with unit tests"
```

---

## Task 3: 在 `calculateEquity` 中存储 adviceKey 和白话理由

**Files:**
- Modify: `PokerAdvisorPro.js`（`setResult({...})` 调用，约第 832–843 行）

- [ ] **Step 1: 修改 setResult 调用，新增 adviceKey 和 plainReason 字段**

找到 `setResult({` 调用（约第 832 行），将其替换为：

```javascript
      setResult({
        equity: equity.toFixed(1),
        adviceKey,
        advice: t[adviceKey] || "Advice N/A",
        plainReason: t[reasonKey + '_plain'] || t[reasonKey] || '',
        reason: finalReason,
        handTypeLabel: analysisData?.label,
        textureLabel: textureStrategy?.name,
        textureType: textureRes.type,
        drawStats,
        betSizes,
        isBluff: adviceKey.includes('bluff')
      });
```

- [ ] **Step 2: 手动验证**

在浏览器中选好两张手牌，点击计算，打开控制台，添加 `console.log(result)` 临时调试，确认 result 对象包含 `adviceKey` 和 `plainReason` 字段。（验证后删除 console.log）

- [ ] **Step 3: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: expose adviceKey and plainReason in result state"
```

---

## Task 4: 新增 `showDetails` 状态变量

**Files:**
- Modify: `PokerAdvisorPro.js`（state 声明区，约第 567 行）

- [ ] **Step 1: 在现有 state 声明后新增两个状态**

找到 `const [equityTrendData, setEquityTrendData] = useState(null);` 这一行（约第 567 行），在其后插入：

```javascript
  const [showDetails, setShowDetails] = useState(false);
  const [cardSelectorSuit, setCardSelectorSuit] = useState(null);
```

- [ ] **Step 2: 在 calculateEquity 开头重置 showDetails**

找到 `setEquityTrendData(null);` 这一行（约第 740 行），在其后添加：

```javascript
    setShowDetails(false);
```

- [ ] **Step 3: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: add showDetails and cardSelectorSuit state"
```

---

## Task 5: 重写建议面板（交通灯 + 白话 + 胜率进度条 + 推荐按钮高亮 + 折叠详情）

**Files:**
- Modify: `PokerAdvisorPro.js`（result 渲染块，第 1067–1127 行）

- [ ] **Step 1: 替换整个 result 渲染块**

找到：
```jsx
         {result && !settlementMode && (
          <div className={`border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${result.isBluff ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-900 border-slate-700'}`}>
```
到对应的 `)}` 结束（约第 1127 行），将整个块替换为：

```jsx
         {result && !settlementMode && (() => {
           const style = getAdviceStyle(result.adviceKey);
           return (
             <div className={`border-2 rounded-xl overflow-hidden ${style.border} ${style.bg}`}>
               {/* 交通灯决策头 */}
               <div className="p-4 text-center border-b border-slate-800/50">
                 <h2 className={`text-2xl font-bold ${style.text}`}>{result.advice}</h2>
                 <p className="text-sm mt-1 text-slate-300 leading-relaxed">{result.plainReason}</p>
               </div>

               {/* 胜率进度条 */}
               <div className="px-4 pt-3 pb-2">
                 <div className="flex justify-between text-xs text-slate-500 mb-1">
                   <span>{t.equity}</span>
                   <span className="font-mono font-bold text-white">{result.equity}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2.5">
                   <div className={`h-2.5 rounded-full transition-all duration-500 ${style.bar}`} style={{ width: `${Math.min(result.equity, 100)}%` }} />
                 </div>
               </div>

               {/* 标签行 */}
               <div className="px-4 pb-3 flex flex-wrap gap-1">
                 {result.handTypeLabel && (
                   <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-blue-200 border border-blue-500/30 flex items-center gap-1">
                     <Lightbulb className="w-3 h-3"/> {result.handTypeLabel}
                   </span>
                 )}
                 {result.textureLabel && (
                   <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${result.textureType==='wet' ? 'bg-amber-900/30 text-amber-200 border-amber-600/50' : 'bg-slate-800 text-indigo-200 border-indigo-500/30'}`}>
                     <Grid className="w-3 h-3"/> {result.textureLabel} {result.textureType==='wet'?'(Wet)':'(Dry)'}
                   </span>
                 )}
                 {heroPosition && (
                   <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-600 flex items-center gap-1">
                     <MapPin className="w-3 h-3"/> {heroPosition}
                   </span>
                 )}
               </div>

               {/* 下注建议（推荐项高亮） */}
               {result.betSizes && (
                 <div className="px-4 pb-4">
                   <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><MousePointerClick className="w-3 h-3"/> {t.betSizing}</div>
                   <div className="grid grid-cols-3 gap-2">
                     <button onClick={() => setHeroBet(result.betSizes.smart)} className="flex flex-col items-center p-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition">
                       <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{t.bet_size_small}</div>
                       <div className="font-mono font-bold text-slate-300">{result.betSizes.smart}</div>
                     </button>
                     <button onClick={() => setHeroBet(result.betSizes.value)} className={`flex flex-col items-center p-2 rounded border-2 ${style.border} ${style.bg} hover:brightness-110 transition`}>
                       <div className={`text-[10px] mb-1 font-bold ${style.text}`}>★ {t.bet_size_med}</div>
                       <div className="font-mono font-bold text-white text-base">{result.betSizes.value}</div>
                     </button>
                     <button onClick={() => setHeroBet(result.betSizes.pot)} className="flex flex-col items-center p-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition">
                       <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">{t.bet_size_large}</div>
                       <div className="font-mono font-bold text-slate-300">{result.betSizes.pot}</div>
                     </button>
                   </div>
                 </div>
               )}

               {/* 折叠详情 */}
               <div className="border-t border-slate-800">
                 <button onClick={() => setShowDetails(d => !d)} className="w-full px-4 py-2.5 text-left flex justify-between items-center text-xs text-slate-500 hover:bg-slate-800/50 transition">
                   <span>📊 {showDetails ? (lang==='zh'?'收起详情':'Hide Details') : (lang==='zh'?'查看分析详情':'Show Analysis')}</span>
                   <span>{showDetails ? '▲' : '▼'}</span>
                 </button>
                 {showDetails && (
                   <div className="p-4 pt-0 space-y-3">
                     <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">{result.reason}</p>
                     {result.drawStats && (
                       <div className="bg-slate-800 p-2 rounded border border-slate-700 flex items-center gap-3">
                         <div className="bg-indigo-900/50 p-2 rounded text-indigo-300"><Calculator className="w-5 h-5"/></div>
                         <div>
                           <div className="text-sm font-bold text-indigo-200">{result.drawStats.label} ({result.drawStats.outs} Outs)</div>
                         </div>
                       </div>
                     )}
                     {equityTrendData && <EquityTrendChart data={equityTrendData} t={t} />}
                     {result.drawStats && <DrawProbabilityChart outs={result.drawStats.outs} street={street} t={t} />}
                   </div>
                 )}
               </div>
             </div>
           );
         })()}
```

- [ ] **Step 2: 手动验证**

在浏览器中：
1. 选好手牌和公牌，点击计算
2. 确认：建议卡有颜色（绿/黄/红）
3. 确认：白话理由显示（非 mono 字体）
4. 确认：胜率进度条显示且宽度正确
5. 如有下注建议，确认中间按钮有高亮样式
6. 点击"查看分析详情"，确认展开/收起正常

- [ ] **Step 3: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: redesign advice panel with traffic light, plain reason, equity bar, collapsible details"
```

---

## Task 6: 添加英雄下注快捷按钮

**Files:**
- Modify: `PokerAdvisorPro.js`（约第 1019 行，英雄下注输入框前）

- [ ] **Step 1: 在下注输入框前插入快捷按钮行**

找到以下这行：
```jsx
               <input type="number" value={heroBet===0?'':heroBet} onChange={e => handleHeroBetChange(e.target.value)} placeholder={t.bet_placeholder} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-right font-mono"/>
```

在这行**前面**插入：

```jsx
               {totalPot > 0 && (
                 <div className="flex gap-1.5">
                   {[
                     { label: '1/3', value: Math.round(totalPot / 3) },
                     { label: '1/2', value: Math.round(totalPot / 2) },
                     { label: lang==='zh'?'底池':'Pot', value: totalPot },
                     { label: 'All-In', value: heroStack, isAllIn: true },
                   ].map(({ label, value, isAllIn }) => (
                     <button
                       key={label}
                       onClick={() => handleHeroBetChange(value)}
                       className={`flex-1 py-1.5 rounded text-xs font-mono font-bold transition ${isAllIn ? 'bg-red-900/60 text-red-300 border border-red-700 hover:bg-red-800/60' : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'}`}
                     >
                       <div className="text-[9px] opacity-70">{label}</div>
                       <div>{value}</div>
                     </button>
                   ))}
                 </div>
               )}
```

- [ ] **Step 2: 手动验证**

在浏览器中：
1. 设置底池（让对手下注一些金额）
2. 确认出现 4 个快捷按钮：1/3池、1/2池、底池、All-In
3. 点击每个按钮，确认下注输入框填入正确金额
4. 底池为 0 时，快捷按钮不显示

- [ ] **Step 3: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: add hero bet quick-select buttons (1/3, 1/2, pot, all-in)"
```

---

## Task 7: 重构对手行内操作（折叠/跟注快捷按钮）

**Files:**
- Modify: `PokerAdvisorPro.js`（对手列表渲染，约第 1026–1044 行）

- [ ] **Step 1: 替换对手列表中每一行的渲染**

找到：
```jsx
            {players.map((p, idx) => (
               <div key={p.id} className={`flex items-center gap-3 bg-slate-800 p-2 rounded-lg border ${p.active ? 'border-slate-700' : 'opacity-50 border-transparent'}`}>
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">{idx+1}</div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                     <button onClick={() => { const n = [...players]; n[idx].active = !n[idx].active; setPlayers(n); }} className={`text-xs rounded py-1 ${p.active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>{p.active ? t.active : t.folded}</button>
                     <div className="col-span-2 flex items-center bg-slate-900 rounded border border-slate-700">
                        <span className="text-xs text-slate-500 pl-2">$</span>
                        <input type="number" value={p.bet===0?'':p.bet} placeholder="0" onChange={e => handleOpponentBetChange(p.id, e.target.value)} className="w-full bg-transparent text-white text-sm py-1 font-mono focus:outline-none text-right pr-2" />
                        {maxBet > p.bet && p.active && (
                           <button onClick={() => handleOpponentBetChange(p.id, maxBet)} className="text-[10px] bg-blue-600 text-white px-2 h-full rounded-r-md hover:bg-blue-500">
                              Call
                           </button>
                        )}
                     </div>
                  </div>
                  <button onClick={() => setPlayers(players.filter(x => x.id !== p.id))} className="text-slate-600 hover:text-red-400 px-2">×</button>
               </div>
            ))}
```

替换为：

```jsx
            {players.map((p, idx) => (
               <div key={p.id} className={`bg-slate-800 p-2 rounded-lg border ${p.active ? 'border-slate-700' : 'opacity-40 border-transparent'}`}>
                 <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">{idx+1}</div>
                   {p.active ? (
                     <>
                       <button
                         onClick={() => { const n = [...players]; n[idx].active = false; setPlayers(n); }}
                         className="text-xs bg-slate-700 text-slate-400 border border-slate-600 rounded px-2 py-1 hover:bg-red-900/40 hover:text-red-300 hover:border-red-700 transition shrink-0"
                       >
                         {lang==='zh'?'弃牌':'Fold'}
                       </button>
                       {maxBet > 0 && (
                         <button
                           onClick={() => handleOpponentBetChange(p.id, maxBet)}
                           className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 rounded px-2 py-1 hover:bg-blue-800/50 transition shrink-0"
                         >
                           {lang==='zh'?`跟注 ${maxBet}`:`Call ${maxBet}`}
                         </button>
                       )}
                       <div className="flex-1 flex items-center bg-slate-900 rounded border border-slate-700">
                         <span className="text-xs text-slate-500 pl-2">$</span>
                         <input
                           type="number"
                           value={p.bet===0?'':p.bet}
                           placeholder={lang==='zh'?'加注额':'Raise'}
                           onChange={e => handleOpponentBetChange(p.id, e.target.value)}
                           className="w-full bg-transparent text-white text-sm py-1 font-mono focus:outline-none text-right pr-2"
                         />
                       </div>
                     </>
                   ) : (
                     <span className="flex-1 text-xs text-slate-500 italic">{t.folded}</span>
                   )}
                   <button onClick={() => setPlayers(players.filter(x => x.id !== p.id))} className="text-slate-600 hover:text-red-400 px-1 shrink-0">×</button>
                 </div>
               </div>
            ))}
```

- [ ] **Step 2: 手动验证**

在浏览器中：
1. 添加 2 个对手
2. 对手1：点"弃牌"按钮，确认该行变灰
3. 对手2：先让 Hero 下注 100，确认出现"跟注 100"按钮，点击确认填入 100
4. 确认删除按钮（×）正常工作

- [ ] **Step 3: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: refactor opponent rows with inline fold/call quick actions"
```

---

## Task 8: 重构 CardSelector 为底部抽屉（花色优先选择）

**Files:**
- Modify: `PokerAdvisorPro.js`（`CardSelector` 组件，第 105–137 行）

- [ ] **Step 1: 替换 CardSelector 组件**

找到：
```jsx
const CardSelector = ({ selectingFor, onClose, onCardSelect, unavailableCards, deckCount, t }) => {
  if (!selectingFor) return null;
  ...
};
```
到最后的 `};`（约第 137 行），将整个组件替换为：

```jsx
const CardSelector = ({ selectingFor, onClose, onCardSelect, unavailableCards, deckCount, t, selectedSuit, onSuitSelect, lang, SUITS, RANKS }) => {
  if (!selectingFor) return null;

  let title = t.selectCard;
  if (selectingFor.type === 'hero') title = `${t.selecting_hero} ${selectingFor.index + 1}/2`;
  if (selectingFor.type === 'board') title = selectingFor.index < 3 ? `${t.selecting_flop} ${selectingFor.index + 1}/3` : selectingFor.index === 3 ? t.selecting_turn : t.selecting_river;

  const SUIT_LABELS = { s: '♠', h: '♥', c: '♣', d: '♦' };
  const SUIT_COLORS = { s: 'text-slate-200', h: 'text-red-400', c: 'text-slate-200', d: 'text-red-400' };
  const SUIT_BG = { s: 'bg-slate-700', h: 'bg-red-900/40', c: 'bg-slate-700', d: 'bg-red-900/40' };

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* 半透明遮罩，不遮挡顶部 */}
      <div className="absolute inset-0 bg-black/50" />
      {/* 底部抽屉 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-slate-800 rounded-t-2xl border-t border-slate-600 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* 拖动条 */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>
        <div className="flex justify-between items-center px-4 pb-3">
          <span className="font-bold text-white text-sm">{title}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
        </div>

        {/* 花色选择器 */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-3">
          {SUITS.map(suit => (
            <button
              key={suit}
              onClick={() => onSuitSelect(selectedSuit === suit ? null : suit)}
              className={`py-3 rounded-lg text-2xl border-2 transition ${selectedSuit === suit ? `${SUIT_BG[suit]} border-blue-400` : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
            >
              <span className={SUIT_COLORS[suit]}>{SUIT_LABELS[suit]}</span>
            </button>
          ))}
        </div>

        {/* 点数选择器（花色选中后显示） */}
        {selectedSuit && (
          <div className="px-4 pb-6">
            <div className="grid grid-cols-7 gap-2">
              {[...RANKS].reverse().map(rank => {
                const takenCount = unavailableCards.filter(c => c.rank === rank && c.suit === selectedSuit).length;
                const isDisabled = takenCount >= deckCount;
                return (
                  <button
                    key={rank + selectedSuit}
                    disabled={isDisabled}
                    onClick={() => onCardSelect({ rank, suit: selectedSuit })}
                    className={`py-3 rounded-lg text-sm font-bold border transition ${isDisabled ? 'opacity-20 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600' : `${SUIT_BG[selectedSuit]} border-slate-600 hover:border-blue-400 ${SUIT_COLORS[selectedSuit]}`}`}
                  >
                    {rank}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: 更新 CardSelector 调用，传入新的 props**

找到文件底部的 `<CardSelector` 调用（约第 1130–1137 行），将其替换为：

```jsx
      <CardSelector 
        selectingFor={selectingFor}
        onClose={() => { setSelectingFor(null); setCardSelectorSuit(null); }}
        onCardSelect={(card) => { handleCardSelect(card); setCardSelectorSuit(null); }}
        unavailableCards={unavailableCards}
        deckCount={deckCount}
        t={t}
        selectedSuit={cardSelectorSuit}
        onSuitSelect={setCardSelectorSuit}
        lang={lang}
        SUITS={SUITS}
        RANKS={RANKS}
      />
```

- [ ] **Step 3: 手动验证**

在浏览器中：
1. 点击手牌位置，确认底部弹出抽屉（非全屏）
2. 确认上方游戏界面仍然可见
3. 点击一个花色，确认显示该花色的 13 个点数按钮
4. 点击一张牌，确认牌被选中，抽屉关闭，花色选择重置
5. 已使用的牌显示为灰色不可点

- [ ] **Step 4: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: redesign CardSelector as bottom sheet with suit-first selection"
```

---

## Task 9: 卡牌变化时自动触发计算

**Files:**
- Modify: `PokerAdvisorPro.js`（在 `getStrategyStyle` 函数前，约第 924 行前）

- [ ] **Step 1: 添加 useEffect 监听 heroHand 和 communityCards 变化**

找到 `const getStrategyStyle = () => {` 这一行，在其**前面**插入：

```javascript
  // 手牌或公牌变化时自动触发计算（防抖 800ms）
  useEffect(() => {
    if (heroHand[0] === null || heroHand[1] === null) return;
    const timer = setTimeout(() => { calculateEquity(); }, 800);
    return () => clearTimeout(timer);
  }, [heroHand, communityCards]);
```

- [ ] **Step 2: 手动验证**

在浏览器中：
1. 选择两张手牌，等待约 1 秒，确认自动触发计算（无需点按钮）
2. 点击添加翻牌，选完 3 张，等待约 1 秒，确认自动重新计算
3. 确认手动点击"计算胜率"按钮仍然可用

- [ ] **Step 3: 提交**

```bash
git add PokerAdvisorPro.js
git commit -m "feat: auto-calculate equity when hero hand or community cards change"
```

---

## 验收检查清单

在所有 Task 完成后，在浏览器中完整走一遍以下场景：

- [ ] **新手首次使用**：打开 App，点击手牌位，底部抽屉弹出 → 选花色 → 选点数 → 第 2 张牌自动弹出 → 自动计算 → 建议卡显示颜色和白话理由
- [ ] **下注快捷操作**：让对手下注 200，确认出现"跟注 200"快捷按钮；底池变为 200，英雄下注区显示 1/3 = 67，1/2 = 100 等
- [ ] **建议折叠/展开**：点"查看分析详情"展开，确认旧格式理由、图表都在里面
- [ ] **弃牌场景**：对手 1 弃牌，确认变灰，筹码追踪不受影响
- [ ] **结算场景**：走完所有街道，进入结算，确认无报错
- [ ] **语言切换**：切换到英文，确认所有新增文案都有英文版本
- [ ] **运行测试**：`npm test` 全部通过，包含新增的 `getAdviceStyle` 测试
