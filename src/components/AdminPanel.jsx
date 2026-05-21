// src/components/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import "../AdminPanel.css";

const API = import.meta.env.VITE_API_URL || "";
const PASS_HASH = import.meta.env.VITE_ADMIN_PASS || "";

const CAT_EMOJI = {
  "Căn Hộ": "🏙️",
  "Văn Phòng": "🏢",
  "Biệt Thự": "🏠",
  "Khách Sạn": "🏨",
  "Thương Mại": "🏪",
  "Nhà Phố": "🏘️",
  Khác: "🏗️",
};

// Hàm mã hóa SHA-256 bảo mật một chiều
const sha256 = async (string) => {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

// ══ CONTENT SCHEMA — KHỞI TẠO ĐẦY ĐỦ CHO TOÀN BỘ TEXT TRÊN WEBSITE ══
const CONTENT_SCHEMA = [
  {
    id: "hero",
    label: "🎯 Hero — Phần Đầu Trang",
    open: true,
    fields: [
      {
        key: "hero_bignum",
        label: "Số lớn nền (Bignum)",
        type: "text",
        default: "15",
      },
      {
        key: "hero_tag",
        label: "Badge nhỏ",
        type: "text",
        default: "Đang nhận dự án — TP.HCM & Bình Dương",
      },
      {
        key: "hero_title",
        label: "Tiêu đề lớn",
        type: "textarea",
        default: "Kiến Tạo<br>Không Gian<br><em>Hoàn Hảo</em>",
      },
      {
        key: "hero_sub",
        label: "Mô tả ngắn",
        type: "textarea",
        default:
          "Đơn vị thi công thạch cao hàng đầu tại TP.HCM — trần giật cấp, vách ngăn, phào chỉ trang trí. Cung cấp vật liệu xây dựng cao cấp Knauf, USG chính hãng, giao tận công trình.",
      },
      {
        key: "hero_btn1",
        label: "Nút 1 (Báo giá)",
        type: "text",
        default: "→ Nhận Báo Giá Miễn Phí",
      },
      {
        key: "hero_btn2",
        label: "Nút 2 (Xem công trình)",
        type: "text",
        default: "Xem Công Trình →",
      },
      {
        key: "stat1_num",
        label: "Thống kê 1 — Số",
        type: "text",
        default: "500",
      },
      {
        key: "stat1_lbl",
        label: "Thống kê 1 — Nhãn",
        type: "text",
        default: "Công trình hoàn thành",
      },
      {
        key: "stat2_num",
        label: "Thống kê 2 — Số",
        type: "text",
        default: "15",
      },
      {
        key: "stat2_lbl",
        label: "Thống kê 2 — Nhãn",
        type: "text",
        default: "Năm kinh nghiệm",
      },
      {
        key: "stat3_num",
        label: "Thống kê 3 — Số",
        type: "text",
        default: "98",
      },
      {
        key: "stat3_lbl",
        label: "Thống kê 3 — Nhãn",
        type: "text",
        default: "Khách hàng hài lòng",
      },
    ],
  },
  {
    id: "services_sect",
    label: "🏛️ Trần & Vách — 6 Dịch Vụ",
    open: false,
    fields: [
      {
        key: "services_title",
        label: "Tiêu đề Dịch Vụ",
        type: "text",
        default:
          'Thi Công Toàn Diện<br><em style="font-style:italic;color:var(--accent)">Đúng Chất Lượng</em>',
      },
      {
        key: "services_desc",
        label: "Mô tả chung",
        type: "textarea",
        default:
          "Đội thợ lành nghề 10+ năm kinh nghiệm. Cam kết tiến độ, chất lượng bề mặt mịn phẳng tiêu chuẩn, bảo hành dài hạn.",
      },
      // Dịch vụ 1
      {
        key: "svc1_title",
        label: "DV1 — Tiêu đề",
        type: "text",
        default: "Trần Thạch Cao Phẳng",
      },
      {
        key: "svc1_desc",
        label: "DV1 — Mô tả chi tiết",
        type: "textarea",
        default:
          "Thi công trần phẳng khung nổi & khung chìm. Bề mặt phẳng mịn tuyệt đối, che đường điện, điều hoà gọn gàng. Phù hợp căn hộ, văn phòng, nhà dân.",
      },
      {
        key: "svc1_price",
        label: "DV1 — Đơn giá hiển thị",
        type: "text",
        default: "Từ 95.000đ/m²",
      },
      // Dịch vụ 2
      {
        key: "svc2_title",
        label: "DV2 — Tiêu đề",
        type: "text",
        default: "Trần Giật Cấp Nghệ Thuật",
      },
      {
        key: "svc2_desc",
        label: "DV2 — Mô tả chi tiết",
        type: "textarea",
        default:
          "Thiết kế và thi công trần giật cấp 2–4 tầng, tích hợp hệ đèn LED âm trần, cắt chỉ nổi. Tạo chiều sâu không gian và điểm nhấn sang trọng.",
      },
      {
        key: "svc2_price",
        label: "DV2 — Đơn giá hiển thị",
        type: "text",
        default: "Từ 145.000đ/m²",
      },
      // Dịch vụ 3
      {
        key: "svc3_title",
        label: "DV3 — Tiêu đề",
        type: "text",
        default: "Vách Ngăn Thạch Cao",
      },
      {
        key: "svc3_desc",
        label: "DV3 — Mô tả chi tiết",
        type: "textarea",
        default:
          "Vách ngăn khung thép mạ kẽm, tấm thạch cao tiêu chuẩn hoặc chống ẩm. Cách âm, cách nhiệt vượt trội. Linh hoạt bố cục không gian sống.",
      },
      {
        key: "svc3_price",
        label: "DV3 — Đơn giá hiển thị",
        type: "text",
        default: "Từ 180.000đ/m²",
      },
      // Dịch vụ 4
      {
        key: "svc4_title",
        label: "DV4 — Tiêu đề",
        type: "text",
        default: "Phào Chỉ & Trang Trí",
      },
      {
        key: "svc4_desc",
        label: "DV4 — Mô tả chi tiết",
        type: "textarea",
        default:
          "Thi công phào chỉ thạch cao ốp tường, trần. Hoa văn cổ điển đến hiện đại, phào góc bo, gờ nổi. Hoàn thiện chi tiết tinh xảo.",
      },
      {
        key: "svc4_price",
        label: "DV4 — Đơn giá hiển thị",
        type: "text",
        default: "Từ 120.000đ/md",
      },
      // Dịch vụ 5
      {
        key: "svc5_title",
        label: "DV5 — Tiêu đề",
        type: "text",
        default: "Bả Bột & Sơn Nước",
      },
      {
        key: "svc5_desc",
        label: "DV5 — Mô tả chi tiết",
        type: "textarea",
        default:
          "Bả Matit 2–3 lớp, xử lý bề mặt trơn mịn hoàn hảo. Thi công sơn nước Dulux, Jotun, Kova nội ngoại thất. Màu sắc theo yêu cầu.",
      },
      {
        key: "svc5_price",
        label: "DV5 — Đơn giá hiển thị",
        type: "text",
        default: "Từ 55.000đ/m²",
      },
      // Dịch vụ 6
      {
        key: "svc6_title",
        label: "DV6 — Tiêu đề",
        type: "text",
        default: "Cung Cấp Vật Liệu",
      },
      {
        key: "svc6_desc",
        label: "DV6 — Mô tả chi tiết",
        type: "textarea",
        default:
          "Phân phối tấm thạch cao Knauf, USG, Vĩnh Tường; khung thép mạ kẽm; bông khoáng; phụ kiện. Giao tận công trình toàn TP.HCM, Bình Dương.",
      },
      {
        key: "svc6_price",
        label: "DV6 — Đơn giá hiển thị",
        type: "text",
        default: "Giá sỉ tốt nhất",
      },
    ],
  },
  {
    id: "about",
    label: "🏆 Về Chúng Tôi",
    open: false,
    fields: [
      {
        key: "about_years",
        label: "Số năm kinh nghiệm góc",
        type: "text",
        default: "15+",
      },
      {
        key: "about_title",
        label: "Tiêu đề chính",
        type: "text",
        default: "Hơn 15 Năm Xây Dựng Niềm Tin",
      },
      {
        key: "about_desc",
        label: "Mô tả chi tiết",
        type: "textarea",
        default:
          "ThạchPro được thành lập năm 2008, đã hoàn thiện hơn 500 công trình từ căn hộ cao cấp, biệt thự, văn phòng đến trung tâm thương mại trên toàn TP.HCM.",
      },
      {
        key: "about_feat1_title",
        label: "Điểm mạnh 1 — Tiêu đề",
        type: "text",
        default: "Đội Ngũ Thợ Chuyên Nghiệp",
      },
      {
        key: "about_feat1_desc",
        label: "Điểm mạnh 1 — Nội dung",
        type: "textarea",
        default:
          "30+ thợ lành nghề với 10+ năm kinh nghiệm. Được đào tạo bài bản theo tiêu chuẩn Knauf & USG.",
      },
      {
        key: "about_feat2_title",
        label: "Điểm mạnh 2 — Tiêu đề",
        type: "text",
        default: "Báo Giá Minh Bạch",
      },
      {
        key: "about_feat2_desc",
        label: "Điểm mạnh 2 — Nội dung",
        type: "textarea",
        default:
          "Không phát sinh chi phí ngoài hợp đồng. Báo giá chi tiết từng hạng mục, vật tư rõ ràng ngay từ đầu.",
      },
      {
        key: "about_feat3_title",
        label: "Điểm mạnh 3 — Tiêu đề",
        type: "text",
        default: "Tiến Độ Đúng Cam Kết",
      },
      {
        key: "about_feat3_desc",
        label: "Điểm mạnh 3 — Nội dung",
        type: "textarea",
        default:
          "Đảm bảo hoàn thành đúng hạn. Làm sạch công trình hàng ngày, không gây ảnh hưởng đến sinh hoạt.",
      },
      {
        key: "about_feat4_title",
        label: "Điểm mạnh 4 — Tiêu đề",
        type: "text",
        default: "Bảo Hành 24 Tháng",
      },
      {
        key: "about_feat4_desc",
        label: "Điểm mạnh 4 — Nội dung",
        type: "textarea",
        default:
          "Cam kết bảo hành toàn bộ hạng mục 24 tháng. Hỗ trợ bảo trì miễn phí sau thời gian bảo hành.",
      },
    ],
  },
  {
    id: "why",
    label: "⭐ Điểm Khác Biệt (Why Us)",
    open: false,
    fields: [
      {
        key: "why_title",
        label: "Tiêu đề Why Us",
        type: "text",
        default: "Chúng Tôi Cam Kết<br>Điều Này",
      },
      {
        key: "why_item1_title",
        label: "Cam kết 1 — Tiêu đề",
        type: "text",
        default: "Khảo Sát & Tư Vấn Miễn Phí 100%",
      },
      {
        key: "why_item1_desc",
        label: "Cam kết 1 — Chi tiết",
        type: "textarea",
        default:
          "Đội kỹ thuật đến tận nơi đo đạc, tư vấn giải pháp tối ưu. Không mất bất kỳ chi phí nào.",
      },
      {
        key: "why_item2_title",
        label: "Cam kết 2 — Tiêu đề",
        type: "text",
        default: "Báo Giá Trọn Gói Không Phát Sinh",
      },
      {
        key: "why_item2_desc",
        label: "Cam kết 2 — Chi tiết",
        type: "textarea",
        default:
          "Hợp đồng rõ ràng từng hạng mục. Cam kết không phát sinh chi phí ngoài thỏa thuận ban đầu.",
      },
      {
        key: "why_item3_title",
        label: "Cam kết 3 — Tiêu đề",
        type: "text",
        default: "Đội Thợ Được Đào Tạo Bài Bản",
      },
      {
        key: "why_item3_desc",
        label: "Cam kết 3 — Chi tiết",
        type: "textarea",
        default:
          "30+ thợ lành nghề chuyên về thạch cao, được đào tạo kỹ thuật theo tiêu chuẩn Knauf & USG.",
      },
      {
        key: "why_item4_title",
        label: "Cam kết 4 — Tiêu đề",
        type: "text",
        default: "Bảo Hành 24 Tháng Toàn Bộ Hạng Mục",
      },
      {
        key: "why_item4_desc",
        label: "Cam kết 4 — Chi tiết",
        type: "textarea",
        default:
          "Bảo hành dài nhất trong ngành. Hỗ trợ bảo trì sau bảo hành với chi phí ưu đãi.",
      },
      {
        key: "why_item5_title",
        label: "Cam kết 5 — Tiêu đề",
        type: "text",
        default: "Vật Liệu Chính Hãng Có Chứng Nhận",
      },
      {
        key: "why_item5_desc",
        label: "Cam kết 5 — Chi tiết",
        type: "textarea",
        default:
          "Chỉ sử dụng vật liệu có CO/CQ đầy đủ. Đại lý ủy quyền Knauf, USG, Vĩnh Tường.",
      },
    ],
  },
  {
    id: "contact",
    label: "📞 Thông Tin Liên Hệ",
    open: false,
    fields: [
      {
        key: "contact_phone",
        label: "Số điện thoại hiển thị",
        type: "text",
        default: "0901 234 567",
      },
      {
        key: "contact_hours",
        label: "Giờ làm việc",
        type: "text",
        default: "Thứ 2 – Chủ Nhật · 7:00 – 18:00",
      },
      {
        key: "contact_zalo",
        label: "Zalo",
        type: "text",
        default: "Zalo: 0901 234 567",
      },
      {
        key: "contact_email",
        label: "Email",
        type: "text",
        default: "thachpro@gmail.com",
      },
      {
        key: "contact_address",
        label: "Địa chỉ hiển thị",
        type: "text",
        default: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      },
    ],
  },
  {
    id: "footer",
    label: "🦶 Footer & Thương Hiệu",
    open: false,
    fields: [
      {
        key: "brand_name",
        label: "Tên thương hiệu",
        type: "text",
        default: "ThạchPro",
      },
      {
        key: "footer_desc",
        label: "Mô tả ngắn ở footer",
        type: "textarea",
        default:
          "Đơn vị thi công thạch cao và cung cấp vật liệu xây dựng chuyên nghiệp tại TP.HCM từ năm 2008.",
      },
    ],
  },
  {
    id: "cta",
    label: "📢 CTA — Phần Kêu Gọi Hành Động",
    open: false,
    fields: [
      {
        key: "cta_title",
        label: "Tiêu đề phần CTA",
        type: "textarea",
        default: "Bắt Đầu Dự Án<br>Của Bạn Hôm Ngày",
      },
      {
        key: "cta_desc",
        label: "Mô tả phần CTA",
        type: "textarea",
        default:
          "Liên hệ ngay để được tư vấn miễn phí và nhận báo giá trong 24 giờ.",
      },
      {
        key: "cta_btn",
        label: "Chữ trên nút CTA",
        type: "text",
        default: "📞 Gọi Ngay: 0901 234 567",
      },
    ],
  },
];

export default function AdminPanel({ onNavigateToHome }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [isHashing, setIsHashing] = useState(false);

  const [galleryItems, setGalleryItems] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contentData, setContentData] = useState({});
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("#");

  // Modal State
  const [gModalOpen, setGModalOpen] = useState(false);
  const [gModalItem, setGModalItem] = useState({
    id: "",
    title: "",
    category: "",
    location: "",
    size: "",
    image: "",
  });
  const [gModalMode, setGModalMode] = useState("add");
  const [gModalImgTab, setGModalImgTab] = useState("url");
  const [driveInput, setDriveInput] = useState("");

  // Delete Confirm State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  // Toast State
  const [toast, setToast] = useState({ visible: false, msg: "", type: "" });

  // Bảo mật: Tạo mã hóa băm
  const [hashInput, setHashInput] = useState("");
  const [generatedHash, setGeneratedHash] = useState("");

  useEffect(() => {
    const isAuth = sessionStorage.getItem("tp_auth") === "1";
    if (isAuth) {
      setIsAuthenticated(true);
      initAll();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsaved]);

  const initAll = () => {
    loadGallery();
    loadContentData();
    loadContacts();
  };

  const showToast = (msg, type = "") => {
    setToast({ visible: true, msg, type });
    setTimeout(() => setToast({ visible: false, msg: "", type: "" }), 3200);
  };

  const generateSha256 = async () => {
    if (!hashInput) return;
    const res = await sha256(hashInput);
    setGeneratedHash(res);
  };

  const doLogin = async () => {
    setIsHashing(true);
    await new Promise((r) => setTimeout(r, 500));

    const inputHash = await sha256(password);
    setIsHashing(false);

    if (inputHash === PASS_HASH || password === PASS_HASH) {
      sessionStorage.setItem("tp_auth", "1");
      setIsAuthenticated(true);
      setErrorVisible(false);
    } else {
      setErrorVisible(true);
      setPassword("");
    }
  };

  const doLogout = () => {
    sessionStorage.removeItem("tp_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  const loadGallery = async () => {
    const loadingEl = document.getElementById("g-loading");
    const tableEl = document.getElementById("g-table");
    const emptyEl = document.getElementById("g-empty");

    if (loadingEl) loadingEl.style.display = "block";
    if (tableEl) tableEl.style.display = "none";
    if (emptyEl) emptyEl.style.display = "none";

    try {
      const res = await fetch(API + "?t=" + Date.now());
      const data = await res.json();
      const items = data.items || [];
      setGalleryItems(items);

      if (loadingEl) loadingEl.style.display = "none";
      if (items.length > 0) {
        if (tableEl) tableEl.style.display = "table";
      } else {
        if (emptyEl) emptyEl.style.display = "block";
      }
    } catch (e) {
      showToast("❌ Không tải được dữ liệu!", "error");
      if (loadingEl) loadingEl.textContent = "⚠️ Lỗi kết nối.";
    }
  };

  const loadContentData = async () => {
    try {
      const res = await fetch(API + "?type=content&t=" + Date.now());
      const data = await res.json();
      if (data.content && data.content.length) {
        const mapped = {};
        data.content.forEach(({ key, value }) => {
          mapped[key] = value;
        });
        setContentData(mapped);
        showToast("✅ Đã tải nội dung hiện tại", "success");
      }
    } catch (e) {
      showToast("ℹ️ Dùng nội dung mặc định", "info");
    }
  };

  const loadContacts = async () => {
    const loadingEl = document.getElementById("c-loading");
    const tableEl = document.getElementById("c-table");
    const emptyEl = document.getElementById("c-empty");

    if (loadingEl) loadingEl.style.display = "block";
    if (tableEl) tableEl.style.display = "none";
    if (emptyEl) emptyEl.style.display = "none";

    try {
      const res = await fetch(API + "?type=contacts&t=" + Date.now());
      const data = await res.json();
      const list = data.contacts || [];
      setContacts(list);
      if (data.sheetUrl) setSheetUrl(data.sheetUrl);

      if (loadingEl) loadingEl.style.display = "none";
      if (list.length > 0) {
        if (tableEl) tableEl.style.display = "table";
      } else {
        if (emptyEl) emptyEl.style.display = "block";
      }
    } catch (e) {
      if (loadingEl)
        loadingEl.textContent =
          "⚠️ Không tải được. Xem trực tiếp trên Google Sheet.";
    }
  };

  const openAddModal = () => {
    setGModalMode("add");
    setGModalItem({
      id: "CT" + Date.now(),
      title: "",
      category: "",
      location: "",
      size: "",
      image: "",
    });
    setGModalImgTab("url");
    setDriveInput("");
    setGModalOpen(true);
  };

  const openEditModal = (item) => {
    setGModalMode("edit");
    setGModalItem(item);
    setGModalImgTab("url");
    setDriveInput(item.image || ""); // Nếu đã có ảnh thì hiển thị lại danh sách URL trong textarea
    setGModalOpen(true);
  };

  // Tách nhiều ID Google Drive cách dòng hoặc dấu phẩy
  const convDrive = (input) => {
    setDriveInput(input);
    const lines = input.split(/[\n,\s]+/);
    const convertedUrls = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const m1 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      const m2 = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
      const id = m1 ? m1[1] : m2 ? m2[1] : "";
      if (id) {
        convertedUrls.push(`https://drive.google.com/uc?export=view&id=${id}`);
      } else if (trimmed.startsWith("http")) {
        convertedUrls.push(trimmed);
      }
    });

    if (convertedUrls.length > 0) {
      setGModalItem((prev) => ({ ...prev, image: convertedUrls.join("\n") }));
    }
  };

  const saveGallery = async () => {
    if (!gModalItem.title.trim()) {
      showToast("⚠️ Nhập tiêu đề!", "error");
      return;
    }
    if (!gModalItem.category) {
      showToast("⚠️ Chọn danh mục!", "error");
      return;
    }

    const btn = document.getElementById("g-save-btn");
    if (btn) {
      btn.textContent = "⏳ Đang lưu...";
      btn.disabled = true;
    }

    try {
      await fetch(API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "gallery_save", ...gModalItem }),
      });
      showToast("✅ Lưu thành công!", "success");
      setGModalOpen(false);
      loadGallery();
    } catch (e) {
      showToast("❌ Lỗi khi lưu!", "error");
    } finally {
      if (btn) {
        btn.textContent = "💾 Lưu Công Trình";
        btn.disabled = false;
      }
    }
  };

  const askDelete = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    setConfirmOpen(false);
    try {
      await fetch(API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "gallery_delete", id: deleteId }),
      });
      showToast("🗑️ Đã xoá!", "success");
      loadGallery();
    } catch (e) {
      showToast("❌ Lỗi khi xoá!", "error");
    }
    setDeleteId(null);
  };

  const toggleSection = (id) => {
    const section = document.getElementById("sf-" + id);
    const header = document.getElementById("sec-hdr-" + id);
    if (section && header) {
      section.classList.toggle("collapsed");
      header.classList.toggle("open");
    }
  };

  const markChanged = (key, val) => {
    setContentData((prev) => ({ ...prev, [key]: val }));
    const row = document.getElementById("fr-" + key);
    if (row) row.classList.add("field-changed");
    setHasUnsaved(true);
    const badge1 = document.getElementById("unsaved-count");
    const badge2 = document.getElementById("unsaved-count2");
    if (badge1) badge1.style.display = "inline";
    if (badge2) badge2.style.display = "inline";
  };

  const saveAllContent = async () => {
    const btn = document.querySelector(".btn-save-all");
    if (btn) btn.textContent = "⏳ Đang lưu...";

    const payload = [];
    CONTENT_SCHEMA.forEach((sec) => {
      sec.fields.forEach((f) => {
        const val =
          contentData[f.key] !== undefined ? contentData[f.key] : f.default;
        payload.push({ key: f.key, value: val.trim() });
      });
    });

    try {
      await fetch(API, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "content_save", content: payload }),
      });

      document
        .querySelectorAll(".field-changed")
        .forEach((el) => el.classList.remove("field-changed"));
      setHasUnsaved(false);
      const badge1 = document.getElementById("unsaved-count");
      const badge2 = document.getElementById("unsaved-count2");
      if (badge1) badge1.style.display = "none";
      if (badge2) badge2.style.display = "none";
      showToast(
        "✅ Đã lưu tất cả nội dung! Website sẽ cập nhật ngay.",
        "success"
      );
    } catch (e) {
      showToast("❌ Lỗi khi lưu!", "error");
    } finally {
      if (btn) btn.textContent = "💾 Lưu Tất Cả";
    }
  };

  const sTotal = galleryItems.length;
  const sApt = galleryItems.filter((i) => i.category === "Căn Hộ").length;
  const sOffice = galleryItems.filter((i) => i.category === "Văn Phòng").length;
  const sOther = galleryItems.filter(
    (i) => !["Căn Hộ", "Văn Phòng"].includes(i.category)
  ).length;

  // Lấy ảnh đại diện để hiện trong bảng Admin
  const getFirstImage = (imageStr) => {
    if (!imageStr) return "";
    const list = imageStr
      .split(/[\s,\n\t]+/)
      .filter((url) => url.trim() !== "");
    return list[0] || "";
  };

  if (!isAuthenticated) {
    return (
      <div id="login-screen">
        <div className="login-box">
          <div className="login-logo">🏠</div>
          <div className="login-title">
            Thạch<span style={{ color: "var(--accent)" }}>Pro</span> Admin
          </div>
          <div className="login-sub">Nhập mật khẩu để tiếp tục</div>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doLogin();
            }}
          />
          <button className="login-btn" onClick={doLogin} disabled={isHashing}>
            {isHashing ? "⏳ Đang băm..." : "🔐 Đăng Nhập"}
          </button>
          <div
            className="login-error"
            style={{ display: errorVisible ? "block" : "none" }}
          >
            ❌ Mật khẩu không đúng!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="main" style={{ display: "block" }}>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-icon">🏠</div>
          <div className="topbar-name">
            Thạch<span>Pro</span>{" "}
            <span
              style={{
                color: "var(--muted)",
                fontWeight: 400,
                fontSize: "0.85rem",
              }}
            >
              / Admin
            </span>
          </div>
        </div>
        <div className="topbar-right">
          <button
            onClick={onNavigateToHome}
            className="view-btn"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            🌐 Xem Website
          </button>
          <button className="logout-btn" onClick={doLogout}>
            Đăng Xuất
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => setActiveTab("gallery")}
        >
          🖼️ Công Trình
        </div>
        <div
          className={`tab ${activeTab === "content" ? "active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          ✏️ Nội Dung & Text
        </div>
        <div
          className={`tab ${activeTab === "contacts" ? "active" : ""}`}
          onClick={() => setActiveTab("contacts")}
        >
          📋 Khách Hàng
        </div>
        <div
          className={`tab ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          🔐 Bảo Mật
        </div>
      </div>

      <div className="content">
        {/* TAB GALLERY */}
        <div className={`tab-panel ${activeTab === "gallery" ? "active" : ""}`}>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-ico">🏗️</div>
              <div>
                <div className="stat-num">{sTotal}</div>
                <div className="stat-lbl">Tổng Công Trình</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-ico">🏙️</div>
              <div>
                <div className="stat-num">{sApt}</div>
                <div className="stat-lbl">Căn Hộ</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-ico">🏢</div>
              <div>
                <div className="stat-num">{sOffice}</div>
                <div className="stat-lbl">Văn Phòng</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-ico">🏠</div>
              <div>
                <div className="stat-num">{sOther}</div>
                <div className="stat-lbl">Biệt Thự & Khác</div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">Danh Sách Công Trình</div>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <button className="btn-refresh" onClick={loadGallery}>
                  🔄 Làm Mới
                </button>
                <button className="btn-add" onClick={openAddModal}>
                  ＋ Thêm Công Trình
                </button>
              </div>
            </div>
            <div className="table-wrap">
              <div className="table-loading" id="g-loading">
                ⏳ Đang tải...
              </div>
              <table id="g-table" style={{ display: "none" }}>
                <thead>
                  <tr>
                    <th>Ảnh bìa</th>
                    <th>Tiêu Đề</th>
                    <th>Danh Mục</th>
                    <th>Địa Điểm</th>
                    <th>Diện Tích</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {galleryItems.map((item) => {
                    const previewImg = getFirstImage(item.image);
                    return (
                      <tr key={item.id}>
                        <td>
                          {previewImg ? (
                            <img
                              className="td-img"
                              src={previewImg}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                              alt=""
                            />
                          ) : null}
                          <div
                            className="td-img-ph"
                            style={{ display: previewImg ? "none" : "flex" }}
                          >
                            {CAT_EMOJI[item.category] || "🏗️"}
                          </div>
                        </td>
                        <td className="td-title">{item.title}</td>
                        <td>
                          <span className="cat-badge">
                            {CAT_EMOJI[item.category] || ""} {item.category}
                          </span>
                        </td>
                        <td>{item.location || "—"}</td>
                        <td>{item.size || "—"}</td>
                        <td>
                          <div className="action-row">
                            <button
                              className="btn-edit"
                              onClick={() => openEditModal(item)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="btn-del"
                              onClick={() => askDelete(item.id, item.title)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div
                className="table-empty"
                id="g-empty"
                style={{ display: "none" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>
                  🏗️
                </div>
                <div>
                  Chưa có công trình nào. Bấm <strong>＋ Thêm</strong> để bắt
                  đầu.
                </div>
              </div>
            </div>
          </div>

          {/* Hướng dẫn upload */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">📖 Hướng Dẫn Upload Ảnh</div>
            </div>
            <div
              style={{
                padding: "1.5rem",
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  background: "var(--c2)",
                  borderRadius: "8px",
                  padding: "1.2rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>
                  📸
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.4rem",
                    fontSize: "0.88rem",
                  }}
                >
                  Imgur (Dễ nhất)
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  Vào <strong>imgur.com</strong> → upload ảnh → copy link đuôi{" "}
                  <code style={{ color: "var(--accent)" }}>.jpg</code>
                </div>
              </div>
              <div
                style={{
                  background: "var(--c2)",
                  borderRadius: "8px",
                  padding: "1.2rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>
                  ☁️
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.4rem",
                    fontSize: "0.88rem",
                  }}
                >
                  Google Drive
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  Share "Anyone" → paste link vào tab Drive → tự convert thành
                  link ảnh trực tiếp
                </div>
              </div>
              <div
                style={{
                  background: "var(--c2)",
                  borderRadius: "8px",
                  padding: "1.2rem",
                }}
              >
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>
                  🌐
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.4rem",
                    fontSize: "0.88rem",
                  }}
                >
                  Hosting
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    lineHeight: 1.7,
                  }}
                >
                  Upload ảnh vào hosting → dùng URL{" "}
                  <code style={{ color: "var(--accent)" }}>
                    thachpro.vn/img/anh.jpg
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB CONTENT (SỬA TEXT TOÀN BỘ WEBSITE) */}
        <div className={`tab-panel ${activeTab === "content" ? "active" : ""}`}>
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panel-head">
              <div className="panel-title">✏️ Chỉnh Sửa Nội Dung Website</div>
              <div
                style={{ display: "flex", gap: "0.7rem", alignItems: "center" }}
              >
                <span
                  className="unsaved-count"
                  id="unsaved-count"
                  style={{ display: "none" }}
                >
                  ● Có thay đổi chưa lưu
                </span>
                <button className="btn-refresh" onClick={loadContentData}>
                  🔄 Tải Lại
                </button>
                <button className="btn-save-all" onClick={saveAllContent}>
                  💾 Lưu Tất Cả
                </button>
              </div>
            </div>
            <div className="panel-desc">
              Chỉnh sửa bất kỳ vùng chữ nào trên Website → bấm{" "}
              <strong style={{ color: "var(--accent)" }}>Lưu Tất Cả</strong>.
              Các thẻ HTML như{" "}
              <code style={{ color: "var(--accent)" }}>&lt;br&gt;</code> hoặc{" "}
              <code style={{ color: "var(--accent)" }}>&lt;em&gt;</code> được hỗ
              trợ.
            </div>
          </div>

          <div className="content-sections">
            {CONTENT_SCHEMA.map((sec) => (
              <div className="section-block" id={`sec-${sec.id}`} key={sec.id}>
                <div
                  className={`section-header ${sec.open ? "open" : ""}`}
                  id={`sec-hdr-${sec.id}`}
                  onClick={() => toggleSection(sec.id)}
                >
                  <span className="section-header-ico">
                    {sec.label.split(" ")[0]}
                  </span>
                  <span className="section-header-title">
                    {sec.label.replace(/^[^ ]+ /, "")}
                  </span>
                  <span className="section-header-arrow">▼</span>
                </div>
                <div
                  className={`section-fields ${sec.open ? "" : "collapsed"}`}
                  id={`sf-${sec.id}`}
                >
                  {sec.fields.map((f) => (
                    <div className="field-row" id={`fr-${f.key}`} key={f.key}>
                      <div>
                        <div className="field-label">{f.label}</div>
                        <div className="field-tag">[{f.key}]</div>
                      </div>
                      <div>
                        {f.type === "textarea" ? (
                          <textarea
                            className="f-textarea"
                            value={
                              contentData[f.key] !== undefined
                                ? contentData[f.key]
                                : f.default
                            }
                            onChange={(e) => markChanged(f.key, e.target.value)}
                          ></textarea>
                        ) : (
                          <input
                            className="f-input"
                            type="text"
                            value={
                              contentData[f.key] !== undefined
                                ? contentData[f.key]
                                : f.default
                            }
                            onChange={(e) => markChanged(f.key, e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="save-row">
            <span
              className="unsaved-count"
              id="unsaved-count2"
              style={{ display: "none" }}
            >
              ● Có thay đổi chưa lưu
            </span>
            <button
              className="btn-save-all"
              onClick={saveAllContent}
              style={{ marginLeft: "auto" }}
            >
              💾 Lưu Tất Cả Thay Đổi
            </button>
          </div>
        </div>

        {/* TAB CONTACTS */}
        <div
          className={`tab-panel ${activeTab === "contacts" ? "active" : ""}`}
        >
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">📋 Danh Sách Khách Hàng Liên Hệ</div>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <button className="btn-refresh" onClick={loadContacts}>
                  🔄 Làm Mới
                </button>
                <a
                  id="sheet-link"
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-add"
                  style={{ textDecoration: "none" }}
                >
                  📊 Mở Google Sheet
                </a>
              </div>
            </div>
            <div className="table-wrap">
              <div className="table-loading" id="c-loading">
                ⏳ Đang tải...
              </div>
              <table id="c-table" style={{ display: "none" }}>
                <thead>
                  <tr>
                    <th>Thời Gian</th>
                    <th>Họ Tên</th>
                    <th>SĐT</th>
                    <th>Email</th>
                    <th>Dịch Vụ</th>
                    <th>Diện Tích</th>
                    <th>Địa Điểm</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                        {r[0] || ""}
                      </td>
                      <td style={{ color: "var(--text)", fontWeight: 600 }}>
                        {r[1] || ""}
                      </td>
                      <td>
                        <a
                          href={`tel:${r[2]}`}
                          style={{
                            color: "var(--accent)",
                            textDecoration: "none",
                          }}
                        >
                          {r[2] || ""}
                        </a>
                      </td>
                      <td>{r[3] || ""}</td>
                      <td>
                        <span className="cat-badge">{r[4] || ""}</span>
                      </td>
                      <td>{r[5] || ""}</td>
                      <td>{r[6] || ""}</td>
                      <td
                        style={{
                          maxWidth: "180px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r[7] || ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                className="table-empty"
                id="c-empty"
                style={{ display: "none" }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "0.8rem" }}>
                  📭
                </div>
                <div>Chưa có khách hàng nào liên hệ.</div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB SECURITY (TÍCH HỢP ĐỒNG BỘ PANEL GỐC) */}
        <div
          className={`tab-panel ${activeTab === "security" ? "active" : ""}`}
        >
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">
                🔐 Bảo Mật — Mã Hóa Mật Khẩu (SHA-256)
              </div>
            </div>
            <div className="panel-desc">
              Chuẩn hóa bảo mật một chiều, ngăn ngừa kẻ xấu đọc trộm file cấu
              hình JS ở phía Client.
            </div>

            <div style={{ padding: "1.5rem" }}>
              <div className="field-row">
                <div>
                  <div className="field-label">Mật khẩu mới</div>
                  <div className="field-tag">[SHA-256]</div>
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    className="f-input"
                    style={{ flex: 1, minWidth: "250px" }}
                    placeholder="Nhập mật khẩu muốn băm (VD: thachpro2024)"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                  />
                  <button className="btn-add" onClick={generateSha256}>
                    🔑 Tạo Mã Hash
                  </button>
                </div>
              </div>

              {generatedHash && (
                <div
                  style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    background: "var(--c2)",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "var(--accent)",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Copy chuỗi này dán vào file .env:
                  </div>
                  <code
                    style={{
                      display: "block",
                      background: "var(--c3)",
                      padding: "1rem",
                      borderRadius: "6px",
                      fontSize: "0.95rem",
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                      color: "var(--text)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {generatedHash}
                  </code>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted)",
                      marginTop: "0.8rem",
                    }}
                  >
                    Copy chuỗi 64 ký tự ở trên, thay thế vào biến{" "}
                    <code style={{ color: "var(--accent)" }}>
                      VITE_ADMIN_PASS
                    </code>{" "}
                    trong file{" "}
                    <code style={{ color: "var(--accent)" }}>.env</code> rồi
                    khởi động lại dự án.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY MODAL (Khôi phục 100% Modal gốc của file admin.html) */}
      <div
        className={`modal-bg ${gModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target.classList.contains("modal-bg")) setGModalOpen(false);
        }}
      >
        <div className="modal">
          <button className="modal-close" onClick={() => setGModalOpen(false)}>
            ✕
          </button>
          <div className="modal-title">
            {gModalMode === "add" ? "Thêm Công Trình Mới" : "✏️ Sửa Công Trình"}
          </div>
          <div className="mf-row">
            <div className="mf-field">
              <label className="mf-label">Tiêu Đề *</label>
              <input
                className="mf-input"
                type="text"
                placeholder="VD: Penthouse Vinhomes"
                value={gModalItem.title}
                onChange={(e) =>
                  setGModalItem({ ...gModalItem, title: e.target.value })
                }
              />
            </div>
            <div className="mf-field">
              <label className="mf-label">Danh Mục *</label>
              <select
                className="mf-select"
                value={gModalItem.category}
                onChange={(e) =>
                  setGModalItem({ ...gModalItem, category: e.target.value })
                }
              >
                <option value="">-- Chọn --</option>
                <option>Căn Hộ</option>
                <option>Văn Phòng</option>
                <option>Biệt Thự</option>
                <option>Khách Sạn</option>
                <option>Thương Mại</option>
                <option>Nhà Phố</option>
                <option>Khác</option>
              </select>
            </div>
          </div>
          <div className="mf-row">
            <div className="mf-field">
              <label className="mf-label">Địa Điểm</label>
              <input
                className="mf-input"
                type="text"
                placeholder="VD: Quận 7, TP.HCM"
                value={gModalItem.location}
                onChange={(e) =>
                  setGModalItem({ ...gModalItem, location: e.target.value })
                }
              />
            </div>
            <div className="mf-field">
              <label className="mf-label">Diện Tích</label>
              <input
                className="mf-input"
                type="text"
                placeholder="VD: 150 m²"
                value={gModalItem.size}
                onChange={(e) =>
                  setGModalItem({ ...gModalItem, size: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mf-field">
            <label className="mf-label">
              Ảnh Công Trình (Hỗ trợ Album nhiều ảnh)
            </label>
            <div className="img-tabs">
              <button
                className={`img-tab ${gModalImgTab === "url" ? "active" : ""}`}
                onClick={() => setGModalImgTab("url")}
              >
                🔗 URL Ảnh
              </button>
              <button
                className={`img-tab ${
                  gModalImgTab === "drive" ? "active" : ""
                }`}
                onClick={() => setGModalImgTab("drive")}
              >
                ☁️ Google Drive
              </button>
            </div>
            {gModalImgTab === "url" ? (
              <div id="itab-url">
                <textarea
                  className="mf-textarea"
                  placeholder={
                    "Mỗi đường dẫn ảnh một dòng\nhttps://i.imgur.com/anh1.jpg\nhttps://i.imgur.com/anh2.jpg"
                  }
                  value={gModalItem.image}
                  onChange={(e) =>
                    setGModalItem({ ...gModalItem, image: e.target.value })
                  }
                />
                <div className="img-hint">
                  Mỗi ảnh một dòng. Ảnh dòng đầu tiên sẽ tự động chọn làm ảnh
                  bìa ngoài danh sách.
                </div>
              </div>
            ) : (
              <div id="itab-drive">
                <textarea
                  className="mf-textarea"
                  placeholder={
                    "Dán các link chia sẻ Google Drive tại đây (Mỗi link một dòng)\nhttps://drive.google.com/file/d/abc...\nhttps://drive.google.com/file/d/xyz..."
                  }
                  value={driveInput}
                  onChange={(e) => convDrive(e.target.value)}
                />
                <div className="img-hint">
                  Dán danh sách các link Google Drive (Mỗi link một dòng). Hệ
                  thống tự bóc tách ID tự động.
                </div>
              </div>
            )}

            {getFirstImage(gModalItem.image) && (
              <div style={{ marginTop: "0.8rem" }}>
                <span className="mf-label" style={{ fontSize: "0.68rem" }}>
                  Ảnh bìa xem trước:
                </span>
                <img
                  className="img-preview show"
                  src={getFirstImage(gModalItem.image)}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  alt="Preview"
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn-cancel" onClick={() => setGModalOpen(false)}>
              Huỷ
            </button>
            <button
              className="btn-modal-save"
              id="g-save-btn"
              onClick={saveGallery}
            >
              💾 Lưu Công Trình
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE */}
      <div
        className={`modal-bg ${confirmOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target.classList.contains("modal-bg")) setConfirmOpen(false);
        }}
      >
        <div
          className="modal"
          style={{ maxWidth: "360px", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑️</div>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: "0.6rem",
            }}
          >
            Xoá Công Trình?
          </div>
          <div
            style={{
              color: "var(--muted)",
              fontSize: "0.88rem",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
            }}
          >
            Xoá công trình "{deleteTitle}"? Không thể hoàn tác.
          </div>
          <div
            style={{ display: "flex", gap: "0.8rem", justifyContent: "center" }}
          >
            <button
              className="btn-cancel"
              onClick={() => setConfirmOpen(false)}
            >
              Huỷ
            </button>
            <button
              style={{
                background: "var(--red)",
                color: "white",
                border: "none",
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontWeight: 700,
              }}
              onClick={doDelete}
            >
              🗑️ Xoá
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div
        id="toast"
        className={`${toast.visible ? "show" : ""} ${toast.type}`}
      >
        {toast.msg}
      </div>
    </div>
  );
}
