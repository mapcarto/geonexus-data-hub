# 贡献指南

感谢您对GeoNexus Data Hub的关注！我们非常欢迎社区贡献，无论是修复 bug、改进文档还是添加新功能。本指南将帮助您了解如何参与项目开发。

## 行为准则

请在参与项目时遵循以下准则：

- 尊重所有贡献者和用户
- 接受建设性的批评和反馈
- 关注项目的最佳利益
- 对他人表示同理心

## 如何贡献

### 报告 Bug

如果您发现了 bug，请通过 GitHub Issues 报告，并提供以下信息：

1. 问题的简要描述
2. 复现步骤
3. 期望结果与实际结果
4. 环境信息（操作系统、Docker 版本等）
5. 相关日志或截图

### 提出新功能

如果您有新功能的想法，请先通过 GitHub Issues 讨论，包括：

1. 功能的详细描述
2. 使用场景和价值
3. 可能的实现方式

### 提交代码

1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature-name`
5. 创建 Pull Request

## 开发规范

### 代码风格

我们使用 ESLint 和 Prettier 来保持代码风格一致：

```bash
# 安装依赖
npm install

# 运行代码检查
npm run lint

# 自动修复代码风格问题
npm run lint:fix
```

### 提交信息规范

我们采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型（type）包括：

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码风格修改（不影响功能）
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 添加或修改测试
- **chore**: 构建过程或辅助工具的变动

示例：

```
feat(provider): 添加企业级 PostGIS Provider 的行级安全功能

实现了基于用户角色的行级数据过滤，提高了数据访问的安全性。

Closes #123
```

### 测试要求

所有新功能和 bug 修复都应该包含测试：

- 单元测试：测试单个组件或函数
- 集成测试：测试组件之间的交互

运行测试：

```bash
npm test
```

## 分支策略

我们采用 GitFlow 工作流：

- **master**: 生产环境代码
- **develop**: 开发环境代码
- **feature/***：新功能分支
- **bugfix/***：bug 修复分支
- **release/***：发布分支

## 版本发布流程

1. 从 develop 分支创建 release 分支：`git checkout -b release/x.y.z develop`
2. 更新版本号和更新日志
3. 提交更改：`git commit -m 'chore: bump version to x.y.z'`
4. 合并到 master 分支：`git checkout master && git merge --no-ff release/x.y.z`
5. 打标签：`git tag -a vx.y.z -m 'version x.y.z'`
6. 合并回 develop 分支：`git checkout develop && git merge --no-ff release/x.y.z`
7. 删除 release 分支：`git branch -d release/x.y.z`
8. 推送更改：`git push origin master develop --tags`

## 文档贡献

文档是项目的重要组成部分，我们同样欢迎文档贡献：

1. 修复文档中的错误或不准确之处
2. 改进现有文档的清晰度和完整性
3. 添加新的文档，如教程、示例或最佳实践

文档位于 `docs/` 目录，使用 Markdown 格式编写。

## 代码审查

所有的 Pull Request 都会经过代码审查：

1. 代码是否符合项目风格和规范
2. 是否包含适当的测试
3. 文档是否已更新
4. 是否解决了相关问题

## 获取帮助

如果您在贡献过程中需要帮助，可以：

- 在 GitHub Issues 中提问
- 联系项目维护者
- 查阅项目文档

## 致谢

再次感谢您对GeoNexus Data Hub的贡献！您的参与对项目的发展至关重要。
