(function(){
  const sel = "[data-fiq-widget]";
  
  function mount(el) {
    if (el.dataset.mounted) return;
    el.dataset.mounted = "1";
    
    const username = el.getAttribute("data-username") || "";
    const sites = (el.getAttribute("data-sites") || "twitter,instagram,github").split(",");
    const endpoint = el.getAttribute("data-endpoint") || "/functions/v1/public/presence";
    
    const root = document.createElement("div");
    root.style.all = "initial";
    root.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    root.style.display = "block";
    root.style.border = "1px solid #e5e7eb";
    root.style.borderRadius = "12px";
    root.style.padding = "12px";
    root.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
    
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <strong style="font-size:14px;font-weight:600;color:#111827;">Username Presence</strong>
        <a href="https://footprintiq.app" target="_blank" rel="noopener" 
           style="font-size:12px;text-decoration:none;color:#6b7280;">
          Made with FootprintIQ
        </a>
      </div>
      <div style="font-size:13px;color:#374151;margin-bottom:8px;">
        ${username ? `Checking: <b>${username}</b>` : "Set data-username attribute"}
      </div>
      <div data-body style="font-size:13px;color:#111827">Loading…</div>
    `;
    
    el.appendChild(root);
    
    if (!username) {
      root.querySelector("[data-body]").textContent = "Missing username.";
      return;
    }
    
    fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, sites })
    })
      .then(r => r.json())
      .then(j => {
        const hits = j?.results || [];
        const body = root.querySelector("[data-body]");
        
        if (!hits.length) {
          body.textContent = "No presence detected on requested sites.";
          return;
        }
        
        const ul = document.createElement("ul");
        ul.style.margin = "0";
        ul.style.paddingLeft = "16px";
        ul.style.listStyle = "disc";
        
        hits.forEach(h => {
          const li = document.createElement("li");
          li.style.marginBottom = "4px";
          li.innerHTML = `<a href="${h.url}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:none;">${h.site}</a> — <span style="color:#6b7280;">${h.status}</span>`;
          ul.appendChild(li);
        });
        
        body.innerHTML = "";
        body.appendChild(ul);
      })
      .catch(() => {
        root.querySelector("[data-body]").textContent = "Error fetching results.";
      });
  }
  
  function scan() {
    document.querySelectorAll(sel).forEach(mount);
  }
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
})();
