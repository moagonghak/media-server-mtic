DROP DATABASE IF EXISTS media_db;
CREATE DATABASE media_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE media_db;

CREATE TABLE media_table (
  media_id INT UNSIGNED NOT NULL,
  media_type TINYINT UNSIGNED NOT NULL,
  original_language VARCHAR(20),
  title VARCHAR(255) NOT NULL,
  overview TEXT,
  popularity FLOAT DEFAULT NULL,
  poster_path VARCHAR(255) DEFAULT NULL,
  backdrop_path VARCHAR(255) DEFAULT NULL,
  vote_average FLOAT,
  vote_count INT,
  release_date VARCHAR(22) DEFAULT NULL,
  adult TINYINT(1) DEFAULT NULL,
  genre_ids VARCHAR(255),
  PRIMARY KEY (media_id, media_type),
  INDEX idx_media_id_type (media_id, media_type)
);

CREATE TABLE title_search_histories (
  title VARCHAR(255) NOT NULL PRIMARY KEY,
  last_search_date VARCHAR(22) NOT NULL
);

CREATE TABLE detail_search_histories (
  media_id INT PRIMARY KEY,
  media_type TINYINT UNSIGNED NOT NULL,
  last_search_date VARCHAR(22) NOT NULL
);

CREATE TABLE movie_table (
  media_id int PRIMARY KEY,
  title varchar(255) DEFAULT NULL,
  original_title varchar(255) DEFAULT NULL,
  original_language varchar(10) DEFAULT NULL,
  release_date VARCHAR(22) DEFAULT NULL,
  overview text,
  popularity float DEFAULT NULL,
  poster_path varchar(255) DEFAULT NULL,
  backdrop_path varchar(255) DEFAULT NULL,
  runtime int DEFAULT NULL,
  status varchar(50) DEFAULT NULL,
  tagline varchar(255) DEFAULT NULL,
  genres text,
  production_companies text,
  production_countries text,
  spoken_languages text,
  cast text,
  crew text,
  adult tinyint(1) DEFAULT NULL,
  video tinyint(1) DEFAULT NULL,
  vote_average float DEFAULT NULL,
  vote_count int DEFAULT NULL,
  belongs_to_collection varchar(255) DEFAULT NULL,
  INDEX idx_media_id (media_id)
);

CREATE TABLE tvseries_table (
  media_id INT PRIMARY KEY,
  adult BOOLEAN,
  backdrop_path VARCHAR(255),
  first_air_date VARCHAR(22),
  homepage VARCHAR(255),
  in_production BOOLEAN,
  last_air_date VARCHAR(22),
  last_episode_to_air TEXT,
  name VARCHAR(255),
  original_language VARCHAR(10),
  original_name VARCHAR(255),
  overview TEXT,
  popularity FLOAT,
  poster_path VARCHAR(255),
  status VARCHAR(50),
  tagline VARCHAR(255),
  type VARCHAR(50),
  vote_average FLOAT,
  vote_count INT,
  created_by TEXT,
  episode_run_time TEXT,
  genres TEXT,
  languages TEXT,
  networks TEXT,
  number_of_episodes INT,
  number_of_seasons INT,
  origin_country TEXT,
  production_companies TEXT,
  production_countries TEXT,
  seasons TEXT,
  spoken_languages TEXT,
  cast TEXT,
  crew TEXT,
  INDEX idx_media_id (media_id)
);

CREATE TABLE preview_table (
  id VARCHAR(255) PRIMARY KEY,
  media_type INT DEFAULT 0,
  media_id INT DEFAULT NULL,
  iso_639_1 VARCHAR(2) DEFAULT NULL,
  iso_3166_1 VARCHAR(2) DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  video_key VARCHAR(255) DEFAULT NULL,
  site VARCHAR(255) DEFAULT NULL,
  size INT DEFAULT NULL,
  type VARCHAR(255) DEFAULT NULL,
  official TINYINT(1) DEFAULT NULL,
  published_at VARCHAR(22) DEFAULT NULL,
  INDEX idx_id (id),
  INDEX idx_media_type_id (media_type, media_id)
);

CREATE TABLE person_table (
  id INT PRIMARY KEY,
  adult TINYINT(1) DEFAULT NULL,
  also_known_as TEXT,
  biography TEXT,
  birthday VARCHAR(22) DEFAULT NULL,
  deathday VARCHAR(22) DEFAULT NULL,
  gender INT DEFAULT NULL,
  homepage VARCHAR(255) DEFAULT NULL,
  imdb_id VARCHAR(255) DEFAULT NULL,
  known_for_department VARCHAR(255) DEFAULT NULL,
  name VARCHAR(255) DEFAULT NULL,
  place_of_birth VARCHAR(255) DEFAULT NULL,
  popularity FLOAT DEFAULT NULL,
  profile_path VARCHAR(255) DEFAULT NULL,
  korean_name VARCHAR(32) DEFAULT NULL,
  last_updated VARCHAR(22) NOT NULL,
  INDEX idx_id (id)
);

CREATE TABLE watch_provider_table (
  media_type TINYINT UNSIGNED NOT NULL,
  media_id INT UNSIGNED NOT NULL,
  provider_id INT UNSIGNED NOT NULL,  
  provider_name VARCHAR(255) NOT NULL,
  last_updated VARCHAR(22) NOT NULL,
  PRIMARY KEY (media_id, media_type, provider_id),
  INDEX idx_media_type_id (media_type, media_id)
);