import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, AlertTriangle, Filter } from "lucide-react";

// Đặt option tĩnh cho dropdown
const skinTypeOptions = [
  "oily",
  "dry",
  "combination",
  "sensitive",
  "normal",
  "all",
];
const categoryOptions = [
  "Pharmaceuticals",
  "Skincare",
  "Haircare",
  "Makeup",
  "Fragrances",
  "Natural Products",
];

export function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [stockFilter, setStockFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    size: "",
    brand: "",
    skinType: "",
    benefits: [""],
    subcategory: "",
    instructions: "",
    lowStockThreshold: 50,
    images: [{ url: "", alt: "", isPrimary: true }],
    manufacturingDate: "",
    expiryDate: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:10000/api/staff/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const productList = Array.isArray(data.products) ? data.products : data;
      const transformedProducts = productList.map((product) => {
        // Get primary image URL or first image URL or empty string
        let imageUrl = "";
        if (Array.isArray(product.images) && product.images.length > 0) {
          const primary = product.images.find((img: any) => img.isPrimary);
          imageUrl = primary?.url || product.images[0].url || "";
        }
        return {
          ...product,
          imageUrl,
          stock: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold || 50,
        };
      });
      setProducts(transformedProducts);
      const uniqueCategories = Array.from(
        new Set(transformedProducts.map((p) => String(p.category)))
      ).filter(Boolean) as string[];
      setCategories(uniqueCategories);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // FILTER
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesStock =
      !stockFilter ||
      (stockFilter === "low" && product.stock <= product.lowStockThreshold) ||
      (stockFilter === "normal" && product.stock > product.lowStockThreshold);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  // Reset page về 1 khi filter/search thay đổi
  useEffect(() => { setPage(1); }, [searchQuery, selectedCategory, stockFilter, products]);

  // HANDLERS CRUD
  const handleDelete = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:10000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Product Deleted", description: name });
      await fetchProducts();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const isValidProduct = () => {
    const {
      name,
      category,
      price,
      stockQuantity,
      benefits,
      skinType,
      description,
      size,
      brand,
      subcategory,
      instructions,
      manufacturingDate,
      expiryDate,
    } = formData;
    if (
      !name ||
      !category ||
      !benefits ||
      !skinType ||
      !description ||
      !size ||
      !brand ||
      !subcategory ||
      !instructions ||
      !manufacturingDate ||
      !expiryDate
    ) {
      toast({
        title: "Validation Error",
        description: "Manufacturing date and expiry date are required",
        variant: "destructive",
      });
      return false;
    }
    if (Number(price) <= 0 || Number(stockQuantity) < 0) return false;
    return true;
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    if (url) {
      const fullUrl = url.startsWith("http") ? url : `http://localhost:10000/${url}`;
      setImagePreview(fullUrl);
    } else {
      setImagePreview("");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      size: "",
      brand: "",
      skinType: "",
      benefits: [""],
      subcategory: "",
      instructions: "",
      lowStockThreshold: 50,
      images: [{ url: "", alt: "", isPrimary: true }],
      manufacturingDate: "",
      expiryDate: "",
    });
    setEditingProduct(null);
    setImagePreview("");
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    // Đảm bảo manufacturingDate và expiryDate là yyyy-MM-dd để Input type='date' nhận đúng
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      // Nếu đã đúng định dạng yyyy-MM-dd thì trả về luôn
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      // Nếu là ISO string thì cắt lấy phần ngày
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
      return "";
    };
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category,
      size: product.size,
      brand: product.brand,
      skinType: product.skinType,
      benefits: Array.isArray(product.benefits) ? product.benefits : product.benefits ? [product.benefits] : [""],
      subcategory: product.subcategory || "",
      instructions: product.instructions || "",
      lowStockThreshold: product.lowStockThreshold || 50,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [{ url: "", alt: "", isPrimary: true }],
      manufacturingDate: formatDate(product.manufacturingDate || ""),
      expiryDate: formatDate(product.expiryDate || ""),
    });
    // Show preview of primary or first image
    let preview = "";
    if (Array.isArray(product.images) && product.images.length > 0) {
      const primary = product.images.find((img: any) => img.isPrimary);
      preview = primary?.url || product.images[0].url || "";
    }
    setImagePreview(preview ? (preview.startsWith("http") ? preview : `http://localhost:10000/${preview}`) : "");
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    if (!isValidProduct()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and ensure values are valid.",
        variant: "destructive",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const submitData = { 
        ...formData, 
        price: Number(formData.price), 
        stockQuantity: Number(formData.stockQuantity),
        lowStockThreshold: Number(formData.lowStockThreshold)
      };
      // Ensure only one isPrimary
      if (Array.isArray(submitData.images)) {
        let foundPrimary = false;
        submitData.images = submitData.images.map((img, idx) => {
          if (img.isPrimary && !foundPrimary) {
            foundPrimary = true;
            return { ...img, isPrimary: true };
          }
          return { ...img, isPrimary: false };
        });
        if (!foundPrimary && submitData.images.length > 0) {
          submitData.images[0].isPrimary = true;
        }
      }
      if (editingProduct) {
        // Update
        const res = await fetch(`http://localhost:10000/api/products/${editingProduct._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        });
        if (!res.ok) throw new Error("Failed");
        toast({ title: "Product Updated", description: formData.name });
      } else {
        // Create
        const res = await fetch(`http://localhost:10000/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        });
        if (!res.ok) throw new Error("Failed");
        toast({ title: "Product Created", description: formData.name });
      }
      setShowForm(false);
      resetForm();
      await fetchProducts();
    } catch {
      toast({
        title: "Error",
        description: editingProduct ? "Failed to update product" : "Failed to create product",
        variant: "destructive",
      });
    }
  };

  // Khi thay đổi images trong form, cập nhật preview ảnh chính
  useEffect(() => {
    if (showForm) {
      const primary = formData.images.find((img: any) => img.isPrimary && img.url && img.url.trim() !== "");
      const first = formData.images.find((img: any) => img.url && img.url.trim() !== "");
      const preview = primary?.url || first?.url || "";
      setImagePreview(preview ? (preview.startsWith("http") ? preview : `http://localhost:10000/${preview}`) : "");
    }
    // eslint-disable-next-line
  }, [formData.images, showForm]);

  // UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-[#1F3368]">Inventory Management</h2>
          <p className="text-[#1F3368]/80">Manage your pharmacy inventory</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#1F3368] hover:bg-[#152347] text-white flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-[#1F3368] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1F3368]" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-[#1F3368] rounded-lg focus:ring-2 focus:ring-[#1F3368] focus:border-[#1F3368]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1F3368]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-[#1F3368] rounded-lg focus:ring-2 focus:ring-[#1F3368] focus:border-[#1F3368]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-[#1F3368] rounded-lg focus:ring-2 focus:ring-[#1F3368] focus:border-[#1F3368]"
          >
            <option value="">All Stock Levels</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedProducts.map((product) => {
          const isLowStock = product.stock <= product.lowStockThreshold;
          return (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border border-[#1F3368] overflow-hidden hover:shadow-md transition-shadow"
            >
              {product.imageUrl && product.imageUrl.trim() !== "" ? (
                <img
                  src={product.imageUrl.startsWith("http") ? product.imageUrl : `http://localhost:10000/${product.imageUrl}`}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-[#1F3368] truncate">{product.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-1 text-[#1F3368] hover:text-white hover:bg-[#1F3368] rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setProductToDelete(product);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-1 text-red-600 hover:text-white hover:bg-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[#1F3368]/80 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1F3368]/70">Price:</span>
                    <span className="font-semibold text-[#1F3368]">${product.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1F3368]/70">Stock:</span>
                    <div className="flex items-center space-x-2">
                      {isLowStock && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      <span className={`font-semibold ${isLowStock ? 'text-yellow-600' : 'text-[#1F3368]'}`}>{product.stock} units</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1F3368]/70">Skin Type:</span>
                    <span className="bg-[#1F3368]/10 text-[#1F3368] px-2 py-1 rounded-full text-xs">{product.skinType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1F3368]/70">Category:</span>
                    <span className="bg-[#1F3368]/10 text-[#1F3368] px-2 py-1 rounded-full text-xs">{product.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1F3368]/70">MFG:</span>
                    <span className="text-xs text-[#1F3368]">{product.manufacturingDate ? new Date(product.manufacturingDate).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#1F3368]/70">EXP:</span>
                    <span className="text-xs text-[#1F3368]">{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "-"}</span>
                  </div>
                </div>
                {isLowStock && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800 font-medium">Low Stock Alert</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Stock is below threshold of {product.lowStockThreshold} units
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredProducts.length > PAGE_SIZE && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: Math.ceil(filteredProducts.length / PAGE_SIZE) }).map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(Math.ceil(filteredProducts.length / PAGE_SIZE), p + 1))}
            disabled={page === Math.ceil(filteredProducts.length / PAGE_SIZE)}
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[#1F3368]/40 text-lg mb-4">No products found</div>
          <p className="text-[#1F3368]/60">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <DialogHeader>
              <DialogTitle className="text-[#1F3368]">
                {editingProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
              <DialogDescription className="text-[#1F3368]/70">
                Fill in product info
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleFormSubmit();
              }}
              className="grid gap-4 py-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Product Name *</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-[#1F3368] rounded-lg focus:ring-2 focus:ring-[#1F3368] focus:border-[#1F3368]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Benefits *</label>
                {formData.benefits.map((b: string, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={b}
                      placeholder={`Benefit ${idx + 1}`}
                      onChange={e => {
                        const updated = [...formData.benefits];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, benefits: updated });
                      }}
                      required
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updated = formData.benefits.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, benefits: updated.length ? updated : [""] });
                      }}
                      disabled={formData.benefits.length === 1}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ""] })}
                >
                  + Add Benefit
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Skin Type *</label>
                <select
                  name="skinType"
                  value={formData.skinType}
                  onChange={e => setFormData({ ...formData, skinType: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#1F3368] rounded-lg focus:ring-2 focus:ring-[#1F3368] focus:border-[#1F3368]"
                >
                  <option value="">Select skin type</option>
                  {skinTypeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Size *</label>
                <Input
                  name="size"
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Category *</label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Brand *</label>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Subcategory *</label>
                <Input
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Instructions *</label>
                <Input
                  name="instructions"
                  value={formData.instructions}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Images *</label>
                {formData.images.map((img: any, idx: number) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <Input
                      value={img.url}
                      placeholder="Image URL"
                      onChange={e => {
                        const updated = [...formData.images];
                        updated[idx].url = e.target.value;
                        setFormData({ ...formData, images: updated });
                      }}
                      required
                    />
                    <Input
                      value={img.alt}
                      placeholder="Alt text"
                      onChange={e => {
                        const updated = [...formData.images];
                        updated[idx].alt = e.target.value;
                        setFormData({ ...formData, images: updated });
                      }}
                    />
                    <input
                      type="radio"
                      checked={!!img.isPrimary}
                      onChange={() => {
                        const updated = formData.images.map((im: any, i: number) => ({ ...im, isPrimary: i === idx }));
                        setFormData({ ...formData, images: updated });
                      }}
                      title="Set as primary"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updated = formData.images.filter((_: any, i: number) => i !== idx);
                        setFormData({ ...formData, images: updated.length ? updated : [{ url: "", alt: "", isPrimary: true }] });
                      }}
                      disabled={formData.images.length === 1}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setFormData({ ...formData, images: [...formData.images, { url: "", alt: "", isPrimary: false }] })}
                >
                  + Add Image
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Manufacturing Date *</label>
                <Input
                  type="date"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={e => setFormData({ ...formData, manufacturingDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Expiry Date *</label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#1F3368]">Price ($) *</label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#1F3368]">Stock Quantity *</label>
                  <Input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })}
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Low Stock Threshold *</label>
                <Input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#1F3368]">Image Preview</label>
                {imagePreview && (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden mt-2">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                      onError={() => {
                        setImagePreview("");
                        toast({
                          title: "Error",
                          description: "Failed to load image. Please check the URL.",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-[#1F3368] text-white py-2 px-4 rounded-lg hover:bg-[#152347] font-medium"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white font-medium"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1F3368]">
              Confirm Delete Product
            </DialogTitle>
            <DialogDescription className="text-[#1F3368]/70">
              Are you sure you want to delete <b>{productToDelete?.name}</b>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!productToDelete) return;
                await handleDelete(productToDelete._id, productToDelete.name);
                setDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Inventory;
