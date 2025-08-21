# UW Date - 滑铁卢大学约会评价平台

UW Date 是一个为滑铁卢大学社区设计的独立约会评价平台，允许用户分享和浏览约会经历评价。

## 项目特色

- 🔒 **隐私保护** - 自动隐藏敏感信息，姓名星号化处理
- ⚡ **快速审核** - 30分钟内完成人工审核
- 🎯 **精准搜索** - 支持精确姓名匹配搜索
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🛡️ **内容管理** - 严格的内容审核和申诉机制

## 功能模块

### 核心功能
- 评价提交和审核系统
- 姓名搜索和结果展示
- 隐私保护和内容过滤
- 举报和申诉机制

### 页面结构
- `index.html` - 主页展示
- `submit.html` - 评价提交表单
- `search-results.html` - 搜索结果页面
- `privacy.html` - 隐私政策
- `terms.html` - 服务条款
- `appeal.html` - 申诉流程

## 技术栈

- **前端**: HTML5, CSS3, 原生JavaScript
- **样式**: 响应式设计，支持深色/浅色主题
- **数据**: 本地JavaScript数据存储（演示用）
- **部署**: 静态网站，可部署到任何Web服务器

## 安装和运行

1. 克隆项目到本地：
```bash
git clone <repository-url>
cd uwdate_copilot
```

2. 使用本地服务器运行：
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用任何其他静态服务器
```

3. 在浏览器中访问：
```
http://localhost:8000
```

## 项目结构

```
uwdate_copilot/
├── index.html              # 主页
├── submit.html             # 提交评价页面
├── search-results.html     # 搜索结果页面
├── privacy.html            # 隐私政策
├── terms.html              # 服务条款
├── appeal.html             # 申诉流程
├── styles.css              # 主样式文件
├── submit.css              # 提交页面样式
├── search-results.css      # 搜索结果样式
├── legal.css               # 法律页面样式
├── script.js               # 主JavaScript文件
├── submit.js               # 提交页面脚本
├── search-results.js       # 搜索结果脚本
├── uw-logo.png            # UW标志（需要添加）
└── README.md              # 项目说明
```

## 自定义配置

### 添加UW标志
将滑铁卢大学的标志文件重命名为 `uw-logo.png` 并放置在项目根目录。

### 修改示例数据
编辑 `script.js` 文件中的 `reviewsData` 数组来自定义示例评价数据。

### 配置邮箱
在所有HTML文件中将 `uwdate@example.com` 替换为实际的联系邮箱。

## 功能说明

### 隐私保护
- 姓名自动星号化处理（如：张*** ）
- 敏感信息自动检测和隐藏
- 仅精确匹配时显示完整信息

### 搜索功能
- 支持中英文姓名搜索
- 实时搜索结果展示
- 搜索历史管理

### 评价系统
- 多种关系类型选择
- 正面/负面标签分类
- 详细评价内容
- 图片证据上传

### 审核机制
- 自动内容过滤
- 人工审核流程
- 申诉和举报系统

## 部署建议

### 静态部署
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### 服务器部署
- Nginx + 静态文件
- Apache HTTP Server
- 任何支持静态文件的Web服务器

## 法律声明

⚠️ **重要提醒**: 
- 本项目与滑铁卢大学(UW)或任何教育机构无关联
- 仅供技术学习和演示用途
- 实际部署前请确保符合当地法律法规
- 需要实现适当的数据保护和隐私措施

## 开发指南

### 添加新功能
1. 在相应的HTML文件中添加界面元素
2. 在CSS文件中添加样式
3. 在JavaScript文件中实现功能逻辑

### 数据结构
评价数据结构示例：
```javascript
{
    id: 1,
    name: "完整姓名",
    displayName: "隐私化姓名",
    tags: ["标签1", "标签2"],
    tagTypes: ["positive", "negative"],
    content: "评价内容",
    program: "专业",
    year: "年级"
}
```

## 许可证

本项目仅供学习和演示使用。请在使用前仔细阅读相关法律法规。

## 联系方式

如有技术问题或建议，请通过GitHub Issues联系。

---

**免责声明**: 本平台内容为用户主观意见分享，不构成事实陈述或建议。使用者需自行判断信息的准确性和适用性。
