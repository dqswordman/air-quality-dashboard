# Air Quality Dashboard

该项目通过 React 与 Node 构建，用于监测泰国空气质量。前端使用 Vite、Tailwind 与 Leaflet，后端基于 Express，所有代码均启用 TypeScript 严格模式。

## 依赖

- Node.js 18+
- pnpm
- React 18
- Express 4

## 快速开始

```bash
pnpm install
cp server/.env.example server/.env
pnpm run dev
```
访问 `http://localhost:5173` 预览界面。

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

