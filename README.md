# Air Quality Dashboard

该项目通过 React 与 Node 构建，用于监测泰国空气质量。前端使用 Vite、Tailwind 与 Leaflet，后端基于 Express，所有代码均启用 TypeScript 严格模式。访问 WAQI API 时需要有效的 `WAQI_TOKEN`。免费 token 速率限制：**1 次/秒，1000 次/日**。

## 依赖

- Node.js 18+
- pnpm
- React 18
- Express 4

## 快速开始

```bash
pnpm install
cp server/.env.example server/.env
# 访问 https://aqicn.org/data-platform/token/ 申请 48 字符 token
# 打开 server/.env 填入 WAQI_TOKEN 与 PORT（端口映射 5174 ↔ 4321）
pnpm run dev
```
前端默认运行在 `http://localhost:5174`，后端监听 `http://localhost:4321`，两者通过代理连接。访问 `http://localhost:5174` 预览界面。

## 脚本说明

- `pnpm run dev`：同时启动前端与后端
- `pnpm run lint`：执行 ESLint 检查
- `pnpm run test`：运行 Vitest 单元测试

### CI 示例

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm run lint && pnpm run test
```

## 目录结构

- `client/` 前端源码
- `server/` 后端源码
- `tests/`  单元测试

## 贡献指南

欢迎提交 PR，建议遵循最小 diff 原则并确保 `pnpm run lint && pnpm run test` 通过。

## 常见错误排查

- 若接口返回 502 且消息为 `WAQI error`，请检查 `WAQI_TOKEN` 是否填写正确。

