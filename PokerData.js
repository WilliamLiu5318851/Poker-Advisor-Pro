/**
 * Poker Advisor Pro - Data Layer (v7.0 - Strict Hand Logic)
 * 核心升级：
 * 1. 翻牌前新增 pre_high_card (K-rag 等)，区分于 pre_trash。
 * 2. 修正垃圾牌建议为 "Check/Fold"，避免误导用户跟注。
 * 3. 严格保留所有英文定义，防止回归错误。
 */

window.PokerData = {};

// --- A. 基础常量 ---
window.PokerData.CONSTANTS = {
  SUITS: ['s', 'h', 'c', 'd'], // 顺序调整为：黑桃, 红桃, 梅花, 方块
  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
  RANK_VALUES: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 },
  STREETS: ['Pre-flop', 'Flop', 'Turn', 'River']
};

// --- B. 策略风格配置文件 ---
window.PokerData.STRATEGY_PROFILES = {
  conservative: {
    label_zh: "保守型 (Tight)",
    label_en: "Conservative",
    equity_buffer: 1.2, // 提高跟注门槛
    raise_threshold: 75, // 价值加注所需胜率
    bluff_equity: 100, // 半诈唬所需胜率 (100表示永不)
    three_bet_bluff_freq: 0.05, // 3-Bet诈唬频率
    bet_sizing: { 
      value: { small: 0.33, med: 0.5, large: 0.66 },
      bluff: { small: 0.33, med: 0.5, large: 0.5 } // 保守型诈唬也用小注
    }
  },
  aggressive: {
    label_zh: "激进型 (Aggressive)",
    label_en: "Aggressive",
    equity_buffer: 0.95,
    raise_threshold: 50,
    bluff_equity: 30, 
    three_bet_bluff_freq: 0.15,
    bet_sizing: { 
      value: { small: 0.5, med: 0.75, large: 1.0 },
      bluff: { small: 0.5, med: 0.66, large: 0.75 }
    }
  },
  maniac: {
    label_zh: "疯鱼型 (Maniac)",
    label_en: "Maniac",
    equity_buffer: 0.7,
    raise_threshold: 30,
    bluff_equity: 15, 
    three_bet_bluff_freq: 0.30,
    bet_sizing: { 
      value: { small: 0.66, med: 1.0, large: 1.5 },
      bluff: { small: 0.75, med: 1.2, large: 2.0 } // 疯子诈唬可以用超池
    }
  }
};

