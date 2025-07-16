import { KanaCharacter } from './types'

// Hiragana character data with mnemonics
const hiraganaCharacters: KanaCharacter[] = [
  // Vowels (a, i, u, e, o)
  {
    kana: 'あ',
    romaji: 'a',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like a woman with long hair saying "Ah!"',
      emoji: '👩'
    }
  },
  {
    kana: 'い',
    romaji: 'i',
    group: 'vowels',
    mnemonic: {
      description: 'Two vertical lines like the letter "i" without dots',
      emoji: '📏'
    }
  },
  {
    kana: 'う',
    romaji: 'u',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like a cow saying "moo" (sounds like "u")',
      emoji: '🐄'
    }
  },
  {
    kana: 'え',
    romaji: 'e',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like an exotic bird with a long neck',
      emoji: ''
    }
  },
  {
    kana: 'お',
    romaji: 'o',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like a cheerleader with pom-poms saying "Oh!"',
      emoji: '📣'
    }
  },
  // K-row (ka, ki, ku, ke, ko)
  {
    kana: 'か',
    romaji: 'ka',
    group: 'k-row',
    mnemonic: {
      description: 'Looks like a key (ka-key) opening a lock',
      emoji: '🔑'
    }
  },
  {
    kana: 'き',
    romaji: 'ki',
    group: 'k-row',
    mnemonic: {
      description: 'Looks like a key (ki) with a round head',
      emoji: '🗝️'
    }
  },
  {
    kana: 'く',
    romaji: 'ku',
    group: 'k-row',
    mnemonic: {
      description: 'Looks like a cuckoo bird\'s beak saying "ku-ku"',
      emoji: '🐦'
    }
  },
  {
    kana: 'け',
    romaji: 'ke',
    group: 'k-row',
    mnemonic: {
      description: 'Looks like a keg (ke-g) of beer on its side',
      emoji: '🍺'
    }
  },
  {
    kana: 'こ',
    romaji: 'ko',
    group: 'k-row',
    mnemonic: {
      description: 'Looks like a corkscrew (ko-rkscrew)',
      emoji: '🍷'
    }
  },
  // S-row (sa, shi, su, se, so)
  {
    kana: 'さ',
    romaji: 'sa',
    group: 's-row',
    mnemonic: {
      description: 'Looks like a samurai (sa-murai) with a sword',
      emoji: '⚔️'
    }
  },
  {
    kana: 'し',
    romaji: 'shi',
    group: 's-row',
    mnemonic: {
      description: 'Looks like a fishing hook catching a fish (shi-sh)',
      emoji: '🎣'
    }
  },
  {
    kana: 'す',
    romaji: 'su',
    group: 's-row',
    mnemonic: {
      description: 'Looks like a swing (su-wing) hanging from a tree',
      emoji: '🌳'
    }
  },
  {
    kana: 'せ',
    romaji: 'se',
    group: 's-row',
    mnemonic: {
      description: 'Looks like a snake (se-rpent) slithering',
      emoji: '🐍'
    }
  },
  {
    kana: 'そ',
    romaji: 'so',
    group: 's-row',
    mnemonic: {
      description: 'Looks like a sewing (so-wing) needle and thread',
      emoji: '🪡'
    }
  },
  // T-sounds (ta, chi, tsu, te, to)
  {
    kana: 'た',
    romaji: 'ta',
    group: 't-sounds',
    mnemonic: {
      description: 'Looks like a person doing tai chi (ta-i chi)',
      emoji: '🧘'
    }
  },
  {
    kana: 'ち',
    romaji: 'chi',
    group: 't-sounds',
    mnemonic: {
      description: 'Looks like a cheerleader (chi-erleader) with pom-poms',
      emoji: '📣'
    }
  },
  {
    kana: 'つ',
    romaji: 'tsu',
    group: 't-sounds',
    mnemonic: {
      description: 'Looks like a tsunami (tsu-nami) wave',
      emoji: '🌊'
    }
  },
  {
    kana: 'て',
    romaji: 'te',
    group: 't-sounds',
    mnemonic: {
      description: 'Looks like a telephone (te-lephone) pole',
      emoji: '📞'
    }
  },
  {
    kana: 'と',
    romaji: 'to',
    group: 't-sounds',
    mnemonic: {
      description: 'Looks like a tornado (to-rnado) spinning',
      emoji: '🌪️'
    }
  },

  // N-sounds (na, ni, nu, ne, no)
  {
    kana: 'な',
    romaji: 'na',
    group: 'n-sounds',
    mnemonic: {
      description: 'Looks like a knot (na-ot) in a rope',
      emoji: '🪢'
    }
  },
  {
    kana: 'に',
    romaji: 'ni',
    group: 'n-sounds',
    mnemonic: {
      description: 'Looks like a needle (ni-edle) and thread',
      emoji: '🪡'
    }
  },
  {
    kana: 'ぬ',
    romaji: 'nu',
    group: 'n-sounds',
    mnemonic: {
      description: 'Looks like noodles (nu-dles) on chopsticks',
      emoji: '🍜'
    }
  },
  {
    kana: 'ね',
    romaji: 'ne',
    group: 'n-sounds',
    mnemonic: {
      description: 'Looks like a cat\'s tail saying "neko" (ne-ko)',
      emoji: '🐱'
    }
  },
  {
    kana: 'の',
    romaji: 'no',
    group: 'n-sounds',
    mnemonic: {
      description: 'Looks like a "no" sign - a circle with a line through it',
      emoji: '🚫'
    }
  },

  // H-sounds (ha, hi, fu, he, ho)
  {
    kana: 'は',
    romaji: 'ha',
    group: 'h-sounds',
    mnemonic: {
      description: 'Looks like a house (ha-use) with a chimney',
      emoji: '🏠'
    }
  },
  {
    kana: 'ひ',
    romaji: 'hi',
    group: 'h-sounds',
    mnemonic: {
      description: 'Looks like a person saying "hi" with raised arms',
      emoji: '👋'
    }
  },
  {
    kana: 'ふ',
    romaji: 'fu',
    group: 'h-sounds',
    mnemonic: {
      description: 'Looks like Mount Fuji (fu-ji) with snow on top',
      emoji: '🗻'
    }
  },
  {
    kana: 'へ',
    romaji: 'he',
    group: 'h-sounds',
    mnemonic: {
      description: "Looks like a hat (he-at) sitting on someone's head",
      emoji: '👒'
    }
  },
  {
    kana: 'ほ',
    romaji: 'ho',
    group: 'h-sounds',
    mnemonic: {
      description: 'Looks like a house (ho-use) with a cross on top',
      emoji: '⛪'
    }
  },

  // M-sounds (ma, mi, mu, me, mo)
  {
    kana: 'ま',
    romaji: 'ma',
    group: 'm-sounds',
    mnemonic: {
      description: 'Looks like a mama (ma-ma) with flowing hair',
      emoji: '👩‍👧'
    }
  },
  {
    kana: 'み',
    romaji: 'mi',
    group: 'm-sounds',
    mnemonic: {
      description: 'Looks like the number 21 (mi sounds like "me")',
      emoji: '2️⃣1️⃣'
    }
  },
  {
    kana: 'む',
    romaji: 'mu',
    group: 'm-sounds',
    mnemonic: {
      description: 'Looks like a cow saying "moo" (mu)',
      emoji: '🐄'
    }
  },
  {
    kana: 'め',
    romaji: 'me',
    group: 'm-sounds',
    mnemonic: {
      description: 'Looks like an eye (me-ye) with long eyelashes',
      emoji: '👁️'
    }
  },
  {
    kana: 'も',
    romaji: 'mo',
    group: 'm-sounds',
    mnemonic: {
      description: 'Looks like a fishing hook catching more (mo-re) fish',
      emoji: '🎣'
    }
  },

  // Y-sounds (ya, yu, yo)
  {
    kana: 'や',
    romaji: 'ya',
    group: 'y-sounds',
    mnemonic: {
      description: 'Looks like a yacht (ya-cht) sailing on water',
      emoji: '⛵'
    }
  },
  {
    kana: 'ゆ',
    romaji: 'yu',
    group: 'y-sounds',
    mnemonic: {
      description: 'Looks like a fish hook, and "yu" sounds like "you"',
      emoji: '🎣'
    }
  },
  {
    kana: 'よ',
    romaji: 'yo',
    group: 'y-sounds',
    mnemonic: {
      description: 'Looks like a yo-yo on a string',
      emoji: '🪀'
    }
  },

  // R-sounds (ra, ri, ru, re, ro)
  {
    kana: 'ら',
    romaji: 'ra',
    group: 'r-sounds',
    mnemonic: {
      description: 'Looks like a rabbit (ra-bbit) with long ears',
      emoji: '🐰'
    }
  },
  {
    kana: 'り',
    romaji: 'ri',
    group: 'r-sounds',
    mnemonic: {
      description: 'Looks like a river (ri-ver) flowing down',
      emoji: '🏞️'
    }
  },
  {
    kana: 'る',
    romaji: 'ru',
    group: 'r-sounds',
    mnemonic: {
      description: 'Looks like a loop or route (ru-te) going around',
      emoji: '🔄'
    }
  },
  {
    kana: 'れ',
    romaji: 're',
    group: 'r-sounds',
    mnemonic: {
      description: 'Looks like a person kneeling and saying "respect" (re-spect)',
      emoji: '🙏'
    }
  },
  {
    kana: 'ろ',
    romaji: 'ro',
    group: 'r-sounds',
    mnemonic: {
      description: 'Looks like a road (ro-ad) with a curve',
      emoji: '🛣️'
    }
  },

  // W-sounds and N
  {
    kana: 'わ',
    romaji: 'wa',
    group: 'w-sounds',
    mnemonic: {
      description: 'Looks like a woman (wa-man) in a dress',
      emoji: '👗'
    }
  },
  {
    kana: 'を',
    romaji: 'wo',
    group: 'w-sounds',
    mnemonic: {
      description: 'Looks like a whirlpool (wo-rlpool) spinning',
      emoji: '🌀'
    }
  },
  {
    kana: 'ん',
    romaji: 'n',
    group: 'n-final',
    mnemonic: {
      description: "Looks like a person's nose (n-ose) in profile",
      emoji: '👃'
    }
  }
]

