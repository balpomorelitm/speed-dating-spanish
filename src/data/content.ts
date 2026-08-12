export type GrammarNumber = "singular" | "plural";

export type CategoryId =
  | "hobbies"
  | "sports"
  | "food"
  | "drinks"
  | "places"
  | "campus";

export type Category = {
  id: CategoryId;
  label: string;
  english: string;
  emoji: string;
  image: string;
  color: string;
  alt: string;
};

export type ConversationCard = {
  id: string;
  category: CategoryId;
  label: string;
  english: string;
  number: GrammarNumber;
  image: string;
  sticker: string;
  alt: string;
};

export type Country = {
  id: string;
  name: string;
  english: string;
  flag: string;
};

export type Language = {
  id: string;
  name: string;
  english: string;
  hello: string;
};

export type Residence = {
  id: string;
  name: string;
  emoji: string;
};

export const categories: Category[] = [
  {
    id: "hobbies",
    label: "Aficiones",
    english: "Hobbies",
    emoji: "🎧",
    image: "photos/hobbies.jpg",
    color: "#ff6b5b",
    alt: "Objetos de viaje y aficiones vistos desde arriba",
  },
  {
    id: "sports",
    label: "Deportes",
    english: "Sports",
    emoji: "⚽",
    image: "photos/sports.jpg",
    color: "#4ca866",
    alt: "Un balón de fútbol sobre el césped",
  },
  {
    id: "food",
    label: "Comida",
    english: "Food",
    emoji: "🥘",
    image: "photos/food.jpg",
    color: "#f29d38",
    alt: "Una mesa con diferentes platos de comida asiática",
  },
  {
    id: "drinks",
    label: "Bebidas",
    english: "Drinks",
    emoji: "🧋",
    image: "photos/drinks.jpg",
    color: "#8f63ce",
    alt: "Una bebida cremosa con perlas de tapioca",
  },
  {
    id: "places",
    label: "Lugares y cultura",
    english: "Places & culture",
    emoji: "🌏",
    image: "photos/places.jpg",
    color: "#20a7bd",
    alt: "Vista de Hong Kong desde Victoria Peak",
  },
  {
    id: "campus",
    label: "Vida universitaria",
    english: "Campus life",
    emoji: "🎓",
    image: "photos/campus.jpg",
    color: "#7a003c",
    alt: "Un grupo diverso de estudiantes trabajando juntos",
  },
];

const categoryById = Object.fromEntries(
  categories.map((category) => [category.id, category]),
) as Record<CategoryId, Category>;

const card = (
  id: string,
  category: CategoryId,
  label: string,
  english: string,
  sticker: string,
  number: GrammarNumber = "singular",
): ConversationCard => ({
  id,
  category,
  label,
  english,
  number,
  image: categoryById[category].image,
  sticker,
  alt: categoryById[category].alt,
});

