# Repo Guidance

## 环境要求
- Node.js 18 或更高版本
- 使用 pnpm 管理多工作区 (pnpm workspaces)

## 安装依赖
```bash
pnpm install
```
复制 `server/.env.example` 为 `server/.env`，填写 `WAQI_TOKEN` 与 `PORT`。
`WAQI_TOKEN` 需在 <https://aqicn.org/data-platform/token/> 申请，48 字符，免费额度为 1 次/秒、1000 次/日。

## 质量检查
```bash
pnpm run lint && pnpm run test
```

## 本地运行
```bash
pnpm run dev
```
该命令会同时启动后端 `ts-node-dev --project tsconfig.json --respawn ...` 与前端 `vite`，端口映射为 5174 ↔ 4321。

## 最小改动
在提交代码时遵循最小 diff‑patch 原则。

## 修复策略
出现问题时，先编写或完善相关测试复现 bug，再在确保 `pnpm run lint && pnpm run test` 通过的前提下进行最小修改。

