# Air Quality Dashboard

该项目通过 React 和 Node 构建，用于监测泰国空气质量。前端使用 Vite + Tailwind + Leaflet，后端基于 Express。所有代码均采用 TypeScript 且严格模式。

## 本地启动

```bash
pnpm i
cp server/.env.example server/.env
# 在 server/.env 中填写 WAQI_TOKEN
pnpm dev
```
访问 `http://localhost:5173` 即可预览。

### 单元测试与代码风格检查

```bash
pnpm run lint
pnpm run test
```

## 目录结构

- `client/` 前端源码
- `server/` 后端源码
- `tests/`   单元测试

## 部署

Server 可部署至 Render，需使用 Dockerfile 或 render.yaml 配置。
Client 可部署至 Netlify，环境变量 `VITE_API_BASE` 指向后端地址。

详细步骤：
1. Render 创建 Web Service，设置构建命令 `pnpm --filter server build`，启动命令 `node dist/index.js`。
2. Netlify 新建站点，设置环境变量 `VITE_API_BASE=/api` 并配置代理到 Render URL。
