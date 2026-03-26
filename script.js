
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const planetNameHeading = document.getElementById('planet-name');
const fadeWrapper = document.getElementById('fade-wrapper');

let currentImg = new Image();
currentImg.src = 'earth.jpg';

let planetColor = '#00eaff';
let hasRings = false;
let isGalaxyMode = false;

let width, height;
let radius, targetRadius;
let offset = 0;
let scrollY = 0;
let mouseX = 0;
let mouseY = 0;

let stars = [];
let galaxyStars = [];
let galaxyRotation = 0;
let meteors = [];

function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    radius = Math.min(width, height) * 0.35;
    targetRadius = radius;
    stars = [];
    for (let i = 0; i < 580; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            s: Math.random() * 1.5,
            p: Math.random() * 0.5
        });
    }
    createMilkyWay();
}

function createMilkyWay() {
    galaxyStars = [];
    const arms = 6;
    const count = 9000;
    for (let i = 0; i < count; i++) {
        let dist = Math.pow(Math.random(), 1.6) * (Math.min(width, height) * 0.7);
        let angle = (dist * 0.007) + (i % arms) * ((Math.PI * 2) / arms);
        let scatter = (dist * 0.15) + 10;
        let x = Math.cos(angle) * dist + (Math.random() - 0.5) * scatter * 4;
        let y = (Math.sin(angle) * dist + (Math.random() - 0.5) * scatter * 2) * 0.4;
        let hue = dist < 120 ? 30 + Math.random() * 25 : 190 + Math.random() * 50;
        let lum = Math.random() * 40 + 50;
        let alpha = Math.random() * 0.5 + 0.2;
        galaxyStars.push({
            x: x, y: y, s: Math.random() * 2.2,
            color: `hsla(${hue}, 80%, ${lum}%, ${alpha})`,
            isNebula: Math.random() > 0.96
        });
    }
}

function hideAllCards() {
    const sections = document.querySelectorAll('.info-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active', 'visible');
    });
}

window.toggleGalaxy = function() {
    isGalaxyMode = !isGalaxyMode; 
    window.scrollTo({top: 0, behavior: 'smooth'});
    targetRadius = isGalaxyMode ? 0 : Math.min(width, height) * 0.35;
    hideAllCards(); 
    planetNameHeading.style.opacity = 0;
    setTimeout(() => {
        if(isGalaxyMode) {
            planetNameHeading.innerText = "MILKY WAY";
        } else {
            planetNameHeading.innerText = "EARTH";
            const sec = document.getElementById(`info-earth`);
            if(sec) { sec.style.display = 'flex'; sec.classList.add('active', 'visible'); }
        }
        planetNameHeading.style.opacity = 1;
    }, 400);
};

window.changePlanet = function(file, name, color, rings = false) {
    isGalaxyMode = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    planetNameHeading.style.opacity = 0;
    hideAllCards();
    setTimeout(() => {
        currentImg.src = file + ".jpg";
        planetNameHeading.innerText = name;
        planetColor = color;
        hasRings = rings;
        targetRadius = Math.min(width, height) * 0.35;
        planetNameHeading.style.opacity = 1;
        const activeSection = document.getElementById(`info-${file}`);
        if (activeSection) {
            activeSection.style.display = 'flex';
            setTimeout(() => activeSection.classList.add('visible'), 50);
        }
    }, 400);
}

