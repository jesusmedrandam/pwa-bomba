self.addEventListener("install", (e) => {
    console.log("Service Worker instalado");
});

self.addEventListener("activate", (e) => {
    console.log("Service Worker activo");
});
