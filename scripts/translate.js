// 簡易的な翻訳関数（実際のAPIキーなしで動作する代替案）
const translateText = async (text, targetLang = 'ja') => {
  // 重要なAI用語の辞書
  const aiTerms = {
    'artificial intelligence': '人工知能',
    'machine learning': '機械学習',
    'deep learning': 'ディープラーニング',
    'neural network': 'ニューラルネットワーク',
    'natural language processing': '自然言語処理',
    'computer vision': 'コンピュータビジョン',
    'reinforcement learning': '強化学習',
    'generative ai': '生成AI',
    'large language model': '大規模言語モデル',
    'llm': 'LLM',
    'gpt': 'GPT',
    'transformer': 'トランスフォーマー',
    'chatbot': 'チャットボット',
    'dataset': 'データセット',
    'training': '学習',
    'inference': '推論',
    'model': 'モデル',
    'algorithm': 'アルゴリズム',
    'breakthrough': 'ブレークスルー',
    'research': '研究',
    'paper': '論文',
    'release': 'リリース',
    'update': 'アップデート',
    'announces': '発表',
    'launches': 'ローンチ',
    'introduces': '導入',
    'healthcare': 'ヘルスケア',
    'medical': '医療',
    'diagnosis': '診断',
    'clinical trial': '臨床試験',
    'fda': 'FDA（米国食品医薬品局）',
    'regulation': '規制',
    'policy': '政策',
    'ethics': '倫理',
    'bias': 'バイアス',
    'privacy': 'プライバシー',
    'security': 'セキュリティ',
    'open source': 'オープンソース',
    'api': 'API',
    'cloud': 'クラウド',
    'edge computing': 'エッジコンピューティング',
    'autonomous': '自律的',
    'robotics': 'ロボティクス',
    'quantum computing': '量子コンピューティング',
    'funding': '資金調達',
    'investment': '投資',
    'startup': 'スタートアップ',
    'acquisition': '買収',
    'partnership': 'パートナーシップ',
    'collaboration': 'コラボレーション'
  };

  // 基本的な翻訳（辞書ベース）
  let translatedText = text.toLowerCase();
  
  // AI用語を日本語に置換
  Object.entries(aiTerms).forEach(([en, ja]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translatedText = translatedText.replace(regex, ja);
  });

  // 最初の文字を大文字に
  if (translatedText.length > 0) {
    translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
  }

  return translatedText;
};

// 要約生成関数
const generateSummary = (content, maxLength = 150) => {
  if (!content) return '';
  
  // 改行や余分な空白を削除
  const cleanContent = content.replace(/\s+/g, ' ').trim();
  
  // 最初の文を抽出
  const firstSentence = cleanContent.match(/^[^.!?]+[.!?]/);
  
  if (firstSentence && firstSentence[0].length <= maxLength) {
    return firstSentence[0];
  }
  
  // 文字数制限で切り取る
  if (cleanContent.length > maxLength) {
    return cleanContent.substring(0, maxLength) + '...';
  }
  
  return cleanContent;
};

module.exports = {
  translateText,
  generateSummary
};