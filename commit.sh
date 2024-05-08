time=$(date "+%Y-%m-%d")

read memo
git add .
git commit -m "$time:$memo"
git pull
git push

# feat: 新功能（feature）
# fix: 修补bug
# docs: 文档（documentation）
# style:  格式（不影响代码运行的变动）
# refactor: 重构（即不是新增功能，也不是修改bug的代码变动）
# test: 增加测试
# chore: 构建过程或辅助工具的变动
# build: 本地creator构建
