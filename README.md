# 阮一峰老师的新闻周刊归类
受[lajfox的留言](http://www.ruanyifeng.com/blog/2019/05/weekly-issue-55.html#comment-411176)的启发，本项目将[阮一峰老师的新闻周刊](https://github.com/ruanyf/weekly)中的各个条目转换成json格式，以便于离线检索与归类。

本项目迁移至deno，但是deno的标准模块仍不可用。迁移后的代码未调试。

## 目前实现的功能
- 将博客中的各个词条重构为JSON格式
- 提取元数据

## 将来可能实现
- 根据元数据筛选博客条目
- 使用自然语言处理技术分类博客条目