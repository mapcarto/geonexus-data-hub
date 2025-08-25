-- 确保 PostGIS 扩展已启用
CREATE EXTENSION IF NOT EXISTS postgis;
-- 确保 UUID 扩展已启用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建我们的业务要素表
CREATE TABLE IF NOT EXISTS business_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    asset_ids JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为几何列添加空间能力
SELECT AddGeometryColumn('public', 'business_features', 'geom', 4326, 'POINT', 2);

-- 创建空间索引以加速查询
CREATE INDEX IF NOT EXISTS business_features_geom_idx ON business_features USING GIST (geom);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_features_update_timestamp
BEFORE UPDATE ON business_features
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 插入一些示例数据
INSERT INTO business_features (id, name, status, asset_ids, geom)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 
     '飞渡总部', 
     'active', 
     '[{"id": "22222222-2222-2222-2222-222222222222", "type": "image"}, {"id": "33333333-3333-3333-3333-333333333333", "type": "document"}]',
     ST_SetSRID(ST_MakePoint(116.4, 39.9), 4326)),
    ('44444444-4444-4444-4444-444444444444', 
     '科技园区', 
     'active', 
     '[{"id": "55555555-5555-5555-5555-555555555555", "type": "video"}]',
     ST_SetSRID(ST_MakePoint(116.41, 39.91), 4326)),
    ('66666666-6666-6666-6666-666666666666', 
     '研发中心', 
     'planning', 
     '[]',
     ST_SetSRID(ST_MakePoint(116.42, 39.92), 4326))
ON CONFLICT (id) DO NOTHING;
