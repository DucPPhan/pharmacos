import React, { useState, useCallback } from "react";
import { Upload, Camera, Loader2 } from "lucide-react";
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

interface AIImageSearchProps {
  onSearchComplete?: (results: ProductMatch[]) => void;
}

interface ProductMatch {
  id: string;
  name: string;
  image: string;
  price: number;
  confidence: number;
}

const AIImageSearch = ({ onSearchComplete = () => {} }: AIImageSearchProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProductMatch[]>([]);

  // Mock product matches for demonstration
  const mockResults: ProductMatch[] = [
    {
      id: "1",
      name: "Vitamin C Serum",
      image:
        "https://images.unsplash.com/photo-1620916566886-f294b0d1fc08?w=400&q=80",
      price: 24.99,
      confidence: 98,
    },
    {
      id: "2",
      name: "Hyaluronic Acid Moisturizer",
      image:
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80",
      price: 19.99,
      confidence: 85,
    },
    {
      id: "3",
      name: "Retinol Night Cream",
      image:
        "https://images.unsplash.com/photo-1631730359585-5e7ac5a68fb3?w=400&q=80",
      price: 32.5,
      confidence: 72,
    },
  ];

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

  const processImage = () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate AI processing with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setResults(mockResults);
            onSearchComplete(mockResults);
            setIsProcessing(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const resetSearch = () => {
    setFile(null);
    setPreview(null);
    setResults([]);
    setProgress(0);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          AI Product Recognition
        </CardTitle>
        <CardDescription>
          Upload a photo of a product to find it in our store
        </CardDescription>
      </CardHeader>
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
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500 text-center mt-2">
                  Our AI is analyzing your image to find matching products
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Matching Products</h3>
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
                        <h4 className="font-medium truncate">{product.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Button onClick={processImage} className="w-full">
                Start Recognition
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {(preview || results.length > 0) && (
          <Button variant="outline" onClick={resetSearch}>
            Try Another Image
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIImageSearch;
