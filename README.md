# Smart Healthcare AI Triage & Appointment Booking Platform  
## Giải pháp Cloud-native hỗ trợ Sàng lọc Bệnh Y khoa qua AI và Quản lý Lịch hẹn Trực tuyến  

### 1. Tóm tắt chung  
Smart Healthcare Platform được thiết kế nhằm hiện đại hóa quy trình tiếp nhận, giải đáp thắc mắc y tế ban đầu và hỗ trợ đặt lịch khám bệnh trực tuyến. Hệ thống ứng dụng kiến trúc **Generative AI & RAG (Retrieval-Augmented Generation)** kết hợp giữa **AWS Bedrock Knowledge Base**, mô hình trích xuất thực thể y tế **ViMQ** và LLM **GPT-4o-mini**, đồng thời hỗ trợ lưu trữ **Báo cáo tóm tắt cuộc trò chuyện (Pre-consultation Report)**. Nền tảng được xây dựng theo kiến trúc Cloud-native trên hạ tầng **AWS Cloud** (Cognito, EC2, RDS PostgreSQL, S3, CloudWatch), kết hợp hệ thống giám sát LLM chuyên dụng (**Langfuse**), phục vụ nhu cầu truy cập từ Bệnh nhân, Bác sĩ và Quản trị viên.  

### 2. Đặt vấn đề
#### Vấn đề hiện tại  
Các cơ sở y tế hiện nay thường gặp tình trạng quá tải tại quầy tiếp đón do bệnh nhân mất nhiều thời gian hỏi đáp thông tin cơ bản. Quy trình đặt lịch hẹn truyền thống qua điện thoại hoặc tại quầy dễ gây ra tình trạng trùng lịch (Double-booking) và thời gian chờ đợi kéo dài. Về phía Bác sĩ, việc theo dõi danh sách lịch hẹn và thông tin bệnh nhân đăng ký khám còn thủ công, thiếu sự tập trung.  

#### Giải pháp  
Nền tảng cung cấp giải pháp toàn diện trải qua các giai đoạn nghiệp vụ khép kín:
1. **Giai đoạn 1 - Thiết lập Hệ thống & Phân quyền (Auth Flow):** Admin quản lý và khởi tạo tài khoản trên hệ thống. **AWS Cognito** quản lý định danh tập trung (RBAC), hỗ trợ phân quyền rõ ràng cho các vai trò Patient, Doctor và Admin.
2. **Giai đoạn 2 - Tiếp nhận & Khai báo Y tế (Onboarding):** Bệnh nhân đăng ký/đăng nhập tài khoản trên Mobile Web App. Bệnh nhân có thể cập nhật Form khai báo thông tin cá nhân, tiền sử bệnh nền và thông tin sức khỏe cơ bản.
3. **Giai đoạn 3 - Trợ lý AI RAG Tư vấn Y tế (LLM Pipeline Flow):** 
   - [LLM Intent Router] tiếp nhận câu hỏi và phân luồng xử lý: trích xuất thực thể y tế qua **ViMQ (Local Host)** và định tuyến ý định qua **AWS Bedrock Knowledge Base**.
   - Mô hình **GPT-4o-mini** tổng hợp tri thức và phản hồi câu trả lời chính xác cho bệnh nhân.
   - Toàn bộ luồng hội thoại được ghi log và giám sát hiệu năng/token qua **Langfuse** và **AWS CloudWatch**.
4. **Giai đoạn 4 - Đặt Lịch Hẹn Chuyên Khoa (Booking Flow):** Bệnh nhân chủ động chọn bác sĩ và khung giờ khám trống. **AWS RDS PostgreSQL** áp dụng cơ chế khóa dòng (**Pessimistic Locking**) để triệt tiêu 100% rủi ro trùng lịch (Race Condition). Đoạn chat tư vấn có thể được tự động tổng hợp thành file **Pre-consultation Report** lưu vào **Amazon S3**.
5. **Giai đoạn 5 - Tra cứu & Quản lý Lịch hẹn (Doctor/Patient Portal):** Bác sĩ đăng nhập vào Portal để xem danh sách lịch hẹn đã được đặt và tra cứu thông tin cá nhân/tiền sử bệnh của bệnh nhân.

