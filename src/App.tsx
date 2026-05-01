/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  BookOpen, 
  X, 
  Flame, 
  Droplet, 
  ChefHat, 
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

// --- Types ---

type Ingredient = 'beef_raw' | 'potato_raw' | 'spaghetti_raw' | 'tomato_raw' | 'pork_raw' | 'cheese_raw' | 'beybread';

type CookedItem = 
  | 'beef_medium_rare' | 'beef_flawless' | 'beef_medium' | 'beef_well_done' 
  | 'potato_cut' | 'potato_fries' 
  | 'spaghetti_cooked' 
  | 'tomato_cut' | 'tomato_sauce' | 'cream_sauce';

type Dish = 'steak_mr' | 'steak_fl' | 'steak_m' | 'steak_wd' | 'spaghetti_tomato' | 'spaghetti_carbonara' | 'french_fries' | 'meatball_spaghetti' | 'beybread' | 'heart';

interface PanState {
  content: string | null; // Can be single ingredient or combination like 'pork_raw+cheese_raw'
  timer: number;
}

interface PotState {
  content: 'spaghetti_raw' | 'spaghetti_cooked' | null;
  timer: number;
}

interface BoardState {
  content: 'tomato_raw' | 'tomato_cut' | 'potato_raw' | 'potato_cut' | null;
  timer: number;
}

interface PrepPlate {
  dish: Dish | null;
  parts: CookedItem[];
}

interface Customer {
  id: number;
  order: Dish;
  status: 'waiting' | 'served' | 'angry' | 'leaving';
  avatar: string;
  waitTime: number; // in milliseconds
  type: 'blue' | 'yellow' | 'pink';
  hasBread?: boolean;
  isShocked?: boolean;
  isHearten?: boolean;
}

// --- Constants ---

const COOK_TIME = 5000; // 5 seconds for most things
const CUT_TIME = 3000; // 3 seconds for cutting
const STEAK_STAGE_TIME = 4000; // 4 seconds per stage

const DISH_LABELS: Record<Dish, string> = {
  steak_mr: 'Steak Medium Rare',
  steak_fl: 'FLAWLESS STEAK ✨',
  steak_m: 'Steak Medium',
  steak_wd: 'Steak Well Done',
  spaghetti_tomato: 'Spaghetti Tomato',
  spaghetti_carbonara: 'Carbonara',
  french_fries: 'French Fries',
  meatball_spaghetti: 'Meatball Spaghetti ⭐',
  beybread: 'Beybread',
  heart: 'Special Heart 💖'
};

const DISH_ICONS: Record<Dish, string> = {
  steak_mr: '🥩',
  steak_fl: '🥩✨',
  steak_m: '🥩',
  steak_wd: '🥩',
  spaghetti_tomato: '🍝🍅',
  spaghetti_carbonara: '🍝🧀',
  french_fries: '🍟',
  meatball_spaghetti: '🌟',
  beybread: '🍞',
  heart: '💖'
};

const INGREDIENT_NAMES: Record<string, string> = {
  beef_raw: 'Wagyu Beef',
  potato_raw: 'Raw Potato',
  spaghetti_raw: 'Spaghetti',
  tomato_raw: 'Tomato',
  pork_raw: 'Minced Pork',
  cheese_raw: 'Cheese'
};

// --- Components ---

