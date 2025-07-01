import React, { useState, useMemo, useEffect } from 'react';
import { BlogCard } from './BlogCard';
import { BlogDetail } from './BlogDetail';


export const BlogList: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('http://localhost:10000/api/blogs?page=1&limit=100');
        const data = await res.json();
        let blogs = [];
        if (Array.isArray(data)) blogs = data;
        else if (Array.isArray(data.blogs)) blogs = data.blogs;
        else if (data.data && Array.isArray(data.data.blogs)) blogs = data.data.blogs;
        // Normalize blogs to match mockData structure
        const normalizedBlogs = blogs.map((b: any) => ({
          ...b,
          id: b._id,
          excerpt: b.content ? b.content.slice(0, 120) + '...' : '',
          author: typeof b.author === 'object' ? (b.author.name || b.author.username || '') : b.author,
          category: typeof b.category === 'object' ? b.category : { id: b.category, name: b.category },
          tags: Array.isArray(b.tags)
            ? b.tags.map((t: any) => (typeof t === 'object' ? t : { id: t, name: t }))
            : [],
        }));
        setBlogPosts(normalizedBlogs);
      } catch (err) {
        setBlogPosts([]);
      }
    };
    fetchBlogs();
  }, []);

  // Fetch blog detail by id
  useEffect(() => {
    if (selectedPostId) {
      setLoadingDetail(true);
      setSelectedPost(null);
      fetch(`http://localhost:10000/api/blogs/${selectedPostId}`)
        .then(res => res.json())
        .then(data => {
          let blog = data;
          if (data.data) blog = data.data;
          // Normalize
          const normalized = {
            ...blog,
            id: blog._id,
            excerpt: blog.content ? blog.content.slice(0, 120) + '...' : '',
            author: typeof blog.author === 'object' ? (blog.author.name || blog.author.username || '') : blog.author,
            category: typeof blog.category === 'object' ? blog.category : { id: blog.category, name: blog.category },
            tags: Array.isArray(blog.tags)
              ? blog.tags.map((t: any) => (typeof t === 'object' ? t : { id: t, name: t }))
              : [],
          };
          setSelectedPost(normalized);
        })
        .finally(() => setLoadingDetail(false));
    }
  }, [selectedPostId]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handlePostClick = (post: any) => {
    setSelectedPostId((post as any).id || (post as any)._id);
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
    setSelectedPost(null);
  };

  // Đếm số lượng cho categories và tags
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    blogPosts.forEach(post => {
      if (post.category && post.category.id) {
        counts[post.category.id] = (counts[post.category.id] || 0) + 1;
      }
    });
    return counts;
  }, [blogPosts]);
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    blogPosts.forEach(post => {
      (post.tags || []).forEach((tag: any) => {
        if (tag.id) counts[tag.id] = (counts[tag.id] || 0) + 1;
      });
    });
    return counts;
  }, [blogPosts]);
  const categoriesWithCount = categories.map((cat: any) => ({ ...cat, count: categoryCounts[cat.id] || 0 }));
  const tagsWithCount = tags.map((tag: any) => ({ ...tag, count: tagCounts[tag.id] || 0 }));

  // Filter posts
  const filteredPosts = blogPosts.filter(post => {
    // Search
    const matchesSearch = !searchTerm || post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    // Category
    const matchesCategory = !selectedCategory || (post.category && post.category.id === selectedCategory);
    // Tags
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tagId => (post.tags || []).some((t: any) => t.id === tagId));
    return matchesSearch && matchesCategory && matchesTags;
  });

  // If a post is selected, show the detail view
  if (selectedPostId) {
    if (loadingDetail || !selectedPost) {
      return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Đang tải chi tiết bài viết...</div>;
    }
    return <BlogDetail post={selectedPost} onBack={handleBackToList} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-0">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beauty & Health Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, reviews, and the latest news in beauty and health
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-8 items-end max-w-5xl mx-auto">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tìm theo tiêu đề</label>
            <input
              type="text"
              placeholder="Nhập tiêu đề..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg min-w-[160px]"
              placeholder="mm/dd/yyyy"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg min-w-[160px]"
              placeholder="mm/dd/yyyy"
            />
          </div>
        </div>

        <div className="flex flex-row w-full max-w-7xl mx-auto px-4 gap-8">
          {/* <aside className="w-full max-w-xs">
            <BlogSidebar
              categories={categoriesWithCount}
              tags={tagsWithCount}
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCategorySelect={setSelectedCategory}
              onTagToggle={handleTagToggle}
            />
          </aside> */}
          <main className="flex-1">
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredPosts.length} of {blogPosts.length} articles
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {filteredPosts.map((post: any) => (
                <BlogCard 
                  key={post._id || post.id} 
                  post={post} 
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No articles found matching your criteria.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};