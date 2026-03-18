🕹️ PAC-MAN – ASP.NET Core + SQL Server
Tarayıcıda oynanabilen, tam stack Pacman oyunu.
Backend: ASP.NET Core 8 Minimal API · ORM: EF Core 8 · DB: SQL Server · Frontend: HTML / CSS / JS (Canvas)

📁 Proje Klasör Yapısı
Pacman/
├── Data/
│   └── AppDbContext.cs          ← EF Core DbContext
├── Migrations/
│   ├── 20240101000000_InitialCreate.cs
│   └── AppDbContextModelSnapshot.cs
├── Models/
│   ├── Score.cs                 ← Entity
│   ├── ScoreCreateDto.cs        ← POST body
│   └── ScoreSummaryDto.cs       ← Leaderboard response
├── Properties/
│   └── launchSettings.json
├── wwwroot/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js               ← Backend iletişimi
│       ├── ui.js                ← Modal / HUD render
│       └── game.js              ← Oyun motoru (Canvas)
├── appsettings.json
├── appsettings.Development.json
├── Pacman.csproj
└── Program.cs
⚙️ Gereksinimler
Araç	Minimum Versiyon
.NET SDK	8.0
SQL Server	2019+ veya LocalDB
EF Core CLI	dotnet tool install -g dotnet-ef
🚀 Kurulum ve Çalıştırma
1 · Bağımlılıkları yükle
cd Pacman
dotnet restore
2 · Connection string'i ayarla
appsettings.json içindeki DefaultConnection değerini kendi SQL Server ortamınıza göre düzenleyin:

LocalDB (varsayılan):

"Server=(localdb)\\mssqllocaldb;Database=PacmanDb;Trusted_Connection=True;TrustServerCertificate=True"
SQL Server Express:

"Server=.\\SQLEXPRESS;Database=PacmanDb;Trusted_Connection=True;TrustServerCertificate=True"
SQL Server (kullanıcı/şifre ile):

"Server=YOUR_SERVER;Database=PacmanDb;User Id=YOUR_USER;Password=YOUR_PASS;TrustServerCertificate=True"
3 · Migration (opsiyonel – uygulama başlarken otomatik çalışır)
# Yeni migration oluştur (repo'ya commit edilmiş migration varsa bu adım gerekmez)
dotnet ef migrations add InitialCreate

# Manuel uygula
dotnet ef database update
⚠️ Program.cs içindeki db.Database.Migrate() çağrısı her açılışta migration'ları otomatik uygular.

4 · Uygulamayı çalıştır
dotnet run
Tarayıcıda http://localhost:5000 adresine git.

🔌 API Endpoints
Method	Endpoint	Açıklama
GET	/api/health	Sağlık kontrolü
POST	/api/scores	Oyun sonucu kaydet
GET	/api/scores/raw	Tüm ham kayıtlar
GET	/api/scores/summary	Kişi bazlı leaderboard
POST /api/scores – örnek istek
{
  "playerName": "Miray",
  "game": "pacman",
  "points": 1200,
  "isWin": true,
  "durationSeconds": 95
}
GET /api/scores/summary – örnek yanıt
[
  {
    "playerName": "Miray",
    "totalScore": 3750,
    "totalGames": 3,
    "totalWins": 2,
    "bestScore": 2000,
    "lastPlayedAtUtc": "2024-06-15T18:42:00Z"
  }
]
🎮 Oyun Kontrolleri
Tuş	Hareket
W / ↑	Yukarı
S / ↓	Aşağı
A / ←	Sol
D / →	Sağ
🧪 Test Senaryoları
Backend (curl / Postman)
# Health check
curl http://localhost:5000/api/health

# Skor kaydet
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestUser","points":500,"isWin":false,"durationSeconds":60}'

# Leaderboard
curl http://localhost:5000/api/scores/summary

# Ham kayıtlar
curl http://localhost:5000/api/scores/raw
Validation testleri
# Boş playerName → 400
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"playerName":"","points":100,"isWin":false,"durationSeconds":30}'

# Negatif puan → 400
curl -X POST http://localhost:5000/api/scores \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test","points":-1,"isWin":false,"durationSeconds":30}'
⚠️ Olası Hatalar ve Çözümler
Hata	Neden	Çözüm
Cannot open database	LocalDB yüklü değil / bağlanamıyor	SQL Server Express veya connection string'i güncelle
dotnet ef not found	EF CLI yüklü değil	dotnet tool install -g dotnet-ef
No migrations found	Migration dosyaları eksik	dotnet ef migrations add InitialCreate
CORS hatası (farklı port)	Backend ve frontend farklı port	Backend'i http://localhost:5000 olarak çalıştır; veya api.js içindeki BASE_URL'i güncelle
Canvas render bozuk	Tarayıcı zoom'u ≠ 100%	image-rendering: pixelated CSS kuralı aktif
Skor gönderilmiyor	Backend ayakta değil	dotnet run sonrası tekrar dene
✅ Kontrol Listesi
dotnet run → backend ayağa kalktı
http://localhost:5000 → index.html açıldı
Oyuncu adı girip BAŞLAT → oyun başladı
Oyun bitti → skor otomatik POST edildi
🏆 LIDERBOARD butonu → modal açıldı, summary verisi geldi
Aynı oyuncu birden fazla oynadı → leaderboard tek satır gösteriyor
📦 NuGet Paketleri
<PackageReference Include="Microsoft.EntityFrameworkCore"           Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design"    Version="8.0.0" />
Pacman © Bandai Namco. Bu proje eğitim/demo amaçlıdır.