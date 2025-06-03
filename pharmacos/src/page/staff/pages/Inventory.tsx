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
    benefits: "",
    skinType: "",
    size: "",
    category: "",
    brand: "",
    imageUrl: "",
    price: 0,
    stockQuantity: 0,
  });

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
    "Personal Care"
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
    "Colgate"
  ];

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:10000/api/products", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      const productList = Array.isArray(data.products) ? data.products : data;
      setProducts(productList);
      const uniqueCategories = Array.from(
        new Set(productList.map((p) => String(p.category)))
      ).filter(Boolean) as string[];
      setCategories(uniqueCategories);
      const uniqueBrands = Array.from(
        new Set(productList.map((p) => String(p.brand)))
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
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:10000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    } = newProduct;
    if (
      !name ||
      !category ||
      !benefits ||
      !skinType ||
      !description ||
      !size ||
      !brand
    )
      return false;
    if (price <= 0 || stockQuantity < 0) return false;
    return true;
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      benefits: "",
      skinType: "",
      size: "",
      category: "",
      brand: "",
      imageUrl: "",
      price: 0,
      stockQuantity: 0,
    });
    setCurrentProduct(null);
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
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:10000/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
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
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:10000/api/products/${currentProduct._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
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
        <h2 className="text-3xl font-bold tracking-tight">
          Inventory Management
        </h2>
        <Button
          onClick={() => {
            setCurrentProduct(null);
            resetForm();
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Category">
                    {selectedCategory === "all" ? "All Categories" : selectedCategory}
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
              <Select
                value={selectedBrand}
                onValueChange={setSelectedBrand}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Brand">
                    {selectedBrand === "all" ? "All Brands" : selectedBrand}
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

          {isLoading ? (
            <div className="text-center py-6">Loading...</div>
          ) : (
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Skin Type</TableHead>
                    <TableHead>Benefits</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              style={{
                                width: 48,
                                height: 48,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          ) : (
                            <span className="text-gray-400">No image</span>
                          )}
                        </TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell>{p.brand}</TableCell>
                        <TableCell>{p.size}</TableCell>
                        <TableCell>{p.skinType}</TableCell>
                        <TableCell>{p.benefits}</TableCell>
                        <TableCell>{p.stockQuantity}</TableCell>
                        <TableCell>${p.price}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCurrentProduct(p);
                                setNewProduct({
                                  name: p.name,
                                  description: p.description,
                                  benefits: p.benefits,
                                  skinType: p.skinType,
                                  size: p.size,
                                  category: p.category,
                                  brand: p.brand,
                                  imageUrl: p.imageUrl,
                                  price: p.price,
                                  stockQuantity: p.stockQuantity,
                                });
                                setShowAddDialog(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(p._id, p.name)}
                            >
                              Delete
                            </Button>
                          </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>Fill in product info</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <Select
              onValueChange={(value) =>
                setNewProduct({ ...newProduct, benefits: value })
              }
              value={newProduct.benefits || ""}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Benefit">
                  {newProduct.benefits || "Select Benefit"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {benefitsOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Input
              placeholder="Size"
              value={newProduct.size || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, size: e.target.value })
              }
            />
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
            <Input
              placeholder="Image URL"
              value={newProduct.imageUrl || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, imageUrl: e.target.value })
              }
            />
            <Input
              placeholder="Price"
              type="number"
              min={0}
              step={0.01}
              value={newProduct.price === 0 ? "" : newProduct.price}
              className="appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Stock Quantity"
              type="number"
              min={0}
              value={newProduct.stockQuantity === 0 ? "" : newProduct.stockQuantity}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stockQuantity: Number(e.target.value),
                })
              }
            />
            <Input
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={currentProduct ? updateProduct : createProduct}>
              {currentProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Inventory;