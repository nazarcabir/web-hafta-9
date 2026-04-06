# CampusConnect
Öğrenci: Nazar Cabir Cabir
Okul No: 202100123

## Proje Başlığı & Açıklama
CampusConnect, üniversite topluluklarının etkinliklerini yönetebileceği, kullanıcıların bu etkinliklere katılabileceği ve istatistiklerin takip edilebileceği mikroservis tabanlı bir platformdur. Proje, yüksek performans ve ölçeklenebilirlik hedefleriyle NestJS (TypeScript) ve Go dilleri kullanılarak geliştirilmiştir.

## Kurulum Talimatları
Projeyi ayağa kaldırmak için sisteminizde Docker ve Docker Compose yüklü olmalıdır.

1.  Root dizininde terminali açın.
2.  `docker-compose up --build -d` komutunu çalıştırın.
3.  Servislerin hazır olması için ~30 saniye bekleyin.
4.  NestJS API: `http://localhost:3000`
5.  Go API: `http://localhost:8080`
6.  NestJS Swagger Docs: `http://localhost:3000/api-docs`

## Environment Variables
Proje kök dizininde ve servis dizinlerinde `.env.example` dosyaları mevcuttur. Docker kullanımı için varsayılan değerler otomatik olarak yapılandırılmıştır.

## API Endpoint Listesi
| Servis | Metot | Path | Açıklama |
| :--- | :--- | :--- | :--- |
| NestJS | POST | `/api/v1/users` | Kullanıcı Kaydı |
| NestJS | POST | `/api/v1/auth/login` | Giriş (JWT) |
| NestJS | GET | `/api/v1/events` | Etkinlik Listeleme |
| Go | GET | `/api/v1/analytics/popular` | Popüler Etkinlikler |
| Go | GET | `/api/v1/notifications` | Bildirim Geçmişi |

## Örnek Request/Response (Event Oluşturma)
```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "AI Workshop", "date": "2026-05-10T10:00:00Z"}'
```
Response: `201 Created`

## Mimari Kararlar
- **NestJS + Go:** Karmaşık iş mantığı ve GraphQL için NestJS, yüksek hızlı analytics ve webhook işleme için Go tercih edilmiştir.
- **Webhook:** Servisler arası asenkron iletişim için HMAC imzalı webhook mimarisi kurulmuştur.
- **Rate Limit:** Go tarafında IP tabanlı token bucket algoritması ile API güvenliği sağlanmıştır.
