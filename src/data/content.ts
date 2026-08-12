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
  photoCredit: string;
  photoSource: string;
};

export type ImageKind = "specific" | "category";

export type ConversationCard = {
  id: string;
  category: CategoryId;
  label: string;
  english: string;
  number: GrammarNumber;
  image: string;
  sticker: string;
  alt: string;
  imageKind: ImageKind;
  photoCredit: string;
  photoSource: string;
};

export type Country = {
  id: string;
  name: string;
  english: string;
  flagImage: string;
};

export type Language = {
  id: string;
  name: string;
  english: string;
  flagImage: string;
  flagCountry: string;
};

export type Residence = {
  id: string;
  name: string;
  emoji: string;
};

export type ContentChange = {
  id: string;
  action: "quitada" | "cambiada";
  before: string;
  after?: string;
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
    photoCredit: "Thomas Martinsen · Unsplash",
    photoSource: "https://unsplash.com/photos/CrnALaUMSA4",
  },
  {
    id: "sports",
    label: "Deportes",
    english: "Sports",
    emoji: "⚽",
    image: "photos/sports.jpg",
    color: "#4ca866",
    alt: "Un balón de fútbol sobre el césped",
    photoCredit: "Souza Sergio · Unsplash",
    photoSource: "https://unsplash.com/photos/MVNSFzkaxOE",
  },
  {
    id: "food",
    label: "Comida",
    english: "Food",
    emoji: "🥘",
    image: "photos/food.jpg",
    color: "#f29d38",
    alt: "Una mesa con diferentes platos de comida asiática",
    photoCredit: "Hailey Tong · Unsplash",
    photoSource: "https://unsplash.com/photos/_stQKOlfl7M",
  },
  {
    id: "drinks",
    label: "Bebidas",
    english: "Drinks",
    emoji: "🧋",
    image: "photos/drinks.jpg",
    color: "#8f63ce",
    alt: "Una bebida cremosa con perlas de tapioca",
    photoCredit: "Najib Chari · Unsplash",
    photoSource: "https://unsplash.com/photos/AL3uWJvhfWE",
  },
  {
    id: "places",
    label: "Lugares y cultura",
    english: "Places & culture",
    emoji: "🌏",
    image: "photos/places.jpg",
    color: "#20a7bd",
    alt: "Vista de Hong Kong desde Victoria Peak",
    photoCredit: "Christian Lendl · Unsplash",
    photoSource: "https://unsplash.com/photos/Oq6Ng641xTc",
  },
  {
    id: "campus",
    label: "Vida universitaria",
    english: "Campus life",
    emoji: "🎓",
    image: "photos/campus.jpg",
    color: "#7a003c",
    alt: "Un grupo diverso de estudiantes trabajando juntos",
    photoCredit: "Vitaly Gariev · Unsplash",
    photoSource: "https://unsplash.com/photos/kp7qkHTgSKc",
  },
];

const categoryById = Object.fromEntries(
  categories.map((category) => [category.id, category]),
) as Record<CategoryId, Category>;

const specificPhotos: Record<
  string,
  Pick<ConversationCard, "image" | "alt" | "photoCredit" | "photoSource">
