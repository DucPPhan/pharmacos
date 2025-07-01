import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bell,
  Settings,
  Upload,
  Users as UsersIcon,
  LogOut,
  Plus,
  Edit,
  Trash2,
  FileText,
  Tag as TagIcon,
  FolderOpen,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Users from "./Users";
import Overview from "./Overview";

interface BlogPost {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  status: 'published' | 'draft';
  category: { name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  postCount: number;
}

interface Tag {
  id: string;
  name: string;
  count: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'categories' | 'tags' | 'users'>('overview');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [tagsList, setTagsList] = useState<Tag[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    thumbnail: "",
    category: "",
    tags: "",
    isVisible: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState("");
  const [editBlog, setEditBlog] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Filtered posts
  const filteredPosts = Array.isArray(posts) ? posts.filter((post: any) => {
    // Lọc theo tiêu đề
    if (searchTitle && !post.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    // Lọc theo visibility
    if (filterVisibility === "published" && !post.isVisible) return false;
    if (filterVisibility === "draft" && post.isVisible) return false;
    // Lọc theo ngày
    if (filterDateFrom && new Date(post.createdAt) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(post.createdAt) > new Date(filterDateTo)) return false;
    return true;
  }) : [];

  // Stats theo filteredPosts
  const stats = {
    totalPosts: filteredPosts.length,
    publishedPosts: filteredPosts.filter((p: any) => p.isVisible).length,
    draftPosts: filteredPosts.filter((p: any) => !p.isVisible).length,
    totalCategories: new Set(filteredPosts.map((p: any) => typeof p.category === 'object' ? p.category.name : p.category)).size,
    totalTags: new Set(filteredPosts.flatMap((p: any) => p.tags || [])).size,
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  const handleDeleteCategory = (id: string) => {
    setCategoriesList(categoriesList.filter(category => category.id !== id));
  };

  const handleDeleteTag = (id: string) => {
    setTagsList(tagsList.filter(tag => tag.id !== id));
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa blog này?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:10000/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Xóa blog thất bại");
      setPosts(prev => Array.isArray(prev) ? prev.filter((b: any) => b._id !== id && b.id !== id) : prev);
    } catch (err: any) {
      alert(err.message || "Có lỗi khi xóa blog");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!newPost.thumbnail || !/^https?:\/\//.test(newPost.thumbnail)) {
      setError("Vui lòng nhập URL ảnh thumbnail hợp lệ!");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:10000/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          thumbnail: newPost.thumbnail,
          category: newPost.category,
          tags: newPost.tags.split(",").map(t => t.trim()).filter(Boolean),
          isVisible: newPost.isVisible,
        }),
      });
      if (!res.ok) throw new Error("Tạo bài viết thất bại");
      const data = await res.json();
      const blog = data._id ? data : data.blog ? data.blog : data.data;
      if (!blog || typeof blog !== 'object' || !blog._id) {
        setError("Dữ liệu trả về không hợp lệ!");
        setLoading(false);
        return;
      }
      setPosts(prev => {
        const newPost = {
          ...blog,
          status: blog.isVisible ? "published" : "draft",
          category: { name: blog.category, color: "bg-blue-500" }
        };
        if (Array.isArray(prev)) {
          return [newPost, ...prev];
        }
        return [newPost];
      });
      setShowNewPostModal(false);
      setNewPost({ title: "", content: "", thumbnail: "", category: "", tags: "", isVisible: true });
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (blog: any) => {
    setEditBlog({ ...blog, tags: blog.tags?.join(", ") });
    setShowEditModal(true);
    setEditError("");
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    if (!editBlog.thumbnail || !/^https?:\/\//.test(editBlog.thumbnail)) {
      setEditError("Vui lòng nhập URL ảnh thumbnail hợp lệ!");
      setEditLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:10000/api/blogs/${editBlog._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: editBlog.title,
          content: editBlog.content,
          thumbnail: editBlog.thumbnail,
          category: editBlog.category,
          tags: editBlog.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
          isVisible: editBlog.isVisible,
        }),
      });
      if (!res.ok) throw new Error("Cập nhật blog thất bại");
      const data = await res.json();
      const updatedBlog = data._id ? data : data.blog ? data.blog : data.data;
      if (!updatedBlog || typeof updatedBlog !== 'object' || !updatedBlog._id) {
        setEditError("Dữ liệu trả về không hợp lệ!");
        setEditLoading(false);
        return;
      }
      setPosts(prev => Array.isArray(prev) ? prev.map((b: any) => (b._id === updatedBlog._id || b.id === updatedBlog._id) ? { ...updatedBlog, status: updatedBlog.isVisible ? "published" : "draft", category: { name: updatedBlog.category, color: "bg-blue-500" } } : b) : prev);
      setShowEditModal(false);
      setEditBlog(null);
    } catch (err: any) {
      setEditError(err.message || "Có lỗi xảy ra");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:10000/api/blogs/${id}/toggle-visibility`, {
        method: "PATCH",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Đổi trạng thái visibility thất bại");
      const data = await res.json();
      const updatedBlog = data._id ? data : data.blog ? data.blog : data.data;
      setPosts(prev => Array.isArray(prev) ? prev.map((b: any) => (b._id === updatedBlog._id || b.id === updatedBlog._id) ? { ...b, isVisible: updatedBlog.isVisible, status: updatedBlog.isVisible ? "published" : "draft" } : b) : prev);
    } catch (err: any) {
      alert(err.message || "Có lỗi khi đổi trạng thái visibility");
    }
  };

  // Fetch blogs from API when tab is posts
  useEffect(() => {
    if (activeTab === "posts") {
      const fetchPosts = async () => {
        setLoadingPosts(true);
        setPostsError("");
        try {
          const token = localStorage.getItem('token');
          const res = await fetch("http://localhost:10000/api/blogs/admin?page=1&limit=20", {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            },
          });
          if (!res.ok) throw new Error("Không lấy được danh sách blog");
          const data = await res.json();
          let blogs = [];
          if (Array.isArray(data)) {
            blogs = data;
          } else if (Array.isArray(data.blogs)) {
            blogs = data.blogs;
          } else if (data.data && Array.isArray(data.data.blogs)) {
            blogs = data.data.blogs;
          }
          setPosts(blogs);
        } catch (err: any) {
          setPostsError(err.message || "Có lỗi khi tải blogs");
        } finally {
          setLoadingPosts(false);
        }
      };
      fetchPosts();
    }
  }, [activeTab]);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.publishedPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tags</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTags}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {posts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                  <p className="text-sm text-gray-500">{post.author} • {post.publishedAt}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                post.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {post.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.publishedPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BarChart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.draftPosts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FolderOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tags</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTags}</p>
            </div>
          </div>
        </div>
      </div>
      {/* End stats cards */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Posts Management</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          onClick={() => setShowNewPostModal(true)}
        >
          <Plus size={20} />
          New Post
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="min-w-[180px]">
          <label className="block text-xs font-semibold mb-1 text-gray-600">Tìm theo tiêu đề</label>
          <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nhập tiêu đề..." value={searchTitle} onChange={e => setSearchTitle(e.target.value)} />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs font-semibold mb-1 text-gray-600">Trạng thái</label>
          <select className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary" value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs font-semibold mb-1 text-gray-600">Từ ngày</label>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs font-semibold mb-1 text-gray-600">Đến ngày</label>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
        </div>
      </div>
      {loadingPosts ? (
        <div>Đang tải blogs...</div>
      ) : postsError ? (
        <div className="text-red-500">{postsError}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Post</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Visible</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                  filteredPosts.map((post: any) => (
                    <tr key={post._id || post.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-20 w-20 rounded-lg object-cover border border-gray-200 shadow-sm"
                            src={post.thumbnail || post.imageUrl || "https://via.placeholder.com/40"}
                            alt=""
                          />
                          <div className="ml-4">
                            <div className="text-base font-semibold text-gray-900 line-clamp-1">{post.title}</div>
                            <div className="text-xs text-gray-500">{post.author?.name || post.author?.username || post.authorName || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {post.category?.name || post.category || ""}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${post.isVisible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{post.isVisible ? 'Published' : 'Draft'}</span>
                          <button
                            className="text-gray-400 hover:text-primary transition"
                            title="Đổi trạng thái hiển thị"
                            onClick={() => handleToggleVisibility(post._id || post.id)}
                            style={{ lineHeight: 1 }}
                          >
                            {post.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-500 hover:text-blue-700 transition-colors duration-200" onClick={() => handleEditClick(post)} title="Chỉnh sửa">
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBlog(post._id || post.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            title="Xóa bài viết"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center py-4">Không có bài viết nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Modal tạo bài viết mới */}
      {showNewPostModal && (
        <div className="fixed inset-0 left-0 right-0 w-screen h-screen z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg mx-auto relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowNewPostModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Tạo bài viết mới</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input type="text" className="w-full border rounded px-3 py-2" required value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nội dung</label>
                <textarea className="w-full border rounded px-3 py-2" required rows={4} value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail (URL)</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={newPost.thumbnail} onChange={e => setNewPost({ ...newPost, thumbnail: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input type="text" className="w-full border rounded px-3 py-2" required value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (phân cách bằng dấu phẩy)</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isVisible" checked={newPost.isVisible} onChange={e => setNewPost({ ...newPost, isVisible: e.target.checked })} />
                <label htmlFor="isVisible" className="text-sm">Công khai</label>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={loading}>
                  {loading ? "Đang tạo..." : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && editBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowEditModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Chỉnh sửa bài viết</h3>
            <form onSubmit={handleUpdateBlog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input type="text" className="w-full border rounded px-3 py-2" required value={editBlog.title} onChange={e => setEditBlog({ ...editBlog, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nội dung</label>
                <textarea className="w-full border rounded px-3 py-2" required rows={4} value={editBlog.content} onChange={e => setEditBlog({ ...editBlog, content: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail (URL)</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editBlog.thumbnail} onChange={e => setEditBlog({ ...editBlog, thumbnail: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input type="text" className="w-full border rounded px-3 py-2" required value={editBlog.category} onChange={e => setEditBlog({ ...editBlog, category: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (phân cách bằng dấu phẩy)</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editBlog.tags} onChange={e => setEditBlog({ ...editBlog, tags: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editIsVisible" checked={editBlog.isVisible} onChange={e => setEditBlog({ ...editBlog, isVisible: e.target.checked })} />
                <label htmlFor="editIsVisible" className="text-sm">Công khai</label>
              </div>
              {editError && <div className="text-red-500 text-sm">{editError}</div>}
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" disabled={editLoading}>
                  {editLoading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <Plus size={20} />
          New Category
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesList.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
            <p className="text-gray-600 mb-3">{category.description}</p>
            <div className="text-sm text-gray-500">
              {category.postCount} posts
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTags = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tags Management</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <Plus size={20} />
          New Tag
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-3">
          {tagsList.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors duration-200"
            >
              <TagIcon size={16} className="text-gray-600" />
              <span className="text-gray-800">{tag.name}</span>
              <span className="text-xs text-gray-500">({tag.count})</span>
              <div className="flex space-x-1 ml-2">
                <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200">
                  <Edit size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteTag(tag.id)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 flex flex-col">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2">
            P
          </div>
          <h1 className="text-xl font-bold">PharmaCos Admin</h1>
        </div>
        <nav className="space-y-1">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("users")}
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "posts" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("posts")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Posts
          </Button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <Overview />}
          {activeTab === "users" && <Users />}
          {activeTab === "posts" && renderPosts()}
          {activeTab === "categories" && renderCategories()}
          {activeTab === "tags" && renderTags()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
