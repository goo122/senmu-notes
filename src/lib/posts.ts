import { getCollection, type CollectionEntry } from 'astro:content';
import type { Category } from './site';
import { getReadingMinutes } from './reading';

export type Post = CollectionEntry<'posts'>;

export type SearchEntry = {
  slug: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  pubDate: string;
  body: string;
};

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const featured = posts.filter((p) => p.data.featured);
  if (featured.length > 0) return featured.slice(0, limit);
  return posts.slice(0, limit);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const posts = await getPublishedPosts();
  const map = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.tags.includes(tag));
}

export async function getPostsByCategory(category: Category): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.category === category);
}

export async function getCategoryCounts(): Promise<
  { category: Category; count: number }[]
> {
  const posts = await getPublishedPosts();
  const map = new Map<Category, number>();
  for (const post of posts) {
    const cat = post.data.category;
    map.set(cat, (map.get(cat) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getNeighborPosts(
  slug: string,
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export function readingMinutesFor(post: Post): number {
  return getReadingMinutes(post.body);
}

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
    body: post.body
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#>*_`\[\]()!-]/g, ' ')
      .slice(0, 4000),
  }));
}
