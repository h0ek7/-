
import { CityData, CityKey } from './types';

export const CITIES: Record<CityKey, CityData> = {
  BEIJING: {
    id: 'BEIJING',
    name: '北京',
    description: '废墟中的帝都，拥有更坚固的军事级初期装备。',
    initialRV: '军用帐篷皮卡',
    initialWeapon: '工兵铲',
    bonusItem: '军用压缩饼干',
    terrain: '胡同与废墟',
  },
  SHANGHAI: {
    id: 'SHANGHAI',
    name: '上海',
    description: '现代都市森林，资源虽丰但丧尸极多。',
    initialRV: '电动轻客',
    initialWeapon: '电击棍',
    bonusItem: '扫描仪',
    terrain: '摩天大楼废墟',
  },
  CHENGDU: {
    id: 'CHENGDU',
    name: '成都',
    description: '巴蜀之地，美食与悠闲心态能更好地抵抗疯狂。',
    initialRV: '简易五菱',
    initialWeapon: '大砍刀',
    bonusItem: '麻辣罐头',
    terrain: '小巷与平原',
  },
  HARBIN: {
    id: 'HARBIN',
    name: '哈尔滨',
    description: '极寒之地，防寒系统是生存关键。',
    initialRV: '抗寒改装房车',
    initialWeapon: '猎枪',
    bonusItem: '烈酒',
    terrain: '雪原',
  },
  XIAN: {
    id: 'XIAN',
    name: '西安',
    description: '古城墙后，防御是第一要务。',
    initialRV: '重甲护卫车',
    initialWeapon: '十字弩',
    bonusItem: '肉夹馍',
    terrain: '古城废墟',
  },
  GUANGZHOU: {
    id: 'GUANGZHOU',
    name: '广州',
    description: '南方枢纽，机动性极佳。',
    initialRV: '极速改装商务车',
    initialWeapon: '厨刀',
    bonusItem: '凉茶',
    terrain: '复杂高架桥',
  },
  WUHAN: {
    id: 'WUHAN',
    name: '武汉',
    description: '江城之地，先进的医疗研究背景。',
    initialRV: '医疗支援车',
    initialWeapon: '手术刀',
    bonusItem: '急救包',
    terrain: '桥梁与湖泊',
  },
  CHONGQING: {
    id: 'CHONGQING',
    name: '重庆',
    description: '山城崎岖，只有强力驱动才能通行。',
    initialRV: '山地越野房车',
    initialWeapon: '铁撬棍',
    bonusItem: '辣味补给',
    terrain: '立体山城',
  }
};

export const INITIAL_STATS = {
  health: 100,
  hunger: 100,
  thirst: 100,
  sanity: 100
};

export const SURVIVAL_TARGET = 1000; // Total KM to reach safety/ending
