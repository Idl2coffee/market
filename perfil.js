import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* ── Sesión activa ── */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await cargarPerfil(user.uid);
  } else {
    window.location.href = "./login.html";
  }
});

/* ── Cargar perfil ── */
async function cargarPerfil(uid) {
  const snap = await getDoc(doc(db, "perfiles", uid));
  if (!snap.exists()) return;
  const d = snap.data();

  document.getElementById("nombre-texto").textContent = d.nombre || "Nombre de usuario";
  document.getElementById("nombre-tag").textContent   = d.tag    || "Categoría";
  document.getElementById("desc-texto").textContent   = d.desc   || "Mi información general";

  if (d.foto) {
    document.getElementById("profile-picture").style.backgroundImage = `url(${d.foto})`;
  }
  if (d.url) {
    document.getElementById("url-display").value = d.url;
  }
  if (d.links?.length) {
    cargarLinksEnFormulario(d.links);
    generarCards(d.links);
  }
}

/* ── Guardar perfil ── */
window.guardar = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const nombre = document.getElementById("nombre-input").value.trim();
  const tag    = document.getElementById("nombre-etiqueta").value.trim();
  const desc   = document.getElementById("desc-input").value.trim();
  const url    = document.getElementById("url-input").value.trim();

  const links = [];
  document.querySelectorAll(".link-row").forEach(fila => {
    const inputs = fila.querySelectorAll("input");
    const n = inputs[0].value.trim();
    const u = inputs[1].value.trim();
    if (n && u) links.push({ nombre: n, url: u });
  });

  await setDoc(doc(db, "perfiles", user.uid), { nombre, tag, desc, url, links }, { merge: true });

  document.getElementById("nombre-texto").textContent = nombre;
  document.getElementById("nombre-tag").textContent   = tag;
  document.getElementById("desc-texto").textContent   = desc;
  if (url) document.getElementById("url-display").value = url;

  cancelar();
  generarCards(links);
};

/* ── Foto comprimida → Firestore ── */
window.upload = () => {
  const input = document.querySelector(".file-uploader");
  if (!input.files.length) return;

  const user = auth.currentUser;
  if (!user) return;

  const file = input.files[0];
  if (!file.type.includes("image")) return alert("Solo imágenes.");

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200; canvas.height = 200;
      const ctx = canvas.getContext("2d");
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width  - size) / 2;
      const offsetY = (img.height - size) / 2;
      ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 200, 200);
      const compressed = canvas.toDataURL("image/jpeg", 0.7);

      document.getElementById("profile-picture").style.backgroundImage = `url(${compressed})`;
      await setDoc(doc(db, "perfiles", user.uid), { foto: compressed }, { merge: true });
    };
  };
};

/* ── Vista / Edición ── */
window.mostrarEdicion = () => {
  document.getElementById("nombre-input").value    = document.getElementById("nombre-texto").textContent;
  document.getElementById("nombre-etiqueta").value = document.getElementById("nombre-tag").textContent;
  document.getElementById("desc-input").value      = document.getElementById("desc-texto").textContent;
  const urlActual = document.getElementById("url-display").value;
  document.getElementById("url-input").value = urlActual !== "Agrega tu link en Editar..." ? urlActual : "";

  document.getElementById("profile-picture").style.display = "none";
  document.getElementById("vista").style.display           = "none";
  document.getElementById("copy-section").style.display    = "none";
  document.getElementById("cards-section").style.display   = "none";
  document.getElementById("edicion").style.display         = "block";
};

window.cancelar = () => {
  document.getElementById("profile-picture").style.display = "block";
  document.getElementById("vista").style.display           = "block";
  document.getElementById("copy-section").style.display    = "flex";
  document.getElementById("cards-section").style.display   = "grid";
  document.getElementById("edicion").style.display         = "none";
};

window.agregarLink = () => {
  const div = document.createElement("div");
  div.className = "link-row";
  div.innerHTML = `
    <input type="text" placeholder="Nombre">
    <input type="url"  placeholder="https://...">
    <button class="btn-remove" type="button" onclick="removeLink(this)">✕</button>`;
  document.getElementById("links-container").appendChild(div);
};

window.removeLink = (b) => b.parentElement.remove();

window.copiarLink = () => {
  const url = document.getElementById("url-display").value;
  if (!url || url === "Agrega tu link en Editar...") return;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById("copy-btn");
    btn.textContent = "Copiado!"; btn.classList.add("copiado");
    setTimeout(() => { btn.textContent = "Copiar"; btn.classList.remove("copiado"); }, 2000);
  });
};

/* ── Helpers ── */
function cargarLinksEnFormulario(links) {
  const container = document.getElementById("links-container");
  container.innerHTML = "";
  links.forEach(link => {
    const div = document.createElement("div");
    div.className = "link-row";
    div.innerHTML = `
      <input type="text" value="${link.nombre}">
      <input type="url"  value="${link.url}">
      <button class="btn-remove" type="button" onclick="removeLink(this)">✕</button>`;
    container.appendChild(div);
  });
}

/* ── Cards ── */
window.generarCards = async (links) => {
  const section = document.getElementById("cards-section");
  section.innerHTML = "";
  for (const link of links) {
    const skId = "sk-" + Math.random().toString(36).slice(2);
    const sk = document.createElement("div");
    sk.className = "card-skeleton"; sk.id = skId;
    section.appendChild(sk);
    fetchPreview(link, skId);
  }
};

async function fetchPreview(link, skeletonId) {
  const skeleton = document.getElementById(skeletonId);
  const screenshotUrl = `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(link.url)}?w=640&h=400`;
  let titulo = link.nombre, desc = "", hostname = link.url;
  try { hostname = new URL(link.url).hostname; } catch(e) {}
  try {
    const res  = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(link.url)}`);
    const data = await res.json();
    const meta = data.data || {};
    if (meta.title)       titulo = meta.title;
    if (meta.description) desc   = meta.description;
  } catch(e) {}

  const card = document.createElement("a");
  card.href = link.url; card.target = "_blank";
  card.className = "card text-bg-dark";
  card.innerHTML = `
    <img src="${screenshotUrl}" class="card-img" alt="${titulo}">
    <div class="card-img-overlay">
      <h5 class="card-title">${titulo}</h5>
      ${desc ? `<p class="card-text">${desc}</p>` : ""}
      <p class="card-text"><small>${hostname}</small></p>
    </div>`;
  skeleton.replaceWith(card);

  document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("[onclick='mostrarEdicion()']")
    ?.addEventListener("click", mostrarEdicion);

  document.getElementById("copy-btn")
    ?.addEventListener("click", copiarLink);

  document.querySelector("[onclick='agregarLink()']")
    ?.addEventListener("click", agregarLink);

  document.querySelector("[onclick='guardar()']")
    ?.addEventListener("click", guardar);

  document.querySelector("[onclick='cancelar()']")
    ?.addEventListener("click", cancelar);
});
}