// --- C. 位置与起手牌策略 ---
window.PokerData.POSITIONS = {
  zh: {
    EP: { 
      label: "前位 (EP)", 
      range_modifier: "Tight", 
      description: "⚠️ 危险位置：你是最早行动的人之一。", 
      action_plan: "只玩 AA/KK/AK/QQ 等核心强牌。遇反击弃牌。",
      strategy: { open_raise_hands: "77+,AJs+,KQs,AQo+", defend_hands: "99+,AK" } // 新增：可被程序直接读取的策略
    },
    MP: { 
      label: "中位 (MP)", 
      range_modifier: "Normal", 
      description: "⚖️ 标准位置：位置适中。", 
      action_plan: "适当放宽范围，玩强高张(AQ/AJ)和中对子。",
      strategy: { open_raise_hands: "55+,A9s+,KTs+,QTs+,AJo+", defend_hands: "88+,AQs+" }
    },
    LP: { 
      label: "后位 (LP/BTN)", 
      range_modifier: "Loose", 
      description: "🎯 黄金位置：最后行动，信息优势最大！", 
      action_plan: "积极偷盲，利用位置施压，多玩同花连张。",
      strategy: { open_raise_hands: "22+,A2s+,K2s+,Q8s+,J8s+,T8s+,97s+,87s,76s,65s,A8o+,KTo+", steal_blinds: true }
    },
    BLINDS: { 
      label: "盲注 (SB/BB)", 
      range_modifier: "Defensive", 
      description: "🛡️ 防守位置：被迫下注，翻后先行动。", 
      action_plan: "主要防守。赔率合适跟注，没中就撤。",
      strategy: { defend_vs_steal_hands: "22+,A2s+,K9s+,Q9s+,J9s+,T9s,A2o+,KTo+,QTo,JTo", check_fold_priority: true }
    }
  },
  en: {
    EP: { 
      label: "Early Pos (EP)", 
      range_modifier: "Tight", 
      description: "⚠️ Danger Zone: Act early.", 
      action_plan: "Premium hands only (AA/KK/AK).",
      strategy: { open_raise_hands: "77+,AJs+,KQs,AQo+", defend_hands: "99+,AK" }
    },
    MP: { label: "Middle Pos (MP)", range_modifier: "Normal", description: "⚖️ Standard Position.", action_plan: "Widen range slightly (AQ/AJ/99+).", strategy: { open_raise_hands: "55+,A9s+,KTs+,QTs+,AJo+", defend_hands: "88+,AQs+" } },
    LP: { label: "Late Pos (LP/BTN)", range_modifier: "Loose", description: "🎯 Money Position: Act last.", action_plan: "Steal blinds, play suited connectors.", strategy: { open_raise_hands: "22+,A2s+,K2s+,Q8s+,J8s+,T8s+,97s+,87s,76s,65s,A8o+,KTo+", steal_blinds: true } },
    BLINDS: { label: "Blinds (SB/BB)", range_modifier: "Defensive", description: "🛡️ Defensive: Out of position.", action_plan: "Defend with good odds. Fit or fold.", strategy: { defend_vs_steal_hands: "22+,A2s+,K9s+,Q9s+,J9s+,T9s,A2o+,KTo+,QTo,JTo", check_fold_priority: true } }
  }
};

// --- D. 翻牌前起手牌范围图 (GTO Pre-flop Charts) ---
// 用于更精确的翻牌前决策
window.PokerData.PREFLOP_CHARTS = {
  // 6人桌, 100BB
  '6max_100bb': {
    EP: "77+,AJs+,KQs,AQo+", // 前位 (UTG)
    MP: "55+,A9s+,KTs+,QTs+,AJo+", // 中位 (MP)
    CO: "22+,A2s+,K9s+,Q9s+,J9s+,T8s+,98s,87s,76s,AJo+,KQo", // Cutoff
    BTN: "22+,A2s+,K2s+,Q8s+,J8s+,T8s+,97s+,87s,76s,65s,A8o+,KTo+", // Button (后位)
    SB: "33+,A2s+,K8s+,Q9s+,J9s+,T9s,A7o+,KTo+,QTo+", // 小盲
  }
  // 未来可扩展更多场景，如9人桌，不同筹码深度等
};

// --- E. 经典对抗胜率 (Classic Matchup Equity) ---
// 用于快速参考和增强建议理由
window.PokerData.MATCHUP_EQUITY = {
  'AA_vs_KK': {
    hero: 'AA', villain: 'KK', equity: 82.0,
    description_zh: '典型的冤家牌，AA碾压KK。',
    description_en: 'Classic cooler. AA dominates KK.'
  },
  'JJ_vs_AK': {
    hero: 'JJ', villain: 'AK', equity: 54.1,
    description_zh: '经典的跑马(Flip)，胜率五五开。',
    description_en: 'A classic coin flip, roughly 50/50.'
  },
  'AK_vs_AQ': {
    hero: 'AK', villain: 'AQ', equity: 73.5,
    description_zh: 'AK 强力压制 AQ，因为Kicker优势。',
    description_en: 'AK strongly dominates AQ due to the kicker.'
  },
  '87s_vs_AA': {
    hero: '87s', villain: 'AA', equity: 22.5,
    description_zh: '虽然落后，但同花连张有不错的反超机会。',
    description_en: 'Suited connectors have a decent chance to outdraw the overpair.'
  }
};

