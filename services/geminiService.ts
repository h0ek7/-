
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

export const generateSurvivalEvent = async (state: GameState): Promise<{ text: string; effect: Partial<GameState> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    你是一个末日生存游戏策划。玩家正在进行名为《华夏房车存活》的游戏。
    当前状态：
    - 城市：${state.city}
    - 距离目标：${state.totalDistance - state.distance}km
    - 状态：生命值${state.stats.health}, 饱食${state.stats.hunger}, 口渴${state.stats.thirst}, 精神${state.stats.sanity}
    - 房车等级：${state.rv.level}
    - 武器：${state.weapon.name}

    请根据上述信息，生成一个突发事件描述（中文，100字以内），并给出一个JSON格式的游戏数值影响。
    数值影响可以包括 stats (health, hunger, thirst, sanity), materials, inventory (food, water, meds, samples), distance。
    
    格式要求：
    文本描述：[描述内容]
    JSON：{"stats": {"health": -5}, "materials": 10}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-latest',
      contents: prompt,
    });

    const text = response.text || "你在路边发现了一些废弃的集装箱。";
    const jsonMatch = text.match(/\{.*\}/s);
    let effect = {};
    if (jsonMatch) {
      try {
        effect = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse AI effect JSON", e);
      }
    }

    const cleanText = text.replace(/JSON：\{.*\}|JSON: \{.*\}/s, "").trim().replace("文本描述：", "");
    return { text: cleanText, effect };
  } catch (error) {
    return { 
      text: "你在废墟中搜索，虽然没遇到丧尸，但也没找到太多有用的东西。", 
      effect: { materials: 5 } 
    };
  }
};
