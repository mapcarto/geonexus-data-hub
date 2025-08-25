-- 创建审计日志表
CREATE TABLE IF NOT EXISTS public.data_access_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    query_params JSONB,
    user_id VARCHAR(255) NOT NULL,
    user_ip VARCHAR(45) NOT NULL,
    access_time TIMESTAMP WITH TIME ZONE NOT NULL,
    response_time INTEGER,
    record_count INTEGER,
    status VARCHAR(50) DEFAULT 'success'
);

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS idx_data_access_logs_table ON public.data_access_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_user ON public.data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_time ON public.data_access_logs(access_time);

-- 添加注释
COMMENT ON TABLE public.data_access_logs IS '企业级PostGIS Provider的数据访问审计日志';
COMMENT ON COLUMN public.data_access_logs.table_name IS '被访问的表名';
COMMENT ON COLUMN public.data_access_logs.query_params IS '查询参数，JSON格式';
COMMENT ON COLUMN public.data_access_logs.user_id IS '用户ID或标识符';
COMMENT ON COLUMN public.data_access_logs.user_ip IS '用户IP地址';
COMMENT ON COLUMN public.data_access_logs.access_time IS '访问时间';
COMMENT ON COLUMN public.data_access_logs.response_time IS '响应时间(毫秒)';
COMMENT ON COLUMN public.data_access_logs.record_count IS '返回的记录数量';
COMMENT ON COLUMN public.data_access_logs.status IS '请求状态';

-- 创建一个视图，用于查看最近的访问日志
CREATE OR REPLACE VIEW public.recent_data_access AS
SELECT 
    id,
    table_name,
    query_params,
    user_id,
    user_ip,
    access_time,
    response_time,
    record_count,
    status
FROM 
    public.data_access_logs
ORDER BY 
    access_time DESC
LIMIT 100;

-- 创建一个函数，用于清理旧的审计日志（保留最近30天）
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS integer AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.data_access_logs
    WHERE access_time < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建一个定时任务，每天执行一次清理函数（需要管理员权限）
-- 注意：这需要在数据库中启用pg_cron扩展
-- 如果没有pg_cron扩展，可以通过外部调度器（如cron）执行
-- COMMENT OUT: SELECT cron.schedule('0 3 * * *', 'SELECT public.cleanup_old_audit_logs()');

-- 授权
GRANT SELECT, INSERT ON public.data_access_logs TO koop;
GRANT SELECT ON public.recent_data_access TO koop;
GRANT EXECUTE ON FUNCTION public.cleanup_old_audit_logs() TO koop;