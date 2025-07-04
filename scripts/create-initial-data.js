const fs = require('fs');

// 初期ニュースデータ
const initialNews = {
  "lastUpdated": new Date().toISOString(),
  "articles": [
    {
      "id": "init-1",
      "title": "OpenAI Announces GPT-5 Development Milestone",
      "titleJa": "OpenAI、GPT-5開発のマイルストーンを発表",
      "summary": "OpenAI has reached a significant milestone in the development of GPT-5, with enhanced reasoning capabilities and multimodal understanding.",
      "summaryJa": "OpenAIは、強化された推論能力とマルチモーダル理解を備えたGPT-5の開発において重要なマイルストーンに到達しました。",
      "source": "AI News Today",
      "category": "openai",
      "importance": 95,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      "link": "https://example.com/openai-gpt5"
    },
    {
      "id": "init-2",
      "title": "Google Unveils Advanced AI Video Generation Model",
      "titleJa": "Google、高度なAI動画生成モデルを発表",
      "summary": "Google has announced a breakthrough in AI video generation technology that can create realistic videos from text descriptions.",
      "summaryJa": "Googleは、テキストの説明からリアルな動画を作成できるAI動画生成技術のブレークスルーを発表しました。",
      "source": "Tech Chronicle",
      "category": "video_generation",
      "importance": 90,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      "link": "https://example.com/google-video-ai"
    },
    {
      "id": "init-3",
      "title": "Anthropic Introduces Claude 3.5 with Enhanced Coding Abilities",
      "titleJa": "Anthropic、コーディング能力を強化したClaude 3.5を発表",
      "summary": "Claude 3.5 brings significant improvements in code generation, debugging, and software architecture design.",
      "summaryJa": "Claude 3.5は、コード生成、デバッグ、ソフトウェアアーキテクチャ設計において大幅な改善をもたらします。",
      "source": "Developer Weekly",
      "category": "code_generation",
      "importance": 88,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      "link": "https://example.com/claude-35"
    },
    {
      "id": "init-4",
      "title": "Microsoft Copilot Expands to New Office Applications",
      "titleJa": "Microsoft Copilot、新しいOfficeアプリケーションに拡張",
      "summary": "Microsoft announces Copilot integration across all Office 365 applications with advanced AI assistance features.",
      "summaryJa": "Microsoftは、高度なAI支援機能を備えたCopilotの全Office 365アプリケーションへの統合を発表しました。",
      "source": "Business Tech News",
      "category": "microsoft",
      "importance": 85,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      "link": "https://example.com/copilot-expansion"
    },
    {
      "id": "init-5",
      "title": "NVIDIA Releases New AI Chip for Edge Computing",
      "titleJa": "NVIDIA、エッジコンピューティング向け新AIチップをリリース",
      "summary": "NVIDIA's latest chip brings powerful AI processing capabilities to edge devices with unprecedented efficiency.",
      "summaryJa": "NVIDIAの最新チップは、前例のない効率でエッジデバイスに強力なAI処理機能をもたらします。",
      "source": "Hardware Insider",
      "category": "nvidia",
      "importance": 82,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      "link": "https://example.com/nvidia-edge"
    },
    {
      "id": "init-6",
      "title": "Breakthrough in AI-Powered Medical Diagnosis",
      "titleJa": "AI駆動の医療診断におけるブレークスルー",
      "summary": "New AI system achieves 98% accuracy in early cancer detection, surpassing human specialists.",
      "summaryJa": "新しいAIシステムが早期がん検出で98%の精度を達成し、人間の専門家を上回りました。",
      "source": "Medical AI Journal",
      "category": "healthcare",
      "importance": 93,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      "link": "https://example.com/ai-medical"
    },
    {
      "id": "init-7",
      "title": "Meta Launches Open-Source Multimodal AI Model",
      "titleJa": "Meta、オープンソースのマルチモーダルAIモデルを発表",
      "summary": "Meta's new model combines vision, language, and audio understanding in a single open-source framework.",
      "summaryJa": "Metaの新モデルは、視覚、言語、音声理解を単一のオープンソースフレームワークで組み合わせています。",
      "source": "Open Source AI",
      "category": "multimodal",
      "importance": 87,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      "link": "https://example.com/meta-multimodal"
    },
    {
      "id": "init-8",
      "title": "AI Agents Revolutionize Customer Service Industry",
      "titleJa": "AIエージェントが顧客サービス業界に革命をもたらす",
      "summary": "Advanced AI agents now handle complex customer queries with 95% satisfaction rates.",
      "summaryJa": "高度なAIエージェントが複雑な顧客の問い合わせを95%の満足度で処理するようになりました。",
      "source": "Business Innovation",
      "category": "agents",
      "importance": 80,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
      "link": "https://example.com/ai-agents"
    },
    {
      "id": "init-9",
      "title": "New Research: AI Models Show Emergent Reasoning Abilities",
      "titleJa": "新研究：AIモデルが創発的推論能力を示す",
      "summary": "Stanford researchers discover unexpected reasoning capabilities in large language models.",
      "summaryJa": "スタンフォード大学の研究者が、大規模言語モデルに予期しない推論能力を発見しました。",
      "source": "AI Research Quarterly",
      "category": "research",
      "importance": 91,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      "link": "https://example.com/ai-reasoning"
    },
    {
      "id": "init-10",
      "title": "AI Music Generation Reaches Professional Quality",
      "titleJa": "AI音楽生成がプロフェッショナル品質に到達",
      "summary": "Latest AI models can now compose and produce music indistinguishable from human-created tracks.",
      "summaryJa": "最新のAIモデルは、人間が作成したトラックと区別できない音楽を作曲・制作できるようになりました。",
      "source": "Creative AI Weekly",
      "category": "music_generation",
      "importance": 78,
      "pubDate": new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      "link": "https://example.com/ai-music"
    }
  ]
};

// data ディレクトリを作成
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// news.json ファイルを作成
fs.writeFileSync('data/news.json', JSON.stringify(initialNews, null, 2));

console.log('Created initial news data with', initialNews.articles.length, 'articles');
console.log('File saved to: data/news.json');