// Katakana character data with mnemonics
const katakanaCharacters: KanaCharacter[] = [
  // Vowels (a, i, u, e, o)
  {
    kana: 'ア',
    romaji: 'a',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like an antenna (a-ntenna) on a roof',
      emoji: '📡'
    }
  },
  {
    kana: 'イ',
    romaji: 'i',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like two eagles (i-gles) flying',
      emoji: '🦅'
    }
  },
  {
    kana: 'ウ',
    romaji: 'u',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like a person saying "ooh" (u) with surprise',
      emoji: '😮'
    }
  },
  {
    kana: 'エ',
    romaji: 'e',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like an exotic bird with a long neck',
      emoji: '🦢'
    }
  },
  {
    kana: 'オ',
    romaji: 'o',
    group: 'vowels',
    mnemonic: {
      description: 'Looks like a cheerleader with pom-poms saying "Oh!"',
      emoji: '📣'
    }
  },
  // K-row (ka, ki, ku, ke, ko)
  {
    kana: 'カ',
    romaji: 'ka',
    group: 'k-row',
    mnemonic: { emoji: '', description: 'A key - sounds like "key"' },
    examples: [
      { word: 'きのう', meaning: 'yesterday', emoji: '' },
      { word: 'きれい', meaning: 'beautiful', emoji: '✨' }
    ]
  },
  {
    kana: 'キ',
    romaji: 'ki',
    group: 'k-row',
    mnemonic: { emoji: '🔑', description: 'A key - sounds like "key"' },
    examples: [
      { word: 'きのう', meaning: 'yesterday', emoji: '📅' },
      { word: 'きれい', meaning: 'beautiful', emoji: '✨' }
    ]
  },
  {
    kana: 'ク',
    romaji: 'ku',
    group: 'k-row',
    mnemonic: { emoji: '🍪', description: 'A cookie - "ku" sound' },
    examples: [
      { word: 'くるま', meaning: 'car', emoji: '🚙' },
      { word: 'くも', meaning: 'cloud', emoji: '☁️' }
    ]
  },
  {
    kana: 'ケ',
    romaji: 'ke',
    group: 'k-row',
    mnemonic: { emoji: '🎂', description: 'A cake - "ke" sound' },
    examples: [
      { word: 'けさ', meaning: 'this morning', emoji: '🌄' },
      { word: 'けいたい', meaning: 'mobile phone', emoji: '📱' }
    ]
  },
  {
    kana: 'コ',
    romaji: 'ko',
    group: 'k-row',
    mnemonic: { emoji: '☕', description: 'Coffee - "ko" sound' },
    examples: [
      { word: 'ここ', meaning: 'here', emoji: '📍' },
      { word: 'こども', meaning: 'child', emoji: '👶' }
    ]
  },
  // S-row (sa, shi, su, se, so)
  {
    kana: 'サ',
    romaji: 'sa',
    group: 's-row',
    mnemonic: { emoji: '🌸', description: 'Sakura - starts with "sa"' },
    examples: [
      { word: 'さくら', meaning: 'cherry blossom', emoji: '🌸' },
      { word: 'さかな', meaning: 'fish', emoji: '🐟' }
    ]
  },
  {
    kana: 'シ',
    romaji: 'shi',
    group: 's-row',
    mnemonic: { emoji: '🐚', description: 'A shell - "shi" sound' },
    examples: [
      { word: 'しお', meaning: 'salt', emoji: '🧂' },
      { word: 'しんぶん', meaning: 'newspaper', emoji: '📰' }
    ]
  },
  {
    kana: 'ス',
    romaji: 'su',
    group: 's-row',
    mnemonic: { emoji: '🍣', description: 'Sushi - starts with "su"' },
    examples: [
      { word: 'すし', meaning: 'sushi', emoji: '🍣' },
      { word: 'すいか', meaning: 'watermelon', emoji: '🍉' }
    ]
  },
  {
    kana: 'セ',
    romaji: 'se',
    group: 's-row',
    mnemonic: { emoji: '🌱', description: 'A seed - "se" sound' },
    examples: [
      { word: 'せんせい', meaning: 'teacher', emoji: '👨‍🏫' },
      { word: 'せかい', meaning: 'world', emoji: '🌍' }
    ]
  },
  {
    kana: 'ソ',
    romaji: 'so',
    group: 's-row',
    mnemonic: { emoji: '🧦', description: 'A sock - "so" sound' },
    examples: [
      { word: 'そら', meaning: 'sky', emoji: '☁️' },
      { word: 'そば', meaning: 'noodles', emoji: '🍜' }
    ]
  }
  // Add more characters as needed...
]

