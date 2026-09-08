import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface BlogArticleData {
  id: string;
  title: string | null;
  slug: string | null;
  content?: string;
  metaDescription?: string | null;
  seoScore?: number | null;
  status: string;
  wordCount: number;
  readingTime: number;
  tone: string;
  featuredImage?: string | null;
  targetKeyword?: string | null;
  targetKeywords?: string[];
  seoReports?: any[];
  versions?: any[];
  createdAt: string | Date;
  updatedAt: string | Date;
  [key: string]: any;
}

export interface BlogVersionData {
  id: string;
  articleId: string;
  versionNumber: number;
  content: string;
  title: string;
  createdAt: string;
  [key: string]: any;
}

// ============= QUERIES =============

/**
 * Fetch a single blog article by ID using axios
 */
export function useBlogArticle(articleId: string, options?: { enabled?: boolean }) {
  return useQuery<BlogArticleData>({
    queryKey: ['blog-article', articleId],
    queryFn: async () => {
      if (!articleId) throw new Error('Article ID is required');
      const { data } = await axios.get(`/api/blog/articles/${articleId}`);
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch article');
      }
      return data.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!articleId,
  });
}

/**
 * Fetch versions for a blog article using axios
 */
export function useBlogArticleVersions(articleId: string, options?: { enabled?: boolean }) {
  return useQuery<BlogVersionData[]>({
    queryKey: ['blog-article-versions', articleId],
    queryFn: async () => {
      if (!articleId) throw new Error('Article ID is required');
      const { data } = await axios.get(`/api/blog/articles/${articleId}/versions`);
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch versions');
      }
      return data.data || [];
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!articleId,
  });
}

/**
 * Fetch all blog articles list using axios
 */
export function useBlogArticles(params?: { search?: string; status?: string }) {
  return useQuery<BlogArticleData[]>({
    queryKey: ['blog-articles', params],
    queryFn: async () => {
      const { data } = await axios.get('/api/blog/articles', { params });
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch articles');
      }
      return data.data || [];
    },
  });
}

// ============= MUTATIONS =============

/**
 * Update a blog article
 */
export function useUpdateBlogArticle(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<BlogArticleData>) => {
      const { data } = await axios.put(`/api/blog/articles/${articleId}`, payload);
      if (!data.success) {
        throw new Error(data.error || 'Failed to update article');
      }
      return data.data;
    },
    onSuccess: (updatedArticle) => {
      queryClient.setQueryData(['blog-article', articleId], updatedArticle);
      queryClient.invalidateQueries({ queryKey: ['blog-articles'] });
    },
  });
}

/**
 * Trigger an SEO re-analysis for an article
 */
export function useAnalyzeArticleSEO(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/blog/articles/${articleId}/seo`);
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze SEO');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-article', articleId] });
    },
  });
}

/**
 * Restore an article version
 */
export function useRestoreBlogVersion(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versionId: string) => {
      const { data } = await axios.post(`/api/blog/articles/${articleId}/versions`, { versionId });
      if (!data.success) {
        throw new Error(data.error || 'Failed to restore version');
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['blog-article-versions', articleId] });
    },
  });
}

/**
 * Delete a blog article
 */
export function useDeleteBlogArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      const { data } = await axios.delete(`/api/blog/articles/${articleId}`);
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete article');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-articles'] });
    },
  });
}
