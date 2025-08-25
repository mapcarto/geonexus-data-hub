-- 启用uuid生成扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建一个触发器函数来更新时间戳
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified = now();
    RETURN NEW;
END;
$$ language 'plpgsql';