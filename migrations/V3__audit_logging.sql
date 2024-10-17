ALTER TABLE payment_methods
DROP PRIMARY KEY,
CHANGE COLUMN id object_id BIGINT NOT NULL AUTO_INCREMENT,
ADD COLUMN version_id BIGINT NOT NULL,
ADD COLUMN created_by BIGINT NOT NULL,
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL,
ADD PRIMARY KEY (object_id, version_id);

UPDATE payment_methods
SET version_id = 1,         
    created_by = parent_id;