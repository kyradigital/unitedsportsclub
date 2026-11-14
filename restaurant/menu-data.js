const menuData = [
    {
        name: "STARTERS", icon: "zap",
        sections: [
            { type: "VEG", name: "BREAKFAST", items: [
                { n: "Egg (Per Egg)", sizes: { "Plain": 80, "Boiled": 80, "Fried": 80 }, single: true },
                { n: "Parota (4 Pcs)", p: 280 },
                { n: "Tea Masala", p: 100 },
                { n: "Special Coffee", p: 100 },
                { n: "Black Tea", p: 100 },
                { n: "Coffee", p: 100 },
                { n: "Glass Milk", p: 100 },
                { n: "Toast (1 Slice)", p: 20 },
                { n: "Mini Butter (10 Gms)", p: 100 },
                { n: "Butter (250 Gms)", p: 700 }
            ]},
            { type: "VEG", name: "SANDWICHES", items: [
                { n: "Sandwich", sizes: { "Cheese": 500, "Onion": 500, "Tomato": 500 } },
                { n: "Boiled Egg Sandwich", p: 500 },
                { n: "Plain Omelette", p: 350 },
                { n: "Spanish Omelette Sandwich (+Chips)", p: 400 }
            ]},
            { type: "VEG", name: "PANEER STARTERS", items: [
                { n: "Paneer", sizes: { "Chilly": 650, "Pousin": 650 } },
                { n: "Paneer Pokora", p: 650 },
                { n: "Paneer Tikka", p: 500 },
                { n: "Paneer Samosa (6 Pcs)", p: 300 }
            ]},
            { type: "VEG", name: "CHAPATIS", items: [
                { n: "Vegetable Chapati (+Salad)", p: 300 },
                { n: "Egg Chapati Double (+Salad)", p: 350 },
                { n: "Egg Chapati Single (+Salad)", p: 250 },
                { n: "Mutton Kheema Egg Chapati (+Salad)", p: 450 },
                { n: "Cheese Chapati (+Salad)", p: 500 },
                { n: "Cheese Corn Chapati (+Salad)", p: 550 },
                { n: "Veg Cheese Chapati (+Salad)", p: 550 },
                { n: "Paneer Chapati (+Salad)", p: 500 },
                { n: "Chicken Khima Chapati (+Salad)", p: 550 }
            ]},
            { type: "VEG", name: "BHAJIA", items: [
                { n: "Daal Bhajia (8 Pcs)", p: 400 },
                { n: "Maru Bhajia", p: 250 },
                { n: "Chilly Bhajia", p: 250 },
                { n: "Onion Bhajia", p: 250 },
                { n: "Methi Bhajia (8 Pcs)", p: 400 },
                { n: "Gota Bhajia (8 Pcs)", p: 400 },
                { n: "Egg Bhajia (3 Eggs)", p: 350 },
                { n: "Mixed Bhajia", p: 500 }
            ]},
            { type: "VEG", name: "CHIPS", items: [
                { n: "Plain Chips", p: 200 },
                { n: "Periperi Chips", p: 300 },
                { n: "Masala Chips", p: 300 },
                { n: "Pepper Chips", p: 300 },
                { n: "Pepper Dhania Chilly Chips", p: 300 },
                { n: "Pousin Chips", p: 300 }
            ]},
            { type: "VEG", name: "POTATOES", items: [
                { n: "Packed Potatoes (8 Pcs)", p: 400 },
                { n: "Bateta Vada (8 Pcs)", p: 400 },
                { n: "Mashed Potatoes", p: 350 }
            ]},
            { type: "VEG", name: "SIMA", items: [
                { n: "Brown Sima (Atta)", p: 300 },
                { n: "Jeera Sima", p: 300 },
                { n: "Butter Sima", p: 300 },
                { n: "Plain Sima", p: 150 }
            ]},
            { type: "VEG", name: "DRINKS", items: [
                { n: "Lassi", sizes: { "Sweet": 180, "Salted": 180 } },
                { n: "Raitha", p: 250 },
                { n: "Kadhi", p: 300 }
            ]},
            { type: "VEG", name: "OTHERS", items: [
                { n: "Veg Lollipop Normal (8 Pcs)", p: 450 },
                { n: "Veg Lollipop Cheese Special (8 Pcs)", p: 600 },
                { n: "Soya Veg Kebab Normal (3 Pcs)", p: 350 },
                { n: "Soya Veg Kebab Special (3 Pcs)", p: 500 },
                { n: "Gobi Pakora", p: 300 },
                { n: "Egg Plant Chilly", p: 450 },
                { n: "Chilly Baby Corn", p: 450 },
                { n: "Boiled Jugu", p: 250 },
                { n: "Veg Samosa (6 Pcs)", p: 300 },
                { n: "Cassava Pousin", p: 400 },
                { n: "Roasted Garlic", p: 100 },
                { n: "Fried Garlic", p: 100 },
                { n: "Puri (12 Pcs)", p: 360 },
                { n: "Tepla (4 Pcs)", p: 280 },
                { n: "Paneer Manchurian (Dry)", p: 700 },
                { n: "Veg Hara Bhara Kebab (8 Pcs)", p: 600 },
                { n: "Veg Spring Rolls (6 Pcs)", p: 400 },
                { n: "Tandoori Paneer (8 Pcs)", p: 700 }
            ]},
            { type: "NON-VEG", name: "POULTRY", items: [
                { n: "Chicken Tender (Portion)", p: 850 },
                { n: "Chicken Drumsticks (4 Pcs)", p: 600 },
                { n: "Chicken Lollipop (6 Pcs)", p: 600 },
                { n: "Chicken Wings (8 Pcs)", sizes: { "Plain": 600, "Pepper": 700, "Pousin": 700 } },
                { n: "Chicken Sausages (3 Pcs)", sizes: { "Fried": 400, "Roasted": 400 } },
                { n: "Chicken Sausages Spicy (3 Pcs)", sizes: { "Pepper": 500, "Chilly": 500, "Pousin": 500 } },
                { n: "Chicken Kebab (3 Pcs)", sizes: { "Normal": 600, "Special": 700 } },
                { n: "Chicken Mishakiki (Min 4 Skewers)", p: 400 },
                { n: "Tandoori Wings (6 Pcs)", p: 600 },
                { n: "Chilly Chicken", p: 700 },
                { n: "Banjara Kebab Chicken (8 Pcs)", p: 1000 }
            ]},
            { type: "NON-VEG", name: "MUTTON", items: [
                { n: "Mutton Kebab (3 Pcs)", p: 400 },
                { n: "Shish Kebab (3 Pcs)", p: 400 },
                { n: "Black Fried Kebab", p: 400 },
                { n: "Mutton Samosa (6 Pcs)", p: 300 },
                { n: "Mutton Malai Boti", p: 1200 },
                { n: "Mishakiki (4 Sticks Min)", p: 400 }
            ]},
            { type: "NON-VEG", name: "LAMB CHOP", items: [
                { n: "Molo Lamb Chop Grilled (Portion)", p: 1000 }
            ]},
            { type: "NON-VEG", name: "FISH (Red Snapper)", items: [
                { n: "Fish Fingers", p: 1400 },
                { n: "Fish Pakora", p: 1400 },
                { n: "Fish Chilly", p: 1400 },
                { n: "Fish Green Tawa", p: 1400 },
                { n: "Fish Foil", p: 1400 },
                { n: "Fish Tawa (Garlic Butter or Lemon Butter Sauce)", p: 1450 },
                { n: "Fish in Breadcrumb", p: 1400 },
                { n: "Fish Grill", p: 1400 },
                { n: "Fish Tikka", p: 1400 },
                { n: "Fish Corrwalla", p: 1400 },
                { n: "Fish Pousin (+Salads & Chips)", p: 1450 }
            ]}
        ]
    },
    {
        name: "VEG MAINS", icon: "leaf",
        sections: [
            { name: "PANEER SPECIALTIES", items: [
                { n: "Paneer Tikka Butter", p: 1300 },
                { n: "Paneer Matar (Peas)", p: 1300 },
                { n: "Paneer Makhni", p: 1300 },
                { n: "Paneer Handi", p: 900 },
                { n: "Paneer Lababdar", p: 1000 },
                { n: "Paneer Palak", p: 1300 },
                { n: "Paneer Methi Malai", p: 1300 },
                { n: "Paneer Bhurji", p: 1300 }
            ]},
            { name: "EGG SPECIALTIES", items: [
                { n: "Egg (3 Eggs)", sizes: { "Curry": 800, "Mari Methi": 800, "Masala": 800 } },
                { n: "Egg Bhurji (3 Eggs)", p: 800 }
            ]},
            { name: "CURRIES & DAALS", items: [
                { n: "Daal Fry", p: 800 },
                { n: "Daal Makhni", p: 800 },
                { n: "Moong (pojo) Daal", p: 800 },
                { n: "Mixed Vegetables Curry", p: 800 },
                { n: "Aloo Jeera", p: 800 },
                { n: "Aloo Methi Palak", p: 800 },
                { n: "Aloo Matra", p: 1000 },
                { n: "Bengan Bharta (oro)", p: 800 },
                { n: "Lady Fingers (Binda)", p: 800 },
                { n: "Veg Manchurian", p: 600 },
                { n: "Veg Kofta Malai", p: 800 },
                { n: "Veg Mixed Karai", p: 700 },
                { n: "Mchicha (Bhajee)", p: 800 },
                { n: "Hutton Mix", p: 800 },
                { n: "Makai Paka", p: 1100 },
                { n: "Butter Beans", p: 1000 },
                { n: "Githeri", p: 1000 },
                { n: "Matra Masala", p: 1000 },
                { n: "Matra Methi", p: 1000 },
                { n: "Makai Masala", p: 1000 },
                { n: "Soya Veg Khima", p: 800 },
                { n: "Special Cauliflower Curry", p: 800 },
                { n: "Mushroom Curry", p: 900 },
                { n: "Mushroom Foil", p: 1200 },
                { n: "Mushroom Masala", p: 1200 },
                { n: "Kitchiri", sizes: { "Potato Curry": 2500, "Kadhi": 2500 } }
            ]},
            { name: "SALADS", items: [
                { n: "Onion Extra", p: 50 },
                { n: "Plain Salad", p: 250 },
                { n: "Long Salad", p: 250 },
                { n: "Jeera Salad", p: 300 },
                { n: "Kachumbari", p: 300 },
                { n: "Gulab Salad", p: 400 }
            ]},
            { name: "RICE", items: [
                { n: "Plain Rice", p: 250 },
                { n: "Jeera Rice", p: 300 },
                { n: "Vegetable Rice", p: 400 },
                { n: "Butter Rice", p: 400 },
                { n: "Egg Fried Rice", p: 500 },
                { n: "Veg Egg Fried Rice", p: 500 }
            ]}
        ]
    },
    {
        name: "NON-VEG MAINS", icon: "drumstick",
        sections: [
            { name: "CHICKEN (WITH BONES)", items: [
                { n: "Chicken", sizes: { "Half": 950, "Full": 1600 }, styles: ["Mari", "Methi", "Palak", "Jeera"] },
                { n: "Chicken Chilly", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Malai Curry", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Dhania", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Paka", sizes: { "Half": 1000, "Full": 1700 } },
                { n: "Chicken Masala", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Murgh Masala", sizes: { "Full": 1800 } },
                { n: "Chicken Handi", sizes: { "Full": 1800 } },
                { n: "Chicken Fry", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Butter Chicken", sizes: { "Half": 1000, "Full": 1700 } },
                { n: "Chicken Breadcrumb", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Wet Fry", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Tikka Kienyeji", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Choma Kienyeji", sizes: { "Half": 950, "Full": 1600 } },
                { n: "Chicken Tikka Special", sizes: { "Half": 1000, "Full": 1700 } },
                { n: "Chicken Kienyeji", sizes: { "Full": 1800 } },
                { n: "Chicken Khima Kofta", sizes: { "Half": 1200, "Full": 2000 } },
                { n: "Chicken Khima", sizes: { "Half": 1200, "Full": 2000 } },
                { n: "Chicken Steak (+Pepper Sauce, Salad & Chips)", sizes: { "Half": 1000, "Full": 1700 } },
                { n: "Chicken Pousin (+Chips/Salad)", sizes: { "Half": 1000, "Full": 1700 } }
            ]},
            { name: "CHICKEN (BONELESS)", items: [
                { n: "Chicken (Boneless)", p: 1000, styles: ["Mari", "Methi", "Palak", "Jeera"] },
                { n: "Chicken Malai Tawa (Boneless)", p: 1000 },
                { n: "Chicken Malai Curry (Boneless)", p: 1000 },
                { n: "Chicken Paka (Boneless)", p: 1050 },
                { n: "Chicken Chilly (Boneless)", p: 1000 },
                { n: "Chicken Tikka Butter Curry", p: 1050 },
                { n: "Butter Chicken (Boneless)", p: 1050 },
                { n: "Chicken Breadcrumb (Boneless)", p: 1000 },
                { n: "Chicken Masala (Boneless)", p: 1000 },
                { n: "Chicken Tikka Kienyeji (Boneless)", p: 1000 },
                { n: "Chicken Choma Kienyeji (Boneless)", p: 1000 },
                { n: "Chicken Tikka Special (Boneless)", p: 1000 }
            ]},
            { name: "FISH (RED SNAPPER)", items: [
                { n: "Fish Masala", p: 1400 },
                { n: "Fish Paka", p: 1450 },
                { n: "Fish Khima", p: 1400 },
                { n: "Fish", sizes: { "Mari": 1400, "Methi": 1400, "Palak": 1400, "Jeera": 1400 } },
                { n: "Fish Jawar Style", p: 1400 }
            ]},
            { name: "MUTTON", items: [
                { n: "Mutton Khima Masala", sizes: { "Qtr": 750, "Half": 1300, "Full": 2200 } },
                { n: "Mutton Khima Kofta", sizes: { "Qtr": 750, "Half": 1350, "Full": 2200 } },
                { n: "Mutton", sizes: { "Half": 1300, "Full": 2200 }, styles: ["Mari", "Palak", "Methi", "Jeera", "Masala"] },
                { n: "Mutton Tawa Masala", sizes: { "Full": 1500 } },
                { n: "Mutton Handi", sizes: { "Full": 1500 } },
                { n: "Mutton Karai", sizes: { "Half": 1300, "Full": 2200 } }
            ]},
            { name: "PRAWNS", items: [
                { n: "Prawns Masala (Queen)", sizes: { "Qtr": 1300, "Half": 2000, "Full": 3800 } },
                { n: "Prawns Masala (King)", sizes: { "Half": 3000, "Full": 6000 } },
                { n: "Prawns Paka (Queen)", sizes: { "Qtr": 1300, "Half": 2000, "Full": 3800 } },
                { n: "Prawns Paka (King)", sizes: { "Half": 3000, "Full": 6000 } },
                { n: "Prawns Karai (Queen)", sizes: { "Qtr": 1300, "Half": 2000, "Full": 3800 } },
                { n: "Prawns Karai (King)", sizes: { "Half": 3000, "Full": 6000 } },
                { n: "Prawns Tawa (Queen)", sizes: { "Qtr": 1300, "Half": 2000, "Full": 3800 } },
                { n: "Prawns Tawa (King)", sizes: { "Half": 3000, "Full": 6000 } },
                { n: "Prawns Garlic Butter (Queen)", sizes: { "Qtr": 1300, "Half": 2000, "Full": 3800 } },
                { n: "Prawns Garlic Butter (King)", sizes: { "Half": 3000, "Full": 6000 } }
            ]}
        ]
    },
    {
        name: "CHAAT & KULFI", icon: "star",
        sections: [
            { name: "CHAAT", items: [
                { n: "Bhel", p: 350 },
                { n: "Dahi", p: 350 },
                { n: "Masala Dhosa", p: 500 },
                { n: "Pani Puri", p: 350 },
                { n: "Sev Puri", p: 350 },
                { n: "Uttapa", p: 500 },
                { n: "Chana Bateta", p: 450 },
                { n: "Idli Sambar", p: 400 }
            ]},
            { name: "KULFI", items: [
                { n: "Kesar Badam Pista Kulfi", p: 350 },
                { n: "Mango Kulfi", p: 300 }
            ]}
        ]
    },
    {
        name: "ITALIAN", icon: "pizza",
        sections: [
            { name: "PASTA", items: [
                { n: "Chicken Mushroom & Chick Peas Pasta", p: 700 },
                { n: "Penne Alfredo", p: 600 },
                { n: "Shrimp Pasta", p: 700 },
                { n: "Veg Pasta", sizes: { "Red Sauce": 600, "White Sauce": 600, "Pink Sauce": 600 } }
            ]},
            { name: "PIZZA", items: [
                { n: "Chicken Pizza", p: 800 },
                { n: "Margarita Pizza", p: 650 },
                { n: "Veg Pizza", p: 700 }
            ]},
            { name: "OTHER", items: [
                { n: "Crispy Eggplant Parmesan", p: 600 },
                { n: "Falafel with Hummus & Pita", p: 750 },
                { n: "Grilled Halloumi Plate (with Salad)", p: 750 },
                { n: "Mediterranean Garlic Butter Prawns", p: 1500 },
                { n: "Spicy Lebanese Prawns (with Salad)", p: 1500 },
                { n: "Lebanese Garlic Chicken Wings", p: 675 }
            ]}
        ]
    },
    {
        name: "BIRYANI", icon: "utensils",
        sections: [{ name: "BIRYANI (Order 12hrs in advance, Served with Raitha & Kachumbari)", items: [
            { n: "Veg Biriyani", sizes: { "Portion": 900, "Full": 2850 } },
            { n: "Chicken Biriyani (with Bones)", sizes: { "Portion": 1500, "Full": 3000 } },
            { n: "Mutton Biriyani (with Bones)", sizes: { "Portion": 1500, "Full": 3250 } }
        ]}]
    },
    {
        name: "NAAN", icon: "circle-dot",
        sections: [{ name: "NAANS (Min 5)", items: [
            { n: "Plain Naan", p: 150 },
            { n: "Butter Naan", p: 150 },
            { n: "Garlic Naan", p: 150 },
            { n: "Methi Naan", p: 150 },
            { n: "Turbo Naan", p: 150 },
            { n: "Kila Kitu Naan (Methi, Chilies, Garlic, Butter)", p: 150 }
        ]}]
    },
    {
        name: "KOROGA", icon: "flame",
        sections: [{ name: "KOROGA MENU (+Jiko Fee KES 400, Masala Service KES 600)", items: [
            { n: "Fish Koroga", sizes: { "Half": 1400, "Full": 2250 } },
            { n: "Chicken Koroga", sizes: { "Half": 950, "Full": 1600 } },
            { n: "Khima Koroga", sizes: { "Half": 1300, "Full": 2200 } },
            { n: "Mutton Koroga", sizes: { "Half": 1300, "Full": 2200 } },
            { n: "King Prawns Koroga", sizes: { "Half": 3000, "Full": 6000 } },
            { n: "Queen Prawns Koroga", sizes: { "Half": 2000, "Full": 3800 } },
            { n: "Eggs Koroga (Min 10 @ KES 80 each)", p: 800 }
        ]}]
    }
];
