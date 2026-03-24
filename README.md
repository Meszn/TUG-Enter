<div align="center">
  <h1>🌌 TUG Enter v2</h1>
  <p><strong>TÜBİTAK Ulusal Gözlemevi (TUG) Proje Kayıt ve Yönetim Sistemi</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  </p>
</div>

---

## 🔭 Proje Hakkında (About the Project)

**TUG Enter**, araştırmacıların gözlem projelerini oluşturabildiği, silebilirceği ve arşivleyebildiği; astronomi ve uzay konseptli interaktif bir projedir. Etkileyici 3D uzay sahneleri (Three.js) ve akıcı animasyonlarla (Framer Motion) araştırmacıları benzersiz bir görsel deneyimle karşılar. 

Aynı zamanda TUG (TÜBİTAK Ulusal Gözlemevi) ve DAG (Doğu Anadolu Gözlemevi) anlık hava ve astronomi verilerini kullanıcıya sunar.

## ✨ Öne Çıkan Özellikler

- 🚀 **Etkileşimli 3D Arayüz:** `@react-three/fiber` ve `@react-three/drei` ile güçlendirilmiş yıldız haritası (`StarMapUI`) ve roket fırlatma animasyonları.
- 📸 **Kamera ile Fotoğraf Çekimi:** Projelere özel anlık fotoğraflar oluşturmak için entegre kamera arayüzü.
- 🌦️ **Canlı Hava Durumu & Gözlem Verisi:** TUG ve DAG üzerinden anlık hava durumu proxy API entegrasyonu.
- 👥 **Çoklu Araştırmacı Desteği:** Bir projeye birden fazla araştırmacı atanabilir.
- 📦 **Arşivleme:** Tamamlanan projeler, "Tamamlanan Projeler" (Completed Projects) alanında değerlendirme ve fotoğraflarla birlikte arşivlenir.
- 🐋 **Dockerize Edilmiş Mimari:** Tek bir `docker-compose up -d` komutu ile tüm sistemin başlatılması.

## 🛠️ Teknolojiler (Tech Stack)

### 🎨 Frontend
- **React (Vite):** Hızlı ve modern UI geliştirme.
- **Three.js (`@react-three/fiber`):** Etkileyici 3D uzay modeli ve efektleri.
- **Framer Motion:** Bileşenler arası yumuşak ve şık geçiş animasyonları.
- **Zustand:** Minimal ve yüksek performanslı state kontrolü.

### ⚙️ Backend
- **FastAPI:** Yüksek performanslı, hızlı, asenkron Python API.
- **SQLAlchemy:** Postgres veritabanı ORM çözümü.
- **PostgreSQL:** Sağlam ve ölçeklenebilir ilişkisel veritabanı.

## 🚀 Başlangıç (Getting Started)

Projeyi yerel ortamınızda ayağa kaldırmak oldukça basittir. Sistem **Docker** kullanılarak hızlıca çalıştırılabilir.

### Gereksinimler
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### Kurulum Adımları

1. Repoyu bilgisayarınıza klonlayın:
   ```bash
   git clone https://github.com/Meszn/TUG-Enter.git
   cd TUG-Enter
   ```

2. Docker ile tüm servisleri başlatın:
   ```bash
   docker-compose up -d --build
   ```

3. Kurulum tamamlandıktan sonra servislere erişin:
   - **Frontend:** http://localhost:5173
   - **Backend API Docs (Swagger UI):** http://localhost:8000/docs
   - **Veritabanı (PostgreSQL):** `localhost:5432`

## 📡 Temel API Uç Noktaları

- `GET /health` - Sistem durum kontrolü
- `GET /api/observatory/weather` - TUG & DAG anlık meteoroloji ve astronomi verileri
- `POST /api/projects` - Yeni proje & araştırmacı kaydı
- `GET /api/projects` - Aktif projeleri listeleme
- `PUT /api/projects/{id}/complete` - Projeyi sonlandırıp değerlendirme ve fotoğrafla arşive ekleme

---

<div align="center">
  <i>Geleceği Görmek İçin Uzaya Bak! 🌠</i>
</div>
