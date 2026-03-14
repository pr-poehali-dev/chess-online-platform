export interface BotProfile {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  gender: 'male' | 'female';
}

const BASE = 'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files';

export const BOTS: BotProfile[] = [
  // ~800
  { id: 'bot_anna',      name: 'Анна Петрова',       rating: 810,  avatar: `${BASE}/79a3c17a-cd2f-42fc-ae87-699779f02477.jpg`, gender: 'female' },
  { id: 'bot_artem',     name: 'Артём Фёдоров',       rating: 840,  avatar: `${BASE}/3a65aab6-8f6a-4844-b61d-1da7e93e1426.jpg`, gender: 'male' },

  // ~900
  { id: 'bot_daria',     name: 'Дарья Соколова',      rating: 890,  avatar: `${BASE}/074a0e9a-dc3d-44a1-8631-4217b763a6b9.jpg`, gender: 'female' },
  { id: 'bot_timur',     name: 'Тимур Хасанов',       rating: 930,  avatar: `${BASE}/a92e6bac-ccc1-4a0b-968b-6f5a70e29a9f.jpg`, gender: 'male' },

  // ~1000
  { id: 'bot_sofia',     name: 'София Белова',        rating: 980,  avatar: `${BASE}/c1b87358-4442-4289-b971-07e21562c61a.jpg`, gender: 'female' },
  { id: 'bot_roman',     name: 'Роман Козлов',        rating: 1010, avatar: `${BASE}/bea0a74e-f8ca-418c-ba56-cd7eee0208ef.jpg`, gender: 'male' },

  // ~1100
  { id: 'bot_marina',    name: 'Марина Сидорова',     rating: 1060, avatar: `${BASE}/d4e60300-044c-4273-8dfc-1c0304176bbc.jpg`, gender: 'female' },
  { id: 'bot_kostya',    name: 'Костя Шапран',        rating: 1090, avatar: `${BASE}/baaffd25-445a-46ab-80f2-a94e1040c804.jpg`, gender: 'male' },
  { id: 'bot_olga',      name: 'Ольга Волкова',       rating: 1120, avatar: `${BASE}/88916f4c-faac-40f4-9a85-83d0b43a4f18.jpg`, gender: 'female' },
  { id: 'bot_alexey',    name: 'Алексей Морозов',     rating: 1150, avatar: `${BASE}/44671dbb-bdc1-409c-aeb4-2fdcbbac751c.jpg`, gender: 'male' },

  // ~1200
  { id: 'bot_irina',     name: 'Ирина Лебедева',      rating: 1180, avatar: `${BASE}/6f1d67e3-1bbe-4552-96fd-ead8d158530d.jpg`, gender: 'female' },
  { id: 'bot_pavel',     name: 'Павел Лебедев',       rating: 1210, avatar: `${BASE}/ce94b60d-00fc-4261-8fd5-bb1e0f0c2f1f.jpg`, gender: 'male' },
  { id: 'bot_elena',     name: 'Елена Новикова',      rating: 1240, avatar: `${BASE}/f74554d5-2bd3-4d29-a71f-87ab539cc349.jpg`, gender: 'female' },
  { id: 'bot_dmitry',    name: 'Дмитрий Козлов',      rating: 1270, avatar: `${BASE}/7ab88765-b02f-4c64-908f-efced77727b8.jpg`, gender: 'male' },

  // ~1350
  { id: 'bot_yulia',     name: 'Юлия Михайлова',      rating: 1310, avatar: `${BASE}/5012d808-3d60-45d0-941a-381ae172baea.jpg`, gender: 'female' },
  { id: 'bot_oleg',      name: 'Олег Романов',        rating: 1350, avatar: `${BASE}/a51009be-44d2-4f9f-9364-859980809f7d.jpg`, gender: 'male' },
  { id: 'bot_tatiana',   name: 'Татьяна Лебедева',    rating: 1390, avatar: `${BASE}/587669c7-8b1a-42a2-a1e1-b4d28b82697a.jpg`, gender: 'female' },
  { id: 'bot_andrey',    name: 'Андрей Кузнецов',     rating: 1420, avatar: `${BASE}/50aad312-c563-4827-b672-db76b97f84b0.jpg`, gender: 'male' },

  // ~1500
  { id: 'bot_nastya',    name: 'Настя Бессонова',     rating: 1460, avatar: `${BASE}/4d2069f3-3c51-4b72-9d10-ffeb0c452d03.jpg`, gender: 'female' },
  { id: 'bot_igor',      name: 'Игорь Петров',        rating: 1500, avatar: `${BASE}/40d5c2cf-3117-4038-a85f-06dc0b2f5886.jpg`, gender: 'male' },
  { id: 'bot_vera',      name: 'Вера Смирнова',       rating: 1540, avatar: `${BASE}/5316eb72-131f-4878-9b52-5207e4ef7b1b.jpg`, gender: 'female' },
  { id: 'bot_sergey',    name: 'Сергей Новиков',      rating: 1580, avatar: `${BASE}/e11afcdf-61ab-4578-a74a-da5b8bec12fb.jpg`, gender: 'male' },

  // ~1700
  { id: 'bot_natalia',   name: 'Наталья Орлова',      rating: 1640, avatar: `${BASE}/3549842e-87ca-4266-87a3-cbe24bdb361d.jpg`, gender: 'female' },
  { id: 'bot_vladimir',  name: 'Владимир Васильев',   rating: 1700, avatar: `${BASE}/447f4eab-6eb1-48f0-b2f8-dc81add9e15d.jpg`, gender: 'male' },
  { id: 'bot_ekaterina', name: 'Екатерина Соколова',  rating: 1750, avatar: `${BASE}/0c3fb5e9-e68a-4777-8e15-6e741193d1fa.jpg`, gender: 'female' },
  { id: 'bot_nikolay',   name: 'Николай Попов',       rating: 1800, avatar: `${BASE}/6d897563-87e3-4415-be2c-9eb403f9cf05.jpg`, gender: 'male' },

  // ~1950
  { id: 'bot_svetlana',  name: 'Светлана Зайцева',    rating: 1870, avatar: `${BASE}/5df4c57a-aa67-402e-b3f4-0aa6844dce26.jpg`, gender: 'female' },
  { id: 'bot_maxim',     name: 'Максим Орлов',        rating: 1940, avatar: `${BASE}/a687f7b1-ff2c-417e-967d-61f53f4dd74c.jpg`, gender: 'male' },

  // ~2100+
  { id: 'bot_anastasia', name: 'Анастасия Белова',    rating: 2030, avatar: `${BASE}/4d2069f3-3c51-4b72-9d10-ffeb0c452d03.jpg`, gender: 'female' },
  { id: 'bot_viktor',    name: 'Виктор Фёдоров',      rating: 2120, avatar: `${BASE}/6d9f9d0e-9901-4765-a4e6-f53eaf057f8d.jpg`, gender: 'male' },
  { id: 'bot_evgenia',   name: 'Евгения Малыхина',    rating: 2250, avatar: `${BASE}/1718c8ac-5dc9-4c02-962d-e961689bebae.jpg`, gender: 'female' },
];

/** Найти ближайшего бота к рейтингу пользователя */
export function findClosestBot(userRating: number): BotProfile {
  return BOTS.reduce((prev, curr) =>
    Math.abs(curr.rating - userRating) < Math.abs(prev.rating - userRating) ? curr : prev
  );
}

export default BOTS;
