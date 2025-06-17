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
import { Search, Plus } from "lucide-react";

export function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    benefits: [""],
    skinType: "",
    size: "",
    category: "",
    brand: "",
    imageUrl: "",
    price: 0,
    stockQuantity: 0,
    subcategory: "",
    instructions: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const benefitsOptions = [
    "Brightens skin tone and reduces hyperpigmentation",
    "Fights free radical damage from UV rays and pollution",
    "Stimulates collagen production for firmer skin",
    "Improves skin texture and reduces fine lines",
  ];

  const skinTypeOptions = [
    "oily",
    "dry",
    "combination",
    "sensitive",
    "normal",
    "all",
  ];

  const categoryOptions = [
    "Skincare",
    "Pharmaceuticals",
    "Haircare",
    "Makeup",
    "Fragrances",
    "Personal Care",
  ];

  const brandOptions = [
    "The Ordinary",
    "CeraVe",
    "Advil",
    "La Roche-Posay",
    "Head & Shoulders",
    "TRESemmé",
    "MAC",
    "Maybelline",
    "Jo Malone",
    "Colgate",
  ];

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
        const imageUrl =
          product.images?.find((img: any) => img.isPrimary)?.url ||
          product.images?.[0]?.url ||
          "";

        return {
          ...product,
          imageUrl: imageUrl,
        };
      });
      setProducts(transformedProducts);
      const uniqueCategories = Array.from(
        new Set(transformedProducts.map((p) => String(p.category)))
      ).filter(Boolean) as string[];
      setCategories(uniqueCategories);
      const uniqueBrands = Array.from(
        new Set(transformedProducts.map((p) => String(p.brand)))
      ).filter(Boolean) as string[];
      setBrands(uniqueBrands);
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesBrand =
      selectedBrand === "all" || product.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

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
    } = newProduct;
    if (
      !name ||
      !category ||
      !benefits ||
      !skinType ||
      !description ||
      !size ||
      !brand ||
      !subcategory ||
      !instructions
    )
      return false;
    if (price <= 0 || stockQuantity < 0) return false;
    return true;
  };

  const handleImageUrlChange = (url: string) => {
    setNewProduct({ ...newProduct, imageUrl: url });
    // Update preview if URL is not empty
    if (url) {
      const fullUrl = url.startsWith("http")
        ? url
        : `http://localhost:10000/${url}`;
      setImagePreview(fullUrl);
    } else {
      setImagePreview("");
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      benefits: [""],
      skinType: "",
      size: "",
      category: "",
      brand: "",
      imageUrl: "",
      price: 0,
      stockQuantity: 0,
      subcategory: "",
      instructions: "",
    });
    setCurrentProduct(null);
    setImagePreview("");
  };

  const createProduct = async () => {
    if (!isValidProduct()) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and ensure values are valid.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:10000/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) throw new Error("Failed");

      toast({
        title: "Product Created",
        description: newProduct.name,
      });

      setShowAddDialog(false);
      resetForm();
      await fetchProducts();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async () => {
    if (!isValidProduct()) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and ensure values are valid.",
        variant: "destructive",
      });
      return;
    }

    if (!currentProduct) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:10000/api/products/${currentProduct._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newProduct),
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast({
        title: "Product Updated",
        description: newProduct.name,
      });

      setShowAddDialog(false);
      resetForm();
      await fetchProducts();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-[#1F3368]">
          Inventory Management
        </h2>
        <Button
          onClick={() => {
            setCurrentProduct(null);
            resetForm();
            setShowAddDialog(true);
          }}
          className="bg-[#1F3368] hover:bg-[#152347] text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#1F3368]">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#1F3368]" />
              <Input
                placeholder="Search products..."
                className="pl-8 border-[#1F3368] focus:ring-[#1F3368]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] border-[#1F3368] text-[#1F3368]">
                  <SelectValue placeholder="Select Category">
                    {selectedCategory === "all"
                      ? "All Categories"
                      : selectedCategory}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[#1F3368]">
                    All Categories
                  </SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-[#1F3368]"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-[180px] border-[#1F3368] text-[#1F3368]">
                  <SelectValue placeholder="Select Brand">
                    {selectedBrand === "all" ? "All Brands" : selectedBrand}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[#1F3368]">
                    All Brands
                  </SelectItem>
                  {brandOptions.map((brand) => (
                    <SelectItem
                      key={brand}
                      value={brand}
                      className="text-[#1F3368]"
                    >
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-6 text-[#1F3368]">Loading...</div>
          ) : (
            <div className="border rounded-md overflow-auto border-[#1F3368]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1F3368]/5">
                    <TableHead className="text-[#1F3368] font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Image
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Category
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Brand
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Size
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Skin Type
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Benefits
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Stock
                    </TableHead>
                    <TableHead className="text-[#1F3368] font-semibold">
                      Price
                    </TableHead>
                    <TableHead className="text-right text-[#1F3368] font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-6 text-[#1F3368]"
                      >
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => (
                      <TableRow key={p._id} className="hover:bg-[#1F3368]/5">
                        <TableCell className="text-[#1F3368]">
                          {p.name}
                        </TableCell>
                        <TableCell>
                          <div className="relative w-16 h-16">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null; // Prevent infinite loop
                                  target.src =
                                    "https://via.placeholder.com/64?text=Error";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          {p.category}
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          {p.brand}
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          {p.size}
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          {p.skinType}
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          {p.benefits.join(", ")}
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          {p.stockQuantity}
                        </TableCell>
                        <TableCell className="text-[#1F3368]">
                          ${p.price}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
                            onClick={() => {
                              setCurrentProduct(p);
                              const productImageUrl = p.imageUrl;
                              const fullImageUrl = productImageUrl?.startsWith(
                                "http"
                              )
                                ? productImageUrl
                                : productImageUrl
                                ? `http://localhost:10000/${productImageUrl}`
                                : "";
                              setImagePreview(fullImageUrl);
                              setNewProduct({
                                name: p.name,
                                description: p.description,
                                benefits: Array.isArray(p.benefits)
                                  ? p.benefits
                                  : p.benefits
                                  ? [p.benefits]
                                  : [""],
                                skinType: p.skinType,
                                size: p.size,
                                category: p.category,
                                brand: p.brand,
                                imageUrl: p.imageUrl || "",
                                price: p.price,
                                stockQuantity: p.stockQuantity,
                                subcategory: p.subcategory || "",
                                instructions: p.instructions || "",
                              });
                              setShowAddDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle className="text-[#1F3368]">
              {currentProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription className="text-[#1F3368]/70">
              Fill in product info
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="name"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Product Name:
              </label>
              <Input
                id="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="col-span-3 ml-0 border-[#1F3368] text-[#1F3368]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]">
                Benefits:
              </label>
              <div className="col-span-3 space-y-2">
                {newProduct.benefits.map((b, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={b}
                      placeholder={`Benefit ${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...newProduct.benefits];
                        updated[idx] = e.target.value;
                        setNewProduct({ ...newProduct, benefits: updated });
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updated = newProduct.benefits.filter(
                          (_, i) => i !== idx
                        );
                        setNewProduct({
                          ...newProduct,
                          benefits: updated.length ? updated : [""],
                        });
                      }}
                      disabled={newProduct.benefits.length === 1}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setNewProduct({
                      ...newProduct,
                      benefits: [...newProduct.benefits, ""],
                    })
                  }
                >
                  + Add Benefit
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="skinType"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Skin Type:
              </label>
              <div className="col-span-3">
                <Select
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, skinType: value })
                  }
                  value={newProduct.skinType || ""}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Skin Type">
                      {newProduct.skinType || "Select Skin Type"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {skinTypeOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="size"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Size:
              </label>
              <Input
                id="size"
                placeholder="Size"
                value={newProduct.size || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, size: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="category"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Category:
              </label>
              <div className="col-span-3">
                <Select
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, category: value })
                  }
                  value={newProduct.category || ""}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category">
                      {newProduct.category || "Select Category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="brand"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Brand:
              </label>
              <div className="col-span-3">
                <Select
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, brand: value })
                  }
                  value={newProduct.brand || ""}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand">
                      {newProduct.brand || "Select Brand"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label
                htmlFor="imageUrl"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368] pt-2"
              >
                Image URL:
              </label>
              <div className="col-span-3 space-y-4">
                <Input
                  id="imageUrl"
                  placeholder="Image URL"
                  value={newProduct.imageUrl || ""}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full"
                />
                {imagePreview ? (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                      onError={() => {
                        setImagePreview("");
                        toast({
                          title: "Error",
                          description:
                            "Failed to load image. Please check the URL.",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 border rounded-md flex items-center justify-center bg-gray-50 text-gray-400">
                    No image preview available
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="price"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Price:
              </label>
              <Input
                id="price"
                placeholder="Price"
                type="number"
                min={0}
                step={0.01}
                value={newProduct.price === 0 ? "" : newProduct.price}
                className="col-span-3"
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="stockQuantity"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Stock Quantity:
              </label>
              <Input
                id="stockQuantity"
                placeholder="Stock Quantity"
                type="number"
                min={0}
                value={
                  newProduct.stockQuantity === 0 ? "" : newProduct.stockQuantity
                }
                className="col-span-3"
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stockQuantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="subcategory"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Subcategory:
              </label>
              <Input
                id="subcategory"
                placeholder="Subcategory"
                value={newProduct.subcategory}
                className="col-span-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, subcategory: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="instructions"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Instructions:
              </label>
              <Input
                id="instructions"
                placeholder="Instructions"
                value={newProduct.instructions}
                className="col-span-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, instructions: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="description"
                className="text-left font-medium min-w-[120px] pr-2 text-[#1F3368]"
              >
                Description:
              </label>
              <Input
                id="description"
                placeholder="Description"
                value={newProduct.description}
                className="col-span-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={currentProduct ? updateProduct : createProduct}
              className="bg-[#1F3368] hover:bg-[#152347] text-white"
            >
              {currentProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#1F3368]">
              Xác nhận xóa sản phẩm
            </DialogTitle>
            <DialogDescription className="text-[#1F3368]/70">
              Bạn có chắc chắn muốn xóa sản phẩm <b>{productToDelete?.name}</b>{" "}
              không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-[#1F3368] text-[#1F3368] hover:bg-[#1F3368] hover:text-white"
            >
              Hủy
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
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Inventory;
