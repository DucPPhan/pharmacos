import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Bookmark, Heart } from 'lucide-react';

interface BlogDetailProps {
  post?: any;
  onBack?: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ post: propPost, onBack }) => {
  const { id } = useParams();
  const [post, setPost] = useState<any | null>(propPost || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!propPost && id) {
      setLoading(true);
      setError("");
      fetch(`http://localhost:10000/api/blogs/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Không tìm thấy bài viết");
          return res.json();
        })
        .then(data => {
          let blog = data;
          if (data.data) blog = data.data;
          setPost(blog);
        })
        .catch(err => setError(err.message || "Có lỗi xảy ra"))
        .finally(() => setLoading(false));
    }
  }, [id, propPost]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Đang tải chi tiết bài viết...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">{error}</div>;
  if (!post) return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Không tìm thấy bài viết.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header with back button */}
      {/* <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Back to Blog</span>
          </button>
        </div>
      </div> */}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image + Info Side by Side */}
        <div className="flex flex-col md:flex-row gap-8 mb-8 items-stretch">
          {/* Hero Image Left */}
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <img
              src={post.thumbnail || post.imageUrl || 'https://via.placeholder.com/600x400'}
              alt={post.title}
              className="w-full h-64 md:h-full object-cover object-center"
              style={{ minHeight: '260px', maxHeight: '420px' }}
            />
          </div>
          {/* Info Right */}
          <div className="w-full md:w-1/2 flex flex-col justify-center px-0 md:px-8">
            <span className={`self-start px-4 py-2 rounded-full text-white text-sm font-medium mb-4 ${post.category?.color || 'bg-gray-400'}`}> 
              {post.category?.name || post.category || 'Chuyên mục'}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span className="font-medium">{typeof post.author === 'object' ? (post.author?.name || post.author?.username || 'Tác giả') : post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{post.readTime || 5} min read</span>
              </div>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(post.tags || []).map((tag: any) => (
                <span
                  key={tag.id || tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors duration-200"
                >
                  <Tag size={12} />
                  {tag.name || tag}
                </span>
              ))}
            </div>
            {/* Excerpt */}
            <p className="text-xl text-gray-700 mb-0 font-medium leading-relaxed whitespace-pre-line">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-white rounded-xl shadow-sm p-8">
            {post.excerpt && (
              <p className="text-xl text-gray-700 mb-6 font-medium leading-relaxed whitespace-pre-line">
                {post.excerpt}
              </p>
            )}
            {post.content && (
              <div className="text-gray-800 leading-relaxed space-y-6" style={{wordBreak: 'break-word'}}>
                {/<[a-z][\s\S]*>/i.test(post.content) ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  post.content.split('\n').map((line: string, idx: number) => (
                    <p key={idx} className="mb-2 whitespace-pre-line">{line}</p>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Author Bio
        <div className="bg-white rounded-xl shadow-sm p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {post.author.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author}</h3>
              <p className="text-gray-600 mb-3">
                Beauty and wellness expert with over 10 years of experience in skincare research and product development. Passionate about helping people achieve healthy, glowing skin through evidence-based advice.
              </p>
              <div className="flex gap-3">
                <button className="text-blue-600 hover:text-blue-800 font-medium">Follow</button>
                <button className="text-gray-600 hover:text-gray-800 font-medium">View Profile</button>
              </div>
            </div>
          </div>
        </div> */}

        {/* <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
          
      
          <div className="mb-8">
            <textarea
              placeholder="Share your thoughts..."
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Post Comment
              </button>
            </div>
          </div>

          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                J
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">Jane Smith</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <p className="text-gray-700">
                  This is such a helpful article! I've been struggling with dry skin and these tips are exactly what I needed. Thank you for sharing your expertise.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">Mike Johnson</span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <p className="text-gray-700">
                  Great review! I've been using this product for a month now and can confirm it works as described. Highly recommend it.
                </p>
              </div>
            </div>
          </div>
        </section> */}
      </article>
    </div>
  );
};