/**
 * Poker Advisor Pro - Data Layer
 * 这个文件包含了所有的静态数据、文本翻译和策略定义。
 * 它会挂载到 window.PokerData 对象上，供主逻辑文件使用。
 */

window.PokerData = {};

// --- 常量定义 (Constants) ---
window.PokerData.CONSTANTS = {
  SUITS: ['s', 'h', 'd', 'c'],
  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
  RANK_VALUES: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 },
  STREETS: ['Pre-flop', 'Flop', 'Turn', 'River']
};

// --- 手牌分析建议数据集 (Hand Analysis Definitions) ---
window.PokerData.HAND_ANALYSIS_DEFINITIONS = {
  zh: {
    // --- Pre-flop (翻牌前) ---
    pre_monster_pair: { label: "超级对子 (Premium Pair)", advice: "加注/4-Bet", reason: "AA/KK/QQ 是起手最强牌，尽可能在翻前造大底池。" },
    pre_strong_pair: { label: "强对子 (Strong Pair)", advice: "加注/跟注", reason: "JJ/TT/99 很有价值，但容易被翻出的高牌压制，小心行事。" },
    pre_small_pair: { label: "小对子 (Set Mining)", advice: "投机/埋伏", reason: "目标是中三条(Set)。如果赔率便宜就看牌，中不了就跑。" },
    pre_premium_high: { label: "核心高牌 (Premium High)", advice: "加注/价值", reason: "AK/AQ 是强力起手牌，击中顶对往往能赢大底池。" },
    pre_suited_connector: { label: "同花连张 (Suited Connector)", advice: "投机/跟注", reason: "具有极强的成顺/成花潜力，适合深筹码时入局博大牌。" },
    pre_suited_ace: { label: "同花A (Suited Ace)", advice: "半诈唬/阻断", reason: "有A做阻断牌，且能听坚果同花或顺子(Wheel)，非常灵活。" },
    pre_broadway: { label: "广播道 (Broadways)", advice: "谨慎进攻", reason: "两张大牌(如KJ/QJ)，容易形成顶对，但踢脚可能不够大。" },
    pre_trash: { label: "杂牌 (Trash)", advice: "弃牌 (Fold)", reason: "长期来看，玩这种牌是亏损的根源。省下筹码等待良机。" },

    // --- Post-flop (翻牌后) ---
    // Made Hands (成牌) - Priority 1
    made_straight_flush: { label: "同花顺 (Straight Flush)", advice: "慢打/诱敌", reason: "绝对坚果！现在的目标是怎么让对手把钱全输给你。" },
    made_quads: { label: "四条 (Quads)", advice: "慢打/诱敌", reason: "炸弹！极小概率输牌，允许对手中牌后再加注。" },
    made_full_house: { label: "满堂红 (Full House)", advice: "价值下注", reason: "极强的成牌。除非对手有更大的葫芦，否则你赢定了。" },
    made_flush: { label: "同花 (Flush)", advice: "价值下注", reason: "你已经完成了同花！注意牌面是否有公对(防葫芦)。" },
    made_straight: { label: "顺子 (Straight)", advice: "积极进攻", reason: "顺子是大牌。在同花面要小心，否则请以此收池。" },
    monster: { label: "三条 (Trips/Set)", advice: "强力价值", reason: "暗三条极其隐蔽，明三条也很强。造大底池！" },
    
    // Pairs (对子) - Priority 2
    top_pair: { label: "顶对 (Top Pair)", advice: "价值下注/控池", reason: "你有顶对，通常领先。但在湿润牌面要小心。" },
    middle_pair: { label: "中对 (Middle Pair)", advice: "抓诈唬/过牌", reason: "具有摊牌价值。适合过牌控池，或抓诈唬。" },
    bottom_pair: { label: "底对 (Bottom Pair)", advice: "过牌/谨慎摊牌", reason: "牌力较弱，很难承受大额注码。" },
    pocket_pair_below: { label: "小口袋对 (Underpair)", advice: "过牌/弃牌", reason: "你的对子小于公牌，极易被压制。" },
    
    // Draws (听牌) - Priority 3 (无效于河牌)
    flush_draw_nut: { label: "坚果同花听牌 (Nut Flush Draw)", advice: "半诈唬 (Semi-Bluff)", reason: "A花听牌！即使没中也有机会赢，适合激进打法。" },
    flush_draw: { label: "同花听牌 (Flush Draw)", advice: "跟注/半诈唬", reason: "还需要1张同花。赔率合适可跟注，或加注施压。" },
    straight_draw_oesd: { label: "两头顺听牌 (Open-Ended)", advice: "积极进攻", reason: "你有8张补牌成顺，这是很强的听牌。" },
    straight_draw_gutshot: { label: "卡顺听牌 (Gutshot)", advice: "谨慎跟注", reason: "只有4张补牌。除非极其便宜，否则别追。" },
    combo_draw: { label: "双重听牌 (Combo Draw)", advice: "全压/重注", reason: "同时听花和顺(或对子)，胜率极高，甚至领先成牌！" },
    overcards: { label: "两张高牌 (Overcards)", advice: "观望/飘打", reason: "暂无成牌。若对手示弱，可尝试诈唬。" },
    trash: { label: "空气牌 (Trash)", advice: "弃牌/纯诈唬", reason: "毫无胜率。除非你是为了偷底池，否则快跑。" }
  },
  en: {
    // --- Pre-flop ---
    pre_monster_pair: { label: "Premium Pair", advice: "Raise/4-Bet", reason: "AA/KK/QQ are the best starting hands. Build the pot early." },
    pre_strong_pair: { label: "Strong Pair", advice: "Raise/Call", reason: "JJ/TT/99 have value but are vulnerable to overcards." },
    pre_small_pair: { label: "Set Mining", advice: "Call Cheap", reason: "Looking to hit a Set (Three of a Kind). Fold if you miss." },
    pre_premium_high: { label: "Premium High", advice: "Raise for Value", reason: "AK/AQ are powerful. Top pair usually dominates." },
    pre_suited_connector: { label: "Suited Connector", advice: "Speculate", reason: "Great potential for Straights/Flushes. Good for deep stacks." },
    pre_suited_ace: { label: "Suited Ace", advice: "Semi-Bluff", reason: "Nut Flush potential + Blocker value. Versatile hand." },
    pre_broadway: { label: "Broadways", advice: "Proceed with Caution", reason: "Two high cards (KJ/QJ). Good top pair potential but watch the kicker." },
    pre_trash: { label: "Trash", advice: "Fold", reason: "Playing these hands loses money long-term. Wait for better spots." },

    // --- Post-flop ---
    made_straight_flush: { label: "Straight Flush", advice: "Slowplay", reason: "The absolute nuts! Try to extract maximum value." },
    made_quads: { label: "Quads", advice: "Slowplay", reason: "Four of a kind. Let them catch up, then punish." },
    made_full_house: { label: "Full House", advice: "Value Bet", reason: "Very strong hand. You are likely winning." },
    made_flush: { label: "Flush", advice: "Value Bet", reason: "You hit your flush! Watch out for paired boards (Full House)." },
    made_straight: { label: "Straight", advice: "Aggressive", reason: "Strong hand. Bet for value." },
    monster: { label: "Trips/Set", advice: "Strong Value", reason: "Three of a kind is a very strong holding. Build the pot." },

    top_pair: { label: "Top Pair", advice: "Value/Pot Control", reason: "Top pair is usually good, but be careful on wet boards." },
    middle_pair: { label: "Middle Pair", advice: "Bluff Catch/Check", reason: "Showdown value. Check to control pot size." },
    bottom_pair: { label: "Bottom Pair", advice: "Check/Fold", reason: "Weak showdown value. Cannot withstand heat." },
    pocket_pair_below: { label: "Underpair", advice: "Check/Fold", reason: "Your pocket pair is counterfeited by the board." },
    
    flush_draw_nut: { label: "Nut Flush Draw", advice: "Semi-Bluff", reason: "Ace-high flush draw! Huge equity, play aggressively." },
    flush_draw: { label: "Flush Draw", advice: "Call/Semi-Bluff", reason: "One card to flush. Call if odds are good." },
    straight_draw_oesd: { label: "Open-Ended Straight Draw", advice: "Aggressive", reason: "8 outs to a straight. Very strong draw." },
    straight_draw_gutshot: { label: "Gutshot Draw", advice: "Caution", reason: "Only 4 outs. Do not chase unless cheap." },
    combo_draw: { label: "Combo Draw", advice: "All-In/Heavy Bet", reason: "Flush + Straight draw. Massive equity!" },
    overcards: { label: "Overcards", advice: "Float/Check", reason: "No made hand yet. Good potential if you hit." },
    trash: { label: "Trash", advice: "Fold/Pure Bluff", reason: "No equity. Fold unless you are stealing." }
  }
};

