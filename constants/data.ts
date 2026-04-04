
export const CATEGORIES = [
    { id: 'all', title: 'Все', icon: 'grid-outline' },
    { id: 'dresses', title: 'Платья', icon: 'woman-outline' },
    { id: 'furniture', title: 'Мебель', icon: 'bed-outline' },
    { id: 'dishes', title: 'Посуда', icon: 'restaurant-outline' },
    { id: 'decor', title: 'Декор', icon: 'flower-outline' },
  ];

export const ITEMS = [
  { 
    id: '1', 
    title: 'Свадебное платье "Grace"', 
    price: '500 000 сум', 
    category: 'dresses',
    location: 'Ташкент', 
    image: require('../assets/images/dress1.png'),
    description: 'Изысканное платье из нежного кружева с длинным шлейфом. Состояние идеальное.',
    seller: { name: 'Алина', role: 'Прокат свадебных платьев' },
    unit: 'шт', 
    maxQuantity: 1
  },
  { 
    id: '2', 
    title: 'Набор стульев (100 шт)', 
    price: '5 000 сум', 
    category: 'furnutire',
    location: 'Ташкент', 
    image: require('../assets/images/dress2.png'),
    description: 'Стулья в стиле Tiffany, идеально подходят для выездных регистраций.',
    seller: { name: 'Алина', role: 'Прокат свадебных платьев' },
    unit: 'шт',
    maxQuantity: 200
  },
  { 
    id: '3', 
    title: 'Хрустальные бокалы', 
    price: '25 000 сум', 
    category: 'dishes',
    location: 'Самарканд', 
    image: require('../assets/images/dress3.png'),
    description: 'Набор из 50 хрустальных бокалов для шампанского.',
    seller: { name: 'Алина', role: 'Прокат свадебных платьев' },
    unit: 'шт',
    maxQuantity: 200
  },
  { 
    id: '4', 
    title: 'Арка для фотозоны', 
    price: '150 000 сум', 
    category: 'decor',
    location: 'Ташкент', 
    image: require('../assets/images/dress1.png'),
    description: 'Кованая арка, украшенная искусственными цветами премиум качества.',
    seller: { name: 'Алина', role: 'Прокат свадебных платьев' },
    unit: 'шт',
    maxQuantity: 50
  },
];