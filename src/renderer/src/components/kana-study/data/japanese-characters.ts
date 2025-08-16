export interface Character {
  character: string
  reading: string
  romaji: string
}

export interface CharacterGroup {
  name: string
  characters: Character[]
}

export const hiraganaGroups: CharacterGroup[] = [
  {
    name: 'Basic Vowels',
    characters: [
      { character: 'あ', reading: 'あ', romaji: 'a' },
      { character: 'い', reading: 'い', romaji: 'i' },
      { character: 'う', reading: 'う', romaji: 'u' },
      { character: 'え', reading: 'え', romaji: 'e' },
      { character: 'お', reading: 'お', romaji: 'o' }
    ]
  },
  {
    name: 'K-sounds',
    characters: [
      { character: 'か', reading: 'か', romaji: 'ka' },
      { character: 'き', reading: 'き', romaji: 'ki' },
      { character: 'く', reading: 'く', romaji: 'ku' },
      { character: 'け', reading: 'け', romaji: 'ke' },
      { character: 'こ', reading: 'こ', romaji: 'ko' }
    ]
  },
  {
    name: 'S-sounds',
    characters: [
      { character: 'さ', reading: 'さ', romaji: 'sa' },
      { character: 'し', reading: 'し', romaji: 'shi' },
      { character: 'す', reading: 'す', romaji: 'su' },
      { character: 'せ', reading: 'せ', romaji: 'se' },
      { character: 'そ', reading: 'そ', romaji: 'so' }
    ]
  },
  {
    name: 'T-sounds',
    characters: [
      { character: 'た', reading: 'た', romaji: 'ta' },
      { character: 'ち', reading: 'ち', romaji: 'chi' },
      { character: 'つ', reading: 'つ', romaji: 'tsu' },
      { character: 'て', reading: 'て', romaji: 'te' },
      { character: 'と', reading: 'と', romaji: 'to' }
    ]
  },
  {
    name: 'N-sounds',
    characters: [
      { character: 'な', reading: 'な', romaji: 'na' },
      { character: 'に', reading: 'に', romaji: 'ni' },
      { character: 'ぬ', reading: 'ぬ', romaji: 'nu' },
      { character: 'ね', reading: 'ね', romaji: 'ne' },
      { character: 'の', reading: 'の', romaji: 'no' }
    ]
  },
  {
    name: 'H-sounds',
    characters: [
      { character: 'は', reading: 'は', romaji: 'ha' },
      { character: 'ひ', reading: 'ひ', romaji: 'hi' },
      { character: 'ふ', reading: 'ふ', romaji: 'fu' },
      { character: 'へ', reading: 'へ', romaji: 'he' },
      { character: 'ほ', reading: 'ほ', romaji: 'ho' }
    ]
  },
  {
    name: 'M-sounds',
    characters: [
      { character: 'ま', reading: 'ま', romaji: 'ma' },
      { character: 'み', reading: 'み', romaji: 'mi' },
      { character: 'む', reading: 'む', romaji: 'mu' },
      { character: 'め', reading: 'め', romaji: 'me' },
      { character: 'も', reading: 'も', romaji: 'mo' }
    ]
  },
  {
    name: 'Y-sounds',
    characters: [
      { character: 'や', reading: 'や', romaji: 'ya' },
      { character: 'ゆ', reading: 'ゆ', romaji: 'yu' },
      { character: 'よ', reading: 'よ', romaji: 'yo' }
    ]
  },
  {
    name: 'R-sounds',
    characters: [
      { character: 'ら', reading: 'ら', romaji: 'ra' },
      { character: 'り', reading: 'り', romaji: 'ri' },
      { character: 'る', reading: 'る', romaji: 'ru' },
      { character: 'れ', reading: 'れ', romaji: 're' },
      { character: 'ろ', reading: 'ろ', romaji: 'ro' }
    ]
  },
  {
    name: 'W-sounds',
    characters: [
      { character: 'わ', reading: 'わ', romaji: 'wa' },
      { character: 'を', reading: 'を', romaji: 'wo' }
    ]
  },
  {
    name: 'N-sound',
    characters: [{ character: 'ん', reading: 'ん', romaji: 'n' }]
  },
  {
    name: 'G-sounds (Dakuten)',
    characters: [
      { character: 'が', reading: 'が', romaji: 'ga' },
      { character: 'ぎ', reading: 'ぎ', romaji: 'gi' },
      { character: 'ぐ', reading: 'ぐ', romaji: 'gu' },
      { character: 'げ', reading: 'げ', romaji: 'ge' },
      { character: 'ご', reading: 'ご', romaji: 'go' }
    ]
  },
  {
    name: 'Z-sounds (Dakuten)',
    characters: [
      { character: 'ざ', reading: 'ざ', romaji: 'za' },
      { character: 'じ', reading: 'じ', romaji: 'ji' },
      { character: 'ず', reading: 'ず', romaji: 'zu' },
      { character: 'ぜ', reading: 'ぜ', romaji: 'ze' },
      { character: 'ぞ', reading: 'ぞ', romaji: 'zo' }
    ]
  },
  {
    name: 'D-sounds (Dakuten)',
    characters: [
      { character: 'だ', reading: 'だ', romaji: 'da' },
      { character: 'ぢ', reading: 'ぢ', romaji: 'di' },
      { character: 'づ', reading: 'づ', romaji: 'du' },
      { character: 'で', reading: 'で', romaji: 'de' },
      { character: 'ど', reading: 'ど', romaji: 'do' }
    ]
  },
  {
    name: 'B-sounds (Dakuten)',
    characters: [
      { character: 'ば', reading: 'ば', romaji: 'ba' },
      { character: 'び', reading: 'び', romaji: 'bi' },
      { character: 'ぶ', reading: 'ぶ', romaji: 'bu' },
      { character: 'べ', reading: 'べ', romaji: 'be' },
      { character: 'ぼ', reading: 'ぼ', romaji: 'bo' }
    ]
  },
  {
    name: 'P-sounds (Handakuten)',
    characters: [
      { character: 'ぱ', reading: 'ぱ', romaji: 'pa' },
      { character: 'ぴ', reading: 'ぴ', romaji: 'pi' },
      { character: 'ぷ', reading: 'ぷ', romaji: 'pu' },
      { character: 'ぺ', reading: 'ぺ', romaji: 'pe' },
      { character: 'ぽ', reading: 'ぽ', romaji: 'po' }
    ]
  }
]

