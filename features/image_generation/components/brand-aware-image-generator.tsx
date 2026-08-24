'use client';

import { useState } from 'react';
import { z } from 'zod';
import { BrandConfig, IMAGE_TYPES, ImageTypeConfig } from '@/features/image_generation/types';
import { ImageUpload } from '@/components/ui/image-upload';

interface BrandAwareImageGeneratorProps {
  businessId?: string;
  userId?: string;
  onImageGenerated?: (jobId: string) => void;
}

const BrandAwareImageGeneratorSchema = z.object({
  businessId: z.string().optional(),
  userId: z.string().optional(),
  prompt: z.string().min(1, "Prompt is required").max(3000, "Prompt must be less than 3000 characters"),
  brandId: z.string().optional(),
  colors: z.array(z.string()).optional(),
  imageType: z.enum(Object.keys(IMAGE_TYPES) as [string]).optional(),
  style: z.enum(["realistic", "artistic", "cinematic", "anime", "cartoon", "3d"]).optional(),
  quality: z.enum(["standard", "hd", "ultra"]).optional(),
  model: z.enum(["dall-e-3", "dall-e-2", "stable-diffusion", "midjourney", "openai", "google-nano"]).optional(),
});

export default function BrandAwareImageGenerator({ businessId, userId, onImageGenerated }: BrandAwareImageGeneratorProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('default');
  const [selectedColors, setSelectedColors] = useState<string[]>(['#3B82F6', '#2563EB']);
  const [selectedImageType, setSelectedImageType] = useState<string>('custom');
  const [selectedStyle, setSelectedStyle] = useState<string>('realistic');
  const [selectedQuality, setSelectedQuality] = useState<string>('hd');
  const [selectedModel, setSelectedModel] = useState<string>('dall-e-3');
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedJobId, setGeneratedJobId] = useState<string | null>(null);

  // Mock brands data
  const [brands] = useState<BrandConfig[]>([
    {
      id: 'default',
      name: 'Default Brand',
      colors: ['#3B82F6', '#2563EB', '#FFFFFF', '#000000'],
      style: 'professional'
    },
    {
      id: 'modern',
      name: 'Modern Brand',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
      style: 'minimal'
    },
    {
      id: 'elegant',
      name: 'Elegant Brand',
      colors: ['#8B5CF6', '#E8F5E8', '#F0F4F8', '#FFFFFF'],
      style: 'elegant'
    }
  ]);

  const handleGenerate = async () => {
    try {
      const requestData = BrandAwareImageGeneratorSchema.parse({
        businessId,
        userId,
        prompt,
        brandId: selectedBrand,
        colors: selectedColors,
        imageType: selectedImageType,
        style: selectedStyle,
        quality: selectedQuality,
        model: selectedModel,
        referenceImage: referenceImage || undefined
      });

      setIsGenerating(true);

      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedJobId(result.data.jobId);
        onImageGenerated?.(result.data.jobId);
      } else {
        alert(`Generation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const addColor = (color: string) => {
    if (!selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const removeColor = (index: number) => {
    const newColors = selectedColors.filter((_, i) => i !== index);
    setSelectedColors(newColors);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🎨 Brand-Aware Image Generator
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brand Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Select Brand</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${selectedBrand === brand.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{
                        background: `linear-gradient(135deg, ${brand.colors[0]}, ${brand.colors[1]})`
                      }}
                    />
                    <span className="text-sm font-medium">{brand.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Brand Colors</h3>
            <div className="flex flex-wrap gap-2">
              {selectedColors.map((color, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => removeColor(index)}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  >
                    <span className="sr-only">Remove {color}</span>
                  </button>
                  <div className="absolute -top-2 -right-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        const newColors = [...selectedColors];
                        newColors[index] = newColor;
                        setSelectedColors(newColors);
                      }}
                      className="w-6 h-6 rounded cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Color Palettes */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setSelectedColors(['#FF6B6B', '#4ECDC4', '#45B7D1'])}
                className="p-2 rounded border border-gray-300 hover:border-gray-400 text-sm"
              >
                🌆 Modern
              </button>
              <button
                onClick={() => setSelectedColors(['#8B5CF6', '#E8F5E8', '#F0F4F8'])}
                className="p-2 rounded border border-gray-300 hover:border-gray-400 text-sm"
              >
                ✨ Elegant
              </button>
            </div>
          </div>

          {/* Image Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Image Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(IMAGE_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => setSelectedImageType(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${selectedImageType === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.dimensions.width}x{type.dimensions.height} ({type.aspectRatio})
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Style and Quality Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Style & Quality</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="realistic">Realistic</option>
                  <option value="artistic">Artistic</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="anime">Anime</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="3d">3D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="hd">HD</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">5. AI Model</h3>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dall-e-3">DALL-E 3 (Best Quality)</option>
                <option value="dall-e-2">DALL-E 2 (Faster)</option>
                <option value="openai">OpenAI GPT-4 (Accurate Text)</option>
                <option value="google-nano">Google Gemini Nano (Fast)</option>
              </select>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Prompt</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.substring(0, 3000))}
              placeholder="Describe the image you want to generate..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 font-medium">{prompt.length}/3000 characters</span>
              {prompt.length > 2700 && (
                <span className="text-xs text-orange-500 font-semibold">Approaching limit</span>
              )}
            </div>
          </div>

          {/* Reference Image */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Reference Image (Optional)</h3>
            <ImageUpload
              onImageUploaded={setReferenceImage}
              currentImage={referenceImage}
              onImageRemove={() => setReferenceImage("")}
              folder="brand-references"
              businessId={businessId}
            />
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${isGenerating
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2'
                }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-t-blue-600 border-r-transparent"></div>
                  <span className="ml-2">Generating...</span>
                </div>
              ) : (
                '🎨 Generate Brand-Aware Image'
              )}
            </button>
          </div>

          {/* Result */}
          {generatedJobId && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-800">
                <h4 className="font-semibold mb-2">✅ Generation Started!</h4>
                <p className="text-sm">
                  Job ID: <code className="bg-green-100 px-2 py-1 rounded">{generatedJobId}</code>
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Your brand-aware image is being generated with the selected colors and style.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
