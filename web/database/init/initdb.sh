#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    create database ${DB_NAME};
    \c ${DB_NAME}
    create schema ${DB_SCHEMA};

    create database ${DB_NAME}_test;
    \c ${DB_NAME}_test
    create schema ${DB_SCHEMA};
EOSQL
