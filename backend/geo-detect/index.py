import json
import urllib.request


CITY_MAP = {
    'Moscow': 'Москва',
    'Saint Petersburg': 'Санкт-Петербург',
    'Novosibirsk': 'Новосибирск',
    'Yekaterinburg': 'Екатеринбург',
    'Kazan': 'Казань',
    'Nizhny Novgorod': 'Нижний Новгород',
    'Chelyabinsk': 'Челябинск',
    'Samara': 'Самара',
    'Omsk': 'Омск',
    'Rostov-on-Don': 'Ростов-на-Дону',
    'Ufa': 'Уфа',
    'Krasnoyarsk': 'Красноярск',
    'Voronezh': 'Воронеж',
    'Perm': 'Пермь',
    'Volgograd': 'Волгоград',
    'Krasnodar': 'Краснодар',
    'Saratov': 'Саратов',
    'Tyumen': 'Тюмень',
    'Tolyatti': 'Тольятти',
    'Izhevsk': 'Ижевск',
    'Barnaul': 'Барнаул',
    'Ulyanovsk': 'Ульяновск',
    'Irkutsk': 'Иркутск',
    'Khabarovsk': 'Хабаровск',
    'Yaroslavl': 'Ярославль',
    'Vladivostok': 'Владивосток',
    'Makhachkala': 'Махачкала',
    'Tomsk': 'Томск',
    'Orenburg': 'Оренбург',
    'Kemerovo': 'Кемерово',
    'Novokuznetsk': 'Новокузнецк',
    'Ryazan': 'Рязань',
    'Astrakhan': 'Астрахань',
    'Penza': 'Пенза',
    'Kirov': 'Киров',
    'Lipetsk': 'Липецк',
    'Balashikha': 'Балашиха',
    'Cheboksary': 'Чебоксары',
    'Kaliningrad': 'Калининград',
    'Tula': 'Тула',
    'Kursk': 'Курск',
    'Stavropol': 'Ставрополь',
    'Sochi': 'Сочи',
    'Tver': 'Тверь',
    'Ivanovo': 'Иваново',
    'Bryansk': 'Брянск',
    'Surgut': 'Сургут',
    'Belgorod': 'Белгород',
    'Vladimir': 'Владимир',
    'Nizhnevartovsk': 'Нижневартовск',
    'Arkhangelsk': 'Архангельск',
    'Kaluga': 'Калуга',
    'Smolensk': 'Смоленск',
    'Kurgan': 'Курган',
    'Chita': 'Чита',
    'Grozny': 'Грозный',
    'Murmansk': 'Мурманск',
    'Tambov': 'Тамбов',
    'Petrozavodsk': 'Петрозаводск',
    'Nizhny Tagil': 'Нижний Тагил',
    'Yoshkar-Ola': 'Йошкар-Ола',
    'Kostroma': 'Кострома',
    'Novorossiysk': 'Новороссийск',
    'Syktyvkar': 'Сыктывкар',
    'Nalchik': 'Нальчик',
    'Pskov': 'Псков',
    'Yakutsk': 'Якутск',
    'Vladikavkaz': 'Владикавказ',
    'Komsomolsk-on-Amur': 'Комсомольск-на-Амуре',
    'Petropavlovsk-Kamchatsky': 'Петропавловск-Камчатский',
    'Norilsk': 'Норильск',
    'Veliky Novgorod': 'Великий Новгород',
    'Saransk': 'Саранск',
    'Vologda': 'Вологда',
    'Magnitogorsk': 'Магнитогорск',
    'Biysk': 'Бийск',
    'Sterlitamak': 'Стерлитамак',
    'Prokopyevsk': 'Прокопьевск',
    'Nizhnevartovsk': 'Нижневартовск',
    'Noyabrsk': 'Ноябрьск',
    'Blagoveshchensk': 'Благовещенск',
    'Yuzhno-Sakhalinsk': 'Южно-Сахалинск',
    'Abakan': 'Абакан',
    'Volzhsky': 'Волжский',
    'Magadan': 'Магадан',
    'Salavat': 'Салават',
    'Nefteyugansk': 'Нефтеюганск',
    'Miass': 'Миасс',
    'Zlatoust': 'Златоуст',
    'Kamensk-Uralsky': 'Каменск-Уральский',
    'Angarsk': 'Ангарск',
    'Bratsk': 'Братск',
    'Engels': 'Энгельс',
}

REGION_MAP = {
    'Moscow': 'Москва',
    'Moscow Oblast': 'Московская область',
    'Saint Petersburg': 'Санкт-Петербург',
    'Leningrad Oblast': 'Ленинградская область',
    'Novosibirsk Oblast': 'Новосибирская область',
    'Sverdlovsk Oblast': 'Свердловская область',
    'Tatarstan': 'Республика Татарстан',
    'Nizhny Novgorod Oblast': 'Нижегородская область',
    'Chelyabinsk Oblast': 'Челябинская область',
    'Samara Oblast': 'Самарская область',
    'Omsk Oblast': 'Омская область',
    'Rostov Oblast': 'Ростовская область',
    'Bashkortostan': 'Республика Башкортостан',
    'Krasnoyarsk Krai': 'Красноярский край',
    'Voronezh Oblast': 'Воронежская область',
    'Perm Krai': 'Пермский край',
    'Volgograd Oblast': 'Волгоградская область',
    'Krasnodar Krai': 'Краснодарский край',
    'Saratov Oblast': 'Саратовская область',
    'Tyumen Oblast': 'Тюменская область',
}


def handler(event, context):
    """Определение города пользователя по IP-адресу"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    hdrs = event.get('headers') or {}
    source_ip = hdrs.get('X-Forwarded-For', hdrs.get('x-forwarded-for', ''))
    if source_ip:
        source_ip = source_ip.split(',')[0].strip()

    if not source_ip:
        source_ip = hdrs.get('X-Real-Ip', hdrs.get('x-real-ip', ''))

    if not source_ip:
        rc = event.get('requestContext') or {}
        identity = rc.get('identity') or {}
        source_ip = identity.get('sourceIp', '')

    print('Detected IP: {}'.format(source_ip))

    if not source_ip or source_ip.startswith('127.') or source_ip.startswith('10.') or source_ip.startswith('192.168.'):
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'city': 'Москва', 'region': 'Москва', 'source': 'default'})
        }

    try:
        url = 'http://ip-api.com/json/{}?fields=city,regionName,country,status&lang=en'.format(source_ip)
        req = urllib.request.Request(url, headers={'User-Agent': 'LigaChess/1.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode('utf-8'))

        if data.get('status') != 'success':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'city': 'Москва', 'region': 'Москва', 'source': 'default'})
            }

        en_city = data.get('city', '')
        en_region = data.get('regionName', '')

        ru_city = CITY_MAP.get(en_city, '')
        ru_region = REGION_MAP.get(en_region, '')

        if not ru_city:
            ru_city = en_city

        if not ru_region:
            ru_region = en_region

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'city': ru_city,
                'region': ru_region,
                'source': 'ip'
            })
        }
    except Exception:
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'city': 'Москва', 'region': 'Москва', 'source': 'default'})
        }