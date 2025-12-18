
import React, { useState, useEffect, useCallback } from 'react';
import { Truck, Sword, MapPin, Package, AlertCircle, ChevronRight, Radio, Search, Bed, FastForward } from 'lucide-react';
import { CITIES, INITIAL_STATS, SURVIVAL_TARGET } from './constants';
import { GameState, CityKey, EndingType } from './types';
import { StatusBarGroup } from './components/StatusBar';
import { generateSurvivalEvent } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityKey | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize game
  const startGame = (cityKey: CityKey) => {
    const city = CITIES[cityKey];
    setGameState({
      day: 1,
      distance: 0,
      totalDistance: SURVIVAL_TARGET,
      city: cityKey,
      stats: { ...INITIAL_STATS },
      rv: { level: 1, power: 10, defense: 10, storage: 20, medical: false, waterPurifier: false },
      weapon: { name: city.initialWeapon, type: 'melee', damage: 15, level: 1 },
      materials: 20,
      inventory: { food: 5, water: 5, meds: 2, samples: 0 },
      log: [`从${city.name}出发。末世降临，我们要开着这辆${city.initialRV}活下去。`],
      isGameOver: false,
      ending: null,
    });
  };

  const updateLog = (msg: string) => {
    setGameState(prev => {
      if (!prev) return null;
      return { ...prev, log: [msg, ...prev.log].slice(0, 10) };
    });
  };

  const checkGameOver = useCallback((state: GameState) => {
    if (state.stats.health <= 0 || state.stats.hunger <= 0 || state.stats.thirst <= 0 || state.stats.sanity <= 0) {
      return true;
    }
    return false;
  }, []);

  const handleAction = async (action: 'travel' | 'scavenge' | 'rest' | 'radio') => {
    if (!gameState || loading) return;
    setLoading(true);

    let nextState = { ...gameState };
    let actionLog = "";

    // Deplete stats per action
    nextState.stats.hunger -= 5;
    nextState.stats.thirst -= 8;
    nextState.stats.sanity -= 2;

    switch (action) {
      case 'travel':
        const move = 50 + (nextState.rv.power * 2);
        nextState.distance += move;
        actionLog = `你驾驶房车向前推进了${move}km。`;
        nextState.stats.sanity -= 5;
        break;
      case 'scavenge':
        const foundMats = Math.floor(Math.random() * 15) + 5;
        nextState.materials += foundMats;
        const foundFood = Math.random() > 0.6 ? 1 : 0;
        const foundWater = Math.random() > 0.6 ? 1 : 0;
        nextState.inventory.food += foundFood;
        nextState.inventory.water += foundWater;
        actionLog = `你搜索了附近的废弃超市，获得了${foundMats}个零件${foundFood ? '和一些食物' : ''}。`;
        nextState.stats.health -= Math.floor(Math.random() * 10); // Risk of zombie
        break;
      case 'rest':
        nextState.stats.health = Math.min(100, nextState.stats.health + 20);
        nextState.stats.sanity = Math.min(100, nextState.stats.sanity + 15);
        if (nextState.inventory.food > 0) {
            nextState.inventory.food--;
            nextState.stats.hunger = Math.min(100, nextState.stats.hunger + 30);
        }
        if (nextState.inventory.water > 0) {
            nextState.inventory.water--;
            nextState.stats.thirst = Math.min(100, nextState.stats.thirst + 40);
        }
        actionLog = "你在房车里休息了一个晚上，体力有所恢复。";
        break;
      case 'radio':
        nextState.stats.sanity = Math.min(100, nextState.stats.sanity + 25);
        actionLog = "你调试电台，听到了微弱的幸存者信号，精神得到了慰藉。";
        break;
    }

    // Trigger random AI event occasionally
    if (Math.random() > 0.5) {
      const event = await generateSurvivalEvent(nextState);
      actionLog += `\n[突发] ${event.text}`;
      // Apply effects
      if (event.effect) {
          const e = event.effect;
          if (e.stats) {
              nextState.stats.health = Math.max(0, nextState.stats.health + (e.stats.health || 0));
              nextState.stats.hunger = Math.max(0, nextState.stats.hunger + (e.stats.hunger || 0));
              nextState.stats.thirst = Math.max(0, nextState.stats.thirst + (e.stats.thirst || 0));
              nextState.stats.sanity = Math.max(0, nextState.stats.sanity + (e.stats.sanity || 0));
          }
          if (e.materials) nextState.materials += e.materials;
          if (e.inventory) {
              nextState.inventory.food += e.inventory.food || 0;
              nextState.inventory.water += e.inventory.water || 0;
              nextState.inventory.meds += e.inventory.meds || 0;
              nextState.inventory.samples += e.inventory.samples || 0;
          }
      }
    }

    nextState.day += 1;
    
    // Win Condition
    if (nextState.distance >= nextState.totalDistance) {
        if (nextState.inventory.samples >= 3) {
            nextState.ending = EndingType.ULTIMATE_REDEMPTION;
        } else if (nextState.stats.sanity > 80) {
            nextState.ending = EndingType.REBUILD_HOPE;
        } else {
            nextState.ending = EndingType.LONELY_TRAVELER;
        }
        nextState.isGameOver = true;
    }

    // Loss Condition
    if (checkGameOver(nextState)) {
      nextState.isGameOver = true;
    }

    updateLog(actionLog);
    setGameState(nextState);
    setLoading(false);
  };

  const upgradeRV = () => {
      if (!gameState || gameState.materials < 30) return;
      setGameState(prev => {
          if (!prev) return null;
          return {
              ...prev,
              materials: prev.materials - 30,
              rv: { ...prev.rv, level: prev.rv.level + 1, power: prev.rv.power + 5, defense: prev.rv.defense + 5 },
              log: [`房车升级到了Lv.${prev.rv.level + 1}，动力与防御增强了。`, ...prev.log]
          };
      });
  };

  const upgradeWeapon = () => {
      if (!gameState || gameState.materials < 20) return;
      setGameState(prev => {
          if (!prev) return null;
          return {
              ...prev,
              materials: prev.materials - 20,
              weapon: { ...prev.weapon, level: prev.weapon.level + 1, damage: prev.weapon.damage + 10 },
              log: [`武器加固完成，当前Lv.${prev.weapon.level + 1}。`, ...prev.log]
          };
      });
  };

  // Main Menu
  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-[url('https://picsum.photos/id/230/1920/1080')] bg-cover bg-center bg-no-repeat relative">
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="z-10 animate-pulse">
            <h1 className="text-6xl md:text-8xl pixel-font text-red-600 mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">像素末世</h1>
            <p className="text-xl md:text-2xl tracking-widest text-gray-300">华夏房车存活：寻找人类最后的曙光</p>
        </div>

        <div className="z-10 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 overflow-y-auto max-h-[50vh] p-2">
          {(Object.keys(CITIES) as CityKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedCity(key)}
              className={`p-4 pixel-border rounded bg-zinc-900 transition hover:bg-zinc-800 ${selectedCity === key ? 'border-red-500 scale-105 bg-zinc-800' : 'border-gray-700'}`}
            >
              <h3 className="text-xl font-bold mb-1 text-red-500">{CITIES[key].name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{CITIES[key].description}</p>
            </button>
          ))}
        </div>

        {selectedCity && (
          <div className="z-10 bg-zinc-900/90 p-6 pixel-border rounded-lg max-w-lg">
            <h2 className="text-2xl text-white mb-2">选择：{CITIES[selectedCity].name}</h2>
            <div className="text-sm text-gray-400 space-y-1 mb-6">
                <p>地形：{CITIES[selectedCity].terrain}</p>
                <p>初始房车：{CITIES[selectedCity].initialRV}</p>
                <p>初始武器：{CITIES[selectedCity].initialWeapon}</p>
                <p>特殊物资：{CITIES[selectedCity].bonusItem}</p>
            </div>
            <button 
              onClick={() => startGame(selectedCity)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded font-bold text-lg pixel-border transition-all transform hover:scale-105"
            >
              开始生存
            </button>
          </div>
        )}
      </div>
    );
  }

  // End Screen
  if (gameState.isGameOver) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-2xl w-full p-8 pixel-border bg-zinc-900 rounded-lg">
          {gameState.ending ? (
            <>
              <h1 className="text-5xl pixel-font text-green-500 mb-6">生存成功</h1>
              <h2 className="text-2xl text-white mb-4">结局：{gameState.ending}</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                你在废土中行驶了{gameState.distance}公里。
                {gameState.ending === EndingType.ULTIMATE_REDEMPTION && "你成功带回了病毒样本，科学家们以此开发出了疫苗。你是人类的救世主。"}
                {gameState.ending === EndingType.REBUILD_HOPE && "你带领幸存者抵达了安全区。在那片未被感染的土地上，新的文明正在萌芽。"}
                {gameState.ending === EndingType.LONELY_TRAVELER && "你独自漂泊，最终找到了那座孤岛。虽然孤独，但至少你还活着。"}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl pixel-font text-red-600 mb-6">生存失败</h1>
              <p className="text-xl text-gray-300 mb-8">
                你在第 {gameState.day} 天倒下了。
                {gameState.stats.health <= 0 ? "伤口感染夺走了你的生命。" : "资源耗尽，你无力再支持下去了。"}
              </p>
            </>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded pixel-border transition"
          >
            再次挑战
          </button>
        </div>
      </div>
    );
  }

  // Active Game UI
  return (
    <div className="h-screen flex flex-col bg-zinc-950 p-2 md:p-6 space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-lg pixel-border">
        <div className="flex items-center gap-4">
          <div className="bg-red-900/50 p-2 rounded">
             <MapPin className="text-red-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500">当前位置</div>
            <div className="font-bold text-lg">{CITIES[gameState.city].name}</div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-500">生存进度</div>
          <div className="flex items-center gap-2">
            <div className="w-32 md:w-64 bg-zinc-800 h-2 rounded-full overflow-hidden border border-zinc-700">
                <div className="bg-green-500 h-full transition-all" style={{ width: `${(gameState.distance / gameState.totalDistance) * 100}%` }}></div>
            </div>
            <span className="text-xs font-mono">{gameState.distance}/{gameState.totalDistance} KM</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Stats Column */}
        <div className="lg:col-span-3 space-y-4 flex flex-col">
          <StatusBarGroup stats={gameState.stats} />
          
          <div className="bg-black/40 p-4 rounded-lg pixel-border flex-1">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-zinc-400">
              <Package size={16} /> 仓库资源
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                    <span>食物</span>
                    <span className="text-orange-500 font-bold">x{gameState.inventory.food}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                    <span>淡水</span>
                    <span className="text-blue-500 font-bold">x{gameState.inventory.water}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                    <span>急救包</span>
                    <span className="text-red-500 font-bold">x{gameState.inventory.meds}</span>
                </div>
                <div className="bg-zinc-900 p-2 rounded flex justify-between">
                    <span>病毒样本</span>
                    <span className="text-emerald-500 font-bold">x{gameState.inventory.samples}</span>
                </div>
            </div>
            <div className="mt-4 p-3 bg-zinc-800 rounded flex justify-between items-center">
                <span className="text-xs">改装零件</span>
                <span className="text-yellow-500 font-mono font-bold">{gameState.materials}</span>
            </div>
          </div>
        </div>

        {/* Center Log Column */}
        <div className="lg:col-span-6 flex flex-col bg-zinc-900 rounded-lg pixel-border relative overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-sm scrollbar-hide">
            {gameState.log.map((msg, i) => (
              <div key={i} className={`p-3 rounded border-l-4 ${i === 0 ? 'bg-zinc-800 border-red-500 text-white animate-in slide-in-from-left' : 'bg-transparent border-zinc-700 text-gray-500'}`}>
                {msg}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-zinc-500 italic p-3">
                <div className="w-2 h-2 bg-red-500 animate-ping rounded-full"></div>
                正在处理突发状况...
              </div>
            )}
          </div>
          
          <div className="p-4 bg-black/40 border-t border-zinc-800 grid grid-cols-4 gap-2">
            <button 
              disabled={loading}
              onClick={() => handleAction('travel')}
              className="flex flex-col items-center justify-center p-3 bg-red-900/30 hover:bg-red-900/50 rounded transition border border-red-900/50 group"
            >
              <FastForward className="mb-1 group-hover:scale-110" />
              <span className="text-xs">前进</span>
            </button>
            <button 
              disabled={loading}
              onClick={() => handleAction('scavenge')}
              className="flex flex-col items-center justify-center p-3 bg-blue-900/30 hover:bg-blue-900/50 rounded transition border border-blue-900/50 group"
            >
              <Search className="mb-1 group-hover:scale-110" />
              <span className="text-xs">探索</span>
            </button>
            <button 
              disabled={loading}
              onClick={() => handleAction('rest')}
              className="flex flex-col items-center justify-center p-3 bg-emerald-900/30 hover:bg-emerald-900/50 rounded transition border border-emerald-900/50 group"
            >
              <Bed className="mb-1 group-hover:scale-110" />
              <span className="text-xs">修整</span>
            </button>
            <button 
              disabled={loading}
              onClick={() => handleAction('radio')}
              className="flex flex-col items-center justify-center p-3 bg-purple-900/30 hover:bg-purple-900/50 rounded transition border border-purple-900/50 group"
            >
              <Radio className="mb-1 group-hover:scale-110" />
              <span className="text-xs">收音</span>
            </button>
          </div>
        </div>

        {/* Right Upgrades Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900 p-4 rounded-lg pixel-border">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-zinc-400">
              <Truck size={16} /> 房车状态 (Lv.{gameState.rv.level})
            </h3>
            <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between"><span>动力指数</span><span className="text-green-500">{gameState.rv.power}</span></div>
                <div className="flex justify-between"><span>防御等级</span><span className="text-blue-500">{gameState.rv.defense}</span></div>
            </div>
            <button 
                onClick={upgradeRV}
                disabled={gameState.materials < 30}
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded text-xs border border-zinc-600 transition"
            >
                升级底盘 (30零件)
            </button>
          </div>

          <div className="bg-zinc-900 p-4 rounded-lg pixel-border">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-zinc-400">
              <Sword size={16} /> 武器装备 (Lv.{gameState.weapon.level})
            </h3>
            <div className="space-y-2 mb-4">
                <div className="text-sm font-bold text-red-500">{gameState.weapon.name}</div>
                <div className="flex justify-between text-xs"><span>基础威力</span><span className="text-red-400">{gameState.weapon.damage}</span></div>
            </div>
            <button 
                onClick={upgradeWeapon}
                disabled={gameState.materials < 20}
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded text-xs border border-zinc-600 transition"
            >
                强化武器 (20零件)
            </button>
          </div>

          <div className="bg-red-900/20 p-4 rounded-lg border border-red-900/50 flex flex-col items-center text-center">
            <AlertCircle className="text-red-500 mb-2" />
            <div className="text-xs font-bold text-red-500 uppercase tracking-tighter">Day {gameState.day} Survival</div>
            <div className="text-[10px] text-zinc-500 mt-1">
                记住：精神状态归零也会导致失败。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