// ИСПРАВЛЕННАЯ ФУНКЦИЯ КОЛЕЦ
function drawRealisticRings(cx, cy, r, front = true) {
    const tilt = Math.PI / 10;
    // Отрисовка колец (убрал лишнее свечение-линзу из середины)
    for (let i = 0; i < 25; i++) {
        let ringRadius = r * (1.6 + i * 0.03);
        let alpha = front ? (0.06 + i * 0.015) : (0.04 + i * 0.01);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(230,200,140,${alpha})`;
        ctx.lineWidth = 2;
        if(front){
            ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.35, tilt, 0, Math.PI);
        } else {
            ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.35, tilt, Math.PI, 0);
        }
        ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = "#020105";
    ctx.fillRect(0, 0, width, height);

    const bgCx = width / 2;
    const bgCy = height / 2;
    const targetShiftX = width * 0.28; 
    const scrollShiftX = Math.min(scrollY * 0.6, targetShiftX); 
    const planetCx = (width / 2) + scrollShiftX;
    const planetCy = (height / 2) - (scrollY * 0.3);

    stars.forEach(s => {
        let px = s.x - mouseX * s.p * 2;
        let py = s.y - mouseY * s.p * 2;
        ctx.globalAlpha = 0.5 + s.p;
        ctx.fillStyle = "white";
        ctx.fillRect(px, py, s.s, s.s);
    });
    ctx.globalAlpha = 1;

    if(isGalaxyMode){
        ctx.save();
        ctx.translate(bgCx, bgCy);
        ctx.rotate(galaxyRotation);
        galaxyRotation += 0.0004;
        ctx.globalCompositeOperation = 'lighter';
        galaxyStars.forEach(s => {
            if(s.isNebula) {
                const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.s * 12);
                g.addColorStop(0, s.color.replace(/[\d.]+\)$/g, '0.04)'));
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.s * 12, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = s.color;
                ctx.fillRect(s.x, s.y, s.s, s.s);
            }
        });
        const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 160);
        coreGlow.addColorStop(0, 'rgba(255, 210, 150, 0.5)');
        coreGlow.addColorStop(0.6, 'rgba(255, 100, 50, 0.05)');
        coreGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.ellipse(0, 0, 220, 90, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
    }

    radius += (targetRadius - radius) * 0.1;
    if(radius > 1){
        // 1. Рисуем ЗАДНЮЮ часть колец
        if(hasRings) drawRealisticRings(planetCx, planetCy, radius, false);

        // 2. Свечение вокруг планеты (атмосфера)
        const glow = ctx.createRadialGradient(planetCx, planetCy, radius, planetCx, planetCy, radius * 1.15);
        glow.addColorStop(0, planetColor + '55');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(planetCx, planetCy, radius * 1.15, 0, Math.PI * 2);
        ctx.fill();

        // 3. Сама планета
        ctx.save();
        ctx.beginPath();
        ctx.arc(planetCx, planetCy, radius, 0, Math.PI * 2);
        ctx.clip();
        if(currentImg.complete && currentImg.naturalWidth !== 0){
            let imgW = (radius * 4) + 2;
            let imgH = radius * 2;
            offset = (offset + 0.4) % (radius * 4);
            ctx.drawImage(currentImg, planetCx - offset - imgW + 1, planetCy - radius, imgW, imgH);
            ctx.drawImage(currentImg, planetCx - offset, planetCy - radius, imgW, imgH);
            ctx.drawImage(currentImg, planetCx - offset + imgW - 1, planetCy - radius, imgW, imgH);
        }
        
        const shadow = ctx.createRadialGradient(planetCx - radius * 0.4, planetCy - radius * 0.4, radius * 0.2, planetCx, planetCy, radius);
        shadow.addColorStop(0, 'transparent');
        shadow.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = shadow;
        ctx.beginPath();
        ctx.arc(planetCx, planetCy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Рисуем ПЕРЕДНЮЮ часть колец
        if(hasRings) drawRealisticRings(planetCx, planetCy, radius, true);
    }
    requestAnimationFrame(draw);
}

window.addEventListener('wheel', (e) => {
    const overlay = document.getElementById('faq-overlay');
    const galleryOpen = document.getElementById('space-gallery').style.display === 'block';
    const faqOpen = getComputedStyle(overlay).display === 'flex';
    if (faqOpen || galleryOpen) return;

    const nearScrollbar = e.clientX > window.innerWidth - 20;
    if (nearScrollbar) return;

    if(!isGalaxyMode){
        e.preventDefault();
        if(e.deltaY < 0) targetRadius *= 1.1; else targetRadius /= 1.1;
        targetRadius = Math.max(20, Math.min(targetRadius, width * 0.45));
    }
}, {passive:false});
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    if(fadeWrapper) fadeWrapper.style.transform = `translateY(-${scrollY * 0.8}px)`;
});

window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - width / 2) * 0.05;
    mouseY = (e.clientY - height / 2) * 0.05;
});

window.addEventListener('resize', init);
init();
draw();
const API_KEY = "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";

document.addEventListener('DOMContentLoaded', () => {
    const aiBtn = document.getElementById('ai-toggle-btn');
    const chatWin = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-query');
    const inputField = document.getElementById('user-query');
    const messagesCont = document.getElementById('chat-messages');

    // Управление окном чата
    aiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatWin.classList.toggle('active');
        if (chatWin.classList.contains('active')) inputField.focus();
    });

    closeBtn.addEventListener('click', () => chatWin.classList.remove('active'));

    window.addEventListener('click', (e) => {
        if (chatWin.classList.contains('active') &&
            !aiBtn.contains(e.target) &&
            !chatWin.contains(e.target)) {
            chatWin.classList.remove('active');
        }
    });

    // Добавление сообщений
    function addMsg(text, isUser, id = null) {
        const div = document.createElement('div');
        div.className = isUser ? 'user-msg' : 'bot-msg';
        if (id) div.id = id;
        div.innerText = text;
        messagesCont.appendChild(div);
        messagesCont.scrollTop = messagesCont.scrollHeight;
    }

    // Обработка прикреплённого фото
    let attachedImage = null;

    document.getElementById('image-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            attachedImage = {
                base64: ev.target.result.split(',')[1],
                type: file.type
            };
            addMsg("📎 Фото прикреплено", true);
        };
        reader.readAsDataURL(file);
    });

    // Запрос к Groq
       // Запрос к Groq
    async function fetchAI(userText, image = null) {
        const url = "https://api.groq.com/openai/v1/chat/completions";
        let userContent;

        if (image) {
            userContent = [
                {
                    type: "image_url",
                    image_url: { url: `data:${image.type};base64,${image.base64}` }
                },
                {
                    type: "text",
                    text: userText || "Что на этом фото?"
                }
            ];
        } else {
            userContent = userText;
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile",
                    max_tokens: 1024,
                    messages: [
                        {
                            role: "system",
                            content: "Ты - Помощник по области космоса общайся вежливо если пользователь спрашивает именно про определенную тему говори про нее ничего лишнего и отвечай коротко а если скажет чтото по типу можно поподробнее или хочу больше информации говоришь по больше и можешь сказать ему когда захочешь скажи типо пройдитесь по нашему сайту изучите планеты и чтот такое'"
                        },
                        {
                            role: "user",
                            content: userContent
                        }
                    ]
                })
            });

            const data = await response.json();

            if (data.error) {
                console.error("Ошибка API:", data.error.message);
                return "Ошибка: " + data.error.message;
            }

            return data.choices[0].message.content;

        } catch (err) {
            console.error("Критическая ошибка:", err);
            return "Связь прервана. Проверь консоль (F12).";
        }
    }

    // Функция отправки сообщения
    async function sendMessage() {
        const val = inputField.value.trim();
        if (!val && !attachedImage) return;

        addMsg(val, true); 
        inputField.value = '';

        const tempId = "ai-loading-" + Date.now();
        addMsg("Обрабатываю запрос...", false, tempId);

        const aiResponse = await fetchAI(val, attachedImage);
        
        attachedImage = null;
        const uploadBtn = document.getElementById('image-upload');
        if (uploadBtn) uploadBtn.value = '';

        const loader = document.getElementById(tempId);
        if (loader) loader.remove();

        addMsg(aiResponse, false);
    }

    // Привязка событий
    sendBtn.onclick = sendMessage;
    inputField.onkeydown = (e) => { if (e.key === 'Enter') sendMessage(); };

}); // Конец DOMContentLoaded


// 5. БУРГЕР МЕНЮ
const burger = document.getElementById('burger-menu');
const sideNav = document.getElementById('side-nav');

if (burger) {
    burger.onclick = (e) => {
        e.stopPropagation();
        sideNav.classList.toggle('active');
    };
}

document.querySelectorAll('#side-nav a').forEach(link => {
    link.addEventListener('click', () => {
        sideNav.classList.remove('active');
    });
});

window.addEventListener('click', (e) => {
    if (sideNav && sideNav.classList.contains('active') && 
        !burger.contains(e.target) && 
        !sideNav.contains(e.target)) {
        sideNav.classList.remove('active');
    }
});
document.getElementById('chat-messages').addEventListener('wheel', (e) => {
    e.stopPropagation();
}, { passive: true });


function openFAQ() {
    document.getElementById('faq-overlay').style.display = 'flex';
}

function closeFAQ() {
    document.getElementById('faq-overlay').style.display = 'none';
}

// Закрытие при клике вне окна
window.onclick = function(event) {
    let overlay = document.getElementById('faq-overlay');
    if (event.target == overlay) closeFAQ();
}
function calcAge() {
    let age = document.getElementById('userAge').value;
    let res = document.getElementById('ageResults');
    let explain = document.getElementById('ageExplanation'); // Новый блок для текста
    
    if(age > 0) {
        let mars = (age / 1.88).toFixed(1);
        let jupiter = (age / 11.86).toFixed(2);
        
        res.innerHTML = `📅 На Марсе тебе: <b>${mars}</b> л. | На Юпитере: <b>${jupiter}</b> л.`;
        
        // Добавляем краткое "Почему так?"
        explain.innerHTML = `
            <div style="margin-top:15px; padding:10px; border-left: 2px solid #00eaff; background: rgba(0,210,255,0.05); font-size: 13px; color: #ccc;">
                <strong>ПОЧЕМУ ТАК?</strong><br>
                На Марсе год длится почти 2 земных года, потому что он дальше от Солнца и движется медленнее. 
                А Юпитер так далеко, что пока он делает 1 круг, на Земле проходит почти 12 лет!
            </div>
        `;
        explain.style.opacity = "1";
    } else { 
        res.innerHTML = ""; 
        explain.innerHTML = "";
        explain.style.opacity = "0";
    }
}
// 1. Универсальный обработчик клика по карточкам (через делегирование)
document.querySelector('.faq-grid').addEventListener('click', (e) => {
    // Находим саму карточку, даже если кликнули по заголовку внутри неё
    const item = e.target.closest('.faq-item');
    
    // Если это не калькулятор (у него своя логика) и карточка существует
    if (item && !item.classList.contains('special-item')) {
        const answer = item.querySelector('.faq-answer');
        
        // Звук клика
        if (typeof clickSound !== 'undefined') {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {}); // Игнорим ошибки автоплея
        }

        // Переключаем класс active
        const isActive = item.classList.contains('active');
        
        // Закрываем все остальные открытые карточки
        document.querySelectorAll('.faq-item.active').forEach(el => {
            el.classList.remove('active');
            el.querySelector('.faq-answer').style.display = 'none';
        });

        // Если карточка не была активна — открываем её
        if (!isActive) {
            item.classList.add('active');
            answer.style.display = 'block';
            
            // Запускаем анимацию появления текста
            answer.style.animation = 'none';
            void answer.offsetWidth; // Сброс анимации
            answer.style.animation = 'fadeInText 0.5s ease forwards';
        }
    }
});

// 2. Исправленная функция фильтрации
function filterFAQ(category, btn) {
    // Подсветка кнопок
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const items = document.querySelectorAll('.faq-item');
    let delay = 0;
    
    items.forEach(item => {
        // Сбрасываем всё перед показом
        item.classList.remove('active');
        const answer = item.querySelector('.faq-answer');
        
        // Если это не калькулятор, прячем ответ
        if (!item.classList.contains('special-item')) {
            answer.style.display = 'none';
        }

        // Логика фильтра
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = "block";
            item.style.opacity = "0"; // Начальное состояние для анимации
            
            // Запускаем появление всей карточки
            item.style.animation = 'none';
            void item.offsetWidth;
            item.style.animation = `slideIn 0.4s ease ${delay}s forwards`;
            delay += 0.05; 
        } else {
            item.style.display = "none";
        }
    });
}
function toggleMusic() {
    const music = document.getElementById('backgroundMusic');
    const playIcon = document.querySelector('.play-icon');
    const pauseIcon = document.querySelector('.pause-icon');

    // Громкость музыки (меняй здесь: от 0.0 до 1.0)
    music.volume = 0.3; // 70% громкости

    if (music.paused) {
        music.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    } else {
        music.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }
}

// Ручная настройка громкости музыки
// Значение от 0.0 (тихо) до 1.0 (громко)
function setMusicVolume(volumeValue) {
    const music = document.getElementById('backgroundMusic');
    music.volume = volumeValue; // Например: 0.3 = 30%, 0.5 = 50%, 1.0 = 100%
}
 let audioContext;
    let typingSoundEnabled = true;
    let volumeLevel = 1.0;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
document.getElementById('faq-overlay').addEventListener('wheel', (e) => {
    e.stopPropagation();
}, { passive: true });


function openGallery() {
    const gallery = document.getElementById('space-gallery');
    if (gallery) {
        gallery.style.display = 'block';
        document.body.style.overflow = 'hidden'; // страница не скроллится
    }
}

function closeGallery() {
    document.getElementById('space-gallery').style.display = 'none';
    document.body.style.overflow = ''; // возвращаем обратно
}
document.getElementById('space-gallery').addEventListener('wheel', (e) => {
    e.stopPropagation();
}, { passive: true });


