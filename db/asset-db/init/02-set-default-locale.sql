-- 这个脚本在Directus初始化后运行，设置默认语言为中文
-- 注意：这个脚本会在每次容器启动时执行，但UPDATE语句是幂等的

-- 检查directus_settings表是否存在，如果存在则更新默认语言设置
DO $$
BEGIN
    -- 检查表是否存在
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'directus_settings') THEN
        -- 检查是否有default_locale列
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'directus_settings' AND column_name = 'default_locale') THEN
            -- 更新默认语言设置
            UPDATE directus_settings SET default_locale = 'zh-CN' WHERE id = 1;
        ELSE
            -- 如果列不存在，可能需要先添加列（但Directus应该会自动处理）
            RAISE NOTICE 'default_locale column does not exist in directus_settings table';
        END IF;
    END IF;
END $$;