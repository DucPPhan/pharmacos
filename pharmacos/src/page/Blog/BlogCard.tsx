import React from 'react';
import { Calendar, Clock, User, Tag as TagIcon } from 'lucide-react';
// import { BlogPost } from '../Blog/blog';

const getCategoryColor = (name: string) => {
  switch (name?.toLowerCase()) {
    case 'skincare': return 'bg-blue-500';
    case 'product reviews': return 'bg-green-500';
    case 'health news': return 'bg-purple-500';
    default: return 'bg-gray-400';
  }
};

interface BlogCardProps {
  post: any;
  onClick?: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  return (
    <div
      className="w-[370px] bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow duration-300 group flex flex-col"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={post.image || post.thumbnail || `https://placehold.co/400x250/E0E0E0/333333?text=${encodeURIComponent(post.title)}`}
          alt={post.title}
          className="w-full h-48 object-cover"
          onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x250/E0E0E0/333333?text=Image+Not+Found'; }}
        />
        {post.category && (
          <span
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-semibold shadow ${getCategoryColor(post.category.name || post.category)}`}
          >
            {post.category.name || post.category}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col p-5">
        <h3 className="text-lg font-bold text-primary mb-2 group-hover:underline line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags && post.tags.map((tag: any) => (
            <span
              key={tag.id || tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors duration-200"
            >
              <TagIcon size={12} />
              {tag.name || tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2">
          <div className="flex items-center gap-2">
            <User size={15} />
            <span>{typeof post.author === 'object' ? (post.author.username || post.author.name || 'Tác giả') : post.author}</span>
            <span className="mx-1">·</span>
            <Clock size={15} />
            <span>{post.readTime || 5} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={15} />
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-GB') : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};