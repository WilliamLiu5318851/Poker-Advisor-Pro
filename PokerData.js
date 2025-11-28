/**
 * Poker Advisor Pro - Data Layer (v6.7 - i18n Fix)
 * 修复：位置策略 (POSITIONS) 和纹理分析 (TEXTURE_STRATEGIES) 现在支持双语切换
 */

window.PokerData = {};

// --- A. 基础常量 ---
window.PokerData.CONSTANTS = {
  SUITS: ['s', 'h', 'd', 'c'],
  RANKS: ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'],
  RANK_VALUES: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 },
  STREETS: ['Pre-flop', 'Flop', 'Turn', 'River']
};

// --- B. 位置与起手牌策略 (双语版) ---
window.PokerData.POSITIONS = {
  zh: {
    EP: { 
      label: "前位 (EP)", 
      range_modifier: "Tight", 
      description: "⚠️ 危险位置：你是最早行动的人之一，后方还有大量对手未表态。",
      action_plan: "只玩 AA/KK/AK/QQ 等核心强牌。如果遭遇反击，通常建议直接弃牌。"
    },
    MP: { 
      label: "中位 (MP)", 
      range_modifier: "Normal", 
      description: "⚖️ 标准位置：位置适中，可以看到前位玩家的动作。",
      action_plan: "可以适当放宽范围，玩一些强高张(AQ/AJ)和中对子(99-JJ)。"
    },
    LP: { 
      label: "后位 (LP/BTN)", 
      range_modifier: "Loose", 
      description: "🎯 黄金位置：你是最后行动的人，拥有最大的信息优势！",
      action_plan: "这是赚钱的位置！积极偷盲，利用位置优势施压，多玩同花连张等投机牌。"
    },
    BLINDS: { 
      label: "盲注 (SB/BB)", 
      range_modifier: "Defensive", 
      description: "🛡️ 防守位置：你被迫下注了盲注，翻牌后最先行动，非常被动。",
      action_plan: "主要任务是防守。赔率合适时跟注看牌，没中就撤，不要在没位置时造大底池。"
    }
  },
  en: {
    EP: { 
      label: "Early Pos (EP)", 
      range_modifier: "Tight", 
      description: "⚠️ Danger Zone: You act early with many opponents left to act behind you.",
      action_plan: "Play only premium hands (AA/KK/AK/QQ). If re-raised, usually fold."
    },
    MP: { 
      label: "Middle Pos (MP)", 
      range_modifier: "Normal", 
      description: "⚖️ Standard Position: You can see early actions before making a decision.",
      action_plan: "Widen range slightly. Good for strong broadways (AQ/AJ) and mid-pairs (99-JJ)."
    },
    LP: { 
      label: "Late Pos (LP/BTN)", 
      range_modifier: "Loose", 
      description: "🎯 Money Position: You act last and have the most information!",
      action_plan: "Steal blinds aggressively. Use position to apply pressure with suited connectors."
    },
    BLINDS: { 
      label: "Blinds (SB/BB)", 
      range_modifier: "Defensive", 
      description: "🛡️ Defensive: You are forced to bet and act first post-flop. Very passive.",
      action_plan: "Defend only with good odds. Fit or fold. Do not build big pots out of position."
    }
  }
};

// --- C. 牌面纹理定义 (宏观 - 双语) ---
window.PokerData.BOARD_TEXTURES = {
  zh: {
    dry: { label: "干燥牌面 (Dry)", features: ["杂色", "不连张"], strategy_adjustment: "high_fold_equity" },
    wet: { label: "潮湿牌面 (Wet)", features: ["同花/连张", "公对"], strategy_adjustment: "pot_control" }
  },
  en: {
    dry: { label: "Dry Board", features: ["Rainbow", "Disconnected"], strategy_adjustment: "high_fold_equity" },
    wet: { label: "Wet Board", features: ["Suited/Connected", "Paired"], strategy_adjustment: "pot_control" }
  }
};

// --- D. 牌面纹理新手教学 (无 UI 使用暂略，保留结构) ---
window.PokerData.TEXTURE_EXPLANATION = { zh: {}, en: {} };

