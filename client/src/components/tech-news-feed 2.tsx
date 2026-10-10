"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, MessageCircle, RefreshCw, Rss } from "lucide-react";

type HackerNewsStory = {
  id: number;
  title: string;
  url?: string;
  score?: number;
  time?: number;
  descendants?: number;
};

function relativeTime(timestamp?: number) {
  if (!timestamp) return "Recently";
  const hours = Math.max(1, Math.floor((Date.now() - timestamp * 1000) / 3_600_000));
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export function TechNewsFeed() {
  const [stories, setStories] = useState<HackerNewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStories() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load the top stories.");
        const storyIds: number[] = await response.json();
        const results = await Promise.all(
          storyIds.slice(0, 5).map(async (id) => {
            const storyResponse = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
              { signal: controller.signal },
            );
            if (!storyResponse.ok) return null;
            return (await storyResponse.json()) as HackerNewsStory | null;
          }),
        );
        if (!controller.signal.aborted) {
          setStories(results.filter((story): story is HackerNewsStory => Boolean(story?.title)));
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadStories();
    return () => controller.abort();
  }, [refreshKey]);

  return (
    <section className="home-feed-card tech-news" aria-labelledby="tech-news-title">
      <div className="home-module-heading">
        <div>
          <div className="eyebrow mono">Around the web / 02</div>
          <h2 className="home-module-title" id="tech-news-title">
            <Rss size={19} aria-hidden="true" /> Tech News Feed
          </h2>
        </div>
        <button
          aria-label="Refresh tech news"
          className="news-refresh"
          disabled={loading}
          onClick={() => setRefreshKey((current) => current + 1)}
          type="button"
        >
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          Refresh
        </button>
      </div>
      <p className="home-module-copy">Fresh developer stories from the Hacker News front page.</p>

      {loading ? (
        <div className="news-state" aria-live="polite">
          <span className="news-pulse" /> Loading the latest stories…
        </div>
      ) : error ? (
        <div className="news-state news-error" role="status">
          <span>Couldn’t load the live feed right now.</span>
          <a href="https://news.ycombinator.com/" target="_blank" rel="noreferrer">
            Open Hacker News <ArrowUpRight size={13} />
          </a>
        </div>
      ) : stories.length ? (
        <ol className="news-story-list">
          {stories.map((story, index) => (
            <li className="news-story" key={story.id}>
              <span className="news-story-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="news-story-content">
                <a
                  className="news-story-title"
                  href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  {story.title} <ArrowUpRight size={13} />
                </a>
                <div className="news-story-meta">
                  <span>{relativeTime(story.time)}</span>
                  <span>{story.score ?? 0} points</span>
                  <a
                    href={`https://news.ycombinator.com/item?id=${story.id}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle size={12} /> {story.descendants ?? 0}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="news-state">No stories are available at the moment.</div>
      )}
      <a
        className="news-source-link"
        href="https://news.ycombinator.com/"
        target="_blank"
        rel="noreferrer"
      >
        Visit Hacker News <ArrowUpRight size={13} />
      </a>
    </section>
  );
}