// --- 多语言文本 (Localization) ---
window.PokerData.TEXTS = {
  zh: {
    appTitle: '德州扑克智囊 Pro',
    heroHand: '我的手牌',
    communityCards: '公共牌',
    calculate: '计算胜率 & 获取建议',
    calculating: '模拟计算中...',
    reset: '新的一局',
    settings: '设置',
    potInfo: '底池追踪',
    mainPot: '主底池 (前几轮)',
    currentBets: '本轮死钱',
    totalPot: '总底池',
    heroStack: '我的筹码',
    stackAfterBet: '下注后剩余',
    spr: 'SPR (筹码底池比)',
    strategy: '策略风格',
    conservative: '保守 (Tight)',
    aggressive: '激进 (Aggressive)',
    maniac: '诈唬/超激进 (Bluff)',
    players: '对手动作',
    active: '入局',
    folded: '弃牌',
    bet: '本轮下注',
    equity: '真实胜率',
    advice: '行动指南',
    nextStreet: '收池 & 下一轮',
    finishHand: '结算本局',
    betSizing: '推荐加注额 (点击应用)',
    potOdds: '底池赔率',
    requiredEquity: '所需胜率',
    advice_fold: '弃牌 (Fold)',
    advice_check_fold: '过牌/弃牌 (Check/Fold)',
    advice_check_call: '过牌/跟注 (Check/Call)',
    advice_call: '跟注 (Call)',
    advice_raise: '加注 (Raise)',
    advice_raise_bluff: '诈唬加注 (Bluff Raise)',
    advice_allin: '全压 (All-In)',
    advice_allin_bluff: '全压诈唬 (All-In Bluff)',
    reason_spr_low: 'SPR过低，您已套池(Committed)',
    reason_value: '强牌价值下注',
    reason_bluff_semi: '半诈唬：有听牌，打退对手',
    reason_bluff_pure: '纯诈唬：扮演强牌，利用弃牌率',
    reason_odds: '赔率合适，适合跟注听牌',
    street_pre: '翻牌前',
    street_flop: '翻牌圈',
    street_turn: '转牌圈',
    street_river: '河牌圈',
    add_player: '添加对手',
    bet_size_small: '小注 (1/3)',
    bet_size_med: '中注 (2/3)',
    bet_size_large: '满池 (1.0)',
    bet_size_over: '超池 (1.5x)',
    settle_win: '赢',
    settle_loss: '输',
    settle_split: '平',
    settle_title: '分池结算',
    settle_confirm: '确认结算结果',
    restart_hand: '开始下一手牌',
    btn_allin: 'ALL-IN',
    btn_fold: '弃牌 (Fold)',
    btn_call: '跟注 (Call)',
    btn_check: '过牌 (Check)',
    btn_call_allin: '全压 (Call/All-In)',
    rebuy: '补充筹码',
    deck_count: '牌副数 (Decks)',
    deck_info: '标准德扑为1副。多副牌会降低阻断效应。',
    game_settings: '游戏设置',
    selectCard: '选择一张牌',
    pot_segment: '池',
    contestants: '参与人数',
    net_change: '本局变动',
    segment_main: '主池 (Main)',
    segment_side: '边池 (Side)',
    buy_in_amount: '一手筹码 (Buy-in)',
    buy_in_info: 'Rebuy 按钮的默认补充金额。',
    selecting_flop: '选择翻牌',
    selecting_turn: '选择转牌 (Turn)',
    selecting_river: '选择河牌 (River)',
    selecting_hero: '选择手牌'
  },
  en: {
    appTitle: 'Poker Advisor Pro',
    heroHand: 'Hero Hand',
    communityCards: 'Board',
    calculate: 'Calculate & Advise',
    calculating: 'Simulating...',
    reset: 'New Hand',
    settings: 'Settings',
    potInfo: 'Pot Tracker',
    mainPot: 'Main Pot',
    currentBets: 'Current Bets',
    totalPot: 'Total Pot',
    heroStack: 'My Stack',
    stackAfterBet: 'Left',
    spr: 'SPR',
    strategy: 'Strategy',
    conservative: 'Tight',
    aggressive: 'Aggressive',
    maniac: 'Bluff / Maniac',
    players: 'Opponents',
    active: 'Active',
    folded: 'Folded',
    bet: 'Bet This Rd',
    equity: 'Raw Equity',
    advice: 'Action Advice',
    nextStreet: 'Collect & Deal',
    finishHand: 'Finish Hand',
    betSizing: 'Bet Sizing (Click to Apply)',
    potOdds: 'Pot Odds',
    requiredEquity: 'Req. Equity',
    advice_fold: 'Fold',
    advice_check_fold: 'Check/Fold',
    advice_check_call: 'Check/Call',
    advice_call: 'Call',
    advice_raise: 'Raise',
    advice_raise_bluff: 'Bluff Raise',
    advice_allin: 'All-In',
    advice_allin_bluff: 'All-In Bluff',
    reason_spr_low: 'Low SPR, Pot Committed',
    reason_value: 'Value Bet',
    reason_bluff_semi: 'Semi-Bluff: Draw + Fold Equity',
    reason_bluff_pure: 'Pure Bluff: Rep Strength',
    reason_odds: 'Good Odds to Call',
    street_pre: 'Pre-flop',
    street_flop: 'Flop',
    street_turn: 'Turn',
    street_river: 'River',
    add_player: 'Add Opp',
    bet_size_small: 'Small (1/3)',
    bet_size_med: 'Med (2/3)',
    bet_size_large: 'Pot (1.0)',
    bet_size_over: 'Overbet (1.5x)',
    settle_win: 'Win',
    settle_loss: 'Loss',
    settle_split: 'Chop',
    settle_title: 'Pot Settlement',
    settle_confirm: 'Confirm & Next Hand',
    restart_hand: 'Next Hand',
    btn_allin: 'ALL-IN',
    btn_fold: 'Fold',
    btn_call: 'Call',
    btn_check: 'Check',
    btn_call_allin: 'Call/All-In',
    rebuy: 'Rebuy',
    deck_count: 'Deck Count',
    deck_info: 'Standard is 1. More decks dilute card removal.',
    game_settings: 'Game Settings',
    selectCard: 'Select Card',
    pot_segment: 'Pot',
    contestants: 'Contestants',
    net_change: 'Net Change',
    segment_main: 'Main Pot',
    segment_side: 'Side Pot',
    buy_in_amount: 'Buy-in Amount',
    buy_in_info: 'Default amount for Rebuy button.',
    selecting_flop: 'Select Flop',
    selecting_turn: 'Select Turn',
    selecting_river: 'Select River',
    selecting_hero: 'Select Hand'
  }
};

