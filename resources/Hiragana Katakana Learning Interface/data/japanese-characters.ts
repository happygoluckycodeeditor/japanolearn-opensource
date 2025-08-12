export interface Character {
  character: string;
  reading: string;
  romaji: string;
}

export interface CharacterGroup {
  name: string;
  characters: Character[];
}

export const hiraganaGroups: CharacterGroup[] = [
  {
    name: "Basic Vowels",
    characters: [
      { character: "あ", reading: "あ", romaji: "a" },
      { character: "い", reading: "い", romaji: "i" },
      { character: "う", reading: "う", romaji: "u" },
      { character: "え", reading: "え", romaji: "e" },
      { character: "お", reading: "お", romaji: "o" },
    ]
  },
  {
    name: "K-sounds",
    characters: [
      { character: "か", reading: "か", romaji: "ka" },
      { character: "き", reading: "き", romaji: "ki" },
      { character: "く", reading: "く", romaji: "ku" },
      { character: "け", reading: "け", romaji: "ke" },
      { character: "こ", reading: "こ", romaji: "ko" },
    ]
  },
  {
    name: "S-sounds",
    characters: [
      { character: "さ", reading: "さ", romaji: "sa" },
      { character: "し", reading: "し", romaji: "shi" },
      { character: "す", reading: "す", romaji: "su" },
      { character: "せ", reading: "せ", romaji: "se" },
      { character: "そ", reading: "そ", romaji: "so" },
    ]
  },
  {
    name: "T-sounds",
    characters: [
      { character: "た", reading: "た", romaji: "ta" },
      { character: "ち", reading: "ち", romaji: "chi" },
      { character: "つ", reading: "つ", romaji: "tsu" },
      { character: "て", reading: "て", romaji: "te" },
      { character: "と", reading: "と", romaji: "to" },
    ]
  },
  {
    name: "N-sounds",
    characters: [
      { character: "な", reading: "な", romaji: "na" },
      { character: "に", reading: "に", romaji: "ni" },
      { character: "ぬ", reading: "ぬ", romaji: "nu" },
      { character: "ね", reading: "ね", romaji: "ne" },
      { character: "の", reading: "の", romaji: "no" },
    ]
  }
];

export const katakanaGroups: CharacterGroup[] = [
  {
    name: "Basic Vowels",
    characters: [
      { character: "ア", reading: "ア", romaji: "a" },
      { character: "イ", reading: "イ", romaji: "i" },
      { character: "ウ", reading: "ウ", romaji: "u" },
      { character: "エ", reading: "エ", romaji: "e" },
      { character: "オ", reading: "オ", romaji: "o" },
    ]
  },
  {
    name: "K-sounds",
    characters: [
      { character: "カ", reading: "カ", romaji: "ka" },
      { character: "キ", reading: "キ", romaji: "ki" },
      { character: "ク", reading: "ク", romaji: "ku" },
      { character: "ケ", reading: "ケ", romaji: "ke" },
      { character: "コ", reading: "コ", romaji: "ko" },
    ]
  },
  {
    name: "S-sounds",
    characters: [
      { character: "サ", reading: "サ", romaji: "sa" },
      { character: "シ", reading: "シ", romaji: "shi" },
      { character: "ス", reading: "ス", romaji: "su" },
      { character: "セ", reading: "セ", romaji: "se" },
      { character: "ソ", reading: "ソ", romaji: "so" },
    ]
  },
  {
    name: "T-sounds",
    characters: [
      { character: "タ", reading: "タ", romaji: "ta" },
      { character: "チ", reading: "チ", romaji: "chi" },
      { character: "ツ", reading: "ツ", romaji: "tsu" },
      { character: "テ", reading: "テ", romaji: "te" },
      { character: "ト", reading: "ト", romaji: "to" },
    ]
  },
  {
    name: "N-sounds",
    characters: [
      { character: "ナ", reading: "ナ", romaji: "na" },
      { character: "ニ", reading: "ニ", romaji: "ni" },
      { character: "ヌ", reading: "ヌ", romaji: "nu" },
      { character: "ネ", reading: "ネ", romaji: "ne" },
      { character: "ノ", reading: "ノ", romaji: "no" },
    ]
  }
];