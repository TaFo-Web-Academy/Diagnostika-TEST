// ADD NEW DAY TEST HERE - Add new day configurations in the days array below

import { TestDay, Question } from '@/types';

// Helper to get unlock date (day 1 = today, day 2 = tomorrow, etc.)
const getUnlockDate = (day: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + (day - 1));
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Day 1 Questions - Base test
const day1Questions: Question[] = [
  {
    question: "Субҳ аз хоб бедор мешавед...",
    options: {
      A: "Пур аз энергия ва илҳом",
      Б: "Мисли одатан, аммо зуд хаста мешавам",
      В: "Бо эҳсоси вазнинӣ, гӯё нахобида бошам",
      Г: "Чашмамро мекушоям ва фикр мекунам: 'Боз як рӯзи дигар...'"
    }
  },
  {
    question: "Дар зиндагиатон як зарбаи сахт хӯрдед...",
    options: {
      A: "Не, зарбаи сахте надоштам",
      Б: "Доштам, вале худро баровардам",
      В: "Доштам ва ҳанӯз ҳам онро дар вуҷудам эҳсос мекунам",
      Г: "Бале, ва ман дигар он одами пештара нестам"
    }
  },
  {
    question: "Оё аз баъзе садоҳо ё ҷойҳо бесабаб метарсед?",
    options: {
      A: "Не, аз чизе бесабаб наметарсам",
      Б: "Баъзан дилам ғаш мешавад, аммо намедонам чаро",
      В: "Бале, чизҳои муайяне маро ба тарс меандозанд",
      Г: "Аз он қадар чиз метарсам, ки худро маҳдуд кардаам"
    }
  },
  {
    question: "Баъзан эҳсос мекунед, ки...",
    options: {
      A: "Ман комилан худамро идора мекунам",
      Б: "Фикрҳои ман маро тела медиҳанд",
      В: "Як қисми вуҷудам маро водор ба корҳои бад мекунад",
      Г: "Даруни ман каси дигарест, ки маро идора мекунад"
    }
  },
  {
    question: "Модаратон ҳангоми шуморо шикам кардан...",
    options: {
      A: "Ором буд",
      Б: "Баъзе ғамҳо дошт",
      В: "Стресси зиёд дошт",
      Г: "Намедонам, аммо эҳсос мекунам чизе нодуруст буд"
    }
  },
  {
    question: "Таваллуди шумо чӣ гуна буд?",
    options: {
      A: "Осон",
      Б: "Каме душвор",
      В: "Тӯлонӣ ё бо оризаҳо",
      Г: "Намедонам, аммо эҳсоси бад дорам"
    }
  },
  {
    question: "Ҷисматон чиро ҳикоят мекунад?",
    options: {
      A: "Ман солимам",
      Б: "Баъзан дард дорам",
      В: "Аксар вақт дард дорам",
      Г: "Дард доимӣ аст"
    }
  },
  {
    question: "Дар муносибатҳои наздик...",
    options: {
      A: "Ман баробар ҳастам",
      Б: "Баъзан нофаҳмида мешавам",
      В: "Худро қурбонӣ ҳис мекунам",
      Г: "Ҳамеша танҳо мемонам"
    }
  },
  {
    question: "Як овоз ё бӯй...",
    options: {
      A: "Таъсир намекунад",
      Б: "Каме хотир меорад",
      В: "Маро ба ҳолати бад мебарад",
      Г: "Назоратро гум мекунам"
    }
  },
  {
    question: "Дар пеши роҳатон...",
    options: {
      A: "Роҳ кушода аст",
      Б: "Монеа ҳаст, аммо мегузарам",
      В: "Девори ноаён ҳаст",
      Г: "Дар як ҷоям мондаам"
    }
  },
  {
    question: "Дар кӯдакӣ...",
    options: {
      A: "Хушбахт будам",
      Б: "Баъзе мушкилот буд",
      В: "Тарс доштам",
      Г: "Пур аз дард буд"
    }
  },
  {
    question: "Гоҳе беҳис мешавед?",
    options: {
      A: "Не",
      Б: "Баъзан",
      В: "Бале",
      Г: "Аксаран"
    }
  },
  {
    question: "Зиндагиатон...",
    options: {
      A: "Пур аз имконият",
      Б: "Баъзан такрорӣ",
      В: "Ҳамеша якхела",
      Г: "Чархи абадӣ"
    }
  },
  {
    question: "Дар баданатон...",
    options: {
      A: "Озод",
      Б: "Баъзан нохуш",
      В: "Нороҳат",
      Г: "Дур аз бадан"
    }
  },
  {
    question: "Оташи дарун...",
    options: {
      A: "Қавӣ",
      Б: "Баъзан паст",
      В: "Заиф",
      Г: "Хомӯш"
    }
  }
];