export const katakanaData: KanaCharacter[] = [
  // Similar structure for katakana with different mnemonics
  {
    kana: 'ア',
    romaji: 'a',
    group: 'vowels',
    mnemonic: { emoji: '🏹', description: 'An arrow pointing up - "a" sound' },
    examples: [
      { word: 'アメリカ', meaning: 'America', emoji: '🇺🇸' },
      { word: 'アイス', meaning: 'ice cream', emoji: '🍦' }
    ]
  }
  // ... more katakana characters
]

export const kanaGroups = {
  hiragana: [
    {
      id: 'vowels',
      name: 'Vowels (あいうえお)',
      characters: hiraganaCharacters.filter((k) => k.group === 'vowels')
    },
    {
      id: 'k-row',
      name: 'K-row (かきくけこ)',
      characters: hiraganaCharacters.filter((k) => k.group === 'k-row')
    },
    {
      id: 's-row',
      name: 'S-row (さしすせそ)',
      characters: hiraganaCharacters.filter((k) => k.group === 's-row')
    }
    // Add more groups...
  ],
  katakana: [
    {
      id: 'vowels',
      name: 'Vowels (アイウエオ)',
      characters: katakanaCharacters.filter((k) => k.group === 'vowels')
    }
    // Add more groups...
  ]
}
