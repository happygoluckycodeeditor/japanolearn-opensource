export interface Word {
  word: string
  reading: string
  romaji: string
  meaning: string
  characters: string[]
}

export interface WordGroup {
  groupName: string
  words: Word[]
}

export const hiraganaWords: WordGroup[] = [
  {
    groupName: 'Basic Vowels',
    words: [
      { word: 'あい', reading: 'あい', romaji: 'ai', meaning: 'love', characters: ['あ', 'い'] },
      { word: 'いえ', reading: 'いえ', romaji: 'ie', meaning: 'house', characters: ['い', 'え'] },
      { word: 'うえ', reading: 'うえ', romaji: 'ue', meaning: 'above', characters: ['う', 'え'] },
      { word: 'おい', reading: 'おい', romaji: 'oi', meaning: 'nephew', characters: ['お', 'い'] },
      { word: 'あお', reading: 'あお', romaji: 'ao', meaning: 'blue', characters: ['あ', 'お'] },
      { word: 'いう', reading: 'いう', romaji: 'iu', meaning: 'to say', characters: ['い', 'う'] },
      { word: 'うお', reading: 'うお', romaji: 'uo', meaning: 'fish', characters: ['う', 'お'] },
      {
        word: 'えい',
        reading: 'えい',
        romaji: 'ei',
        meaning: 'ray (fish)',
        characters: ['え', 'い']
      },
      { word: 'おう', reading: 'おう', romaji: 'ou', meaning: 'king', characters: ['お', 'う'] }
    ]
  },
  {
    groupName: 'K-sounds',
    words: [
      { word: 'あき', reading: 'あき', romaji: 'aki', meaning: 'autumn', characters: ['あ', 'き'] },
      { word: 'いけ', reading: 'いけ', romaji: 'ike', meaning: 'pond', characters: ['い', 'け'] },
      { word: 'かお', reading: 'かお', romaji: 'kao', meaning: 'face', characters: ['か', 'お'] },
      {
        word: 'きく',
        reading: 'きく',
        romaji: 'kiku',
        meaning: 'to listen',
        characters: ['き', 'く']
      },
      { word: 'ここ', reading: 'ここ', romaji: 'koko', meaning: 'here', characters: ['こ', 'こ'] },
      { word: 'かけ', reading: 'かけ', romaji: 'kake', meaning: 'lack', characters: ['か', 'け'] },
      {
        word: 'きつ',
        reading: 'きつ',
        romaji: 'kitsu',
        meaning: 'tight',
        characters: ['き', 'つ']
      },
      { word: 'くう', reading: 'くう', romaji: 'kuu', meaning: 'to eat', characters: ['く', 'う'] },
      { word: 'けき', reading: 'けき', romaji: 'keki', meaning: 'cake', characters: ['け', 'き'] },
      { word: 'こい', reading: 'こい', romaji: 'koi', meaning: 'carp', characters: ['こ', 'い'] }
    ]
  },
  {
    groupName: 'S-sounds',
    words: [
      {
        word: 'さけ',
        reading: 'さけ',
        romaji: 'sake',
        meaning: 'salmon/alcohol',
        characters: ['さ', 'け']
      },
      { word: 'しお', reading: 'しお', romaji: 'shio', meaning: 'salt', characters: ['し', 'お'] },
      {
        word: 'すし',
        reading: 'すし',
        romaji: 'sushi',
        meaning: 'sushi',
        characters: ['す', 'し']
      },
      { word: 'そこ', reading: 'そこ', romaji: 'soko', meaning: 'there', characters: ['そ', 'こ'] },
      {
        word: 'あさ',
        reading: 'あさ',
        romaji: 'asa',
        meaning: 'morning',
        characters: ['あ', 'さ']
      },
      {
        word: 'さき',
        reading: 'さき',
        romaji: 'saki',
        meaning: 'tip/point',
        characters: ['さ', 'き']
      },
      { word: 'しか', reading: 'しか', romaji: 'shika', meaning: 'deer', characters: ['し', 'か'] },
      {
        word: 'すく',
        reading: 'すく',
        romaji: 'suku',
        meaning: 'to scoop',
        characters: ['す', 'く']
      },
      { word: 'せき', reading: 'せき', romaji: 'seki', meaning: 'seat', characters: ['せ', 'き'] },
      {
        word: 'そう',
        reading: 'そう',
        romaji: 'sou',
        meaning: 'so/like that',
        characters: ['そ', 'う']
      }
    ]
  },
  {
    groupName: 'T-sounds',
    words: [
      {
        word: 'たこ',
        reading: 'たこ',
        romaji: 'tako',
        meaning: 'octopus',
        characters: ['た', 'こ']
      },
      {
        word: 'ちち',
        reading: 'ちち',
        romaji: 'chichi',
        meaning: 'father',
        characters: ['ち', 'ち']
      },
      { word: 'つき', reading: 'つき', romaji: 'tsuki', meaning: 'moon', characters: ['つ', 'き'] },
      { word: 'てつ', reading: 'てつ', romaji: 'tetsu', meaning: 'iron', characters: ['て', 'つ'] },
      { word: 'とき', reading: 'とき', romaji: 'toki', meaning: 'time', characters: ['と', 'き'] },
      {
        word: 'たい',
        reading: 'たい',
        romaji: 'tai',
        meaning: 'sea bream',
        characters: ['た', 'い']
      },
      { word: 'ちか', reading: 'ちか', romaji: 'chika', meaning: 'near', characters: ['ち', 'か'] },
      {
        word: 'つつ',
        reading: 'つつ',
        romaji: 'tsutsu',
        meaning: 'tube',
        characters: ['つ', 'つ']
      },
      { word: 'てき', reading: 'てき', romaji: 'teki', meaning: 'enemy', characters: ['て', 'き'] },
      {
        word: 'とる',
        reading: 'とる',
        romaji: 'toru',
        meaning: 'to take',
        characters: ['と', 'る']
      }
    ]
  },
  {
    groupName: 'N-sounds',
    words: [
      {
        word: 'なつ',
        reading: 'なつ',
        romaji: 'natsu',
        meaning: 'summer',
        characters: ['な', 'つ']
      },
      { word: 'にく', reading: 'にく', romaji: 'niku', meaning: 'meat', characters: ['に', 'く'] },
      { word: 'ねこ', reading: 'ねこ', romaji: 'neko', meaning: 'cat', characters: ['ね', 'こ'] },
      { word: 'のこ', reading: 'のこ', romaji: 'noko', meaning: 'saw', characters: ['の', 'こ'] },
      { word: 'ぬの', reading: 'ぬの', romaji: 'nuno', meaning: 'cloth', characters: ['ぬ', 'の'] },
      {
        word: 'なか',
        reading: 'なか',
        romaji: 'naka',
        meaning: 'inside',
        characters: ['な', 'か']
      },
      {
        word: 'にわ',
        reading: 'にわ',
        romaji: 'niwa',
        meaning: 'garden',
        characters: ['に', 'わ']
      },
      { word: 'ぬま', reading: 'ぬま', romaji: 'numa', meaning: 'swamp', characters: ['ぬ', 'ま'] },
      {
        word: 'ねつ',
        reading: 'ねつ',
        romaji: 'netsu',
        meaning: 'fever',
        characters: ['ね', 'つ']
      },
      {
        word: 'のり',
        reading: 'のり',
        romaji: 'nori',
        meaning: 'seaweed',
        characters: ['の', 'り']
      }
    ]
  },
  {
    groupName: 'H-sounds',
    words: [
      {
        word: 'はな',
        reading: 'はな',
        romaji: 'hana',
        meaning: 'flower/nose',
        characters: ['は', 'な']
      },
      {
        word: 'ひと',
        reading: 'ひと',
        romaji: 'hito',
        meaning: 'person',
        characters: ['ひ', 'と']
      },
      { word: 'ふね', reading: 'ふね', romaji: 'fune', meaning: 'boat', characters: ['ふ', 'ね'] },
      { word: 'へび', reading: 'へび', romaji: 'hebi', meaning: 'snake', characters: ['へ', 'び'] },
      { word: 'ほし', reading: 'ほし', romaji: 'hoshi', meaning: 'star', characters: ['ほ', 'し'] },
      { word: 'はこ', reading: 'はこ', romaji: 'hako', meaning: 'box', characters: ['は', 'こ'] },
      { word: 'ひる', reading: 'ひる', romaji: 'hiru', meaning: 'noon', characters: ['ひ', 'る'] },
      {
        word: 'ふく',
        reading: 'ふく',
        romaji: 'fuku',
        meaning: 'clothes',
        characters: ['ふ', 'く']
      },
      {
        word: 'へた',
        reading: 'へた',
        romaji: 'heta',
        meaning: 'unskilled',
        characters: ['へ', 'た']
      },
      { word: 'ほね', reading: 'ほね', romaji: 'hone', meaning: 'bone', characters: ['ほ', 'ね'] }
    ]
  },
  {
    groupName: 'M-sounds',
    words: [
      { word: 'まち', reading: 'まち', romaji: 'machi', meaning: 'town', characters: ['ま', 'ち'] },
      { word: 'みず', reading: 'みず', romaji: 'mizu', meaning: 'water', characters: ['み', 'ず'] },
      {
        word: 'むし',
        reading: 'むし',
        romaji: 'mushi',
        meaning: 'insect',
        characters: ['む', 'し']
      },
      { word: 'めし', reading: 'めし', romaji: 'meshi', meaning: 'meal', characters: ['め', 'し'] },
      {
        word: 'もり',
        reading: 'もり',
        romaji: 'mori',
        meaning: 'forest',
        characters: ['も', 'り']
      },
      { word: 'まめ', reading: 'まめ', romaji: 'mame', meaning: 'bean', characters: ['ま', 'め'] },
      { word: 'みち', reading: 'みち', romaji: 'michi', meaning: 'road', characters: ['み', 'ち'] },
      { word: 'むね', reading: 'むね', romaji: 'mune', meaning: 'chest', characters: ['む', 'ね'] }
    ]
  },
  {
    groupName: 'Y-sounds',
    words: [
      {
        word: 'やま',
        reading: 'やま',
        romaji: 'yama',
        meaning: 'mountain',
        characters: ['や', 'ま']
      },
      { word: 'ゆき', reading: 'ゆき', romaji: 'yuki', meaning: 'snow', characters: ['ゆ', 'き'] },
      { word: 'よる', reading: 'よる', romaji: 'yoru', meaning: 'night', characters: ['よ', 'る'] }
    ]
  },
  {
    groupName: 'R-sounds',
    words: [
      { word: 'らく', reading: 'らく', romaji: 'raku', meaning: 'easy', characters: ['ら', 'く'] },
      {
        word: 'りす',
        reading: 'りす',
        romaji: 'risu',
        meaning: 'squirrel',
        characters: ['り', 'す']
      },
      {
        word: 'るす',
        reading: 'るす',
        romaji: 'rusu',
        meaning: 'absence',
        characters: ['る', 'す']
      },
      {
        word: 'れい',
        reading: 'れい',
        romaji: 'rei',
        meaning: 'zero/example',
        characters: ['れ', 'い']
      },
      { word: 'ろく', reading: 'ろく', romaji: 'roku', meaning: 'six', characters: ['ろ', 'く'] }
    ]
  },
  {
    groupName: 'W-sounds',
    words: [
      {
        word: 'わに',
        reading: 'わに',
        romaji: 'wani',
        meaning: 'crocodile',
        characters: ['わ', 'に']
      },
      { word: 'わた', reading: 'わた', romaji: 'wata', meaning: 'cotton', characters: ['わ', 'た'] }
    ]
  },
  {
    groupName: 'Dakuten G-sounds',
    words: [
      {
        word: 'がく',
        reading: 'がく',
        romaji: 'gaku',
        meaning: 'learning',
        characters: ['が', 'く']
      },
      { word: 'ぎん', reading: 'ぎん', romaji: 'gin', meaning: 'silver', characters: ['ぎ', 'ん'] },
      {
        word: 'ぐち',
        reading: 'ぐち',
        romaji: 'guchi',
        meaning: 'mouth/entrance',
        characters: ['ぐ', 'ち']
      },
      { word: 'げき', reading: 'げき', romaji: 'geki', meaning: 'drama', characters: ['げ', 'き'] },
      {
        word: 'ごご',
        reading: 'ごご',
        romaji: 'gogo',
        meaning: 'afternoon',
        characters: ['ご', 'ご']
      }
    ]
  },
  {
    groupName: 'Dakuten Z-sounds',
    words: [
      {
        word: 'ざる',
        reading: 'ざる',
        romaji: 'zaru',
        meaning: 'bamboo basket',
        characters: ['ざ', 'る']
      },
      {
        word: 'じかん',
        reading: 'じかん',
        romaji: 'jikan',
        meaning: 'time',
        characters: ['じ', 'か', 'ん']
      },
      {
        word: 'ずっと',
        reading: 'ずっと',
        romaji: 'zutto',
        meaning: 'all the time',
        characters: ['ず', 'っ', 'と']
      },
      {
        word: 'ぜん',
        reading: 'ぜん',
        romaji: 'zen',
        meaning: 'all/zen',
        characters: ['ぜ', 'ん']
      },
      {
        word: 'ぞう',
        reading: 'ぞう',
        romaji: 'zou',
        meaning: 'elephant',
        characters: ['ぞ', 'う']
      }
    ]
  },
  {
    groupName: 'Dakuten D-sounds',
    words: [
      { word: 'だれ', reading: 'だれ', romaji: 'dare', meaning: 'who', characters: ['だ', 'れ'] },
      {
        word: 'でんき',
        reading: 'でんき',
        romaji: 'denki',
        meaning: 'electricity',
        characters: ['で', 'ん', 'き']
      },
      { word: 'どこ', reading: 'どこ', romaji: 'doko', meaning: 'where', characters: ['ど', 'こ'] }
    ]
  },
  {
    groupName: 'Dakuten B-sounds',
    words: [
      {
        word: 'ばん',
        reading: 'ばん',
        romaji: 'ban',
        meaning: 'evening/number',
        characters: ['ば', 'ん']
      },
      {
        word: 'びょうき',
        reading: 'びょうき',
        romaji: 'byouki',
        meaning: 'illness',
        characters: ['び', 'ょ', 'う', 'き']
      },
      { word: 'ぶた', reading: 'ぶた', romaji: 'buta', meaning: 'pig', characters: ['ぶ', 'た'] },
      {
        word: 'べんり',
        reading: 'べんり',
        romaji: 'benri',
        meaning: 'convenient',
        characters: ['べ', 'ん', 'り']
      },
      {
        word: 'ぼうし',
        reading: 'ぼうし',
        romaji: 'boushi',
        meaning: 'hat',
        characters: ['ぼ', 'う', 'し']
      }
    ]
  },
  {
    groupName: 'Handakuten P-sounds',
    words: [
      { word: 'ぱん', reading: 'ぱん', romaji: 'pan', meaning: 'bread', characters: ['ぱ', 'ん'] },
      {
        word: 'ぴあの',
        reading: 'ぴあの',
        romaji: 'piano',
        meaning: 'piano',
        characters: ['ぴ', 'あ', 'の']
      },
      {
        word: 'ぷーる',
        reading: 'ぷーる',
        romaji: 'puuru',
        meaning: 'pool',
        characters: ['ぷ', 'ー', 'る']
      },
      { word: 'ぺん', reading: 'ぺん', romaji: 'pen', meaning: 'pen', characters: ['ぺ', 'ん'] },
      {
        word: 'ぽすと',
        reading: 'ぽすと',
        romaji: 'posuto',
        meaning: 'post',
        characters: ['ぽ', 'す', 'と']
      }
    ]
  }
]