// ADD NEW DAY TEST HERE - Copy day1Questions structure for new days
export const TEST_DAYS: TestDay[] = [
  {
    day: 1,
    title: "Рӯзи 1: Шинохти худ",
    description: "Дар ин рӯз мо бо ҳам шинос мешавем ва ҳолати рӯҳии шуморо месанҷем.",
    questions: day1Questions,
    unlockDate: getUnlockDate(1)
  },
  // ADD NEW DAY TEST HERE - Uncomment and configure for Day 2
  // {
  //   day: 2,
  //   title: "Рӯзи 2: Эмоцияҳо",
  //   description: "Санҷиши эмоцияҳо ва ҳиссиёти шумо.",
  //   questions: [...day1Questions], // Replace with actual Day 2 questions
  //   unlockDate: getUnlockDate(2)
  // },
  // ADD NEW DAY TEST HERE - Uncomment and configure for Day 3
  // {
  //   day: 3,
  //   title: "Рӯзи 3: Муносибатҳо",
  //   description: "Таҳлили муносибатҳои шумо бо дигарон.",
  //   questions: [...day1Questions], // Replace with actual Day 3 questions
  //   unlockDate: getUnlockDate(3)
  // },
  // ADD NEW DAY TEST HERE - Uncomment and configure for Day 4
  // {
  //   day: 4,
  //   title: "Рӯзи 4: Травмаҳо",
  //   description: "Кор бо травмаҳои гузашта.",
  //   questions: [...day1Questions], // Replace with actual Day 4 questions
  //   unlockDate: getUnlockDate(4)
  // },
  // ADD NEW DAY TEST HERE - Uncomment and configure for Day 5
  // {
  //   day: 5,
  //   title: "Рӯзи 5: Шифо",
  //   description: "Роҳи шифо ва озодӣ.",
  //   questions: [...day1Questions], // Replace with actual Day 5 questions
  //   unlockDate: getUnlockDate(5)
  // }
];

// Promo code configuration
export const PROMO_CODE = "Тести Равони";

// Database simulation (in production, replace with real DB calls)
// Using localStorage for demo purposes
export const db = {
  // User operations
  getUser: (id: string) => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`user_${id}`);
    return data ? JSON.parse(data) : null;
  },
  
  saveUser: (user: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
  },
  
  // Result operations
  saveResult: (result: any) => {
    if (typeof window === 'undefined') return;
    const key = `result_${result.userId}_day${result.day}`;
    localStorage.setItem(key, JSON.stringify(result));
  },
  
  getResult: (userId: string, day: number) => {
    if (typeof window === 'undefined') return null;
    const key = `result_${userId}_day${day}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  
  getAllResults: (userId: string) => {
    if (typeof window === 'undefined') return [];
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`result_${userId}_`)) {
        const data = localStorage.getItem(key);
        if (data) results.push(JSON.parse(data));
      }
    }
    return results;
  },
  
  // Admin operations
  getAllUsers: () => {
    if (typeof window === 'undefined') return [];
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        const data = localStorage.getItem(key);
        if (data) users.push(JSON.parse(data));
      }
    }
    return users;
  }
};

// Calculate result based on answers
export const calculateResult = (answers: Record<number, 'A' | 'Б' | 'В' | 'Г'>) => {
  const counts: Record<string, number> = { A: 0, Б: 0, В: 0, Г: 0 };
  
  Object.values(answers).forEach(answer => {
    counts[answer]++;
  });
  
  // Find the most frequent answer
  let maxCount = 0;
  let resultType: 'A' | 'Б' | 'В' | 'Г' = 'A';
  
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      resultType = type as 'A' | 'Б' | 'В' | 'Г';
    }
  }
  
  return resultType;
};