#### Lợi ích và hoàn vốn đầu tư (ROI)  
- Giảm 60% thời gian tư vấn ban đầu tại quầy nhờ Trợ lý AI RAG giải đáp thắc mắc tự động 24/7 với dữ liệu y tế chuẩn xác.
- Giúp Bác sĩ dễ dàng nắm bắt lịch làm việc và danh sách bệnh nhân khám trong ngày.
- Triệt tiêu 100% rủi ro trùng lịch khám nhờ cơ chế Pessimistic Locking ở tầng Database.
- Đảm bảo chất lượng và độ an toàn của câu trả lời AI nhờ hệ thống giám sát LLM tập trung (**Langfuse**).
- Tối ưu hóa chi phí vận hành hạ tầng nhờ khả năng co giãn linh hoạt của các dịch vụ AWS Cloud.  

### 3. Kiến trúc giải pháp  
Hệ thống sử dụng kiến trúc Web Multi-tier kết hợp dịch vụ AI Hybrid (Cloud Services + External SaaS + Local Host Services).  

![Smart Healthcare AI Architecture](pipeline.png)

#### Dịch vụ AWS & Công nghệ sử dụng  
- *Amazon Cognito*: Quản lý định danh, đăng nhập/đăng ký, phân quyền RBAC cho Bệnh nhân, Bác sĩ và Admin.
- *AWS EC2*: Triển khai ứng dụng Web Frontend (Next.js) và Backend REST API / WebSocket Gateway / LLM Intent Router (NestJS) đóng gói qua Docker Containers.
- *AWS Bedrock Knowledge Base*: Lưu trữ và truy xuất cơ sở tri thức y tế (RAG Pipeline) phục vụ tư vấn.
- *External SaaS & Local Models*: **GPT-4o-mini** (sinh câu trả lời), **ViMQ Local Host** (trích xuất thực thể y tế NER) và **Langfuse** (giám sát metrics, latency, token của LLM).
- *Amazon RDS (PostgreSQL)*: Cơ sở dữ liệu quan hệ lưu trữ thông tin bệnh nhân, bác sĩ, lịch hẹn với cơ chế Pessimistic Locking (`FOR UPDATE`).
- *Amazon S3*: Lưu trữ tài nguyên tĩnh (Static assets), file báo cáo lịch sử chat tư vấn (PDF/JSON) và tệp đính kèm.
- *AWS CloudWatch*: Thu thập log hệ thống Backend, EC2 và log tổng hợp từ Langfuse.  

#### Thiết kế thành phần  
- *Giao diện Bệnh nhân (Next.js - Mobile View)*: Cho phép cập nhật thông tin cá nhân, trò chuyện với Trợ lý AI RAG để giải đáp thắc mắc y tế và thực hiện đặt lịch hẹn khám bệnh.
- *Giao diện Bác sĩ (Next.js - Desktop View)*: Cho phép Bác sĩ đăng nhập, tra cứu danh sách các ca khám/lịch hẹn đã được bệnh nhân đặt và xem thông tin cá nhân/tiền sử y tế/file báo cáo tư vấn AI từ S3.
- *Giao diện Quản trị (Admin Portal)*: Quản lý danh mục bác sĩ, tài khoản người dùng và xem báo cáo thống kê vận hành.
- *Backend Services (NestJS)*: Xử lý Business Logic, LLM Intent Router, kết nối CSDL RDS PostgreSQL, S3 và các API AI (Bedrock, GPT-4o-mini, ViMQ, Langfuse).  

### 4. Triển khai kỹ thuật  
**Các giai đoạn triển khai**  
Dự án được triển khai trong vòng **8 tuần** (2 tháng) qua các giai đoạn:  
1. *Tuần 1 - 2*: Phân tích yêu cầu Business Flow, thiết kế kiến trúc Cloud AWS Hybrid AI, thiết kế ERD CSDL và khởi tạo Base Source Code (Next.js + NestJS).
2. *Tuần 3 - 4*: Cấu hình AWS Cognito (RBAC Auth Flow), triển khai hạ tầng AWS (EC2, S3, RDS PostgreSQL), tích hợp Prisma ORM và xử lý cơ chế chống trùng lịch (Pessimistic Locking).
3. *Tuần 5 - 6*: Tích hợp RAG Pipeline (AWS Bedrock KB + GPT-4o-mini + ViMQ Local), kết nối Langfuse giám sát LLM, hoàn thiện giao diện tra cứu cho Bác sĩ & giao diện đặt lịch cho Bệnh nhân.
4. *Tuần 7 - 8*: Tích hợp AWS CloudWatch, kiểm thử tải (Stress Test Concurrency Booking), đóng gói container Docker, cấu hình CI/CD và bàn giao nghiệm thu.