// --- F. 数学概率 ---
window.PokerData.PROBABILITIES = {
  flop_hit: {
    pocket_pair_to_set: { label: "中三条", prob: 12, note: "8中1" },
    suited_to_flush: { label: "天胡同花", prob: 0.8, note: "极难" },
    suited_to_flush_draw: { label: "中听花", prob: 11, note: "主要价值" },
    any_two_to_pair: { label: "中一对", prob: 32, note: "最常见" }
  },
  outs_lookup: {
    straight_draw_gutshot: { label: "卡顺 (Gutshot)", outs: 4, equity_flop: 16.5, advice: "别追，除非极其便宜" },
    overcards: { label: "两张高牌 (Overcards)", outs: 6, equity_flop: 24.1, advice: "有反超机会，但也可能输给底对" },
    straight_draw_oesd: { label: "两头顺 (OESD)", outs: 8, equity_flop: 31.5, advice: "强听牌，可以积极玩" },
    flush_draw: { label: "同花听牌 (Flush Draw)", outs: 9, equity_flop: 35.0, advice: "非常强，甚至可以加注半诈唬" },
    flush_draw_nut: { label: "坚果花听牌 (Nut FD)", outs: 9, equity_flop: 35.0, advice: "极强！有摊牌价值+听牌价值" },
    combo_draw: { label: "双重听牌 (Combo Draw)", outs: 15, equity_flop: 54.1, advice: "超级强牌！直接 All-in！" }
  }
};

