// ============================================================
// BẢNG GIÁ + CẤU HÌNH — CHỈ SỬA FILE NÀY ĐỂ ĐỔI SỐ LIỆU
//
// Nguồn số liệu: bảng giá công khai trên fhomesg.vn (lấy ngày 06/10/2026)
//   - /gia-thiet-ke-thi-cong-noi-that-chung-cu
//   - /gia-thiet-ke-thi-cong-noi-that-nha-pho
// Đơn vị giá trong file này: TRIỆU ĐỒNG. Khoảng giá viết [thấp, cao] như trên web FHome.
//
// CÁCH TÍNH (giống cách FHome tự ước tính trên web):
//   Tổng = diện tích x đơn giá phần thô x (phần thô khách chọn / tất cả)
//        + diện tích x đơn giá nội thất x (hạng mục khách chọn / tất cả)
// Cột "w" bên dưới chỉ là TỈ LỆ giữa các hạng mục, không phải giá tiền.
//
// Số ƯỚC LƯỢNG (web FHome chưa công bố, cần bên kinh doanh kiểm tra lại):
//   - tỷ trọng các hạng mục phần thô (thoItems)
//   - tỷ trọng nhà vệ sinh
//   - tỷ lệ giữa các hạng mục trong từng phòng (lấy từ bảng mẫu của FHome, nhưng là ước tính)
// ============================================================
var FHU = "https://fhomesg.vn/wp-content/uploads/";   // thư mục ảnh trên web FHome
window.FHOME_PRICING = {
  brand: "FHome Sài Gòn",
  zalo: "https://zalo.me/0904637687",
  hotline: "0904637687",
  hotlineLabel: "0904 637 687",

  // Gửi thông tin khách qua form WPForms có sẵn trên trang WordPress (form 277, trang Liên hệ).
  //   field 0 = Họ tên, 1 = Email (bắt buộc), 2 = Nội dung, 4 = Số điện thoại, 5 = Dịch vụ
  // Muốn dùng form riêng: đổi formId và số thứ tự field. Field nào không có thì đặt null.
  wpforms: {
    formId: 277,
    fields: { name: 0, email: 1, message: 2, phone: 4, service: 5 },
    emailRequired: true
    // Field "Dịch vụ" tự điền: Thiết kế nội thất (khi khách chọn Chỉ thiết kế) hoặc Thi công nội thất (trọn gói, chỉ thi công). Cấu hình trong app.js, mục SERVICES.
  },

  // Loại nhà. designFee = phí thiết kế (triệu/m²), FHome thường miễn hoặc giảm khi ký thi công trọn gói.
  types: [
    { id: "canho",  name: "Căn hộ chung cư", designFee: [0.25, 0.35], areaHint: "Diện tích sử dụng của căn hộ." },
    { id: "nhapho", name: "Nhà phố",         designFee: [0.25, 0.45], areaHint: "Nhà phố tính theo tổng diện tích sàn của các tầng. Ví dụ nhà 4 x 15 m, 1 trệt 1 lầu thì nhập 120." }
  ],

  // Phong cách. fee = phí thiết kế (triệu/m²) theo bảng "báo giá thiết kế theo phong cách" của FHome (chung cư):
  // Nhật Bản, Wabi Sabi, Hiện đại, Japandi, Tối giản = 250.000đ/m². Tân cổ điển, Luxury, Indochine = 350.000đ/m².
  // [ƯỚC LƯỢNG] Nhà phố dùng lại cách chia nhóm này (web FHome chỉ ghi 250 / 350 / 450.000đ/m², chưa nói phong cách nào thuộc nhóm nào).
  // suggest = gói vật liệu FHome thường gắn với phong cách đó (theo mô tả 3 gói trên web FHome).
  // slides = ảnh công trình thật của FHome (lấy từ fhomesg.vn, trang Dự án) để khách xem tham khảo khi chọn phong cách.
  // Mỗi ảnh có chú thích: phòng nào, căn hộ nào. Phong cách chưa có ảnh thì bỏ trống (tool tự ẩn khung ảnh).
  styles: [
    { id: "hiendai",  name: "Hiện đại",     fee: 0.25, suggest: ["tietkiem", "tieuchuan"], slides: [
      { img: FHU + "2025/11/phong-khach-can-ho-chung-cu-54m2-thiet-ke-theo-phong-cach-hien-dai-tai-du-an-lumiere-boulevard.jpg", cap: "Phòng khách, căn hộ Lumiere Boulevard 54 m²" },
      { img: FHU + "2025/10/Phong-khach-can-ho-Vinhomes-Grand-Park-54m2-phong-cach-Hien-dai-view-1.jpg", cap: "Phòng khách, căn hộ Vinhomes Grand Park 54 m²" },
      { img: FHU + "2025/10/Phong-bep-can-ho-Vinhomes-Grand-Park-54m2-phong-cach-Hien-dai-view-1.jpg", cap: "Phòng bếp, căn hộ Vinhomes Grand Park 54 m²" },
      { img: FHU + "2025/10/Phong-ngu-can-ho-Vinhomes-Grand-Park-54m2-phong-cach-Hien-dai-view-1.jpg", cap: "Phòng ngủ, căn hộ Vinhomes Grand Park 54 m²" } ] },
    { id: "japandi",  name: "Japandi",      fee: 0.25, suggest: ["tieuchuan"], slides: [
      { img: FHU + "2025/11/phong-cach-japandi-tao-khong-gian-uong-tra-ngay-tai-phong-khach-voi-cho-ngoi-sat-ben-mat-kinh.jpg", cap: "Phòng khách, căn hộ Vinhomes Grand Park 70 m²" },
      { img: FHU + "2025/12/phong-khach-can-ho-vinhomes-grand-park-70m2-phong-cach-japandi-view-2.jpg", cap: "Phòng khách, căn hộ Vinhomes Grand Park 70 m²" },
      { img: FHU + "2025/12/phong-khach-can-ho-vinhomes-grand-park-70m2-phong-cach-japandi-view-3.jpg", cap: "Phòng khách, căn hộ Vinhomes Grand Park 70 m²" },
      { img: FHU + "2025/12/phong-bep-can-ho-vinhomes-grand-park-70m2-phong-cach-japandi-view-view-1.jpg", cap: "Phòng bếp, căn hộ Vinhomes Grand Park 70 m²" } ] },
    { id: "wabisabi", name: "Wabi Sabi",    fee: 0.25, suggest: ["tieuchuan"], slides: [
      { img: FHU + "2025/11/Phong-khach-can-ho-Vinhomes-Grand-Park-70m2-phong-cach-Wabi-Sabi-view-1.jpg", cap: "Phòng khách, căn hộ Vinhomes Grand Park 70 m²" },
      { img: FHU + "2025/11/Phong-khach-can-ho-Vinhomes-Grand-Park-70m2-phong-cach-Wabi-Sabi-view-3.jpg", cap: "Phòng khách, căn hộ Vinhomes Grand Park 70 m²" },
      { img: FHU + "2025/11/Phong-bep-can-ho-Vinhomes-Grand-Park-70m2-phong-cach-Wabi-Sabi-view-1.jpg", cap: "Phòng bếp, căn hộ Vinhomes Grand Park 70 m²" },
      { img: FHU + "2025/11/Phong-ngu-can-ho-Vinhomes-Grand-Park-70m2-phong-cach-Wabi-Sabi-view-10.jpg", cap: "Phòng ngủ, căn hộ Vinhomes Grand Park 70 m²" } ] },
    { id: "nhatban",  name: "Nhật Bản",     fee: 0.25 },
    { id: "toigian",  name: "Tối giản",     fee: 0.25, slides: [
      { img: FHU + "2025/11/Phong-khach-can-ho-Masterise-Centre-Point-76m2-phong-cach-Minimalism-view-4-768x960.jpg", cap: "Phòng khách, căn hộ Masterise Centre Point 76 m²" },
      { img: FHU + "2025/11/Phong-khach-can-ho-Masterise-Centre-Point-76m2-phong-cach-Minimalism-view-1.jpg", cap: "Phòng khách, căn hộ Masterise Centre Point 76 m²" },
      { img: FHU + "2025/11/Phong-bep-can-ho-Masterise-Centre-Point-76m2-phong-cach-Minimalism-view-1.jpg", cap: "Phòng bếp, căn hộ Masterise Centre Point 76 m²" },
      { img: FHU + "2025/11/Phong-ngu-can-ho-Masterise-Centre-Point-76m2-phong-cach-Minimalism-view-1.jpg", cap: "Phòng ngủ, căn hộ Masterise Centre Point 76 m²" } ] },
    { id: "luxury",   name: "Luxury",       fee: 0.35, suggest: ["caocap"], slides: [
      { img: FHU + "2025/11/phong-khach-chung-cu-3pn-luxury-voi-vach-tv-kinh-doc-dao-ket-hop-led-va-cay-xanh.jpg", cap: "Phòng khách, căn hộ Golden Mansion 109 m²" },
      { img: FHU + "2025/12/Phong-khach-can-ho-Vinhomes-Grand-Park-59m2-phong-cach-Modern-Luxury-view-3.jpg", cap: "Phòng khách Modern Luxury, căn hộ Vinhomes Grand Park 59 m²" },
      { img: FHU + "2025/12/Phong-bep-can-ho-Vinhomes-Grand-Park-59m2-phong-cach-Modern-Luxury-view-1.jpg", cap: "Phòng bếp Modern Luxury, căn hộ Vinhomes Grand Park 59 m²" },
      { img: FHU + "2025/12/Phong-ngu-can-ho-Vinhomes-Grand-Park-59m2-phong-cach-Modern-Luxury-view-1.jpg", cap: "Phòng ngủ Modern Luxury, căn hộ Vinhomes Grand Park 59 m²" } ] },
    { id: "tancodien", name: "Tân cổ điển", fee: 0.35, suggest: ["caocap"] },
    { id: "indochine", name: "Indochine",   fee: 0.35 }
  ],

  // 3 gói của FHome. tho = đơn giá hoàn thiện phần thô (triệu/m²). noiThat = đơn giá nội thất theo loại nhà.
  tiers: [
    { id: "tietkiem", name: "Tiết kiệm", desc: "MDF tiêu chuẩn, phong cách Hiện đại",
      tho: [1.0, 1.5], noiThat: { canho: [1.7, 2.5], nhapho: [1.8, 2.7] } },
    { id: "tieuchuan", name: "Tiêu chuẩn", desc: "MDF An Cường chống ẩm, phụ kiện tốt",
      tho: [1.5, 2.5], noiThat: { canho: [2.5, 4.0], nhapho: [2.7, 4.5] } },
    { id: "caocap", name: "Cao cấp", desc: "Gỗ và đá tự nhiên, phụ kiện nhập khẩu",
      tho: [2.5, 4.0], noiThat: { canho: [4.0, 10.0], nhapho: [4.5, 10.0] } }
  ],

  // BƯỚC 2. Hoàn thiện phần thô. mode "tri" = Không / Một phần / Toàn bộ, mode "bin" = Không / Có.
  // w = tỷ trọng. [ƯỚC LƯỢNG] dựa trên đơn giá bảng "hoàn thiện phần thô" của FHome (trần 250-600k, sơn 150-300k, sàn 350-600k, điện nước 3-25 triệu...)
  thoItems: [
    { id: "tran",  name: "Trần thạch cao",         mode: "tri", w: 0.34 },
    { id: "son",   name: "Sơn tường",              mode: "tri", w: 0.50 },
    { id: "san",   name: "Sàn gỗ hoặc sàn gạch",   mode: "tri", w: 0.32 },
    { id: "dien",  name: "Điện và nước",           mode: "bin", w: 0.20 },
    { id: "donvs", name: "Dọn xà bần và vệ sinh công nghiệp", mode: "bin", w: 0.14 }
  ],

  // BƯỚC 3. Đồ nội thất theo phòng. weight = tỷ trọng của MỖI phòng (lấy theo giá trung bình các gói phòng trên web FHome:
  // khách 34-80, bếp 25-67, ngủ master 29-40,7, ngủ nhỏ 18,9-25,8 triệu). w của hạng mục = khối lượng x đơn giá trong bảng mẫu của FHome.
  rooms: [
    { id: "khach", name: "Phòng khách", weight: 57, items: [
      { id: "tugiay", name: "Tủ giày", w: 14.4 },
      { id: "sofa",   name: "Sofa", w: 17.1 },
      { id: "bantra", name: "Bàn trà", w: 7.9 },
      { id: "ketv",   name: "Kệ tivi", w: 5.7 },
      { id: "vachtv", name: "Vách ốp tivi", w: 10.7 },
      { id: "vachsf", name: "Vách ốp sau sofa", w: 13.7 },
      { id: "bantho", name: "Bàn thờ", w: 9.3 },
      { id: "rem",    name: "Rèm cửa", w: 4.0 }
    ]},
    { id: "bep", name: "Phòng bếp và phòng ăn", weight: 46, items: [
      { id: "tuduoi", name: "Tủ bếp dưới", w: 17.9 },
      { id: "tutren", name: "Tủ bếp trên", w: 19.2 },
      { id: "baotl",  name: "Khoang bao tủ lạnh", w: 7.4 },
      { id: "kecanh", name: "Tủ kệ trang trí cạnh bếp", w: 12.0 },
      { id: "damat",  name: "Đá mặt bếp", w: 24.0 },
      { id: "lung",   name: "Ốp lưng bếp", w: 16.0 },
      { id: "led",    name: "Đèn LED bếp", w: 2.0 }
    ]},
    { id: "master", name: "Phòng ngủ master", weight: 35, items: [
      { id: "giuong", name: "Giường ngủ", w: 8.2 },
      { id: "vachdg", name: "Vách đầu giường", w: 24.5 },
      { id: "tuao",   name: "Tủ quần áo", w: 21.4 },
      { id: "bantd",  name: "Bàn trang điểm", w: 4.9 },
      { id: "guong",  name: "Gương soi", w: 3.2 },
      { id: "tutv",   name: "Tủ tivi treo", w: 6.8 },
      { id: "rem",    name: "Rèm cửa", w: 4.0 }
    ]},
    { id: "nho", name: "Phòng ngủ nhỏ", weight: 22, perUnit: true, min: 0, max: 5, count: 1, items: [
      { id: "giuong", name: "Giường ngủ", w: 8.2 },
      { id: "tuao",   name: "Tủ quần áo", w: 29.2 },
      { id: "tutv",   name: "Tủ tivi", w: 6.8 },
      { id: "rem",    name: "Rèm cửa", w: 4.0 }
    ]},
    { id: "wc", name: "Nhà vệ sinh", weight: 7, perUnit: true, min: 0, max: 4, count: 1, items: [   // [ƯỚC LƯỢNG] tỷ trọng
      { id: "lavabo", name: "Tủ lavabo", w: 3.5 },
      { id: "tugg",   name: "Tủ gương lavabo", w: 2.5 },
      { id: "ledwc",  name: "Đèn LED tủ lavabo", w: 1.0 }
    ]}
  ],

  // Khoảng giá hiển thị quanh mức trung bình. Đối chiếu 3 dự án thật trên web FHome:
  // 54m² gói Tiêu chuẩn (thực tế 280-300 triệu, tool ra 261-317) và 70m² gói Tiêu chuẩn (360-380, tool ra 338-412) nằm trong khoảng;
  // 109m² gói Cao cấp (thực tế 1,1-1,3 tỷ, tool ra 1,03-1,25 tỷ) trùm phần lớn khoảng, vì gói Cao cấp của FHome rất rộng (4-10 triệu/m²).
  rangeLow: 0.92,
  rangeHigh: 1.12,

  defaults: { type: "canho", area: 0, tier: "tieuchuan" },
  areaMin: 20,
  areaMax: 600
};
