import React, { useEffect, useMemo, useRef, useState } from 'react';
import { dietAndFitnessApi } from '../../services/api';

// Local fallback library with 60+ everyday veg and non-veg dishes
const localRecipes = [
  // Veg Indian
  { id:'local-veg-1', name:'Vegetable Pulao', is_veg:1, calories:380, cuisine:'Indian', mealType:'Lunch', tags:['rice','one-pot','veg'], ingredients:['Basmati rice','Mixed vegetables','Whole spices','Oil','Salt'], steps:['Rinse rice','Sauté spices & veggies','Add rice & water','Cook covered'] },
  { id:'local-veg-2', name:'Dal Tadka', is_veg:1, calories:290, cuisine:'Indian', mealType:'Dinner', tags:['lentils','protein','veg'], ingredients:['Toor dal','Onion','Tomato','Garlic','Ghee'], steps:['Pressure cook dal','Temper spices','Mix & simmer'] },
  { id:'local-veg-3', name:'Chana Masala', is_veg:1, calories:330, cuisine:'Indian', mealType:'Lunch', tags:['chickpeas','protein'], ingredients:['Chickpeas','Onion','Tomato','Spices'], steps:['Cook chickpeas','Make masala','Combine & simmer'] },
  { id:'local-veg-4', name:'Aloo Gobi', is_veg:1, calories:260, cuisine:'Indian', mealType:'Dinner', tags:['cauliflower','potato'], ingredients:['Cauliflower','Potato','Turmeric','Cumin'], steps:['Sauté spices','Add veggies','Cook till tender'] },
  { id:'local-veg-5', name:'Palak Paneer', is_veg:1, calories:360, cuisine:'Indian', mealType:'Dinner', tags:['paneer','spinach'], ingredients:['Spinach','Paneer','Cream','Garlic'], steps:['Blanch spinach','Blend','Add paneer & simmer'] },
  { id:'local-veg-6', name:'Veg Biryani', is_veg:1, calories:450, cuisine:'Indian', mealType:'Dinner', tags:['rice','veg','spices'], ingredients:['Basmati','Veg mix','Spices','Fried onions'], steps:['Parboil rice','Layer with masala','Dum cook'] },
  { id:'local-veg-7', name:'Idli with Sambar', is_veg:1, calories:320, cuisine:'South Indian', mealType:'Breakfast', tags:['steamed','lentils'], ingredients:['Idli batter','Toor dal','Veggies'], steps:['Steam idlis','Cook sambar','Serve hot'] },
  { id:'local-veg-8', name:'Masala Dosa', is_veg:1, calories:420, cuisine:'South Indian', mealType:'Breakfast', tags:['rice','potato'], ingredients:['Dosa batter','Potato masala'], steps:['Spread dosa','Add masala','Fold & serve'] },
  { id:'local-veg-9', name:'Poha', is_veg:1, calories:280, cuisine:'Indian', mealType:'Breakfast', tags:['flattened rice','quick'], ingredients:['Poha','Onion','Peanuts','Curry leaves'], steps:['Rinse poha','Sauté spices','Mix & steam'] },
  { id:'local-veg-10', name:'Khichdi', is_veg:1, calories:300, cuisine:'Indian', mealType:'Dinner', tags:['comfort','lentils','rice'], ingredients:['Rice','Moong dal','Turmeric','Ghee'], steps:['Wash grains','Pressure cook with spices'] },
  { id:'local-veg-11', name:'Rajma Chawal', is_veg:1, calories:520, cuisine:'North Indian', mealType:'Lunch', tags:['kidney beans','rice'], ingredients:['Rajma','Tomato','Onion','Rice'], steps:['Cook rajma','Make masala','Simmer & serve with rice'] },
  { id:'local-veg-12', name:'Sambar Rice', is_veg:1, calories:380, cuisine:'South Indian', mealType:'Lunch', tags:['lentils','rice'], ingredients:['Rice','Toor dal','Sambar powder'], steps:['Cook dal','Mix with rice & sambar'] },
  { id:'local-veg-13', name:'Curd Rice', is_veg:1, calories:330, cuisine:'South Indian', mealType:'Lunch', tags:['yogurt','cooling'], ingredients:['Rice','Curd','Tempering'], steps:['Mash rice','Add curd','Temper & serve'] },
  { id:'local-veg-14', name:'Bhindi Masala', is_veg:1, calories:230, cuisine:'Indian', mealType:'Dinner', tags:['okra','dry sabzi'], ingredients:['Okra','Onion','Spices'], steps:['Sauté okra','Add masala','Cook'] },
  { id:'local-veg-15', name:'Tofu Stir Fry', is_veg:1, calories:280, cuisine:'Asian', mealType:'Dinner', tags:['tofu','high-protein'], ingredients:['Tofu','Bell peppers','Soy sauce'], steps:['Sear tofu','Stir-fry veggies','Add sauce'] },
  { id:'local-veg-16', name:'Sprouts Salad', is_veg:1, calories:180, cuisine:'Indian', mealType:'Snack', tags:['salad','protein'], ingredients:['Sprouts','Cucumber','Lemon'], steps:['Toss all','Season & serve'] },
  { id:'local-veg-17', name:'Greek Salad', is_veg:1, calories:220, cuisine:'Mediterranean', mealType:'Lunch', tags:['salad','feta'], ingredients:['Cucumber','Tomato','Olives','Feta'], steps:['Chop','Dress','Toss'] },
  { id:'local-veg-18', name:'Hummus Bowl', is_veg:1, calories:350, cuisine:'Middle Eastern', mealType:'Lunch', tags:['chickpeas','dip'], ingredients:['Hummus','Veg toppings','Pita'], steps:['Spread hummus','Top & serve'] },
  { id:'local-veg-19', name:'Oats Porridge', is_veg:1, calories:260, cuisine:'Continental', mealType:'Breakfast', tags:['oats','fiber'], ingredients:['Rolled oats','Milk/Water','Honey'], steps:['Simmer oats','Top fruits'] },
  { id:'local-veg-20', name:'Minestrone Soup', is_veg:1, calories:210, cuisine:'Italian', mealType:'Dinner', tags:['soup','veg'], ingredients:['Veg mix','Pasta','Tomato'], steps:['Sauté','Simmer','Serve'] },
  { id:'local-veg-21', name:'Grilled Veg Sandwich', is_veg:1, calories:300, cuisine:'Continental', mealType:'Snack', tags:['sandwich','veg'], ingredients:['Bread','Grilled veggies','Cheese (opt)'], steps:['Assemble','Grill & serve'] },
  { id:'local-veg-22', name:'Veg Fried Rice', is_veg:1, calories:420, cuisine:'Chinese', mealType:'Lunch', tags:['rice','stir-fry'], ingredients:['Rice','Veg mix','Soy sauce'], steps:['Stir-fry on high heat'] },
  { id:'local-veg-23', name:'Paneer Tikka', is_veg:1, calories:360, cuisine:'Indian', mealType:'Dinner', tags:['paneer','grill'], ingredients:['Paneer','Yogurt','Spices'], steps:['Marinate','Grill/air-fry'] },
  { id:'local-veg-24', name:'Kadai Paneer', is_veg:1, calories:420, cuisine:'Indian', mealType:'Dinner', tags:['paneer','capsicum'], ingredients:['Paneer','Tomato','Kadai masala'], steps:['Prepare gravy','Add paneer & simmer'] },
  { id:'local-veg-25', name:'Vegetable Soup', is_veg:1, calories:140, cuisine:'Continental', mealType:'Dinner', tags:['soup','light'], ingredients:['Veg mix','Stock','Herbs'], steps:['Simmer','Season'] },
  // Non-veg Indian & global
  { id:'local-nv-1', name:'Grilled Chicken Breast', is_veg:0, calories:320, cuisine:'American', mealType:'Dinner', tags:['high-protein','low-fat'], ingredients:['Chicken breast','Olive oil','Herbs'], steps:['Marinate','Grill'] },
  { id:'local-nv-2', name:'Chicken Curry', is_veg:0, calories:480, cuisine:'Indian', mealType:'Dinner', tags:['curry','spiced'], ingredients:['Chicken','Onion','Tomato','Spices'], steps:['Brown chicken','Make gravy','Simmer'] },
  { id:'local-nv-3', name:'Butter Chicken', is_veg:0, calories:600, cuisine:'North Indian', mealType:'Dinner', tags:['creamy','popular'], ingredients:['Chicken','Butter','Cream','Tomato'], steps:['Make makhani sauce','Add chicken'] },
  { id:'local-nv-4', name:'Chicken Biryani', is_veg:0, calories:650, cuisine:'Indian', mealType:'Dinner', tags:['rice','dum'], ingredients:['Basmati','Chicken','Spices'], steps:['Parboil rice','Layer & dum cook'] },
  { id:'local-nv-5', name:'Egg Omelette', is_veg:0, calories:240, cuisine:'Continental', mealType:'Breakfast', tags:['eggs','quick'], ingredients:['Eggs','Onion','Tomato'], steps:['Beat eggs','Cook on pan'] },
  { id:'local-nv-6', name:'Egg Bhurji', is_veg:0, calories:300, cuisine:'Indian', mealType:'Breakfast', tags:['eggs','scramble'], ingredients:['Eggs','Onion','Tomato','Spices'], steps:['Scramble with spices'] },
  { id:'local-nv-7', name:'Fish Curry', is_veg:0, calories:430, cuisine:'Indian', mealType:'Dinner', tags:['fish','coconut (opt)'], ingredients:['Fish','Tamarind/Tomato','Spices'], steps:['Make curry','Add fish','Simmer gently'] },
  { id:'local-nv-8', name:'Grilled Salmon', is_veg:0, calories:520, cuisine:'Continental', mealType:'Dinner', tags:['omega-3','grill'], ingredients:['Salmon','Lemon','Herbs'], steps:['Season','Grill/air-fry'] },
  { id:'local-nv-9', name:'Tuna Salad', is_veg:0, calories:280, cuisine:'Mediterranean', mealType:'Lunch', tags:['salad','protein'], ingredients:['Tuna','Lettuce','Olive oil','Lemon'], steps:['Toss & serve'] },
  { id:'local-nv-10', name:'Prawn Stir-fry', is_veg:0, calories:340, cuisine:'Asian', mealType:'Dinner', tags:['seafood','quick'], ingredients:['Prawns','Garlic','Veg mix'], steps:['Stir-fry on high heat'] },
  { id:'local-nv-11', name:'Mutton Curry', is_veg:0, calories:640, cuisine:'Indian', mealType:'Dinner', tags:['mutton','slow-cook'], ingredients:['Mutton','Onion','Tomato','Spices'], steps:['Brown & slow cook'] },
  { id:'local-nv-12', name:'Chicken Caesar Salad', is_veg:0, calories:390, cuisine:'Continental', mealType:'Lunch', tags:['salad','chicken'], ingredients:['Chicken','Romaine','Caesar dressing'], steps:['Grill chicken','Toss salad'] },
  { id:'local-nv-13', name:'Turkey Sandwich', is_veg:0, calories:330, cuisine:'American', mealType:'Snack', tags:['sandwich','lean'], ingredients:['Turkey slices','Bread','Veggies'], steps:['Assemble & serve'] },
  { id:'local-nv-14', name:'Beef Stir-fry', is_veg:0, calories:520, cuisine:'Asian', mealType:'Dinner', tags:['beef','wok'], ingredients:['Beef','Bell peppers','Soy sauce'], steps:['Sear beef','Stir-fry quickly'] },
  { id:'local-nv-15', name:'Tandoori Chicken', is_veg:0, calories:480, cuisine:'Indian', mealType:'Dinner', tags:['grill','marinated'], ingredients:['Chicken','Yogurt','Spices'], steps:['Marinate','Grill/roast'] },
  { id:'local-nv-16', name:'Chicken Wrap', is_veg:0, calories:420, cuisine:'Mexican', mealType:'Lunch', tags:['wrap','on-the-go'], ingredients:['Tortilla','Grilled chicken','Veg'], steps:['Fill & roll'] },
  { id:'local-nv-17', name:'Shrimp Pasta', is_veg:0, calories:560, cuisine:'Italian', mealType:'Dinner', tags:['pasta','seafood'], ingredients:['Pasta','Shrimp','Garlic','Olive oil'], steps:['Boil pasta','Sauté shrimp','Combine'] },
  { id:'local-nv-18', name:'Egg Curry', is_veg:0, calories:360, cuisine:'Indian', mealType:'Dinner', tags:['egg','curry'], ingredients:['Eggs','Tomato gravy','Spices'], steps:['Make gravy','Add boiled eggs'] },
  { id:'local-nv-19', name:'Fish Tacos', is_veg:0, calories:430, cuisine:'Mexican', mealType:'Dinner', tags:['taco','seafood'], ingredients:['Fish','Tortillas','Slaw'], steps:['Grill fish','Assemble tacos'] },
  { id:'local-nv-20', name:'Chicken Soup', is_veg:0, calories:220, cuisine:'Continental', mealType:'Dinner', tags:['soup','light'], ingredients:['Chicken stock','Veg mix','Herbs'], steps:['Simmer & serve'] },
  // Extra veg/non-veg to exceed 50
  { id:'local-veg-26', name:'Veggie Pasta', is_veg:1, calories:410, cuisine:'Italian', mealType:'Dinner', tags:['pasta','veg'], ingredients:['Pasta','Tomato','Veg'], steps:['Boil pasta','Sauté & mix'] },
  { id:'local-veg-27', name:'Quinoa Salad', is_veg:1, calories:300, cuisine:'Mediterranean', mealType:'Lunch', tags:['quinoa','salad'], ingredients:['Quinoa','Cucumber','Tomato','Lemon'], steps:['Cook quinoa','Toss all'] },
  { id:'local-veg-28', name:'Veg Hakka Noodles', is_veg:1, calories:450, cuisine:'Chinese', mealType:'Dinner', tags:['noodles','stir-fry'], ingredients:['Noodles','Veg mix','Soy sauce'], steps:['Stir-fry on high'] },
  { id:'local-veg-29', name:'Avocado Toast', is_veg:1, calories:320, cuisine:'American', mealType:'Breakfast', tags:['toast','healthy fats'], ingredients:['Bread','Avocado','Lemon'], steps:['Mash & spread'] },
  { id:'local-veg-30', name:'Paneer Bhurji', is_veg:1, calories:360, cuisine:'Indian', mealType:'Lunch', tags:['paneer','scramble'], ingredients:['Paneer','Onion','Tomato'], steps:['Scramble paneer with spices'] },
  { id:'local-nv-21', name:'Keema Masala', is_veg:0, calories:540, cuisine:'Indian', mealType:'Dinner', tags:['minced meat'], ingredients:['Mince','Onion','Tomato','Spices'], steps:['Brown mince','Simmer with masala'] },
  { id:'local-nv-22', name:'Chicken Shawarma', is_veg:0, calories:520, cuisine:'Middle Eastern', mealType:'Dinner', tags:['wrap'], ingredients:['Chicken','Pita','Tahini'], steps:['Marinate & grill','Assemble wrap'] },
  { id:'local-veg-31', name:'Veggie Burrito Bowl', is_veg:1, calories:480, cuisine:'Mexican', mealType:'Lunch', tags:['bowl','beans'], ingredients:['Rice','Beans','Veg','Salsa'], steps:['Assemble bowl'] },
  { id:'local-veg-32', name:'Stuffed Paratha', is_veg:1, calories:420, cuisine:'North Indian', mealType:'Breakfast', tags:['paratha'], ingredients:['Wheat flour','Potato or paneer'], steps:['Stuff & roll','Roast with ghee'] },
  { id:'local-nv-23', name:'Egg Fried Rice', is_veg:0, calories:520, cuisine:'Chinese', mealType:'Lunch', tags:['rice','eggs'], ingredients:['Rice','Eggs','Veg','Sauces'], steps:['Scramble eggs','Stir-fry rice'] },
  { id:'local-nv-24', name:'Grilled Fish with Veg', is_veg:0, calories:450, cuisine:'Continental', mealType:'Dinner', tags:['seafood','grill'], ingredients:['White fish','Veg sides'], steps:['Season & grill','Serve with veg'] },
  { id:'local-veg-33', name:'Tomato Basil Pasta', is_veg:1, calories:430, cuisine:'Italian', mealType:'Dinner', tags:['pasta','tomato'], ingredients:['Pasta','Tomato','Basil'], steps:['Cook pasta','Make sauce','Combine'] },
  { id:'local-veg-34', name:'Mixed Veg Curry', is_veg:1, calories:350, cuisine:'Indian', mealType:'Dinner', tags:['veg curry'], ingredients:['Mixed veg','Onion','Tomato'], steps:['Cook gravy','Add veg & simmer'] },
  { id:'local-nv-25', name:'Chicken Tikka', is_veg:0, calories:480, cuisine:'Indian', mealType:'Dinner', tags:['grill','yogurt'], ingredients:['Chicken','Yogurt','Spices'], steps:['Marinate','Grill skewers'] },
  { id:'local-veg-35', name:'Pav Bhaji', is_veg:1, calories:520, cuisine:'Indian', mealType:'Dinner', tags:['street-food','veg'], ingredients:['Mixed veg','Bhaji masala','Pav'], steps:['Cook bhaji','Toast pav'] },
  { id:'local-veg-36', name:'Veggie Wrap', is_veg:1, calories:360, cuisine:'Mediterranean', mealType:'Lunch', tags:['wrap','veg'], ingredients:['Tortilla','Veg','Hummus'], steps:['Fill & roll'] },
  { id:'local-veg-37', name:'Kitchari (Ayurvedic)', is_veg:1, calories:320, cuisine:'Indian', mealType:'Dinner', tags:['moong dal','rice'], ingredients:['Moong dal','Rice','Ghee','Spices'], steps:['Pressure cook all'] },
  { id:'local-nv-26', name:'Chicken Noodle Soup', is_veg:0, calories:260, cuisine:'American', mealType:'Dinner', tags:['soup','comfort'], ingredients:['Chicken','Noodles','Veg'], steps:['Simmer and serve'] },
  { id:'local-veg-38', name:'Buddha Bowl', is_veg:1, calories:500, cuisine:'Fusion', mealType:'Lunch', tags:['bowl','balanced'], ingredients:['Grains','Protein','Veg','Sauce'], steps:['Assemble balanced bowl'] },
  { id:'local-nv-27', name:'Tandoori Fish', is_veg:0, calories:420, cuisine:'Indian', mealType:'Dinner', tags:['fish','grill'], ingredients:['Fish','Yogurt','Spices'], steps:['Marinate','Grill'] },
  { id:'local-veg-39', name:'Vegetable Upma', is_veg:1, calories:320, cuisine:'South Indian', mealType:'Breakfast', tags:['semolina'], ingredients:['Sooji','Veg','Ghee'], steps:['Roast sooji','Cook with water & veg'] },
  { id:'local-veg-40', name:'Rava Dosa', is_veg:1, calories:380, cuisine:'South Indian', mealType:'Breakfast', tags:['semolina','crispy'], ingredients:['Rava','Rice flour','Spices'], steps:['Make thin batter','Spread & cook'] },
  { id:'local-nv-28', name:'Chicken Kebab Roll', is_veg:0, calories:500, cuisine:'Indian', mealType:'Snack', tags:['kebab','roll'], ingredients:['Paratha','Kebab','Onion'], steps:['Wrap kebab in paratha'] },
  { id:'local-veg-41', name:'Rajma Salad', is_veg:1, calories:250, cuisine:'Indian', mealType:'Lunch', tags:['beans','salad'], ingredients:['Boiled rajma','Veggies','Lemon'], steps:['Toss & serve'] },
  { id:'local-veg-42', name:'Chole Kulche (light)', is_veg:1, calories:480, cuisine:'North Indian', mealType:'Lunch', tags:['chickpeas'], ingredients:['Chole','Kulcha (baked)'], steps:['Cook chole','Serve with kulcha'] },
  { id:'local-veg-43', name:'Veg Thukpa', is_veg:1, calories:350, cuisine:'Tibetan', mealType:'Dinner', tags:['noodle soup'], ingredients:['Noodles','Veg','Stock'], steps:['Simmer broth','Add noodles'] },
  { id:'local-nv-29', name:'Egg Curry Rice Bowl', is_veg:0, calories:520, cuisine:'Indian', mealType:'Lunch', tags:['egg','bowl'], ingredients:['Rice','Egg curry'], steps:['Assemble bowl'] },
  { id:'local-veg-44', name:'Chilli Paneer (dry)', is_veg:1, calories:420, cuisine:'Indo-Chinese', mealType:'Snack', tags:['paneer','stir-fry'], ingredients:['Paneer','Capsicum','Sauces'], steps:['Stir-fry quickly'] },
  { id:'local-veg-45', name:'Tomato Rice', is_veg:1, calories:360, cuisine:'South Indian', mealType:'Lunch', tags:['one-pot'], ingredients:['Rice','Tomato','Spices'], steps:['Cook rice with tomato masala'] },
  { id:'local-veg-46', name:'Moong Dal Chilla', is_veg:1, calories:280, cuisine:'Indian', mealType:'Breakfast', tags:['protein','pancake'], ingredients:['Moong dal batter','Spices'], steps:['Cook thin pancakes'] },
  { id:'local-nv-30', name:'Chicken Quesadilla', is_veg:0, calories:560, cuisine:'Mexican', mealType:'Snack', tags:['cheesy','wrap'], ingredients:['Tortilla','Chicken','Cheese'], steps:['Grill quesadilla'] },
  { id:'local-veg-47', name:'Vegetable Frankie', is_veg:1, calories:420, cuisine:'Indian', mealType:'Snack', tags:['roll','street'], ingredients:['Roti','Veg filling'], steps:['Fill & roll'] },
  { id:'local-veg-48', name:'Peanut Masala', is_veg:1, calories:220, cuisine:'Indian', mealType:'Snack', tags:['peanuts'], ingredients:['Roasted peanuts','Onion','Tomato'], steps:['Toss & season'] },
  { id:'local-nv-31', name:'Tuna Melt Sandwich', is_veg:0, calories:520, cuisine:'American', mealType:'Snack', tags:['sandwich','tuna'], ingredients:['Bread','Tuna','Cheese'], steps:['Assemble & toast'] },
  { id:'local-veg-49', name:'Veg Pulao (Brown Rice)', is_veg:1, calories:360, cuisine:'Indian', mealType:'Lunch', tags:['brown rice','fiber'], ingredients:['Brown rice','Veg','Spices'], steps:['Pressure cook'] },
  { id:'local-nv-32', name:'Egg Sandwich', is_veg:0, calories:360, cuisine:'Continental', mealType:'Breakfast', tags:['eggs','sandwich'], ingredients:['Bread','Boiled eggs','Veg'], steps:['Assemble & serve'] },
  { id:'local-veg-50', name:'Mixed Bean Salad', is_veg:1, calories:310, cuisine:'Mediterranean', mealType:'Lunch', tags:['beans','salad'], ingredients:['Mixed beans','Onion','Olive oil'], steps:['Toss & season'] },
  { id:'local-veg-51', name:'Roasted Veg Bowl', is_veg:1, calories:380, cuisine:'Continental', mealType:'Dinner', tags:['roast','bowl'], ingredients:['Veg mix','Olive oil','Herbs'], steps:['Roast & assemble'] },
  { id:'local-nv-33', name:'Chicken Fried Rice', is_veg:0, calories:620, cuisine:'Chinese', mealType:'Lunch', tags:['rice','chicken'], ingredients:['Rice','Chicken','Egg','Veg'], steps:['Stir-fry on high heat'] },
];