export const conversationCards: ConversationCard[] = [
  card("music", "hobbies", "escuchar música", "listening to music", "🎧"),
  card("dance", "hobbies", "bailar", "dancing", "💃"),
  card("sing", "hobbies", "cantar", "singing", "🎤"),
  card("draw", "hobbies", "dibujar", "drawing", "🎨"),
  card("read", "hobbies", "leer", "reading", "📚"),
  card("cook", "hobbies", "cocinar", "cooking", "👩‍🍳"),
  card("photos", "hobbies", "hacer fotos", "taking photos", "📸"),
  card("travel", "hobbies", "viajar", "travelling", "✈️"),
  card("shopping", "hobbies", "ir de compras", "shopping", "🛍️"),
  card("films", "hobbies", "ver películas", "watching films", "🎬"),
  card("series", "hobbies", "ver series", "watching series", "📺"),
  card("games", "hobbies", "jugar a videojuegos", "playing video games", "🎮"),

  card("play-football", "sports", "jugar al fútbol", "playing football", "⚽"),
  card("watch-football", "sports", "ver el fútbol", "watching football", "📣"),
  card("tennis", "sports", "jugar al tenis", "playing tennis", "🎾"),
  card("basketball", "sports", "jugar al baloncesto", "playing basketball", "🏀"),
  card("swim", "sports", "nadar", "swimming", "🏊"),
  card("run", "sports", "correr", "running", "🏃"),
  card("cycle", "sports", "montar en bicicleta", "cycling", "🚲"),
  card("hike", "sports", "hacer senderismo", "hiking", "🥾"),

  card("cake", "food", "la tarta de chocolate", "chocolate cake", "🍰"),
  card("noodles", "food", "los noodles / fideos", "noodles", "🍜", "plural"),
  card("rice", "food", "el arroz", "rice", "🍚"),
  card("fried-rice", "food", "el arroz frito", "fried rice", "🥡"),
  card("paella", "food", "la paella", "paella", "🥘"),
  card("dim-sum", "food", "el dim sum", "dim sum", "🥟"),
  card("sushi", "food", "el sushi", "sushi", "🍣"),
  card("pizza", "food", "la pizza", "pizza", "🍕"),
  card("tacos", "food", "los tacos", "tacos", "🌮", "plural"),
  card("tortilla", "food", "la tortilla española", "Spanish omelette", "🍳"),
  card("churros", "food", "los churros", "churros", "🥨", "plural"),
  card("empanadas", "food", "las empanadas", "empanadas", "🥟", "plural"),
  card("ice-cream", "food", "el helado", "ice cream", "🍦"),

  card("bubble-tea", "drinks", "el bubble tea", "bubble tea", "🧋"),
  card("tea", "drinks", "el té", "tea", "🍵"),
  card("coffee", "drinks", "el café", "coffee", "☕"),
  card("orange-juice", "drinks", "el zumo de naranja", "orange juice", "🍊"),
  card("hot-chocolate", "drinks", "el chocolate caliente", "hot chocolate", "🍫"),
  card("sparkling-water", "drinks", "el agua con gas", "sparkling water", "💧"),

  card("beach", "places", "la playa", "the beach", "🏖️"),
  card("mountains", "places", "la montaña", "the mountains", "⛰️"),
  card("cinema", "places", "el cine", "the cinema", "🍿"),
  card("museums", "places", "los museos", "museums", "🏛️", "plural"),
  card("theme-parks", "places", "los parques temáticos", "theme parks", "🎢", "plural"),
  card("victoria-peak", "places", "Victoria Peak", "Victoria Peak", "🌃"),
  card("cantopop", "places", "el Cantopop", "Cantopop", "🎶"),
  card("kpop", "places", "el K-pop", "K-pop", "✨"),
  card("latin-music", "places", "la música latina", "Latin music", "🪇"),

  card("study-spanish", "campus", "estudiar español", "studying Spanish", "🇪🇸"),
  card("learn-languages", "campus", "aprender idiomas", "learning languages", "💬"),
  card("friends", "campus", "hacer amigos", "making friends", "🤝"),
  card("group-work", "campus", "trabajar en grupo", "group work", "🧩"),
  card("library", "campus", "ir a la biblioteca", "going to the library", "📖"),
  card("clubs", "campus", "participar en clubes", "joining clubs", "🎭"),
  card("exchange", "campus", "hacer un intercambio", "going on exchange", "🌍"),
];

export const countries: Country[] = [
  { id: "hong-kong", name: "Hong Kong", english: "Hong Kong", flag: "🇭🇰" },
  { id: "china", name: "China", english: "Mainland China", flag: "🇨🇳" },
  { id: "macao", name: "Macao", english: "Macao", flag: "🇲🇴" },
  { id: "taiwan", name: "Taiwán", english: "Taiwan", flag: "🇹🇼" },
  { id: "japan", name: "Japón", english: "Japan", flag: "🇯🇵" },
  { id: "korea", name: "Corea del Sur", english: "South Korea", flag: "🇰🇷" },
  { id: "philippines", name: "Filipinas", english: "Philippines", flag: "🇵🇭" },
  { id: "vietnam", name: "Vietnam", english: "Vietnam", flag: "🇻🇳" },
  { id: "thailand", name: "Tailandia", english: "Thailand", flag: "🇹🇭" },
  { id: "malaysia", name: "Malasia", english: "Malaysia", flag: "🇲🇾" },
  { id: "singapore", name: "Singapur", english: "Singapore", flag: "🇸🇬" },
  { id: "indonesia", name: "Indonesia", english: "Indonesia", flag: "🇮🇩" },
  { id: "india", name: "India", english: "India", flag: "🇮🇳" },
  { id: "bangladesh", name: "Bangladés", english: "Bangladesh", flag: "🇧🇩" },
  { id: "pakistan", name: "Pakistán", english: "Pakistan", flag: "🇵🇰" },
  { id: "nepal", name: "Nepal", english: "Nepal", flag: "🇳🇵" },
  { id: "sri-lanka", name: "Sri Lanka", english: "Sri Lanka", flag: "🇱🇰" },
  { id: "kazakhstan", name: "Kazajistán", english: "Kazakhstan", flag: "🇰🇿" },
];