export default function App() {
  // Game State
  const [isPaused, setIsPaused] = useState(false);
  const [pans, setPans] = useState<PanState[]>([
    { content: null, timer: 0 },
    { content: null, timer: 0 }
  ]);
  const [pot, setPot] = useState<PotState>({ content: null, timer: 0 });
  const [board, setBoard] = useState<BoardState>({ content: null, timer: 0 });
  const [plates, setPlates] = useState<PrepPlate[]>(new Array(5).fill(null).map(() => ({ dish: null, parts: [] })));
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: string, index?: number } | null>(null);
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipesViewed, setRecipesViewed] = useState(false);
  const [cookbookPage, setCookbookPage] = useState(1);
  const [score, setScore] = useState(0);
  const [empathy, setEmpathy] = useState(0);
  const [dishesServed, setDishesServed] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pinkAngryCount, setPinkAngryCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMichelinEnding, setIsMichelinEnding] = useState(false);
  const [isSocialButterflyEnding, setIsSocialButterflyEnding] = useState(false);
  const [isSuccessEnding, setIsSuccessEnding] = useState(false);
  const [perfectSteakCount, setPerfectSteakCount] = useState(0);
  const [isPerfectSteakEnding, setIsPerfectSteakEnding] = useState(false);
  const [heartServedToYellow, setHeartServedToYellow] = useState(false);
  const [heartServedToBlue, setHeartServedToBlue] = useState(false);
  const [isMiracleEnding, setIsMiracleEnding] = useState(false);
  const [miracleEndingPage, setMiracleEndingPage] = useState(1);
  const [isEnding7, setIsEnding7] = useState(false);
  const [ending7Page, setEnding7Page] = useState(1);

  // Preload ending images
  useEffect(() => {
    const urls = [
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/fail1.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/michelin.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/bestie.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/HE.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/kabedon.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Shunife.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/nife.jpg",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Secret1.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/FV.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/FV2.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Lshock.png",
      "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Shappy1.png"
    ];
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const customerIdRef = useRef(0);
  const clickTimers = useRef<Record<string, number>>({});

  const handleItemInteraction = (type: string, id: number | string, singleAction: () => void, doubleAction: () => void) => {
    const key = `${type}-${id}`;
    if (clickTimers.current[key]) {
      window.clearTimeout(clickTimers.current[key]);
      delete clickTimers.current[key];
      doubleAction();
    } else {
      clickTimers.current[key] = window.setTimeout(() => {
        singleAction();
        delete clickTimers.current[key];
      }, 250);
    }
  };

  // --- Logic ---

  // Helper for order spawning logic (Endless Mode: all dishes available)
  const getNextCustomerOrderAndType = useCallback(() => {
    let order: Dish = 'french_fries';
    let type: 'blue' | 'yellow' | 'pink' = 'blue';

    const rand = Math.random();
    // Equal distribution of Customer types (A, B, C)
    if (rand < 0.33) {
      type = 'yellow'; // Customer A: Free
      order = 'french_fries';
    } else if (rand < 0.66) {
      type = 'blue'; // Customer B: BFF Valt
      // Can order Fries or Spaghettis (Beybread is a gift only)
      const subRand = Math.random();
      if (subRand < 0.33) order = 'french_fries';
      else if (subRand < 0.66) order = 'spaghetti_tomato';
      else order = 'spaghetti_carbonara';
    } else {
      type = 'pink'; // Customer C: Picky husband
      // Orders Steaks or Carbonara
      const subRand = Math.random();
      if (subRand < 0.25) order = 'steak_mr';
      else if (subRand < 0.5) order = 'steak_m';
      else if (subRand < 0.75) order = 'steak_wd';
      else order = 'spaghetti_carbonara';
    }
    
    return { order, type };
  }, []);

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused || isGameOver || isSuccessEnding || isPerfectSteakEnding || isMiracleEnding || isEnding7 || isSocialButterflyEnding) return;

      const TICK = 100;

      // Pans Logic
      setPans(prev => prev.map(p => {
        if (!p.content) return p;
        
        const newTimer = p.timer + TICK;
        let newContent = p.content;

        if (p.content === 'beef_raw' || p.content === 'beef_medium_rare' || p.content === 'beef_flawless' || p.content === 'beef_medium') {
          if (newTimer >= 12500) newContent = 'beef_well_done';
          else if (newTimer >= 8500) newContent = 'beef_medium';
          else if (newTimer >= 8000) newContent = 'beef_flawless';
          else if (newTimer >= 4000) newContent = 'beef_medium_rare';
        } else if (p.content.includes('tomato_cut') && p.content.includes('pork_raw') && newTimer >= COOK_TIME) {
          newContent = 'tomato_sauce';
        } else if (p.content.includes('cheese_raw') && p.content.includes('pork_raw') && newTimer >= COOK_TIME) {
          newContent = 'cream_sauce';
        } else if (p.content === 'potato_cut' && newTimer >= COOK_TIME) {
          newContent = 'potato_fries';
        }

        return { ...p, content: newContent, timer: newTimer };
      }));

      // Board Cutting Logic
      setBoard(prev => {
        if (!prev.content || prev.content.includes('_cut')) return prev;
        const newTimer = prev.timer + TICK;
        if (newTimer >= CUT_TIME) {
          return {
            content: prev.content === 'tomato_raw' ? 'tomato_cut' : 'potato_cut',
            timer: 0
          };
        }
        return { ...prev, timer: newTimer };
      });

      // Pot Logic
      setPot(prev => {
        if (!prev.content || prev.content === 'spaghetti_cooked') return prev;
        const newTimer = prev.timer + TICK;
        if (newTimer >= COOK_TIME) {
          return { content: 'spaghetti_cooked', timer: newTimer };
        }
        return { ...prev, timer: newTimer };
      });

      // Customer Timer Logic
      setCustomers(prev => {
        let pinkJustGotAngry = false;
        const next = prev.map(c => {
          if (c.status !== 'waiting') {
            return { ...c, waitTime: c.waitTime + TICK };
          }
          
          const timeout = c.type === 'pink' ? 50000 : 90000;
          const newWaitTime = c.waitTime + TICK;
          
          if (newWaitTime >= timeout) {
            if (c.type === 'pink') pinkJustGotAngry = true;
            return { ...c, waitTime: 0, status: 'angry' as const };
          }
          
          return { ...c, waitTime: newWaitTime };
        }).filter(c => {
           if ((c.status === 'angry' || c.status === 'served') && c.waitTime >= 3000) return false;
           return true;
        });

        if (pinkJustGotAngry) {
          setPinkAngryCount(curr => curr + 1);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle Game Over
  useEffect(() => {
    if (pinkAngryCount >= 2) {
      setIsGameOver(true);
    }
  }, [pinkAngryCount]);

  // Handle Social Butterfly Ending
  useEffect(() => {
    if (empathy >= 10) {
      setIsSocialButterflyEnding(true);
    }
  }, [empathy]);

  // Handle Success Ending
  useEffect(() => {
    if (score >= 20000) {
      setIsSuccessEnding(true);
    }
  }, [score]);

  // Handle Perfect Steak Ending
  useEffect(() => {
    if (perfectSteakCount >= 5) {
      setIsPerfectSteakEnding(true);
    }
  }, [perfectSteakCount]);

  // Handle Miracle Ending
  useEffect(() => {
    if (heartServedToYellow && heartServedToBlue) {
      setIsMiracleEnding(true);
    }
  }, [heartServedToYellow, heartServedToBlue]);

  // Handle Pink Husband Messages
  const lastCustomerCount = useRef(0);
  useEffect(() => {
    if (customers.length > lastCustomerCount.current) {
        const added = customers[customers.length - 1];
        if (added.status === 'waiting' && added.type === 'pink') {
            setMessage("Serve my husband quickly! He’s very demanding.");
            setTimeout(() => setMessage(null), 4000);
        }
    }
    lastCustomerCount.current = customers.length;
  }, [customers.length]);

  const prevPinkAngryCount = useRef(0);
  useEffect(() => {
    if (pinkAngryCount > prevPinkAngryCount.current) {
        if (pinkAngryCount === 1) {
            setMessage("Don't upset him again!");
            setTimeout(() => setMessage(null), 3000);
        }
        prevPinkAngryCount.current = pinkAngryCount;
    }
  }, [pinkAngryCount]);

  // Customer Manager (Ensures exactly 3 customers)
  useEffect(() => {
    if (isPaused || isGameOver || isSuccessEnding || isPerfectSteakEnding || isMiracleEnding || isEnding7 || isSocialButterflyEnding) return;

    const checkAndSpawn = () => {
      setCustomers(prev => {
        const activeCount = prev.filter(c => c.status === 'waiting' || c.status === 'angry').length;
        if (activeCount < 3) {
          const { order: nextOrder, type: charType } = getNextCustomerOrderAndType();

          const newCustomer: Customer = {
            id: customerIdRef.current++,
            order: nextOrder,
            status: 'waiting',
            avatar: charType === 'blue' 
              ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Vbt.png' 
              : charType === 'yellow'
              ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Fbt.png'
              : 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Lbt.png', 
            waitTime: 0,
            type: charType
          };
          return [...prev, newCustomer];
        }
        return prev;
      });
    };

    const spawnTimer = setInterval(checkAndSpawn, 2000);
    return () => clearInterval(spawnTimer);
  }, [isPaused]);

  // Actions
  const addIngredientToTool = (ing: Ingredient) => {
    if (ing === 'beybread') {
      const targetIdx = plates.findIndex(p => (!p.dish && p.parts.length === 0) || p.dish === 'french_fries');
      if (targetIdx !== -1) {
          setPlates(prev => {
              const next = [...prev];
              if (next[targetIdx].dish === 'french_fries') {
                next[targetIdx] = { dish: 'heart', parts: ['french_fries', 'beybread'] };
              } else {
                next[targetIdx] = { dish: 'beybread', parts: ['beybread'] };
              }
              return next;
          });
          setSelectedItem({ type: 'plate', index: targetIdx });
      } else {
          setMessage("NO EMPTY PLATES!");
          setTimeout(() => setMessage(null), 2000);
      }
      return;
    }
    if (ing === 'beef_raw') {
      const emptyPanIdx = pans.findIndex(p => !p.content);
      if (emptyPanIdx === -1) return;
      setPans(prev => {
        const next = [...prev];
        next[emptyPanIdx] = { content: 'beef_raw', timer: 0 };
        return next;
      });
    } else if (ing === 'pork_raw' || ing === 'cheese_raw') {
        const panIdx = pans.findIndex(p => {
            if (!p.content) return true;
            if (p.content === 'pork_raw' && ing === 'cheese_raw') return true;
            if (p.content === 'cheese_raw' && ing === 'pork_raw') return true;
            if (p.content === 'tomato_cut' && ing === 'pork_raw') return true;
            return false;
        });
        if (panIdx === -1) return;
        setPans(prev => {
            const next = [...prev];
            const currentContent = next[panIdx].content;
            if (!currentContent) {
                next[panIdx] = { content: ing, timer: 0 };
            } else if (currentContent === 'cheese_raw' || currentContent === 'pork_raw' || currentContent === 'tomato_cut') {
                if (!currentContent.includes(ing)) {
                    next[panIdx] = { content: `${currentContent}+${ing}`, timer: 0 };
                }
            }
            return next;
        });
    } else if (ing === 'spaghetti_raw') {
      if (pot.content) return;
      setPot({ content: 'spaghetti_raw', timer: 0 });
    } else if (ing === 'tomato_raw' || ing === 'potato_raw') {
      if (board.content) return;
      setBoard({ content: ing, timer: 0 });
    }
  };

  const handleBoardClick = () => {
    if (!board.content) return;
    if (board.content.includes('_cut')) {
      // Already cut, move to pan or combination
      const panIdx = pans.findIndex(p => {
        if (!p.content) return true;
        if (p.content === 'pork_raw' && board.content === 'tomato_cut') return true;
        return false;
      });
      if (panIdx === -1) return;
      
      setPans(prev => {
        const next = [...prev];
        const currentContent = next[panIdx].content;
        if (!currentContent) {
            next[panIdx] = { content: board.content!, timer: 0 };
        } else if (currentContent === 'pork_raw' && board.content === 'tomato_cut') {
            next[panIdx] = { content: `pork_raw+tomato_cut`, timer: 0 };
        }
        return next;
      });
      setBoard({ content: null, timer: 0 });
    }
  };

  const handlePanClick = (idx: number) => {
    const pan = pans[idx];
    if (!pan.content) return;
    
    // Check if it's high enough stage to plate
    let dish: Dish | null = null;
    if (pan.content === 'beef_medium_rare') dish = 'steak_mr';
    else if (pan.content === 'beef_flawless') dish = 'steak_fl';
    else if (pan.content === 'beef_medium') dish = 'steak_m';
    else if (pan.content === 'beef_well_done') dish = 'steak_wd';
    else if (pan.content === 'potato_fries') dish = 'french_fries';
    else if (pan.content === 'tomato_sauce' || pan.content === 'cream_sauce') {
        const sauceType = pan.content;
        const targetIdx = plates.findIndex(p => p.parts.includes('spaghetti_cooked') && !p.dish);
        if (targetIdx !== -1) {
            setPlates(prev => {
                const next = [...prev];
                next[targetIdx] = { 
                    dish: sauceType === 'tomato_sauce' ? 'spaghetti_tomato' : 'spaghetti_carbonara', 
                    parts: [...next[targetIdx].parts, sauceType as CookedItem] 
                };
                return next;
            });
            setPans(prev => {
                const next = [...prev];
                next[idx] = { content: null, timer: 0 };
                return next;
            });
            return;
        }
    }

    if (dish) {
        const targetIdx = plates.findIndex(p => !p.dish && p.parts.length === 0);
        if (targetIdx !== -1) {
            setPlates(prev => {
                const next = [...prev];
                next[targetIdx] = { dish: dish, parts: [pan.content as CookedItem] };
                return next;
            });
            setPans(prev => {
                const next = [...prev];
                next[idx] = { content: null, timer: 0 };
                return next;
            });
        }
    }
  };

  const handlePotClick = () => {
    if (pot.content === 'spaghetti_cooked') {
      const emptyIdx = plates.findIndex(p => !p.dish && p.parts.length === 0);
      if (emptyIdx !== -1) {
        setPlates(prev => {
          const next = [...prev];
          next[emptyIdx] = { dish: null, parts: ['spaghetti_cooked'] };
          return next;
        });
        setPot({ content: null, timer: 0 });
      }
    }
  };

  const handlePlateClick = (idx: number) => {
    if (selectedItem?.type === 'plate' && selectedItem.index !== undefined) {
        const sourceIdx = selectedItem.index;
        const sourcePlate = plates[sourceIdx];
        const targetPlate = plates[idx];

        if (sourceIdx === idx) {
            setSelectedItem(null);
            return;
        }

        // Combination Logic: Steak + Spaghetti Tomato = Meatball Spaghetti
        const isSteak = (dish: Dish | null) => dish === 'steak_mr' || dish === 'steak_m' || dish === 'steak_wd';
        const isSpaghettiTomato = (dish: Dish | null) => dish === 'spaghetti_tomato';

        const canCombine = (isSteak(sourcePlate.dish) && isSpaghettiTomato(targetPlate.dish)) ||
                            (isSpaghettiTomato(sourcePlate.dish) && isSteak(targetPlate.dish));

        if (canCombine) {
            setPlates(prev => {
                const next = [...prev];
                next[idx] = { dish: 'meatball_spaghetti', parts: [...sourcePlate.parts, ...targetPlate.parts] };
                next[sourceIdx] = { dish: null, parts: [] };
                return next;
            });
            setSelectedItem(null);
            setMessage("SECRET RECIPE DISCOVERED! 🌟");
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        // Otherwise just switch selection
        if (targetPlate.dish || targetPlate.parts.length > 0) {
            setSelectedItem({ type: 'plate', index: idx });
        } else {
            setSelectedItem(null);
        }
    } else if (plates[idx].dish || plates[idx].parts.length > 0) {
        setSelectedItem({ type: 'plate', index: idx });
    }
  };

  const serveCustomer = (customer: Customer) => {
    if (selectedItem?.type !== 'plate') return;
    const plateIdx = selectedItem.index!;
    const plate = plates[plateIdx];

    if (customer.status !== 'waiting') return;

    // High Priority: Special Logic for Beybread (Gift for Valt)
    if (plate.dish === 'beybread') {
      if (customer.type === 'blue') {
        const specialMsg = "Go shoot! Valt's favorite Beybread is served! 😘";
        setMessage(specialMsg);
        setTimeout(() => setMessage(null), 3000);
        
        // Give bread but don't finish order
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, hasBread: true } : c));
        setEmpathy(e => e + 1);
        setPlates(prev => {
          const next = [...prev];
          next[plateIdx] = { dish: null, parts: [] };
          return next;
        });
        setSelectedItem(null);
      } else {
        setMessage("WRONG ORDER!");
        setTimeout(() => setMessage(null), 2000);
        setSelectedItem(null);
      }
      return;
    }

    // Michelin Ending condition
    if (plate.dish === 'meatball_spaghetti' && customer.type === 'yellow') {
      setIsMichelinEnding(true);
      return;
    }

    if (plate.dish === 'heart') {
        if (customer.type === 'pink') {
            setMessage("WRONG ORDER!");
            setTimeout(() => setMessage(null), 2000);
            return;
        }
        
        // Serve heart but don't finish order
        setEmpathy(prev => prev + 1);
        if (customer.type === 'yellow') {
            setHeartServedToYellow(true);
            setMessage("HEART SHARED WITH FREE! 💖");
        } else if (customer.type === 'blue') {
            if (heartServedToYellow) {
                setHeartServedToBlue(true);
                setMessage("MIRACLE CONNECTION! 💖✨");
            } else {
                setMessage("HEART SHARED WITH VALT! 💖");
            }
        }
        
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, isHearten: true } : c));
        setPlates(prev => {
            const next = [...prev];
            next[plateIdx] = { dish: null, parts: [] };
            return next;
        });
        setSelectedItem(null);
        setTimeout(() => setMessage(null), 3000);
        return;
    }

    if (plate.dish === customer.order) {
      let reward = 150;
      if (customer.order === 'french_fries') {
        reward = 200;
      } else if (customer.order?.includes('spaghetti')) {
        reward = 350;
      } else if (customer.type === 'pink') {
        reward = 520;
      }

      const newScore = score + reward;
      setDishesServed(prev => prev + 1);
      
      setScore(newScore);
      setMessage(`PERFECT! SERVED! +${reward} GOLD | +0 EMPATHY`);

      setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: 'served', waitTime: 0 } : c));
      setPlates(prev => {
        const next = [...prev];
        next[plateIdx] = { dish: null, parts: [] };
        return next;
      });
      setSelectedItem(null);
      setTimeout(() => setMessage(null), 2000);
    } else if (customer.type === 'pink' && customer.order.startsWith('steak') && plate.dish === 'steak_fl') {
        // Special Flawless Steak Logic for Picky Husband
        const reward = 2309;
        setScore(prev => prev + reward);
        setDishesServed(prev => prev + 1);
        setPerfectSteakCount(prev => prev + 1);
        setMessage("SHOCKED! PERFECT FLAWLESS STEAK! +2309");
        
        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: 'served', waitTime: 0, isShocked: true } : c));
        setPlates(prev => {
            const next = [...prev];
            next[plateIdx] = { dish: null, parts: [] };
            return next;
        });
        setSelectedItem(null);
        setTimeout(() => setMessage(null), 3000);
    } else {
        // Ending 7 Trigger: Picky Husband wants MR but gets WD
        if (customer.type === 'pink' && customer.order === 'steak_mr' && plate.dish === 'steak_wd') {
            setIsEnding7(true);
            return;
        }

        setMessage("WRONG ORDER!");
        setTimeout(() => setMessage(null), 2000);
        setSelectedItem(null);
    }
  };

  const clearTool = (tool: 'pan' | 'pot' | 'board', idx?: number) => {
    if (tool === 'pan' && idx !== undefined) {
      setPans(prev => {
        const next = [...prev];
        next[idx] = { content: null, timer: 0 };
        return next;
      });
    }
    if (tool === 'pot') setPot({ content: null, timer: 0 });
    if (tool === 'board') setBoard({ content: null, timer: 0 });
    setSelectedItem(null);
  };

  const handleTrash = () => {
    if (!selectedItem) return;
    if (selectedItem.type === 'plate') {
      setPlates(prev => {
        const next = [...prev];
        next[selectedItem.index!] = { dish: null, parts: [] };
        return next;
      });
    } else if (selectedItem.type === 'pan') {
      setPans(prev => {
        const next = [...prev];
        next[selectedItem.index!] = { content: null, timer: 0 };
        return next;
      });
    } else if (selectedItem.type === 'pot') {
      setPot({ content: null, timer: 0 });
    } else if (selectedItem.type === 'board') {
      setBoard({ content: null, timer: 0 });
    }
    setSelectedItem(null);
  };

  // Helper for stage colors
  const getBeefColor = (item: string | null) => {
    if (item === 'beef_raw') return 'bg-red-400';
    if (item === 'beef_medium_rare') return 'bg-orange-600';
    if (item === 'beef_flawless') return 'bg-amber-400 ring-4 ring-amber-200 ring-inset shadow-[0_0_15px_rgba(251,191,36,0.8)]';
    if (item === 'beef_medium') return 'bg-amber-800';
    if (item === 'beef_well_done') return 'bg-stone-900';
    return '';
  };

  // Helper for beef labels
  const getBeefLabel = (item: string | null) => {
    if (item === 'beef_medium_rare' || item === 'steak_mr') return 'MR';
    if (item === 'beef_flawless' || item === 'steak_fl') return '✨';
    if (item === 'beef_medium' || item === 'steak_m') return 'M';
    if (item === 'beef_well_done' || item === 'steak_wd') return 'WD';
    return '';
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 overflow-hidden relative selection:bg-amber-200">
      {/* --- Top Bar: Customers --- */}
      <div className="h-[160px] flex items-end justify-center gap-12 px-8 pb-4 relative z-10">
        <AnimatePresence>
          {customers.map((customer) => (
            <motion.div
              key={customer.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative flex flex-col items-center cursor-pointer group"
              onClick={() => serveCustomer(customer)}
            >
              {/* Order Bubble */}
              <div className={`absolute -top-10 bg-white border-2 ${customer.status === 'angry' ? 'border-red-500' : 'border-amber-500'} rounded-2xl p-2 shadow-xl flex items-center gap-1.5 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[8px] after:border-transparent after:border-t-white z-50 transition-transform group-hover:scale-110 ${customer.order.includes('spaghetti') ? 'min-w-[110px]' : 'min-w-[80px]'} justify-center`}>
                <div className="relative flex items-center flex-none">
                    <span className="text-xl drop-shadow-sm whitespace-nowrap">{DISH_ICONS[customer.order]}</span>
                    {customer.order.startsWith('steak') && (
                        <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] px-1 rounded font-black border border-white">
                            {getBeefLabel(customer.order)}
                        </span>
                    )}
                </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-[8px] font-black ${customer.status === 'angry' ? 'text-red-600' : 'text-amber-600'} uppercase leading-none`}>
                        {customer.status === 'angry' ? 'Angry!' : customer.isHearten ? 'Still Wants' : 'Wants'}
                    </span>
                    <span className="text-[10px] font-bold leading-tight truncate">{DISH_LABELS[customer.order]}</span>
                </div>
              </div>
              
              {/* Customer Image */}
              <div className="w-20 h-20 relative group-hover:scale-110 transition-transform">
                 <img 
                    src={
                        customer.isShocked
                        ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Lshock.png'
                        : (customer.type === 'yellow' && customer.isHearten)
                        ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Fheart.png'
                        : (customer.type === 'blue' && customer.isHearten)
                        ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Vheart.png'
                        : customer.status === 'angry' 
                        ? (customer.type === 'yellow' ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Fan.png' : 
                           customer.type === 'blue' ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Van.png' : 
                           customer.type === 'pink' ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Lan.png' : customer.avatar)
                        : (customer.type === 'blue' && customer.hasBread)
                        ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Vhappy.png'
                        : customer.avatar
                    } 
                    alt="Customer" 
                    className="w-full h-full object-contain drop-shadow-md" 
                    referrerPolicy="no-referrer"
                 />
              </div>
              <div className={`mt-0.5 text-[8px] font-black ${customer.status === 'angry' ? 'bg-red-500 text-white' : 'bg-white/80'} border border-stone-200 px-2 py-0.5 rounded-full shadow-sm`}>
                  {customer.status === 'angry' ? 'ANGRY' : 
                   customer.type === 'yellow' ? 'Free' : 
                   customer.type === 'blue' ? 'BFF Valt' : 'Picky husband'}
              </div>

              {/* Waiting Timer Bar */}
              {customer.status === 'waiting' && (
                <div className="absolute -bottom-2 w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden border border-white shadow-sm">
                    <motion.div 
                      className="h-full bg-green-500"
                      initial={{ width: '100%' }}
                      animate={{ 
                        width: `${Math.max(0, 100 - (customer.waitTime / (customer.type === 'pink' ? 50000 : 90000)) * 100)}%`,
                        backgroundColor: customer.waitTime > (customer.type === 'pink' ? 35000 : 60000) ? '#ef4444' : customer.waitTime > (customer.type === 'pink' ? 20000 : 30000) ? '#f59e0b' : '#22c55e'
                      }}
                    />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- Middle: Counter & Chef --- */}
      <div className="h-4 flex-none relative z-20">
          <div className="absolute inset-x-0 top-0 h-4 bg-[#B45309] shadow-lg" />
          <div className="absolute inset-x-0 top-1 h-12 bg-[#FBBF24] border-t-4 border-[#92400E]/20" />
      </div>

      <div className="flex justify-between items-center px-12 py-1 h-20 relative z-30">
        <div className="flex items-center gap-4">
            <div className="bg-white px-4 py-2 rounded-xl border-4 border-amber-400 shadow-[0_3px_0_#F59E0B]">
                <span className="text-lg font-black text-amber-900 uppercase">Gold: {score}</span>
            </div>
            <div className="bg-white px-3 py-1 rounded-xl border-4 border-pink-400 shadow-[0_2px_0_#DB2777]">
                <span className="text-sm font-black text-pink-700 uppercase">💖 {empathy}</span>
            </div>
        </div>

        {/* Chef */}
        {(() => {
            const isHappy = message?.includes('PERFECT') || message?.includes('Valt') || message?.includes('GOLD') || message?.includes('EMPATHY') || message?.includes('CONNECTION');
            return (
                <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center">
                    {/* Speech Bubble */}
                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`absolute -top-16 px-4 py-2 rounded-2xl shadow-xl border-4 z-[60] whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[8px] after:border-transparent after:border-t-inherit ${(message.includes('PERFECT') || message.includes('Valt')) ? 'bg-green-500 border-green-600 text-white' : 'bg-red-500 border-red-600 text-white'}`}
                            >
                                <span className="font-black text-[10px] uppercase tracking-tighter">{message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="relative w-24 h-24">
                        <img 
                            src={isHappy 
                                ? 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Shappy1.png' 
                                : 'https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Sbt1.png'
                            } 
                            alt="Chef"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>
            );
        })()}

        <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 bg-white text-amber-600 px-4 py-2 rounded-xl border-2 border-amber-200 hover:bg-amber-50 transition-all shadow-[0_3px_0_#E5E7EB] active:translate-y-1 active:shadow-none"
            >
              <Home size={20} />
            </button>
            <motion.button 
              onClick={() => {
                setShowRecipes(!showRecipes);
                setRecipesViewed(true);
              }}
              animate={!recipesViewed ? {
                rotate: [0, -3, 3, -3, 3, 0],
                x: [0, -1, 1, -1, 1, 0]
              } : {}}
              transition={{
                duration: 0.5,
                repeat: !recipesViewed ? Infinity : 0,
                repeatDelay: 1.5
              }}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-xl hover:bg-amber-700 transition-all shadow-[0_3px_0_#92400E] active:translate-y-1 active:shadow-none relative"
            >
              <BookOpen size={20} />
              <span className="font-black text-sm uppercase">Recipes</span>
              {!recipesViewed && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-white shadow-lg z-10"
                >
                  !
                </motion.div>
              )}
            </motion.button>
        </div>
      </div>

      {/* --- Bottom: Cooking Station --- */}
      <div className="flex-1 relative z-30 pt-2 pb-12">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-6 overflow-visible">
            {/* Left Area: Display & Cooking */}
            <div className="col-span-9 space-y-6">
                {/* 1. Plates (Top) */}
                <div className="bg-white/30 rounded-3xl p-4 border-4 border-amber-200/50 shadow-inner">
                    <div className="flex gap-3 justify-between">
                        {plates.map((plate, idx) => (
                            <div key={idx} 
                                onClick={() => handleItemInteraction('plate', idx, 
                                    () => handlePlateClick(idx), 
                                    () => {
                                        setPlates(prev => {
                                            const next = [...prev];
                                            next[idx] = { dish: null, parts: [] };
                                            return next;
                                        });
                                        if (selectedItem?.type === 'plate' && selectedItem.index === idx) setSelectedItem(null);
                                    }
                                )}
                                className={`flex-1 h-20 bg-white rounded-full border-b-4 border-stone-200 flex flex-col items-center justify-center relative cursor-pointer hover:shadow-lg transition-all ${selectedItem?.type === 'plate' && selectedItem.index === idx ? 'ring-4 ring-amber-400 border-amber-400' : 'border-stone-100'}`}
                            >
                                <div className="absolute top-1 text-[7px] font-black uppercase text-stone-300">PLATE {idx + 1}</div>
                                <div className="flex gap-1">
                                    {plate.dish ? (
                                        <div className="relative">
                                            <span className="text-2xl drop-shadow-sm">
                                                {DISH_ICONS[plate.dish]}
                                            </span>
                                            {plate.dish.startsWith('steak') && (
                                                <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] px-0.5 rounded font-black border border-white">
                                                    {getBeefLabel(plate.dish)}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        plate.parts.map((p, i) => (
                                            <div key={i} className="relative">
                                                <span className="text-2xl drop-shadow-sm">
                                                    {p === 'spaghetti_cooked' ? '🍝' : 
                                                     p === 'tomato_sauce' ? '🍅' : 
                                                     p === 'cream_sauce' ? '🧀' :
                                                     p === 'potato_fries' ? '🍟' : '🥩'}
                                                </span>
                                                {p.includes('beef') && (
                                                    <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] px-0.5 rounded font-black border border-white">
                                                        {getBeefLabel(p)}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                {plate.dish && <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white shadow-sm"><CheckCircle2 size={12} /></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Tools (Bottom) */}
                <div className="flex gap-6 h-40">
                    {/* Tool: Board */}
                    <div 
                        onClick={() => {
                            if (board.content) {
                                handleItemInteraction('board', 'tool', 
                                    () => { if (board.content?.includes('_cut')) handleBoardClick(); }, 
                                    () => clearTool('board')
                                );
                            }
                        }}
                        className={`flex-1 rounded-2xl border-4 relative flex items-center justify-center transition-all cursor-pointer ${board.content ? 'border-amber-500 bg-amber-100' : 'border-amber-200 border-dashed bg-amber-50'}`}
                    >
                        <div className={`absolute -top-3 left-4 px-2 py-0.5 text-[8px] font-black rounded shadow-sm uppercase bg-amber-500 text-white`}>Board</div>
                        {board.content ? (
                          <div className="flex flex-col items-center group relative w-full h-full justify-center">
                              <motion.div layoutId="board_item" className="text-4xl drop-shadow-md relative">
                                {board.content.includes('tomato') ? '🍅' : '🥔'}
                                {board.content.includes('_cut') && <CheckCircle2 className="absolute -top-2 -right-2 text-green-500 bg-white rounded-full p-0.5 border border-green-500" size={14} />}
                              </motion.div>
                              {!board.content.includes('_cut') && (
                                <div className="absolute bottom-4 w-12 h-1 bg-stone-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-amber-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(board.timer / CUT_TIME) * 100}%` }}
                                    />
                                </div>
                              )}
                              {/* Control Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl z-20">
                                <button onClick={() => clearTool('board')} className="p-1.5 bg-red-500 text-white rounded-full shadow border border-white"><Trash2 size={12} /></button>
                                {board.content.includes('_cut') && (
                                    <button onClick={handleBoardClick} className="p-1.5 bg-green-500 text-white rounded-full shadow border border-white"><CheckCircle2 size={12} /></button>
                                )}
                              </div>
                          </div>
                        ) : (
                          <ChefHat className="text-amber-200/50 w-12 h-12" />
                        )}
                    </div>

                    {/* Tool: Pot */}
                    <div 
                        onClick={() => {
                            if (pot.content) {
                                handleItemInteraction('pot', 'tool',
                                    () => { if (pot.content === 'spaghetti_cooked') handlePotClick(); },
                                    () => clearTool('pot')
                                );
                            }
                        }}
                        className="flex-1 rounded-2xl border-4 relative flex items-center justify-center transition-all bg-slate-700 border-slate-900 shadow-inner cursor-pointer"
                    >
                        <div className={`absolute -top-3 left-4 px-2 py-0.5 text-[8px] font-black rounded shadow-sm uppercase bg-slate-500 text-white`}>Pot</div>
                        {pot.content ? (
                           <div className="flex flex-col items-center group relative w-full h-full justify-center">
                                <span className="text-5xl drop-shadow-xl -mt-2">🍲</span>
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden p-0.5 border border-slate-600">
                                  <motion.div className="h-full bg-blue-400 rounded-full" animate={{ width: `${Math.min(100, (pot.timer / COOK_TIME) * 100)}%` }} />
                                </div>
                                {pot.content === 'spaghetti_cooked' && <CheckCircle2 className="text-green-400 mt-1" size={14} />}
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl z-20">
                                    <button onClick={() => clearTool('pot')} className="p-1.5 bg-red-500 text-white rounded-full shadow border border-white"><Trash2 size={12} /></button>
                                    {pot.content === 'spaghetti_cooked' && <button onClick={handlePotClick} className="p-1.5 bg-green-500 text-white rounded-full shadow border border-white"><CheckCircle2 size={12} /></button>}
                                </div>
                           </div>
                        ) : (
                           <div className="flex gap-1.5 mt-4"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /></div>
                        )}
                        {pot.content && <Droplet className="absolute top-2 right-2 text-blue-300 animate-bounce" size={16} />}
                    </div>

                    {/* Tools: Pans */}
                    {pans.map((p, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                            if (p.content) {
                                handleItemInteraction('pan', idx,
                                    () => handlePanClick(idx),
                                    () => clearTool('pan', idx)
                                );
                            }
                        }}
                        className={`flex-1 rounded-2xl border-4 relative flex items-center justify-center transition-all bg-slate-700 border-slate-900 shadow-inner cursor-pointer`}
                      >
                        <div className={`absolute -top-3 left-4 px-2 py-0.5 text-[8px] font-black rounded shadow-sm uppercase bg-slate-500 text-white`}>Pan {idx + 1}</div>
                        {p.content ? (
                          <div className="flex flex-col items-center group relative w-full h-full justify-center">
                                <div className={`w-16 h-10 rounded-lg ${getBeefColor(p.content)} flex items-center justify-center text-3xl shadow-lg relative`}>
                                  {p.content === 'tomato_sauce' && '🥫'}
                                  {p.content === 'cream_sauce' && '🥘'}
                                  {p.content === 'potato_fries' && '🍟'}
                                  {p.content === 'potato_cut' && '🥔'}
                                  {p.content === 'cheese_raw' && '🧀'}
                                  {p.content === 'pork_raw' && '🥓'}
                                  {p.content === 'tomato_cut' && '🍅'}
                                  {p.content.includes('+') && (
                                      <div className="flex -space-x-2">
                                          <span className="text-xl">{p.content.split('+')[0] === 'cheese_raw' ? '🧀' : p.content.split('+')[0] === 'pork_raw' ? '🥓' : '🍅'}</span>
                                          <span className="text-xl">{p.content.split('+')[1] === 'cheese_raw' ? '🧀' : p.content.split('+')[1] === 'pork_raw' ? '🥓' : '🍅'}</span>
                                      </div>
                                  )}
                                  {p.content.includes('beef') && (
                                    <>
                                        <span>🥩</span>
                                        {getBeefLabel(p.content) && (
                                            <span className="absolute -bottom-1 right-0 bg-white text-stone-900 text-[10px] px-1 rounded font-black border border-stone-200">
                                                {getBeefLabel(p.content)}
                                            </span>
                                        )}
                                    </>
                                  )}
                                </div>
                                <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden p-0.5 border border-slate-600">
                                  <motion.div className="h-full bg-orange-400 rounded-full" animate={{ width: `${Math.min(100, (p.timer / (p.content.includes('beef') ? 12500 : COOK_TIME)) * 100)}%` }} />
                                </div>
                                {/* Control Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl z-20">
                                  <button onClick={() => clearTool('pan', idx)} className="p-1.5 bg-red-500 text-white rounded-full shadow border border-white"><Trash2 size={12} /></button>
                                  <button onClick={() => handlePanClick(idx)} className="p-1.5 bg-green-500 text-white rounded-full shadow border border-white"><CheckCircle2 size={12} /></button>
                                </div>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 mt-4"><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /></div>
                        )}
                        {p.content && <Flame className="absolute top-2 right-2 text-orange-500 animate-pulse" size={16} />}
                      </div>
                    ))}
                </div>
            </div>

            {/* Right Area: Pantry & Trash */}
            <div className="col-span-3 flex flex-col gap-4 h-[calc(40px+40px+240px)] overflow-hidden">
                {/* 3. Pantry (Top) */}
                <div className="bg-amber-100/30 rounded-3xl p-2 border-4 border-amber-200/50 shadow-inner flex-1 overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 h-full">
                        {(['beybread', 'beef_raw', 'potato_raw', 'spaghetti_raw', 'tomato_raw', 'pork_raw', 'cheese_raw'] as Ingredient[]).map(ing => (
                            <button key={ing} onClick={() => addIngredientToTool(ing)} className="bg-amber-50 rounded-xl border-2 border-dashed border-amber-300 shadow-sm hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center p-1 group">
                                <div className="text-2xl group-hover:rotate-12 transition-transform">{ing === 'beef_raw' ? '🥩' : ing === 'potato_raw' ? '🥔' : ing === 'spaghetti_raw' ? '🍝' : ing === 'tomato_raw' ? '🍅' : ing === 'pork_raw' ? '🥓' : ing === 'beybread' ? '🍞' : '🧀'}</div>
                                <span className="text-[7px] font-black text-amber-700 uppercase mt-1">{INGREDIENT_NAMES[ing] ? INGREDIENT_NAMES[ing].split(' ')[0] : 'Beybread'}</span>
                            </button>
                        ))}
                        {/* Trash Bin integrated into Pantry */}
                        <button 
                            onClick={handleTrash} 
                            className={`rounded-xl border-2 border-slate-900 shadow-sm hover:scale-110 active:scale-95 transition-all flex flex-col items-center justify-center p-1 group ${selectedItem ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}
                        >
                            <Trash2 size={24} className={selectedItem ? 'text-white' : 'text-slate-300'} />
                            <span className={`text-[7px] font-black uppercase mt-1 ${selectedItem ? 'text-white' : 'text-slate-400'}`}>Trash</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>


      <AnimatePresence>
        {isGameOver && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[40px] border-8 border-red-500 p-6 max-w-sm w-full text-center shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center"
            >
              <div className="relative mb-6 max-w-[280px] mx-auto flex-1 flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/fail1.png" 
                  alt="Game Over"
                  className="w-full rounded-2xl border-4 border-stone-100"
                />
                {/* Chat Bubble on Image - Now on the LEFT */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.5 }}
                   className="absolute -top-4 -left-2 bg-white border-4 border-red-500 p-2.5 rounded-2xl shadow-xl max-w-[160px] z-10"
                >
                   <p className="text-[9px] font-black text-red-600 leading-tight uppercase">
                      "No more business! Go home, and let me provide for you!"
                   </p>
                   {/* Arrow pointing to head */}
                   <div className="absolute top-full left-6 border-8 border-transparent border-t-red-500" />
                </motion.div>
              </div>

              <div className="mt-auto w-full">
                <h2 className="text-2xl font-black text-red-700 mb-1 uppercase leading-none">Game Over</h2>
                <p className="text-xs text-stone-600 font-bold mb-6 italic px-4">
                  Oh no, we lost! My husband won't let me open the restaurant anymore!
                </p>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#991b1b] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-xl uppercase"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isMichelinEnding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[40px] border-8 border-amber-500 p-6 max-w-sm w-full text-center shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center"
            >
              <div className="relative mb-6 max-w-[280px] mx-auto flex-1 flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/michelin.png" 
                  alt="Michelin Star"
                  className="w-full rounded-2xl border-4 border-stone-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -top-4 -right-4 text-5xl"
                >
                  ⭐
                </motion.div>
              </div>

              <div className="mt-auto w-full">
                <h2 className="text-2xl font-black text-amber-700 mb-1 uppercase leading-none">Legendary Chef!</h2>
                <p className="text-[12px] text-stone-700 font-bold mb-6 italic px-2">
                  Free is actually a Food Critic! Your secret recipe just won a Michelin star. You're no longer a beginner; you're a Legend!
                </p>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#B45309] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-lg uppercase"
                >
                  Find another ending!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isSocialButterflyEnding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[40px] border-8 border-blue-400 p-6 max-w-sm w-full text-center shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center"
            >
              <div className="relative mb-6 max-w-[280px] mx-auto flex-1 flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/bestie.png" 
                  alt="The Social Butterfly"
                  className="w-full rounded-2xl border-4 border-stone-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                   className="absolute -top-4 -right-4 text-5xl"
                >
                  🦋
                </motion.div>
              </div>

              <div className="mt-auto w-full">
                <h2 className="text-2xl font-black text-blue-700 mb-1 uppercase leading-none">The Social Butterfly</h2>
                <p className="text-[13px] text-blue-600 font-black mb-6 px-2 leading-tight">
                  "Who needs a picky husband's permission? Your Best Friend just bought the building for you! Together, we're turning this restaurant into a global franchise!"
                </p>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#1E40AF] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-lg uppercase"
                >
                  Find another ending
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isSuccessEnding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[40px] border-8 border-green-400 p-6 max-w-sm w-full text-center shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center"
            >
              <div className="relative mb-6 max-w-[280px] mx-auto flex-1 flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/HE.png" 
                  alt="Success!"
                  className="w-full rounded-2xl border-4 border-stone-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ repeat: Infinity, duration: 1 }}
                   className="absolute -top-4 -right-4 text-5xl"
                >
                  💰
                </motion.div>
              </div>

              <div className="mt-auto w-full">
                <h2 className="text-2xl font-black text-green-700 mb-1 uppercase leading-none">Success!</h2>
                <p className="text-[13px] text-stone-600 font-bold mb-6 px-2 leading-tight italic">
                  "Your restaurant is so profitable that even your husband has retired to become your dishwasher. You've built an empire!"
                </p>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-green-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#15803d] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-lg uppercase"
                >
                  Find another ending!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isPerfectSteakEnding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[40px] border-8 border-pink-400 p-6 max-w-sm w-full text-center shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center"
            >
              <div className="relative mb-6 max-w-[280px] mx-auto flex-1 flex items-center">
                <img 
                  src="https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/kabedon.png" 
                  alt="The Perfect Steak"
                  className="w-full rounded-2xl border-4 border-stone-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                   animate={{ scale: [1.1, 1.3, 1.1] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -top-4 -right-4 text-5xl"
                >
                  💖
                </motion.div>
              </div>

              <div className="mt-auto w-full">
                <h3 className="text-xl font-black text-pink-700 mb-1 uppercase leading-none">The Perfect Steak</h3>
                
                <p className="text-[14px] text-pink-600 font-black mb-6 px-2 leading-tight">
                  "I never thought you could understand my taste so well. Fine then... this restaurant isn't half bad."
                </p>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#9D174D] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-lg uppercase"
                >
                  Find another ending!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isMiracleEnding && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[40px] border-8 border-pink-400 p-6 max-w-sm w-full text-center shadow-2xl overflow-hidden relative min-h-[520px] flex flex-col items-center"
            >
              <div className="relative mb-6 max-w-[280px] mx-auto flex-1 flex items-center">
                <img 
                  src={miracleEndingPage === 1 ? "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/FV.png" : "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/FV2.png"} 
                  alt="Miracle Flavor"
                  className="w-full rounded-2xl border-4 border-stone-100 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                   animate={{ scale: [1.2, 1, 1.2], rotate: [0, 10, -10, 0] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -top-4 -left-4 text-5xl"
                >
                  ✨
                </motion.div>
              </div>

              <div className="mt-auto w-full">
                <h2 className="text-2xl font-black text-pink-700 mb-1 uppercase leading-none">Miracle Flavor</h2>
                
                <p className="text-[14px] text-pink-500 font-black mb-6 px-2 leading-tight min-h-[60px] flex items-center justify-center">
                  {miracleEndingPage === 1 
                    ? "Valt couldn't contain his excitement! Seeing Free accept the special heart he rushed over for a giant hug. Your cooking was the secret ingredient to their perfect moment!"
                    : "The Golden Fries meet the Legendary Bread. Your kindness has sparked a connection that transcends the kitchen. From now on, they’ll never have to eat alone again!"
                  }
                </p>

                {miracleEndingPage === 1 ? (
                  <button 
                    onClick={() => setMiracleEndingPage(2)}
                    className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#9D174D] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-lg uppercase"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-pink-500 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_#9D174D] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all text-lg uppercase"
                  >
                    Find another ending!
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {isEnding7 && (
          <div className="fixed inset-0 bg-black/95 z-[250] flex items-center justify-center p-4 font-mono select-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-black border-8 border-white/20 p-6 flex flex-col items-center gap-4 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] rounded-[40px] min-h-[520px]"
            >
              <div className="relative group w-full flex-1 flex items-center justify-center overflow-hidden max-h-[280px]">
                <img 
                  src={
                    ending7Page === 1 ? "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Shunife.png" :
                    ending7Page === 2 ? "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/nife.jpg" :
                    "https://raw.githubusercontent.com/chnphan227-collab/picturegame/refs/heads/main/Secret1.png"
                  } 
                  alt="Ending 7"
                  className="max-w-full max-h-full h-auto w-auto rounded-none border border-white/10 object-contain"
                  referrerPolicy="no-referrer"
                />
                
                {ending7Page > 1 && (
                  <button 
                    onClick={() => setEnding7Page(prev => prev - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-1 text-white hover:scale-125 transition-transform bg-black/50 rounded-full"
                  >
                    <ChevronLeft size={40} />
                  </button>
                )}

                {ending7Page < 3 && (
                  <button 
                    onClick={() => setEnding7Page(prev => prev + 1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-white hover:scale-125 transition-transform bg-black/50 rounded-full"
                  >
                    <ChevronRight size={40} />
                  </button>
                )}
              </div>

              <div className="text-center w-full px-2 mt-auto">
                <h2 className="text-white/50 text-[10px] tracking-widest font-black uppercase mb-2">Bảo hộ - chap 15</h2>
                
                <div className="text-[12px] text-white font-bold leading-snug tracking-tight min-h-[80px]">
                  {ending7Page === 1 && (
                    <>
                      <p className="text-lg block mb-1 font-black underline decoration-2 text-white">Xoẹt!</p>
                      <p>"Shu vừa kịp tránh, lưỡi dao suýt soát cắt ngọt một đường máu mỏng trên má cậu."</p>
                    </>
                  )}
                  {ending7Page === 2 && (
                    <p>"Con dao cắt thịt bò lướt qua găm thẳng vào tường bếp. Shu nhìn con dao trên tường, lại thấy được ánh mắt nghiêm túc của người kia. Cậu nhắm mắt, thở một hơi cố gắng bình ổn tâm trạng. "</p>
                  )}
                  {ending7Page === 3 && (
                    <p>"Ngươi biết gì không Shu. Vấn đề đâu phải là tài năng? Ta đã ăn nhẵn 2 miếng steak mà ngươi làm, và cái miếng thứ 3 này thì chín đến dai nhách! Nếu đã làm việc cho ta thì tập trung vào đi!"</p>
                  )}
                </div>
              </div>

              {ending7Page === 3 && (
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-6 py-4 bg-white text-black font-black text-xs tracking-widest uppercase hover:bg-stone-200 active:scale-95 transition-all w-full rounded-2xl shadow-[0_4px_0_#ccc]"
                >
                  Find another ending!
                </button>
              )}
            </motion.div>
          </div>
        )}

        {isPaused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
                <motion.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-[40px] border-8 border-amber-500 p-12 max-w-sm w-full text-center shadow-2xl"
                >
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={48} className="text-amber-600" />
                    </div>
                    <h2 className="text-4xl font-black text-amber-900 uppercase mb-8 tracking-tighter">Paused</h2>
                    <div className="space-y-4">
                        <button 
                            onClick={() => setIsPaused(false)}
                            className="w-full bg-green-500 text-white text-xl font-black py-5 rounded-2xl border-b-8 border-green-700 hover:brightness-110 transition-all active:translate-y-1 active:border-b-4"
                        >
                             RESUME GAME
                        </button>
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full bg-stone-100 text-stone-600 text-lg font-black py-4 rounded-2xl border-b-6 border-stone-300 hover:bg-stone-200 transition-all active:translate-y-1 active:border-b-2"
                        >
                             RESTART
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        {showRecipes && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-amber-50 w-full max-w-md rounded-3xl p-8 shadow-2xl relative min-h-[400px] flex flex-col">
                    <button onClick={() => { setShowRecipes(false); setCookbookPage(1); }} className="absolute top-4 right-4 p-2 hover:bg-stone-200 rounded-full transition-colors"><X size={20} /></button>
                    
                    {cookbookPage === 1 && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6"><UtensilsCrossed className="text-amber-600" size={28} /><h2 className="text-2xl font-black text-amber-900 uppercase">Cookbook</h2></div>
                        <div className="space-y-4 flex-1">
                            {[
                              { title: '🥩 Wagyu Steak', steps: 'Beef -> Pan\nWait 4s (MR) -> 8s (✨Flawless✨) -> 8.5s (M) -> 12.5s (WD)' },
                              { title: '🍝 Spaghetti Tomato', steps: 'Spaghetti -> Pot (5s) -> Check -> Plate\n[Tomato (Cut) + Pork] -> Pan (5s) -> Check -> Plate' },
                              { title: '🍝 Spaghetti Carbonara', steps: 'Spaghetti -> Pot (5s) -> Check -> Plate\n[Cheese + Pork] -> Pan (5s) -> Check -> Plate' },
                              { title: '🍟 French Fries', steps: 'Potato -> Board (Cut) -> Pan (5s) -> Check -> Plate' }
                            ].map((recipe, i) => (
                              <div key={i} className="p-3 bg-white/80 rounded-2xl border-l-8 border-amber-500 shadow-sm">
                                <h4 className="font-bold text-amber-900 text-sm">{recipe.title}</h4>
                                <p className="text-[10px] text-stone-600 whitespace-pre-line">{recipe.steps}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {cookbookPage === 2 && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6"><BookOpen className="text-amber-600" size={28} /><h2 className="text-2xl font-black text-amber-900 uppercase">Disclaimer</h2></div>
                        <div className="p-5 bg-white/80 rounded-3xl border-2 border-amber-200 shadow-sm flex-1">
                          <h4 className="font-bold text-amber-900 mb-3 text-lg">📜DISCLAIMER</h4>
                          <div className="space-y-4 text-xs text-stone-600 leading-relaxed">
                            <p><span className="font-bold text-amber-700">-Characters:</span> All characters (Shu, Valt, Free, Lui) are the property of their respective creators. This is a non-profit fan-made game.</p>
                            <p><span className="font-bold text-amber-700">-Art Style:</span> Visuals are AI-generated for illustrative purposes and do not represent the original series' artwork.</p>
                            <p><span className="font-bold text-amber-700">-Shipping:</span> This game features LuiShu and FreeValt dynamics.</p>
                            <p className="italic mt-4 text-amber-800 font-medium">Respect all ships and let the flavors lead the way!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cookbookPage === 3 && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6"><ChefHat className="text-amber-600" size={28} /><h2 className="text-2xl font-black text-amber-900 uppercase">Help</h2></div>
                        <div className="p-5 bg-white/80 rounded-3xl border-2 border-amber-200 shadow-sm flex-1">
                          <h4 className="font-bold text-amber-900 mb-3 text-lg">🎮 HOW TO PLAY</h4>
                          <div className="space-y-4 text-xs text-stone-600 leading-relaxed">
                            <p><span className="font-bold text-amber-700">-Controls:</span> Single-click on any item to move it to the next step. Double-click an item to throw it into the trash!</p>
                            <p><span className="font-bold text-amber-700">-Consult the Cookbook:</span> Always check your Cookbook to master the cooking times for every ingredient. Precision is key!</p>
                            <p><span className="font-bold text-amber-700">-Keep Calm & Serve:</span> Do not let your friends get angry—especially the Picky Husband Lui 🙄. If his patience runs out, your dream might end early!</p>
                            <p><span className="font-bold text-amber-700">-Be Creative:</span> Following orders is good, but Creativity is the only path to discovering all hidden endings. Experiment with your ingredients!</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cookbookPage === 4 && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-6"><UtensilsCrossed className="text-amber-600" size={28} /><h2 className="text-2xl font-black text-amber-900 uppercase">Ending Log</h2></div>
                        <div className="p-5 bg-white/80 rounded-3xl border-2 border-amber-200 shadow-sm flex-1 overflow-y-auto">
                          <h4 className="font-bold text-amber-900 mb-3 text-lg">🌟 THE ENDING LOG</h4>
                          <div className="space-y-2 text-xs text-stone-600 mb-6">
                            <p>Ending 1: The Forbidden Dream</p>
                            <p>Ending 2: The Michelin Star</p>
                            <p>Ending 3: Bestie’s Franchise</p>
                            <p>Ending 4: Success!</p>
                            <p className="text-pink-600 font-bold">Special Ending: The Perfect steak</p>
                            <p className="text-amber-600 font-bold">Secret Ending: Miracle Flavor (FreeValt)</p>
                            <p className="text-stone-500 italic">Secret ending:❓ (Give Lui a well done steak)</p>
                          </div>
                          <div className="border-t-2 border-amber-100 pt-4">
                            <h4 className="font-black text-amber-900 text-sm mb-1 uppercase tracking-tighter">✨ CHEF'S NOTE</h4>
                            <p className="italic text-stone-500 text-[10px]">"A dish is only as good as the heart you put into it. Good luck, From Shu!"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(p => (
                          <div key={p} className={`w-2 h-2 rounded-full transition-all ${cookbookPage === p ? 'bg-amber-600 w-4' : 'bg-amber-200'}`} />
                        ))}
                      </div>
                      <button 
                        onClick={() => setCookbookPage(prev => prev === 4 ? 1 : prev + 1)}
                        className="bg-amber-500 text-white font-black px-6 py-2 rounded-xl border-b-4 border-amber-700 hover:brightness-110 active:translate-y-1 active:border-b-0 transition-all uppercase text-sm"
                      >
                         {cookbookPage === 4 ? "Back to Start" : "Next Page"}
                      </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