const cuisines = ['any','Indian','North Indian','South Indian','Indo-Chinese','Chinese','Italian','Mediterranean','Middle Eastern','Mexican','American','Asian','Continental','Fusion'];
const mealTypes = ['any','Breakfast','Lunch','Dinner','Snack'];

const RecipeLibrary = () => {
  const [q, setQ] = useState('');
  const [veg, setVeg] = useState('any');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [minCal, setMinCal] = useState('');
  const [maxCal, setMaxCal] = useState('');
  const [tags, setTags] = useState(''); // comma-separated
  const [online, setOnline] = useState(true);
  const [cuisine, setCuisine] = useState('any');
  const [mealType, setMealType] = useState('any');

  const vegParam = useMemo(() => (veg === 'any' ? undefined : (veg === 'veg' ? 1 : 0)), [veg]);

  const passesLocalFilters = (r) => {
    const nameOk = !q || (r.name || '').toLowerCase().includes(q.toLowerCase());
    const vegOk = typeof vegParam === 'undefined' ? true : Number(r.is_veg) === Number(vegParam);
    const calOk = (!minCal || (r.calories||0) >= Number(minCal)) && (!maxCal || (r.calories||0) <= Number(maxCal));
    const tagsOk = !tags || tags.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean).every(t => (r.tags||[]).join(' ').toLowerCase().includes(t));
    const cuisineOk = (cuisine==='any') || ((r.cuisine||'').toLowerCase() === cuisine.toLowerCase());
    const mealOk = (mealType==='any') || ((r.mealType||'').toLowerCase() === mealType.toLowerCase());
    return nameOk && vegOk && calOk && tagsOk && cuisineOk && mealOk;
  };

  const search = async (opts = {}) => {
    try {
      if (!opts.keepSelection) setSelected(null);
      setLoading(true);
      // Local results first
      let results = localRecipes.filter(passesLocalFilters);
      // Optionally merge online results
      if (online) {
        try {
          const { data } = await dietAndFitnessApi.listRecipes(q, vegParam, minCal || undefined, maxCal || undefined, tags || undefined);
          const merge = Array.isArray(data) ? data : [];
          const byName = new Map(results.map(r => [String(r.name||'').toLowerCase(), r]));
          merge.forEach(r => {
            const key = String(r.name||'').toLowerCase();
            if (!byName.has(key)) byName.set(key, { ...r, image: r.image || r.image_url });
          });
          results = Array.from(byName.values());
        } catch (_) {}
      }
      setRecipes(results);
    } finally {
      setLoading(false);
    }
  };

  // Online food image resolver (dish-related)

  // Initial load
  useEffect(() => { search(); }, []);

  // Re-run search automatically when key filters change
  useEffect(() => { search(); }, [vegParam, cuisine, mealType, online]);

  // Debounce query typing so results feel instant without spamming backend
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const term = (q||'').trim();
      if (term.length < 2) {
        setSuggestions([]);
        setShowSuggest(false);
        search({ keepSelection: true });
        return;
      }
      try {
        let suggest = [];
        if (online) {
          const { data } = await dietAndFitnessApi.listOnlineRecipes(term);
          suggest = Array.from(new Map((data || []).map(r => [String(r.name||'').toLowerCase(), r])).values());
        }
        // merge local suggestions too
        const localSuggest = localRecipes.filter(r => (r.name||'').toLowerCase().includes(term.toLowerCase()));
        const byName = new Map([...(suggest||[]), ...localSuggest].map(r => [String(r.name||'').toLowerCase(), r]));
        const list = Array.from(byName.values()).slice(0, 10);
        setSuggestions(list);
        setShowSuggest(list.length>0);
      } catch (_) { setSuggestions([]); setShowSuggest(false); }
      search({ keepSelection: true });
    }, 300);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q, online]);

  // Ensure details exist
  const normalizeRecipe = (r) => {
    const out = { ...r };
    if (!Array.isArray(out.ingredients) || out.ingredients.length === 0) {
      out.ingredients = [
        { name: 'Salt', amount: 'to taste' },
        { name: 'Oil', amount: '1 tbsp' },
        { name: 'Onion', amount: '1 medium (optional)' },
        { name: 'Tomato', amount: '1 medium (optional)' },
        { name: 'Spices', amount: 'as needed' },
      ];
    }
    if (!Array.isArray(out.steps) || out.steps.length === 0) {
      out.steps = [
        'Prepare and chop the ingredients.',
        'Cook base aromatics and add spices.',
        'Add main ingredients and simmer until done.',
        'Taste and adjust seasoning before serving.',
      ];
    }
    return out;
  };

  // --- Online completion for full recipe details ---
  const norm = (s='') => s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  const sim = (a,b) => {
    const stop = new Set(['the','and','with','dish','recipe','curry','masala','of','a','an']);
    const A = new Set(norm(a).split(' ').filter(x=>x && !stop.has(x)));
    const B = new Set(norm(b).split(' ').filter(x=>x && !stop.has(x)));
    if (!A.size || !B.size) return 0;
    let inter = 0; A.forEach(x=>{ if (B.has(x)) inter++; });
    return inter / Math.max(A.size, B.size);
  };

  const fetchMealDBDetails = async (name) => {
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
      if (!res.ok) return null;
      const j = await res.json();
      const meals = j?.meals || [];
      if (!meals.length) return null;
      // pick closest match
      let best = null; let score = 0;
      meals.forEach(m => { const sc = sim(name, m.strMeal||''); if (sc > score) { score = sc; best = m; } });
      const m = best || meals[0];
      const ingredients = [];
      for (let i=1;i<=20;i++) {
        const ing = m[`strIngredient${i}`];
        const meas = m[`strMeasure${i}`];
        if (ing && String(ing).trim()) ingredients.push({ name: String(ing).trim(), amount: String(meas||'').trim() });
      }
      const steps = String(m.strInstructions||'')
        .split(/\r?\n|\./)
        .map(s=>s.trim())
        .filter(Boolean);
      const tags = (m.strTags||'').split(',').map(t=>t?.trim()).filter(Boolean);
      const cuisine = m.strArea || undefined;
      const description = m.strCategory ? `${m.strCategory} • ${m.strArea||''}`.trim() : undefined;
      return { ingredients, steps, tags, cuisine, description };
    } catch { return null; }
  };

  const spicesWords = [
    'salt','chili','chilli','powder','turmeric','cumin','coriander','garam masala','mustard','fenugreek','hing','asafoetida','cardamom','clove','cinnamon','bay leaf','pepper','black pepper','red chilli','kashmiri','paprika','curry powder','curry leaves','ginger','garlic','green chilli','kasuri methi'
  ];
  const vegWords = [
    'onion','tomato','potato','cauliflower','spinach','palak','peas','carrot','beans','capsicum','bell pepper','okra','bhindi','cabbage','broccoli','corn','eggplant','brinjal','mushroom','cucumber','lettuce','beetroot'
  ];
  const dairyWords = ['milk','yogurt','curd','paneer','butter','ghee','cream','cheese'];
  const proteinWords = ['chicken','mutton','beef','fish','prawn','shrimp','egg','tofu','chickpeas','chana','rajma','kidney beans','dal','lentil','turkey'];
  const grainWords = ['rice','flour','atta','maida','bread','tortilla','noodles','pasta','quinoa','poha','suji','semolina','sooji'];

  const isMatch = (name='', list=[]) => {
    const n = name.toLowerCase();
    return list.some(w => n.includes(w));
  };

  const categorizeIngredients = (ings=[]) => {
    const cats = { spices:[], vegetables:[], dairy:[], protein:[], grains:[], other:[] };
    ings.forEach(it => {
      const nm = typeof it === 'string' ? it : (it.name||'');
      const amt = typeof it === 'string' ? '' : (it.amount||'');
      const item = { name:nm, amount:amt };
      if (isMatch(nm, spicesWords)) cats.spices.push(item);
      else if (isMatch(nm, vegWords)) cats.vegetables.push(item);
      else if (isMatch(nm, dairyWords)) cats.dairy.push(item);
      else if (isMatch(nm, proteinWords)) cats.protein.push(item);
      else if (isMatch(nm, grainWords)) cats.grains.push(item);
      else cats.other.push(item);
    });
    return cats;
  };

  const parseDuration = (text='') => {
    const re = /(\d+)\s*(minutes|min|mins|hours|hrs|hour|hr)/ig;
    let m, total=0, found=false;
    while ((m = re.exec(text))) {
      const val = parseInt(m[1],10)||0; const unit = (m[2]||'').toLowerCase();
      if (unit.startsWith('hour') || unit.startsWith('hr')) total += val*60; else total += val;
      found = true;
    }
    return found ? total : null;
  };

  const enrichSteps = (steps=[]) => {
    return steps.map(s => ({ text:s, minutes: parseDuration(s) }));
  };

  const completeRecipe = async (r) => {
    let out = { ...r };
    const needsIngredients = !Array.isArray(out.ingredients) || out.ingredients.length < 3;
    const needsSteps = !Array.isArray(out.steps) || out.steps.length < 3;
    if (needsIngredients || needsSteps) {
      const details = await fetchMealDBDetails(out.name);
      if (details) out = { ...out, ...details };
    }
    out = normalizeRecipe(out);
    out._categories = categorizeIngredients(out.ingredients);
    out._stepsDetailed = enrichSteps(out.steps);
    return out;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recipe Library</h2>
      <div className="flex flex-wrap gap-2 items-center relative">
        <input value={q} onChange={(e)=>{ const v = e.target.value; setQ(v); setShowSuggest(v.trim().length >= 2); }} onBlur={()=> setTimeout(()=>setShowSuggest(false), 150)} placeholder="Search healthy recipes..." className="border rounded px-3 py-2 flex-1 min-w-[200px]" />
        {showSuggest && suggestions.length > 0 && (
          <div className="absolute left-0 top-11 z-20 bg-white border rounded shadow w-full max-w-xl max-h-64 overflow-auto">
            {suggestions.map(s => (
              <div key={s.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onMouseDown={() => { setQ(s.name); setSelected(s); setShowSuggest(false); }}>
                {s.name}
              </div>
            ))}
          </div>
        )}
        <select value={veg} onChange={(e)=>setVeg(e.target.value)} className="border rounded px-3 py-2" aria-label="Veg preference">
          <option value="any">Any</option>
          <option value="veg">Veg</option>
          <option value="nonveg">Non-veg</option>
        </select>
        <select value={cuisine} onChange={(e)=>setCuisine(e.target.value)} className="border rounded px-3 py-2" aria-label="Cuisine">
          {cuisines.map(c => (<option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>))}
        </select>
        <select value={mealType} onChange={(e)=>setMealType(e.target.value)} className="border rounded px-3 py-2" aria-label="Meal type">
          {mealTypes.map(m => (<option key={m} value={m}>{m}</option>))}
        </select>
        <input value={minCal} onChange={(e)=>setMinCal(e.target.value)} type="number" min="0" placeholder="Min cal" className="border rounded px-3 py-2 w-28" />
        <input value={maxCal} onChange={(e)=>setMaxCal(e.target.value)} type="number" min="0" placeholder="Max cal" className="border rounded px-3 py-2 w-28" />
        <input value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="Tags (comma-separated)" className="border rounded px-3 py-2 min-w-[200px]" />
        <label className="flex items-center gap-2 text-sm ml-2">
          <input type="checkbox" checked={online} onChange={(e)=>setOnline(e.target.checked)} />
          Online sources
        </label>
        <button onClick={()=>search()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Search</button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=> (
            <div key={i} className="h-28 rounded bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          <div className="text-sm text-gray-600">Showing {recipes.length} result{recipes.length!==1?'s':''}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map(r => (
              <div key={`${r.id}-${r.name}`} className="rounded border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <div className="font-medium mb-1 truncate" title={r.name}>{r.name}</div>
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                    <span>{r.is_veg ? 'Veg' : 'Non-veg'}</span>
                    {r.cuisine && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.cuisine}</span>}
                    {r.mealType && <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{r.mealType}</span>}
                  </div>
                  <button onClick={async ()=>{
                    const openDetails = async (base) => {
                      let merged = base;
                      try { const { data } = await dietAndFitnessApi.getRecipe(base.id); merged = { ...base, ...data }; } catch {}
                      const completed = await completeRecipe(merged);
                      setSelected(completed);
                    };
                    await openDetails(r);
                  }} className="text-blue-600 text-sm hover:underline">View details</button>
                </div>
              </div>
            ))}
            {recipes.length === 0 && (
              <div className="col-span-full text-center text-gray-600 border rounded p-6">No recipes found. Try a different search.</div>
            )}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-xl font-semibold">{selected.name}</div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                    <span>{selected.is_veg ? 'Veg' : 'Non-veg'}</span>
                    {selected.cuisine && <span className="inline-flex px-2 py-0.5 bg-gray-100 rounded-full">{selected.cuisine}</span>}
                    {selected.mealType && <span className="inline-flex px-2 py-0.5 bg-gray-100 rounded-full">{selected.mealType}</span>}
                    {typeof selected.calories !== 'undefined' && <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">~ {selected.calories} kcal</span>}
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-gray-700" aria-label="Close">✕</button>
              </div>
              {selected.description && <div className="text-sm text-gray-600 mb-3">{selected.description}</div>}
              {!selected.description && <div className="text-sm text-gray-600 mb-3">A simple home-style {selected.name}. Below are typical ingredients and steps.</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="font-medium mb-2">Ingredients</div>
                  {/* Categorized lists */}
                  {selected?._categories ? (
                    <div className="space-y-2 text-sm">
                      {selected._categories.vegetables?.length>0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Vegetables</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selected._categories.vegetables.map((ing,idx)=>(<li key={'veg'+idx}>{ing.name}{ing.amount? ' — '+ing.amount:''}</li>))}
                          </ul>
                        </div>
                      )}
                      {selected._categories.spices?.length>0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Spices & Aromatics</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selected._categories.spices.map((ing,idx)=>(<li key={'sp'+idx}>{ing.name}{ing.amount? ' — '+ing.amount:''}</li>))}
                          </ul>
                        </div>
                      )}
                      {selected._categories.protein?.length>0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Protein & Pulses</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selected._categories.protein.map((ing,idx)=>(<li key={'pr'+idx}>{ing.name}{ing.amount? ' — '+ing.amount:''}</li>))}
                          </ul>
                        </div>
                      )}
                      {selected._categories.grains?.length>0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Grains & Staples</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selected._categories.grains.map((ing,idx)=>(<li key={'gr'+idx}>{ing.name}{ing.amount? ' — '+ing.amount:''}</li>))}
                          </ul>
                        </div>
                      )}
                      {selected._categories.dairy?.length>0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Dairy & Fats</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selected._categories.dairy.map((ing,idx)=>(<li key={'da'+idx}>{ing.name}{ing.amount? ' — '+ing.amount:''}</li>))}
                          </ul>
                        </div>
                      )}
                      {selected._categories.other?.length>0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Other</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {selected._categories.other.map((ing,idx)=>(<li key={'ot'+idx}>{ing.name}{ing.amount? ' — '+ing.amount:''}</li>))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {(selected.ingredients || []).map((ing, idx) => (
                        <li key={idx}>{typeof ing === 'string' ? ing : `${ing.name || ''}${ing.amount ? ' — ' + ing.amount : ''}`}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="font-medium mb-1">Method</div>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    {(selected._stepsDetailed || []).map((s, idx) => (
                      <li key={idx}>
                        <span>{s.text}</span>
                        {s.minutes!=null && <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">≈ {s.minutes} min</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {(selected.tags && selected.tags.length>0) && (
                <div className="mt-4 text-xs text-gray-600 flex flex-wrap gap-2">
                  {(selected.tags||[]).map((t,i)=>(<span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full">{t}</span>))}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">Nutrition values are approximate. Please adjust to your needs.</div>
              <div className="mt-3">
                <a target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline" href={`https://www.google.com/search?q=${encodeURIComponent(selected.name + ' recipe')}`}>See more recipes online</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeLibrary;
