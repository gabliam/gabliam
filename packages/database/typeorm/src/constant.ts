export const ConnectionOptionsBeanId = Symbol('ConnectionOptionsBeanId');

export const TYPE = {
  Entity: 'EntityTypeOrm',
  Migration: 'MigrationEntityTypeOrm',
  EventSubscriber: 'EventSubscriberTypeOrm',
};

export const METADATA_KEY = {
  cunit: '_cunit',
};

export const ENTITIES_TYPEORM = Symbol('TYPEORM/ENTITIES_TYPEORM');

export const MIGRATIONS_TYPEORM = Symbol('TYPEORM/MIGRATIONS_TYPEORM');

export const SUBSCRIBERS_TYPEORM = Symbol('TYPEORM/SUBSCRIBERS_TYPEORM');
