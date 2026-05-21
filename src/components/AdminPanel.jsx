import React, { useState, useEffect, useRef } from "react";
import "../AdminPanel.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbzMuam393Ao4cePF-TJdnUfFKUnFZ7F8e-uz5EK1BZ65oUtlHRgrra1rtbN32ukX6yv/exec";
const PASS = "thachpro2024";
const IMGBB_API_KEY = "9800c5e40af1c54a6c06924777510a9f";

const CONTENT_SCHEMA = [
  {
    id: "hero",
    label: "🎯 Hero — Phần Đầu Trang",
    open: true,
    fields: [
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
          "Đơn vị thi công thạch cao hàng đầu tại TP.HCM — trần giật cấp, vách ngăn, phào chỉ trang trí.",
      },
      {
        key: "hero_btn1",
        label: "Nút 1 (vàng)",
        type: "text",
        default: "→ Nhận Báo Giá Miễn Phí",
      },
      {
        key: "hero_btn2",
        label: "Nút 2 (ghost)",
        type: "text",
        default: "Xem Công Trình →",
      },
      {
        key: "stat1_lbl",
        label: "Stat 1 — nhãn",
        type: "text",
        default: "Công trình hoàn thành",
      },
      {
        key: "stat2_lbl",
        label: "Stat 2 — nhãn",
        type: "text",
        default: "Năm kinh nghiệm",
      },
      {
        key: "stat3_lbl",
        label: "Stat 3 — nhãn",
        type: "text",
        default: "Khách hàng hài lòng",
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
        label: "Số điện thoại",
        type: "text",
        default: "0901 234 567",
      },
      {
        key: "contact_hours",
        label: "Giờ làm việc",
        type: "text",
        default: "Hotline 7:00–18:00",
      },
      {
        key: "contact_zalo",
        label: "Zalo",
        type: "text",
        default: "0901 234 567",
      },
      {
        key: "contact_email",
        label: "Email",
        type: "text",
        default: "thachpro@gmail.com",
      },
      {
        key: "contact_address",
        label: "Địa chỉ",
        type: "text",
        default: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
      },
    ],
  },
  {
    id: "footer",
    label: "🦶 Footer",
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
        label: "Mô tả ngắn",
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
        label: "Tiêu đề CTA",
        type: "textarea",
        default: "Bắt Đầu Dự Án<br/>Của Bạn Hôm Nay",
      },
      {
        key: "cta_desc",
        label: "Mô tả CTA",
        type: "textarea",
        default:
          "Liên hệ ngay để được tư vấn miễn phí và nhận báo giá trong 24 giờ.",
      },
      {
        key: "cta_btn",
        label: "Nút CTA",
        type: "text",
        default: "📞 Gọi Ngay: 0901 234 567",
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
        label: "Số năm kinh nghiệm",
        type: "text",
        default: "15",
      },
      {
        key: "about_title",
        label: "Tiêu đề section",
        type: "text",
        default: "Hơn 15 Năm Xây Dựng Niềm Tin",
      },
      {
        key: "about_desc",
        label: "Mô tả",
        type: "textarea",
        default:
          "ThạchPro được thành lập năm 2008, đã hoàn thiện hơn 500 công trình từ căn hộ cao cấp, biệt thự, văn phòng đến trung tâm thương mại trên toàn TP.HCM.",
      },
    ],
  },
];

