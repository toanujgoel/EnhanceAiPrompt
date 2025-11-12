# n8n Blog Integration Guide

This document explains how to integrate your n8n workflow with the EnhanceAiPrompt blog system.

## Overview

The blog system now supports both static posts (defined in `data/blogPosts.ts`) and dynamic posts (created via n8n webhooks). Dynamic posts are stored in a JSON file and displayed alongside static posts.

## API Endpoint

**URL:** `https://enhanceaiprompt.com/blog-api.php`
**Method:** POST
**Content-Type:** application/json

## n8n Webhook Configuration

### 1. Add HTTP Request Node in n8n

In your n8n workflow, add an **HTTP Request** node with the following configuration:

- **Method:** POST
- **URL:** `https://enhanceaiprompt.com/blog-api.php`
- **Headers:**
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

### 2. Request Body Format

Send a JSON payload with the following structure:

```json
{
  "title": "Your Blog Post Title",
  "category": "AI Tools",
  "excerpt": "A brief description of your blog post (max 200 characters recommended)",
  "content": "The full content of your blog post. This can include HTML formatting if needed.",
  "imageUrl": "https://example.com/your-image.jpg",
  "author": {
    "name": "Author Name",
    "imageUrl": "https://example.com/author-photo.jpg"
  }
}
```

### 3. Required Fields

- `title` (string, required)
- `category` (string, required)
- `excerpt` (string, required)
- `content` (string, required)

### 4. Optional Fields

- `imageUrl` (string, URL) - If not provided, defaults to a generic AI image
- `author.name` (string) - If not provided, defaults to "AI Writer"
- `author.imageUrl` (string, URL) - If not provided, defaults to a generic avatar

### 5. Response Format

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "post": {
    "id": 1001,
    "title": "Your Blog Post Title",
    "category": "AI Tools",
    "excerpt": "A brief description...",
    "content": "Full content...",
    "imageUrl": "https://example.com/image.jpg",
    "date": "Nov 15, 2024",
    "author": {
      "name": "Author Name",
      "imageUrl": "https://example.com/author.jpg"
    },
    "published": true,
    "createdAt": "2024-11-15T10:30:00Z",
    "source": "n8n-automation"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing or empty required field: title"
}
```

## Suggested Categories

Use one of these categories for better organization:

- AI Prompts
- Future Tech
- Content Strategy
- Visual AI
- Audio AI
- Conversational AI
- AI Tools
- Machine Learning
- Automation
- Productivity

## n8n Workflow Example

Here's a basic n8n workflow structure:

1. **Trigger Node** (Webhook, Schedule, or Manual)
2. **AI Content Generation** (OpenAI, Claude, etc.)
3. **Data Processing** (Function node to format the content)
4. **HTTP Request** (POST to blog API)
5. **Response Handler** (Optional: log success/failure)

### Sample Function Node Code (JavaScript)

```javascript
// Assuming you have content from an AI service
const aiContent = $node["AI Content Generator"].json;

return {
  json: {
    title: aiContent.title,
    category: "AI Tools",
    excerpt: aiContent.excerpt || aiContent.content.substring(0, 150) + "...",
    content: aiContent.content,
    imageUrl: aiContent.imageUrl || "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",  
    author: {
      name: "AI Content Bot",
      imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
    }
  }
};
```

## Testing the Integration

1. Use the provided `blog-test.html` file to test the API locally
2. Deploy the PHP files to your hosting environment
3. Test with a simple POST request:

```bash
curl -X POST https://enhanceaiprompt.com/blog-api.php \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post from n8n",
    "category": "AI Tools",
    "excerpt": "This is a test post created via the API",
    "content": "This is the full content of the test post created through the n8n integration.",
    "author": {
      "name": "Test Author"
    }
  }'
```

## File Structure

```
/
├── blog-api.php          # Main API endpoint
├── blog-test.html        # Testing interface
├── data/
│   ├── blogPosts.ts      # Static blog posts
│   └── dynamic-blog-posts.json  # Dynamic posts (auto-created)
└── components/
    └── Blog.tsx          # Updated blog component
```

## Features

- **Automatic ID Generation:** Dynamic posts start from ID 1000 to avoid conflicts
- **Data Validation:** All required fields are validated before saving
- **XSS Protection:** Input is sanitized to prevent security issues
- **Fallback Images:** Default images are used if none provided
- **Latest Badge:** Dynamic posts show a "Latest" badge to distinguish them
- **Sorting:** Posts are sorted by date (newest first)
- **Error Handling:** Graceful degradation if API is unavailable

## Limitations

- Maximum 50 dynamic posts are stored (oldest are automatically removed)
- Content is stored in JSON format (not a database)
- No built-in authentication (implement if needed for security)
- File permissions must be set correctly on the server (755 for directories, 644 for files)

## Deployment Notes

When deploying to your hosting provider:

1. Upload `blog-api.php` to your public_html directory
2. Ensure the `data/` directory is writable (755 permissions)
3. The `dynamic-blog-posts.json` file will be created automatically
4. Test the API endpoint before configuring n8n

## Security Considerations

- The API currently allows any POST request (no authentication)
- Consider adding API key authentication for production use
- Input validation is implemented to prevent basic XSS attacks
- Content is stored in JSON files, not a database

For additional security, consider adding authentication headers in your n8n workflow and validating them in the PHP script.