**Yêu cầu kỹ thuật**  
- *Frontend*: Next.js, TailwindCSS, Socket.io-client, React Query.
- *Backend*: NestJS Framework, Prisma ORM, TypeScript, Socket.io.
- *Database*: PostgreSQL 16.x trên AWS RDS (`db.t4g.micro` - Private Subnet).
- *AI/ML*: AWS Bedrock KB, OpenAI API (GPT-4o-mini), ViMQ Local Service, Langfuse.
- *DevOps*: Docker, AWS CLI, GitHub Actions (CI/CD).

### 5. Lộ trình & Mốc triển khai  
- *Giai đoạn 1 (Tuần 1 - Tuần 2)*: Hoàn thiện thiết kế System Architecture & CSDL Schema theo Business Flow mới.
- *Giai đoạn 2 (Tuần 3 - Tuần 4)*: Triển khai thành công hạ tầng AWS (Cognito Auth Flow, RDS PostgreSQL, S3, EC2) & Booking Concurrency API.
- *Giai đoạn 3 (Tuần 5 - Tuần 6)*: Tích hợp thành công RAG Pipeline (Bedrock + GPT-4o-mini + ViMQ), giám sát Langfuse, hoàn thiện Portal tra cứu lịch cho Bác sĩ.
- *Giai đoạn 4 (Tuần 7 - Tuần 8)*: Hoàn thành Stress Test đặt lịch đồng thời, triển khai CI/CD trên AWS Cloud và nghiệm thu dự án.

### 6. Ước tính ngân sách  
Chi phí hạ tầng được ước tính trên môi trường AWS Cloud & AI Services cho giai đoạn thử nghiệm (MVP / Development Phase): 

*Chi phí hạ tầng & Dịch vụ hàng tháng*  
- *AWS RDS (db.t4g.micro - PostgreSQL)*: ~12.00 USD/tháng (Single-AZ, ARM Graviton2).
- *AWS EC2 (t3.small - Backend & Frontend)*: ~14.00 USD/tháng (Chạy Docker 24/7).
- *AWS Bedrock Knowledge Base*: ~10.00 USD/tháng (Chi phí lưu trữ Vector & Search Queries).
- *OpenAI API (GPT-4o-mini)*: ~5.00 USD/tháng (Chi phí Token theo lưu lượng thực tế).
- *Amazon S3 Standard*: ~0.50 USD/tháng (5 GB Data Storage & Transfer).
- *Amazon Cognito*: 0.00 USD/tháng (Miễn phí 50,000 MAU đầu tiên).
- *AWS CloudWatch & Langfuse*: ~3.00 USD/tháng (Metrics, Logs, Alarms & LLM Monitoring).

*Tổng chi phí hạ tầng Cloud & AI*: ~44.50 USD/tháng.

### 7. Đánh giá rủi ro  
#### Ma trận rủi ro  
- Trùng lịch khám do thao tác đồng thời (Race Condition): Ảnh hưởng cao, xác suất trung bình.
- Bị ngắt kết nối API LLM (OpenAI / Bedrock Timeout): Ảnh hưởng trung bình, xác suất thấp.
- AI phản hồi sai lệch tri thức y tế (Hallucination): Ảnh hưởng cao, xác suất thấp. 

#### Chiến lược giảm thiểu  
- *Race Condition*: Sử dụng Pessimistic Locking (`FOR UPDATE`) trực tiếp từ tầng Database PostgreSQL khi chốt slot lịch.  
- *API Timeout & Fallback*: Xây dựng luồng Fallback — Nếu API LLM gặp sự cố, hệ thống tự động chuyển bệnh nhân sang giao diện Đặt lịch khám trực tiếp.  
- *Giảm Hallucination & Monitoring*: Sử dụng RAG qua **AWS Bedrock Knowledge Base** để khoanh vùng dữ liệu y tế chuẩn xác, kết hợp **Langfuse** theo dõi chất lượng và cảnh báo khi câu trả lời AI bất thường. 

### 8. Kết quả kỳ vọng  
- **Cải tiến kỹ thuật:** Tự động hóa giải đáp thắc mắc y tế ban đầu cho bệnh nhân bằng RAG AI chính xác; đạt chỉ số sẵn sàng của hệ thống > 99.9% trên nền tảng AWS Cloud.  
- **Giá trị thực tế:** Cung cấp giải pháp đặt lịch khám minh bạch, chính xác, giúp bệnh nhân chủ động thời gian và giúp bác sĩ dễ dàng quản lý danh sách ca khám.
