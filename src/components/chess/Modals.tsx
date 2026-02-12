import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const russianCities = [
  { city: 'Москва', region: 'Москва' },
  { city: 'Санкт-Петербург', region: 'Санкт-Петербург' },
  { city: 'Новосибирск', region: 'Новосибирская область' },
  { city: 'Екатеринбург', region: 'Свердловская область' },
  { city: 'Казань', region: 'Республика Татарстан' },
  { city: 'Нижний Новгород', region: 'Нижегородская область' },
  { city: 'Челябинск', region: 'Челябинская область' },
  { city: 'Самара', region: 'Самарская область' },
  { city: 'Омск', region: 'Омская область' },
  { city: 'Ростов-на-Дону', region: 'Ростовская область' },
  { city: 'Уфа', region: 'Республика Башкортостан' },
  { city: 'Красноярск', region: 'Красноярский край' },
  { city: 'Воронеж', region: 'Воронежская область' },
  { city: 'Пермь', region: 'Пермский край' },
  { city: 'Волгоград', region: 'Волгоградская область' },
  { city: 'Краснодар', region: 'Краснодарский край' },
  { city: 'Саратов', region: 'Саратовская область' },
  { city: 'Тюмень', region: 'Тюменская область' },
  { city: 'Тольятти', region: 'Самарская область' },
  { city: 'Ижевск', region: 'Удмуртская Республика' },
  { city: 'Барнаул', region: 'Алтайский край' },
  { city: 'Ульяновск', region: 'Ульяновская область' },
  { city: 'Иркутск', region: 'Иркутская область' },
  { city: 'Хабаровск', region: 'Хабаровский край' },
  { city: 'Ярославль', region: 'Ярославская область' },
  { city: 'Владивосток', region: 'Приморский край' },
  { city: 'Махачкала', region: 'Республика Дагестан' },
  { city: 'Томск', region: 'Томская область' },
  { city: 'Оренбург', region: 'Оренбургская область' },
  { city: 'Кемерово', region: 'Кемеровская область' },
  { city: 'Новокузнецк', region: 'Кемеровская область' },
  { city: 'Рязань', region: 'Рязанская область' },
  { city: 'Астрахань', region: 'Астраханская область' },
  { city: 'Набережные Челны', region: 'Республика Татарстан' },
  { city: 'Пенза', region: 'Пензенская область' },
  { city: 'Киров', region: 'Кировская область' },
  { city: 'Липецк', region: 'Липецкая область' },
  { city: 'Чебоксары', region: 'Чувашская Республика' },
  { city: 'Калининград', region: 'Калининградская область' },
  { city: 'Тула', region: 'Тульская область' },
  { city: 'Курск', region: 'Курская область' },
  { city: 'Сочи', region: 'Краснодарский край' },
  { city: 'Ставрополь', region: 'Ставропольский край' },
  { city: 'Улан-Удэ', region: 'Республика Бурятия' },
  { city: 'Тверь', region: 'Тверская область' },
  { city: 'Магнитогорск', region: 'Челябинская область' },
  { city: 'Иваново', region: 'Ивановская область' },
  { city: 'Брянск', region: 'Брянская область' },
  { city: 'Белгород', region: 'Белгородская область' },
  { city: 'Сургут', region: 'Ханты-Мансийский АО' },
  { city: 'Владимир', region: 'Владимирская область' },
  { city: 'Нижний Тагил', region: 'Свердловская область' },
  { city: 'Архангельск', region: 'Архангельская область' },
  { city: 'Чита', region: 'Забайкальский край' },
  { city: 'Калуга', region: 'Калужская область' },
  { city: 'Смоленск', region: 'Смоленская область' },
  { city: 'Волжский', region: 'Волгоградская область' },
  { city: 'Курган', region: 'Курганская область' },
  { city: 'Орёл', region: 'Орловская область' },
  { city: 'Череповец', region: 'Вологодская область' },
  { city: 'Владикавказ', region: 'Республика Северная Осетия' },
  { city: 'Мурманск', region: 'Мурманская область' },
  { city: 'Вологда', region: 'Вологодская область' },
  { city: 'Саранск', region: 'Республика Мордовия' },
  { city: 'Тамбов', region: 'Тамбовская область' },
  { city: 'Якутск', region: 'Республика Саха (Якутия)' },
  { city: 'Грозный', region: 'Чеченская Республика' },
  { city: 'Кострома', region: 'Костромская область' },
  { city: 'Петрозаводск', region: 'Республика Карелия' },
  { city: 'Нижневартовск', region: 'Ханты-Мансийский АО' },
  { city: 'Йошкар-Ола', region: 'Республика Марий Эл' },
  { city: 'Новороссийск', region: 'Краснодарский край' },
  { city: 'Комсомольск-на-Амуре', region: 'Хабаровский край' },
  { city: 'Таганрог', region: 'Ростовская область' },
  { city: 'Сыктывкар', region: 'Республика Коми' },
  { city: 'Братск', region: 'Иркутская область' },
  { city: 'Дзержинск', region: 'Нижегородская область' },
  { city: 'Орск', region: 'Оренбургская область' },
  { city: 'Нальчик', region: 'Кабардино-Балкарская Республика' },
  { city: 'Стерлитамак', region: 'Республика Башкортостан' },
  { city: 'Нижнекамск', region: 'Республика Татарстан' },
  { city: 'Ангарск', region: 'Иркутская область' },
  { city: 'Старый Оскол', region: 'Белгородская область' },
  { city: 'Великий Новгород', region: 'Новгородская область' },
  { city: 'Благовещенск', region: 'Амурская область' },
  { city: 'Энгельс', region: 'Саратовская область' },
  { city: 'Псков', region: 'Псковская область' },
  { city: 'Бийск', region: 'Алтайский край' },
  { city: 'Прокопьевск', region: 'Кемеровская область' },
  { city: 'Рыбинск', region: 'Ярославская область' },
  { city: 'Балаково', region: 'Саратовская область' },
  { city: 'Армавир', region: 'Краснодарский край' },
  { city: 'Северодвинск', region: 'Архангельская область' },
  { city: 'Королёв', region: 'Московская область' },
  { city: 'Сызрань', region: 'Самарская область' },
  { city: 'Норильск', region: 'Красноярский край' },
  { city: 'Петропавловск-Камчатский', region: 'Камчатский край' },
  { city: 'Химки', region: 'Московская область' },
  { city: 'Люберцы', region: 'Московская область' },
  { city: 'Южно-Сахалинск', region: 'Сахалинская область' },
  { city: 'Мытищи', region: 'Московская область' },
  { city: 'Подольск', region: 'Московская область' },
  { city: 'Электросталь', region: 'Московская область' },
  { city: 'Коломна', region: 'Московская область' },
  { city: 'Майкоп', region: 'Республика Адыгея' },
  { city: 'Пятигорск', region: 'Ставропольский край' },
  { city: 'Одинцово', region: 'Московская область' },
  { city: 'Копейск', region: 'Челябинская область' },
  { city: 'Хасавюрт', region: 'Республика Дагестан' },
  { city: 'Новомосковск', region: 'Тульская область' },
  { city: 'Кисловодск', region: 'Ставропольский край' },
  { city: 'Серпухов', region: 'Московская область' },
  { city: 'Новочеркасск', region: 'Ростовская область' },
  { city: 'Первоуральск', region: 'Свердловская область' },
  { city: 'Щёлково', region: 'Московская область' },
  { city: 'Дербент', region: 'Республика Дагестан' },
  { city: 'Назрань', region: 'Республика Ингушетия' },
  { city: 'Невинномысск', region: 'Ставропольский край' },
  { city: 'Димитровград', region: 'Ульяновская область' },
  { city: 'Нефтекамск', region: 'Республика Башкортостан' },
  { city: 'Красногорск', region: 'Московская область' },
  { city: 'Батайск', region: 'Ростовская область' },
  { city: 'Каменск-Уральский', region: 'Свердловская область' },
  { city: 'Новошахтинск', region: 'Ростовская область' },
  { city: 'Кызыл', region: 'Республика Тыва' },
  { city: 'Октябрьский', region: 'Республика Башкортостан' },
  { city: 'Северск', region: 'Томская область' },
  { city: 'Ачинск', region: 'Красноярский край' },
  { city: 'Ноябрьск', region: 'Ямало-Ненецкий АО' },
  { city: 'Новокуйбышевск', region: 'Самарская область' },
  { city: 'Елец', region: 'Липецкая область' },
  { city: 'Сергиев Посад', region: 'Московская область' },
  { city: 'Муром', region: 'Владимирская область' },
  { city: 'Артём', region: 'Приморский край' },
  { city: 'Ковров', region: 'Владимирская область' },
  { city: 'Орехово-Зуево', region: 'Московская область' },
  { city: 'Воткинск', region: 'Удмуртская Республика' },
  { city: 'Новотроицк', region: 'Оренбургская область' },
  { city: 'Каспийск', region: 'Республика Дагестан' },
  { city: 'Березники', region: 'Пермский край' },
  { city: 'Домодедово', region: 'Московская область' },
  { city: 'Обнинск', region: 'Калужская область' },
  { city: 'Железнодорожный', region: 'Московская область' },
  { city: 'Салават', region: 'Республика Башкортостан' },
  { city: 'Зеленодольск', region: 'Республика Татарстан' },
  { city: 'Абакан', region: 'Республика Хакасия' },
  { city: 'Анапа', region: 'Краснодарский край' },
  { city: 'Находка', region: 'Приморский край' },
  { city: 'Елабуга', region: 'Республика Татарстан' },
  { city: 'Пушкино', region: 'Московская область' },
  { city: 'Соликамск', region: 'Пермский край' },
  { city: 'Жуковский', region: 'Московская область' },
  { city: 'Троицк', region: 'Московская область' },
  { city: 'Элиста', region: 'Республика Калмыкия' },
  { city: 'Ухта', region: 'Республика Коми' },
  { city: 'Тобольск', region: 'Тюменская область' },
  { city: 'Новоуральск', region: 'Свердловская область' },
  { city: 'Ессентуки', region: 'Ставропольский край' },
  { city: 'Раменское', region: 'Московская область' },
  { city: 'Черкесск', region: 'Карачаево-Черкесская Республика' },
  { city: 'Междуреченск', region: 'Кемеровская область' },
  { city: 'Сарапул', region: 'Удмуртская Республика' },
  { city: 'Ревда', region: 'Свердловская область' },
  { city: 'Рубцовск', region: 'Алтайский край' },
  { city: 'Минеральные Воды', region: 'Ставропольский край' },
  { city: 'Новочебоксарск', region: 'Чувашская Республика' },
  { city: 'Камышин', region: 'Волгоградская область' },
  { city: 'Арзамас', region: 'Нижегородская область' },
  { city: 'Усолье-Сибирское', region: 'Иркутская область' },
  { city: 'Кинешма', region: 'Ивановская область' },
  { city: 'Тихорецк', region: 'Краснодарский край' },
  { city: 'Канск', region: 'Красноярский край' },
  { city: 'Альметьевск', region: 'Республика Татарстан' },
  { city: 'Ейск', region: 'Краснодарский край' },
  { city: 'Новый Уренгой', region: 'Ямало-Ненецкий АО' },
  { city: 'Глазов', region: 'Удмуртская Республика' },
  { city: 'Асбест', region: 'Свердловская область' },
  { city: 'Ишим', region: 'Тюменская область' },
  { city: 'Усть-Илимск', region: 'Иркутская область' },
  { city: 'Георгиевск', region: 'Ставропольский край' },
  { city: 'Клинцы', region: 'Брянская область' },
  { city: 'Златоуст', region: 'Челябинская область' },
  { city: 'Выборг', region: 'Ленинградская область' },
  { city: 'Чайковский', region: 'Пермский край' },
  { city: 'Россошь', region: 'Воронежская область' },
  { city: 'Горно-Алтайск', region: 'Республика Алтай' },
  { city: 'Магадан', region: 'Магаданская область' },
  { city: 'Бугульма', region: 'Республика Татарстан' },
  { city: 'Буденновск', region: 'Ставропольский край' },
  { city: 'Гатчина', region: 'Ленинградская область' },
  { city: 'Долгопрудный', region: 'Московская область' },
  { city: 'Егорьевск', region: 'Московская область' },
  { city: 'Зеленогорск', region: 'Красноярский край' },
  { city: 'Искитим', region: 'Новосибирская область' },
  { city: 'Лабинск', region: 'Краснодарский край' },
  { city: 'Новоалтайск', region: 'Алтайский край' },
  { city: 'Саров', region: 'Нижегородская область' },
  { city: 'Туймазы', region: 'Республика Башкортостан' },
  { city: 'Урюпинск', region: 'Волгоградская область' },
  { city: 'Чапаевск', region: 'Самарская область' },
  { city: 'Шуя', region: 'Ивановская область' },
  { city: 'Верхняя Пышма', region: 'Свердловская область' },
  { city: 'Выкса', region: 'Нижегородская область' },
  { city: 'Геленджик', region: 'Краснодарский край' },
  { city: 'Дмитров', region: 'Московская область' },
  { city: 'Донецк', region: 'Ростовская область' },
  { city: 'Клин', region: 'Московская область' },
  { city: 'Кстово', region: 'Нижегородская область' },
  { city: 'Кузнецк', region: 'Пензенская область' },
  { city: 'Лысьва', region: 'Пермский край' },
  { city: 'Можайск', region: 'Московская область' },
  { city: 'Ногинск', region: 'Московская область' },
  { city: 'Нягань', region: 'Ханты-Мансийский АО' },
  { city: 'Озёрск', region: 'Челябинская область' },
  { city: 'Павлово', region: 'Нижегородская область' },
  { city: 'Полевской', region: 'Свердловская область' },
  { city: 'Ржев', region: 'Тверская область' },
  { city: 'Тихвин', region: 'Ленинградская область' },
  { city: 'Торжок', region: 'Тверская область' },
  { city: 'Углич', region: 'Ярославская область' },
  { city: 'Узловая', region: 'Тульская область' },
  { city: 'Усинск', region: 'Республика Коми' },
  { city: 'Холмск', region: 'Сахалинская область' },
  { city: 'Чехов', region: 'Московская область' },
  { city: 'Шадринск', region: 'Курганская область' },
  { city: 'Югорск', region: 'Ханты-Мансийский АО' },
  { city: 'Юрга', region: 'Кемеровская область' },
  { city: 'Белово', region: 'Кемеровская область' },
  { city: 'Белорецк', region: 'Республика Башкортостан' },
  { city: 'Биробиджан', region: 'Еврейская автономная область' },
  { city: 'Видное', region: 'Московская область' },
  { city: 'Волхов', region: 'Ленинградская область' },
  { city: 'Воскресенск', region: 'Московская область' },
  { city: 'Всеволожск', region: 'Ленинградская область' },
  { city: 'Дубна', region: 'Московская область' },
  { city: 'Железногорск', region: 'Курская область' },
  { city: 'Заречный', region: 'Пензенская область' },
  { city: 'Звенигород', region: 'Московская область' },
  { city: 'Зеленоград', region: 'Москва' },
  { city: 'Зима', region: 'Иркутская область' },
  { city: 'Ивантеевка', region: 'Московская область' },
  { city: 'Инта', region: 'Республика Коми' },
  { city: 'Кириши', region: 'Ленинградская область' },
  { city: 'Кирово-Чепецк', region: 'Кировская область' },
  { city: 'Киселёвск', region: 'Кемеровская область' },
  { city: 'Когалым', region: 'Ханты-Мансийский АО' },
  { city: 'Конаково', region: 'Тверская область' },
  { city: 'Котлас', region: 'Архангельская область' },
  { city: 'Краснокамск', region: 'Пермский край' },
  { city: 'Лобня', region: 'Московская область' },
  { city: 'Луга', region: 'Ленинградская область' },
  { city: 'Миасс', region: 'Челябинская область' },
  { city: 'Мичуринск', region: 'Тамбовская область' },
  { city: 'Наро-Фоминск', region: 'Московская область' },
  { city: 'Нарьян-Мар', region: 'Ненецкий АО' },
  { city: 'Нерюнгри', region: 'Республика Саха (Якутия)' },
  { city: 'Нефтеюганск', region: 'Ханты-Мансийский АО' },
  { city: 'Николаевск-на-Амуре', region: 'Хабаровский край' },
  { city: 'Новодвинск', region: 'Архангельская область' },
  { city: 'Обь', region: 'Новосибирская область' },
  { city: 'Павловский Посад', region: 'Московская область' },
  { city: 'Печора', region: 'Республика Коми' },
  { city: 'Реутов', region: 'Московская область' },
  { city: 'Ростов', region: 'Ярославская область' },
  { city: 'Севастополь', region: 'Севастополь' },
  { city: 'Североморск', region: 'Мурманская область' },
  { city: 'Североуральск', region: 'Свердловская область' },
  { city: 'Серов', region: 'Свердловская область' },
  { city: 'Сибай', region: 'Республика Башкортостан' },
  { city: 'Советск', region: 'Калининградская область' },
  { city: 'Советская Гавань', region: 'Хабаровский край' },
  { city: 'Сокол', region: 'Вологодская область' },
  { city: 'Солнечногорск', region: 'Московская область' },
  { city: 'Сосновый Бор', region: 'Ленинградская область' },
  { city: 'Ступино', region: 'Московская область' },
  { city: 'Сухой Лог', region: 'Свердловская область' },
  { city: 'Сысерть', region: 'Свердловская область' },
  { city: 'Тайшет', region: 'Иркутская область' },
  { city: 'Туапсе', region: 'Краснодарский край' },
  { city: 'Тулун', region: 'Иркутская область' },
  { city: 'Тутаев', region: 'Ярославская область' },
  { city: 'Уссурийск', region: 'Приморский край' },
  { city: 'Усть-Кут', region: 'Иркутская область' },
  { city: 'Учалы', region: 'Республика Башкортостан' },
  { city: 'Феодосия', region: 'Республика Крым' },
  { city: 'Фрязино', region: 'Московская область' },
  { city: 'Ханты-Мансийск', region: 'Ханты-Мансийский АО' },
  { city: 'Хотьково', region: 'Московская область' },
  { city: 'Черемхово', region: 'Иркутская область' },
  { city: 'Черногорск', region: 'Республика Хакасия' },
  { city: 'Чистополь', region: 'Республика Татарстан' },
  { city: 'Шахты', region: 'Ростовская область' },
  { city: 'Щёлкино', region: 'Республика Крым' },
  { city: 'Электрогорск', region: 'Московская область' },
  { city: 'Электроугли', region: 'Московская область' },
  { city: 'Ялта', region: 'Республика Крым' },
  { city: 'Ялуторовск', region: 'Тюменская область' },
].sort((a, b) => a.city.localeCompare(b.city));

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (value: boolean) => void;
  setIsAuthenticated: (value: boolean) => void;
  setShowGameSettings: (value: boolean) => void;
}

