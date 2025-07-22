import NodeCache from 'node-cache';

// 减少缓存时间为60秒，避免长时间使用过期数据
export const cache = new NodeCache({ stdTTL: 60, checkperiod: 30, useClones: false });