// --- G. 手牌分析库 ---
window.PokerData.HAND_ANALYSIS_DEFINITIONS = {
  zh: {
    // Pre-flop High Value
    pre_monster_pair: { label: "超级对子 (Monster)", advice: "加注/4-Bet", reason: "起手最强牌，不要慢打！" },
    pre_strong_pair: { label: "强对子 (Strong Pair)", advice: "加注/跟注", reason: "有价值，但小心高牌翻出。" },
    pre_small_pair: { label: "小对子 (Set Mining)", advice: "投机/埋伏", reason: "目标是中三条(Set)，没中就扔。" },
    pre_premium_high: { label: "核心高牌 (Premium)", advice: "加注/价值", reason: "AK/AQ 强力压制，击中即领先。" },
    pre_suited_connector: { label: "同花连张 (Suited Conn)", advice: "投机/跟注", reason: "隐含赔率极高，适合深筹码博大牌。" },
    pre_suited_ace: { label: "同花A (Suited Ace)", advice: "半诈唬/阻断", reason: "有A阻断坚果，且能听顺，非常灵活。" },
    pre_broadway: { label: "广播道 (Broadways)", advice: "谨慎进攻", reason: "容易成顶对，但踢脚往往不如对手。" },
    
    // Pre-flop Marginal/Trash (New!)
    pre_high_card: { label: "单张高牌 (High Card)", advice: "过牌/跟小注", reason: "有一张J/Q/K/A。位置好可玩，位置差建议弃。" },
    pre_trash: { label: "垃圾牌 (Trash)", advice: "过牌/弃牌", reason: "牌力太差，长期玩必输。别浪。" },

    // Post-flop
    made_straight_flush: { label: "同花顺 (Straight Flush)", advice: "慢打/诱敌", reason: "绝世好牌！" },
    made_straight_flush_nuts: { label: "坚果同花顺 (Nuts)", advice: "慢打/诱敌", reason: "无敌！想办法让对手送钱。" },
    made_straight_flush_lower: { label: "低端同花顺 (Low SF)", advice: "极度危险", reason: "🛑 警告：存在更大的同花顺！" },
    made_quads: { label: "四条 (Quads)", advice: "慢打", reason: "炸弹！极小概率输牌。" },
    made_full_house: { label: "满堂红 (Full House)", advice: "价值下注", reason: "除非撞上更大的葫芦，否则稳赢。" },
    made_flush_nuts: { label: "坚果同花 (Nut Flush)", advice: "价值下注", reason: "当前最大的同花，无惧对手。" },
    made_flush: { label: "同花 (Flush)", advice: "价值/保护", reason: "小心A花或公对(葫芦)。" },
    made_straight: { label: "顺子 (Straight)", advice: "积极进攻", reason: "大牌，但在同花面要小心。" },
    monster: { label: "三条 (Trips/Set)", advice: "强力价值", reason: "隐蔽性强，造大底池！" },
    
    two_pair: { label: "两对 (Two Pair)", advice: "价值/谨慎", reason: "强牌，但要警惕顺子和同花。" },
    top_pair: { label: "顶对 (Top Pair)", advice: "价值/控池", reason: "通常领先，湿润面别打太深。" },
    top_pair_with_draw: { label: "顶对+听牌", advice: "积极进攻", reason: "领先且有后备计划，应主动进攻。" },
    middle_pair: { label: "中对 (Middle Pair)", advice: "抓诈唬/过牌", reason: "打不过强牌，适合控池。" },
    bottom_pair: { label: "底对 (Bottom Pair)", advice: "过牌/弃牌", reason: "很难承受大额注码。" },
    pocket_pair_below: { label: "小口袋对 (Underpair)", advice: "过牌/弃牌", reason: "极易被压制，通常只能赢空气。" },
    
    flush_draw_nut: { label: "坚果花听牌 (Nut FD)", advice: "半诈唬/全压", reason: "即使没中也有机会赢 (A High)。" },
    flush_draw: { label: "同花听牌 (Flush Draw)", advice: "跟注/半诈唬", reason: "赔率合适可跟，或加注打走弱牌。" },
    straight_draw_oesd: { label: "两头顺听牌 (OESD)", advice: "积极进攻", reason: "8张补牌，强听牌。" },
    straight_draw_gutshot: { label: "卡顺听牌 (Gutshot)", advice: "谨慎跟注", reason: "只有4张补牌，别追。" },
    combo_draw: { label: "双重听牌 (Combo Draw)", advice: "全压/重注", reason: "胜率极高，甚至领先成牌！" },
    overcards: { label: "两张高牌 (Overcards)", advice: "观望/飘打", reason: "暂无成牌，可尝试诈唬。" },
    
    // Post-flop High/Low (v6.9)
    high_card_good: { label: "强高牌 (Good High Card)", advice: "过牌/跟小注", reason: "J/Q/K/A 拥有摊牌价值，若便宜可看一张。" },
    high_card_weak: { label: "弱高牌 (Weak High Card)", advice: "过牌/弃牌", reason: "牌力太弱，很难获胜，建议放弃。" },
    
    trash: { label: "空气牌 (Trash)", advice: "弃牌 (Fold)", reason: "毫无胜率，快跑。" }
  },
  en: {
    pre_monster_pair: { label: "Premium Pair", advice: "Raise/4-Bet", reason: "Build pot with AA/KK/QQ." },
    pre_strong_pair: { label: "Strong Pair", advice: "Raise/Call", reason: "Good value, but watch out for overcards." },
    pre_small_pair: { label: "Set Mining", advice: "Speculate", reason: "Aim for a Set. Fold if you miss." },
    pre_premium_high: { label: "Premium High", advice: "Raise/Value", reason: "AK/AQ dominates. Lead the action." },
    pre_suited_connector: { label: "Suited Connector", advice: "Speculate", reason: "High implied odds. Great for deep stacks." },
    pre_suited_ace: { label: "Suited Ace", advice: "Semi-Bluff", reason: "Blocker to nut flush + wheel potential." },
    pre_broadway: { label: "Broadways", advice: "Caution", reason: "Good top pair potential but kicker trouble." },
    
    // Pre-flop New
    pre_high_card: { label: "High Card", advice: "Check/Call Small", reason: "Has J/Q/K/A. Playable in position." },
    pre_trash: { label: "Trash", advice: "Check/Fold", reason: "Negative EV hand. Fold." },

    made_straight_flush: { label: "Straight Flush", advice: "Slowplay", reason: "Monster hand." },
    made_straight_flush_nuts: { label: "Nut Straight Flush", advice: "Slowplay", reason: "Invincible hand. Extract max value." },
    made_straight_flush_lower: { label: "Low Straight Flush", advice: "Caution", reason: "Warning: Higher Straight Flush possible!" },
    made_quads: { label: "Quads", advice: "Slowplay", reason: "Bomb! Losing is extremely rare." },
    made_full_house: { label: "Full House", advice: "Value Bet", reason: "Strong hand. Only loses to bigger boats." },
    made_flush_nuts: { label: "Nut Flush", advice: "Value Bet", reason: "You have the Ace flush. Unbeatable unless board pairs." },
    made_flush: { label: "Flush", advice: "Value/Protect", reason: "Watch out for Ace flush or Full House." },
    made_straight: { label: "Straight", advice: "Attack", reason: "Strong hand. Be careful on flushed boards." },
    monster: { label: "Set/Trips", advice: "Value", reason: "Very strong. Build a big pot!" },

    two_pair: { label: "Two Pair", advice: "Value/Caution", reason: "Strong hand, but be wary of straights and flushes." },
    top_pair: { label: "Top Pair", advice: "Value/Control", reason: "Usually ahead. Don't overplay on wet boards." },
    top_pair_with_draw: { label: "Top Pair + Draw", advice: "Attack", reason: "You are ahead with a backup plan. Be aggressive." },
    middle_pair: { label: "Middle Pair", advice: "Check/Bluff-Catch", reason: "Showdown value, but loses to aggression." },
    bottom_pair: { label: "Bottom Pair", advice: "Check/Fold", reason: "Weak showdown value." },
    pocket_pair_below: { label: "Underpair", advice: "Check/Fold", reason: "Easily dominated." },

    flush_draw_nut: { label: "Nut Flush Draw", advice: "Semi-Bluff/All-in", reason: "A-High showdown value + draw." },
    flush_draw: { label: "Flush Draw", advice: "Call/Semi-Bluff", reason: "Good odds to call or raise." },
    straight_draw_oesd: { label: "OESD", advice: "Attack", reason: "8 outs. Strong draw." },
    straight_draw_gutshot: { label: "Gutshot", advice: "Caution", reason: "Only 4 outs. Don't chase." },
    combo_draw: { label: "Combo Draw", advice: "All-in", reason: "Massive equity! Often ahead of made hands." },
    overcards: { label: "Overcards", advice: "Float", reason: "No made hand, but 6 outs." },
    
    high_card_good: { label: "Good High Card", advice: "Check/Call Small", reason: "J/Q/K/A has showdown value." },
    high_card_weak: { label: "Weak High Card", advice: "Check/Fold", reason: "Very weak. Fold to aggression." },
    
    trash: { label: "Trash", advice: "Fold", reason: "No value." }
  }
};