> = {
  cake: {
    image: "photos/cards/cake.webp",
    alt: "Una porción grande de tarta de chocolate con trozos de chocolate",
    photoCredit: "K8 · Unsplash",
    photoSource: "https://unsplash.com/photos/q5kN-wNzQDM",
  },
  "watch-football": {
    image: "photos/cards/watch-football.webp",
    alt: "Un joven viendo un partido de fútbol en la televisión",
    photoCredit: "khezez · Pexels",
    photoSource: "https://www.pexels.com/photo/man-watching-soccer-match-intently-indoors-36799150/",
  },
  paella: {
    image: "photos/cards/paella.webp",
    alt: "Una paella grande con arroz, gambas y mejillones",
    photoCredit: "Rook of Arts · Unsplash",
    photoSource: "https://unsplash.com/photos/3hVU03NA4q0",
  },
  "dim-sum": {
    image: "photos/cards/dim-sum.webp",
    alt: "Varias piezas de dim sum servidas en una bandeja",
    photoCredit: "Keji Gao · Unsplash",
    photoSource: "https://unsplash.com/photos/s22ALHSKeys",
  },
  tortilla: {
    image: "photos/cards/tortilla.webp",
    alt: "Una porción de tortilla española con patata",
    photoCredit: "MikeGz · Pexels",
    photoSource: "https://www.pexels.com/photo/photo-of-a-piece-of-spanish-omelette-14941247/",
  },
  churros: {
    image: "photos/cards/churros.webp",
    alt: "Churros con azúcar acompañados de chocolate",
    photoCredit: "Pixabay · Pexels",
    photoSource: "https://www.pexels.com/photo/churos-with-chocolate-dip-372886/",
  },
  cinema: {
    image: "photos/cards/cinema.webp",
    alt: "Filas de butacas rojas en una sala de cine",
    photoCredit: "Tima Miroshnichenko · Pexels",
    photoSource: "https://www.pexels.com/photo/empty-movie-theater-seats-7991303/",
  },
  "hot-water": {
    image: "photos/cards/hot-water.webp",
    alt: "Agua caliente y humeante vertida desde una tetera en una taza",
    photoCredit: "Jahra Tasfia Reza · Pexels",
    photoSource: "https://www.pexels.com/photo/steaming-hot-tea-being-poured-into-cup-indoors-36959434/",
  },
};

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
  image: specificPhotos[id]?.image ?? categoryById[category].image,
  sticker,
  alt: specificPhotos[id]?.alt ?? categoryById[category].alt,
  imageKind: specificPhotos[id] ? "specific" : "category",
  photoCredit: specificPhotos[id]?.photoCredit ?? categoryById[category].photoCredit,
  photoSource: specificPhotos[id]?.photoSource ?? categoryById[category].photoSource,
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
  card("watch-football", "sports", "ver el fútbol", "watching football", "👀⚽"),
  card("tennis", "sports", "jugar al tenis", "playing tennis", "🎾"),
  card("basketball", "sports", "jugar al baloncesto", "playing basketball", "🏀"),
  card("swim", "sports", "nadar", "swimming", "🏊"),
  card("run", "sports", "correr", "running", "🏃"),
  card("cycle", "sports", "montar en bicicleta", "cycling", "🚲"),

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
  card("ice-cream", "food", "el helado", "ice cream", "🍦"),

  card("bubble-tea", "drinks", "el bubble tea", "bubble tea", "🧋"),
  card("tea", "drinks", "el té", "tea", "🍵"),
  card("coffee", "drinks", "el café", "coffee", "☕"),
  card("orange-juice", "drinks", "el zumo de naranja", "orange juice", "🍊"),
  card("hot-chocolate", "drinks", "el chocolate caliente", "hot chocolate", "🍫"),
  card("hot-water", "drinks", "el agua caliente", "hot water", "♨️"),

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
  card("study", "campus", "estudiar", "studying", "📖"),
  card("clubs", "campus", "participar en clubes", "joining clubs", "🎭"),
];

const flagPath = (code: string) => `flags/${code}.svg`;

export const countries: Country[] = [
  { id: "hong-kong", name: "Hong Kong", english: "Hong Kong", flagImage: flagPath("hk") },
  { id: "china", name: "China", english: "Mainland China", flagImage: flagPath("cn") },
  { id: "macao", name: "Macao", english: "Macao", flagImage: flagPath("mo") },
  { id: "taiwan", name: "Taiwán", english: "Taiwan", flagImage: flagPath("tw") },
  { id: "japan", name: "Japón", english: "Japan", flagImage: flagPath("jp") },
  { id: "korea", name: "Corea del Sur", english: "South Korea", flagImage: flagPath("kr") },
  { id: "philippines", name: "Filipinas", english: "Philippines", flagImage: flagPath("ph") },
  { id: "vietnam", name: "Vietnam", english: "Vietnam", flagImage: flagPath("vn") },
  { id: "thailand", name: "Tailandia", english: "Thailand", flagImage: flagPath("th") },
  { id: "malaysia", name: "Malasia", english: "Malaysia", flagImage: flagPath("my") },
  { id: "singapore", name: "Singapur", english: "Singapore", flagImage: flagPath("sg") },
  { id: "indonesia", name: "Indonesia", english: "Indonesia", flagImage: flagPath("id") },
  { id: "india", name: "India", english: "India", flagImage: flagPath("in") },
  { id: "bangladesh", name: "Bangladés", english: "Bangladesh", flagImage: flagPath("bd") },
  { id: "pakistan", name: "Pakistán", english: "Pakistan", flagImage: flagPath("pk") },
  { id: "nepal", name: "Nepal", english: "Nepal", flagImage: flagPath("np") },
  { id: "sri-lanka", name: "Sri Lanka", english: "Sri Lanka", flagImage: flagPath("lk") },
  { id: "kazakhstan", name: "Kazajistán", english: "Kazakhstan", flagImage: flagPath("kz") },
];

