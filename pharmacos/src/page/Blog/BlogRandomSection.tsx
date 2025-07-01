import React, { useEffect, useState } from 'react';
import { BlogCard } from './BlogCard';
import { useNavigate } from 'react-router-dom';

export const BlogRandomSection = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:10000/api/blogs?page=1&limit=100')
      .then(res => res.json())
      .then(data => {
        let blogList = [];
        if (Array.isArray(data)) blogList = data;
        else if (Array.isArray(data.blogs)) blogList = data.blogs;
        else if (data.data && Array.isArray(data.data.blogs)) blogList = data.data.blogs;
        // Random 3 blog
        blogList = blogList.sort(() => 0.5 - Math.random()).slice(0, 3);
        setBlogs(blogList);
      });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black-700">Blog có thể bạn quan tâm</h2>
        <button
          className="text-blue-600 hover:underline font-medium"
          onClick={() => navigate('/blog')}
        >
          Xem tất cả blog
        </button>
      </div>
      <div className="flex flex-wrap gap-8 justify-center">
        {blogs.map(blog => (
          <BlogCard 
            key={blog._id || blog.id} 
            post={blog} 
            onClick={() => navigate(`/blog/${blog._id || blog.id}`)}
          />
        ))}
      </div>
    </section>
  );
}; 