/**
 * =================================================================
 * POKER ADVISOR PRO - EXTENDED DATA MODULES (v2.0)
 * 基于《德州扑克牌局分析与数据》文档补充的核心博弈数据
 * =================================================================
 */

// --- 1. 位置与起手牌策略修正 (Position Logic) ---
// 依据文档 2.2: 前位紧(Tight)，后位松(Loose)
window.PokerData.POSITIONS = {
  EP: { 
    label: "前位 (Early Position)", 
    range_modifier: "Tight", 
    description: "处于危险位置，后方有大量对手。只玩最强的怪兽牌和强对子。",
    action_plan: "除非是AA/KK/AK，否则遇到反击建议弃牌。"
  },
  MP: { 
    label: "中位 (Middle Position)", 
    range_modifier: "Normal", 
    description: "位置适中。可以开始玩一些强高张和中对子。",
    action_plan: "标准打法，注意观察后位玩家的动作。"
  },
  LP: { 
    label: "后位/按钮 (Late/BTN)", 
    range_modifier: "Loose", 
    description: "黄金位置！拥有信息优势。可玩同花连张、小对子等投机牌。",
    action_plan: "积极偷盲，利用位置施压，多玩底池。"
  },
  BLINDS: { 
    label: "盲注位 (SB/BB)", 
    range_modifier: "Defensive", 
    description: "被迫下注的位置。主要任务是防守，不要轻易造大底池。",
    action_plan: "赔率合适时跟注看牌，击中就打，没中就撤。"
  }
};

