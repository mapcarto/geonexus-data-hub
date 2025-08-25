-- 这个脚本主要用于初始化一些基础表结构
-- 注意：Directus会自动创建大部分所需的表，但我们可以预先创建一些自定义表

-- 创建一个触发器函数来更新时间戳
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建一个自定义的资产关联表（这将与Directus的assets表关联）
CREATE TABLE IF NOT EXISTS spatial_asset_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL,
    feature_id UUID NOT NULL,
    relation_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, feature_id)
);

-- 创建更新时间触发器
CREATE TRIGGER spatial_asset_relations_update_timestamp
BEFORE UPDATE ON spatial_asset_relations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 创建索引以加速查询
CREATE INDEX IF NOT EXISTS spatial_asset_relations_asset_id_idx ON spatial_asset_relations(asset_id);
CREATE INDEX IF NOT EXISTS spatial_asset_relations_feature_id_idx ON spatial_asset_relations(feature_id);

-- 创建一个视图，用于Directus中显示关联信息
CREATE OR REPLACE VIEW asset_feature_relations AS
SELECT 
    r.id,
    r.asset_id,
    r.feature_id,
    r.relation_type,
    r.metadata,
    r.created_at,
    r.updated_at
FROM 
    spatial_asset_relations r;

-- 插入一些示例数据（在实际部署时可以注释掉）
INSERT INTO spatial_asset_relations (id, asset_id, feature_id, relation_type, metadata)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '22222222-2222-2222-2222-222222222222',
     '11111111-1111-1111-1111-111111111111',
     'primary_image',
     '{"caption": "飞渡总部大楼正面照片", "taken_at": "2025-01-15T10:30:00Z"}'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
     '33333333-3333-3333-3333-333333333333',
     '11111111-1111-1111-1111-111111111111',
     'document',
     '{"title": "建筑设计图", "version": "1.2"}'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '55555555-5555-5555-5555-555555555555',
     '44444444-4444-4444-4444-444444444444',
     'video',
     '{"duration": 120, "resolution": "1920x1080"}')
ON CONFLICT (asset_id, feature_id) DO NOTHING;
