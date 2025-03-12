// Simple HTTP server for serving static files from the dist directory
const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    // Get the URL path
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Default to index.html for the root path
    if (path === "/" || path === "") {
      path = "/index.html";
    }
    
    // Serve the file from the dist directory
    const filePath = `./dist${path}`;
    
    try {
      const file = Bun.file(filePath);
      // Check if file exists
      const exists = await file.exists();
      if (!exists) {
        console.log(`File not found: ${filePath}`);
        return new Response("Not Found", { status: 404 });
      }
      
      return new Response(file);
    } catch (error) {
      console.error(`Error serving ${filePath}:`, error);
      return new Response("Server Error", { status: 500 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`); 