// Hàm nén ảnh tại Client sử dụng Canvas
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve({
          base64: compressedBase64,
          filename: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
          mimeType: "image/jpeg",
        });
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Hàm tải ảnh trực tiếp lên máy chủ ImgBB bằng API Key của bạn
const uploadToImgBB = async (base64Data) => {
  const base64Image = base64Data.split(",")[1];
  const formData = new FormData();
  formData.append("image", base64Image);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  if (data.success) {
    return data.data.url;
  } else {
    throw new Error("Upload ImgBB thất bại");
  }
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");

  // Quản lý Gallery (Công trình)
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    id: "",
    title: "",
    category: "",
    location: "",
    size: "",
    image: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSavingGallery, setIsSavingGallery] = useState(false);

  // Quản lý Đánh giá (Reviews)
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    id: "",
    name: "",
    role: "",
    project: "",
    stars: 5,
    text: "",
  });
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Quản lý Content Text động
  const [contentData, setContentData] = useState({});
  const [hasUnsavedContent, setHasUnsavedContent] = useState(false);
  const [openSections, setOpenSections] = useState({ hero: true });

  // Khách hàng liên hệ
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("#");

  useEffect(() => {
    if (sessionStorage.getItem("tp_auth") === "1") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = () => {
    loadGallery();
    loadContentData();
    loadReviews();
    loadContacts();
  };

  const doLogin = () => {
    if (passwordInput === PASS) {
      sessionStorage.setItem("tp_auth", "1");
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
  };

  const doLogout = () => {
    sessionStorage.removeItem("tp_auth");
    setIsAuthenticated(false);
  };

  // CRUD Gallery
  const loadGallery = async () => {
    setLoadingGallery(true);
    try {
      const res = await fetch(API_URL + "?t=" + Date.now());
      const data = await res.json();
      setGalleryItems(data.items || []);
    } catch (e) {
      alert("Lỗi tải danh mục công trình.");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const saveGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.title || !galleryForm.category) {
      alert("Nhập đầy đủ tiêu đề và danh mục!");
      return;
    }
    setIsSavingGallery(true);
    try {
      const imageUrls = [];
      // Tiến hành nén ảnh và upload thẳng lên ImgBB bằng API Key của bạn
      for (const file of selectedFiles) {
        const comp = await compressImage(file);
        const directUrl = await uploadToImgBB(comp.base64);
        imageUrls.push(directUrl);
      }

      // Tạo chuỗi đường dẫn ảnh phân tách bằng dấu gạch đứng '|'
      const finalImageString =
        imageUrls.length > 0 ? imageUrls.join("|") : galleryForm.image;

      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gallery_save",
          id: galleryForm.id || "CT" + Date.now(),
          title: galleryForm.title,
          category: galleryForm.category,
          location: galleryForm.location,
          size: galleryForm.size,
          image: finalImageString,
        }),
      });

      setShowGalleryModal(false);
      setSelectedFiles([]);
      loadGallery();
      alert("Lưu công trình và tải ảnh lên máy chủ trực tiếp thành công!");
    } catch (err) {
      alert("Đã xảy ra lỗi trong quá trình tải ảnh trực tiếp lên máy chủ.");
    } finally {
      setIsSavingGallery(false);
    }
  };

  const deleteGallery = async (id) => {
    if (window.confirm("Chắc chắn xóa công trình này?")) {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ type: "gallery_delete", id }),
      });
      loadGallery();
    }
  };

  // CRUD Content Text
  const loadContentData = async () => {
    try {
      const res = await fetch(API_URL + "?type=content&t=" + Date.now());
      const data = await res.json();
      if (data.content) {
        const obj = {};
        data.content.forEach(({ key, value }) => (obj[key] = value));
        setContentData(obj);
      }
    } catch {}
  };

  const handleContentChange = (key, val) => {
    setContentData((prev) => ({ ...prev, [key]: val }));
    setHasUnsavedContent(true);
  };

  const saveAllContent = async () => {
    const payload = [];
    CONTENT_SCHEMA.forEach((sec) => {
      sec.fields.forEach((f) => {
        const val =
          contentData[f.key] !== undefined ? contentData[f.key] : f.default;
        payload.push({ key: f.key, value: val.trim() });
      });
    });

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "content_save", content: payload }),
      });
      setHasUnsavedContent(false);
      alert("Đã lưu nội dung!");
    } catch {
      alert("Lưu nội dung thất bại.");
    }
  };

  // CRUD Reviews
  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(API_URL + "?type=reviews&t=" + Date.now());
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      console.warn("Lỗi tải đánh giá.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const saveReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) return;
    setIsSavingReview(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          type: "review_save",
          id: reviewForm.id || "RV" + Date.now(),
          ...reviewForm,
        }),
      });
      setShowReviewModal(false);
      loadReviews();
    } catch {
      alert("Lưu đánh giá lỗi.");
    } finally {
      setIsSavingReview(false);
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm("Xóa đánh giá này?")) {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ type: "review_delete", id }),
      });
      loadReviews();
    }
  };

  // Contacts
  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const res = await fetch(API_URL + "?type=contacts&t=" + Date.now());
      const data = await res.json();
      setContacts(data.contacts || []);
      if (data.sheetUrl) setSheetUrl(data.sheetUrl);
    } catch {}
    setLoadingContacts(false);
  };

  if (!isAuthenticated) {
    return (
      <div id="login-screen">
        <div className="login-box">
          <div className="login-logo">🏠</div>
          <div className="login-title">
            Thạch<span>Pro</span> Admin
          </div>
          <div className="login-sub">Nhập mật khẩu để tiếp tục</div>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doLogin()}
          />
          <button className="login-btn" onClick={doLogin}>
            🔐 Đăng Nhập
          </button>
          {loginError && (
            <div className="login-error">❌ Mật khẩu không chính xác!</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="main" style={{ display: "block" }}>
      <div className="topbar">
        <div className="topbar-logo">
          <div className="topbar-icon">🏠</div>
          <div className="topbar-name">
            Thạch<span>Pro</span>{" "}
            <span
              style={{
                color: "var(--muted)",
                fontWeight: 400,
                fontSize: ".85rem",
              }}
            >
              / Admin
            </span>
          </div>
        </div>
        <div className="topbar-right">
          <button className="logout-btn" onClick={doLogout}>
            Đăng Xuất
          </button>
        </div>
      </div>

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
          className={`tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          ⭐ Đánh Giá Khách
        </div>
        <div
          className={`tab ${activeTab === "contacts" ? "active" : ""}`}
          onClick={() => setActiveTab("contacts")}
        >
          📋 Khách Hàng
        </div>
      </div>

      <div className="content">
        {/* TAB GALLERY */}
        {activeTab === "gallery" && (
          <div className="tab-panel active">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Danh Sách Công Trình</div>
                <div style={{ display: "flex", gap: ".7rem" }}>
                  <button className="btn-refresh" onClick={loadGallery}>
                    🔄 Làm Mới
                  </button>
                  <button
                    className="btn-add"
                    onClick={() => {
                      setGalleryForm({
                        id: "",
                        title: "",
                        category: "",
                        location: "",
                        size: "",
                        image: "",
                      });
                      setSelectedFiles([]);
                      setShowGalleryModal(true);
                    }}
                  >
                    ＋ Thêm Công Trình
                  </button>
                </div>
              </div>
              <div className="table-wrap">
                {loadingGallery ? (
                  <div className="table-loading">⏳ Đang tải...</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Tiêu Đề</th>
                        <th>Danh Mục</th>
                        <th>Địa Điểm</th>
                        <th>Diện Tích</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {galleryItems.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.image && (
                              <img
                                className="td-img"
                                src={item.image.split("|")[0]}
                                alt=""
                                onError={(e) =>
                                  (e.target.style.display = "none")
                                }
                              />
                            )}
                          </td>
                          <td className="td-title">{item.title}</td>
                          <td>
                            <span className="cat-badge">{item.category}</span>
                          </td>
                          <td>{item.location || "—"}</td>
                          <td>{item.size || "—"}</td>
                          <td>
                            <div className="action-row">
                              <button
                                className="btn-edit"
                                onClick={() => {
                                  setGalleryForm(item);
                                  setSelectedFiles([]);
                                  setShowGalleryModal(true);
                                }}
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                className="btn-del"
                                onClick={() => deleteGallery(item.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT EDIT */}
        {activeTab === "content" && (
          <div className="tab-panel active">
            <div className="panel" style={{ marginBottom: "1rem" }}>
              <div className="panel-head">
                <div className="panel-title">✏️ Chỉnh Sửa Nội Dung Website</div>
                <div
                  style={{
                    display: "flex",
                    gap: ".7rem",
                    alignItems: "center",
                  }}
                >
                  {hasUnsavedContent && (
                    <span className="unsaved-count">
                      ● Có thay đổi chưa lưu
                    </span>
                  )}
                  <button className="btn-refresh" onClick={loadContentData}>
                    🔄 Tải Lại
                  </button>
                  <button className="btn-save-all" onClick={saveAllContent}>
                    💾 Lưu Tất Cả
                  </button>
                </div>
              </div>
            </div>

            <div className="content-sections">
              {CONTENT_SCHEMA.map((sec) => {
                const isOpen = openSections[sec.id] || false;
                return (
                  <div key={sec.id} className="section-block">
                    <div
                      className={`section-header ${isOpen ? "open" : ""}`}
                      onClick={() =>
                        setOpenSections({ ...openSections, [sec.id]: !isOpen })
                      }
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
                      className={`section-fields ${isOpen ? "" : "collapsed"}`}
                    >
                      {sec.fields.map((f) => {
                        const currentVal =
                          contentData[f.key] !== undefined
                            ? contentData[f.key]
                            : f.default;
                        const isChanged =
                          contentData[f.key] !== undefined &&
                          contentData[f.key] !== f.default;
                        return (
                          <div
                            key={f.key}
                            className={`field-row ${
                              isChanged ? "field-changed" : ""
                            }`}
                          >
                            <div>
                              <div className="field-label">{f.label}</div>
                              <div className="field-tag">[{f.key}]</div>
                            </div>
                            <div>
                              {f.type === "textarea" ? (
                                <textarea
                                  className="f-textarea"
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleContentChange(f.key, e.target.value)
                                  }
                                />
                              ) : (
                                <input
                                  className="f-input"
                                  type="text"
                                  value={currentVal}
                                  onChange={(e) =>
                                    handleContentChange(f.key, e.target.value)
                                  }
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="save-row">
              {hasUnsavedContent && (
                <span className="unsaved-count">● Có thay đổi chưa lưu</span>
              )}
              <button
                className="btn-save-all"
                onClick={saveAllContent}
                style={{ marginLeft: "auto" }}
              >
                💾 Lưu Tất Cả Thay Đổi
              </button>
            </div>
          </div>
        )}

        {/* TAB REVIEWS (ĐÁNH GIÁ ĐỘNG) */}
        {activeTab === "reviews" && (
          <div className="tab-panel active">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">
                  ⭐ Quản Lý Đánh Giá Khách Hàng
                </div>
                <div style={{ display: "flex", gap: ".7rem" }}>
                  <button className="btn-refresh" onClick={loadReviews}>
                    🔄 Làm Mới
                  </button>
                  <button
                    className="btn-add"
                    onClick={() => {
                      setReviewForm({
                        id: "",
                        name: "",
                        role: "",
                        project: "",
                        stars: 5,
                        text: "",
                      });
                      setShowReviewModal(true);
                    }}
                  >
                    ＋ Thêm Đánh Giá
                  </button>
                </div>
              </div>
              <div className="table-wrap">
                {loadingReviews ? (
                  <div className="table-loading">⏳ Đang tải...</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Khách Hàng</th>
                        <th>Chức Vụ</th>
                        <th>Dự Án</th>
                        <th>Số Sao</th>
                        <th>Nội Dung</th>
                        <th>Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((item) => (
                        <tr key={item.id}>
                          <td className="td-title">{item.name}</td>
                          <td>{item.role}</td>
                          <td>{item.project}</td>
                          <td>{item.stars} ⭐</td>
                          <td
                            style={{
                              maxWidth: "300px",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.text}
                          </td>
                          <td>
                            <div className="action-row">
                              <button
                                className="btn-edit"
                                onClick={() => {
                                  setReviewForm(item);
                                  setShowReviewModal(true);
                                }}
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                className="btn-del"
                                onClick={() => deleteReview(item.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTACTS */}
        {activeTab === "contacts" && (
          <div className="tab-panel active">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">📋 Khách Hàng Gửi Liên Hệ</div>
                <div style={{ display: "flex", gap: ".7rem" }}>
                  <button className="btn-refresh" onClick={loadContacts}>
                    🔄 Làm Mới
                  </button>
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-add"
                    style={{ textDecoration: "none" }}
                  >
                    📊 Mở Google Sheet
                  </a>
                </div>
              </div>
              <div className="table-wrap">
                {loadingContacts ? (
                  <div className="table-loading">⏳ Đang tải...</div>
                ) : (
                  <table>
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
                      {contacts.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[0]}</td>
                          <td className="td-title">{row[1]}</td>
                          <td>{row[2]}</td>
                          <td>{row[3]}</td>
                          <td>
                            <span className="cat-badge">{row[4]}</span>
                          </td>
                          <td>{row[5]}</td>
                          <td>{row[6]}</td>
                          <td>{row[7]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GALLERY MODAL (UPLOAD TRỰC TIẾP LÊN IMGBB) */}
      {showGalleryModal && (
        <div className="modal-bg open">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setShowGalleryModal(false)}
            >
              ✕
            </button>
            <div className="modal-title">
              {galleryForm.id ? "✏️ Sửa Công Trình" : "Thêm Công Trình Mới"}
            </div>
            <form onSubmit={saveGallery}>
              <div className="mf-row">
                <div className="mf-field">
                  <label className="mf-label">Tiêu Đề *</label>
                  <input
                    className="mf-input"
                    type="text"
                    value={galleryForm.title}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mf-field">
                  <label className="mf-label">Danh Mục *</label>
                  <select
                    className="mf-select"
                    value={galleryForm.category}
                    onChange={(e) =>
                      setGalleryForm({
                        ...galleryForm,
                        category: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Căn Hộ">Căn Hộ</option>
                    <option value="Văn Phòng">Văn Phòng</option>
                    <option value="Biệt Thự">Biệt Thự</option>
                    <option value="Khách Sạn">Khách Sạn</option>
                    <option value="Thương Mại">Thương Mại</option>
                  </select>
                </div>
              </div>
              <div className="mf-row">
                <div className="mf-field">
                  <label className="mf-label">Địa Điểm</label>
                  <input
                    className="mf-input"
                    type="text"
                    value={galleryForm.location}
                    onChange={(e) =>
                      setGalleryForm({
                        ...galleryForm,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mf-field">
                  <label className="mf-label">Diện Tích</label>
                  <input
                    className="mf-input"
                    type="text"
                    value={galleryForm.size}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, size: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mf-field">
                <label className="mf-label">
                  Tải Ảnh Lên Trực Tiếp (Chọn nhiều ảnh)
                </label>
                <input
                  className="mf-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="img-hint">
                  Hệ thống nén tự động mượt mà và lưu trữ công khai an toàn trên
                  máy chủ CDN chuyên dụng.
                </div>
                {selectedFiles.length > 0 && (
                  <p style={{ color: "var(--accent)", marginTop: "0.5rem" }}>
                    📂 Đã chọn {selectedFiles.length} ảnh mới.
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn-modal-save"
                  type="submit"
                  disabled={isSavingGallery}
                >
                  {isSavingGallery
                    ? "⏳ ĐANG TẢI & NÉN..."
                    : "💾 LƯU CÔNG TRÌNH"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEWS MODAL */}
      {showReviewModal && (
        <div className="modal-bg open">
          <div className="modal">
            <button
              className="modal-close"
              onClick={() => setShowReviewModal(false)}
            >
              ✕
            </button>
            <div className="modal-title">⭐ Cập Nhật Đánh Giá</div>
            <form onSubmit={saveReview}>
              <div className="mf-row">
                <div className="mf-field">
                  <label className="mf-label">Khách Hàng *</label>
                  <input
                    className="mf-input"
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mf-field">
                  <label className="mf-label">Chức Vụ / Vị Trí</label>
                  <input
                    className="mf-input"
                    type="text"
                    value={reviewForm.role}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, role: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mf-row">
                <div className="mf-field">
                  <label className="mf-label">Tên Dự Án</label>
                  <input
                    className="mf-input"
                    type="text"
                    value={reviewForm.project}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, project: e.target.value })
                    }
                  />
                </div>
                <div className="mf-field">
                  <label className="mf-label">Số Sao Đánh Giá</label>
                  <select
                    className="mf-select"
                    value={reviewForm.stars}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        stars: Number(e.target.value),
                      })
                    }
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Sao</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Sao</option>
                    <option value={3}>⭐⭐⭐ 3 Sao</option>
                  </select>
                </div>
              </div>
              <div className="mf-field">
                <label className="mf-label">Nội Dung Đánh Giá *</label>
                <textarea
                  className="mf-textarea"
                  value={reviewForm.text}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, text: e.target.value })
                  }
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn-modal-save"
                  type="submit"
                  disabled={isSavingReview}
                >
                  💾 LƯU ĐÁNH GIÁ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
