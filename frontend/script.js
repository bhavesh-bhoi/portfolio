import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

document.documentElement.classList.add('js');

const navbar = document.querySelector('.navbar');
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.navbar .menu');

function closeMenu() {
  menu.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
}

menuToggle.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('active');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.innerHTML = `<i class="fas fa-${isOpen ? 'xmark' : 'bars'}" aria-hidden="true"></i>`;
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

function updateNavigation() {
  navbar.classList.toggle('sticky', window.scrollY > 30);
  document.querySelector('.scroll-up-btn').classList.toggle('show', window.scrollY > 500);
}

window.addEventListener('scroll', updateNavigation, { passive: true });
updateNavigation();

document.querySelector('.scroll-up-btn').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitButton = document.querySelector('.submit-btn');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  formMessage.className = 'form-message';
  formMessage.textContent = '';

  const formData = Object.fromEntries(new FormData(contactForm));

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();

    formMessage.className = `form-message ${response.ok ? 'success' : 'error'}`;
    formMessage.textContent = response.ok
      ? 'Message sent successfully. I will get back to you soon.'
      : (data.message || 'Message could not be sent. Please try again.');

    if (response.ok) contactForm.reset();
  } catch (error) {
    formMessage.className = 'form-message error';
    formMessage.textContent = 'Unable to send your message. Please check your connection.';
    console.error('Contact form error:', error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send message';
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('hero-canvas');

try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  scene.add(new THREE.AmbientLight(0xffffff, 1.45));
  const keyLight = new THREE.PointLight(0xd9ff43, 42, 18);
  keyLight.position.set(3.5, 3.5, 5);
  scene.add(keyLight);
  const warmLight = new THREE.PointLight(0xff7857, 26, 14);
  warmLight.position.set(-4, -2, 2);
  scene.add(warmLight);

  const sculpture = new THREE.Group();
  scene.add(sculpture);

  const knotGeometry = new THREE.TorusKnotGeometry(1.13, 0.37, 220, 28, 2, 5);
  const knotMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd9ff43,
    metalness: 0.68,
    roughness: 0.22,
    clearcoat: 0.85,
    clearcoatRoughness: 0.18
  });
  const knot = new THREE.Mesh(knotGeometry, knotMaterial);
  sculpture.add(knot);

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.92, 0.012, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0xf3eee3, transparent: true, opacity: 0.48 })
  );
  orbit.rotation.set(1.05, 0.28, -0.3);
  sculpture.add(orbit);

  const satellite = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.19, 1),
    new THREE.MeshStandardMaterial({ color: 0xff7857, metalness: 0.2, roughness: 0.24 })
  );
  satellite.position.set(1.72, 0.75, 0.2);
  sculpture.add(satellite);

  const starsGeometry = new THREE.BufferGeometry();
  const stars = new Float32Array(420 * 3);
  for (let index = 0; index < stars.length; index += 3) {
    stars[index] = (Math.random() - 0.5) * 15;
    stars[index + 1] = (Math.random() - 0.5) * 9;
    stars[index + 2] = (Math.random() - 0.5) * 5 - 1;
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  const starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({
    color: 0xe9ebd9,
    size: 0.018,
    transparent: true,
    opacity: 0.68
  }));
  scene.add(starField);

  const pointer = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  window.addEventListener('pointermove', (event) => {
    target.x = (event.clientX / window.innerWidth - 0.5) * 0.5;
    target.y = (event.clientY / window.innerHeight - 0.5) * 0.35;
  }, { passive: true });

  function resizeScene() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 600 ? 11.5 : 9.5;
    camera.updateProjectionMatrix();
    sculpture.position.x = width < 600 ? 0.65 : 2.15;
    sculpture.position.y = width < 600 ? -0.8 : -0.05;
    sculpture.scale.setScalar(width < 600 ? 0.72 : 1);
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', resizeScene, { passive: true });
  resizeScene();

  if (!reducedMotion) {
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const time = clock.getElapsedTime();
      pointer.lerp(target, 0.035);
      sculpture.rotation.y = time * 0.12 + pointer.x;
      sculpture.rotation.x = Math.sin(time * 0.22) * 0.13 + pointer.y;
      knot.rotation.z = time * 0.08;
      orbit.rotation.z = time * 0.09 - 0.3;
      satellite.position.y = 0.75 + Math.sin(time * 0.8) * 0.08;
      starField.rotation.y = time * 0.008;
      renderer.render(scene, camera);
    });
  }
} catch (error) {
  canvas.classList.add('scene-unavailable');
  console.error('3D scene could not be initialized:', error);
}

const sections = document.querySelectorAll('section:not(.home)');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
sections.forEach((section) => observer.observe(section));