// --- 2. 牌面纹理定义与逻辑 (Board Texture Logic) ---
// 依据文档 3.1: 区分干燥与潮湿牌面，决定诈唬或控池
window.PokerData.BOARD_TEXTURES = {
  dry: { 
    id: "dry",
    label: "干燥牌面 (Dry)", 
    features: ["Rainbow (杂色)", "Disconnected (不连张)", "One High Card"], 
    strategy_adjustment: "high_fold_equity", // 诈唬成功率高
    cbet_freq: "High", // 建议高频持续下注
    example: ["Ks", "7d", "2h"] 
  },
  wet: { 
    id: "wet",
    label: "潮湿牌面 (Wet)", 
    features: ["Suited (同花面)", "Connected (连张面)", "Paired (公对)"], 
    strategy_adjustment: "pot_control", // 需控池
    cbet_freq: "Low", // 减少诈唬，有牌才打
    example: ["9h", "8h", "7d"] 
  }
};

// --- 3. 牌面纹理新手教学注释 (Tooltip/Help Text) ---
// 用于前端UI显示，帮助新手理解“干/湿”概念
window.PokerData.TEXTURE_EXPLANATION = {
  dry: {
    title: "什么是“干燥牌面”？",
    desc: "牌与牌之间毫无联系，像沙漠一样长不出“听牌”。",
    analogy: "安全区：通常谁现在的对子大，谁就是赢家。",
    strategy: "适合诈唬！如果你翻前加注过，即使没中也可以下注吓跑对手。"
  },
  wet: {
    title: "什么是“潮湿牌面”？",
    desc: "牌面紧凑（连张/同花），像雨林一样充满危险和机会。",
    analogy: "雷区：对手极易拿到顺子、同花或两对。",
    strategy: "务必小心！哪怕你有AA，如果没买到坚果，尽量不要造大底池。"
  }
};