// --- E. 数学概率与补牌速查表 ---
window.PokerData.PROBABILITIES = {
  flop_hit: {
    pocket_pair_to_set: { label: "中三条 (Set)", prob: 12, note: "8中1" },
    suited_to_flush: { label: "天胡同花", prob: 0.8, note: "极难" },
    suited_to_flush_draw: { label: "中听花", prob: 11, note: "主要价值" },
    any_two_to_pair: { label: "中一对", prob: 32, note: "最常见" }
  },
  outs_lookup: {
    straight_draw_gutshot: { label: "卡顺 (Gutshot)", outs: 4, equity_flop: 16, advice: "别追，除非极其便宜" },
    overcards: { label: "两张高牌 (Overcards)", outs: 6, equity_flop: 24, advice: "有反超机会，但也可能输给底对" },
    straight_draw_oesd: { label: "两头顺 (OESD)", outs: 8, equity_flop: 32, advice: "强听牌，可以积极玩" },
    flush_draw: { label: "同花听牌 (Flush Draw)", outs: 9, equity_flop: 36, advice: "非常强，甚至可以加注半诈唬" },
    flush_draw_nut: { label: "坚果花听牌 (Nut FD)", outs: 9, equity_flop: 36, advice: "极强！有摊牌价值+听牌价值" },
    combo_draw: { label: "双重听牌 (Combo Draw)", outs: 15, equity_flop: 54, advice: "超级强牌！直接 All-in！" }
  }
};

// --- F. 策略参数配置 ---
window.PokerData.STRATEGY_CONFIG = {
  preflop: { open_raise_base: 3.0, iso_raise_per_limper: 1.0, min_equity_to_call: 33 },
  postflop: { cbet_dry: 0.33, cbet_wet: 0.66, value_bet: 0.75, bluff_raise: 3.0 }
};

// --- G. 手牌分析库 ---
window.PokerData.HAND_ANALYSIS_DEFINITIONS = {
  zh: {
    pre_monster_pair: { label: "超级对子 (Monster)", advice: "加注/4-Bet", reason: "起手最强牌，不要慢打！" },
    pre_strong_pair: { label: "强对子 (Strong Pair)", advice: "加注/跟注", reason: "有价值，但小心高牌翻出。" },
    pre_small_pair: { label: "小对子 (Set Mining)", advice: "投机/埋伏", reason: "目标是中三条(Set)，没中就扔。" },
    pre_premium_high: { label: "核心高牌 (Premium)", advice: "加注/价值", reason: "AK/AQ 强力压制，击中即领先。" },
    pre_suited_connector: { label: "同花连张 (Suited Conn)", advice: "投机/跟注", reason: "隐含赔率极高，适合深筹码博大牌。" },
    pre_suited_ace: { label: "同花A (Suited Ace)", advice: "半诈唬/阻断", reason: "有A阻断坚果，且能听顺，非常灵活。" },
    pre_broadway: { label: "广播道 (Broadways)", advice: "谨慎进攻", reason: "容易成顶对，但踢脚往往不如对手。" },
    pre_trash: { label: "杂牌 (Trash)", advice: "弃牌 (Fold)", reason: "长期玩这种牌是亏损的根源。" },

    made_straight_flush: { label: "同花顺 (Straight Flush)", advice: "慢打/诱敌", reason: "绝世好牌！" },
    made_straight_flush_nuts: { label: "坚果同花顺 (Nuts)", advice: "慢打/诱敌", reason: "无敌！想办法让对手送钱。" },
    made_straight_flush_lower: { label: "低端同花顺 (Low SF)", advice: "极度危险", reason: "🛑 警告：存在更大的同花顺！" },
    made_quads: { label: "四条 (Quads)", advice: "慢打", reason: "炸弹！极小概率输牌。" },
    made_full_house: { label: "满堂红 (Full House)", advice: "价值下注", reason: "除非撞上更大的葫芦，否则稳赢。" },
    made_flush_nuts: { label: "坚果同花 (Nut Flush)", advice: "价值下注", reason: "当前最大的同花，无惧对手。" },
    made_flush: { label: "同花 (Flush)", advice: "价值/保护", reason: "小心A花或公对(葫芦)。" },
    made_straight: { label: "顺子 (Straight)", advice: "积极进攻", reason: "大牌，但在同花面要小心。" },
    monster: { label: "三条 (Trips/Set)", advice: "强力价值", reason: "隐蔽性强，造大底池！" },
    
    top_pair: { label: "顶对 (Top Pair)", advice: "价值/控池", reason: "通常领先，湿润面别打太深。" },
    middle_pair: { label: "中对 (Middle Pair)", advice: "抓诈唬/过牌", reason: "打不过强牌，适合控池。" },
    bottom_pair: { label: "底对 (Bottom Pair)", advice: "过牌/弃牌", reason: "很难承受大额注码。" },
    pocket_pair_below: { label: "小口袋对 (Underpair)", advice: "过牌/弃牌", reason: "极易被压制，通常只能赢空气。" },
    
    flush_draw_nut: { label: "坚果花听牌 (Nut FD)", advice: "半诈唬/全压", reason: "即使没中也有机会赢 (A High)。" },
    flush_draw: { label: "同花听牌 (Flush Draw)", advice: "跟注/半诈唬", reason: "赔率合适可跟，或加注打走弱牌。" },
    straight_draw_oesd: { label: "两头顺听牌 (OESD)", advice: "积极进攻", reason: "8张补牌，强听牌。" },
    straight_draw_gutshot: { label: "卡顺听牌 (Gutshot)", advice: "谨慎跟注", reason: "只有4张补牌，别追。" },
    combo_draw: { label: "双重听牌 (Combo Draw)", advice: "全压/重注", reason: "胜率极高，甚至领先成牌！" },
    overcards: { label: "两张高牌 (Overcards)", advice: "观望/飘打", reason: "暂无成牌，可尝试诈唬。" },
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
    pre_trash: { label: "Trash", advice: "Fold", reason: "No value. Save your chips." },

    made_straight_flush: { label: "Straight Flush", advice: "Slowplay", reason: "Monster hand." },
    made_straight_flush_nuts: { label: "Nut Straight Flush", advice: "Slowplay", reason: "Invincible hand. Extract max value." },
    made_straight_flush_lower: { label: "Low Straight Flush", advice: "Caution", reason: "Warning: Higher Straight Flush possible!" },
    made_quads: { label: "Quads", advice: "Slowplay", reason: "Bomb! Losing is extremely rare." },
    made_full_house: { label: "Full House", advice: "Value Bet", reason: "Strong hand. Only loses to bigger boats." },
    made_flush_nuts: { label: "Nut Flush", advice: "Value Bet", reason: "You have the Ace flush. Unbeatable unless board pairs." },
    made_flush: { label: "Flush", advice: "Value/Protect", reason: "Watch out for Ace flush or Full House." },
    made_straight: { label: "Straight", advice: "Attack", reason: "Strong hand. Be careful on flushed boards." },
    monster: { label: "Set/Trips", advice: "Value", reason: "Very strong. Build a big pot!" },

    top_pair: { label: "Top Pair", advice: "Value/Control", reason: "Usually ahead. Don't overplay on wet boards." },
    middle_pair: { label: "Middle Pair", advice: "Check/Bluff-Catch", reason: "Showdown value, but loses to aggression." },
    bottom_pair: { label: "Bottom Pair", advice: "Check/Fold", reason: "Weak showdown value." },
    pocket_pair_below: { label: "Underpair", advice: "Check/Fold", reason: "Easily dominated." },

    flush_draw_nut: { label: "Nut Flush Draw", advice: "Semi-Bluff/All-in", reason: "A-High showdown value + draw." },
    flush_draw: { label: "Flush Draw", advice: "Call/Semi-Bluff", reason: "Good odds to call or raise." },
    straight_draw_oesd: { label: "OESD", advice: "Attack", reason: "8 outs. Strong draw." },
    straight_draw_gutshot: { label: "Gutshot", advice: "Caution", reason: "Only 4 outs. Don't chase." },
    combo_draw: { label: "Combo Draw", advice: "All-in", reason: "Massive equity! Often ahead of made hands." },
    overcards: { label: "Overcards", advice: "Float", reason: "No made hand, but 6 outs." },
    trash: { label: "Trash", advice: "Fold", reason: "No value." }
  }
};