window.PokerData.TEXTURE_STRATEGIES = {
  zh: {
    TEX_PAIRED: { name: "公对面 (Paired)", desc: "警惕三条或葫芦，优先控池。" },
    TEX_MONOTONE: { name: "单色面 (Monotone)", desc: "极度危险！对手极可能有同花，除非你有坚果牌，否则谨慎。" },
    TEX_TWO_TONE: { name: "两色面 (Two-Tone)", desc: "牌面有同花听牌可能。保护你的成牌，并警惕对手的听牌。" },
    TEX_CONNECTED: { name: "连张面 (Connected)", desc: "顺子可能性大，你的顶对可能不再是强牌。" },
    TEX_RAINBOW_DRY: { name: "干燥面 (Dry)", desc: "牌面安全，成牌领先时应持续价值下注，也适合诈唬。" }
  },
  en: {
    TEX_PAIRED: { name: "Paired Board", desc: "Be cautious of Trips/Full House. Pot control is key." },
    TEX_MONOTONE: { name: "Monotone", desc: "Danger! A flush is very likely. Be careful without the nuts." },
    TEX_TWO_TONE: { name: "Two-Tone", desc: "Many draws. Protect your made hands with larger bets." },
    TEX_CONNECTED: { name: "Connected", desc: "Straights are possible. Your top pair might be weak." },
    TEX_RAINBOW_DRY: { name: "Dry/Rainbow", desc: "Safe board. Continue betting for value and good for bluffing." }
  }
};