// --- 4. 数学概率与补牌速查表 (Math & Probabilities) ---
// 依据文档 3.2 和 4.1 (4-2法则)
window.PokerData.PROBABILITIES = {
  // A. 翻牌击中概率 (Flop Hit Rates)
  flop_hit: {
    pocket_pair_to_set: { label: "口袋对 -> 中三条 (Set)", prob: 0.12, note: "约8次中1次" },
    suited_to_flush: { label: "同花牌 -> 直接中同花", prob: 0.008, note: "像中彩票一样难" },
    suited_to_flush_draw: { label: "同花牌 -> 中四张听花", prob: 0.11, note: "主要价值来源" },
    any_two_to_pair: { label: "任意牌 -> 中一对", prob: 0.32, note: "最常见的情况" }
  },
  
  // B. 听牌补牌数与胜率 (Outs & Equity)
  // equity_river_approx = outs * 4 (在翻牌圈估算)
  outs_lookup: {
    gutshot: { 
      label: "卡顺 (Gutshot)", 
      outs: 4, 
      equity_flop: 0.16, // 16%
      advice: "别追，除非极其便宜" 
    },
    overcards: { 
      label: "两张高牌 (Overcards)", 
      outs: 6, 
      equity_flop: 0.24, // 24%
      advice: "有反超机会，但也可能输给底对" 
    },
    oesd: { 
      label: "两头顺 (Open-Ended)", 
      outs: 8, 
      equity_flop: 0.32, // 32%
      advice: "强听牌，可以积极玩" 
    },
    flush_draw: { 
      label: "同花听牌 (Flush Draw)", 
      outs: 9, 
      equity_flop: 0.36, // 36%
      advice: "非常强，甚至可以加注半诈唬" 
    },
    combo_draw: { 
      label: "双重听牌 (Combo Draw)", 
      outs: 15, 
      equity_flop: 0.54, // 54%
      advice: "超级强牌！此时你的胜率通常已经超过了成牌，直接All-in！" 
    }
  },

  // C. 经典对决胜率 (Pre-flop Matchups)
  matchups: {
    pair_vs_underpair: { label: "大对子 vs 小对子", win_rate: "82% vs 18%", note: "碾压" },
    pair_vs_overcards: { label: "对子 vs 高张 (AK)", win_rate: "55% vs 45%", note: "跑马 (Coin Flip)" },
    domination: { label: "AK vs AQ", win_rate: "74% vs 26%", note: "压制 (Dominated)" }
  }
};

// --- 5. 策略参数配置 (Strategy Configuration) ---
// 依据文档 模块C: 新手建议动作参数
window.PokerData.STRATEGY_CONFIG = {
  // 翻牌前加注公式
  preflop: {
    open_raise_base: 3.0, // 标准加注：3BB
    iso_raise_per_limper: 1.0, // 每有一个人平跟，加注额增加1BB
    min_equity_to_call: 0.33 // 一般跟注所需最低胜率
  },
  // 翻牌后下注尺度 (相对于底池 Pot)
  postflop: {
    cbet_dry: 0.33, // 干燥面下小注 (1/3) 诈唬便宜
    cbet_wet: 0.66, // 潮湿面下重注 (2/3) 保护手牌
    value_bet: 0.75, // 价值下注通常打 3/4
    bluff_raise: 3.0 // 诈唬加注通常是对手下注额的3倍
  }
};