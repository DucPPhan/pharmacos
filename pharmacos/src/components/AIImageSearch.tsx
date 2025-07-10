import React, { useState, useCallback } from "react";
import { Upload, Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface AIImageSearchProps {
  onSearchComplete?: (results: ProductMatch[]) => void;
  isPopup?: boolean; // Optional flag to adjust styling when used in popup
  onClose?: () => void; // Add onClose prop
}

interface ProductMatch {
  id: string;
  name: string;
  image: string;
  price: number;
  confidence: number;
}

const AIImageSearch = ({
  onSearchComplete = () => {},
  isPopup = false,
  onClose,
}: AIImageSearchProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProductMatch[]>([]);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) setIsDragging(true);
    },
    [isDragging]
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        handleFile(file);
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = () => {
    // In a real implementation, this would access the device camera
    // For now, we'll just show a file picker as a fallback
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) =>
      handleFileInput(e as unknown as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setGeminiAnalysis(null);
    setResults([]);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Prepare form data
      const formData = new FormData();
      formData.append("image", file);

      // Use fetch to POST the image
      const response = await fetch(
        "http://localhost:10000/api/ai/search-by-image",
        {
          method: "POST",
          body: formData,
        }
      );

      // Clear interval and complete progress
      clearInterval(progressInterval);
      setProgress(100);

      // Small delay to show 100% completion
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsProcessing(false);

      if (!response.ok) {
        throw new Error("Failed to search by image");
      }
      const data = await response.json();

      setGeminiAnalysis(data.geminiAnalysis || null);
      if (data.success) {
        // Map API products to ProductMatch type
        const mappedResults = (data.matchedProducts || []).map((p: any) => ({
          id: p._id,
          name: p.name,
          image:
            p.images && p.images.length > 0
              ? p.images.find((img: any) => img.isPrimary)?.url ||
                p.images[0].url
              : "",
          price: p.price,
          confidence: p.matchScore || 0,
        }));
        setResults(mappedResults);
        onSearchComplete(mappedResults);
      } else {
        setError(data.message || "No matching products found.");
        setResults([]);
      }
    } catch (err: any) {
      setProgress(100); // Complete progress even on error
      setIsProcessing(false);
      setError(err.message || "An error occurred during search.");
    }
  };

  const resetSearch = () => {
    setFile(null);
    setPreview(null);
    setResults([]);
    setProgress(0);
    setError(null);
    setGeminiAnalysis(null);
  };

  // Handle view product and close popup if needed
  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
    if (onClose) onClose();
  };

  return (
    <div className="flex items-center justify-center">
      <Card
        className={`w-full ${
          isPopup ? "border-0 shadow-none" : "max-w-3xl mx-auto"
        } bg-white`}
        style={{
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader className="relative flex-shrink-0">
          <CardTitle className="text-2xl font-bold">
            AI Product Recognition
          </CardTitle>
          <CardDescription>
            Upload a photo of a product to find it in our store
          </CardDescription>
        </CardHeader>

        <ScrollArea className="flex-grow overflow-auto">
          <CardContent>
            {!preview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      Drag and drop your image here
                    </p>
                    <p className="text-sm text-gray-500">
                      or use one of the options below
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <Button
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Browse Files
                    </Button>
                    <Button variant="outline" onClick={handleCameraCapture}>
                      <Camera className="mr-2 h-4 w-4" /> Take Photo
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={preview}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                </div>

                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Analyzing image...
                      </span>
                      <span className="text-sm font-medium">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Our AI is analyzing your image to find matching products
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {geminiAnalysis && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2 text-sm text-blue-900 whitespace-pre-line">
                        <strong>AI Analysis:</strong> <br />
                        {geminiAnalysis}
                      </div>
                    )}
                    {results.length > 0 ? (
                      <>
                        <h3 className="text-lg font-medium">
                          Matching Products
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.map((product) => (
                            <div
                              key={product.id}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="aspect-square relative">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {product.confidence}% match
                                </div>
                              </div>
                              <div className="p-3">
                                <h4 className="font-medium truncate">
                                  {product.name}
                                </h4>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="font-bold">
                                    {product.price.toLocaleString("vi-VN")}đ
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleViewProduct(product.id)
                                    }
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : error ? (
                      <div className="text-red-500 text-center my-4">
                        {error}
                      </div>
                    ) : (
                      <Button onClick={processImage} className="w-full">
                        Start Recognition
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </ScrollArea>

        <CardFooter className="flex justify-between flex-shrink-0 border-t pt-4">
          {(preview || results.length > 0) && (
            <Button variant="outline" onClick={resetSearch}>
              Try Another Image
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIImageSearch;
