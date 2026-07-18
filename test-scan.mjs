const sites = ["google.com", "github.com", "vercel.com", "cloudflare.com", "openai.com", "webscope.app"];

async function testScanner() {
  for (const site of sites) {
    try {
      console.log(`\n=== Testing ${site} ===`);
      const res = await fetch("http://localhost:3001/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: site }),
      });
      const data = await res.json();
      if (data.error) {
        console.log(`ERROR: ${data.error}`);
      } else {
        console.log(`Domain: ${data.domain}`);
        console.log(`Title: ${data.title || "N/A"}`);
        console.log(`Server: ${data.webServer || "N/A"}`);
        console.log(`SSL valid: ${data.ssl?.valid}`);
        console.log(`Technologies: ${data.technologies?.join(", ") || "none"}`);
        console.log(`DNS A: ${data.dns?.A?.join(", ") || "N/A"}`);
        console.log(`Colors: ${data.colors?.length || 0}, Fonts: ${data.fonts?.google?.length || 0}`);
      }
    } catch (e) {
      console.log(`REQUEST FAILED: ${e.message}`);
    }
  }
}

testScanner();