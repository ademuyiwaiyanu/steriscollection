const ADMIN_KEY = 'adminGalleryImages';
const defaultGallery = [
  './src/img/t%20shirt8.jpeg',
  './src/img/t%20shirt9.jpeg',
  './src/img/t%20shirt10.jpeg',
  './src/img/basic%20top.jpg',
  './src/img/gown3.jpg',
  './src/img/up%20and%20down.jpg',
  './src/img/luxury%20shirt.jpeg',
];

const galleryContainer = document.getElementById('galleryContainer');
const saveButton = document.getElementById('saveGallery');
const resetButton = document.getElementById('resetGallery');
const logoutButton = document.getElementById('logoutButton');
const adminMessage = document.getElementById('adminMessage');
const subscriberCount = document.getElementById('subscriberCount');
const subscriberList = document.getElementById('subscriberList');

const SUBSCRIBERS_KEY = 'newsletterSubscribers';

const getSubscribers = () => {
  const stored = localStorage.getItem(SUBSCRIBERS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const renderSubscribers = () => {
  const subscribers = getSubscribers();
  if (!subscriberCount || !subscriberList) return;

  subscriberCount.textContent = `${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`;
  if (!subscribers.length) {
    subscriberList.innerHTML = '<p class="text-sm text-slate-500">No subscribers yet.</p>';
    return;
  }

  subscriberList.innerHTML = subscribers
    .map((email) => `<div class="rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-300">${email}</div>`)
    .join('');
};

const getStoredGallery = () => {
  const stored = localStorage.getItem(ADMIN_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const isAdmin = () => localStorage.getItem('loggedInUser') === 'admin';

const loadGallery = () => {
  const storedImages = getStoredGallery();
  const images = storedImages.length ? storedImages : defaultGallery;

  galleryContainer.innerHTML = images
    .map(
      (src, index) => `
      <div class="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5 shadow-soft">
        <div class="overflow-hidden rounded-[1.5rem] bg-slate-900">
          <img id="preview-${index}" src="${src}" alt="Gallery image ${index + 1}" class="h-44 w-full object-cover" />
        </div>
        <div class="mt-4 space-y-3">
          <p class="text-xs uppercase tracking-[0.35em] text-pink-200">Slot ${index + 1}</p>
          <input data-index="${index}" type="file" accept="image/*" class="w-full rounded-3xl border border-slate-700 bg-slate-950/90 p-3 text-sm text-slate-100" />
        </div>
      </div>
    `
    )
    .join('');

  galleryContainer.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener('change', async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const files = target.files;
      if (!files?.length) return;
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const index = Number(target.dataset.index);
          const preview = document.getElementById(`preview-${index}`);
          if (preview instanceof HTMLImageElement) {
            preview.src = result;
          }
        }
      };
      reader.readAsDataURL(file);
    });
  });
};

const saveGallery = () => {
  const previews = Array.from(galleryContainer.querySelectorAll('img[id^="preview-"]'));
  const images = previews.map((img) => img.src);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(images));
  adminMessage.textContent = 'Gallery images saved successfully.';
};

const resetGallery = () => {
  localStorage.removeItem(ADMIN_KEY);
  loadGallery();
  adminMessage.textContent = 'Gallery reset to default images.';
};

const forceLogin = () => {
  if (!isAdmin()) {
    window.location.href = './login.html';
  }
};

logoutButton?.addEventListener('click', () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = './login.html';
});

saveButton?.addEventListener('click', saveGallery);
resetButton?.addEventListener('click', resetGallery);

window.addEventListener('DOMContentLoaded', () => {
  forceLogin();
  loadGallery();
  renderSubscribers();
});
