# Repo Guidance

## 环境要求
- Node.js 18 或更高版本
- 使用 pnpm 管理多工作区 (pnpm workspaces)

## 安装依赖
```bash
pnpm install
```

## 质量检查
```bash
pnpm run lint && pnpm run test
```

## 本地运行
```bash
pnpm run dev
```
该命令会同时启动后端 `ts-node-dev --project tsconfig.json --respawn ...` 与前端 `vite`，分别监听 4321 与 5174 端口。

## 最小改动
在提交代码时遵循最小 diff‑patch 原则。