export const AuthModal = ({ 
  showAuthModal, 
  setShowAuthModal, 
  setIsAuthenticated, 
  setShowGameSettings 
}: AuthModalProps) => {
  const [registrationStep, setRegistrationStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('chessUser');
    if (savedUser && showAuthModal) {
      const userData = JSON.parse(savedUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowGameSettings(true);
    }
  }, [showAuthModal, setIsAuthenticated, setShowAuthModal, setShowGameSettings]);

  if (!showAuthModal) return null;

  const filteredCities = citySearch.trim() === '' 
    ? russianCities 
    : russianCities.filter(({ city, region }) => 
        city.toLowerCase().includes(citySearch.toLowerCase()) ||
        region.toLowerCase().includes(citySearch.toLowerCase())
      );

  const handleNextStep = () => {
    if (registrationStep === 1 && userName.trim()) {
      setRegistrationStep(2);
    } else if (registrationStep === 2 && userEmail.trim()) {
      setRegistrationStep(3);
    } else if (registrationStep === 3 && selectedCity) {
      const userData = { name: userName, email: userEmail, city: selectedCity };
      localStorage.setItem('chessUser', JSON.stringify(userData));
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setShowGameSettings(true);
      setRegistrationStep(1);
      setUserName('');
      setUserEmail('');
      setSelectedCity('');
      setCitySearch('');
    }
  };

  const handleBack = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowAuthModal(false)}>
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            {registrationStep > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-gray-600 dark:text-gray-400"
              >
                <Icon name="ChevronLeft" size={24} />
              </Button>
            )}
            <CardTitle className="flex-1 text-center text-gray-900 dark:text-white">
              {registrationStep === 1 && 'Как вас зовут?'}
              {registrationStep === 2 && 'Электронная почта'}
              {registrationStep === 3 && 'Ваш город'}
            </CardTitle>
            {registrationStep > 1 && <div className="w-10" />}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-1.5 w-12 rounded-full transition-colors ${
              registrationStep >= 1 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${
              registrationStep >= 2 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
            <div className={`h-1.5 w-12 rounded-full transition-colors ${
              registrationStep >= 3 ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {registrationStep === 1 && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Введите ваше имя"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
                  autoComplete="name"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                  Пожалуйста, указывайте своё настоящее имя
                </p>
              </div>
              <Button
                className="w-full gradient-primary border-0 text-white h-12"
                onClick={handleNextStep}
                disabled={!userName.trim()}
              >
                Продолжить
                <Icon name="ChevronRight" className="ml-2" size={20} />
              </Button>
            </div>
          )}

          {registrationStep === 2 && (
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.ru"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNextStep()}
                  autoComplete="email"
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                  Мы отправим одноразовый пароль для входа
                </p>
              </div>
              <Button
                className="w-full gradient-primary border-0 text-white h-12"
                onClick={handleNextStep}
                disabled={!userEmail.trim() || !userEmail.includes('@')}
              >
                Продолжить
                <Icon name="ChevronRight" className="ml-2" size={20} />
              </Button>
            </div>
          )}

          {registrationStep === 3 && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Начните вводить название города"
                  value={selectedCity || citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setSelectedCity('');
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {showCityDropdown && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-lg">
                    {filteredCities.length > 0 ? (
                      filteredCities.slice(0, citySearch.length > 0 ? 15 : 50).map(({ city, region }) => (
                        <div
                          key={`${city}-${region}`}
                          className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch('');
                            setShowCityDropdown(false);
                          }}
                        >
                          <div className="text-gray-900 dark:text-white font-medium">{city}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{region}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                        Город не найден
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Button
                className="w-full gradient-primary border-0 text-white h-12"
                onClick={handleNextStep}
                disabled={!selectedCity}
              >
                Завершить регистрацию
                <Icon name="Check" className="ml-2" size={20} />
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Регистрируясь, вы соглашаетесь с правилами сервиса
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

interface GameSettingsModalProps {
  showGameSettings: boolean;
  setShowGameSettings: (value: boolean) => void;
}

export const GameSettingsModal = ({ 
  showGameSettings, 
  setShowGameSettings 
}: GameSettingsModalProps) => {
  if (!showGameSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowGameSettings(false)}>
      <Card className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Icon name="Settings" size={24} />
            Настройки игры
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Контроль времени
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button className="h-20 flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10">
                <Icon name="Zap" size={20} className="text-slate-700 dark:text-white" />
                <span className="text-xs text-slate-900 dark:text-white">Блиц</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">3+2</span>
              </Button>
              <Button className="h-20 flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10">
                <Icon name="Clock" size={20} className="text-slate-700 dark:text-white" />
                <span className="text-xs text-slate-900 dark:text-white">Рапид</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">10+5</span>
              </Button>
              <Button className="h-20 flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-white/10">
                <Icon name="Timer" size={20} className="text-slate-700 dark:text-white" />
                <span className="text-xs text-slate-900 dark:text-white">Классика</span>
                <span className="text-xs text-slate-500 dark:text-gray-400">15+10</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Рейтинговая игра
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                Рейтинговая
              </Button>
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                Дружеская
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Цвет фигур
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                ⚪ Белые
              </Button>
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                ⚫ Черные
              </Button>
              <Button variant="outline" className="border-slate-200 dark:border-white/10">
                🎲 Случайно
              </Button>
            </div>
          </div>

          <Button 
            className="w-full gradient-primary border-0 text-white h-12"
            onClick={() => {
              setShowGameSettings(false);
              alert('Поиск соперника...');
            }}
          >
            <Icon name="Play" className="mr-2" size={20} />
            Начать игру
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};