import TryCatch from "../utils/TryCatch.js";
import cloudinary from 'cloudinary'
import getDataUrl from "../utils/urlGenerator.js";
import {Pin} from "../models/pinModel.js"
export const createPin = TryCatch(async (req, res) => {
  const apiKey = "AIzaSyB7YUXwWDbNswogZqEcQSnyt09Qn-3z-L0"; // Use env in prod
  const { title, pin } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  if (!fileUrl.startsWith("data:")) return res.status(400).json({ error: "Invalid file format" });

  const cloud = await cloudinary.v2.uploader.upload(fileUrl, {
    folder: "pins",
  });

  const base64Data = file.buffer.toString("base64");

  // Parse tag response
  const parseTagsFromResponse = (rawText) => {
    let cleanText = rawText.replace(/```json\n?|\n?```/g, '').replace(/```\n?|\n?```/g, '');

    try {
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        console.log("Parsed as JSON array:", parsed);
        return parsed.filter(tag => typeof tag === 'string' && tag.trim().length > 0);
      }
    } catch (e) {
      console.log("Not valid JSON, trying string parsing");
    }

    let extractedTags = [];

    const hashtagPattern = /#[\w\d_]+/g;
    const hashtagMatches = cleanText.match(hashtagPattern);
    if (hashtagMatches && hashtagMatches.length > 0) {
      extractedTags = hashtagMatches;
      console.log("Extracted hashtags with #:", extractedTags);
    } else {
      const delimiters = /[,\n\r•\-\*\|;]/;
      const potentialTags = cleanText.split(delimiters)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => {
          tag = tag.replace(/^#+/, '').trim();
          tag = tag.replace(/^["']|["']$/g, '');
          tag = tag.replace(/[^\w\d]/g, '');
          return tag.length > 0 ? `#${tag.toLowerCase()}` : '';
        })
        .filter(tag => tag.length > 1);

      extractedTags = potentialTags;
      console.log("Extracted by splitting:", extractedTags);
    }

    if (extractedTags.length === 0) {
      const words = cleanText.split(/\s+/)
        .map(word => word.trim())
        .filter(word => word.length > 2 && !/^(and|or|the|a|an|in|on|at|to|for|of|with|by)$/i.test(word))
        .slice(0, 10)
        .map(word => `#${word.toLowerCase().replace(/[^\w\d]/g, '')}`);

      extractedTags = words;
      console.log("Extracted from words:", extractedTags);
    }

    const uniqueTags = [...new Set(extractedTags.filter(tag => tag && tag.length > 1))];
    console.log("Final unique tags:", uniqueTags);
    return uniqueTags.slice(0, 15);
  };

  // Gemini image-to-tags
  const generateTags = async (base64Image) => {
    const part = [
      {
        inlineData: {
          mimeType: file.mimetype,
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
All lowercase. No explanations. No duplicates.`
      }
    ];

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: part }] })
        }
      );

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return parseTagsFromResponse(rawText);

    } catch (error) {
      console.error("Tag generation failed:", error);
      return [];
    }
  };

  let tags = [];
  let geminiSuccess = false;
  try {
    tags = await generateTags(base64Data);
    geminiSuccess = tags && tags.length > 0;
  } catch (err) {
    console.error("Gemini tag generation failed:", err);
    tags = [];
    geminiSuccess = false;
  }

  // Save Pin
  await Pin.create({
    title,
    pin,
    image: {
      id: cloud.public_id,
      url: cloud.secure_url,
    },
    owner: req.user._id,
    tags,
  });

  res.json({ message: "Pin created successfully", tags, geminiSuccess });
});


export const getAllPins = TryCatch(async (req, res) => {
    const pins = await Pin.find().sort({createdAt: -1});

    res.json(pins);
})
export const getSinglepins = TryCatch(async (req, res) => {
    const pins = await Pin.findById(req.params.id).populate("owner", "-password");

    res.json(pins);
})

export const cmntonPin = TryCatch(async (req, res) => {
    const pin = await Pin.findById(req.params.id);

    if(!pin) return res.status(400).json({
        message : "No pin with this id"
    })

    pin.comments.push({
        user : req.user._id,
        name : req.user.name,
        comment : req.body.comment,
    });

    await pin.save();

    res.json({
        message : "Comment Added",
    })
});



export const deleteComment = TryCatch(async (req, res) => {
    const pin = await Pin.findById(req.params.id);

    if(!pin) return res.status(400).json({
        message : "No pin with this id"
    })

    if(!req.query.commentId) 
        return res.status(404).json({
        message : "Please give comment"
    });

    const commentIdx = pin.comments.findIndex(
        (item) => item._id.toString() === req.query.commentId.toString()
    );

    if(commentIdx == -1) 
        return res.status(404).json({
            message : "Comment not found",
    })

    const comment = pin.comments[commentIdx];

    if(comment.user.toString() == req.user._id.toString()) {
        pin.comments.splice(commentIdx, 1);

        await pin.save();

        return res.json({
            message : "Comment deleted",
        })
    }
    else {
        return res.status(403).json({
            message : "This comment doesn't belongs to you",
        })
    }
});

export const deletePin = TryCatch(async (req, res) => {
    const pin = await Pin.findById(req.params.id);

    if(!pin) return res.status(400).json({
        message : "No pin with this id"
    })


    if(pin.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message : "Unauthorized",
        })
    }

    await cloudinary.v2.uploader.destroy(pin.image.id);

    await pin.deleteOne();

    res.json({
        message : "Pin deleted",
    })

});

export const updatePin = TryCatch(async(req, res) => {
    const pin = await Pin.findById(req.params.id);

    if(!pin) return res.status(400).json({
        message : "No pin with this id"
    })

    if(pin.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            message : "Unauthorized",
        })
    }

    pin.title = req.body.title;
    pin.pin = req.body.pin;

    await pin.save();

    res.json({
        message : "Pin Updated",
    })

})
