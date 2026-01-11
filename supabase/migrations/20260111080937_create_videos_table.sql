/*
  # Create videos table for UmmahTube

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `channel_name` (text, required)
      - `thumbnail_url` (text)
      - `video_url` (text, required)
      - `views` (integer, default 0)
      - `likes` (integer, default 0)
      - `created_at` (timestamp)
      - `duration` (integer, video duration in seconds)

  2. Security
    - RLS disabled for now (no authentication)
    - Public read access for all videos

  3. Indexes
    - Index on created_at for sorting
    - Index on title for searching
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  channel_name text NOT NULL,
  thumbnail_url text,
  video_url text NOT NULL,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  duration integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);

INSERT INTO videos (title, channel_name, description, thumbnail_url, video_url, duration, views, likes)
VALUES
  ('Understanding Surah Al-Fatiha', 'Islamic Learning Hub', 'A comprehensive explanation of Surah Al-Fatiha, the opening chapter of the Quran.', 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video1.mp4', 1245, 5420, 342),
  ('Daily Dua for Protection', 'Spiritual Guidance', 'Learn the most important duas for protection and peace in daily life.', 'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video2.mp4', 892, 3210, 245),
  ('Islamic History: The Golden Age', 'History & Culture', 'Explore the remarkable scientific and cultural achievements of Islamic civilization.', 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video3.mp4', 2145, 7890, 612),
  ('Quran Recitation - Surah Al-Mulk', 'Quran Recitations', 'Beautiful recitation of Surah Al-Mulk with English translation.', 'https://images.pexels.com/photos/269415/pexels-photo-269415.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video4.mp4', 1540, 4320, 520),
  ('Islamic Finance Basics', 'Finance & Islam', 'Understanding Halal investments and Islamic banking principles.', 'https://images.pexels.com/photos/210574/pexels-photo-210574.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video5.mp4', 1830, 2150, 180),
  ('How to Perform Salah Correctly', 'Islamic Practices', 'Step-by-step guide to performing the five daily prayers correctly.', 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video6.mp4', 1420, 9800, 750),
  ('The Life of Prophet Muhammad (PBUH)', 'Prophetic Biography', 'A detailed account of the life and teachings of the Prophet Muhammad.', 'https://images.pexels.com/photos/924514/pexels-photo-924514.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video7.mp4', 3200, 12400, 1050),
  ('Ramadan Preparation Guide', 'Ramadan Series', 'Everything you need to know to prepare spiritually and physically for Ramadan.', 'https://images.pexels.com/photos/533189/pexels-photo-533189.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://example.com/video8.mp4', 1645, 6700, 580);
