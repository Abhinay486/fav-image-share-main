import React, { useState } from "react";

const ImageCaptioner = () => {
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);

   // ⚠️ Don't expose this in production

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];
      await generateTags(base64Image);
    };

    reader.readAsDataURL(file);
  };

  const parseTagsFromResponse = (rawText) => {
    console.log("Raw response:", rawText);
    
    // Remove any markdown code blocks
    let cleanText = rawText.replace(/```json\n?|\n?```/g, '').replace(/```\n?|\n?```/g, '');
    
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        console.log("Parsed as JSON array:", parsed);
        return parsed.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
      }
    } catch (e) {
      console.log("Not valid JSON, trying string parsing");
    }
    
    // If JSON parsing fails, try different string parsing methods
    let extractedTags = [];
    
    // Method 1: Look for hashtags with # symbol
    const hashtagPattern = /#[\w\d_]+/g;
    const hashtagMatches = cleanText.match(hashtagPattern);
    if (hashtagMatches && hashtagMatches.length > 0) {
      extractedTags = hashtagMatches;
      console.log("Extracted hashtags with #:", extractedTags);
    } else {
      // Method 2: Split by common delimiters and add # prefix
      const delimiters = /[,\n\r•\-\*\|;]/;
      const potentialTags = cleanText.split(delimiters)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => {
          // Remove any existing # and clean up
          tag = tag.replace(/^#+/, '').trim();
          // Remove quotes
          tag = tag.replace(/^["']|["']$/g, '');
          // Only keep alphanumeric and underscores
          tag = tag.replace(/[^\w\d]/g, '');
          return tag.length > 0 ? `#${tag.toLowerCase()}` : '';
        })
        .filter(tag => tag.length > 1);
      
      extractedTags = potentialTags;
      console.log("Extracted by splitting:", extractedTags);
    }
    
    // Method 3: If still no tags, try space-separated words
    if (extractedTags.length === 0) {
      const words = cleanText.split(/\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 2 && !/^(and|or|the|a|an|in|on|at|to|for|of|with|by)$/i.test(word))
        .slice(0, 10) // Limit to first 10 words
        .map(word => `#${word.toLowerCase().replace(/[^\w\d]/g, '')}`);
      
      extractedTags = words;
      console.log("Extracted from words:", extractedTags);
    }
    
    // Remove duplicates and empty tags
    const uniqueTags = [...new Set(extractedTags.filter(tag => tag && tag.length > 1))];
    console.log("Final unique tags:", uniqueTags);
    
    return uniqueTags.slice(0, 15); // Limit to 15 tags max
  };

  const generateTags = async (base64Image) => {
    const part = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: `You are an expert image tagging assistant. Analyze the uploaded image and return a list of 10–15 most relevant and specific hashtags.

Include:
- Visible objects (e.g., #car, #tree, #building)
- Scene or theme (e.g., #sunset, #citylife)
- Weather or lighting (e.g., #cloudy, #goldenhour)
- Dominant colors (e.g., #red, #blue, #orange)

Respond ONLY with hashtags in this exact JSON array format: ["#hashtag1", "#hashtag2", "#hashtag3", ...]
All lowercase. No explanations. No duplicates.`,
      },
    ];

    setLoading(true);
    let parsedTags = [];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: part }],
          }),
        }
      );

      const data = await response.json();
      console.log("Full API response:", data);
      
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log("Raw text from API:", rawText);
      
      if (rawText) {
        parsedTags = parseTagsFromResponse(rawText);
      }
      
      // Fallback tags if parsing fails
      if (parsedTags.length === 0) {
        parsedTags = ["#image", "#photo", "#picture"];
      }

      setTags(parsedTags);
    } catch (err) {
      console.error("❌ Error generating tags:", err);
      setTags(["#error", "#failed"]);
    } finally {
      setLoading(false);
    }
  };

  const copyAllTags = () => {
    const tagString = tags.join(' ');
    navigator.clipboard.writeText(tagString).then(() => {
      alert('Tags copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy tags');
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">📸 AI Hashtag Generator</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
      />

      {image && (
        <img
          src={image}
          alt="Preview"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}

      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-blue-600 font-medium">Generating tags...</p>
        </div>
      )}

      {!loading && tags.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Suggested Hashtags ({tags.length})</h3>
            <button
              onClick={copyAllTags}
              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              Copy All
            </button>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => navigator.clipboard.writeText(tag)}
                title="Click to copy"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCaptioner;  