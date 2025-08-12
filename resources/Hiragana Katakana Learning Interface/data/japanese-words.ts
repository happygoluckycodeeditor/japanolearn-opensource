import { Character } from './japanese-characters';

export interface Word {
  word: string;
  reading: string;
  romaji: string;
  meaning: string;
  characters: string[];
}

export interface WordGroup {
  groupName: string;
  words: Word[];
}

export const hiraganaWords: WordGroup[] = [
  {
    groupName: "Basic Vowels",
    words: [
      { word: "あい", reading: "あい", romaji: "ai", meaning: "love", characters: ["あ", "い"] },
      { word: "いえ", reading: "いえ", romaji: "ie", meaning: "house", characters: ["い", "え"] },
      { word: "うえ", reading: "うえ", romaji: "ue", meaning: "above", characters: ["う", "え"] },
      { word: "おい", reading: "おい", romaji: "oi", meaning: "nephew", characters: ["お", "い"] },
      { word: "あお", reading: "あお", romaji: "ao", meaning: "blue", characters: ["あ", "お"] },
    ]
  },
  {
    groupName: "K-sounds",
    words: [
      { word: "あき", reading: "あき", romaji: "aki", meaning: "autumn", characters: ["あ", "き"] },
      { word: "いけ", reading: "いけ", romaji: "ike", meaning: "pond", characters: ["い", "け"] },
      { word: "かお", reading: "かお", romaji: "kao", meaning: "face", characters: ["か", "お"] },
      { word: "きく", reading: "きく", romaji: "kiku", meaning: "to listen", characters: ["き", "く"] },
      { word: "ここ", reading: "ここ", romaji: "koko", meaning: "here", characters: ["こ", "こ"] },
    ]
  },
  {
    groupName: "S-sounds",
    words: [
      { word: "さけ", reading: "さけ", romaji: "sake", meaning: "salmon/alcohol", characters: ["さ", "け"] },
      { word: "しお", reading: "しお", romaji: "shio", meaning: "salt", characters: ["し", "お"] },
      { word: "すし", reading: "すし", romaji: "sushi", meaning: "sushi", characters: ["す", "し"] },
      { word: "そこ", reading: "そこ", romaji: "soko", meaning: "there", characters: ["そ", "こ"] },
      { word: "あさ", reading: "あさ", romaji: "asa", meaning: "morning", characters: ["あ", "さ"] },
    ]
  },
  {
    groupName: "T-sounds",
    words: [
      { word: "たこ", reading: "たこ", romaji: "tako", meaning: "octopus", characters: ["た", "こ"] },
      { word: "ちち", reading: "ちち", romaji: "chichi", meaning: "father", characters: ["ち", "ち"] },
      { word: "つき", reading: "つき", romaji: "tsuki", meaning: "moon", characters: ["つ", "き"] },
      { word: "てつ", reading: "てつ", romaji: "tetsu", meaning: "iron", characters: ["て", "つ"] },
      { word: "とき", reading: "とき", romaji: "toki", meaning: "time", characters: ["と", "き"] },
    ]
  },
  {
    groupName: "N-sounds",
    words: [
      { word: "なつ", reading: "なつ", romaji: "natsu", meaning: "summer", characters: ["な", "つ"] },
      { word: "にく", reading: "にく", romaji: "niku", meaning: "meat", characters: ["に", "く"] },
      { word: "ねこ", reading: "ねこ", romaji: "neko", meaning: "cat", characters: ["ね", "こ"] },
      { word: "のこ", reading: "のこ", romaji: "noko", meaning: "saw", characters: ["の", "こ"] },
      { word: "ぬの", reading: "ぬの", romaji: "nuno", meaning: "cloth", characters: ["ぬ", "の"] },
    ]
  }
];

export const katakanaWords: WordGroup[] = [
  {
    groupName: "Basic Vowels",
    words: [
      { word: "アイス", reading: "アイス", romaji: "aisu", meaning: "ice cream", characters: ["ア", "イ"] },
      { word: "エア", reading: "エア", romaji: "ea", meaning: "air", characters: ["エ", "ア"] },
      { word: "オイル", reading: "オイル", romaji: "oiru", meaning: "oil", characters: ["オ", "イ"] },
    ]
  },
  {
    groupName: "K-sounds",
    words: [
      { word: "カフェ", reading: "カフェ", romaji: "kafe", meaning: "cafe", characters: ["カ"] },
      { word: "キー", reading: "キー", romaji: "kii", meaning: "key", characters: ["キ"] },
      { word: "クイズ", reading: "クイズ", romaji: "kuizu", meaning: "quiz", characters: ["ク"] },
      { word: "ケーキ", reading: "ケーキ", romaji: "keeki", meaning: "cake", characters: ["ケ", "キ"] },
      { word: "コーヒー", reading: "コーヒー", romaji: "koohii", meaning: "coffee", characters: ["コ"] },
    ]
  },
  {
    groupName: "S-sounds",
    words: [
      { word: "サラダ", reading: "サラダ", romaji: "sarada", meaning: "salad", characters: ["サ"] },
      { word: "シャツ", reading: "シャツ", romaji: "shatsu", meaning: "shirt", characters: ["シ"] },
      { word: "スープ", reading: "スープ", romaji: "suupu", meaning: "soup", characters: ["ス"] },
      { word: "セット", reading: "セット", romaji: "setto", meaning: "set", characters: ["セ"] },
      { word: "ソース", reading: "ソース", romaji: "soosu", meaning: "sauce", characters: ["ソ"] },
    ]
  },
  {
    groupName: "T-sounds",
    words: [
      { word: "タクシー", reading: "タクシー", romaji: "takushii", meaning: "taxi", characters: ["タ"] },
      { word: "チーム", reading: "チーム", romaji: "chiimu", meaning: "team", characters: ["チ"] },
      { word: "ツアー", reading: "ツアー", romaji: "tsuaa", meaning: "tour", characters: ["ツ"] },
      { word: "テスト", reading: "テスト", romaji: "tesuto", meaning: "test", characters: ["テ"] },
      { word: "トップ", reading: "トップ", romaji: "toppu", meaning: "top", characters: ["ト"] },
    ]
  },
  {
    groupName: "N-sounds",
    words: [
      { word: "ナイフ", reading: "ナイフ", romaji: "naifu", meaning: "knife", characters: ["ナ"] },
      { word: "ニュース", reading: "ニュース", romaji: "nyuusu", meaning: "news", characters: ["ニ"] },
      { word: "ヌードル", reading: "ヌードル", romaji: "nuudoru", meaning: "noodle", characters: ["ヌ"] },
      { word: "ネット", reading: "ネット", romaji: "netto", meaning: "net", characters: ["ネ"] },
      { word: "ノート", reading: "ノート", romaji: "nooto", meaning: "notebook", characters: ["ノ"] },
    ]
  }
];