// --- H. 具体纹理特征 (双语版) ---
window.PokerData.TEXTURE_STRATEGIES = {
  zh: {
    TEX_PAIRED: { name: "公对面 (Paired)", desc: "有人可能中三条或葫芦。" },
    TEX_MONOTONE: { name: "单色面 (Monotone)", desc: "极度危险，易有同花。" },
    TEX_TWO_TONE: { name: "听花面 (Two-Tone)", desc: "听牌很多，需保护手牌。" },
    TEX_CONNECTED: { name: "连张面 (Connected)", desc: "顺子可能性大。" },
    TEX_RAINBOW_DRY: { name: "干燥面 (Dry)", desc: "安全，适合诈唬。" }
  },
  en: {
    TEX_PAIRED: { name: "Paired Board", desc: "Trips or Full House possible." },
    TEX_MONOTONE: { name: "Monotone", desc: "Danger! Flush likely made." },
    TEX_TWO_TONE: { name: "Two-Tone", desc: "Heavy draws available. Protect hand." },
    TEX_CONNECTED: { name: "Connected", desc: "Straight possibilities." },
    TEX_RAINBOW_DRY: { name: "Dry/Rainbow", desc: "Safe. Good for bluffing." }
  }
};

// --- I. UI 文本 ---
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
    bet_size_small: '小注 (1/3)',
    bet_size_med: '中注 (2/3)',
    bet_size_large: '满池 (Pot)',
    bet_size_over: '超池 (Overbet)',
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
    segment_side: '边池'
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
    bet_size_small: 'Small (1/3)',
    bet_size_med: 'Med (2/3)',
    bet_size_large: 'Pot',
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
    segment_side: 'Side Pot'
  }
};