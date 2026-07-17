import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(['tech', 'life', 'notes', 'other']),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { posts };