window.PokerData.TEXTS = {
  zh: {
    appTitle: '德州扑克智囊 Pro',
    heroStack: '我的筹码',
    bet: '本轮下注',
    potInfo: '底池追踪',
    mainPot: '主底池',
    spr: 'SPR',
    stackAfterBet: '下注后剩余',
    calculate: '计算胜率 & 获取建议',
    calculating: 'AI 思考中...',
    settle_title: '分池结算',
    settle_win: '赢',
    settle_loss: '输',
    settle_split: '平',
    settle_confirm: '确认并下一局',
    btn_fold: '弃牌 (Fold)',
    btn_check: '过牌 (Check)',
    btn_call: '跟注 (Call)',
    btn_call_allin: '全压 (All-In)',
    btn_allin: 'ALL-IN',
    equity: '真实胜率',
    game_settings: '游戏设置',
    deck_count: '牌副数',
    buy_in_amount: '买入额',
    rebuy: '补充筹码',
    selectCard: '选择一张牌',
    selecting_hero: '选择手牌',
    selecting_flop: '选择翻牌',
    selecting_turn: '选择转牌',
    selecting_river: '选择河牌',
    add_player: '添加对手',
    my_position: '我的位置',
    select_position: '选择位置', 
    bet_placeholder: '输入下注额',
    players: '对手列表',
    betSizing: '智能下注建议',
    bet_size_small: '小注',
    bet_size_med: '中注',
    bet_size_large: '大注',
    bet_size_over: '超池',
    deck_info: '模拟使用的牌副数 (标准1副)',
    buy_in_info: '重买时的默认筹码量',
    advice_raise: '建议加注 (Raise)',
    advice_call: '建议跟注 (Call)',
    advice_fold: '建议弃牌 (Fold)',
    advice_raise_bluff: '建议诈唬 (Bluff)',
    advice_allin: '建议全压 (All-In)',
    advice_allin_bluff: '建议全压诈唬',
    advice_check_call: '建议过牌/跟注',
    reason_spr_low: 'SPR过低，已套池',
    reason_value: '强牌价值下注',
    reason_bluff_semi: '听牌半诈唬',
    reason_bluff_pure: '纯诈唬 (位置/形象)',
    reason_odds: '赔率合适/过牌控池',
    maniac: '疯鱼模式',
    aggressive: '激进模式',
    conservative: '保守模式',
    active: '入局',
    folded: '弃牌',
    street_pre: '翻牌前',
    street_flop: '翻牌圈',
    street_turn: '转牌圈',
    street_river: '河牌圈',
    nextStreet: '收池 & 下一轮',
    finishHand: '本局结束',
    segment_main: '主池',
    segment_side: '边池',
    in_position_range: '在推荐范围内',
    out_of_position_range: '不在推荐范围内',
    classic_matchup: '经典对抗',
    equity_vs_opponents: '胜率 vs. 对手',
    equity_trend_chart_title: '手牌胜率趋势',
    num_opponents: '对手数量',
    equity_percentage: '胜率 (%)',
    opponents_short: '人',
    // 白话理由 (新手友好版)
    reason_spr_low_plain: '你已经投入了太多筹码，弃牌比继续打损失更大',
    reason_value_plain: '你的牌很强，趁对手还会跟注时多赚一些',
    reason_bluff_semi_plain: '你有机会击中更强的牌，主动进攻可以多一种赢钱方式',
    reason_bluff_pure_plain: '对手可能也没什么好牌，现在加注有机会让他们直接弃牌',
    reason_odds_plain: '跟注在数学上是合算的，或者先看看情况再说'
  },
  en: {
    appTitle: 'Poker Advisor Pro',
    heroStack: 'My Stack',
    bet: 'Bet This Rd',
    potInfo: 'Pot Tracker',
    mainPot: 'Main Pot',
    spr: 'SPR',
    stackAfterBet: 'Left',
    calculate: 'Calculate',
    calculating: 'Thinking...',
    settle_title: 'Settlement',
    settle_win: 'Win',
    settle_loss: 'Loss',
    settle_split: 'Chop',
    settle_confirm: 'Next Hand',
    btn_fold: 'Fold',
    btn_check: 'Check',
    btn_call: 'Call',
    btn_call_allin: 'Call/All-In',
    btn_allin: 'ALL-IN',
    equity: 'Equity',
    game_settings: 'Settings',
    deck_count: 'Decks',
    buy_in_amount: 'Buy-in',
    rebuy: 'Rebuy',
    selectCard: 'Select Card',
    selecting_hero: 'Select Hand',
    selecting_flop: 'Select Flop',
    selecting_turn: 'Select Turn',
    selecting_river: 'Select River',
    add_player: 'Add Opponent',
    my_position: 'My Position',
    select_position: 'Select Pos', 
    bet_placeholder: 'Bet Amount',
    players: 'Opponents',
    betSizing: 'Bet Sizing',
    bet_size_small: 'Small',
    bet_size_med: 'Medium',
    bet_size_large: 'Large',
    bet_size_over: 'Overbet',
    deck_info: 'Number of decks for sim',
    buy_in_info: 'Default rebuy amount',
    advice_raise: 'Advice: Raise',
    advice_call: 'Advice: Call',
    advice_fold: 'Advice: Fold',
    advice_raise_bluff: 'Advice: Bluff',
    advice_allin: 'Advice: All-In',
    advice_allin_bluff: 'Advice: Bluff All-In',
    advice_check_call: 'Advice: Check/Call',
    reason_spr_low: 'Low SPR, Pot Committed',
    reason_value: 'Value Bet',
    reason_bluff_semi: 'Semi-Bluff',
    reason_bluff_pure: 'Pure Bluff',
    reason_odds: 'Good Odds / Pot Control',
    maniac: 'Maniac',
    aggressive: 'Aggressive',
    conservative: 'Conservative',
    active: 'Active',
    folded: 'Folded',
    street_pre: 'Pre-flop',
    street_flop: 'Flop',
    street_turn: 'Turn',
    street_river: 'River',
    nextStreet: 'Collect & Next',
    finishHand: 'Finish Hand',
    segment_main: 'Main Pot',
    segment_side: 'Side Pot',
    in_position_range: 'In position range',
    out_of_position_range: 'Out of position range',
    classic_matchup: 'Classic Matchup',
    equity_vs_opponents: 'Equity vs. Opponents',
    equity_trend_chart_title: 'Hand Equity Trend',
    num_opponents: 'Number of Opponents',
    equity_percentage: 'Equity (%)',
    opponents_short: 'opp',
    // Plain reasons (beginner-friendly)
    reason_spr_low_plain: 'You\'ve put too many chips in — folding now costs more than continuing',
    reason_value_plain: 'Your hand is strong. Bet now while opponents will still call',
    reason_bluff_semi_plain: 'You can hit a stronger hand. Betting gives you two ways to win',
    reason_bluff_pure_plain: 'Opponent may be weak. A raise here might take the pot without a showdown',
    reason_odds_plain: 'Pot odds make calling profitable, or check and wait for more information'
  }
};