export const katakanaGroups: CharacterGroup[] = [
  {
    name: 'Basic Vowels',
    characters: [
      { character: 'ア', reading: 'ア', romaji: 'a' },
      { character: 'イ', reading: 'イ', romaji: 'i' },
      { character: 'ウ', reading: 'ウ', romaji: 'u' },
      { character: 'エ', reading: 'エ', romaji: 'e' },
      { character: 'オ', reading: 'オ', romaji: 'o' }
    ]
  },
  {
    name: 'K-sounds',
    characters: [
      { character: 'カ', reading: 'カ', romaji: 'ka' },
      { character: 'キ', reading: 'キ', romaji: 'ki' },
      { character: 'ク', reading: 'ク', romaji: 'ku' },
      { character: 'ケ', reading: 'ケ', romaji: 'ke' },
      { character: 'コ', reading: 'コ', romaji: 'ko' }
    ]
  },
  {
    name: 'S-sounds',
    characters: [
      { character: 'サ', reading: 'サ', romaji: 'sa' },
      { character: 'シ', reading: 'シ', romaji: 'shi' },
      { character: 'ス', reading: 'ス', romaji: 'su' },
      { character: 'セ', reading: 'セ', romaji: 'se' },
      { character: 'ソ', reading: 'ソ', romaji: 'so' }
    ]
  },
  {
    name: 'T-sounds',
    characters: [
      { character: 'タ', reading: 'タ', romaji: 'ta' },
      { character: 'チ', reading: 'チ', romaji: 'chi' },
      { character: 'ツ', reading: 'ツ', romaji: 'tsu' },
      { character: 'テ', reading: 'テ', romaji: 'te' },
      { character: 'ト', reading: 'ト', romaji: 'to' }
    ]
  },
  {
    name: 'N-sounds',
    characters: [
      { character: 'ナ', reading: 'ナ', romaji: 'na' },
      { character: 'ニ', reading: 'ニ', romaji: 'ni' },
      { character: 'ヌ', reading: 'ヌ', romaji: 'nu' },
      { character: 'ネ', reading: 'ネ', romaji: 'ne' },
      { character: 'ノ', reading: 'ノ', romaji: 'no' }
    ]
  },
  {
    name: 'H-sounds',
    characters: [
      { character: 'ハ', reading: 'ハ', romaji: 'ha' },
      { character: 'ヒ', reading: 'ヒ', romaji: 'hi' },
      { character: 'フ', reading: 'フ', romaji: 'fu' },
      { character: 'ヘ', reading: 'ヘ', romaji: 'he' },
      { character: 'ホ', reading: 'ホ', romaji: 'ho' }
    ]
  },
  {
    name: 'M-sounds',
    characters: [
      { character: 'マ', reading: 'マ', romaji: 'ma' },
      { character: 'ミ', reading: 'ミ', romaji: 'mi' },
      { character: 'ム', reading: 'ム', romaji: 'mu' },
      { character: 'メ', reading: 'メ', romaji: 'me' },
      { character: 'モ', reading: 'モ', romaji: 'mo' }
    ]
  },
  {
    name: 'Y-sounds',
    characters: [
      { character: 'ヤ', reading: 'ヤ', romaji: 'ya' },
      { character: 'ユ', reading: 'ユ', romaji: 'yu' },
      { character: 'ヨ', reading: 'ヨ', romaji: 'yo' }
    ]
  },
  {
    name: 'R-sounds',
    characters: [
      { character: 'ラ', reading: 'ラ', romaji: 'ra' },
      { character: 'リ', reading: 'リ', romaji: 'ri' },
      { character: 'ル', reading: 'ル', romaji: 'ru' },
      { character: 'レ', reading: 'レ', romaji: 're' },
      { character: 'ロ', reading: 'ロ', romaji: 'ro' }
    ]
  },
  {
    name: 'W-sounds',
    characters: [
      { character: 'ワ', reading: 'ワ', romaji: 'wa' },
      { character: 'ヲ', reading: 'ヲ', romaji: 'wo' }
    ]
  },
  {
    name: 'N-sound',
    characters: [{ character: 'ン', reading: 'ン', romaji: 'n' }]
  },
  {
    name: 'G-sounds (Dakuten)',
    characters: [
      { character: 'ガ', reading: 'ガ', romaji: 'ga' },
      { character: 'ギ', reading: 'ギ', romaji: 'gi' },
      { character: 'グ', reading: 'グ', romaji: 'gu' },
      { character: 'ゲ', reading: 'ゲ', romaji: 'ge' },
      { character: 'ゴ', reading: 'ゴ', romaji: 'go' }
    ]
  },
  {
    name: 'Z-sounds (Dakuten)',
    characters: [
      { character: 'ザ', reading: 'ザ', romaji: 'za' },
      { character: 'ジ', reading: 'ジ', romaji: 'ji' },
      { character: 'ズ', reading: 'ズ', romaji: 'zu' },
      { character: 'ゼ', reading: 'ゼ', romaji: 'ze' },
      { character: 'ゾ', reading: 'ゾ', romaji: 'zo' }
    ]
  },
  {
    name: 'D-sounds (Dakuten)',
    characters: [
      { character: 'ダ', reading: 'ダ', romaji: 'da' },
      { character: 'ヂ', reading: 'ヂ', romaji: 'di' },
      { character: 'ヅ', reading: 'ヅ', romaji: 'du' },
      { character: 'デ', reading: 'デ', romaji: 'de' },
      { character: 'ド', reading: 'ド', romaji: 'do' }
    ]
  },
  {
    name: 'B-sounds (Dakuten)',
    characters: [
      { character: 'バ', reading: 'バ', romaji: 'ba' },
      { character: 'ビ', reading: 'ビ', romaji: 'bi' },
      { character: 'ブ', reading: 'ブ', romaji: 'bu' },
      { character: 'ベ', reading: 'ベ', romaji: 'be' },
      { character: 'ボ', reading: 'ボ', romaji: 'bo' }
    ]
  },
  {
    name: 'P-sounds (Handakuten)',
    characters: [
      { character: 'パ', reading: 'パ', romaji: 'pa' },
      { character: 'ピ', reading: 'ピ', romaji: 'pi' },
      { character: 'プ', reading: 'プ', romaji: 'pu' },
      { character: 'ペ', reading: 'ペ', romaji: 'pe' },
      { character: 'ポ', reading: 'ポ', romaji: 'po' }
    ]
  }
]