export const languages: Language[] = [
  { id: "spanish", name: "español", english: "Spanish", flagImage: flagPath("es"), flagCountry: "España" },
  { id: "english", name: "inglés", english: "English", flagImage: flagPath("gb"), flagCountry: "Reino Unido" },
  { id: "cantonese", name: "cantonés", english: "Cantonese", flagImage: flagPath("hk"), flagCountry: "Hong Kong" },
  { id: "mandarin", name: "mandarín", english: "Mandarin", flagImage: flagPath("cn"), flagCountry: "China" },
  { id: "japanese", name: "japonés", english: "Japanese", flagImage: flagPath("jp"), flagCountry: "Japón" },
  { id: "korean", name: "coreano", english: "Korean", flagImage: flagPath("kr"), flagCountry: "Corea del Sur" },
  { id: "filipino", name: "filipino / tagalo", english: "Filipino / Tagalog", flagImage: flagPath("ph"), flagCountry: "Filipinas" },
  { id: "vietnamese", name: "vietnamita", english: "Vietnamese", flagImage: flagPath("vn"), flagCountry: "Vietnam" },
  { id: "thai", name: "tailandés", english: "Thai", flagImage: flagPath("th"), flagCountry: "Tailandia" },
  { id: "indonesian", name: "indonesio", english: "Indonesian", flagImage: flagPath("id"), flagCountry: "Indonesia" },
  { id: "malay", name: "malayo", english: "Malay", flagImage: flagPath("my"), flagCountry: "Malasia" },
  { id: "hindi", name: "hindi", english: "Hindi", flagImage: flagPath("in"), flagCountry: "India" },
  { id: "bengali", name: "bengalí", english: "Bengali", flagImage: flagPath("bd"), flagCountry: "Bangladés" },
  { id: "urdu", name: "urdu", english: "Urdu", flagImage: flagPath("pk"), flagCountry: "Pakistán" },
  { id: "nepali", name: "nepalí", english: "Nepali", flagImage: flagPath("np"), flagCountry: "Nepal" },
  { id: "tamil", name: "tamil", english: "Tamil", flagImage: flagPath("in"), flagCountry: "India" },
  { id: "kazakh", name: "kazajo", english: "Kazakh", flagImage: flagPath("kz"), flagCountry: "Kazajistán" },
  { id: "russian", name: "ruso", english: "Russian", flagImage: flagPath("ru"), flagCountry: "Rusia" },
  { id: "french", name: "francés", english: "French", flagImage: flagPath("fr"), flagCountry: "Francia" },
  { id: "german", name: "alemán", english: "German", flagImage: flagPath("de"), flagCountry: "Alemania" },
  { id: "italian", name: "italiano", english: "Italian", flagImage: flagPath("it"), flagCountry: "Italia" },
  { id: "portuguese", name: "portugués", english: "Portuguese", flagImage: flagPath("pt"), flagCountry: "Portugal" },
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

export const contentChanges: ContentChange[] = [
  { id: "hike", action: "quitada", before: "hacer senderismo" },
  { id: "empanadas", action: "quitada", before: "las empanadas" },
  { id: "group-work", action: "quitada", before: "trabajar en grupo" },
  { id: "exchange", action: "quitada", before: "hacer un intercambio" },
  { id: "library", action: "cambiada", before: "ir a la biblioteca", after: "estudiar" },
  { id: "sparkling-water", action: "cambiada", before: "el agua con gas", after: "el agua caliente" },
];

export const finalCardAsset = {
  id: "chupa-chups",
  image: "brand/chupa-chups.svg",
  alt: "Logotipo de Chupa Chups",
  photoCredit: "Chupa Chups · Wikimedia Commons",
  photoSource: "https://commons.wikimedia.org/wiki/File:Chupa_Chups_logo.svg",
};

export const photoCredits = [
  { file: "hobbies.jpg", author: "Thomas Martinsen", url: "https://unsplash.com/photos/CrnALaUMSA4" },
  { file: "sports.jpg", author: "Souza Sergio", url: "https://unsplash.com/photos/MVNSFzkaxOE" },
  { file: "food.jpg", author: "Hailey Tong", url: "https://unsplash.com/photos/_stQKOlfl7M" },
  { file: "drinks.jpg", author: "Najib Chari", url: "https://unsplash.com/photos/AL3uWJvhfWE" },
  { file: "places.jpg", author: "Christian Lendl", url: "https://unsplash.com/photos/Oq6Ng641xTc" },
  { file: "campus.jpg", author: "Vitaly Gariev", url: "https://unsplash.com/photos/kp7qkHTgSKc" },
  { file: "cake.webp", author: "K8 · Unsplash", url: "https://unsplash.com/photos/q5kN-wNzQDM" },
  { file: "dim-sum.webp", author: "Keji Gao · Unsplash", url: "https://unsplash.com/photos/s22ALHSKeys" },
  { file: "paella.webp", author: "Rook of Arts · Unsplash", url: "https://unsplash.com/photos/3hVU03NA4q0" },
  { file: "tortilla.webp", author: "MikeGz · Pexels", url: "https://www.pexels.com/photo/photo-of-a-piece-of-spanish-omelette-14941247/" },
  { file: "churros.webp", author: "Pixabay · Pexels", url: "https://www.pexels.com/photo/churos-with-chocolate-dip-372886/" },
  { file: "cinema.webp", author: "Tima Miroshnichenko · Pexels", url: "https://www.pexels.com/photo/empty-movie-theater-seats-7991303/" },
  { file: "watch-football.webp", author: "khezez · Pexels", url: "https://www.pexels.com/photo/man-watching-soccer-match-intently-indoors-36799150/" },
  { file: "hot-water.webp", author: "Jahra Tasfia Reza · Pexels", url: "https://www.pexels.com/photo/steaming-hot-tea-being-poured-into-cup-indoors-36959434/" },
];

export const flagCredit = {
  author: "Flag Icons",
  url: "https://github.com/lipis/flag-icons",
  license: "MIT",
};
