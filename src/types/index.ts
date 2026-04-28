// ADD NEW DAY TEST HERE - Add new day configurations in the days array

export interface Question {
  question: string;
  options: {
    A: string;
    Б: string;
    В: string;
    Г: string;
  };
}

export interface TestDay {
  day: number;
  title: string;
  description: string;
  questions: Question[];
  unlockDate: string; // ISO date string
}

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  age: number;
  hasSpouse: boolean;
  gender: 'male' | 'female';
  interest: 'male' | 'female';
  promoCodeEntered: boolean;
  createdAt: string;
}

export interface TestResult {
  userId: string;
  day: number;
  answers: Record<number, 'A' | 'Б' | 'В' | 'Г'>;
  resultType: 'A' | 'Б' | 'В' | 'Г';
  resultName: string;
  resultDescription: string;
  completedAt: string;
}

export type ResultType = 'A' | 'Б' | 'В' | 'Г';

export interface ResultInfo {
  type: ResultType;
  name: string;
  title: string;
  description: string;
  color: string;
}

// Results configuration
export const RESULTS: Record<ResultType, ResultInfo> = {
  A: {
    type: 'A',
    name: 'ОЗОД',
    title: 'Озод — Рӯҳи озод ва мутавозин',
    description: `Шумо инсони озод ҳастед! Рӯҳи шумо аз қидҳои рӯҳӣ ва эмоционалӣ озод аст. 
    Шумо метавонед зиндагиро ҳамон гуна ки ҳаст қабул кунед ва аз лаҳзаҳо баҳра баред.
    
    Хусусиятҳои шумо:
    • Энергияи доимӣ ва илҳомбахш
    • Тавозуни рӯҳӣ ва эмоционалӣ
    • Қобилияти идоракунии вазъиятҳои душвор
    • Эҳсоси озодӣ дар бадан ва рӯҳ
    
    Шумо аллакай роҳи дурустро интихоб кардаед. Идома диҳед!`,
    color: '#22c55e'
  },
  Б: {
    type: 'Б',
    name: 'НОУСТУВОР',
    title: 'Ноустувор — Баланси нопойдор',
    description: `Шумо дар ҳолати баланси нопойдор қарор доред. Баъзе вақтҳо шумо худро пурқувват ҳис мекунед, 
    аммо баъзан энергияи шумо паст мешавад.
    
    Хусусиятҳои шумо:
    • Тағйирёбии ҳолати рӯҳӣ
    • Зуд хаста шудан
    • Нобарории эмоционалӣ
    • Эҳсоси вазнинӣ баъзан
    
    Роҳи ҳал:
    • Машқҳои нафаскашӣ
    • Тартиби хоби дуруст
    • Тағзияи солим
    • Амaliёти рӯҳӣ
    
    Шумо метавонед ба ҳолати устувортар бирасед!`,
    color: '#eab308'
  },
  В: {
    type: 'В',
    name: 'БАСТА',
    title: 'Баста — Блоки энергия',
    description: `Энергияи шумо блок шудааст. Шумо эҳсос мекунед, ки чизе шуморо бозмедорад ва 
    намемонад пеш равед.
    
    Хусусиятҳои шумо:
    • Эҳсоси вазнинии доимӣ
    • Дардҳои ҷисмонӣ
    • Блоки эмоционалӣ
    • Набудани илҳом
    
    Сабабҳо:
    • Стресси зиёд
    • Травмаҳои гузашта
    • Эҳсосоти фурӯрафта
    • Муносибатҳои нодуруст
    
    Роҳи ҳал:
    • Кори бо психолог
    • Амaliёти рӯҳӣ
    • Сабркунии эмоцияҳо
    • Тағйири тарзи зиндагӣ
    
    Шумо метавонед ин блокҳоро кушоед!`,
    color: '#f97316'
  },
  Г: {
    type: 'Г',
    name: 'КАРАХТӢ',
    title: 'Карахтӣ — Бӯҳрони рӯҳӣ',
    description: `Шумо дар ҳолати бӯҳрони рӯҳӣ қарор доред. Ин ҳолати ҷиддӣ аст, аммо шифо ёфтан мумкин аст.
    
    Хусусиятҳои шумо:
    • Эҳсоси пучӣ
    • Набудани мақсад
    • Дарди доимӣ
    • Ҷудоӣ аз бадан
    
    Сабабҳо:
    • Травмаҳои кӯдакӣ
    • Стресси тӯлонӣ
    • Муносибатҳои вайроншуда
    • Бовариҳои манфӣ
    
    Роҳи ҳал:
    • Ёрии касбӣ (психолог/терапевт)
    • Гурӯҳҳои дастгирӣ
    • Амaliёти рӯҳӣ
    • Тағйири муҳит
    
    Шумо танҳо нестед. Ёрӣ дастрас аст!`,
    color: '#dc2626'
  }
};