export const katakanaWords: WordGroup[] = [
  {
    groupName: 'Basic Vowels',
    words: [
      {
        word: 'アイス',
        reading: 'アイス',
        romaji: 'aisu',
        meaning: 'ice cream',
        characters: ['ア', 'イ', 'ス']
      },
      { word: 'エア', reading: 'エア', romaji: 'ea', meaning: 'air', characters: ['エ', 'ア'] },
      {
        word: 'オイル',
        reading: 'オイル',
        romaji: 'oiru',
        meaning: 'oil',
        characters: ['オ', 'イ', 'ル']
      },
      {
        word: 'アート',
        reading: 'アート',
        romaji: 'aato',
        meaning: 'art',
        characters: ['ア', 'ー', 'ト']
      },
      {
        word: 'イエス',
        reading: 'イエス',
        romaji: 'iesu',
        meaning: 'yes',
        characters: ['イ', 'エ', 'ス']
      },
      {
        word: 'ウール',
        reading: 'ウール',
        romaji: 'uuru',
        meaning: 'wool',
        characters: ['ウ', 'ー', 'ル']
      },
      { word: 'エコ', reading: 'エコ', romaji: 'eko', meaning: 'eco', characters: ['エ', 'コ'] },
      {
        word: 'オープン',
        reading: 'オープン',
        romaji: 'oopun',
        meaning: 'open',
        characters: ['オ', 'ー', 'プ', 'ン']
      }
    ]
  },
  {
    groupName: 'K-sounds',
    words: [
      {
        word: 'カフェ',
        reading: 'カフェ',
        romaji: 'kafe',
        meaning: 'cafe',
        characters: ['カ', 'フェ']
      },
      { word: 'キー', reading: 'キー', romaji: 'kii', meaning: 'key', characters: ['キ', 'ー'] },
      {
        word: 'クイズ',
        reading: 'クイズ',
        romaji: 'kuizu',
        meaning: 'quiz',
        characters: ['ク', 'イ', 'ズ']
      },
      {
        word: 'ケーキ',
        reading: 'ケーキ',
        romaji: 'keeki',
        meaning: 'cake',
        characters: ['ケ', 'ー', 'キ']
      },
      {
        word: 'コーヒー',
        reading: 'コーヒー',
        romaji: 'koohii',
        meaning: 'coffee',
        characters: ['コ', 'ー', 'ヒ', 'ー']
      },
      {
        word: 'カード',
        reading: 'カード',
        romaji: 'kaado',
        meaning: 'card',
        characters: ['カ', 'ー', 'ド']
      },
      {
        word: 'キッチン',
        reading: 'キッチン',
        romaji: 'kicchin',
        meaning: 'kitchen',
        characters: ['キ', 'ッ', 'チ', 'ン']
      },
      {
        word: 'クール',
        reading: 'クール',
        romaji: 'kuuru',
        meaning: 'cool',
        characters: ['ク', 'ー', 'ル']
      },
      {
        word: 'ケース',
        reading: 'ケース',
        romaji: 'keesu',
        meaning: 'case',
        characters: ['ケ', 'ー', 'ス']
      },
      {
        word: 'コップ',
        reading: 'コップ',
        romaji: 'koppu',
        meaning: 'cup',
        characters: ['コ', 'ッ', 'プ']
      }
    ]
  },
  {
    groupName: 'S-sounds',
    words: [
      {
        word: 'サラダ',
        reading: 'サラダ',
        romaji: 'sarada',
        meaning: 'salad',
        characters: ['サ', 'ラ', 'ダ']
      },
      {
        word: 'シャツ',
        reading: 'シャツ',
        romaji: 'shatsu',
        meaning: 'shirt',
        characters: ['シ', 'ャ', 'ツ']
      },
      {
        word: 'スープ',
        reading: 'スープ',
        romaji: 'suupu',
        meaning: 'soup',
        characters: ['ス', 'ー', 'プ']
      },
      {
        word: 'セット',
        reading: 'セット',
        romaji: 'setto',
        meaning: 'set',
        characters: ['セ', 'ッ', 'ト']
      },
      {
        word: 'ソース',
        reading: 'ソース',
        romaji: 'soosu',
        meaning: 'sauce',
        characters: ['ソ', 'ー', 'ス']
      },
      {
        word: 'サイズ',
        reading: 'サイズ',
        romaji: 'saizu',
        meaning: 'size',
        characters: ['サ', 'イ', 'ズ']
      },
      {
        word: 'システム',
        reading: 'システム',
        romaji: 'shisutemu',
        meaning: 'system',
        characters: ['シ', 'ス', 'テ', 'ム']
      },
      {
        word: 'スタイル',
        reading: 'スタイル',
        romaji: 'sutairu',
        meaning: 'style',
        characters: ['ス', 'タ', 'イ', 'ル']
      },
      {
        word: 'セクション',
        reading: 'セクション',
        romaji: 'sekushon',
        meaning: 'section',
        characters: ['セ', 'ク', 'シ', 'ョ', 'ン']
      },
      {
        word: 'ソフト',
        reading: 'ソフト',
        romaji: 'sofuto',
        meaning: 'soft',
        characters: ['ソ', 'フ', 'ト']
      }
    ]
  },
  {
    groupName: 'T-sounds',
    words: [
      {
        word: 'タクシー',
        reading: 'タクシー',
        romaji: 'takushii',
        meaning: 'taxi',
        characters: ['タ', 'ク', 'シ', 'ー']
      },
      {
        word: 'チーム',
        reading: 'チーム',
        romaji: 'chiimu',
        meaning: 'team',
        characters: ['チ', 'ー', 'ム']
      },
      {
        word: 'ツアー',
        reading: 'ツアー',
        romaji: 'tsuaa',
        meaning: 'tour',
        characters: ['ツ', 'ア', 'ー']
      },
      {
        word: 'テスト',
        reading: 'テスト',
        romaji: 'tesuto',
        meaning: 'test',
        characters: ['テ', 'ス', 'ト']
      },
      {
        word: 'トップ',
        reading: 'トップ',
        romaji: 'toppu',
        meaning: 'top',
        characters: ['ト', 'ッ', 'プ']
      },
      {
        word: 'タイプ',
        reading: 'タイプ',
        romaji: 'taipu',
        meaning: 'type',
        characters: ['タ', 'イ', 'プ']
      },
      {
        word: 'チケット',
        reading: 'チケット',
        romaji: 'chiketto',
        meaning: 'ticket',
        characters: ['チ', 'ケ', 'ッ', 'ト']
      },
      {
        word: 'ツール',
        reading: 'ツール',
        romaji: 'tsuuru',
        meaning: 'tool',
        characters: ['ツ', 'ー', 'ル']
      },
      {
        word: 'テーブル',
        reading: 'テーブル',
        romaji: 'teeburu',
        meaning: 'table',
        characters: ['テ', 'ー', 'ブ', 'ル']
      },
      {
        word: 'トイレ',
        reading: 'トイレ',
        romaji: 'toire',
        meaning: 'toilet',
        characters: ['ト', 'イ', 'レ']
      }
    ]
  },
  {
    groupName: 'N-sounds',
    words: [
      {
        word: 'ナイフ',
        reading: 'ナイフ',
        romaji: 'naifu',
        meaning: 'knife',
        characters: ['ナ', 'イ', 'フ']
      },
      {
        word: 'ニュース',
        reading: 'ニュース',
        romaji: 'nyuusu',
        meaning: 'news',
        characters: ['ニ', 'ュ', 'ー', 'ス']
      },
      {
        word: 'ヌードル',
        reading: 'ヌードル',
        romaji: 'nuudoru',
        meaning: 'noodle',
        characters: ['ヌ', 'ー', 'ド', 'ル']
      },
      {
        word: 'ネット',
        reading: 'ネット',
        romaji: 'netto',
        meaning: 'net',
        characters: ['ネ', 'ッ', 'ト']
      },
      {
        word: 'ノート',
        reading: 'ノート',
        romaji: 'nooto',
        meaning: 'notebook',
        characters: ['ノ', 'ー', 'ト']
      },
      {
        word: 'ナンバー',
        reading: 'ナンバー',
        romaji: 'nanbaa',
        meaning: 'number',
        characters: ['ナ', 'ン', 'バ', 'ー']
      },
      {
        word: 'ニーズ',
        reading: 'ニーズ',
        romaji: 'niizu',
        meaning: 'needs',
        characters: ['ニ', 'ー', 'ズ']
      },
      {
        word: 'ネーム',
        reading: 'ネーム',
        romaji: 'neemu',
        meaning: 'name',
        characters: ['ネ', 'ー', 'ム']
      },
      {
        word: 'ノンストップ',
        reading: 'ノンストップ',
        romaji: 'nonsutoppu',
        meaning: 'non-stop',
        characters: ['ノ', 'ン', 'ス', 'ト', 'ッ', 'プ']
      }
    ]
  },
  {
    groupName: 'H-sounds',
    words: [
      {
        word: 'ハンバーガー',
        reading: 'ハンバーガー',
        romaji: 'hanbaagaa',
        meaning: 'hamburger',
        characters: ['ハ', 'ン', 'バ', 'ー', 'ガ', 'ー']
      },
      {
        word: 'ヒーター',
        reading: 'ヒーター',
        romaji: 'hiitaa',
        meaning: 'heater',
        characters: ['ヒ', 'ー', 'タ', 'ー']
      },
      {
        word: 'フルーツ',
        reading: 'フルーツ',
        romaji: 'furuutsu',
        meaning: 'fruit',
        characters: ['フ', 'ル', 'ー', 'ツ']
      },
      {
        word: 'ヘルメット',
        reading: 'ヘルメット',
        romaji: 'herumetto',
        meaning: 'helmet',
        characters: ['ヘ', 'ル', 'メ', 'ッ', 'ト']
      },
      {
        word: 'ホテル',
        reading: 'ホテル',
        romaji: 'hoteru',
        meaning: 'hotel',
        characters: ['ホ', 'テ', 'ル']
      }
    ]
  },
  {
    groupName: 'M-sounds',
    words: [
      {
        word: 'マーケット',
        reading: 'マーケット',
        romaji: 'maaketto',
        meaning: 'market',
        characters: ['マ', 'ー', 'ケ', 'ッ', 'ト']
      },
      {
        word: 'ミルク',
        reading: 'ミルク',
        romaji: 'miruku',
        meaning: 'milk',
        characters: ['ミ', 'ル', 'ク']
      },
      {
        word: 'ムービー',
        reading: 'ムービー',
        romaji: 'muubii',
        meaning: 'movie',
        characters: ['ム', 'ー', 'ビ', 'ー']
      },
      {
        word: 'メール',
        reading: 'メール',
        romaji: 'meeru',
        meaning: 'email',
        characters: ['メ', 'ー', 'ル']
      },
      {
        word: 'モデル',
        reading: 'モデル',
        romaji: 'moderu',
        meaning: 'model',
        characters: ['モ', 'デ', 'ル']
      },
      {
        word: 'マップ',
        reading: 'マップ',
        romaji: 'mappu',
        meaning: 'map',
        characters: ['マ', 'ッ', 'プ']
      },
      {
        word: 'ミックス',
        reading: 'ミックス',
        romaji: 'mikkusu',
        meaning: 'mix',
        characters: ['ミ', 'ッ', 'ク', 'ス']
      },
      {
        word: 'ムード',
        reading: 'ムード',
        romaji: 'muudo',
        meaning: 'mood',
        characters: ['ム', 'ー', 'ド']
      },
      {
        word: 'メニュー',
        reading: 'メニュー',
        romaji: 'menyuu',
        meaning: 'menu',
        characters: ['メ', 'ニ', 'ュ', 'ー']
      },
      {
        word: 'モード',
        reading: 'モード',
        romaji: 'moodo',
        meaning: 'mode',
        characters: ['モ', 'ー', 'ド']
      }
    ]
  },
  {
    groupName: 'Y-sounds',
    words: [
      {
        word: 'ヨガ',
        reading: 'ヨガ',
        romaji: 'yoga',
        meaning: 'yoga',
        characters: ['ヨ', 'ガ']
      },
      {
        word: 'ユニフォーム',
        reading: 'ユニフォーム',
        romaji: 'yunifomu',
        meaning: 'uniform',
        characters: ['ユ', 'ニ', 'フ', 'ォ', 'ー', 'ム']
      }
    ]
  },
  {
    groupName: 'R-sounds',
    words: [
      {
        word: 'ラジオ',
        reading: 'ラジオ',
        romaji: 'rajio',
        meaning: 'radio',
        characters: ['ラ', 'ジ', 'オ']
      },
      {
        word: 'リモコン',
        reading: 'リモコン',
        romaji: 'rimokon',
        meaning: 'remote control',
        characters: ['リ', 'モ', 'コ', 'ン']
      },
      {
        word: 'ルール',
        reading: 'ルール',
        romaji: 'ruuru',
        meaning: 'rule',
        characters: ['ル', 'ー', 'ル']
      },
      {
        word: 'レストラン',
        reading: 'レストラン',
        romaji: 'resutoran',
        meaning: 'restaurant',
        characters: ['レ', 'ス', 'ト', 'ラ', 'ン']
      },
      {
        word: 'ロボット',
        reading: 'ロボット',
        romaji: 'robotto',
        meaning: 'robot',
        characters: ['ロ', 'ボ', 'ッ', 'ト']
      },
      {
        word: 'ライト',
        reading: 'ライト',
        romaji: 'raito',
        meaning: 'light',
        characters: ['ラ', 'イ', 'ト']
      },
      {
        word: 'リスト',
        reading: 'リスト',
        romaji: 'risuto',
        meaning: 'list',
        characters: ['リ', 'ス', 'ト']
      },
      {
        word: 'ルーム',
        reading: 'ルーム',
        romaji: 'ruumu',
        meaning: 'room',
        characters: ['ル', 'ー', 'ム']
      },
      {
        word: 'レベル',
        reading: 'レベル',
        romaji: 'reberu',
        meaning: 'level',
        characters: ['レ', 'ベ', 'ル']
      },
      {
        word: 'ロック',
        reading: 'ロック',
        romaji: 'rokku',
        meaning: 'rock/lock',
        characters: ['ロ', 'ッ', 'ク']
      }
    ]
  },
  {
    groupName: 'W-sounds',
    words: [
      {
        word: 'ワイン',
        reading: 'ワイン',
        romaji: 'wain',
        meaning: 'wine',
        characters: ['ワ', 'イ', 'ン']
      }
    ]
  },
  {
    groupName: 'Dakuten G-sounds',
    words: [
      {
        word: 'ガス',
        reading: 'ガス',
        romaji: 'gasu',
        meaning: 'gas',
        characters: ['ガ', 'ス']
      },
      {
        word: 'ギター',
        reading: 'ギター',
        romaji: 'gitaa',
        meaning: 'guitar',
        characters: ['ギ', 'タ', 'ー']
      },
      {
        word: 'グループ',
        reading: 'グループ',
        romaji: 'guruupu',
        meaning: 'group',
        characters: ['グ', 'ル', 'ー', 'プ']
      },
      {
        word: 'ゲーム',
        reading: 'ゲーム',
        romaji: 'geemu',
        meaning: 'game',
        characters: ['ゲ', 'ー', 'ム']
      },
      {
        word: 'ゴルフ',
        reading: 'ゴルフ',
        romaji: 'gorufu',
        meaning: 'golf',
        characters: ['ゴ', 'ル', 'フ']
      }
    ]
  },
  {
    groupName: 'Dakuten Z-sounds',
    words: [
      {
        word: 'ゼロ',
        reading: 'ゼロ',
        romaji: 'zero',
        meaning: 'zero',
        characters: ['ゼ', 'ロ']
      },
      {
        word: 'ジュース',
        reading: 'ジュース',
        romaji: 'juusu',
        meaning: 'juice',
        characters: ['ジ', 'ュ', 'ー', 'ス']
      }
    ]
  },
  {
    groupName: 'Dakuten D-sounds',
    words: [
      {
        word: 'ダンス',
        reading: 'ダンス',
        romaji: 'dansu',
        meaning: 'dance',
        characters: ['ダ', 'ン', 'ス']
      },
      {
        word: 'デザート',
        reading: 'デザート',
        romaji: 'dezaato',
        meaning: 'dessert',
        characters: ['デ', 'ザ', 'ー', 'ト']
      },
      {
        word: 'ドア',
        reading: 'ドア',
        romaji: 'doa',
        meaning: 'door',
        characters: ['ド', 'ア']
      }
    ]
  },
  {
    groupName: 'Dakuten B-sounds',
    words: [
      {
        word: 'バス',
        reading: 'バス',
        romaji: 'basu',
        meaning: 'bus',
        characters: ['バ', 'ス']
      },
      {
        word: 'ビデオ',
        reading: 'ビデオ',
        romaji: 'bideo',
        meaning: 'video',
        characters: ['ビ', 'デ', 'オ']
      },
      {
        word: 'ブログ',
        reading: 'ブログ',
        romaji: 'burogu',
        meaning: 'blog',
        characters: ['ブ', 'ロ', 'グ']
      },
      {
        word: 'ベッド',
        reading: 'ベッド',
        romaji: 'beddo',
        meaning: 'bed',
        characters: ['ベ', 'ッ', 'ド']
      },
      {
        word: 'ボール',
        reading: 'ボール',
        romaji: 'booru',
        meaning: 'ball',
        characters: ['ボ', 'ー', 'ル']
      }
    ]
  },
  {
    groupName: 'Handakuten P-sounds',
    words: [
      {
        word: 'パン',
        reading: 'パン',
        romaji: 'pan',
        meaning: 'bread',
        characters: ['パ', 'ン']
      },
      {
        word: 'ピアノ',
        reading: 'ピアノ',
        romaji: 'piano',
        meaning: 'piano',
        characters: ['ピ', 'ア', 'ノ']
      },
      {
        word: 'プール',
        reading: 'プール',
        romaji: 'puuru',
        meaning: 'pool',
        characters: ['プ', 'ー', 'ル']
      },
      {
        word: 'ペン',
        reading: 'ペン',
        romaji: 'pen',
        meaning: 'pen',
        characters: ['ペ', 'ン']
      },
      {
        word: 'ポスト',
        reading: 'ポスト',
        romaji: 'posuto',
        meaning: 'post',
        characters: ['ポ', 'ス', 'ト']
      }
    ]
  }
]