export const languages: Language[] = [
  { id: "spanish", name: "español", english: "Spanish", hello: "¡Hola!" },
  { id: "english", name: "inglés", english: "English", hello: "Hello!" },
  { id: "cantonese", name: "cantonés", english: "Cantonese", hello: "你好!" },
  { id: "mandarin", name: "mandarín", english: "Mandarin", hello: "你好!" },
  { id: "japanese", name: "japonés", english: "Japanese", hello: "こんにちは!" },
  { id: "korean", name: "coreano", english: "Korean", hello: "안녕하세요!" },
  { id: "filipino", name: "filipino / tagalo", english: "Filipino / Tagalog", hello: "Kumusta!" },
  { id: "vietnamese", name: "vietnamita", english: "Vietnamese", hello: "Xin chào!" },
  { id: "thai", name: "tailandés", english: "Thai", hello: "สวัสดี!" },
  { id: "indonesian", name: "indonesio", english: "Indonesian", hello: "Halo!" },
  { id: "malay", name: "malayo", english: "Malay", hello: "Hai!" },
  { id: "hindi", name: "hindi", english: "Hindi", hello: "नमस्ते!" },
  { id: "bengali", name: "bengalí", english: "Bengali", hello: "নমস্কার!" },
  { id: "urdu", name: "urdu", english: "Urdu", hello: "سلام!" },
  { id: "nepali", name: "nepalí", english: "Nepali", hello: "नमस्ते!" },
  { id: "tamil", name: "tamil", english: "Tamil", hello: "வணக்கம்!" },
  { id: "kazakh", name: "kazajo", english: "Kazakh", hello: "Сәлем!" },
  { id: "russian", name: "ruso", english: "Russian", hello: "Привет!" },
];

export const residences: Residence[] = [
  { id: "kowloon", name: "Kowloon", emoji: "🌆" },
  { id: "mong-kok", name: "Mong Kok", emoji: "🌃" },
  { id: "tsim-sha-tsui", name: "Tsim Sha Tsui", emoji: "🌉" },
  { id: "sha-tin", name: "Sha Tin", emoji: "🏙️" },
  { id: "tai-po", name: "Tai Po", emoji: "🌳" },
  { id: "sai-kung", name: "Sai Kung", emoji: "⛵" },
  { id: "tseung-kwan-o", name: "Tseung Kwan O", emoji: "🏘️" },
  { id: "yuen-long", name: "Yuen Long", emoji: "🌿" },
  { id: "tuen-mun", name: "Tuen Mun", emoji: "🌊" },
  { id: "tsuen-wan", name: "Tsuen Wan", emoji: "🏙️" },
  { id: "wan-chai", name: "Wan Chai", emoji: "🚋" },
  { id: "causeway-bay", name: "Causeway Bay", emoji: "🛍️" },
  { id: "central", name: "Central", emoji: "🏢" },
  { id: "pok-fu-lam", name: "Pok Fu Lam", emoji: "🎓" },
  { id: "kennedy-town", name: "Kennedy Town", emoji: "🌅" },
  { id: "aberdeen", name: "Aberdeen", emoji: "🚤" },
  { id: "lantau", name: "Lantau", emoji: "⛰️" },
  { id: "shenzhen", name: "Shenzhen", emoji: "🚄" },
  { id: "other", name: "otro lugar", emoji: "📍" },
];

export const photoCredits = [
  { file: "hobbies.jpg", author: "Thomas Martinsen", url: "https://unsplash.com/photos/CrnALaUMSA4" },
  { file: "sports.jpg", author: "Souza Sergio", url: "https://unsplash.com/photos/MVNSFzkaxOE" },
  { file: "food.jpg", author: "Hailey Tong", url: "https://unsplash.com/photos/_stQKOlfl7M" },
  { file: "drinks.jpg", author: "Najib Chari", url: "https://unsplash.com/photos/AL3uWJvhfWE" },
  { file: "places.jpg", author: "Christian Lendl", url: "https://unsplash.com/photos/Oq6Ng641xTc" },
  { file: "campus.jpg", author: "Vitaly Gariev", url: "https://unsplash.com/photos/kp7qkHTgSKc" },
  { file: "lollipops.jpg", author: "Jamie Albright", url: "https://unsplash.com/photos/dnMLdR814aA" },
];
